import EventEmitter from "events"
import ReconnectingWebSocket from "reconnecting-websocket"
import { getCallerId } from "./callerId"

function createPeer(localStream, videosElem, signalingChannel, localCallId) {
  let callingTo = null

  const peer = new RTCPeerConnection({
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  })

  signalingChannel.subscribe(({ toId, fromId, desc, candidate }) => {
    if (desc) {
      if (desc.type === "offer" && toId === localCallId) {
        console.log("offer:setRemoteDescription")
        peer
          .setRemoteDescription(desc)
          .then(() => {
            console.log("offer:addTrack")
            localStream
              .getTracks()
              .forEach((track) => peer.addTrack(track, localStream))
            console.log("offer:createAnswer")
            return peer.createAnswer()
          })
          .then((answer) => {
            console.log("offer:setLocalDescription")
            return peer.setLocalDescription(answer)
          })
          .then(() => {
            console.log("offer:sendAnswer")
            signalingChannel.emit({
              toId: fromId,
              fromId: toId,
              desc: peer.localDescription,
            })
          })
      } else if (desc.type === "answer" && toId === localCallId) {
        console.log("answer:setRemoteDescription")
        peer.setRemoteDescription(desc)
      }
    } else if (candidate) {
      console.log("candidate:addIceCandidate")
      peer.addIceCandidate(candidate)
    }
  })

  // peer.onnegotiationneeded = () => {
  //     console.log('negitiation')
  //     peer.createOffer().then(offer => {
  //         return peer.setLocalDescription(offer)
  //     }).then(() => {
  //         return signalingChannel.emit({
  //             toId: callingTo,
  //             fromId: localCallId,
  //             desc: peer.localDescription
  //         })
  //     })
  // }

  peer.onicecandidate = ({ candidate }) => signalingChannel.emit({ candidate })

  peer.ontrack = (event) => {
    const video = document.createElement("video")
    video.setAttribute("autoplay", "1")
    video.srcObject = event.streams[0]
    video.classList.add("video")
    videosElem.appendChild(video)
  }

  localStream.onaddtrack = (track) => {
    console.log("track:add")
  }

  localStream.onremovetrack = () => {
    console.log("track:remove")
  }

  return function callTo(remoteCallId) {
    callingTo = remoteCallId

    console.log("call:getUserMedia")
    Promise.resolve()
      .then(() => {
        console.log("call:addTrack")
        localStream
          .getTracks()
          .forEach((track) => peer.addTrack(track, localStream))
      })
      .then(() => {
        console.log("call:createOffer")
        return peer.createOffer()
      })
      .then((offer) => {
        console.log("call:setLocalDescription")
        return peer.setLocalDescription(offer)
      })
      .then(() => {
        console.log("call:sendOffer")
        return signalingChannel.emit({
          toId: remoteCallId,
          fromId: localCallId,
          desc: peer.localDescription,
        })
      })
  }
}

;(function main() {
  const callerId = getCallerId()

  const signalingChannel = wsSignalingChannel()

  const callerIdElem = document.getElementById("caller-id")
  const ownVideoElem = document.getElementById("own-video")
  const devicesElem = document.getElementById("devices")
  const formElem = document.getElementById("form")
  const videosElem = document.getElementById("videos")

  document.title = `${document.title} - ${callerId}`
  callerIdElem.innerText = callerId

  const streamPromise = new Promise((resolve) =>
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        stream.addEventListener("removetrack", () => {
          console.log("here")
        })

        return navigator.mediaDevices
          .enumerateDevices()
          .then((devices) => {
            devicesElem.innerHTML = ""
            devices
              .filter(({ kind }) => kind === "videoinput")
              .forEach((device) => {
                const button = document.createElement("button")
                button.innerText = device.label
                button.addEventListener("click", (event) => {
                  navigator.mediaDevices
                    .getUserMedia({
                      video: {
                        deviceId: device.deviceId,
                        groupId: device.groupId,
                      },
                    })
                    .then((newStream) => {
                      stream
                        .getVideoTracks()
                        .forEach((videoTrack) => stream.removeTrack(videoTrack))
                      newStream.getVideoTracks().forEach((videoTrack) => {
                        stream.addTrack(videoTrack)
                      })
                    })
                })
                devicesElem.appendChild(button)
              })
          })
          .then(() => stream)
      })
      .then((stream) => {
        ownVideoElem.srcObject = stream
        resolve(stream)
      })
  )

  streamPromise.then((stream) => {
    // const call = createPeer(stream, videosElem, signalingChannel, callerId)
    //
    // formElem.addEventListener("submit", event => {
    //     event.preventDefault()
    //     const name = formElem.elements[0].value
    //     call(name)
    // })
  })
})
