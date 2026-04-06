// ================== GOOGLE SHEET CONFIG ==================
const SHEET_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwoLijBi7RfKLlqzgJrim1cV0VrSUJ9Pk_w8sjcBt-IBX-sgeLa4uHcEDaKhBUE-SEi/exec";

// ================== SUPABASE CONFIG ==================
// GANTI DENGAN DATA KAMU DARI SUPABASE DASHBOARD
const SUPABASE_URL = 'https://tfdxmqvkkiidujrunfcp.supabase.co';     // ← Project URL kamu
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmZHhtcXZra2lpZHVqcnVuZmNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0MjI5MTksImV4cCI6MjA4ODk5ODkxOX0.hKf_DquWy9dosADgAHedk7qyN4QPX31k8upzW4SDK3Q';                         // ← Anon Public Key kamu

let supabaseClient;
let userWalletAddress = null;



// ================== CONFETTI ==================
function launchConfetti() {
    const canvas = document.createElement('canvas');
    canvas.id = 'confetti-canvas';
    document.body.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#f39c12', '#e67e22', '#10b981', '#229ED9', '#f1c40f'];
    let particles = [];

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height - canvas.height;
            this.size = Math.random() * 12 + 6;
            this.speed = Math.random() * 8 + 5;
            this.angle = Math.random() * 360;
            this.color = colors[Math.floor(Math.random() * colors.length)];
        }
        update() {
            this.y += this.speed;
            this.angle += 8;
        }
        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angle * Math.PI / 180);
            ctx.fillStyle = this.color;
            ctx.fillRect(-this.size/2, -this.size/2, this.size, this.size);
            ctx.restore();
        }
    }

    for (let i = 0; i < 180; i++) {
        particles.push(new Particle());
    }

    function animateConfetti() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach((p, i) => {
            p.update();
            p.draw();
            if (p.y > canvas.height) particles.splice(i, 1);
        });
        if (particles.length > 0) requestAnimationFrame(animateConfetti);
        else canvas.remove();
    }
    animateConfetti();
}

// ================== LEADERBOARD REAL ONLY ==================
async function fetchLeaderboard() {
    const container = document.getElementById('leaderboardDemo');
    
    if (!container) {
        console.error('❌ Element #leaderboardDemo tidak ditemukan!');
        return;
    }

    try {
        console.log('🔄 Mengambil data leaderboard...');

        const { data, error } = await supabaseClient
            .from('highscores')
            .select('username, best_score')
            .order('best_score', { ascending: false })
            .limit(3);

        if (error) throw error;

        if (!data || data.length === 0) {
            container.innerHTML = `<p class="text-yellow-400 text-center py-8">Belum ada data di leaderboard</p>`;
            return;
        }

        container.innerHTML = data.map((p, i) => `
            <div class="leaderboard-row flex justify-between items-center bg-[#1e2937] px-5 py-3 rounded-2xl text-sm">
                <div class="flex items-center gap-3">
                    <span class="text-[#f39c12] font-bold">#${i+1}</span>
                    <span>${p.username}</span>
                </div>
                <span class="font-mono">${p.best_score} pts</span>
            </div>
        `).join('');

        console.log('✅ Leaderboard berhasil ditampilkan');

    } catch (err) {
        console.error('❌ Error leaderboard:', err);
        container.innerHTML = `<p class="text-red-400 text-center py-8">Gagal memuat leaderboard</p>`;
    }
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
    
    tasks.forEach((task, index) => {
        const div = document.createElement('div');
        div.className = `task-card group flex items-center justify-between p-6 rounded-3xl transition-all duration-500 ${task.completed ? 'task-completed' : 'bg-[#1e2937] hover:bg-[#2a2140]'}`;
        
        div.innerHTML = `
            <div class="flex items-center gap-4 flex-1">
                <!-- Circle Indicator -->
                ${task.completed 
                    ? `<div class="w-9 h-9 bg-emerald-500 rounded-2xl flex items-center justify-center text-white text-xl shadow-inner">✅</div>` 
                    : `<div class="w-9 h-9 border-2 border-gray-400 group-hover:border-[#f39c12] rounded-2xl flex items-center justify-center transition-colors"></div>`
                }
                
                <div class="flex-1">
                    <p class="${task.completed ? 'line-through text-gray-400' : 'text-white'} text-lg font-medium">
                        ${task.title}
                    </p>
                </div>
            </div>
            
            <div>
                ${task.completed 
                    ? `<span class="px-6 py-3 bg-emerald-400 text-black text-sm font-bold rounded-2xl">DONE</span>`
                    : task.gameTask 
                        ? `<button onclick="claimGameWL(); event.stopImmediatePropagation()" 
                                   class="px-8 py-3 bg-[#10b981] hover:bg-emerald-400 font-bold rounded-2xl text-sm transition-all">
                            VERIFY GAME WL
                           </button>`
                        : `<a href="${task.link}" target="_blank" onclick="markTask(${task.id}); event.stopImmediatePropagation()" 
                             class="px-8 py-3 bg-white/10 hover:bg-[#f39c12] hover:text-black font-semibold rounded-2xl text-sm transition-all">
                            DO TASK
                           </a>`
                }
            </div>
        `;
        container.appendChild(div);
    });

    // Update Progress Ring
    updateTaskProgress();
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

function updateTaskProgress() {
    const completed = tasks.filter(t => t.completed).length;
    const total = tasks.length;
    const percentage = (completed / total) * 100;
    
    const circle = document.getElementById('progressCircle');
    const text = document.getElementById('progressText');
    
    if (circle && text) {
        const circumference = 94.2; // 2 * PI * r (r=15)
        const offset = circumference - (percentage / 100 * circumference);
        circle.style.strokeDashoffset = offset;
        text.textContent = `${completed}/${total}`;
    }
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
        launchConfetti();                    // Tambahkan confetti saat klaim Game WL
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

let provider;
let signer;
let userWalletAddress = null;

// ================== INISIALISASI SUPABASE (SUDAH DIUPDATE) ==================
function initSupabase() {
    try {
        // Ini yang benar untuk CDN resmi Supabase
        const { createClient } = supabase;
        
        supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        
        console.log('✅ Supabase client berhasil diinisialisasi');
    } catch (e) {
        console.error('❌ Gagal init Supabase:', e);
        console.error('💡 Pastikan script CDN sudah ada di <head>');
    }
}

// ================== REAL WALLET CONNECT (TEMPO) ==================
async function connectWallet() {
    if (typeof window.ethereum === "undefined") {
        alert("❌ Please install MetaMask or Rabby Wallet first!");
        return;
    }

    try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        userWalletAddress = await signer.getAddress();

        alert(`✅ TEMPO Wallet Connected!\n\n${userWalletAddress}`);

        // Update tombol Connect Wallet
        document.querySelectorAll('button').forEach(btn => {
            if (btn.textContent.includes('Connect Wallet')) {
                btn.textContent = `✅ ${userWalletAddress.slice(0,6)}...${userWalletAddress.slice(-4)}`;
            }
        });
    } catch (e) {
        console.error(e);
        alert("❌ Gagal menghubungkan wallet");
    }
}

async function connectWalletInModal() {
    await connectWallet();
    if (userWalletAddress) {
        walletConnected = true;
        document.getElementById('walletAddressDisplay').innerHTML = `
            ✅ Connected<br>
            <span class="font-mono text-xs">${userWalletAddress}</span>
        `;
        setTimeout(() => { if (currentStep === 2) nextStep(); }, 800);
    }
}

// ================== CEK & SIMPAN MINT KE SUPABASE ==================
async function saveMintToSupabase(telegram, bearNumber) {
    if (!userWalletAddress) {
        alert("❌ Wallet belum terhubung!");
        return false;
    }

    try {
        // Cek apakah wallet sudah pernah claim
        const { data: existing } = await supabaseClient
            .from('whitelist_claims')
            .select('id')
            .eq('wallet_address', userWalletAddress)
            .single();

        if (existing) {
            alert("❌ Wallet ini sudah pernah claim whitelist!");
            return false;
        }

        // Simpan data baru
        const { error } = await supabaseClient
            .from('whitelist_claims')
            .insert({
                wallet_address: userWalletAddress,
                telegram: telegram,
                bear_number: bearNumber,
                tasks_completed: tasks.filter(t => t.completed).length
            });

        if (error) throw error;

        console.log('✅ Mint data berhasil disimpan ke Supabase');
        return true;

    } catch (err) {
        console.error('❌ Gagal menyimpan mint:', err);
        alert("❌ Gagal menyimpan data mint. Coba lagi.");
        return false;
    }
}

// ================== UPDATE performMint() ==================
async function performMint() {
    const number = Math.floor(Math.random() * 777) + 1;
    const tgUsername = document.getElementById('tgUsername').value.trim();

    const btn = event.currentTarget;
    btn.innerHTML = `<i class="fas fa-spinner animate-spin mr-3"></i> MINTING ON TEMPO...`;
    btn.disabled = true;

    try {
        // Simpan ke Supabase terlebih dahulu
        const saved = await saveMintToSupabase(tgUsername, number);
        
        if (!saved) {
            btn.innerHTML = `MINT BEAR #<span id="randomBearNumber">${number}</span>`;
            btn.disabled = false;
            return;
        }

        launchConfetti();

        setTimeout(() => {
            alert(`🎉 CONGRATULATIONS!\n\nYou minted Belly Bear #${number}!\n\nWallet: ${userWalletAddress}\n\nData telah disimpan.`);
            closeMintModal();
            
            btn.innerHTML = `MINT BEAR #<span id="randomBearNumber">${number}</span>`;
            btn.disabled = false;

            // Update counter
            let count = parseInt(document.getElementById('mintedCount').textContent) || 231;
            document.getElementById('mintedCount').textContent = count + 1;
        }, 1800);

    } catch (e) {
        console.error(e);
        alert("Terjadi kesalahan saat minting.");
        btn.innerHTML = `MINT BEAR #<span id="randomBearNumber">${number}</span>`;
        btn.disabled = false;
    }
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

    initSupabase();
    
    // Panggil leaderboard
    await fetchLeaderboard();

    // Fake minted count
    setInterval(() => {
        let countEl = document.getElementById('mintedCount');
        let count = parseInt(countEl.textContent);
        if (count < 300) {
            countEl.textContent = count + Math.floor(Math.random() * 3) + 1;
        }
    }, 8000);

    console.log('%c✅ Belly Bears WEBSITE READY!', 'color:#f39c12; font-size:15px; font-weight:bold');
};