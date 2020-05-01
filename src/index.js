import EventEmitter from "events"
import ReconnectingWebSocket from "reconnecting-websocket";

function createPeer(localVideoElement, remoteVideoElement, signalingChannel, localCallId) {
    const peer = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' },],
    })
    const constraints = { video: true }

    signalingChannel.subscribe(({ toId, fromId, desc, candidate }) => {
        if (desc) {
            if (desc.type === 'offer' && toId === localCallId) {
                console.log('offer:setRemoteDescription')
                peer.setRemoteDescription(desc).then(() => {
                    console.log('offer:getUserMedia')
                    return navigator.mediaDevices.getUserMedia(constraints)
                }).then(stream => {
                    console.log('offer:addTrack')
                    stream.getTracks().forEach(track => peer.addTrack(track, stream))
                    console.log('offer:createAnswer')
                    return peer.createAnswer()
                }).then(answer => {
                    console.log('offer:setLocalDescription')
                    return peer.setLocalDescription(answer)
                }).then(() => {
                    console.log('offer:sendAnswer')
                    signalingChannel.emit({
                        toId: fromId,
                        fromId: toId,
                        desc: peer.localDescription
                    })
                })
            } else if (desc.type === 'answer' && toId === localCallId) {
                console.log('answer:setRemoteDescription')
                peer.setRemoteDescription(desc)
            }
        } else if (candidate) {
            console.log('candidate:addIceCandidate')
            peer.addIceCandidate(candidate)
        }
    })

    peer.onicecandidate = ({ candidate }) => signalingChannel.emit({ candidate });

    peer.ontrack = (event) => {
        if (remoteVideoElement.srcObject) return
        remoteVideoElement.srcObject = event.streams[0]
    }

    return function callTo(remoteCallId) {
        console.log('call:getUserMedia')
        navigator.mediaDevices.getUserMedia(constraints)
            .then(stream => {
                console.log('call:addTrack')
                stream.getTracks().forEach(track => peer.addTrack(track, stream))
                localVideoElement.srcObject = stream
            }).then(() => {
            console.log('call:createOffer')
            return peer.createOffer()
        }).then(offer => {
            console.log('call:setLocalDescription')
            return peer.setLocalDescription(offer)
        }).then(() => {
            console.log('call:sendOffer')
            return signalingChannel.emit({
                toId: remoteCallId,
                fromId: localCallId,
                desc: peer.localDescription
            })
        });
    }
}

function wsSignalingChannel() {
    const socket = new ReconnectingWebSocket("wss://wss.homefs.biz")
    const emitter = new EventEmitter()

    socket.addEventListener("message", message => {
        try {
            const msg = JSON.parse(message.data)
            emitter.emit('message', msg)
        } catch (e) {
            /* NOP */
        }
    })

    return {
        subscribe: (cb) => {
            emitter.on('message', msg => cb(msg))
        },
        emit: (msg) => {
            socket.send(JSON.stringify(msg))
        }
    }
}

(function main() {
    const ownId = window.location.search

    const video1 = document.getElementById("video1")
    const video2 = document.getElementById("video2")
    const form = document.getElementById("form")

    const signalingChannel = wsSignalingChannel()

    const call = createPeer(video1, video2, signalingChannel, ownId)

    form.addEventListener("submit", event => {
        event.preventDefault()
        const name = form.elements[0].value
        call(name)
    })

    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            video1.srcObject = stream
        })
})()

