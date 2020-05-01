import React, { Suspense, useEffect, useState } from "react"
import VideoSteam from "./components/VideoStream"
import useSignal from "./hooks/useSignal"
import usePeer from "./hooks/usePeer"
import useIceCandidate from "./hooks/useIceCandidate"
import useAnswer from "./hooks/useAnswer"
import useLocalId from "./hooks/useLocalId"
import useOffer from "./hooks/useOffer"
import CallForm from "./components/CallForm"
import useAutoCall from "./hooks/useAutoCall";
import MyMediaStream from "./abs/MyMediaStream";

const App = () => {
  const [localStream, setLocalStream] = useState<MyMediaStream>()
  const [remoteStream, setRemoteStream] = useState<MyMediaStream>()
  const [remoteId, setRemoteId] = useState<string>()

  const localId = useLocalId()
  const signal = useSignal()
  const peer = usePeer()

  useIceCandidate(peer, signal)
  useAnswer(peer, signal, localId)
  useOffer(peer, signal, localId, localStream)
  useAutoCall(peer, signal, localId, remoteId, localStream)

  useEffect(() => {
    MyMediaStream.fromUserMedia({ video: { width: 320 } }).then(setLocalStream)
  }, [])

  useEffect(() => {
    peer.addEventListener("track", (event) => {
      setRemoteStream(new MyMediaStream(event.streams[0]))
    })
  }, [])

  function handleCall(callTo: string): void {
    setRemoteId(callTo)
  }

  return (
    <Suspense fallback={null}>
      <section id={"video-chat"}>
        <h2>You ({localId})</h2>
        {localStream && <VideoSteam myMediaStream={localStream} />}
        <h2>Remote</h2>
        {remoteStream ? (
          <VideoSteam myMediaStream={remoteStream} />
        ) : (
          <CallForm onSubmit={handleCall} />
        )}
      </section>
    </Suspense>
  )
}

export default App
