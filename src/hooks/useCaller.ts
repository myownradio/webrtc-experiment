import {Signal} from "./useSignal";

export interface Caller {
  call(remoteId: string): void
}

export enum ConnectionStatus {
  INITIAL, CALL, FINISH, ERROR
}

export default function useCaller(signal: Signal, localStream: MediaStream, localId: string): Caller {
  let status = ConnectionStatus.INITIAL
  let remoteId: string = null


  signal.subscribe(({ toId, fromId, desc, candidate }) => {
    if (desc) {
      if (desc.type === "offer" && toId === localId) {
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
            signal.send({
              toId: fromId,
              fromId: toId,
              desc: peer.localDescription,
            })
          })
      } else if (desc.type === "answer" && toId === localId) {
        console.log("answer:setRemoteDescription")
        peer.setRemoteDescription(desc)
      }
    } else if (candidate) {
      console.log("candidate:addIceCandidate")
      peer.addIceCandidate(candidate)
    }
  })


  return {
    call(callToId: string): void {
      remoteId = callToId
    }
  }
}
