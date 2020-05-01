import uniqid from "uniqid"
import { useRef } from "react"

export default function useLocalId(): string {
  const localId = useRef<string>()
  if (!localId.current) {
    localId.current = window.location.search.slice(1) || uniqid()
  }
  return localId.current
}
