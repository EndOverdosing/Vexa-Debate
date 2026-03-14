const API = "https://vexa-ai.vercel.app"
const topicInput = document.getElementById("topic")
const startBtn = document.getElementById("start")
const stopBtn = document.getElementById("stop")
const randomBtn = document.getElementById("random")
const chat = document.getElementById("chat")
const chatWrap = document.getElementById("chatWrap")
const statusEl = document.getElementById("status")
const styleBtn = document.getElementById("styleBtn")
const styleMenu = document.getElementById("styleMenu")
const modeBtn = document.getElementById("modeBtn")
const modeMenu = document.getElementById("modeMenu")
const lengthBtn = document.getElementById("lengthBtn")
const lengthMenu = document.getElementById("lengthMenu")
const judgeBtn = document.getElementById("judgeBtn")
const judgeMenu = document.getElementById("judgeMenu")
const customWrap = document.getElementById("customWrap")
const customStyle = document.getElementById("customStyle")
const inputBar = document.getElementById("inputBar")
const humanInputField = document.getElementById("humanInput")
const sendBtn = document.getElementById("sendBtn")
const sentimentWrap = document.getElementById("sentimentWrap")
const sentimentFill = document.getElementById("sentimentFill")
const chaosBtn = document.getElementById("chaosBtn")
const exportBtn = document.getElementById("exportBtn")

let style = "casual", mode = "ai-ai", length = "medium", judge = "neutral", running = false, exchanges = 0
let abortController = null

const LENGTHS = { short: 3, medium: 5, long: 8 }

document.body.addEventListener('touchmove', function (e) {
    if (e.target.closest('#chatWrap')) return;
    e.preventDefault();
}, { passive: false });

const STYLES = {
    casual: "casual argument with real points",
    logic: "logical debate with reasoning",
    philosophical: "philosophical discussion",
    sarcastic: "sarcastic debate still making points",
    internet: "internet comment style debate"
}
const JUDGES = {
    neutral: "neutral impartial judge",
    strict: "strict logic professor",
    troll: "chaotic internet troll",
    supreme: "supreme court justice"
}

let histA = [], histB = [], history = []

function clean(t) { return t.replace(/\[model:[^\]]*\]/gi, "").replace(/[*_`>#~\-]/g, "").replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE00}-\u{FEFF}]/gu, "").trim() }

function addMsg(side, text, round) {
    if (!running && side !== 'judge') return
    const el = document.createElement("div")
    if (round) {
        const r = document.createElement("div")
        r.className = "round"
        r.textContent = round
        chat.appendChild(r)
    }
    el.className = "msg msg-" + side
    el.innerHTML = '<div class="name">' + (side === 'a' ? 'PRO' : (side === 'b' ? 'CON' : 'SYSTEM')) + '</div>' + clean(text)
    chat.appendChild(el)
    chatWrap.scrollTop = chatWrap.scrollHeight
}

function addTyping() {
    const el = document.createElement("div")
    el.id = "typing"
    el.className = "typing"
    el.innerHTML = '<div class="dot"></div><div class="dot"></div><div class="dot"></div>'
    chat.appendChild(el)
    chatWrap.scrollTop = chatWrap.scrollHeight
}

function removeTyping() { const t = document.getElementById("typing"); if (t) t.remove() }

async function call(messages) {
    for (const m of ["toolbaz-v4.5-fast", "gemini-2.5-flash", "gpt-4o-mini"]) {
        try {
            const r = await fetch(API + "/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ model: m, messages }),
                signal: abortController.signal
            })
            const d = await r.json()
            console.log("[call] model:", m, "response:", d)
            const txt = d.message?.content || d.text || d.content
            if (txt) return clean(txt)
        } catch (e) {
            console.error("[call] model:", m, "error:", e)
            if (e.name === 'AbortError') return null
        }
    }
    return null
}

async function randomTopic() {
    statusEl.textContent = "generating topic..."
    abortController = new AbortController()
    running = true
    const t = await call([{ role: "user", content: "generate one short controversial debate topic. return only the topic." }])
    running = false
    if (t) topicInput.value = t
    statusEl.textContent = "ready"
}

function roundLabel(i) {
    const total = LENGTHS[length]
    if (i === 0) return "Opening Statement"
    if (i >= total - 1) return "Closing Argument"
    return "Rebuttal " + Math.floor(i / 2 + 1)
}

async function updateSentiment() {
    if (!running) return
    const prompt = "Evaluate this debate. Output ONLY a number from 0 to 100 representing PRO's winning percentage (50 is tie).\n" + history.join("\n")
    const tempHist = [{ role: "user", content: prompt }]
    const res = await call(tempHist)
    if (res) {
        const num = parseInt(res.replace(/\D/g, ''))
        if (!isNaN(num) && num >= 0 && num <= 100) {
            sentimentFill.style.width = num + "%"
        }
    }
}

async function turn(side, humanInput = null) {
    if (!running) return
    let msg
    if (humanInput) {
        msg = humanInput
    } else {
        addTyping()
        msg = await call(side === "a" ? histA : histB)
        removeTyping()
        if (!msg) return
    }

    addMsg(side, msg, roundLabel(exchanges))
    history.push((side === "a" ? "PRO" : "CON") + ": " + msg)

    histA.push({ role: side === "a" ? "assistant" : "user", content: msg })
    histB.push({ role: side === "b" ? "assistant" : "user", content: msg })
}

function getHumanResponse() {
    return new Promise((resolve) => {
        inputBar.style.display = "block"
        humanInputField.focus()
        const handleSend = () => {
            const val = humanInputField.value.trim()
            if (val) {
                inputBar.style.display = "none"
                humanInputField.value = ""
                sendBtn.removeEventListener("click", handleSend)
                resolve(val)
            }
        }
        sendBtn.addEventListener("click", handleSend)
        humanInputField.onkeydown = (e) => { if (e.key === "Enter") handleSend() }
    })
}

chaosBtn.onclick = async () => {
    if (!running) return
    chaosBtn.disabled = true
    statusEl.textContent = "injecting chaos..."
    const twistPrompt = "Generate a wild, unexpected 1-sentence plot twist or new fake fact for the debate topic: " + topicInput.value.trim()
    const temp = [{ role: "user", content: twistPrompt }]
    const twist = await call(temp)
    if (twist) {
        addMsg("judge", "GRENADE: " + twist, "PLOT TWIST")
        history.push("SYSTEM PLOT TWIST: " + twist)
        histA.push({ role: "system", content: "NEW CONDITION: " + twist + " Address this immediately." })
        histB.push({ role: "system", content: "NEW CONDITION: " + twist + " Address this immediately." })
    }
    chaosBtn.disabled = false
    statusEl.textContent = "debate continuing"
}

exportBtn.onclick = () => {
    if (history.length === 0) return
    let text = "VEXA DEBATE TRANSCRIPT\nTopic: " + topicInput.value + "\n\n"
    text += history.join("\n\n")
    navigator.clipboard.writeText(text)
    const prev = exportBtn.textContent
    exportBtn.textContent = "COPIED!"
    setTimeout(() => exportBtn.textContent = prev, 2000)
}

async function run() {
    const topic = topicInput.value.trim()
    if (!topic) { statusEl.textContent = "enter topic first"; return; }

    chat.innerHTML = ""
    histA = []; histB = []; history = []
    exchanges = 0
    running = true
    abortController = new AbortController()

    startBtn.disabled = true
    stopBtn.disabled = false
    chaosBtn.style.display = "block"
    exportBtn.style.display = "none"
    sentimentWrap.style.display = "block"
    sentimentFill.style.width = "50%"

    const stylePrompt = style === "custom" ? customStyle.value : STYLES[style]
    const lengthInstructions = { short: "1-2 sentences max", medium: "3-4 sentences max", long: "6-8 sentences max" }
    const lenGuide = lengthInstructions[length]
    histA = [{ role: "system", content: "Topic: " + topic + ". You AGREE. Style: " + stylePrompt + ". Response length: " + lenGuide + ". Be extremely concise." }]
    histB = [{ role: "system", content: "Topic: " + topic + ". You DISAGREE. Style: " + stylePrompt + ". Response length: " + lenGuide + ". Be extremely concise." }]
    const maxRounds = LENGTHS[length]

    while (running && exchanges < maxRounds) {
        if (mode === "human-ai") {
            statusEl.textContent = "your turn (PRO)"
            const humanMsg = await getHumanResponse()
            if (!running) break
            await turn("a", humanMsg)
        } else {
            statusEl.textContent = "AI (PRO) typing..."
            await turn("a")
        }
        if (!running) break

        statusEl.textContent = "AI (CON) typing..."
        await turn("b")
        if (!running) break

        exchanges++
        updateSentiment()
    }

    if (running) {
        running = false
        chaosBtn.style.display = "none"
        statusEl.textContent = "debate finished. judging..."
        abortController = new AbortController()
        const judgeStyle = JUDGES[judge]
        const winPrompt = "You are a " + judgeStyle + ". A debate just occurred on the topic: \"" + topic + "\"\n\nFull transcript:\n" + history.join("\n") + "\n\nAs a " + judgeStyle + ", declare a winner (PRO or CON) and give exactly one sentence explaining your verdict in your own voice and style."
        console.log("[judge] prompt:", winPrompt)
        const result = await call([{ role: "user", content: winPrompt }])
        console.log("[judge] result:", result)
        if (result) {
            addMsg("judge", result, "FINAL VERDICT")
            statusEl.textContent = "done"
        }
    }

    exportBtn.style.display = "block"
    startBtn.disabled = false
    stopBtn.disabled = true
}

startBtn.onclick = run
stopBtn.onclick = () => {
    running = false
    if (abortController) abortController.abort()
    statusEl.textContent = "stopped"
    startBtn.disabled = false
    stopBtn.disabled = true
    inputBar.style.display = "none"
    chaosBtn.style.display = "none"
    exportBtn.style.display = "block"
    removeTyping()
}
randomBtn.onclick = randomTopic
topicInput.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !running) run() })

function setupDropdown(btn, menu, setFunc) {
    btn.onclick = (e) => { e.stopPropagation(); menu.style.display = menu.style.display === "flex" ? "none" : "flex" }
    menu.querySelectorAll("div").forEach(opt => {
        opt.onclick = () => {
            const val = opt.dataset.value || opt.dataset.style || opt.dataset.mode || opt.dataset.length || opt.dataset.judge
            setFunc(val)
            menu.style.display = "none"
            btn.textContent = opt.textContent + " ▾"
            if (opt.dataset.style) customWrap.style.display = (opt.dataset.style === "custom") ? "block" : "none"
        }
    })
}
document.addEventListener("click", () => {
    [styleMenu, modeMenu, lengthMenu, judgeMenu].forEach(m => m.style.display = "none")
})
setupDropdown(styleBtn, styleMenu, v => style = v)
setupDropdown(modeBtn, modeMenu, v => mode = v)
setupDropdown(lengthBtn, lengthMenu, v => length = v)
setupDropdown(judgeBtn, judgeMenu, v => judge = v)