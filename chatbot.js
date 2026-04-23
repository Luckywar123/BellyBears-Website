/* ═══════════════════════════════════════════════════════
   BELLY BEARS — CHATBOT.JS
   BellyBot — AI-style assistant (NO external API)
   Keyword-based response engine, bear-themed
   Works 100% offline / client-side
═══════════════════════════════════════════════════════ */

// ── RESPONSE DATABASE ──────────────────────────────────
const BB_RESPONSES = [
    {
        keywords: ['whitelist', 'wl', 'whitelisted', 'how to get wl', 'get wl'],
        reply: `To get whitelisted, you need to complete 4 tasks + reach Top 100 in the Telegram game! 🐻\n\n1️⃣ Follow @belly_bears on X\n2️⃣ Join Telegram at t.me/bellybears_bot\n3️⃣ Share your bear on X (tag @belly_bears)\n4️⃣ Play the game & reach Top 100 Daily\n\n💡 Bonus: Repost the pinned tweet to unlock the secret Honey Vault easter egg! 46 WL spots remaining!`
    },
    {
        keywords: ['mint price', 'price', 'cost', 'how much', 'wl price', 'public price'],
        reply: `Here's the mint pricing breakdown 🍯\n\n🎟️ WL Mint: 0.5 ETH\n🌐 Public Mint: 0.8 ETH\n👜 Max 3 NFTs per wallet\n\nWhitelist saves you 0.3 ETH — definitely worth it! 🐻⭐`
    },
    {
        keywords: ['mint date', 'when mint', 'launch', 'release', 'q3', 'july'],
        reply: `Mint is targeting Q3 2026 — aiming for July 2026! 🐻\n\nMake sure you're on the whitelist so you get early access at 0.5 ETH before the public price of 0.8 ETH. Don't sleep on it! 🍯`
    },
    {
        keywords: ['belly pass', 'bellypass', 'power up', 'powerup', 'combo', 'shield', 'magnet'],
        reply: `Belly Pass is your in-game power-up subscription! ⚡\n\n💰 Cost: 2 USDC for 3 days\n🎮 Power-ups included:\n   • Combo Master — double coins\n   • Shield ×3 — protect your score\n   • Coin Magnet — 60 seconds of magnet mode\n\nPaid with USDC on Base network, linked to your Telegram account. 🐻`
    },
    {
        keywords: ['roadmap', 'phases', 'phase', 'future', 'plans', 'next'],
        reply: `Here's what's ahead for Belly Bears! 🗺️\n\n✅ Phase 1 (Q2 2026 — LIVE): Game, community, tasks, Belly Pass — 80% done\n🔜 Phase 2 (Q3 2026): NFT mint, holder dashboard, OpenSea\n🔮 Phase 3 (Q4 2026): NFT Staking, $BELLY rewards, airdrops, merch\n🚀 Phase 4 (Q1 2027): CEX listing, metaverse, $BELLY token\n🌍 Phase 5 (2027+): IRL events, DAO, comic & animation`
    },
    {
        keywords: ['referral', 'refer', 'invite', 'friend', 'bonus', 'earn'],
        reply: `Referrals are a great way to earn! 🐻🍯\n\nShare your referral link and when a friend mints, you BOTH get a 0.02 ETH bonus!\n\nTo get your link:\n1. Connect your wallet on the website\n2. Enter your Telegram username\n3. Share your unique referral link\n\nLet's grow the den together! 🐻`
    },
    {
        keywords: ['blockchain', 'base', 'network', 'chain', 'ethereum', 'l2', 'layer'],
        reply: `Belly Bears is on the Base blockchain! ⭐\n\nBase is Coinbase's Layer 2 on Ethereum — fast, cheap, and reliable.\n\n👜 Recommended: Coinbase Wallet (native Base support)\n✅ Also works with: MetaMask, Rabby\n\nMake sure you're on the Base network when minting! 🐻`
    },
    {
        keywords: ['wallet', 'metamask', 'coinbase wallet', 'rabby', 'connect'],
        reply: `For the best experience, use Coinbase Wallet since it has native Base support! 🐻\n\nYou can also use MetaMask or Rabby — just make sure to switch to the Base network before minting.\n\nNeed help setting up? Visit belly-bears.xyz or ask in our Telegram! 🍯`
    },
    {
        keywords: ['supply', 'collection', 'how many', 'total', '2222', 'nft'],
        reply: `Belly Bears is a collection of 2,222 hand-crafted Legendary Bears on Base blockchain! 🐻⭐\n\nEach bear is uniquely designed — no two are the same. The collection is built for long-term holders with staking, rewards, and DAO coming in later phases! 🍯`
    },
    {
        keywords: ['game', 'telegram', 'telegram game', 'play', 't.me', 'bot'],
        reply: `The Belly Bears Telegram Mini Game is LIVE now! 🎮🐻\n\n▶️ Play at: t.me/bellybears_bot\n\nReach Top 100 daily to unlock your whitelist spot!\n\nYou can also get Belly Pass (2 USDC / 3 days) for power-ups like double coins, shields, and coin magnet mode! ⚡`
    },
    {
        keywords: ['twitter', 'x', 'social', 'follow', '@belly_bears'],
        reply: `Follow us on X (Twitter) at @belly_bears for the latest news, announcements, and WL opportunities! 🐻\n\nIt's also one of the required tasks to get on the whitelist, so make sure you follow + share your bear! ⭐`
    },
    {
        keywords: ['website', 'site', 'link', 'belly-bears'],
        reply: `Our official website is belly-bears.xyz 🍯\n\nHead there to:\n• Complete WL tasks\n• Get your referral link\n• Connect your wallet\n• Track your whitelist progress\n\nSee you there, bear! 🐻`
    },
    {
        keywords: ['team', 'founder', 'who made', 'developers', 'dev', 'artist'],
        reply: `Meet the Belly Bears team! 🐻\n\n🧠 Chubby Founder — vision & leadership\n🎨 Pixel Bear — art & design\n🎮 Game Dev Bear — Telegram game\n📣 Marketing Bear — growth & community\n\nA small but mighty den of bears building something special! 🍯`
    },
    {
        keywords: ['staking', 'stake', '$belly', 'token', 'rewards', 'airdrop'],
        reply: `Staking and $BELLY token rewards are coming in Phase 3 (Q4 2026)! 🍯\n\nHolders will earn $BELLY in-game rewards, get airdrops, and access exclusive merch.\n\nThe $BELLY token goes fully live in Phase 4 (Q1 2027) with CEX listing and metaverse integration! 🐻⭐`
    },
    {
        keywords: ['opensea', 'marketplace', 'secondary', 'trade', 'buy', 'sell'],
        reply: `Belly Bears will be listed on OpenSea in Phase 2 (Q3 2026) alongside the NFT mint! ⭐\n\nAfter mint, you'll be able to trade your bears on the secondary market. Hold tight — we're almost there! 🐻🍯`
    },
    {
        keywords: ['spots', 'remaining', 'left', 'available', 'how many spots'],
        reply: `Only 46 WL spots remaining! 🐻 Don't wait too long!\n\nComplete the 4 tasks + reach Top 100 in the Telegram game to secure your spot before they're gone. 🍯⭐`
    },
    {
        keywords: ['hello', 'hi', 'hey', 'sup', 'what\'s up', 'gm', 'good morning', 'yo'],
        reply: `Hey hey! Welcome to the den! 🐻🍯\n\nI'm BellyBot, your guide to everything Belly Bears! Ask me about the whitelist, mint price, Belly Pass, roadmap, or anything else — I'm here to help! ⭐`
    },
    {
        keywords: ['thanks', 'thank you', 'ty', 'thx', 'appreciate'],
        reply: `Anytime, bear! 🐻🍯 That's what I'm here for!\n\nIf you have more questions, don't hesitate to ask. And join the Telegram at t.me/bellybears_bot to connect with the community! ⭐`
    },
    {
        keywords: ['help', 'what can you do', 'commands', 'what do you know'],
        reply: `I can answer questions about Belly Bears! 🐻 Try asking about:\n\n🎟️ Whitelist & how to get WL\n💰 Mint price & date\n⚡ Belly Pass power-ups\n🗺️ Roadmap & future phases\n🎮 The Telegram game\n👜 Wallets & Base blockchain\n💸 Referral bonuses\n\nJust ask away! 🍯`
    },
    {
        keywords: ['usdc', 'payment', 'pay', 'currency'],
        reply: `Belly Pass is purchased with USDC on the Base network! 💰\n\nJust 2 USDC gets you 3 days of power-ups — double coins, shields, and coin magnet mode.\n\nFor NFT minting, you'll pay in ETH (0.5 ETH WL / 0.8 ETH public). 🐻`
    }
];

// Fallback replies for unrecognized input
const BB_FALLBACKS = [
    "Hmm, I'm not sure about that one! 🐻 Try asking about the whitelist, mint price, Belly Pass, or roadmap — or join our Telegram at t.me/bellybears_bot for more help! 🍯",
    "Great question, but that's beyond my honey jar! 🍯 For the latest info, check belly-bears.xyz or reach out on Telegram at t.me/bellybears_bot! 🐻",
    "I don't have an answer for that just yet! 🐻 Ask me about the WL, mint, game, or roadmap — or hop into our Telegram community for help! ⭐"
];

let bbFallbackIndex = 0;
let chatbotOpen     = false;
let chatbotTyping   = false;

// ── RESPONSE MATCHER ──────────────────────────────────
function getBotResponse(userText) {
    const lower = userText.toLowerCase();

    for (const entry of BB_RESPONSES) {
        if (entry.keywords.some(kw => lower.includes(kw))) {
            return entry.reply;
        }
    }

    // Rotate through fallbacks
    const fallback = BB_FALLBACKS[bbFallbackIndex % BB_FALLBACKS.length];
    bbFallbackIndex++;
    return fallback;
}

// ── INIT ──────────────────────────────────────────────
function initChatbot() {
    injectChatbotHTML();
    injectChatbotCSS();
    bindChatbotEvents();

    setTimeout(() => {
        addBotMessage("Hey there! I'm BellyBot 🐻 — your guide to the Belly Bears universe. Ask me anything about the NFT, whitelist, game, or Belly Pass! 🍯");
    }, 500);
}

// ── HTML INJECTION ────────────────────────────────────
function injectChatbotHTML() {
    const html = `
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
                            Online · Belly Bears Assistant
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
#bellyBotWindow.hidden { display: none; }
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
    white-space: pre-line;
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
function sendChatMessage() {
    const input = document.getElementById('bbInput');
    const text  = input.value.trim();
    if (!text || chatbotTyping) return;

    input.value = '';
    addUserMessage(text);
    simulateBotReply(text);
}

function sendQuickReply(text) {
    if (chatbotTyping) return;
    const qr = document.getElementById('bbQuickReplies');
    if (qr) qr.style.display = 'none';
    addUserMessage(text);
    simulateBotReply(text);
}

// ── SIMULATE TYPING + REPLY ────────────────────────────
function simulateBotReply(userText) {
    chatbotTyping = true;
    const sendBtn = document.querySelector('.bb-send');
    const input   = document.getElementById('bbInput');
    if (sendBtn) sendBtn.disabled = true;
    if (input)   input.disabled  = true;

    showTyping();

    // Simulate realistic typing delay (600–1200ms)
    const delay = 600 + Math.random() * 600;
    setTimeout(() => {
        hideTyping();
        const reply = getBotResponse(userText);
        addBotMessage(reply);

        chatbotTyping = false;
        if (sendBtn) sendBtn.disabled = false;
        if (input) {
            input.disabled = false;
            input.focus();
        }
    }, delay);
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
}

// ── ADD BOT MESSAGE ────────────────────────────────────
function addBotMessage(text) {
    const container = document.getElementById('bbMessages');
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const div = document.createElement('div');
    div.className = 'bb-msg bot';
    div.innerHTML = `
        <div class="bb-msg-avatar">🐻</div>
        <div class="bb-bubble">${escapeHTML(text)}</div>
        <span class="bb-msg-time">${time}</span>
    `;
    container.appendChild(div);
    scrollToBottom();

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

// ── HELPERS ────────────────────────────────────────────
function escapeHTML(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}