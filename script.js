/* ═══════════════════════════════════════════════════════
   BELLY BEARS — SCRIPT.JS
   Base Chain • Wallet Module • Supabase • Animations
═══════════════════════════════════════════════════════ */

// ── CONFIG ──────────────────────────────────────────────
const SUPABASE_URL     = 'https://tfdxmqvkkiidujrunfcp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmZHhtcXZra2lpZHVqcnVuZmNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0MjI5MTksImV4cCI6MjA4ODk5ODkxOX0.hKf_DquWy9dosADgAHedk7qyN4QPX31k8upzW4SDK3Q';

// Base chain config
const BASE_CHAIN_ID    = 8453;
const BASE_RPC         = 'https://mainnet.base.org';
const BASE_EXPLORER    = 'https://basescan.org';

// USDC on Base
const USDC_BASE        = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
// Treasury wallet — GANTI dengan address kamu
const TREASURY_ADDRESS = '0xedf790A178cb47002309F28315c76155152b1EDb';

const USDC_ABI = [
    'function transfer(address to, uint256 amount) returns (bool)',
    'function decimals() view returns (uint8)',
    'function balanceOf(address owner) view returns (uint256)'
];

// ── STATE ────────────────────────────────────────────────
let supabaseClient    = null;
let userWalletAddress = null;
let currentStep       = 1;
let walletConnected   = false;
let currentPassTxHash = null;
let isMusicPlaying    = false;

const TASKS_KEY = 'bellyBearsTasks';

let tasks = [
    { id: 1, title: 'Follow @belly_bears on X',              link: 'https://x.com/belly_bears',    completed: false },
    { id: 2, title: 'Join the Telegram Community',           link: 'https://t.me/bellybears_bot',  completed: false },
    { id: 3, title: 'Share your bear on X (tag @belly_bears)', link: 'https://x.com/belly_bears',  completed: false },
    { id: 4, title: 'Play Game & Reach Top 100 Daily',       gameTask: true,                        completed: false }
];

// ════════════════════════════════════════════════════════
// INIT
// ════════════════════════════════════════════════════════
window.addEventListener('DOMContentLoaded', () => {
    initSupabase();
    initCursor();
    initNavbar();
    initHeroParticles();
    initFireflies();
    initUniverseScene();
    initScrollReveal();
    loadTasks();
    renderTasksSection();
    animateProgress();
    fetchLeaderboard();
    initRandBearNumber();

    const saved = loadWalletSession();
    if (saved) {
        userWalletAddress = saved;
        walletConnected   = true;
        updateWalletUI();
        checkMyPass();
    }

    // Live minted counter
    setInterval(() => {
        const el = document.getElementById('mintedHero');
        const el2 = document.getElementById('mintedUniverse');
        if (el) {
            const v = parseInt(el.textContent) || 291;
            if (v < 350) {
                const nv = v + Math.floor(Math.random() * 2);
                el.textContent  = nv;
                if (el2) el2.textContent = nv;
            }
        }
    }, 9000);

    console.log('%c🐻 Belly Bears READY', 'color:#f59e0b;font-size:16px;font-weight:bold');
});

// ════════════════════════════════════════════════════════
// SUPABASE
// ════════════════════════════════════════════════════════
function initSupabase() {
    try {
        const { createClient } = supabase;
        supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('✅ Supabase ready');
    } catch (e) {
        console.error('❌ Supabase init failed:', e);
    }
}

// ════════════════════════════════════════════════════════
// CUSTOM CURSOR
// ════════════════════════════════════════════════════════
function initCursor() {
    const cursor   = document.getElementById('cursor');
    const follower = document.getElementById('cursorFollower');
    if (!cursor || !follower) return;

    let mouseX = 0, mouseY = 0;
    let fX = 0, fY = 0;

    document.addEventListener('mousemove', e => {
        mouseX = e.clientX; mouseY = e.clientY;
        cursor.style.left = mouseX + 'px';
        cursor.style.top  = mouseY + 'px';
    });

    // Follower with lerp
    (function animFollower() {
        fX += (mouseX - fX) * 0.15;
        fY += (mouseY - fY) * 0.15;
        follower.style.left = fX + 'px';
        follower.style.top  = fY + 'px';
        requestAnimationFrame(animFollower);
    })();

    // Scale on hover
    document.querySelectorAll('a, button, .task-card, .wallet-option').forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.style.transform    = 'translate(-50%,-50%) scale(2.5)';
            follower.style.transform  = 'translate(-50%,-50%) scale(0.5)';
            follower.style.opacity    = '0.4';
        });
        el.addEventListener('mouseleave', () => {
            cursor.style.transform    = 'translate(-50%,-50%) scale(1)';
            follower.style.transform  = 'translate(-50%,-50%) scale(1)';
            follower.style.opacity    = '1';
        });
    });
}

// ════════════════════════════════════════════════════════
// NAVBAR SCROLL
// ════════════════════════════════════════════════════════
function initNavbar() {
    const nav = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        nav.classList.toggle('scrolled', window.scrollY > 40);
    });
}

function toggleMobileMenu() {
    document.getElementById('mobileMenu').classList.toggle('active');
}

// ════════════════════════════════════════════════════════
// HERO PARTICLES
// ════════════════════════════════════════════════════════
function initHeroParticles() {
    const container = document.getElementById('heroParticles');
    if (!container) return;
    for (let i = 0; i < 40; i++) {
        const p = document.createElement('div');
        p.className = 'hero-particle';
        p.style.cssText = `
            left: ${Math.random() * 100}%;
            bottom: ${Math.random() * 30}%;
            animation-duration: ${6 + Math.random() * 10}s;
            animation-delay: ${Math.random() * 8}s;
            width: ${1 + Math.random() * 3}px;
            height: ${1 + Math.random() * 3}px;
        `;
        container.appendChild(p);
    }
}

// ════════════════════════════════════════════════════════
// FIREFLIES
// ════════════════════════════════════════════════════════
function initFireflies() {
    const container = document.getElementById('fireflies');
    if (!container) return;
    for (let i = 0; i < 18; i++) {
        const f = document.createElement('div');
        f.className = 'firefly';
        f.style.cssText = `
            left: ${Math.random() * 100}%;
            top: ${20 + Math.random() * 60}%;
            animation-duration: ${3 + Math.random() * 5}s;
            animation-delay: ${Math.random() * 6}s;
        `;
        container.appendChild(f);
    }
}

// ════════════════════════════════════════════════════════
// UNIVERSE SCENE (stars, leaves)
// ════════════════════════════════════════════════════════
function initUniverseScene() {
    // Stars
    const starsLayer = document.getElementById('starsLayer');
    if (starsLayer) {
        for (let i = 0; i < 120; i++) {
            const s = document.createElement('div');
            s.className = 'star';
            const size = 1 + Math.random() * 2.5;
            s.style.cssText = `
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 60}%;
                width: ${size}px; height: ${size}px;
                animation-duration: ${2 + Math.random() * 4}s;
                animation-delay: ${Math.random() * 5}s;
            `;
            starsLayer.appendChild(s);
        }
    }

    // Falling leaves
    const leavesContainer = document.getElementById('leavesContainer');
    if (leavesContainer) {
        for (let i = 0; i < 20; i++) {
            const l = document.createElement('div');
            l.className = 'leaf';
            const hues = ['#15803d','#166534','#4ade80','#22c55e'];
            l.style.cssText = `
                left: ${Math.random() * 100}%;
                animation-duration: ${6 + Math.random() * 8}s;
                animation-delay: ${Math.random() * 8}s;
                background: ${hues[Math.floor(Math.random() * hues.length)]};
                width: ${8 + Math.random() * 10}px;
                height: ${5 + Math.random() * 6}px;
            `;
            leavesContainer.appendChild(l);
        }
    }
}

// ════════════════════════════════════════════════════════
// SCROLL REVEAL
// ════════════════════════════════════════════════════════
function initScrollReveal() {
    const observer = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add('revealed');
                observer.unobserve(e.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right').forEach(el => {
        observer.observe(el);
    });
}

// ════════════════════════════════════════════════════════
// LEADERBOARD
// ════════════════════════════════════════════════════════
async function fetchLeaderboard() {
    const container = document.getElementById('leaderboardDemo');
    if (!container || !supabaseClient) return;

    try {
        const { data, error } = await supabaseClient
            .from('highscores')
            .select('username, best_score')
            .order('best_score', { ascending: false })
            .limit(3);

        if (error || !data || data.length === 0) {
            container.innerHTML = '<div style="color:var(--muted);text-align:center;padding:12px;font-size:0.85rem;">No data yet</div>';
            return;
        }

        const medals = ['🥇','🥈','🥉'];
        container.innerHTML = data.map((p, i) => `
            <div class="mini-lb-row">
                <div style="display:flex;align-items:center;gap:10px;">
                    <span style="font-size:1.1rem;">${medals[i]}</span>
                    <span class="mini-lb-rank">#${i+1}</span>
                    <span style="font-size:0.88rem;">${p.username || 'Bear'}</span>
                </div>
                <span style="font-family:var(--font-mono);font-size:0.85rem;color:var(--amber);">${p.best_score} pts</span>
            </div>
        `).join('');
    } catch (err) {
        container.innerHTML = '<div style="color:var(--muted);text-align:center;padding:12px;font-size:0.85rem;">Unable to load</div>';
    }
}

// ════════════════════════════════════════════════════════
// TASKS
// ════════════════════════════════════════════════════════
function loadTasks() {
    const saved = localStorage.getItem(TASKS_KEY);
    if (saved) {
        const parsed = JSON.parse(saved);
        tasks = tasks.map(t => {
            const s = parsed.find(x => x.id === t.id);
            return s ? { ...t, completed: s.completed } : t;
        });
    }
}

function saveTasks() {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
}

function renderTasksSection() {
    const container = document.getElementById('tasksList');
    if (!container) return;
    container.innerHTML = tasks.map(task => `
        <div class="task-card ${task.completed ? 'completed' : ''}">
            <div class="task-status">
                ${task.completed ? '✅' : ''}
            </div>
            <div class="task-info">
                <div class="task-title">${task.title}</div>
            </div>
            <div class="task-action">
                ${task.completed
                    ? `<span style="font-family:var(--font-mono);font-size:0.78rem;color:var(--emerald);">DONE</span>`
                    : task.gameTask
                        ? `<button onclick="claimGameWL()">Verify WL</button>`
                        : `<a href="${task.link}" target="_blank" onclick="markTask(${task.id})">Do Task</a>`
                }
            </div>
        </div>
    `).join('');
    animateProgress();
    updateWlStatus();
}

function animateProgress() {
    const done  = tasks.filter(t => t.completed).length;
    const total = tasks.length;
    const circle = document.getElementById('progressCircle');
    const text   = document.getElementById('progressText');
    if (!circle || !text) return;
    const circumference = 314.16;
    const pct = done / total;
    circle.style.strokeDashoffset = circumference * (1 - pct);
    text.textContent = `${done}/${total}`;
}

function markTask(id) {
    const t = tasks.find(t => t.id === id);
    if (t) { t.completed = true; saveTasks(); renderTasksSection(); renderModalTasks(); }
}

function claimGameWL() {
    const t = tasks.find(t => t.gameTask);
    if (t) {
        t.completed = true; saveTasks(); renderTasksSection(); renderModalTasks();
        launchConfetti();
        showToast('🎉 Game WL Claimed! Spot secured.', 3000);
    }
}

function updateWlStatus() {
    const done = tasks.filter(t => t.completed).length;
    const el   = document.getElementById('wlStatus');
    if (el) {
        el.textContent = done >= 2
            ? `✅ Eligible (${done}/4 tasks)`
            : `⏳ ${done}/4 tasks done`;
        el.style.color = done >= 2 ? 'var(--emerald)' : 'var(--amber)';
    }
}

function renderModalTasks() {
    const container = document.getElementById('modalTasksList');
    if (!container) return;
    container.innerHTML = tasks.map(task => `
        <div class="modal-task-row">
            <span>${task.completed ? '✅' : '⬜'} ${task.title}</span>
            ${!task.completed && !task.gameTask
                ? `<button class="btn-sm-amber" onclick="markTask(${task.id})">Mark Done</button>`
                : task.completed
                    ? `<span style="color:var(--emerald);font-size:0.8rem;font-family:var(--font-mono);">DONE</span>`
                    : ''
            }
        </div>
    `).join('');
}

// ════════════════════════════════════════════════════════
// WALLET MODULE — Base Chain
// ════════════════════════════════════════════════════════
function openWalletModal() {
    document.getElementById('walletModal').classList.remove('hidden');
}
function closeWalletModal() {
    document.getElementById('walletModal').classList.add('hidden');
}

async function connectWithProvider(type) {
    if (!window.ethereum) {
        // No injected wallet
        if (type === 'metamask') {
            window.open('https://metamask.io/download/', '_blank');
            return;
        } else if (type === 'coinbase') {
            window.open('https://www.coinbase.com/wallet', '_blank');
            return;
        }
        showToast('No wallet extension detected. Please install a wallet.', 3500, 'error');
        return;
    }

    // Coinbase wallet: prefer coinbaseWalletExtension if available
    let provider = window.ethereum;
    if (type === 'coinbase' && window.ethereum.providers) {
        provider = window.ethereum.providers.find(p => p.isCoinbaseWallet) || window.ethereum;
    }
    if (type === 'metamask' && window.ethereum.providers) {
        provider = window.ethereum.providers.find(p => p.isMetaMask) || window.ethereum;
    }

    try {
        closeWalletModal();

        // Request accounts
        await provider.request({ method: 'eth_requestAccounts' });

        // Switch to Base
        const switched = await switchToBase(provider);
        if (!switched) {
            showToast('Please switch to Base network to continue.', 3000, 'error');
            return;
        }

        const ethProvider = new ethers.BrowserProvider(provider);
        const signer      = await ethProvider.getSigner();
        userWalletAddress = await signer.getAddress();
        walletConnected   = true;

        saveWalletSession(userWalletAddress);
        updateWalletUI();
        checkMyPass();

        showToast(`✅ Wallet connected: ${userWalletAddress.slice(0,6)}...${userWalletAddress.slice(-4)}`);

        // Update modal wallet display
        const wad = document.getElementById('walletAddressDisplay');
        if (wad) wad.innerHTML = `✅ ${userWalletAddress.slice(0,6)}...${userWalletAddress.slice(-4)}`;
        const mws = document.getElementById('mintWalletShow');
        if (mws) mws.textContent = userWalletAddress.slice(0,6) + '...' + userWalletAddress.slice(-4);

    } catch (err) {
        console.error('Wallet connect error:', err);
        if (err.code !== 4001) {
            showToast('Connection failed. Please try again.', 3000, 'error');
        }
    }
}

async function switchToBase(provider = window.ethereum) {
    try {
        await provider.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x' + BASE_CHAIN_ID.toString(16) }]
        });
        return true;
    } catch (err) {
        if (err.code === 4902) {
            try {
                await provider.request({
                    method: 'wallet_addEthereumChain',
                    params: [{
                        chainId:           '0x' + BASE_CHAIN_ID.toString(16),
                        chainName:         'Base',
                        rpcUrls:           [BASE_RPC],
                        blockExplorerUrls: [BASE_EXPLORER],
                        nativeCurrency:    { name: 'Ethereum', symbol: 'ETH', decimals: 18 }
                    }]
                });
                return true;
            } catch { return false; }
        }
        return false;
    }
}

function updateWalletUI() {
    const btn = document.getElementById('connectBtn');
    if (!btn) return;
    if (userWalletAddress) {
        btn.innerHTML = `<span class="btn-wallet-dot connected"></span> ${userWalletAddress.slice(0,6)}...${userWalletAddress.slice(-4)} <span onclick="logoutWallet(event)" style="margin-left:8px;font-size:0.7rem;opacity:0.6;text-decoration:underline;">logout</span>`;
        btn.classList.add('connected');
    } else {
        btn.innerHTML = `<span class="btn-wallet-dot"></span> Connect Wallet`;
        btn.classList.remove('connected');
    }
}

function saveWalletSession(addr) { localStorage.setItem('bellyWallet', addr); }
function loadWalletSession()     { return localStorage.getItem('bellyWallet'); }
function logoutWallet(e) {
    if (e) e.stopPropagation();
    localStorage.removeItem('bellyWallet');
    userWalletAddress = null; walletConnected = false;
    updateWalletUI();
    showToast('Wallet disconnected');
}

// ════════════════════════════════════════════════════════
// MINT MODAL
// ════════════════════════════════════════════════════════
function openMintModal() {
    document.getElementById('mintModal').classList.remove('hidden');
    currentStep = 1;
    showMintStep();
    renderModalTasks();
}

function closeMintModal() {
    document.getElementById('mintModal').classList.add('hidden');
}

function showMintStep() {
    [1,2,3].forEach(i => {
        document.getElementById(`stepContent${i}`)?.classList.add('hidden');
        const pill = document.getElementById(`step${i}pill`);
        if (!pill) return;
        if (i < currentStep)      { pill.classList.remove('step-inactive'); pill.textContent = '✓'; pill.classList.add('step-done'); }
        else if (i === currentStep){ pill.classList.remove('step-inactive','step-done'); }
        else                       { pill.classList.add('step-inactive'); pill.classList.remove('step-done'); }
    });
    document.getElementById(`stepContent${currentStep}`)?.classList.remove('hidden');
}

function nextStep() {
    if (currentStep === 1) {
        if (tasks.filter(t => t.completed).length < 2) {
            showToast('Complete at least 2 tasks first!', 2500, 'error'); return;
        }
    }
    currentStep++;
    showMintStep();
}

function submitTasksAndContinue() {
    const username = document.getElementById('tgUsername').value.trim();
    if (!username || !username.startsWith('@')) {
        showToast('Enter your Telegram @username', 2500, 'error'); return;
    }
    nextStep();
}

function initRandBearNumber() {
    const el = document.getElementById('randomBearNumber');
    if (el) el.textContent = Math.floor(Math.random() * 2222) + 1;
}

async function performMint() {
    if (!userWalletAddress) {
        showToast('Connect your wallet first!', 2500, 'error');
        openWalletModal(); return;
    }
    const number     = parseInt(document.getElementById('randomBearNumber').textContent);
    const tgUsername = document.getElementById('tgUsername').value.trim();

    try {
        const { data: existing } = await supabaseClient
            .from('whitelist_claims')
            .select('id')
            .eq('wallet_address', userWalletAddress)
            .maybeSingle();

        if (existing) {
            showToast('This wallet already has a whitelist spot!', 3000, 'error'); return;
        }

        const { error } = await supabaseClient.from('whitelist_claims').insert({
            wallet_address:  userWalletAddress,
            telegram:        tgUsername,
            bear_number:     number,
            tasks_completed: tasks.filter(t => t.completed).length
        });

        if (error) throw error;

        launchConfetti();
        showToast(`🎉 Belly Bear #${number} is yours!`, 4000);
        setTimeout(() => closeMintModal(), 2000);

        const el = document.getElementById('mintedHero');
        if (el) el.textContent = parseInt(el.textContent) + 1;

    } catch (err) {
        console.error(err);
        showToast('Mint failed. Please try again.', 3000, 'error');
    }
}

// ════════════════════════════════════════════════════════
// BELLY PASS
// ════════════════════════════════════════════════════════
function openBellyPassModal() {
    document.getElementById('bellyPassModal').classList.remove('hidden');
    document.getElementById('passStep1')?.classList.remove('hidden');
    document.getElementById('passStep2')?.classList.add('hidden');
}
function closeBellyPassModal() {
    document.getElementById('bellyPassModal').classList.add('hidden');
}

async function buyPassWithUSDC() {
    if (!userWalletAddress) {
        showToast('Connect your wallet first!', 2500, 'error');
        openWalletModal(); return;
    }

    // Ensure Base network
    const switched = await switchToBase();
    if (!switched) {
        showToast('Please switch to Base network!', 2500, 'error'); return;
    }

    const btn = document.querySelector('#passStep1 button');
    const originalText = btn.innerHTML;
    btn.innerHTML = '⏳ Waiting for confirmation...';
    btn.disabled  = true;

    try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer   = await provider.getSigner();
        const contract = new ethers.Contract(USDC_BASE, USDC_ABI, signer);

        // USDC has 6 decimals
        const amount = ethers.parseUnits('2', 6);
        const tx     = await contract.transfer(TREASURY_ADDRESS, amount);
        btn.innerHTML = '⏳ Confirming transaction...';
        await tx.wait();

        currentPassTxHash = tx.hash;
        document.getElementById('passStep1').classList.add('hidden');
        document.getElementById('passStep2').classList.remove('hidden');
        launchConfetti();
        showToast('✅ Payment confirmed! Link your Telegram now.', 4000);

    } catch (err) {
        console.error(err);
        if (err.code === 4001) {
            showToast('Transaction cancelled.', 2500, 'error');
        } else {
            showToast('Payment failed. Check your USDC balance on Base.', 3500, 'error');
        }
    } finally {
        btn.innerHTML = originalText;
        btn.disabled  = false;
    }
}

async function linkTelegramAfterPayment() {
    const username = document.getElementById('passTgUsername').value.trim();
    if (!username || !username.startsWith('@')) {
        showToast('Enter a valid Telegram @username', 2500, 'error'); return;
    }

    const btn = document.querySelector('#passStep2 button');
    const originalText = btn.innerHTML;
    btn.innerHTML = '⏳ Activating...';
    btn.disabled  = true;

    try {
        const expiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
        const { error } = await supabaseClient.from('belly_passes').insert({
            wallet_address:   userWalletAddress,
            telegram_username: username,
            expiry_date:      expiry,
            power_ups:        { combo_master: true, shield: 3, coin_magnet: true },
            active:           true
        });
        if (error) throw error;

        launchConfetti();
        showToast('🎉 Belly Pass activated! Power-ups ready in-game.', 4000);
        closeBellyPassModal();
        checkMyPass();

    } catch (err) {
        console.error(err);
        showToast('Failed to save pass. Please try again.', 3000, 'error');
    } finally {
        btn.innerHTML = originalText;
        btn.disabled  = false;
    }
}

async function checkMyPass() {
    if (!userWalletAddress || !supabaseClient) return;

    const { data } = await supabaseClient
        .from('belly_passes')
        .select('*')
        .eq('wallet_address', userWalletAddress)
        .eq('active', true)
        .order('created_at', { ascending: false })
        .limit(1);

    const card    = document.getElementById('myPassCard');
    const noPass  = document.getElementById('noPassMessage');

    if (!data || data.length === 0) {
        card?.classList.add('hidden');
        noPass?.classList.remove('hidden');
        return;
    }

    const pass     = data[0];
    const expiry   = new Date(pass.expiry_date);
    const daysLeft = Math.ceil((expiry - Date.now()) / (1000 * 60 * 60 * 24));

    const expiryEl = document.getElementById('passExpiry');
    const linkedEl = document.getElementById('telegramLinked');
    if (expiryEl) expiryEl.textContent = `${Math.max(0, daysLeft)} days left`;
    if (linkedEl) linkedEl.textContent = `Linked to: ${pass.telegram_username || 'Not linked'}`;

    card?.classList.remove('hidden');
    noPass?.classList.add('hidden');
}

// ════════════════════════════════════════════════════════
// CONFETTI
// ════════════════════════════════════════════════════════
function launchConfetti() {
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999;';
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#f59e0b','#fbbf24','#10b981','#3b82f6','#ef4444','#ffffff'];
    const pieces = Array.from({length:200}, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * -canvas.height,
        w: 8 + Math.random() * 12,
        h: 8 + Math.random() * 8,
        r: Math.random() * 360,
        vx: Math.random()*3 - 1.5,
        vy: 3 + Math.random() * 5,
        vr: Math.random() * 8 - 4,
        color: colors[Math.floor(Math.random() * colors.length)]
    }));

    function draw() {
        ctx.clearRect(0,0,canvas.width,canvas.height);
        let active = false;
        pieces.forEach(p => {
            p.x += p.vx; p.y += p.vy; p.r += p.vr;
            if (p.y < canvas.height + 20) { active = true; }
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.r * Math.PI / 180);
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.w/2, -p.h/2, p.w, p.h);
            ctx.restore();
        });
        if (active) requestAnimationFrame(draw);
        else canvas.remove();
    }
    draw();
}

// ════════════════════════════════════════════════════════
// TOAST
// ════════════════════════════════════════════════════════
let toastTimer = null;
function showToast(msg, duration = 3000, type = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.className = `toast${type === 'error' ? ' error' : ''}`;
    toast.classList.remove('hidden');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.add('hidden'), duration);
}

// ════════════════════════════════════════════════════════
// MUSIC
// ════════════════════════════════════════════════════════
function toggleMusic() {
    const audio = document.getElementById('bgMusic');
    const btn   = document.getElementById('musicBtn');
    if (!audio || !btn) return;

    if (audio.paused) {
        audio.play()
            .then(() => {
                isMusicPlaying = true;
                btn.textContent = '⏸';
                btn.classList.add('playing');
            })
            .catch(() => showToast('Click once more to enable music 🎵'));
    } else {
        audio.pause();
        isMusicPlaying = false;
        btn.textContent = '🎵';
        btn.classList.remove('playing');
    }
}