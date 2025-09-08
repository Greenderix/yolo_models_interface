
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000'

const el = (id) => document.getElementById(id)
const modelSelect = el('modelSelect')
const fileInput = el('fileInput')
const startBtn = el('startBtn')
const stopBtn = el('stopBtn')
const clearBtn = el('clearBtn')
const statsEl = el('stats')
const video = el('video')
const overlay = el('overlay')
const ctx = overlay.getContext('2d')

let objectUrl = null
let processing = false
let sessionId = (crypto && crypto.randomUUID) ? crypto.randomUUID() : String(Math.random())
let frameCb = null

async function loadModels() {
  const res = await fetch(`${API_BASE}/api/models`)
  const models = await res.json()
  modelSelect.innerHTML = ''
  for (const m of models) {
    const opt = document.createElement('option')
    opt.value = m.id
    opt.textContent = m.title
    modelSelect.appendChild(opt)
  }
}

function resizeOverlay() {
  overlay.width = video.videoWidth
  overlay.height = video.videoHeight
}

function drawBoxes(detections) {
  ctx.clearRect(0, 0, overlay.width, overlay.height)
  ctx.lineWidth = 2
  ctx.font = '14px ui-sans-serif'
  ctx.strokeStyle = 'lime'
  ctx.fillStyle = 'lime'
  for (const d of detections) {
    ctx.strokeRect(d.x, d.y, d.w, d.h)
    const label = `${d.cls} ${(d.score*100).toFixed(1)}%`
    ctx.fillText(label, d.x + 4, Math.max(12, d.y - 4))
  }
}

async function inferCurrentFrame() {
  if (!processing) return
  if (video.paused || video.ended) return

  const frameStep = parseInt(el('frameStep').value || '2', 10)
  const fps = (video.getVideoPlaybackQuality && video.getVideoPlaybackQuality().totalVideoFrames && video.currentTime > 0)
    ? video.getVideoPlaybackQuality().totalVideoFrames / video.currentTime
    : 25
  const nowFrames = Math.floor(video.currentTime * fps)
  if (nowFrames % frameStep !== 0) return

  const canvas = document.createElement('canvas')
  canvas.width = video.videoWidth
  canvas.height = video.videoHeight
  const cctx = canvas.getContext('2d')
  cctx.drawImage(video, 0, 0, canvas.width, canvas.height)
  const dataUrl = canvas.toDataURL('image/jpeg', 0.7)

  const modelId = modelSelect.value
  const conf = parseFloat(el('conf').value || '0.25')

  const started = performance.now()
  const res = await fetch(`${API_BASE}/api/infer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId,
      modelId,
      frameTsMs: Math.floor(video.currentTime * 1000),
      imageBase64: dataUrl,
      options: { scoreThreshold: conf }
    })
  })
  const out = await res.json()
  const inferMs = out?.meta?.inferMs ?? 0
  const rtt = performance.now() - started

  drawBoxes(out.detections || [])
  statsEl.textContent = `device: (server), model: ${out.modelId}, infer: ${inferMs.toFixed?.(1)} ms, RTT: ${rtt.toFixed(1)} ms, time: ${video.currentTime.toFixed(2)}s`
}

function scheduleNext() {
  if (!processing) return
  if ('requestVideoFrameCallback' in HTMLVideoElement.prototype) {
    frameCb = video.requestVideoFrameCallback(() => {
      inferCurrentFrame().catch(()=>{})
      scheduleNext()
    })
  } else {
    setTimeout(async () => {
      await inferCurrentFrame().catch(()=>{})
      scheduleNext()
    }, 40)
  }
}

function startProcessing() {
  if (!video.src) return
  processing = true
  scheduleNext()
}
function stopProcessing() {
  processing = false
  if (frameCb && video.cancelVideoFrameCallback) {
    video.cancelVideoFrameCallback(frameCb)
  }
}

function clearAll() {
  stopProcessing()
  ctx.clearRect(0,0,overlay.width, overlay.height)
  video.pause()
  video.removeAttribute('src')
  if (objectUrl) URL.revokeObjectURL(objectUrl)
  objectUrl = null
  video.load()
  startBtn.disabled = true
  stopBtn.disabled = true
  clearBtn.disabled = true
  sessionId = (crypto && crypto.randomUUID) ? crypto.randomUUID() : String(Math.random())
  statsEl.textContent = ''
}

fileInput.addEventListener('change', () => {
  const f = fileInput.files?.[0]
  if (!f) return
  if (objectUrl) URL.revokeObjectURL(objectUrl)
  objectUrl = URL.createObjectURL(f)
  video.src = objectUrl
  video.onloadedmetadata = () => {
    resizeOverlay()
    startBtn.disabled = false
    clearBtn.disabled = false
  }
})

video.addEventListener('play', () => resizeOverlay())
window.addEventListener('resize', () => resizeOverlay())

startBtn.addEventListener('click', () => { startProcessing(); stopBtn.disabled = false })
stopBtn.addEventListener('click', () => { stopProcessing(); stopBtn.disabled = true })
clearBtn.addEventListener('click', () => clearAll())

window.addEventListener('beforeunload', () => { if (objectUrl) URL.revokeObjectURL(objectUrl) })

loadModels()
