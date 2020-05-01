import { EventEmitter } from "events"

export default class MyMediaStream extends EventEmitter {
  constructor(readonly mediaStream: MediaStream) {
    super()
  }

  replaceVideoTrack(track: MediaStreamTrack) {
    this.mediaStream
      .getVideoTracks()
      .forEach((track) => this.mediaStream.removeTrack(track))
    this.mediaStream.addTrack(track)
    this.emit("updated", this.mediaStream)
  }

  replaceAudioTrack(track: MediaStreamTrack) {
    this.mediaStream
      .getAudioTracks()
      .forEach((track) => this.mediaStream.removeTrack(track))
    this.mediaStream.addTrack(track)
    this.emit("updated", this.mediaStream)
  }

  async replaceAll(provideStream: () => Promise<MediaStream>) {
    provideStream().then((newStream) => {
      this.mediaStream
        .getTracks()
        .forEach((track) => this.mediaStream.removeTrack(track))
      newStream.getTracks().forEach((track) => {
        this.mediaStream.addTrack(track)
        newStream.removeTrack(track)
      })
      this.emit("updated", this.mediaStream)
    })
  }

  static fromUserMedia(constraints?: MediaStreamConstraints) {
    return window.navigator.mediaDevices
      .getUserMedia(constraints)
      .then((mediaStream) => new MyMediaStream(mediaStream))
  }

  static fromSharedScreen(constraints?: MediaStreamConstraints) {
    interface DisplayMedia {
      getDisplayMedia: typeof window.navigator.mediaDevices.getUserMedia
    }

    return ((window.navigator.mediaDevices as any) as DisplayMedia)
      .getDisplayMedia(constraints)
      .then((mediaStream) => new MyMediaStream(mediaStream))
  }
}
