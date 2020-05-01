import React, { useEffect, useRef } from "react"
import MyMediaStream from "../abs/MyMediaStream";

interface Props {
  myMediaStream: MyMediaStream
}

const VideoSteam: React.FC<Props> = ({ myMediaStream }) => {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (!videoRef.current) return
    videoRef.current.srcObject = myMediaStream.mediaStream
  }, [myMediaStream])

  return <video ref={videoRef} autoPlay />
}

export default VideoSteam
