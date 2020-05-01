import { Signal } from "./useSignal"
import { useEffect, useState } from "react"

interface MaybeSessionDescription {
  toId?: string
  fromId?: string
  desc?: RTCSessionDescription
}

export default function useOffer(
  peer: RTCPeerConnection,
  signal: Signal,
  localId: string,
  localStream?: MediaStream
): null | Error {
  const [error, setError] = useState<null | Error>(null)
  useEffect(() => {
    if (error || !localStream) return

    const unsubscribe = signal.subscribe<MaybeSessionDescription>(
      ({ toId, fromId, desc }) => {
        if (toId && fromId && toId === localId && desc?.type === "offer") {
          console.log("offer:setRemoteDescription")
          peer
            .setRemoteDescription(desc)
            .then(() => {
              localStream.getTracks().forEach(track => peer.addTrack(track, localStream))
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
            .catch(setError)
        }
      }
    )
    return () => {
      unsubscribe()
    }
  }, [error, localStream])

  return error
}
