/* ═══════════════════════════════════════════════════════
   BELLY BEARS — CHATBOT.JS
   NEW FILE: BellyBot — AI assistant powered by Claude
   Uses Anthropic API (claude-sonnet-4-20250514)
   Floating widget, bear-themed, answers project Q&A
═══════════════════════════════════════════════════════ */

const CHATBOT_SYSTEM_PROMPT = `You are BellyBot 🐻, the friendly AI assistant for Belly Bears — an NFT project on the Base blockchain. You are chubby, cool, and dangerously helpful.

KEY PROJECT INFO:
- 2222 hand-crafted Legendary Bears on Base blockchain
- Telegram Mini Game: t.me/bellybears_bot (LIVE NOW)
- Twitter/X: @belly_bears
- Website: belly-bears.xyz

WHITELIST (WL):
- Complete 4 tasks on the website + reach Top 100 in the Telegram game
- WL Mint price: 0.5 ETH
- Public Mint price: 0.8 ETH  
- Max 3 NFTs per wallet
- Mint date: Q3 2026 (targeting July 2026)
- 46 WL spots remaining

TASKS TO GET WL:
1. Follow @belly_bears on X
2. Join the Telegram Community at t.me/bellybears_bot
3. Share your bear on X (tag @belly_bears)
4. Play Game & Reach Top 100 Daily
5. Repost the pinned tweet (unlocks secret Honey Vault easter egg!)

BELLY PASS:
- 2 USDC for 3 days of power-ups
- Power-ups: Combo Master (double coins), Shield ×3, Coin Magnet (60s)
- Paid with USDC on Base network
- Linked to your Telegram account

ROADMAP:
- Phase 1 (Q2 2026, LIVE): Game, community, tasks, Belly Pass — 80% complete
- Phase 2 (Q3 2026): NFT mint on Base, holder dashboard, OpenSea listing
- Phase 3 (Q4 2026): NFT Staking, $BELLY in-game rewards, holder airdrops, merch
- Phase 4 (Q1 2027): CEX listing, partnerships, metaverse integration, $BELLY token
- Phase 5 (2027+): Global IRL events, NFT utility V2, comic & animation, DAO

REFERRAL:
- Share your referral link; when friend mints you both get 0.02 ETH bonus
- Connect wallet + enter Telegram username to get your referral link

BLOCKCHAIN:
- Base (Coinbase's L2 on Ethereum)
- Recommended wallet: Coinbase Wallet (native Base support)
- Also supports MetaMask, Rabby

TEAM: Chubby Founder (vision), Pixel Bear (art), Game Dev Bear (Telegram game), Marketing Bear (growth)

RESPONSE STYLE:
- Keep answers SHORT and friendly (2-4 sentences max)
- Use bear emojis occasionally 🐻🍯⭐
- Be enthusiastic about the project but honest
- If unsure about something, say so and direct to Telegram/Twitter
- Never make up prices, dates, or facts not listed above`;

let chatHistory = [];
let chatbotOpen = false;
let chatbotTyping = false;

// ── INIT ──────────────────────────────────────────────
function initChatbot() {
    injectChatbotHTML();
    injectChatbotCSS();
    bindChatbotEvents();

    // Welcome message after brief delay
    setTimeout(() => {
        addBotMessage("Hey there! I'm BellyBot 🐻 — your guide to the Belly Bears universe. Ask me anything about the NFT, whitelist, game, or Belly Pass! 🍯");
    }, 500);
}

// ── HTML INJECTION ────────────────────────────────────
function injectChatbotHTML() {
    const html = `
    <!-- ═══════════════════════════════════════════════
         BELLYBOT CHATBOT WIDGET
         NEW: AI-powered Q&A assistant
    ═══════════════════════════════════════════════ -->
    <div id="bellyBotWidget">

        <!-- Toggle button -->
        <button id="bellyBotToggle" onclick="toggleChatbot()" aria-label="Open BellyBot chat">
            <span class="bb-toggle-icon bb-icon-closed">🐻</span>
            <span class="bb-toggle-icon bb-icon-open hidden">✕</span>
            <span class="bb-badge hidden" id="bbBadge">1</span>
        </button>

        <!-- Chat window -->
        <div id="bellyBotWindow" class="hidden" role="dialog" aria-label="BellyBot Chat">
            <!-- Header -->
            <div class="bb-header">
                <div class="bb-header-info">
                    <div class="bb-avatar">🐻</div>
                    <div>
                        <div class="bb-name">BellyBot</div>
                        <div class="bb-status">
                            <span class="bb-status-dot"></span>
                            Online · Powered by Claude AI
                        </div>
                    </div>
                </div>
                <button class="bb-close" onclick="toggleChatbot()" aria-label="Close chat">✕</button>
            </div>

            <!-- Messages -->
            <div id="bbMessages" class="bb-messages" role="log" aria-live="polite"></div>

            <!-- Quick replies -->
            <div class="bb-quick-replies" id="bbQuickReplies">
                <button class="bb-quick" onclick="sendQuickReply('How do I get whitelisted?')">🎟️ Get WL</button>
                <button class="bb-quick" onclick="sendQuickReply('What is the mint price?')">💰 Mint Price</button>
                <button class="bb-quick" onclick="sendQuickReply('What is Belly Pass?')">⚡ Belly Pass</button>
                <button class="bb-quick" onclick="sendQuickReply('Tell me about the roadmap')">🗺️ Roadmap</button>
            </div>

            <!-- Input -->
            <div class="bb-input-row">
                <input
                    id="bbInput"
                    type="text"
                    class="bb-input"
                    placeholder="Ask BellyBot anything... 🍯"
                    maxlength="300"
                    onkeydown="if(event.key==='Enter')sendChatMessage()"
                    aria-label="Chat message"
                >
                <button class="bb-send" onclick="sendChatMessage()" aria-label="Send message">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z"/>
                    </svg>
                </button>
            </div>
        </div>
    </div>`;

    document.body.insertAdjacentHTML('beforeend', html);
}

// ── CSS INJECTION ─────────────────────────────────────
function injectChatbotCSS() {
    const style = document.createElement('style');
    style.textContent = `
/* ═══════════════════════════════════════════════
   BELLYBOT WIDGET STYLES
═══════════════════════════════════════════════ */
#bellyBotWidget {
    position: fixed;
    bottom: 90px;
    left: 24px;
    z-index: 700;
    font-family: 'Lora', Georgia, serif;
}

/* Toggle Button */
#bellyBotToggle {
    width: 58px;
    height: 58px;
    border-radius: 50%;
    background: linear-gradient(135deg, #f59e0b, #d97706);
    border: none;
    cursor: pointer;
    font-size: 1.6rem;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8px 28px rgba(245,158,11,0.5), 0 2px 8px rgba(0,0,0,0.3);
    transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s;
    position: relative;
}
#bellyBotToggle:hover {
    transform: scale(1.12) rotate(-5deg);
    box-shadow: 0 12px 40px rgba(245,158,11,0.65);
}
#bellyBotToggle.open {
    background: linear-gradient(135deg, #ef4444, #dc2626);
    transform: scale(1.05);
}
.bb-toggle-icon { line-height: 1; transition: all 0.2s; }
.bb-badge {
    position: absolute;
    top: -3px; right: -3px;
    width: 18px; height: 18px;
    background: #ef4444;
    border-radius: 50%;
    font-size: 0.68rem;
    font-weight: 700;
    color: #fff;
    display: flex; align-items: center; justify-content: center;
    font-family: 'DM Mono', monospace;
    border: 2px solid #06090f;
    animation: bbBadgePulse 2s ease-in-out infinite;
}
@keyframes bbBadgePulse {
    0%,100% { transform: scale(1); }
    50%     { transform: scale(1.2); }
}

/* Chat Window */
#bellyBotWindow {
    position: absolute;
    bottom: 70px;
    left: 0;
    width: 340px;
    max-height: 500px;
    background: #0d1929;
    border: 1px solid rgba(245,158,11,0.2);
    border-radius: 20px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    box-shadow: 0 24px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(245,158,11,0.08);
    animation: bbWindowIn 0.3s cubic-bezier(0.34,1.56,0.64,1);
    transform-origin: bottom left;
}
#bellyBotWindow.hidden {
    display: none;
}
@keyframes bbWindowIn {
    from { transform: scale(0.85) translateY(20px); opacity: 0; }
    to   { transform: none; opacity: 1; }
}

/* Header */
.bb-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px;
    background: linear-gradient(135deg, rgba(245,158,11,0.15), rgba(217,119,6,0.08));
    border-bottom: 1px solid rgba(245,158,11,0.12);
    flex-shrink: 0;
}
.bb-header-info { display: flex; align-items: center; gap: 10px; }
.bb-avatar {
    width: 38px; height: 38px;
    border-radius: 50%;
    background: linear-gradient(135deg, #f59e0b, #d97706);
    display: flex; align-items: center; justify-content: center;
    font-size: 1.4rem;
    box-shadow: 0 0 12px rgba(245,158,11,0.4);
    animation: bbAvatarBob 3s ease-in-out infinite;
}
@keyframes bbAvatarBob {
    0%,100% { transform: translateY(0); }
    50%     { transform: translateY(-3px); }
}
.bb-name {
    font-family: 'Bebas Neue', cursive;
    font-size: 1.05rem;
    letter-spacing: 0.08em;
    color: #fff;
}
.bb-status {
    display: flex; align-items: center; gap: 5px;
    font-size: 0.68rem; color: rgba(255,255,255,0.5);
    font-family: 'DM Mono', monospace;
    letter-spacing: 0.05em;
}
.bb-status-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: #10b981;
    box-shadow: 0 0 6px #10b981;
    animation: bbStatusPulse 2s ease-in-out infinite;
}
@keyframes bbStatusPulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
.bb-close {
    background: rgba(255,255,255,0.08);
    border: none;
    width: 28px; height: 28px;
    border-radius: 50%;
    color: rgba(255,255,255,0.5);
    font-size: 0.85rem;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.2s;
}
.bb-close:hover { background: rgba(239,68,68,0.2); color: #ef4444; }

/* Messages area */
.bb-messages {
    flex: 1;
    overflow-y: auto;
    padding: 14px 12px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    min-height: 0;
    scroll-behavior: smooth;
}
.bb-messages::-webkit-scrollbar { width: 3px; }
.bb-messages::-webkit-scrollbar-thumb { background: rgba(245,158,11,0.3); border-radius: 9999px; }

/* Message bubbles */
.bb-msg {
    display: flex;
    gap: 8px;
    align-items: flex-end;
    animation: bbMsgIn 0.3s cubic-bezier(0.25,0.1,0.25,1);
}
@keyframes bbMsgIn {
    from { opacity: 0; transform: translateY(10px) scale(0.95); }
    to   { opacity: 1; transform: none; }
}
.bb-msg.user { flex-direction: row-reverse; }

.bb-bubble {
    max-width: 78%;
    padding: 10px 13px;
    border-radius: 16px;
    font-size: 0.83rem;
    line-height: 1.55;
    word-wrap: break-word;
}
.bb-msg.bot .bb-bubble {
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.08);
    color: #e8e0d0;
    border-bottom-left-radius: 4px;
}
.bb-msg.user .bb-bubble {
    background: linear-gradient(135deg, #f59e0b, #d97706);
    color: #000;
    font-weight: 500;
    border-bottom-right-radius: 4px;
}
.bb-msg-time {
    font-size: 0.6rem;
    color: rgba(255,255,255,0.25);
    font-family: 'DM Mono', monospace;
    padding: 0 4px;
    flex-shrink: 0;
}

/* Bot mini avatar in message */
.bb-msg-avatar {
    width: 26px; height: 26px;
    border-radius: 50%;
    background: linear-gradient(135deg, #f59e0b, #d97706);
    display: flex; align-items: center; justify-content: center;
    font-size: 0.9rem;
    flex-shrink: 0;
}

/* Typing indicator */
.bb-typing {
    display: flex;
    gap: 8px;
    align-items: flex-end;
    animation: bbMsgIn 0.3s ease;
}
.bb-typing-bubble {
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 16px;
    border-bottom-left-radius: 4px;
    padding: 12px 16px;
    display: flex; gap: 5px; align-items: center;
}
.bb-typing-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: rgba(245,158,11,0.6);
    animation: bbDot 1.2s ease-in-out infinite;
}
.bb-typing-dot:nth-child(2) { animation-delay: 0.2s; }
.bb-typing-dot:nth-child(3) { animation-delay: 0.4s; }
@keyframes bbDot {
    0%,60%,100% { transform: translateY(0); opacity:0.4; }
    30%         { transform: translateY(-6px); opacity:1; }
}

/* Quick replies */
.bb-quick-replies {
    display: flex;
    gap: 6px;
    padding: 8px 12px;
    overflow-x: auto;
    flex-shrink: 0;
    border-top: 1px solid rgba(255,255,255,0.05);
}
.bb-quick-replies::-webkit-scrollbar { display: none; }
.bb-quick {
    white-space: nowrap;
    padding: 6px 12px;
    background: rgba(245,158,11,0.1);
    border: 1px solid rgba(245,158,11,0.2);
    border-radius: 9999px;
    color: #f59e0b;
    font-size: 0.72rem;
    font-family: 'DM Mono', monospace;
    cursor: pointer;
    transition: all 0.2s;
    flex-shrink: 0;
}
.bb-quick:hover {
    background: #f59e0b;
    color: #000;
    border-color: #f59e0b;
    transform: translateY(-1px);
}

/* Input row */
.bb-input-row {
    display: flex;
    gap: 8px;
    padding: 10px 12px;
    border-top: 1px solid rgba(255,255,255,0.07);
    flex-shrink: 0;
    background: rgba(0,0,0,0.2);
}
.bb-input {
    flex: 1;
    padding: 9px 13px;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 9999px;
    color: #fff;
    font-size: 0.82rem;
    font-family: 'Lora', serif;
    outline: none;
    transition: border-color 0.2s;
}
.bb-input:focus { border-color: rgba(245,158,11,0.5); }
.bb-input::placeholder { color: rgba(255,255,255,0.25); }
.bb-send {
    width: 36px; height: 36px;
    border-radius: 50%;
    background: linear-gradient(135deg, #f59e0b, #d97706);
    border: none;
    color: #000;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    transition: transform 0.2s, box-shadow 0.2s;
    box-shadow: 0 4px 14px rgba(245,158,11,0.4);
}
.bb-send:hover { transform: scale(1.1); box-shadow: 0 6px 20px rgba(245,158,11,0.6); }
.bb-send:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }

/* Error message style */
.bb-bubble.bb-error {
    background: rgba(239,68,68,0.1);
    border-color: rgba(239,68,68,0.2);
    color: #fca5a5;
}

/* Mobile adjustments */
@media (max-width: 480px) {
    #bellyBotWidget { left: 12px; bottom: 80px; }
    #bellyBotWindow { width: calc(100vw - 24px); left: 0; }
    #bellyBotToggle { width: 50px; height: 50px; font-size: 1.4rem; }
}
    `;
    document.head.appendChild(style);
}

// ── EVENT BINDINGS ─────────────────────────────────────
function bindChatbotEvents() {
    // Close on Escape
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && chatbotOpen) toggleChatbot();
    });
}

// ── TOGGLE ─────────────────────────────────────────────
function toggleChatbot() {
    chatbotOpen = !chatbotOpen;
    const win    = document.getElementById('bellyBotWindow');
    const toggle = document.getElementById('bellyBotToggle');
    const badge  = document.getElementById('bbBadge');
    const iconOpen   = toggle.querySelector('.bb-icon-open');
    const iconClosed = toggle.querySelector('.bb-icon-closed');

    if (chatbotOpen) {
        win.classList.remove('hidden');
        toggle.classList.add('open');
        iconOpen.classList.remove('hidden');
        iconClosed.classList.add('hidden');
        badge.classList.add('hidden');
        scrollToBottom();
        document.getElementById('bbInput').focus();
    } else {
        win.classList.add('hidden');
        toggle.classList.remove('open');
        iconOpen.classList.add('hidden');
        iconClosed.classList.remove('hidden');
    }
}

// ── SEND MESSAGE ──────────────────────────────────────
async function sendChatMessage() {
    const input = document.getElementById('bbInput');
    const text  = input.value.trim();
    if (!text || chatbotTyping) return;

    input.value = '';
    addUserMessage(text);
    await getBotReply(text);
}

function sendQuickReply(text) {
    if (chatbotTyping) return;
    // Hide quick replies after first use
    const qr = document.getElementById('bbQuickReplies');
    if (qr) qr.style.display = 'none';
    addUserMessage(text);
    getBotReply(text);
}

// ── ADD USER MESSAGE ───────────────────────────────────
function addUserMessage(text) {
    const container = document.getElementById('bbMessages');
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const div = document.createElement('div');
    div.className = 'bb-msg user';
    div.innerHTML = `
        <span class="bb-msg-time">${time}</span>
        <div class="bb-bubble">${escapeHTML(text)}</div>
    `;
    container.appendChild(div);
    scrollToBottom();
    chatHistory.push({ role: 'user', content: text });
}

// ── ADD BOT MESSAGE ────────────────────────────────────
function addBotMessage(text, isError = false) {
    const container = document.getElementById('bbMessages');
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const div = document.createElement('div');
    div.className = 'bb-msg bot';
    div.innerHTML = `
        <div class="bb-msg-avatar">🐻</div>
        <div class="bb-bubble${isError ? ' bb-error' : ''}">${text}</div>
        <span class="bb-msg-time">${time}</span>
    `;
    container.appendChild(div);
    scrollToBottom();

    // Show badge if chat closed
    if (!chatbotOpen) {
        const badge = document.getElementById('bbBadge');
        if (badge) badge.classList.remove('hidden');
    }
}

// ── TYPING INDICATOR ───────────────────────────────────
function showTyping() {
    const container = document.getElementById('bbMessages');
    const div = document.createElement('div');
    div.className = 'bb-typing';
    div.id = 'bbTypingIndicator';
    div.innerHTML = `
        <div class="bb-msg-avatar">🐻</div>
        <div class="bb-typing-bubble">
            <div class="bb-typing-dot"></div>
            <div class="bb-typing-dot"></div>
            <div class="bb-typing-dot"></div>
        </div>
    `;
    container.appendChild(div);
    scrollToBottom();
}

function hideTyping() {
    document.getElementById('bbTypingIndicator')?.remove();
}

// ── SCROLL TO BOTTOM ───────────────────────────────────
function scrollToBottom() {
    const container = document.getElementById('bbMessages');
    if (container) container.scrollTop = container.scrollHeight;
}

// ── GET BOT REPLY FROM CLAUDE API ─────────────────────
async function getBotReply(userText) {
    chatbotTyping = true;
    const sendBtn = document.querySelector('.bb-send');
    const input   = document.getElementById('bbInput');
    if (sendBtn) sendBtn.disabled = true;
    if (input)   input.disabled  = true;

    showTyping();

    try {
        // Keep last 10 messages for context (5 exchanges)
        const recentHistory = chatHistory.slice(-10);

        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'claude-sonnet-4-20250514',
                max_tokens: 300,
                system: CHATBOT_SYSTEM_PROMPT,
                messages: recentHistory
            })
        });

        if (!response.ok) throw new Error(`API error: ${response.status}`);

        const data = await response.json();
        const reply = data.content?.[0]?.text || "Hmm, something went wrong. Try asking again! 🐻";

        hideTyping();
        addBotMessage(reply);
        chatHistory.push({ role: 'assistant', content: reply });

    } catch (err) {
        console.error('BellyBot API error:', err);
        hideTyping();
        addBotMessage(
            err.message.includes('401') || err.message.includes('403')
                ? "Oops! Bot setup issue. Join our <a href='https://t.me/bellybears_bot' target='_blank' style='color:#f59e0b;'>Telegram</a> for help! 🐻"
                : "Sorry, I'm taking a honey break 🍯 Try again in a moment, or join our <a href='https://t.me/bellybears_bot' target='_blank' style='color:#f59e0b;'>Telegram</a>!",
            false
        );
    } finally {
        chatbotTyping = false;
        if (sendBtn) sendBtn.disabled = false;
        if (input)   input.disabled  = false;
        input?.focus();
    }
}

// ── HELPERS ────────────────────────────────────────────
function escapeHTML(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}