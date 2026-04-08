function drawRoles() {
  const roles = ["Psychothérapeute", "Patient", "Observateur"]
  const participants = ["Participant A", "Participant B", "Participant C"]

  // Shuffle roles
  const shuffled = [...roles].sort(() => Math.random() - 0.5)

  const chips = ["chip-a", "chip-b", "chip-c"]
  chips.forEach((id, i) => {
    document.getElementById(id).classList.add("assigned")
  })

  const resultHtml = participants
    .map((p, i) => `<strong>${p}</strong> → <span>${shuffled[i]}</span>`)
    .join(" &nbsp;·&nbsp; ")

  document.getElementById("draw-result").innerHTML = resultHtml
}

if (typeof smartquotes === "function") {
  smartquotes()
}
