import { Signal } from "./useSignal"
import { useEffect, useState } from "react"
import MyMediaStream from "../abs/MyMediaStream"

export default function useAutoCall(
  peer: RTCPeerConnection,
  signal: Signal,
  localId: string,
  remoteId?: string,
  localStream?: MyMediaStream
): null | Error {
  const [error, setError] = useState<null | Error>(null)

  useEffect(() => {
    if (!localStream) return

    const listener = () => {
      // todo update stream
    }

    localStream.addListener('update', listener)

    return () => {
      localStream.removeListener('update', listener)
    }
  }, [MyMediaStream])

  useEffect(() => {
    if (!remoteId || !localStream) return
    const { mediaStream } = localStream

    mediaStream
      .getTracks()
      .forEach((track) => peer.addTrack(track, mediaStream))

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
