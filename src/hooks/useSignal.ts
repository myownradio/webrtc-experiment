import { useRef } from "react"
import ReconnectingWebSocket from "reconnecting-websocket"
import { EventEmitter } from "events"

export interface Signal {
  send<T>(message: T): void
  subscribe<T>(listener: (message: T) => void): () => void
}

function wsSignalingChannel(): Signal {
  const socket = new ReconnectingWebSocket("wss://wss.homefs.biz")

  const sendEmitter = new EventEmitter()
  const receiveEmitter = new EventEmitter()

  socket.addEventListener("message", (message) => {
    try {
      const msg = JSON.parse(message.data)
      receiveEmitter.emit("message", msg)
    } catch (e) {
      /* NOP */
    }
  })

  sendEmitter.on("message", (msg) => socket.send(JSON.stringify(msg)))

  return {
    subscribe<T>(cb: (msg: T) => void): () => void {
      const listener = (msg: T) => cb(msg)
      receiveEmitter.on("message", listener)
      return () => receiveEmitter.removeListener("message", listener)
    },
    send<T>(msg: T) {
      sendEmitter.emit("message", msg)
    },
  }
}

export default function useSignal(): Signal {
  const signalRef = useRef<Signal>()
  if (!signalRef.current) {
    signalRef.current = wsSignalingChannel()
  }
  return signalRef.current
}
