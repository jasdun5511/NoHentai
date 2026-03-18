// ==========================================
// Foco Matinal - Motor Principal (主引擎)
// ==========================================

import { getUserProfile, saveUserProfile, calculateContinuousDays } from './database.js';
import { VitalityScore } from './psychology_domain.js';

document.addEventListener('DOMContentLoaded', async () => {
    console.log('[Sistema] Motor Foco Matinal iniciado... (系统启动)');

    // 1. 获取全局 DOM 节点
    const scoreValueEl = document.getElementById('score-value');
    const mainContentEl = document.getElementById('main-content');
    
    // 急救模块节点
    const panicBtn = document.getElementById('panic-btn');
    const panicOverlay = document.getElementById('panic-overlay');
    const closePanicBtn = document.getElementById('close-panic-btn');
    
    // 问卷弹窗节点
    const relapseModal = document.getElementById('relapse-modal');

    // 全局状态变量 (提升作用域以便各个函数调用)
    let currentDays = 0;
    let currentScore = 100;

    // ==========================================
    // 第 5 阶段：急救干预逻辑 (Modo de Emergência)
    // ==========================================
    panicBtn.addEventListener('click', () => {
        panicOverlay.classList.remove('hidden');
        console.log('[Sistema] Emergência ativada! (急救激活)');
    });

    closePanicBtn.addEventListener('click', () => {
        panicOverlay.classList.add('hidden');
    });

    // ==========================================
    // 第 7 阶段：底部导航路由切换 (Roteamento)
    // ==========================================
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            // 切换高亮状态
            navItems.forEach(nav => nav.classList.remove('active'));
            e.currentTarget.classList.add('active');

            // 路由判断
            const target = e.currentTarget.getAttribute('data-target');
            if (target === 'home') {
                renderMainDashboard(currentDays, currentScore);
            } else if (target === 'premium') {
                renderPremiumPage();
            } else if (target === 'stats') {
                mainContentEl.innerHTML = '<p style="text-align:center; margin-top:50px; color:#7f8c8d; font-weight:bold;">Estatísticas avançadas em breve... <br><br>(高级统计图表开发中...)</p>';
            }
        });
    });

    // ==========================================
    // 核心初始化：读取数据库并挂载首页
    // ==========================================
    try {
        const userData = await getUserProfile();
        currentDays = calculateContinuousDays(userData.startDateTimestamp);
        currentScore = userData.vitalityScore;
        
        // 渲染顶部生命力分数
        scoreValueEl.innerText = currentScore;
        
        // 初始进入 App，渲染首页仪表盘
        renderMainDashboard(currentDays, currentScore);

    } catch (error) {
        console.error('Erro fatal:', error);
        mainContentEl.innerHTML = '<p style="color: red; text-align: center; margin-top: 20px;">Erro ao acessar banco de dados local. (读取本地数据库失败)</p>';
    }

    // ==========================================
    // 渲染：首页仪表盘 (Dashboard Principal)
    // ==========================================
    function renderMainDashboard(days, score) {
        mainContentEl.innerHTML = `
            <div style="background: white; padding: 30px 20px; border-radius: 16px; text-align: center; margin-top: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); animation: fadeIn 0.3s ease;">
                <h2 style="color: var(--primary-color); font-size: 64px; margin-bottom: 5px; font-weight: 800;">${days}</h2>
                <p style="color: #7f8c8d; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Dias de Foco</p>
                <p style="font-size: 12px; color: #bdc3c7; margin-top: 5px;">(专注天数)</p>
                
                <button id="btn-relapse" style="margin-top: 40px; background: transparent; border: 1.5px solid #e74c3c; color: #e74c3c; padding: 12px 20px; border-radius: 12px; font-weight: bold; width: 100%; font-size: 16px; cursor: pointer; transition: background 0.2s;">
                    Registrar Recaída (记录破戒)
                </button>
            </div>
            
            <div id="dynamic-stage-container"></div>

            <div class="heatmap-container">
                <h3 class="heatmap-title">Seu Histórico (历史记录)</h3>
                <div class="heatmap-grid" id="heatmap-grid"></div>
            </div>
        `;

        // 绑定按钮事件
        document.getElementById('btn-relapse').addEventListener('click', () => showRelapseModal(score));
        
        // 触发动态阶段适配和热力图渲染
        applyDynamicUI(days);
        renderHeatmap(days);
    }

    // ==========================================
    // 第 4 阶段：动态阶段适配 (Máquina de Estados)
    // ==========================================
    function applyDynamicUI(days) {
        const stageContainer = document.getElementById('dynamic-stage-container');
        let stageInfo = {};

        if (days <= 7) {
            stageInfo = {
                title: "Fase de Abstinência (戒断防御期)", color: "#e67e22", icon: "🛡️",
                message: "O cérebro está exigindo dopamina. Mantenha a guarda alta. (多巴胺极度渴望，保持警惕)"
            };
            document.body.style.backgroundColor = "var(--bg-color)";
        } else if (days <= 14) {
            stageInfo = {
                title: "Pico de Energia (能量激增期)", color: "#f39c12", icon: "⚡",
                message: "Canalize essa energia para um treino pesado ou estudos. (将过剩能量转化为运动或学习)"
            };
            document.body.style.backgroundColor = "var(--bg-color)";
        } else if (days <= 60) {
            stageInfo = {
                title: "Fase de Estabilização (平缓修复期)", color: "#3498db", icon: "🧠",
                message: "A névoa mental é normal agora. Descanse sem culpa. (脑雾是正常的受体重组现象，允许自己休息)"
            };
            // 平缓期极其危险，系统自动降低整体色彩饱和度来安抚用户
            document.body.style.backgroundColor = "#e8f4f8"; 
        } else {
            stageInfo = {
                title: "Equilíbrio (稳态掌控期)", color: "#2ecc71", icon: "🌱",
                message: "A clareza mental voltou. Continue esculpindo seus objetivos. (受体已恢复，继续雕琢长期目标)"
            };
            document.body.style.backgroundColor = "var(--bg-color)";
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

    // ==========================================
    // 第 6 阶段：热力图渲染 (Mapa de Calor)
    // ==========================================
    function renderHeatmap(days) {
        const gridEl = document.getElementById('heatmap-grid');
        const totalBoxes = 84; // 12 周 * 7 天 = 84 天的视野
        
        let html = '';
        for (let i = 1; i <= totalBoxes; i++) {
            if (i <= days) {
                html += `<div class="day-box success"></div>`; // 成功打卡
            } else {
                html += `<div class="day-box"></div>`; // 未来天数
            }
        }
        gridEl.innerHTML = html;
    }

    // ==========================================
    // 第 6 阶段：结构化问卷逻辑 (Modal de Recaída)
    // ==========================================
    let selectedTrigger = null;

    function showRelapseModal(score) {
        relapseModal.classList.add('active');
        selectedTrigger = null; // 重置选择
        
        const triggerBtns = document.querySelectorAll('.trigger-btn');
        triggerBtns.forEach(btn => btn.classList.remove('selected')); // 重置按钮 UI

        // 绑定触发器按钮点击
        triggerBtns.forEach(btn => {
            btn.onclick = () => {
                triggerBtns.forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                selectedTrigger = btn.getAttribute('data-trigger');
            };
        });

        // 取消破戒
        document.getElementById('cancel-relapse-btn').onclick = () => {
            relapseModal.classList.remove('active');
        };

        // 确认破戒并提交问卷
        document.getElementById('confirm-relapse-btn').onclick = async () => {
            if (!selectedTrigger) {
                alert('Por favor, selecione um gatilho. (请选择诱发原因以继续)');
                return;
            }
            
            // 实例化心理学计分系统并扣分 (扣除25%)
            const vitalitySystem = new VitalityScore(score);
            const newScore = vitalitySystem.recordRelapse('MÉDIA');
            
            // 更新数据库并保存
            const userData = await getUserProfile();
            userData.vitalityScore = newScore;
            // 真实项目中，可以在这里把 selectedTrigger 存入一个数组进行日志记录
            await saveUserProfile(userData);
            
            // 刷新页面，让新的分数生效
            window.location.reload();
        };
    }

    // ==========================================
    // 第 7 阶段：Premium 销售页与 PIX 网关模拟
    // ==========================================
    function renderPremiumPage() {
        mainContentEl.innerHTML = `
            <div style="background: white; padding: 30px 20px; border-radius: 16px; margin-top: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); animation: fadeIn 0.3s ease;">
                
                <div style="text-align: center; margin-bottom: 25px;">
                    <span style="font-size: 48px;">💎</span>
                    <h2 style="color: var(--text-color); margin-top: 10px;">Foco Premium</h2>
                    <p style="color: #7f8c8d; font-size: 14px;">Domine sua mente. (掌控你的大脑)</p>
                </div>

                <ul style="list-style: none; padding: 0; margin-bottom: 30px; color: #34495e; line-height: 2;">
                    <li>🔓 <strong style="color: var(--primary-color);">Gráficos de Calor Avançados</strong> (高级数据热力图)</li>
                    <li>🎧 <strong style="color: var(--primary-color);">Áudios de Terapia CBT</strong> (临床认知疗愈音频)</li>
                    <li>☁️ <strong style="color: var(--primary-color);">Backup Seguro em Nuvem</strong> (云端加密备份)</li>
                    <li>⚔️ <strong style="color: var(--primary-color);">Modo Batalha com Amigos</strong> (同侪对战模式)</li>
                </ul>

                <div style="background: #f8f9fa; border: 2px solid #32BCAD; padding: 20px; border-radius: 12px; text-align: center; position: relative;">
                    <span style="background: #e74c3c; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; position: absolute; top: -12px; left: -10px;">-50% HOJE</span>
                    <p style="font-weight: 800; color: #2c3e50; font-size: 18px;">Acesso Vitalício (终身买断)</p>
                    <p style="font-size: 36px; color: #32BCAD; font-weight: 900; margin: 10px 0;">R$ 49,90</p>
                    <p style="font-size: 12px; color: #95a5a6; margin-bottom: 15px;">Pagamento único. Sem assinaturas. (无月租)</p>
                    
                    <button id="pay-pix-btn" style="background: #32BCAD; color: white; width: 100%; padding: 16px; border: none; border-radius: 10px; font-weight: 800; font-size: 16px; cursor: pointer; box-shadow: 0 4px 15px rgba(50, 188, 173, 0.4); display: flex; justify-content: center; align-items: center; gap: 8px; transition: transform 0.2s;">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L2 7L12 12L22 7L12 2Z" fill="white"/><path d="M2 17L12 22L22 17M2 12L12 17L22 12" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                        Pagar com PIX
                    </button>
                </div>
            </div>
        `;

        document.getElementById('pay-pix-btn').addEventListener('click', () => {
            const pixCode = "00020126580014br.gov.bcb.pix0136..."; 
            navigator.clipboard.writeText(pixCode).then(() => {
                alert('✓ Código PIX copiado! \n\n(PIX代码已复制，请打开您的银行 App 进行支付。真实项目中，支付成功后此处将解锁高级功能。)');
            }).catch(err => {
                console.error('Erro ao copiar:', err);
                alert('Erro ao gerar código PIX.');
            });
        });
    }
});    function renderHeatmap(currentDays) {
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
