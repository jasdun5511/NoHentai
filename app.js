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

    // --- 核心渲染函数 ---
    function renderMainDashboard(days, score) {
        // 使用 JavaScript 动态向 <main> 标签内注入卡片 HTML
        mainContentEl.innerHTML = `
            <div style="background: white; padding: 30px 20px; border-radius: 16px; text-align: center; margin-top: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
                <h2 style="color: var(--primary-color); font-size: 64px; margin-bottom: 5px; font-weight: 800;">${days}</h2>
                <p style="color: #7f8c8d; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Dias de Foco</p>
                <p style="font-size: 12px; color: #bdc3c7; margin-top: 5px;">(专注天数)</p>
                
                <button id="btn-relapse" style="margin-top: 40px; background: transparent; border: 1.5px solid #e74c3c; color: #e74c3c; padding: 12px 20px; border-radius: 12px; font-weight: bold; width: 100%; font-size: 16px;">
                    Registrar Recaída (记录破戒)
                </button>
            </div>
        `;

        // 给刚刚生成的破戒按钮绑定点击事件 (Vincular evento de clique)
        document.getElementById('btn-relapse').addEventListener('click', () => handleRelapse(score));
    }

    // --- 核心游戏化防流失逻辑 (Lógica de gamificação) ---
    async function handleRelapse(currentScore) {
        // 弹出原生确认框，给予用户最后一次后悔的机会
        const confirmRelapse = confirm("Tem certeza? Sua vitalidade será reduzida, mas você NÃO voltará ao zero. (确定要记录破戒吗？生命力会降低，但绝对不会归零！)");
        
        if (confirmRelapse) {
            // 实例化心理学计分系统
            const vitalitySystem = new VitalityScore(currentScore);
            
            // 假设记录一次中度破戒 (Gravidade média)，按照我们之前的设计，扣除 25% 的分数
            const newScore = vitalitySystem.recordRelapse('MÉDIA');
            
            // 更新数据库里的存档
            const userData = await getUserProfile();
            userData.vitalityScore = newScore;
            // 注意：这里我们故意不重置 startDateTimestamp，保护天数不断！
            await saveUserProfile(userData);
            
            // 重新刷新页面以展现扣分结果 (Recarregar a página)
            window.location.reload();
        }
    }
});
