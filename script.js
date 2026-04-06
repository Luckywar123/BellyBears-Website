// ================== GOOGLE SHEET CONFIG ==================
const SHEET_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwoLijBi7RfKLlqzgJrim1cV0VrSUJ9Pk_w8sjcBt-IBX-sgeLa4uHcEDaKhBUE-SEi/exec";

// ================== SUPABASE CONFIG ==================
// GANTI DENGAN DATA KAMU DARI SUPABASE DASHBOARD
const SUPABASE_URL = 'https://tfdxmqvkkiidujrunfcp.supabase.co';     // ← Project URL kamu
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmZHhtcXZra2lpZHVqcnVuZmNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0MjI5MTksImV4cCI6MjA4ODk5ODkxOX0.hKf_DquWy9dosADgAHedk7qyN4QPX31k8upzW4SDK3Q';                         // ← Anon Public Key kamu

let supabaseClient;

// Inisialisasi Supabase
function initSupabase() {
    supabaseClient = Supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// Fetch Top 3 dari database
async function fetchLeaderboard() {
    try {
        const { data, error } = await supabaseClient
            .from('highscores')
            .select('username, best_score')
            .order('best_score', { ascending: false })
            .limit(3);

        if (error) throw error;
        return data || [];
    } catch (err) {
        console.error('❌ Error fetch leaderboard:', err);
        return []; // fallback ke fake data
    }
}

// Render leaderboard (real atau fake)
function renderLeaderboard(players) {
    const container = document.getElementById('leaderboardDemo');
    
    // Kalau kosong, pakai fake data
    if (!players || players.length === 0) {
        renderFakeLeaderboard();
        return;
    }

    container.innerHTML = players.map((p, i) => `
        <div class="leaderboard-row flex justify-between items-center bg-[#1e2937] px-5 py-3 rounded-2xl text-sm">
            <div class="flex items-center gap-3">
                <span class="text-[#f39c12] font-bold">#${i+1}</span>
                <span>${p.username || 'Anonymous'}</span>
            </div>
            <span class="font-mono">${p.best_score || 0} pts</span>
        </div>
    `).join('');
}

// Fake leaderboard (fallback)
function renderFakeLeaderboard() {
    const container = document.getElementById('leaderboardDemo');
    const players = [
        { username: "ChubbyKing88", best_score: 12480 },
        { username: "BellyBoss", best_score: 11390 },
        { username: "FluffyTon", best_score: 10920 }
    ];
    container.innerHTML = players.map((p, i) => `
        <div class="leaderboard-row flex justify-between items-center bg-[#1e2937] px-5 py-3 rounded-2xl text-sm">
            <div class="flex items-center gap-3">
                <span class="text-[#f39c12] font-bold">#${i+1}</span>
                <span>${p.username}</span>
            </div>
            <span class="font-mono">${p.best_score} pts</span>
        </div>
    `).join('');
}

// ================== TASKS & MODAL (Kode lama kamu tetap utuh) ==================
const TASKS_KEY = 'bellyBearsTasks';

let tasks = [
    { id: 1, title: "Follow @belly_bears on X", link: "https://x.com/belly_bears", completed: false },
    { id: 2, title: "Join Telegram Community", link: "https://t.me/bellybears_bot", completed: false },
    { id: 3, title: "Share your bear on X (tag @belly_bears)", link: "https://x.com/belly_bears", completed: false },
    { id: 4, title: "Play Game & Reach Top 100 Daily", gameTask: true, completed: false }
];

function loadTasks() {
    const saved = localStorage.getItem(TASKS_KEY);
    if (saved) {
        const parsed = JSON.parse(saved);
        tasks = tasks.map(task => {
            const savedTask = parsed.find(t => t.id === task.id);
            return savedTask ? { ...task, completed: savedTask.completed } : task;
        });
    }
    saveTasks();
}

function saveTasks() {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
}

function renderTasksSection() {
    const container = document.getElementById('tasksList');
    container.innerHTML = '';
    tasks.forEach(task => {
        const div = document.createElement('div');
        div.className = `flex items-center justify-between p-6 rounded-3xl transition-all ${task.completed ? 'bg-emerald-900/30 task-completed' : 'bg-[#1e2937] hover:bg-[#2a2140]'}`;
        div.innerHTML = `
            <div class="flex items-center gap-4">
                ${task.completed ? 
                    `<i class="fas fa-check-circle text-emerald-400 text-2xl"></i>` : 
                    `<i class="fas fa-circle text-gray-400 text-2xl"></i>`
                }
                <div>
                    <p class="${task.completed ? 'line-through text-gray-400' : ''}">${task.title}</p>
                </div>
            </div>
            <div>
                ${task.completed ? 
                    `<span class="px-5 py-2 text-xs font-bold bg-emerald-400 text-black rounded-2xl">DONE</span>` : 
                    task.gameTask ? 
                    `<button onclick="claimGameWL(); event.stopImmediatePropagation()" class="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 font-semibold rounded-2xl text-sm transition-colors">VERIFY GAME WL</button>` :
                    `<a href="${task.link}" target="_blank" onclick="markTask(${task.id}); event.stopImmediatePropagation()" class="px-8 py-3 bg-white/10 hover:bg-[#f39c12] hover:text-black font-semibold rounded-2xl text-sm transition-colors">DO TASK</a>`
                }
            </div>
        `;
        container.appendChild(div);
    });

    const completedCount = tasks.filter(t => t.completed).length;
    if (completedCount >= 3) {
        const el = document.createElement('div');
        el.className = "col-span-2 text-center mt-4 p-4 bg-emerald-900/30 rounded-3xl text-emerald-400 font-bold";
        el.innerHTML = `🎉 You have enough tasks for whitelist! Open Mint Modal →`;
        container.appendChild(el);
    }
}

function renderModalTasks() {
    const container = document.getElementById('modalTasksList');
    container.innerHTML = '';
    tasks.forEach(task => {
        const div = document.createElement('div');
        div.className = `bg-[#2a2140] p-5 rounded-2xl flex justify-between items-center ${task.completed ? 'task-completed' : ''}`;
        div.innerHTML = `
            <div class="flex-1">${task.title}</div>
            <div>
                ${task.completed ? 
                    `<i onclick="unmarkTask(${task.id}); event.stopImmediatePropagation()" class="fas fa-check-circle text-emerald-400 text-3xl cursor-pointer"></i>` : 
                    task.gameTask ? 
                    `<button onclick="claimGameWL(); event.stopImmediatePropagation()" class="px-7 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-2xl text-sm font-bold">VERIFY GAME</button>` :
                    `<button onclick="markTask(${task.id}); event.stopImmediatePropagation()" class="px-7 py-2 bg-cyan-500 hover:bg-cyan-400 rounded-2xl text-sm font-bold transition">MARK DONE</button>`
                }
            </div>
        `;
        container.appendChild(div);
    });
}

function markTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = true;
        saveTasks();
        renderTasksSection();
        renderModalTasks();
        if (tasks.filter(t => t.completed).length >= 3) {
            document.getElementById('wlStatus').innerHTML = `✅ ELIGIBLE <span class="text-xs">(3/4 tasks)</span>`;
        }
    }
}

function unmarkTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = false;
        saveTasks();
        renderTasksSection();
        renderModalTasks();
    }
}

function claimGameWL() {
    const gameTask = tasks.find(t => t.gameTask === true);
    if (gameTask) {
        gameTask.completed = true;
        saveTasks();
        renderTasksSection();
        renderModalTasks();
        alert("🎉 Congratulations! You received Guaranteed WL from the game leaderboard!\n\nYour spot is secured.");
    }
}

async function submitToGoogleSheet(username) {
    const completedTasks = tasks.filter(t => t.completed).map(t => t.title).join(" | ");
    const payload = {
        timestamp: new Date().toISOString(),
        telegram: username,
        tasks: completedTasks,
        game_wl: tasks.some(t => t.gameTask && t.completed) ? "YES" : "NO",
        total_completed: tasks.filter(t => t.completed).length
    };

    try {
        await fetch(SHEET_WEB_APP_URL, {
            method: "POST",
            body: JSON.stringify(payload),
            headers: { "Content-Type": "application/json" }
        });
        console.log("✅ Data WL berhasil dikirim ke Google Sheet");
    } catch (e) {
        console.log("⚠️ Gagal mengirim ke sheet (demo mode)");
    }
}

// Modal logic
let currentStep = 1;
let walletConnected = false;

function openMintModal() {
    document.getElementById('mintModal').classList.remove('hidden');
    currentStep = 1;
    walletConnected = false;
    document.getElementById('walletAddressDisplay').textContent = '';
    showStep();
    renderModalTasks();
}

function closeMintModal() {
    document.getElementById('mintModal').classList.add('hidden');
}

function showStep() {
    document.getElementById('stepContent1').classList.add('hidden');
    document.getElementById('stepContent2').classList.add('hidden');
    document.getElementById('stepContent3').classList.add('hidden');
    document.getElementById(`stepContent${currentStep}`).classList.remove('hidden');

    for (let i = 1; i <= 3; i++) {
        const pill = document.getElementById(`step${i}`);
        if (i < currentStep) {
            pill.classList.add('bg-emerald-400', 'text-black');
            pill.classList.remove('bg-gray-700');
        } else if (i === currentStep) {
            pill.classList.add('bg-[#f39c12]', 'text-black');
            pill.classList.remove('bg-gray-700');
        } else {
            pill.classList.remove('bg-emerald-400', 'bg-[#f39c12]', 'text-black');
            pill.classList.add('bg-gray-700');
        }
    }
}

function goToStep(step) {
    if (step <= currentStep || (step === 2 && walletConnected) || (step === 3 && walletConnected)) {
        currentStep = step;
        showStep();
    }
}

function nextStep() {
    if (currentStep === 1) {
        const done = tasks.filter(t => t.completed).length;
        if (done < 2) {
            alert("⚠️ Complete at least 2 tasks or claim Game WL first!");
            return;
        }
    }
    currentStep++;
    showStep();
}

function submitTasksAndContinue() {
    const username = document.getElementById('tgUsername').value.trim();
    if (!username || !username.startsWith('@')) {
        alert("Masukkan Telegram username kamu (@username)");
        return;
    }
    submitToGoogleSheet(username);
    nextStep();
}

function connectWalletInModal() {
    walletConnected = true;
    const fakeAddress = "EQ...b3a9f2k8x9p" + Math.floor(Math.random() * 9999);
    document.getElementById('walletAddressDisplay').innerHTML = `
        ✅ Connected<br>
        <span class="font-mono text-xs">${fakeAddress}</span>
    `;
    setTimeout(() => {
        if (currentStep === 2) nextStep();
    }, 800);
}

function connectWallet() {
    alert("🔗 TEMPO Wallet connected!\n\n(Demo - In real project this would open your TEMPO wallet)");
    walletConnected = true;
}

function performMint() {
    const number = Math.floor(Math.random() * 777) + 1;
    document.getElementById('randomBearNumber').textContent = number;
    const btn = event.currentTarget;
    btn.innerHTML = `<i class="fas fa-spinner animate-spin mr-3"></i> MINTING ON TEMPO...`;
    btn.disabled = true;
    
    setTimeout(() => {
        alert(`🎉 CONGRATULATIONS!\n\nYou minted Belly Bear #${number}!\n\nNFT sent to your wallet on TEMPO.`);
        closeMintModal();
        btn.innerHTML = `MINT BEAR #<span id="randomBearNumber">${number}</span>`;
        btn.disabled = false;
        let count = parseInt(document.getElementById('mintedCount').textContent) || 231;
        document.getElementById('mintedCount').textContent = count + 1;
    }, 2200);
}

// Animate roadmap
function animateRoadmap() {
    const cards = document.querySelectorAll('.roadmap-card');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.3 });
    cards.forEach(card => observer.observe(card));
}

// Mobile menu
function toggleMobileMenu() {
    const menu = document.getElementById('mobileMenu');
    menu.classList.toggle('hidden');
}

// ================== INITIALIZE SEMUA ==================
window.onload = async () => {
    loadTasks();
    renderTasksSection();
    animateRoadmap();

    // Inisialisasi Supabase + fetch leaderboard
    initSupabase();
    const leaderboardData = await fetchLeaderboard();
    renderLeaderboard(leaderboardData);

    // Fake live minted count
    setInterval(() => {
        let countEl = document.getElementById('mintedCount');
        let count = parseInt(countEl.textContent);
        if (count < 300) {
            countEl.textContent = count + Math.floor(Math.random() * 3) + 1;
        }
    }, 8000);

    console.log('%c✅ Belly Bears WEBSITE READY with Supabase Leaderboard!', 'color:#f39c12; font-size:15px; font-weight:bold');
};