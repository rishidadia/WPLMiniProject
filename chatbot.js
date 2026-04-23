// ============================================================
//  GameSenseAI — Gemini Chatbot
//  Replace the placeholder below with your actual Gemini API key
// ============================================================
const GEMINI_API_KEY = "AIzaSyA0VoiPVZW77FlQHLj4DQvl0UM64E7tZCg";
const GEMINI_MODEL = "gemini-2.5-flash";

// ── Helpers ──────────────────────────────────────────────────
function getMatchData() {
    return JSON.parse(localStorage.getItem("matches")) || [];
}

function getProfileData() {
    return JSON.parse(localStorage.getItem("profile")) || {};
}

function buildSystemContext() {
    const matches = getMatchData();
    const profile = getProfileData();

    const playerInfo = profile.name
        ? `Player: ${profile.name}, Location: ${profile.location || "N/A"}, College: ${profile.college || "N/A"}, Sports: ${(profile.sports || []).join(", ") || "N/A"}.`
        : "No profile saved yet.";

    let matchSummary = "No matches recorded yet.";
    if (matches.length > 0) {
        matchSummary = matches.map((m, i) =>
            `Match ${i + 1}: Sport=${m.sport}, Outcome=${m.outcome}, Date=${m.date}, Notes="${m.notes}"`
        ).join("\n");
    }

    return `You are GameSenseAI, a helpful sports assistant embedded in the GameSenseAI turf stats tracker app.
You help players understand their performance based on match history stored in the app.

APP INFO:
- The app lets players log turf matches (sport, outcome, notes, date) and manage a profile.
- Sports supported: Football, Cricket, Basketball, Tennis, Badminton, Volleyball.
- Data is stored locally in the browser.

PLAYER PROFILE:
${playerInfo}

MATCH HISTORY (${matches.length} total matches):
${matchSummary}

Answer questions about the player's match history, stats, performance trends, or general app usage.
Be concise, friendly, and data-driven. If no data is available, say so clearly.`;
}

// ── Gemini API call ──────────────────────────────────────────
async function askGemini(userMessage, conversationHistory) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

    const systemContext = buildSystemContext();

    // Build contents array: system instruction + conversation history + new user message
    const contents = [
        ...conversationHistory,
        { role: "user", parts: [{ text: userMessage }] }
    ];

    const payload = {
        system_instruction: { parts: [{ text: systemContext }] },
        contents: contents,
        generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024
        }
    };

    const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(err?.error?.message || "Gemini API error");
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response from Gemini.";
}

// ── DOM & State ───────────────────────────────────────────────
let chatOpen = false;
let conversationHistory = []; // { role: "user"|"model", parts: [{text}] }

const QUICK_PROMPTS = [
    { label: "📊 Last week summary", text: "Give me a summary of my matches from the past 7 days." },
    { label: "🏆 How many wins?", text: "How many matches have I won in total?" },
    { label: "📉 Losses breakdown", text: "Show me my losses and which sports I lost in." },
    { label: "⚽ Best sport for me?", text: "Based on my match history, which sport am I performing best in?" },
    { label: "💡 Tips to improve", text: "Based on my recent games, give me tips to improve my performance." },
    { label: "📅 Most active day?", text: "Which day of the week do I play the most?" }
];

// ── Build the widget HTML ─────────────────────────────────────
function createChatbotWidget() {
    const widget = document.createElement("div");
    widget.id = "gsa-chatbot-widget";
    widget.innerHTML = `
        <!-- Floating toggle button -->
        <button id="gsa-chat-toggle" aria-label="Open AI Chat" title="Ask GameSenseAI">
            <span id="gsa-chat-icon">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
            </span>
            <span id="gsa-unread-dot" class="gsa-hidden"></span>
        </button>

        <!-- Chat window -->
        <div id="gsa-chat-window" class="gsa-hidden">
            <!-- Header -->
            <div id="gsa-chat-header">
                <div class="gsa-header-left">
                    <div class="gsa-avatar">AI</div>
                    <div>
                        <div class="gsa-header-name">GameSenseAI</div>
                        <div class="gsa-header-sub">Powered by Gemini</div>
                    </div>
                </div>
                <button id="gsa-chat-close" aria-label="Close chat">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
            </div>

            <!-- Messages area -->
            <div id="gsa-chat-messages">
                <div class="gsa-msg gsa-msg-bot">
                    <div class="gsa-bubble">
                        👋 Hi! I'm GameSenseAI. I can analyse your match history and help you understand your performance. Try one of the quick prompts below or ask me anything!
                    </div>
                </div>
            </div>

            <!-- Quick prompt chips -->
            <div id="gsa-quick-prompts">
                ${QUICK_PROMPTS.map(p => `<button class="gsa-chip" data-text="${p.text}">${p.label}</button>`).join("")}
            </div>

            <!-- Input area -->
            <div id="gsa-chat-input-area">
                <textarea id="gsa-chat-input" placeholder="Ask about your stats..." rows="1"></textarea>
                <button id="gsa-chat-send" aria-label="Send">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                    </svg>
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(widget);
}

// ── Render a message bubble ───────────────────────────────────
function appendMessage(role, text) {
    const messagesEl = document.getElementById("gsa-chat-messages");
    const wrapper = document.createElement("div");
    wrapper.className = `gsa-msg ${role === "user" ? "gsa-msg-user" : "gsa-msg-bot"}`;

    const bubble = document.createElement("div");
    bubble.className = "gsa-bubble";
    // Render simple markdown-ish: bold **text**, newlines
    bubble.innerHTML = text
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/\n/g, "<br>");

    wrapper.appendChild(bubble);
    messagesEl.appendChild(wrapper);
    messagesEl.scrollTop = messagesEl.scrollHeight;
}

// ── Typing indicator ──────────────────────────────────────────
function showTyping() {
    const messagesEl = document.getElementById("gsa-chat-messages");
    const wrapper = document.createElement("div");
    wrapper.className = "gsa-msg gsa-msg-bot";
    wrapper.id = "gsa-typing-indicator";
    wrapper.innerHTML = `<div class="gsa-bubble gsa-typing"><span></span><span></span><span></span></div>`;
    messagesEl.appendChild(wrapper);
    messagesEl.scrollTop = messagesEl.scrollHeight;
}

function hideTyping() {
    const el = document.getElementById("gsa-typing-indicator");
    if (el) el.remove();
}

// ── Send message ──────────────────────────────────────────────
async function sendMessage(text) {
    if (!text.trim()) return;

    const inputEl = document.getElementById("gsa-chat-input");
    if (inputEl) { inputEl.value = ""; inputEl.style.height = "auto"; }

    appendMessage("user", text);
    conversationHistory.push({ role: "user", parts: [{ text }] });

    // Hide quick prompts after first real interaction
    const qp = document.getElementById("gsa-quick-prompts");
    if (qp) qp.style.display = "none";

    showTyping();

    // Disable send button while waiting
    const sendBtn = document.getElementById("gsa-chat-send");
    if (sendBtn) sendBtn.disabled = true;

    try {
        const reply = await askGemini(text, conversationHistory.slice(0, -1)); // history without last user msg (already added)
        hideTyping();
        appendMessage("bot", reply);
        conversationHistory.push({ role: "model", parts: [{ text: reply }] });
    } catch (err) {
        hideTyping();
        appendMessage("bot", `⚠️ Error: ${err.message}. Please check your API key.`);
    } finally {
        if (sendBtn) sendBtn.disabled = false;
    }
}

// ── Toggle open/close ─────────────────────────────────────────
function toggleChat() {
    chatOpen = !chatOpen;
    const win = document.getElementById("gsa-chat-window");
    const dot = document.getElementById("gsa-unread-dot");

    if (chatOpen) {
        win.classList.remove("gsa-hidden");
        win.classList.add("gsa-open");
        if (dot) dot.classList.add("gsa-hidden");
        setTimeout(() => {
            const inputEl = document.getElementById("gsa-chat-input");
            if (inputEl) inputEl.focus();
        }, 200);
    } else {
        win.classList.remove("gsa-open");
        win.classList.add("gsa-closing");
        setTimeout(() => {
            win.classList.add("gsa-hidden");
            win.classList.remove("gsa-closing");
        }, 250);
    }
}

// ── Wire up events ─────────────────────────────────────────────
function initChatbot() {
    createChatbotWidget();

    document.getElementById("gsa-chat-toggle").addEventListener("click", toggleChat);
    document.getElementById("gsa-chat-close").addEventListener("click", toggleChat);

    document.getElementById("gsa-chat-send").addEventListener("click", () => {
        const val = document.getElementById("gsa-chat-input").value;
        sendMessage(val);
    });

    document.getElementById("gsa-chat-input").addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage(e.target.value);
        }
    });

    // Auto-grow textarea
    document.getElementById("gsa-chat-input").addEventListener("input", function () {
        this.style.height = "auto";
        this.style.height = Math.min(this.scrollHeight, 120) + "px";
    });

    // Quick prompt chips
    document.querySelectorAll(".gsa-chip").forEach(chip => {
        chip.addEventListener("click", () => {
            sendMessage(chip.dataset.text);
        });
    });
}

// ── Bootstrap ─────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", initChatbot);
