import { NextRequest, NextResponse } from 'next/server';
import { resolveUser, getUserIdFromRequest } from '@/lib/auth/helpers';
import { getMiniProgramAccount, MINI_PLANS } from '@/lib/miniprogram/entitlements';

export async function GET(request: NextRequest) {
  try {
    const user = await resolveUser(getUserIdFromRequest(request));
    const plans = Object.entries(MINI_PLANS).map(([code, plan]) => ({ code, ...plan }));
    if (!user) {
      return NextResponse.json({
        user: null,
        account: { planCode: 'trial', plan: MINI_PLANS.trial, credits: 0, usedCredits: 0 },
        plans,
        aiConfigured: Boolean(process.env.AI_API_KEY),
      });
    }

    const account = await getMiniProgramAccount(user.id);
    return NextResponse.json({
      user: { id: user.id, name: user.name || '职策AI用户', avatarUrl: user.avatarUrl || '' },
      account,
      plans,
      aiConfigured: Boolean(process.env.AI_API_KEY),
    });
  } catch (error) {
    console.error('GET /api/miniprogram/overview error:', error);
    return NextResponse.json({ error: 'Failed to load mini program overview' }, { status: 500 });
  }
}
