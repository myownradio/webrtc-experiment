import EventEmitter from "events"

function createPeer(videoElement, signalingChannel, ownCallId) {
    const peer = new RTCPeerConnection()
    const constraints = { video: true }

    peer.ontrack = (event) => {
        console.log('track received')
        videoElement.srcObject = event.streams[0]
    }

    signalingChannel.on('message', ({ toId, fromId, desc, candidate }) => {
        console.log('signal', desc.type, fromId, toId)
        if (desc) {
            if (desc.type === 'offer' && toId === ownCallId) {
                peer.setRemoteDescription(desc).then(() => {
                    return navigator.mediaDevices.getUserMedia(constraints)
                }).then(stream => {
                    stream.getTracks().forEach(track => peer.addTrack(track, stream))
                    return peer.createAnswer()
                }).then(answer => {
                    return peer.setLocalDescription(answer)
                }).then(() => {
                    signalingChannel.emit('message', {
                        toId: fromId,
                        fromId: toId,
                        desc: peer.localDescription
                    })
                    console.log('answer sent')
                })
            } else if (desc.type === 'answer' && toId === ownCallId) {
                console.log('answer received')
                peer.setRemoteDescription(desc)
            }
        } else if (candidate) {
            peer.addIceCandidate(candidate)
        }
    })

    return function callTo(theirCallId) {
        peer.onnegotiationneeded = () => {
            console.log('negotiation')
            peer.createOffer().then(offer => {
                console.log('offer created', offer)
                return peer.setLocalDescription(offer)
            }).then(() => {
                console.log('signaling offer')

                return signalingChannel.emit("message", {
                    toId: theirCallId,
                    fromId: ownCallId,
                    desc: peer.localDescription
                })
            })
        }

        navigator.mediaDevices.getUserMedia(constraints)
            .then(stream => {
                console.log('sending tracks')
                stream.getTracks().forEach(track => peer.addTrack(track, stream))
                videoElement.srcObject = stream
            })
    }
}

(function main() {
    const video1 = document.getElementById("video1")
    const video2 = document.getElementById("video2")

    const signalingChannel = new EventEmitter()

    const foo = createPeer(video1, signalingChannel, 'foo')
    const bar = createPeer(video2, signalingChannel, 'bar')

    foo('bar')
})()

