// 1. Estados de Recuperação (康复阶段状态机配置)
// 用来告诉 UI 在不同天数下该如何表现，是防御(DEFENSIVE)还是安抚(PROTECTIVE)
export const RECOVERY_STAGES = {
  WITHDRAWAL: { 
    range: [1, 7], 
    ui_mode: "DEFENSIVE", 
    features: { show_panic_btn_prominently: true, high_frequency_checkin: true }
  },
  ENERGY_SPIKE: { 
    range: [8, 14], 
    ui_mode: "CONVERSION", 
    features: { recommend_exercise: true, hide_triggers: true }
  },
  FLATLINE: { 
    range: [15, 60], 
    ui_mode: "PROTECTIVE", // 平缓抑郁期：降低UI饱和度，隐藏竞争
    features: { hide_leaderboard: true, show_cbt_education: true, low_color_saturation: true }
  },
  EQUILIBRIUM: { 
    range: [61, Infinity], 
    ui_mode: "GROWTH", 
    features: { focus_on_life_metrics: true } // 稳态期：转向睡眠、专注度追踪
  }
};

// 2. Coeficiente de Vitalidade (生命力指数/恢复商数 模型)
// 彻底废弃 day++ 和 day=0 的残酷逻辑
export class VitalityScore {
  constructor(initialScore = 100) {
    this.score = initialScore; // Pontuação inicial (初始分数)
  }

  // 记录成功度过一天 (Registrar dia bem-sucedido)
  recordSuccess(isHardMode = false) {
    const bonus = isHardMode ? 2 : 1;
    this.score += bonus;
  }

  // 记录破戒 (Registrar recaída) - 核心心理学逻辑：扣分不归零，保护厌恶损失
  recordRelapse(severityLevel) {
    // severityLevel: 'BAIXA' (轻度), 'MÉDIA' (中度), 'ALTA' (重度)
    let penaltyMultiplier = 0;
    switch(severityLevel) {
      case 'BAIXA': penaltyMultiplier = 0.1; break; // 扣除 10%
      case 'MÉDIA': penaltyMultiplier = 0.25; break; // 扣除 25%
      case 'ALTA':  penaltyMultiplier = 0.4; break; // 扣除 40%
    }
    // 扣减当前分数，保留沉没成本 (Custo irrecuperável)
    this.score = Math.floor(this.score * (1 - penaltyMultiplier));
    return this.score;
  }
}
