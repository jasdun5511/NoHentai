console.log('[Sistema] Carregando app.js... (正在加载主程序)');

import { getUserProfile, saveUserProfile, calculateContinuousDays } from './database.js';
import { VitalityScore } from './psychology_domain.js';

// ==========================================
// 第 9 阶段：全局 Toast 提示引擎
// ==========================================
function showToast(message) {
    let toastEl = document.getElementById('custom-toast');
    if (!toastEl) {
        toastEl = document.createElement('div');
        toastEl.id = 'custom-toast';
        toastEl.className = 'toast-notification';
        document.body.appendChild(toastEl);
    }
    toastEl.innerText = message;
    toastEl.classList.add('show');
    setTimeout(() => toastEl.classList.remove('show'), 3000);
}

document.addEventListener('DOMContentLoaded', async () => {
    console.log('[Sistema] Motor iniciado.');

    const scoreValueEl = document.getElementById('score-value');
    const mainContentEl = document.getElementById('main-content');
    const panicBtn = document.getElementById('panic-btn');
    const panicOverlay = document.getElementById('panic-overlay');
    const closePanicBtn = document.getElementById('close-panic-btn');
    const relapseModal = document.getElementById('relapse-modal');

    let currentDays = 0;
    let currentScore = 100;

    // --- 第 5 阶段：急救模块 ---
    if (panicBtn && panicOverlay && closePanicBtn) {
        panicBtn.addEventListener('click', () => panicOverlay.classList.remove('hidden'));
        closePanicBtn.addEventListener('click', () => panicOverlay.classList.add('hidden'));
    }

    // --- 第 7 阶段：导航路由 ---
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            navItems.forEach(nav => nav.classList.remove('active'));
            e.currentTarget.classList.add('active');
            const target = e.currentTarget.getAttribute('data-target');
            if (target === 'home') renderMainDashboard(currentDays, currentScore);
            else if (target === 'premium') renderPremiumPage();
            else if (target === 'stats') mainContentEl.innerHTML = '<p style="text-align:center; margin-top:50px; color:#7f8c8d; font-weight:bold;">Estatísticas avançadas em breve...</p>';
        });
    });

    // --- 初始化数据库 ---
    try {
        const userData = await getUserProfile();
        currentDays = calculateContinuousDays(userData.startDateTimestamp);
        currentScore = userData.vitalityScore;
        if(scoreValueEl) scoreValueEl.innerText = currentScore;
        renderMainDashboard(currentDays, currentScore);
    } catch (error) {
        console.error('Erro fatal:', error);
        if(mainContentEl) mainContentEl.innerHTML = '<p style="color:red; text-align:center; margin-top:50px;">Erro de Inicialização do Banco de Dados.</p>';
    }

    // --- 渲染首页 ---
    function renderMainDashboard(days, score) {
        mainContentEl.innerHTML = `
            <div style="background: white; padding: 30px 20px; border-radius: 16px; text-align: center; margin-top: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); animation: fadeIn 0.3s ease;">
                <h2 style="color: var(--primary-color); font-size: 64px; margin-bottom: 5px; font-weight: 800;">${days}</h2>
                <p style="color: #7f8c8d; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Dias de Foco</p>
                <p style="font-size: 12px; color: #bdc3c7; margin-top: 5px;">(专注天数)</p>
                
                <button id="btn-relapse" style="margin-top: 40px; background: transparent; border: 1.5px solid #e74c3c; color: #e74c3c; padding: 12px 20px; border-radius: 12px; font-weight: bold; width: 100%; font-size: 16px; cursor: pointer;">
                    Registrar Recaída (记录破戒)
                </button>
            </div>
            
            <div id="dynamic-stage-container"></div>

            <div class="heatmap-container" style="background: white; padding: 20px; border-radius: 16px; margin-top: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
                <h3 style="font-size: 14px; color: #7f8c8d; margin-bottom: 15px; font-weight: 600;">Seu Histórico (历史记录)</h3>
                <div id="heatmap-grid" style="display: grid; grid-template-columns: repeat(12, 1fr); grid-template-rows: repeat(7, 1fr); gap: 4px; overflow-x: auto; padding-bottom: 10px;"></div>
            </div>
        `;

        // 点击破戒，先触发 9.3 阻力弹窗！
        const btnRelapse = document.getElementById('btn-relapse');
        if(btnRelapse) btnRelapse.addEventListener('click', () => showFrictionModal(score));
        
        applyDynamicUI(days);
        renderHeatmap(days);
    }

    // ==========================================
    // 第 9.3 阶段：防冲动“3秒冷静”确认框 (Modal de Fricção)
    // ==========================================
    function showFrictionModal(score) {
        let frictionModal = document.getElementById('friction-modal');
        if (!frictionModal) {
            frictionModal = document.createElement('div');
            frictionModal.id = 'friction-modal';
            document.body.appendChild(frictionModal);
        }

        frictionModal.innerHTML = `
            <div class="friction-content">
                <span style="font-size: 40px;">🛑</span>
                <h3 style="color: var(--text-color); margin: 10px 0;">Tem certeza? (你确定吗？)</h3>
                <p style="color: #7f8c8d; font-size: 14px; line-height: 1.5;">Respire fundo. Esse impulso vai passar em alguns minutos. Você é mais forte que isso.</p>
                
                <button class="btn-cancel-friction" id="fric-cancel-btn">Não, sou mais forte! (我能坚持住)</button>
                <button class="btn-confirm-friction" id="fric-confirm-btn" disabled>Sim, eu caí (3s...)</button>
            </div>
        `;
        
        frictionModal.classList.add('active');

        const btnConfirm = document.getElementById('fric-confirm-btn');
        const btnCancel = document.getElementById('fric-cancel-btn');

        // 取消破戒，返回首页
        btnCancel.onclick = () => {
            frictionModal.classList.remove('active');
            showToast('💪 Ótima decisão! Continue firme! (干得漂亮！)');
        };

        // 3秒倒计时逻辑
        let timeLeft = 3;
        const timer = setInterval(() => {
            timeLeft--;
            if (timeLeft > 0) {
                btnConfirm.innerText = `Sim, eu caí (${timeLeft}s...)`;
            } else {
                clearInterval(timer);
                btnConfirm.disabled = false;
                btnConfirm.innerText = "Sim, eu caí (记录破戒)";
            }
        }, 1000);

        // 倒计时结束后，点击进入问卷阶段
        btnConfirm.onclick = () => {
            clearInterval(timer);
            frictionModal.classList.remove('active');
            showRelapseModal(score); // 唤出结构化问卷
        };
    }

    // --- 第 4 阶段：动态阶段适配 ---
    function applyDynamicUI(days) {
        const stageContainer = document.getElementById('dynamic-stage-container');
        if(!stageContainer) return;
        let stageInfo = {};

        if (days <= 7) {
            stageInfo = { title: "Fase de Abstinência", color: "#e67e22", icon: "🛡️", message: "O cérebro está exigindo dopamina. Mantenha a guarda alta." };
        } else if (days <= 14) {
            stageInfo = { title: "Pico de Energia", color: "#f39c12", icon: "⚡", message: "Canalize essa energia para um treino pesado ou estudos." };
        } else if (days <= 60) {
            stageInfo = { title: "Fase de Estabilização", color: "#3498db", icon: "🧠", message: "A névoa mental é normal agora. Descanse sem culpa." };
            document.body.style.backgroundColor = "#e8f4f8"; 
        } else {
            stageInfo = { title: "Equilíbrio", color: "#2ecc71", icon: "🌱", message: "A clareza mental voltou. Continue esculpindo seus objetivos." };
        }

        stageContainer.innerHTML = `
            <div style="background-color: ${stageInfo.color}15; border-left: 4px solid ${stageInfo.color}; padding: 20px; margin-top: 25px; border-radius: 8px;">
                <h3 style="color: ${stageInfo.color}; font-size: 16px; margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
                    <span>${stageInfo.icon}</span> ${stageInfo.title}
                </h3>
                <p style="font-size: 14px; color: #555; line-height: 1.5;">${stageInfo.message}</p>
            </div>
        `;
    }

    // --- 第 6 阶段：热力图渲染 ---
    function renderHeatmap(days) {
        const gridEl = document.getElementById('heatmap-grid');
        if(!gridEl) return;
        const totalBoxes = 84; 
        let html = '';
        for (let i = 1; i <= totalBoxes; i++) {
            if (i <= days) html += `<div style="width: 16px; height: 16px; border-radius: 3px; background-color: #2ecc71;"></div>`; 
            else html += `<div style="width: 16px; height: 16px; border-radius: 3px; background-color: #ebedf0;"></div>`; 
        }
        gridEl.innerHTML = html;
    }

    // --- 第 6 阶段：结构化问卷逻辑 ---
    let selectedTrigger = null;
    function showRelapseModal(score) {
        if(!relapseModal) return;
        relapseModal.classList.add('active');
        selectedTrigger = null; 
        
        const triggerBtns = document.querySelectorAll('.trigger-btn');
        triggerBtns.forEach(btn => btn.classList.remove('selected')); 

        triggerBtns.forEach(btn => {
            btn.onclick = () => {
                triggerBtns.forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                selectedTrigger = btn.getAttribute('data-trigger');
            };
        });

        document.getElementById('cancel-relapse-btn').onclick = () => relapseModal.classList.remove('active');

        document.getElementById('confirm-relapse-btn').onclick = async () => {
            if (!selectedTrigger) {
                showToast('⚠️ Selecione um gatilho para continuar. (请选择诱发原因)');
                return;
            }
            
            const vitalitySystem = new VitalityScore(score);
            const newScore = vitalitySystem.recordRelapse('MÉDIA');
            const userData = await getUserProfile();
            userData.vitalityScore = newScore;
            await saveUserProfile(userData);
            
            window.location.reload();
        };
    }

    // --- 第 7 阶段：Premium 销售页 ---
    function renderPremiumPage() {
        mainContentEl.innerHTML = `
            <div style="background: white; padding: 30px 20px; border-radius: 16px; margin-top: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
                <div style="text-align: center; margin-bottom: 25px;">
                    <span style="font-size: 48px;">💎</span>
                    <h2 style="color: var(--text-color); margin-top: 10px;">Foco Premium</h2>
                    <p style="color: #7f8c8d; font-size: 14px;">Domine sua mente.</p>
                </div>
                <ul style="list-style: none; padding: 0; margin-bottom: 30px; color: #34495e; line-height: 2; text-align: left;">
                    <li>🔓 <strong style="color: var(--primary-color);">Gráficos Avançados</strong></li>
                    <li>🎧 <strong style="color: var(--primary-color);">Áudios de Terapia CBT</strong></li>
                    <li>☁️ <strong style="color: var(--primary-color);">Backup em Nuvem</strong></li>
                    <li>⚔️ <strong style="color: var(--primary-color);">Modo Batalha</strong></li>
                </ul>
                <div style="background: #f8f9fa; border: 2px solid #32BCAD; padding: 20px; border-radius: 12px; text-align: center; position: relative;">
                    <span style="background: #e74c3c; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; position: absolute; top: -12px; left: 10px;">-50% HOJE</span>
                    <p style="font-weight: 800; color: #2c3e50; font-size: 18px;">Acesso Vitalício</p>
                    <p style="font-size: 36px; color: #32BCAD; font-weight: 900; margin: 10px 0;">R$ 49,90</p>
                    <button id="pay-pix-btn" style="background: #32BCAD; color: white; width: 100%; padding: 16px; border: none; border-radius: 10px; font-weight: 800; font-size: 16px; cursor: pointer;">
                        Pagar com PIX
                    </button>
                </div>
            </div>
        `;

        document.getElementById('pay-pix-btn').addEventListener('click', () => {
            const pixCode = "00020126580014br.gov.bcb.pix0136..."; 
            navigator.clipboard.writeText(pixCode).then(() => {
                showToast('✓ Código PIX copiado com sucesso! (PIX已复制)');
            }).catch(() => {
                showToast('❌ Erro ao gerar código PIX.');
            });
        });
    }
});
