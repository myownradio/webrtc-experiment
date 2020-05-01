import { Signal } from "./useSignal"
import { useEffect, useState } from "react"

interface MaybeSessionDescription {
  toId?: string
  desc?: RTCSessionDescription
}

export default function useAnswer(
  peer: RTCPeerConnection,
  signal: Signal,
  localId: string
): null | Error {
  const [error, setError] = useState<null | Error>(null)

  useEffect(() => {
    if (error) return

    const unsubscribe = signal.subscribe<MaybeSessionDescription>(
      ({ desc, toId }) => {
        if (toId === localId && desc && desc.type === "answer") {
          console.log('answer:setRemoteDescription', desc, toId)
          peer.setRemoteDescription(desc).catch(setError)
        }
      }
    )

    return () => {
      unsubscribe()
    }
  }, [error])

  return error
}
