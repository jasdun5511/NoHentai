// 引入本地数据库操作函数 (Importar funções do banco de dados)
import { getUserProfile, saveUserProfile, calculateContinuousDays } from './database.js';
// 引入心理学游戏化计分模型 (Importar modelo de pontuação)
import { VitalityScore } from './psychology_domain.js';

// 等待 HTML 骨架加载完毕 (Aguardar o carregamento do DOM)
document.addEventListener('DOMContentLoaded', async () => {
    console.log('[Sistema] Inicializando o motor Foco Matinal... (系统初始化...)');

    // 1. 获取我们在 index.html 里挖好的“坑位” (Obter elementos do DOM)
    const scoreValueEl = document.getElementById('score-value');
    const mainContentEl = document.getElementById('main-content');

    try {
        // 2. 从底层 IndexedDB 获取玩家存档 (Buscar dados do usuário)
        const userData = await getUserProfile();
        
        // 3. 动态计算真实专注天数 (Calcular dias de foco reais)
        const daysFocused = calculateContinuousDays(userData.startDateTimestamp);

        // 4. 渲染顶部的“生命力血条” (Renderizar barra de vitalidade)
        scoreValueEl.innerText = userData.vitalityScore;

        // 5. 动态构建主控台 (Construir painel principal)
        renderMainDashboard(daysFocused, userData.vitalityScore);

    } catch (error) {
        console.error('[Sistema] Erro fatal ao carregar dados:', error);
        mainContentEl.innerHTML = '<p style="color: red; text-align: center;">Erro ao acessar o banco de dados local. (读取本地数据库失败)</p>';
    }

// --- 核心仪表盘渲染函数 (Renderização do Painel Principal) ---
    function renderMainDashboard(days, score) {
        // 1. 动态生成核心卡片的 HTML 结构
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
        `;

        // 2. 给刚生成的破戒按钮绑定点击事件
        document.getElementById('btn-relapse').addEventListener('click', () => handleRelapse(score));

        // 3. 立即调用状态机，根据天数渲染下方的心理干预科普卡片
        applyDynamicUI(days);
    }

    // --- 第 4 阶段核心：时间线状态机与动态渲染 (Lógica de Máquina de Estados) ---
    function applyDynamicUI(days) {
        const stageContainer = document.getElementById('dynamic-stage-container');
        let stageInfo = {};

        if (days <= 7) {
            // 阶段 1：戒断与觉醒期
            stageInfo = {
                title: "Fase de Abstinência (戒断防御期)",
                color: "#e67e22", 
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
