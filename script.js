/* ═══════════════════════════════════════════════════════
   BELLY BEARS — SCRIPT.JS v2.0
   Fixed: Referral (players table) · Mystery System
   New: Task 5 · Countdown · Highscore Modal · Animations
═══════════════════════════════════════════════════════ */

// ── CONFIG ──────────────────────────────────────────────
const SUPABASE_URL      = 'https://tfdxmqvkkiidujrunfcp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmZHhtcXZra2lpZHVqcnVuZmNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0MjI5MTksImV4cCI6MjA4ODk5ODkxOX0.hKf_DquWy9dosADgAHedk7qyN4QPX31k8upzW4SDK3Q';

const BASE_CHAIN_ID     = 8453;
const BASE_RPC          = 'https://mainnet.base.org';
const BASE_EXPLORER     = 'https://basescan.org';
const USDC_BASE         = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
const TREASURY_ADDRESS  = '0xedf790A178cb47002309F28315c76155152b1EDb';

const USDC_ABI = [
    'function transfer(address to, uint256 amount) returns (bool)',
    'function decimals() view returns (uint8)',
    'function balanceOf(address owner) view returns (uint256)'
];

// Mint target date: July 1, 2026
const MINT_DATE = new Date('2026-07-01T00:00:00Z');

// ── STATE ────────────────────────────────────────────────
let supabaseClient     = null;
let userWalletAddress  = null;
let currentStep        = 1;
let walletConnected    = false;
let currentPassTxHash  = null;
let isMusicPlaying     = false;
let mysteryUnlocked    = false;
let playerReferralCode = null;

const TASKS_KEY = 'bellyBearsTasks_v2';

let tasks = [
    {
        id: 1,
        title: 'Follow @belly_bears on X',
        link: 'https://x.com/belly_bears',
        completed: false,
        icon: '𝕏'
    },
    {
        id: 2,
        title: 'Join the Telegram Community',
        link: 'https://t.me/bellybears_bot',
        completed: false,
        icon: '📱'
    },
    {
        id: 3,
        title: 'Share your bear on X (tag @belly_bears)',
        link: 'https://x.com/intent/tweet?text=Just+joined+%40belly_bears+on+Base+%F0%9F%90%BB+2222+Legendary+Bears+%E2%80%94+get+your+whitelist+spot+now%21+%23BellyBears+%23Base',
        requiresProof: true,
        completed: false,
        proof: '',
        icon: '🔁'
    },
    {
        id: 4,
        title: 'Play Game & Reach Top 100 Daily',
        gameTask: true,
        completed: false,
        icon: '🎮'
    },
    {
        id: 5,
        title: 'Repost our pinned tweet — paste proof link below',
        link: 'https://x.com/belly_bears',
        requiresProof: true,
        completed: false,
        proof: '',
        saveToDb: true,
        icon: '📌',
        mysteryHint: true
    }
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
    fetchGlobalLeaderboard('globalLeaderboardList', 1);
    initRandBearNumber();
    fetchMintedCount();
    initCountdown();

    const saved = loadWalletSession();
    if (saved) {
        userWalletAddress = saved;
        walletConnected   = true;
        updateWalletUI();
        checkMyPass();
        // Fetch referral data after wallet restore
        const tg = localStorage.getItem('bellyTgUsername');
        if (tg) fetchPlayerReferralData(tg);
    }

    // Track referral code from URL
    const urlParams = new URLSearchParams(window.location.search);
    const refCode   = urlParams.get('ref');
    if (refCode) sessionStorage.setItem('bellyRefCode', refCode);

    // Check mystery on load (in case already completed)
    checkMysteryStatus();

    console.log('%c🐻 Belly Bears v2.0 READY', 'color:#f59e0b;font-size:16px;font-weight:bold;');
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
// MINTED COUNT
// ════════════════════════════════════════════════════════
async function fetchMintedCount() {
    if (!supabaseClient) return;
    try {
        const { count, error } = await supabaseClient
            .from('whitelist_claims')
            .select('*', { count: 'exact', head: true });
        if (!error && count !== null) updateMintedUI(count);
    } catch (e) { console.warn('fetchMintedCount:', e); }
}

function updateMintedUI(count) {
    document.querySelectorAll('#mintedHero, #mintedUniverse').forEach(el => {
        if (el) animateCounter(el, parseInt(el.textContent) || 0, count, 800);
    });
    const pct = Math.min((count / 2222) * 100, 100).toFixed(1);
    const bar = document.querySelector('.mint-progress-fill');
    if (bar) bar.style.width = pct + '%';
    const label = document.querySelector('.mint-progress-labels span:first-child');
    if (label) label.innerHTML = `<span id="mintedUniverse">${count}</span> / 2222 minted`;
}

function animateCounter(el, from, to, duration) {
    const start  = performance.now();
    const update = (now) => {
        const pct   = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - pct, 3);
        el.textContent = Math.round(from + (to - from) * eased);
        if (pct < 1) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
}

// ════════════════════════════════════════════════════════
// COUNTDOWN TIMER
// ════════════════════════════════════════════════════════
function initCountdown() {
    updateCountdown();
    setInterval(updateCountdown, 1000);
}

function updateCountdown() {
    const now  = new Date();
    const diff = MINT_DATE - now;
    if (diff <= 0) {
        ['cdDays','cdHours','cdMins','cdSecs'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.textContent = '00';
        });
        const label = document.querySelector('.cd-label');
        if (label) label.textContent = '🚀 MINT IS LIVE!';
        return;
    }
    const days  = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins  = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs  = Math.floor((diff % (1000 * 60)) / 1000);

    const set = (id, val) => {
        const el = document.getElementById(id);
        if (el) {
            const str = String(val).padStart(2, '0');
            if (el.textContent !== str) {
                el.classList.add('cd-flip');
                el.textContent = str;
                setTimeout(() => el.classList.remove('cd-flip'), 400);
            }
        }
    };
    set('cdDays', days);
    set('cdHours', hours);
    set('cdMins', mins);
    set('cdSecs', secs);
}

// ════════════════════════════════════════════════════════
// CUSTOM CURSOR
// ════════════════════════════════════════════════════════
function initCursor() {
    const cursor   = document.getElementById('cursor');
    const follower = document.getElementById('cursorFollower');
    if (!cursor || !follower) return;

    let mouseX = 0, mouseY = 0, fX = 0, fY = 0;

    document.addEventListener('mousemove', e => {
        mouseX = e.clientX; mouseY = e.clientY;
        cursor.style.left = mouseX + 'px';
        cursor.style.top  = mouseY + 'px';
    });

    (function animFollower() {
        fX += (mouseX - fX) * 0.15;
        fY += (mouseY - fY) * 0.15;
        follower.style.left = fX + 'px';
        follower.style.top  = fY + 'px';
        requestAnimationFrame(animFollower);
    })();

    document.querySelectorAll('a, button, .task-card, .wallet-option').forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.style.transform   = 'translate(-50%,-50%) scale(2.5)';
            follower.style.transform = 'translate(-50%,-50%) scale(0.5)';
            follower.style.opacity   = '0.4';
        });
        el.addEventListener('mouseleave', () => {
            cursor.style.transform   = 'translate(-50%,-50%) scale(1)';
            follower.style.transform = 'translate(-50%,-50%) scale(1)';
            follower.style.opacity   = '1';
        });
    });
}

// ════════════════════════════════════════════════════════
// NAVBAR
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
            left:${Math.random()*100}%;
            bottom:${Math.random()*30}%;
            animation-duration:${6+Math.random()*10}s;
            animation-delay:${Math.random()*8}s;
            width:${1+Math.random()*3}px;
            height:${1+Math.random()*3}px;
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
            left:${Math.random()*100}%;
            top:${20+Math.random()*60}%;
            animation-duration:${3+Math.random()*5}s;
            animation-delay:${Math.random()*6}s;
        `;
        container.appendChild(f);
    }
}

// ════════════════════════════════════════════════════════
// UNIVERSE SCENE
// ════════════════════════════════════════════════════════
function initUniverseScene() {
    const starsLayer = document.getElementById('starsLayer');
    if (starsLayer) {
        for (let i = 0; i < 120; i++) {
            const s    = document.createElement('div');
            s.className = 'star';
            const size  = 1 + Math.random() * 2.5;
            s.style.cssText = `
                left:${Math.random()*100}%;top:${Math.random()*60}%;
                width:${size}px;height:${size}px;
                animation-duration:${2+Math.random()*4}s;
                animation-delay:${Math.random()*5}s;
            `;
            starsLayer.appendChild(s);
        }
    }
    const leavesContainer = document.getElementById('leavesContainer');
    if (leavesContainer) {
        const hues = ['#15803d','#166534','#4ade80','#22c55e'];
        for (let i = 0; i < 20; i++) {
            const l = document.createElement('div');
            l.className = 'leaf';
            l.style.cssText = `
                left:${Math.random()*100}%;
                animation-duration:${6+Math.random()*8}s;
                animation-delay:${Math.random()*8}s;
                background:${hues[Math.floor(Math.random()*hues.length)]};
                width:${8+Math.random()*10}px;height:${5+Math.random()*6}px;
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
// LEADERBOARD (mini — universe section)
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
    } catch { container.innerHTML = '<div style="color:var(--muted);text-align:center;padding:12px;font-size:0.85rem;">Unable to load</div>'; }
}

// =============================================
// LEADERBOARD BARU - GAME + REFERRAL
// =============================================

let currentLbTab = 0; // 0 = Game, 1 = Referral

let currentLbTab = 0; // 0 = Game, 1 = Referral
let currentLeaderboardPage = 1;
 
async function fetchLeaderboardData(tab) {
    const container = document.getElementById('lbContent');
    if (!container) return;
    container.innerHTML = '<div class="lb-loading-state">🐻</div>';
 
    try {
        if (tab === 0) {
            // ── GAME LEADERBOARD ──
            const { data, error } = await supabaseClient
                .from('highscores')
                .select('username, best_score')
                .order('best_score', { ascending: false })
                .limit(30);
 
            if (error || !data || data.length === 0) {
                container.innerHTML = '<div class="lb-empty-state">No scores yet. Be the first! 🐻</div>';
                return;
            }
 
            const medals = { 1: '🥇', 2: '🥈', 3: '🥉' };
            let html = '<div class="lb-section-title">🏆 TOP PLAYERS — ALL TIME</div>';
            data.forEach((p, i) => {
                const rank = i + 1;
                const rankDisplay = medals[rank] || rank;
                const topClass = rank <= 3 ? `top-${rank}` : '';
                html += `
                <div class="lb-row-card ${topClass}" style="animation-delay:${i * 0.04}s">
                    <div class="lb-card-rank">${rankDisplay}</div>
                    <div class="lb-card-name">${escapeHtml(p.username || 'Anonymous Bear')}</div>
                    <div class="lb-card-score">${p.best_score.toLocaleString()} pts</div>
                </div>`;
            });
            container.innerHTML = html;
 
        } else {
            // ── REFERRAL LEADERBOARD ──
            const { data, error } = await supabaseClient
                .from('players')
                .select('display_name, telegram_username, referral_count, bonus_coins')
                .order('referral_count', { ascending: false })
                .limit(30);
 
            if (error || !data || data.length === 0) {
                container.innerHTML = '<div class="lb-empty-state">No referrals yet. Share your link! 🔗</div>';
                return;
            }
 
            const medals = { 1: '🥇', 2: '🥈', 3: '🥉' };
            let html = '<div class="lb-section-title">🔥 REFERRAL KINGS</div>';
            data.forEach((p, i) => {
                const rank = i + 1;
                const rankDisplay = medals[rank] || rank;
                const topClass = rank <= 3 ? `top-${rank}` : '';
                const name = escapeHtml(p.display_name || p.telegram_username || 'Bear');
                const reward = ((p.referral_count || 0) * 0.02).toFixed(3);
                const coins  = p.bonus_coins || 0;
                html += `
                <div class="lb-row-card ${topClass}" style="animation-delay:${i * 0.04}s">
                    <div class="lb-card-rank">${rankDisplay}</div>
                    <div class="lb-card-name">
                        ${name}
                        <span class="lb-card-sub">${p.referral_count || 0} referral${(p.referral_count || 0) !== 1 ? 's' : ''} · ${coins} coins</span>
                    </div>
                    <div class="lb-card-reward">+${reward} ETH</div>
                </div>`;
            });
            container.innerHTML = html;
        }
    } catch (e) {
        console.error('fetchLeaderboardData:', e);
        container.innerHTML = '<div class="lb-empty-state">Failed to load. Try again 🐻</div>';
    }
}

function switchLeaderboardTab(tab) {
    currentLbTab = tab;
    document.querySelectorAll('.lb-tab').forEach(el => el.classList.remove('active'));
    const activeTab = document.getElementById(tab === 0 ? 'tabGame' : 'tabReferral');
    if (activeTab) activeTab.classList.add('active');
    fetchLeaderboardData(tab);
}

function openFullLeaderboardModal() {
    const modal = document.getElementById('fullLeaderboardModal');
    if (!modal) return;
    modal.classList.remove('hidden');
    currentLbTab = 0;
    switchLeaderboardTab(0);
}


function closeFullLeaderboardModal() {
    const modal = document.getElementById('fullLeaderboardModal');
    if (modal) modal.classList.add('hidden');
}

function goToLeaderboardPage(page) {
    currentLeaderboardPage = page;
    fetchGlobalLeaderboard('fullLeaderboardList', page, true);
}

// ── fetchGlobalLeaderboard — mini list in referral section ──
async function fetchGlobalLeaderboard(containerId, page = 1, isPaged = false) {
    const container = document.getElementById(containerId);
    if (!container || !supabaseClient) return;
 
    const PAGE_SIZE = isPaged ? 20 : 5;
    const from = (page - 1) * PAGE_SIZE;
 
    try {
        const { data, error } = await supabaseClient
            .from('highscores')
            .select('username, best_score')
            .order('best_score', { ascending: false })
            .range(from, from + PAGE_SIZE - 1);
 
        if (error || !data || data.length === 0) {
            container.innerHTML = '<div class="lb-empty-state" style="padding:20px;text-align:center;color:var(--muted);font-size:0.85rem;">No scores yet 🐻</div>';
            return;
        }
 
        const medals = ['🥇', '🥈', '🥉'];
        const offset  = from;
        container.innerHTML = data.map((p, i) => {
            const rank  = offset + i + 1;
            const medal = rank <= 3 ? medals[rank - 1] : rank;
            const topCls = rank <= 3 ? 'lb-row-top' : '';
            return `
            <div class="lb-row ${topCls}" style="animation-delay:${i * 0.06}s">
                <span class="lb-rank">${medal}</span>
                <span class="lb-name">${escapeHtml(p.username || 'Anonymous Bear')}</span>
                <span class="lb-score">${p.best_score.toLocaleString()} pts</span>
            </div>`;
        }).join('');
 
        // Pagination for full modal
        if (isPaged) {
            renderLbPagination(page, data.length, PAGE_SIZE);
        }
 
    } catch (e) {
        console.error('fetchGlobalLeaderboard:', e);
        container.innerHTML = '<div style="color:var(--muted);text-align:center;padding:16px;font-size:0.85rem;">Unable to load</div>';
    }
}

function renderLbPagination(currentPage, resultCount, pageSize) {
    const el = document.getElementById('lbPagination');
    if (!el) return;
    if (resultCount < pageSize && currentPage === 1) { el.innerHTML = ''; return; }
 
    const hasPrev = currentPage > 1;
    const hasNext = resultCount === pageSize;
    el.innerHTML = `
        ${hasPrev ? `<button class="lb-page-btn" onclick="goToLeaderboardPage(${currentPage - 1})">← Prev</button>` : ''}
        <button class="lb-page-btn active">${currentPage}</button>
        ${hasNext ? `<button class="lb-page-btn" onclick="goToLeaderboardPage(${currentPage + 1})">Next →</button>` : ''}
    `;
}

// ── Escape HTML helper ──
function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function openFullLeaderboardModal() {
    document.getElementById('fullLeaderboardModal').classList.remove('hidden');
    currentLeaderboardPage = 1;
    fetchGlobalLeaderboard('fullLeaderboardList', 1, true);
}
function closeFullLeaderboardModal() {
    document.getElementById('fullLeaderboardModal').classList.add('hidden');
}

// ════════════════════════════════════════════════════════
// TASKS
// ════════════════════════════════════════════════════════
function loadTasks() {
    const saved = localStorage.getItem(TASKS_KEY);
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            tasks = tasks.map(t => {
                const s = parsed.find(x => x.id === t.id);
                return s ? { ...t, completed: s.completed, proof: s.proof || '' } : t;
            });
        } catch (e) {}
    }
}

function saveTasks() {
    localStorage.setItem(TASKS_KEY, JSON.stringify(
        tasks.map(t => ({ id: t.id, completed: t.completed, proof: t.proof || '' }))
    ));
}

function renderTasksSection() {
    const container = document.getElementById('tasksList');
    if (!container) return;
    container.innerHTML = tasks.map((task, index) => `
        <div class="task-card ${task.completed ? 'completed' : ''}" style="animation-delay:${index*0.12}s">
            <div class="task-status-icon">
                ${task.completed
                    ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`
                    : `<span class="task-num">${index + 1}</span>`
                }
            </div>
            <div class="task-info">
                <div class="task-title">${task.icon ? `<span style="margin-right:6px;">${task.icon}</span>` : ''}${task.title}</div>
                ${task.requiresProof && !task.completed ? `
                    <div class="task-proof-wrap">
                        <div class="task-proof-row">
                            <input type="url" id="proof_${task.id}" placeholder="🔗 Paste your tweet/repost URL here..." class="task-proof-input" value="${task.proof||''}">
                            <button class="task-proof-open-btn" onclick="openTaskLink(${task.id}, '${task.link}')">Go ↗</button>
                        </div>
                        <p class="task-proof-hint">${task.mysteryHint ? '🍯 <em>Something extraordinary awaits those who complete every mission...</em>' : 'Post first, then paste the URL above'}</p>
                    </div>
                ` : ''}
                ${task.proof && task.completed ? `
                    <div class="task-proof-done">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                        Proof: <a href="${task.proof}" target="_blank" rel="noopener">${task.proof.replace('https://','').slice(0,40)}…</a>
                    </div>
                ` : ''}
                ${!task.completed && !task.requiresProof && !task.gameTask ? `
                    <div class="task-click-hint">Click "Go & Done" — marks automatically after you visit</div>
                ` : ''}
            </div>
            <div class="task-action">
                ${task.completed
                    ? `<div class="task-done-badge">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                            DONE
                       </div>`
                    : task.gameTask
                        ? `<button class="task-btn task-btn-game" onclick="claimGameWL()"><span>🎮 Verify</span></button>`
                        : task.requiresProof
                            ? `<button class="task-btn task-btn-proof" onclick="submitProofTask(${task.id})">
                                    <span>Submit</span>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                               </button>`
                            : `<a href="${task.link}" target="_blank" rel="noopener"
                                  class="task-btn task-btn-go"
                                  onclick="scheduleAutoMark(${task.id}, event)">Go & Done ↗</a>`
                }
            </div>
        </div>
    `).join('');
    animateProgress();
    updateWlStatus();
}

function openTaskLink(id, link) { window.open(link, '_blank'); }

function scheduleAutoMark(id, e) {
    const card = e.currentTarget.closest('.task-card');
    if (card) {
        card.classList.add('task-pending');
        const btn = e.currentTarget;
        btn.textContent = '⏳ Verifying...';
        btn.style.pointerEvents = 'none';
    }
    setTimeout(() => {
        const t = tasks.find(t => t.id === id);
        if (t && !t.completed) {
            t.completed = true;
            saveTasks();
            renderTasksSection();
            renderModalTasks();
            showToast('✅ Task completed!', 2500);
            checkMysteryStatus();
        }
    }, 4000);
}

function submitProofTask(id) {
    const input    = document.getElementById(`proof_${id}`);
    const proofUrl = input ? input.value.trim() : '';
    if (!proofUrl) { showToast('Please paste your tweet URL first!', 2500, 'error'); input?.focus(); return; }
    if (!proofUrl.startsWith('http')) { showToast('URL must start with https://...', 2500, 'error'); input?.focus(); return; }

    const t = tasks.find(t => t.id === id);
    if (t) {
        t.completed = true;
        t.proof = proofUrl;
        saveTasks();

        // Task 5: save proof to DB (uses tx_hash field as temporary proof store)
        if (t.saveToDb) saveProofToWhitelist(proofUrl);

        renderTasksSection();
        renderModalTasks();
        launchConfetti();
        showToast('🎉 Proof submitted! Task complete.', 3000);
        checkMysteryStatus();
    }
}

async function saveProofToWhitelist(proofUrl) {
    if (!supabaseClient) return;
    try {
        // If wallet connected and already has a claim, update tx_hash with proof
        if (userWalletAddress) {
            await supabaseClient
                .from('whitelist_claims')
                .update({ tx_hash: proofUrl })
                .eq('wallet_address', userWalletAddress);
        }
        // Also save to localStorage for later use in performMint
        localStorage.setItem('bellyProofTweet', proofUrl);
    } catch (e) { console.warn('saveProofToWhitelist:', e); }
}

function markTask(id) {
    const t = tasks.find(t => t.id === id);
    if (t) { t.completed = true; saveTasks(); renderTasksSection(); renderModalTasks(); checkMysteryStatus(); }
}

function claimGameWL() {
    const t = tasks.find(t => t.gameTask);
    if (t) {
        t.completed = true;
        saveTasks();
        renderTasksSection();
        renderModalTasks();
        launchConfetti();
        showToast('🎉 Game WL Claimed! Spot secured.', 3000);
        checkMysteryStatus();
    }
}

function animateProgress() {
    const done  = tasks.filter(t => t.completed).length;
    const total = tasks.length;
    const circle = document.getElementById('progressCircle');
    const text   = document.getElementById('progressText');
    if (!circle || !text) return;
    const circumference = 314.16;
    circle.style.strokeDashoffset = circumference * (1 - done / total);
    text.textContent = `${done}/${total}`;
}

function updateWlStatus() {
    const done = tasks.filter(t => t.completed).length;
    const el   = document.getElementById('wlStatus');
    if (el) {
        el.textContent = done >= 2
            ? `✅ Eligible (${done}/5 tasks)`
            : `⏳ ${done}/5 tasks done`;
        el.style.color = done >= 2 ? 'var(--emerald)' : 'var(--amber)';
    }
}

function renderModalTasks() {
    const container = document.getElementById('modalTasksList');
    if (!container) return;
    container.innerHTML = tasks.map(task => `
        <div class="modal-task-row ${task.completed ? 'modal-task-done' : ''}">
            <span class="modal-task-check">${task.completed ? '✅' : '⬜'}</span>
            <span class="modal-task-label">${task.title}</span>
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
// MYSTERY SYSTEM — Honey Vault Easter Egg
// ════════════════════════════════════════════════════════
function checkMysteryStatus() {
    const allDone   = tasks.every(t => t.completed);
    const hasWallet = !!userWalletAddress;

    if (allDone && hasWallet && !mysteryUnlocked) {
        mysteryUnlocked = true;
        setTimeout(revealMystery, 800);
    } else if (allDone && !mysteryUnlocked) {
        // Show hint even without wallet
        const hint = document.getElementById('mysteryHintBar');
        if (hint) {
            hint.classList.remove('hidden');
            hint.classList.add('hint-glow');
        }
    }
}

function revealMystery() {
    const section = document.getElementById('mystery');
    if (!section) return;

    section.classList.remove('hidden');
    section.classList.add('mystery-reveal');
    initMysteryStars();

    setTimeout(() => {
        section.scrollIntoView({ behavior: 'smooth', block: 'center' });
        launchConfetti();
        showToast('⭐ You unlocked the Honey Vault...', 6000);
    }, 600);

    // Mark genesis legend in DB
    if (supabaseClient && userWalletAddress) {
        supabaseClient.from('whitelist_claims')
            .update({ tasks_completed: 5 })
            .eq('wallet_address', userWalletAddress)
            .then(() => {});
    }
}

function initMysteryStars() {
    const container = document.getElementById('mysteryStarsBg');
    if (!container || container.children.length > 0) return;
    for (let i = 0; i < 200; i++) {
        const s = document.createElement('div');
        s.className = 'mystery-star';
        const size = 1 + Math.random() * 3;
        s.style.cssText = `
            left:${Math.random()*100}%;top:${Math.random()*100}%;
            width:${size}px;height:${size}px;
            animation-duration:${1.5+Math.random()*4}s;
            animation-delay:${Math.random()*6}s;
            opacity:${0.3+Math.random()*0.7};
        `;
        container.appendChild(s);
    }
}

// ════════════════════════════════════════════════════════
// WALLET MODULE
// ════════════════════════════════════════════════════════
function openWalletModal() {
    document.getElementById('walletModal').classList.remove('hidden');
}
function closeWalletModal() {
    document.getElementById('walletModal').classList.add('hidden');
}

async function connectWithProvider(type) {
    if (!window.ethereum) {
        if (type === 'metamask')  { window.open('https://metamask.io/download/', '_blank'); return; }
        if (type === 'coinbase')  { window.open('https://www.coinbase.com/wallet', '_blank'); return; }
        showToast('No wallet extension detected.', 3500, 'error'); return;
    }

    let provider = window.ethereum;
    if (type === 'coinbase' && window.ethereum.providers)
        provider = window.ethereum.providers.find(p => p.isCoinbaseWallet) || window.ethereum;
    if (type === 'metamask' && window.ethereum.providers)
        provider = window.ethereum.providers.find(p => p.isMetaMask) || window.ethereum;

    try {
        closeWalletModal();
        await provider.request({ method: 'eth_requestAccounts' });
        const switched = await switchToBase(provider);
        if (!switched) { showToast('Please switch to Base network.', 3000, 'error'); return; }

        const ethProvider = new ethers.BrowserProvider(provider);
        const signer      = await ethProvider.getSigner();
        userWalletAddress = await signer.getAddress();
        walletConnected   = true;
        saveWalletSession(userWalletAddress);
        updateWalletUI();
        checkMyPass();

        // Show in modal
        const wad = document.getElementById('walletAddressDisplay');
        if (wad) wad.innerHTML = `✅ ${userWalletAddress.slice(0,6)}...${userWalletAddress.slice(-4)}`;
        const mws = document.getElementById('mintWalletShow');
        if (mws) mws.textContent = userWalletAddress.slice(0,6) + '...' + userWalletAddress.slice(-4);

        // Fetch referral data
        const tg = localStorage.getItem('bellyTgUsername');
        if (tg) fetchPlayerReferralData(tg);

        showToast(`✅ Wallet connected: ${userWalletAddress.slice(0,6)}...${userWalletAddress.slice(-4)}`);

        // Check mystery after wallet connect
        checkMysteryStatus();

    } catch (err) {
        console.error('Wallet connect error:', err);
        if (err.code !== 4001) showToast('Connection failed. Please try again.', 3000, 'error');
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
// REFERRAL SYSTEM — Uses `players` table
// ════════════════════════════════════════════════════════

/**
 * Fetch referral data from the `players` table using Telegram username.
 * players columns: telegram_username, referral_code, referral_count, bonus_coins
 */
async function fetchPlayerReferralData(tgUsername) {
    const el = document.getElementById('referralLinkInput');
    if (!el) return;

    if (!tgUsername || !supabaseClient) {
        if (userWalletAddress) {
            el.value = `${window.location.origin}?ref=${userWalletAddress.slice(2,10).toUpperCase()}`;
        }
        return;
    }

    try {
        const clean = tgUsername.replace('@', '').toLowerCase();
        const { data, error } = await supabaseClient
            .from('players')
            .select('referral_code, referral_count, bonus_coins, display_name')
            .ilike('telegram_username', clean)
            .maybeSingle();

        if (data?.referral_code) {
            playerReferralCode     = data.referral_code;
            el.value               = `${window.location.origin}?ref=${data.referral_code}`;

            const total  = data.referral_count || 0;
            const earned = (total * 0.02).toFixed(3);
            const elTotal  = document.getElementById('refTotal');
            const elEarned = document.getElementById('refEarned');
            if (elTotal)  animateCounter(elTotal, 0, total, 600);
            if (elEarned) elEarned.textContent = earned;
        } else {
            // Player not found in game yet — use wallet address as fallback
            const fallback = userWalletAddress
                ? `${window.location.origin}?ref=${userWalletAddress.slice(2,10).toUpperCase()}`
                : `${window.location.origin}?ref=${tgUsername.replace('@','')}`;
            el.value = fallback;
        }
    } catch (e) {
        console.warn('fetchPlayerReferralData:', e);
    }
}

/**
 * Track referral when a new user mints/claims.
 * Increments referral_count on the referrer's players row.
 */
async function trackReferralOnMint(tgUsername) {
    const refCode = sessionStorage.getItem('bellyRefCode');
    if (!refCode || !supabaseClient) return;

    try {
        const { data: referrer } = await supabaseClient
            .from('players')
            .select('id, telegram_username, referral_count')
            .eq('referral_code', refCode)
            .maybeSingle();

        if (!referrer) return;

        // Don't self-refer
        const cleanTg = (tgUsername || '').replace('@','').toLowerCase();
        if (referrer.telegram_username?.toLowerCase() === cleanTg) return;

        // Increment referrer's count
        await supabaseClient
            .from('players')
            .update({ referral_count: (referrer.referral_count || 0) + 1 })
            .eq('id', referrer.id);

        // Update referred_by on new player (if they exist in players table)
        if (tgUsername) {
            await supabaseClient
                .from('players')
                .update({ referred_by: referrer.telegram_username })
                .ilike('telegram_username', cleanTg);
        }
    } catch (e) { console.warn('trackReferralOnMint:', e); }
}

function generateReferralLink() {
    if (playerReferralCode) return `${window.location.origin}?ref=${playerReferralCode}`;
    if (userWalletAddress)  return `${window.location.origin}?ref=${userWalletAddress.slice(2,10).toUpperCase()}`;
    return window.location.origin;
}

function updateReferralLink() {
    const input = document.getElementById('referralLinkInput');
    if (input) input.value = generateReferralLink();
}

function copyReferralLink() {
    const input = document.getElementById('referralLinkInput');
    if (!input || !input.value || input.value === window.location.origin) {
        showToast('Enter your Telegram username in the game first!', 3000, 'error'); return;
    }
    navigator.clipboard?.writeText(input.value) || (() => { input.select(); document.execCommand('copy'); })();
    showToast('🔗 Referral link copied!', 2000);
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
    fetchMintedCount();
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
    if (currentStep === 1 && tasks.filter(t => t.completed).length < 2) {
        showToast('Complete at least 2 tasks first!', 2500, 'error'); return;
    }
    currentStep++;
    showMintStep();
}

function submitTasksAndContinue() {
    const username = document.getElementById('tgUsername').value.trim();
    if (!username || !username.startsWith('@')) {
        showToast('Enter your Telegram @username', 2500, 'error'); return;
    }
    localStorage.setItem('bellyTgUsername', username);
    fetchPlayerReferralData(username);
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
    const proofTweet = localStorage.getItem('bellyProofTweet') || null;

    try {
        const { data: existing } = await supabaseClient
            .from('whitelist_claims')
            .select('id')
            .eq('wallet_address', userWalletAddress)
            .maybeSingle();

        if (existing) { showToast('This wallet already has a whitelist spot!', 3000, 'error'); return; }

        const { error } = await supabaseClient.from('whitelist_claims').insert({
            wallet_address:  userWalletAddress,
            telegram:        tgUsername,
            bear_number:     number,
            tasks_completed: tasks.filter(t => t.completed).length,
            tx_hash:         proofTweet   // store tweet proof in tx_hash until real mint
        });
        if (error) throw error;

        // Track referral
        await trackReferralOnMint(tgUsername);

        launchConfetti();
        showToast(`🎉 Belly Bear #${number} is yours!`, 4000);

        // Check mystery after successful claim
        checkMysteryStatus();

        setTimeout(() => closeMintModal(), 2000);

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
    if (!userWalletAddress) { showToast('Connect your wallet first!', 2500, 'error'); openWalletModal(); return; }
    const switched = await switchToBase();
    if (!switched) { showToast('Please switch to Base network!', 2500, 'error'); return; }

    const btn          = document.querySelector('#passStep1 button');
    const originalText = btn.innerHTML;
    btn.innerHTML = '⏳ Waiting for confirmation...';
    btn.disabled  = true;

    try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer   = await provider.getSigner();
        const contract = new ethers.Contract(USDC_BASE, USDC_ABI, signer);
        const amount   = ethers.parseUnits('2', 6);
        const tx       = await contract.transfer(TREASURY_ADDRESS, amount);
        btn.innerHTML  = '⏳ Confirming transaction...';
        await tx.wait();
        currentPassTxHash = tx.hash;
        document.getElementById('passStep1').classList.add('hidden');
        document.getElementById('passStep2').classList.remove('hidden');
        launchConfetti();
        showToast('✅ Payment confirmed! Link your Telegram now.', 4000);
    } catch (err) {
        console.error(err);
        if (err.code === 4001) showToast('Transaction cancelled.', 2500, 'error');
        else showToast('Payment failed. Check your USDC balance on Base.', 3500, 'error');
    } finally {
        btn.innerHTML = originalText;
        btn.disabled  = false;
    }
}

async function linkTelegramAfterPayment() {
    const username = document.getElementById('passTgUsername').value.trim();
    if (!username || !username.startsWith('@')) { showToast('Enter a valid Telegram @username', 2500, 'error'); return; }

    const btn = document.querySelector('#passStep2 button');
    const originalText = btn.innerHTML;
    btn.innerHTML = '⏳ Activating...';
    btn.disabled  = true;

    try {
        const expiry = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
        const { error } = await supabaseClient.from('belly_passes').insert({
            wallet_address:    userWalletAddress,
            telegram_username: username,
            expiry_date:       expiry,
            power_ups:         { combo_master: true, shield: 3, coin_magnet: true },
            active:            true
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

    const card   = document.getElementById('myPassCard');
    const noPass = document.getElementById('noPassMessage');
    if (!data || data.length === 0) { card?.classList.add('hidden'); noPass?.classList.remove('hidden'); return; }

    const pass     = data[0];
    const expiry   = new Date(pass.expiry_date);
    const daysLeft = Math.ceil((expiry - Date.now()) / (1000*60*60*24));

    const expiryEl = document.getElementById('passExpiry');
    const linkedEl = document.getElementById('telegramLinked');
    if (expiryEl) expiryEl.textContent = `${Math.max(0,daysLeft)} days left`;
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
    const ctx    = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#f59e0b','#fbbf24','#10b981','#3b82f6','#ef4444','#ffffff','#a78bfa'];
    const pieces = Array.from({ length: 220 }, () => ({
        x: Math.random() * canvas.width, y: Math.random() * -canvas.height,
        w: 8 + Math.random() * 12, h: 8 + Math.random() * 8,
        r: Math.random() * 360,
        vx: Math.random() * 3 - 1.5, vy: 3 + Math.random() * 5, vr: Math.random() * 8 - 4,
        color: colors[Math.floor(Math.random() * colors.length)]
    }));

    function draw() {
        ctx.clearRect(0,0,canvas.width,canvas.height);
        let active = false;
        pieces.forEach(p => {
            p.x += p.vx; p.y += p.vy; p.r += p.vr;
            if (p.y < canvas.height + 20) active = true;
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
            .then(() => { isMusicPlaying = true; btn.textContent = '⏸'; btn.classList.add('playing'); })
            .catch(() => showToast('Click once more to enable music 🎵'));
    } else {
        audio.pause();
        isMusicPlaying = false;
        btn.textContent = '🎵';
        btn.classList.remove('playing');
    }
}