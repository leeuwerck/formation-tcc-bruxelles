// Smartquotes
if (typeof smartquotes === "function") {
  smartquotes()
}

// Collapsible sections (used by 2020-04-10.html)
function toggleSection(id) {
  document.getElementById(id).classList.toggle("is-open")
}

// Role draw (2020-04-10.html version — uses #assign-result + #role-selector)
function drawRoles() {
  if (document.getElementById("assign-result")) {
    const roles = ["Psychothérapeute", "Patient", "Observateur"]
    const shuffled = [...roles].sort(() => Math.random() - 0.5)
    const names = ["Participant A", "Participant B", "Participant C"]
    const parts = names.map((n, i) => `<strong>${n}</strong> → ${shuffled[i]}`).join("&ensp;·&ensp;")
    document.getElementById("assign-result").innerHTML = parts
    document.getElementById("role-selector").classList.add("visible")
    document.querySelectorAll(".btn-role").forEach((b) => b.classList.remove("active"))
    document.querySelectorAll(".role-material").forEach((m) => m.classList.remove("visible"))
  } else if (document.getElementById("draw-result")) {
    // 2026-03-27.html version — uses #chip-a/b/c + #draw-result
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
}

function showRole(role) {
  document.querySelectorAll(".btn-role").forEach((b) => b.classList.remove("active"))
  document.querySelectorAll(".role-material").forEach((m) => m.classList.remove("visible"))
  const btnMap = { therapeute: 0, patient: 1, observateur: 2 }
  const matMap = { therapeute: "mat-therapeute", patient: "mat-patient", observateur: "mat-observateur" }
  document.querySelectorAll(".btn-role")[btnMap[role]].classList.add("active")
  document.getElementById(matMap[role]).classList.add("visible")
}

// Timer — phases in minutes [start, end]
const PHASES = [
  { label: "Mise en place", start: 0, end: 10, warn: false },
  { label: "Briefing des rôles", start: 10, end: 15, warn: false },
  { label: "Jeu de rôle — 1re partie", start: 15, end: 40, warn: false },
  { label: "⚠ Pause — sortie de rôle", start: 40, end: 50, warn: true },
  { label: "Jeu de rôle — 2e partie", start: 50, end: 70, warn: false },
  { label: "⚠ Sortie de rôle", start: 70, end: 75, warn: true },
  { label: "Débriefing réflexif", start: 75, end: 85, warn: false },
  { label: "Clôture", start: 85, end: 90, warn: false },
]
const TOTAL_SECS = 90 * 60

let timerInterval = null
let startTime = null

function startTimer() {
  if (timerInterval) return
  startTime = Date.now()
  document.getElementById("btn-start").style.display = "none"
  document.getElementById("btn-stop").style.display = "inline-block"
  timerInterval = setInterval(tickTimer, 500)
  tickTimer()
}

function stopTimer() {
  clearInterval(timerInterval)
  timerInterval = null
  document.getElementById("btn-start").style.display = "inline-block"
  document.getElementById("btn-stop").style.display = "none"
  document.getElementById("timer-display").textContent = "00:00"
  document.getElementById("timer-display").classList.remove("warning")
  document.getElementById("timer-phase").textContent = "En attente du démarrage"
  document.getElementById("timer-phase").classList.remove("warning")
  document.getElementById("timer-bar").style.width = "0%"
  document.getElementById("timer-bar").classList.remove("warning")
  PHASES.forEach((_, i) => {
    const el = document.getElementById("phase-" + i)
    if (el) el.classList.remove("active", "done")
  })
}

function tickTimer() {
  const elapsed = Math.floor((Date.now() - startTime) / 1000)
  if (elapsed >= TOTAL_SECS) {
    stopTimer()
    return
  }

  const mins = Math.floor(elapsed / 60)
  const secs = elapsed % 60
  document.getElementById("timer-display").textContent =
    String(mins).padStart(2, "0") + ":" + String(secs).padStart(2, "0")

  // Current phase
  let phaseIdx = PHASES.findIndex((p) => mins < p.end)
  if (phaseIdx === -1) phaseIdx = PHASES.length - 1
  const phase = PHASES[phaseIdx]

  // Warn if this phase is marked as a transition, OR if we're in the last 60s of any phase
  const secsUntilEnd = phase.end * 60 - elapsed
  const warn = phase.warn || secsUntilEnd <= 60

  document.getElementById("timer-display").classList.toggle("warning", warn)
  document.getElementById("timer-phase").textContent = phase.label
  document.getElementById("timer-phase").classList.toggle("warning", warn)
  document.getElementById("timer-bar").style.width = (elapsed / TOTAL_SECS) * 100 + "%"
  document.getElementById("timer-bar").classList.toggle("warning", warn)

  PHASES.forEach((_, i) => {
    const el = document.getElementById("phase-" + i)
    if (!el) return
    el.classList.remove("active", "done")
    if (i < phaseIdx) el.classList.add("done")
    else if (i === phaseIdx) el.classList.add("active")
  })
}

// Vignette loader — fetches markdown files and renders them into placeholder divs
async function loadVignettes() {
  const placeholders = document.querySelectorAll("#sec-vignettes [data-src]")
  if (!placeholders.length) return

  await Promise.all(
    Array.from(placeholders).map(async (el) => {
      const src = el.getAttribute("data-src")
      try {
        const res = await fetch(src)
        if (!res.ok) throw new Error("HTTP " + res.status)
        const md = await res.text()

        // Split into lines, find first non-empty line (title) and second non-empty line (tag)
        const lines = md.split("\n")
        let titleLine = ""
        let tagLine = ""
        let bodyStartIndex = 0
        let nonEmptyCount = 0

        for (let i = 0; i < lines.length; i++) {
          const trimmed = lines[i].trim()
          if (trimmed === "") continue
          nonEmptyCount++
          if (nonEmptyCount === 1) {
            titleLine = trimmed
            continue
          }
          if (nonEmptyCount === 2) {
            tagLine = trimmed
            bodyStartIndex = i + 1
            break
          }
        }

        // Parse "# Vignette X — Title" from titleLine
        const titleMatch = titleLine.match(/^#\s+(Vignette\s+\S+)\s+[—–-]+\s+(.+)$/)
        const num = titleMatch ? titleMatch[1] : ""
        const title = titleMatch ? titleMatch[2] : titleLine.replace(/^#+\s*/, "")

        // Parse "_tag_" from tagLine
        const tag = tagLine.replace(/^_(.+)_$/, "$1")

        // Body is everything after the tag line
        const bodyMd = lines.slice(bodyStartIndex).join("\n").trim()
        const bodyHtml = marked.parse(bodyMd)

        el.innerHTML =
          '<div class="vignette-header">' +
          '<span class="vignette-num">' + num + "</span>" +
          '<span class="vignette-title">' + title + "</span>" +
          '<span class="vignette-tag">' + tag + "</span>" +
          "</div>" +
          '<div class="vignette-body">' + bodyHtml + "</div>"
      } catch (err) {
        console.error("loadVignettes: failed to load " + src, err)
      }
    })
  )

  if (typeof smartquotes === "function") {
    smartquotes()
  }
}

document.addEventListener("DOMContentLoaded", loadVignettes)
