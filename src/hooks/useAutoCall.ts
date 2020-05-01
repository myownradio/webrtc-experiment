import { Signal } from "./useSignal"
import { useEffect, useState } from "react"

export default function useAutoCall(
  peer: RTCPeerConnection,
  signal: Signal,
  localId: string,
  remoteId?: string,
  localStream?: MediaStream
): null | Error {
  const [error, setError] = useState<null | Error>(null)

  useEffect(() => {
    if (!remoteId || !localStream) return

    localStream
      .getTracks()
      .forEach((track) => peer.addTrack(track, localStream))

    peer
      .createOffer()
      .then((offer) => peer.setLocalDescription(offer))
      .then(() => {
        signal.send({
          fromId: localId,
          toId: remoteId,
          desc: peer.localDescription,
        })
      })
      .catch(setError)
  }, [remoteId, localStream])

  return error
}
