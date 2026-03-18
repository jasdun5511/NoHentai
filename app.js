import { getUserProfile, saveUserProfile, calculateContinuousDays } from './database.js';
import { VitalityScore } from './psychology_domain.js';

document.addEventListener('DOMContentLoaded', async () => {
    console.log('[Sistema] Motor Foco Matinal iniciado...');

    const scoreValueEl = document.getElementById('score-value');
    const mainContentEl = document.getElementById('main-content');

    // --- 第 5 阶段：急救干预逻辑节点获取 ---
    const panicBtn = document.getElementById('panic-btn');
    const panicOverlay = document.getElementById('panic-overlay');
    const closePanicBtn = document.getElementById('close-panic-btn');

    // 触发急救：移除隐藏类，全屏接管大脑
    panicBtn.addEventListener('click', () => {
        panicOverlay.classList.remove('hidden');
        console.log('[Sistema] Modo de emergência ativado! (急救模式激活)');
    });

    // 解除急救：恢复正常界面
    closePanicBtn.addEventListener('click', () => {
        panicOverlay.classList.add('hidden');
    });

    try {
        const userData = await getUserProfile();
        const daysFocused = calculateContinuousDays(userData.startDateTimestamp);
        
        scoreValueEl.innerText = userData.vitalityScore;
        
        renderMainDashboard(daysFocused, userData.vitalityScore);

    } catch (error) {
        console.error('Erro fatal:', error);
        mainContentEl.innerHTML = '<p style="color: red;">Erro ao acessar banco de dados.</p>';
    }

  function renderMainDashboard(days, score) {
        mainContentEl.innerHTML = `
            <div style="background: white; padding: 30px 20px; border-radius: 16px; text-align: center; margin-top: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
                <h2 style="color: var(--primary-color); font-size: 64px; margin-bottom: 5px; font-weight: 800;">${days}</h2>
                <p style="color: #7f8c8d; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Dias de Foco</p>
                <p style="font-size: 12px; color: #bdc3c7; margin-top: 5px;">(专注天数)</p>
                
                <button id="btn-relapse" style="margin-top: 40px; background: transparent; border: 1.5px solid #e74c3c; color: #e74c3c; padding: 12px 20px; border-radius: 12px; font-weight: bold; width: 100%; font-size: 16px; cursor: pointer;">
                    Registrar Recaída (记录破戒)
                </button>
            </div>
            
            <div id="dynamic-stage-container"></div>

            <div class="heatmap-container">
                <h3 class="heatmap-title">Seu Histórico (历史记录)</h3>
                <div class="heatmap-grid" id="heatmap-grid"></div>
            </div>
        `;

        document.getElementById('btn-relapse').addEventListener('click', () => showRelapseModal(score));
        applyDynamicUI(days);
        renderHeatmap(days); // 渲染热力图
    }

    // --- 第 6 阶段：渲染热力图 (Renderizar Mapa de Calor) ---
    function renderHeatmap(currentDays) {
        const gridEl = document.getElementById('heatmap-grid');
        const totalBoxes = 84; // 12 周 x 7 天
        
        let html = '';
        for (let i = 1; i <= totalBoxes; i++) {
            // 简单逻辑：如果你坚持了20天，前20个格子就是绿色的
            if (i <= currentDays) {
                html += `<div class="day-box success"></div>`;
            } else {
                html += `<div class="day-box"></div>`;
            }
        }
        gridEl.innerHTML = html;
    }

    // --- 第 6 阶段：结构化问卷逻辑 (Lógica do Questionário) ---
    const relapseModal = document.getElementById('relapse-modal');
    let selectedTrigger = null;

    function showRelapseModal(currentScore) {
        relapseModal.classList.add('active');
        
        // 绑定触发器按钮的选择效果
        const triggerBtns = document.querySelectorAll('.trigger-btn');
        triggerBtns.forEach(btn => {
            btn.onclick = () => {
                triggerBtns.forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                selectedTrigger = btn.getAttribute('data-trigger');
            };
        });

        // 取消按钮
        document.getElementById('cancel-relapse-btn').onclick = () => {
            relapseModal.classList.remove('active');
        };

        // 确认提交按钮
        document.getElementById('confirm-relapse-btn').onclick = async () => {
            if (!selectedTrigger) {
                alert('Por favor, selecione um gatilho. (请选择诱发原因)');
                return;
            }
            // 执行扣分逻辑
            const vitalitySystem = new VitalityScore(currentScore);
            const newScore = vitalitySystem.recordRelapse('MÉDIA');
            const userData = await getUserProfile();
            userData.vitalityScore = newScore;
            
            // 未来可将 selectedTrigger 存入 database 的 relapse_logs 数组中
            
            await saveUserProfile(userData);
            window.location.reload();
        };
    }
    function applyDynamicUI(days) {
        const stageContainer = document.getElementById('dynamic-stage-container');
        let stageInfo = {};

        if (days <= 7) {
            stageInfo = {
                title: "Fase de Abstinência (戒断防御期)",
                color: "#e67e22", 
                icon: "🛡️",
                message: "O cérebro está exigindo dopamina. Os impulsos são fortes, mas temporários. Mantenha a guarda alta. (多巴胺极度渴望，保持警惕)"
            };
        } else if (days <= 14) {
            stageInfo = {
                title: "Pico de Energia (能量激增期)",
                color: "#f39c12", 
                icon: "⚡",
                message: "Níveis hormonais flutuando. Canalize essa energia para um treino pesado ou foco nos estudos. (将过剩的能量转化为运动或学习)"
            };
        } else if (days <= 60) {
            stageInfo = {
                title: "Fase de Estabilização (平缓修复期)",
                color: "#3498db", 
                icon: "🧠",
                message: "A névoa mental é normal agora. O cérebro está reestruturando os receptores. Descanse sem culpa. (脑雾是正常的受体重组现象，允许自己休息)"
            };
            document.body.style.backgroundColor = "#e8f4f8"; 
        } else {
            stageInfo = {
                title: "Equilíbrio (稳态掌控期)",
                color: "#2ecc71", 
                icon: "🌱",
                message: "Receptores restaurados. A clareza mental voltou. Continue esculpindo seus objetivos. (受体已恢复，继续雕琢你的长期目标)"
            };
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

    async function handleRelapse(currentScore) {
        const confirmRelapse = confirm("Tem certeza? Sua vitalidade será reduzida, mas você NÃO voltará ao zero.");
        if (confirmRelapse) {
            const vitalitySystem = new VitalityScore(currentScore);
            const newScore = vitalitySystem.recordRelapse('MÉDIA');
            const userData = await getUserProfile();
            userData.vitalityScore = newScore;
            await saveUserProfile(userData);
            window.location.reload();
        }
    }
});                color: "#e67e22", 
                icon: "🛡️",
                message: "O cérebro está exigindo dopamina. Os impulsos são fortes, mas temporários. Mantenha a guarda alta. (多巴胺极度渴望，保持警惕)"
            };
        } else if (days <= 14) {
            // 阶段 2：能量激增期
            stageInfo = {
                title: "Pico de Energia (能量激增期)",
                color: "#f39c12", 
                icon: "⚡",
                message: "Níveis hormonais flutuando. Canalize essa energia para um treino pesado ou foco nos estudos. (将过剩的能量转化为运动或学习)"
            };
        } else if (days <= 60) {
            // 阶段 3：平缓抑郁期 (Flatline)
            stageInfo = {
                title: "Fase de Estabilização (平缓修复期)",
                color: "#3498db", 
                icon: "🧠",
                message: "A névoa mental é normal agora. O cérebro está reestruturando os receptores. Descanse sem culpa. (脑雾是正常的受体重组现象，允许自己休息)"
            };
            // 改变全局背景色，变得更加柔和
            document.body.style.backgroundColor = "#e8f4f8"; 
        } else {
            // 阶段 4：稳态平衡期
            stageInfo = {
                title: "Equilíbrio (稳态掌控期)",
                color: "#2ecc71", 
                icon: "🌱",
                message: "Receptores restaurados. A clareza mental voltou. Continue esculpindo seus objetivos. (受体已恢复，继续雕琢你的长期目标)"
            };
        }

        // 注入科普卡片 HTML
        stageContainer.innerHTML = `
            <div style="background-color: ${stageInfo.color}15; border-left: 4px solid ${stageInfo.color}; padding: 20px; margin-top: 25px; border-radius: 8px;">
                <h3 style="color: ${stageInfo.color}; font-size: 16px; margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
                    <span>${stageInfo.icon}</span> ${stageInfo.title}
                </h3>
                <p style="font-size: 14px; color: #555; line-height: 1.5;">${stageInfo.message}</p>
            </div>
        `;
    }
