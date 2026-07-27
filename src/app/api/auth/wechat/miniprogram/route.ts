import { NextRequest, NextResponse } from 'next/server';
import { createWechatSession } from '@/lib/auth/wechat-session';
import { userRepository } from '@/lib/db/repositories/user.repository';
import { dbReady } from '@/lib/db';

async function exchangeCode(code: string) {
  const appId = process.env.WECHAT_MINIPROGRAM_APP_ID;
  const appSecret = process.env.WECHAT_MINIPROGRAM_APP_SECRET;
  if (!appId || !appSecret) return null;
  const url = new URL('https://api.weixin.qq.com/sns/jscode2session');
  url.searchParams.set('appid', appId);
  url.searchParams.set('secret', appSecret);
  url.searchParams.set('js_code', code);
  url.searchParams.set('grant_type', 'authorization_code');
  const response = await fetch(url);
  if (!response.ok) throw new Error('WeChat login service unavailable');
  const data = await response.json() as { openid?: string; unionid?: string; session_key?: string; errcode?: number; errmsg?: string };
  if (!data.openid || data.errcode) throw new Error(data.errmsg || 'WeChat login failed');
  return data;
}

export async function POST(request: NextRequest) {
  await dbReady;
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid login request' }, { status: 400 });
  }
  const code = typeof body.code === 'string' ? body.code.trim() : '';
  const devOpenid = process.env.NODE_ENV !== 'production' ? process.env.WECHAT_MINIPROGRAM_DEV_OPENID : '';
  let exchange: Awaited<ReturnType<typeof exchangeCode>> = null;
  try {
    exchange = code ? await exchangeCode(code) : null;
  } catch (error) {
    console.error('WeChat login exchange failed:', error);
    return NextResponse.json({ error: 'WeChat login service unavailable' }, { status: 502 });
  }
  const openid = exchange?.openid || devOpenid;
  if (!openid) return NextResponse.json({ error: 'WeChat mini program login is not configured' }, { status: 503 });

  const wechatFingerprint = `wechat:${openid}`;
  const deviceFingerprint = request.headers.get('x-fingerprint')?.trim() || '';
  const trialProvider = 'miniprogram_trial_device';
  const deviceTrialClaim = deviceFingerprint
    ? await userRepository.findAuthAccount(trialProvider, deviceFingerprint)
    : null;
  let user = await userRepository.findByFingerprint(wechatFingerprint);
  let createdNewWechatUser = false;
  if (!user) {
    // Only merge an anonymous device account before that device has claimed a
    // trial. A different WeChat identity on a claimed device must not inherit
    // or create another trial entitlement.
    const deviceUser = !deviceTrialClaim && deviceFingerprint
      ? await userRepository.findByFingerprint(deviceFingerprint)
      : null;
    user = deviceUser
      ? await userRepository.linkWechat(deviceUser.id, openid)
      : await userRepository.upsertByFingerprint(wechatFingerprint);
    createdNewWechatUser = !deviceUser;
  }
  if (!user) return NextResponse.json({ error: 'Unable to create WeChat account' }, { status: 500 });

  if (deviceFingerprint) {
    const claimedNow = deviceTrialClaim
      ? false
      : await userRepository.claimAuthAccount(trialProvider, deviceFingerprint, user.id);
    if (createdNewWechatUser && !claimedNow) {
      await userRepository.updateSettings(user.id, {
        miniPlan: 'trial',
        miniCredits: 0,
        miniUsedCredits: 0,
        miniTrialClaimed: true,
      });
    }
  }

  return NextResponse.json({
    session: createWechatSession(openid),
    user: { id: user.id, name: user.name || '职策AI用户', avatarUrl: user.avatarUrl || '' },
  });
}
