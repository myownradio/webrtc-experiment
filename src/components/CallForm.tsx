import React, { useState } from "react"

interface Props {
  onSubmit(callId: string): void
}

const CallForm: React.FC<Props> = ({ onSubmit }) => {
  const [id, setId] = useState("")

  function handleSubmit() {
    onSubmit(id)
  }

  return (
    <section id={"form"}>
      <input
        type={"text"}
        value={id}
        onChange={(event) => setId(event.target.value)}
      />
      <button onClick={handleSubmit}>Call</button>
    </section>
  )
}

export default CallForm
