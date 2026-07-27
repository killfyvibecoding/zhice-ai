import { userRepository } from '@/lib/db/repositories/user.repository';

export const MINI_PLANS = {
  trial: { name: '体验版', credits: 200, price: 0, label: '微信登录后领取体验积分' },
  standard: { name: '专业版', credits: 2000, price: 29.9, label: '适合日常求职使用' },
  pro: { name: '旗舰版', credits: 6000, price: 69.9, label: '适合高频求职与面试准备' },
} as const;

export const MINI_CREDIT_COSTS = {
  generateResume: 80,
  optimizeResume: 80,
  linkedinPhoto: 120,
  interviewTurn: 20,
} as const;

export const MINI_INSUFFICIENT_CREDITS_MESSAGE = '当前积分不足，请前往套餐页获取积分';
const MINI_DEBUG_CREDITS = 999999;
export const isMiniProgramDebugCreditsEnabled =
  process.env.NODE_ENV !== 'production' && process.env.MINIPROGRAM_DEBUG_CREDITS === 'true';

export type MiniPlanCode = keyof typeof MINI_PLANS;

export async function getMiniProgramAccount(userId: string) {
  const settings = await userRepository.getSettings(userId);
  const planCode = (settings.miniPlan as MiniPlanCode) || 'trial';
  const plan = MINI_PLANS[planCode] || MINI_PLANS.trial;
  const credits = typeof settings.miniCredits === 'number' ? settings.miniCredits : plan.credits;
  const usedCredits = typeof settings.miniUsedCredits === 'number' ? settings.miniUsedCredits : 0;

  if (settings.miniPlan !== planCode || settings.miniCredits !== credits || settings.miniUsedCredits !== usedCredits) {
    await userRepository.updateSettings(userId, {
      miniPlan: planCode,
      miniCredits: credits,
      miniUsedCredits: usedCredits,
    });
  }

  return {
    planCode,
    plan,
    credits: isMiniProgramDebugCreditsEnabled ? MINI_DEBUG_CREDITS : credits,
    usedCredits,
  };
}

export async function consumeMiniProgramCredits(userId: string, cost: number) {
  const account = await getMiniProgramAccount(userId);
  // Development-only switch: keep the test account usable without changing
  // the stored balance. NODE_ENV production can never enter this branch.
  if (isMiniProgramDebugCreditsEnabled) return account;
  if (account.credits < cost) {
    throw new Error('INSUFFICIENT_CREDITS');
  }

  const credits = account.credits - cost;
  const usedCredits = account.usedCredits + cost;
  await userRepository.updateSettings(userId, { miniCredits: credits, miniUsedCredits: usedCredits });
  return { ...account, credits, usedCredits };
}
