import React, { useEffect, useRef } from "react"

interface Props {
  mediaStream: MediaStream
}

const VideoSteam: React.FC<Props> = ({ mediaStream }) => {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (!videoRef.current) return
    videoRef.current.srcObject = mediaStream
  }, [mediaStream])

  return <video ref={videoRef} autoPlay />
}

export default VideoSteam
