import { useRef } from "react"

export default function usePeer(): RTCPeerConnection {
  const peerRef = useRef<RTCPeerConnection>()
  if (!peerRef.current) {
    peerRef.current = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    })
  }
  return peerRef.current
}
