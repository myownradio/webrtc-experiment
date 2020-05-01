import { Signal } from "./useSignal"
import { useEffect, useState } from "react"

interface MaybeIceCandidateMessage {
  candidate?: RTCIceCandidate | RTCIceCandidateInit
}

export default function useIceCandidate(
  peer: RTCPeerConnection,
  signal: Signal
): null | Error {
  const [error, setError] = useState<null | Error>(null)

  useEffect(() => {
    if (error) return

    type Listener = (ev: RTCPeerConnectionEventMap["icecandidate"]) => void

    const listener: Listener = ({ candidate }) => {
      candidate && signal.send({ type: "ice-candidate", candidate })
    }
    peer.addEventListener("icecandidate", listener)

    const unsubscribe = signal.subscribe<MaybeIceCandidateMessage>(
      ({ candidate }) => {
        if (!candidate) return
        peer.addIceCandidate(candidate).catch(setError)
      }
    )

    return () => {
      peer.removeEventListener("icecandidate", listener)
      unsubscribe()
    }
  }, [error])

  return error
}
