// 1. Estrutura de Precificação (定价层级结构)
export const PRICING_TIERS = {
  LATAM_BR: {
    currency: "BRL",
    tier_lifetime: { amount: 49.90, method: "PIX_DYNAMIC_QR" }, // 巴西主推单次买断
    features_unlocked: ["github_style_heatmap", "cbt_audio", "offline_sync"]
  },
  EUROPE: {
    currency: "EUR",
    tier_monthly: { amount: 5.99, method: "STRIPE" }, // 欧洲主推月度订阅
    features_unlocked: ["github_style_heatmap", "cbt_audio", "offline_sync"]
  }
};

// 2. Contrato de Comprometimento (对赌协议模型)
// 结合厌恶损失(Aversão à perda)的高阶商业化玩法
export class CommitmentContract {
  constructor(userId, stakedAmountBRL) {
    this.userId = userId;
    this.stakedAmount = stakedAmountBRL; // Valor apostado (质押金额)
    this.targetDays = 90;
    this.status = "ATIVO"; // ATIVO(活跃), REEMBOLSADO(已退款), PERDIDO(已没收)
    this.startDate = Date.now();
  }

  evaluateDailyCheckIn(isCheckedIn) {
    if (!isCheckedIn) {
      this.status = "PERDIDO";
      return this.triggerCharityDonation(); // 未签到，没收押金捐赠慈善
    }
    // 逻辑：如果连续打卡达到 90 天，状态变为 REEMBOLSADO 退款
  }

  triggerCharityDonation() {
    console.log(`R$ ${this.stakedAmount} doados. (已捐赠)`);
  }
}
