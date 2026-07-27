import { auth } from './config';
import { config } from '@/lib/config';
import { dbReady } from '@/lib/db';
import { userRepository } from '@/lib/db/repositories/user.repository';
import { verifyWechatSession } from '@/lib/auth/wechat-session';

export async function getCurrentUserId(): Promise<string | null> {
  if (config.auth.enabled) {
    const session = await auth();
    return session?.user?.id || null;
  }
  // In fingerprint mode, userId is resolved from the request header
  return null;
}

export async function resolveUser(fingerprint?: string | null) {
  // Ensure DB tables exist before any query
  await dbReady;

  if (fingerprint?.startsWith('wechat:')) {
    return userRepository.findByFingerprint(fingerprint);
  }

  if (config.auth.enabled) {
    const session = await auth();
    if (!session?.user?.id) return null;

    // User was created during sign-in (jwt callback), just look up
    let user = await userRepository.findById(session.user.id);

    // Fallback: ID may differ if token was issued before DB creation
    if (!user && session.user.email) {
      user = await userRepository.findByEmail(session.user.email);
    }

    return user;
  }

  if (!fingerprint) return null;
  return userRepository.upsertByFingerprint(fingerprint);
}

export function getUserIdFromRequest(request: Request): string | null {
  const wechatSession = verifyWechatSession(request.headers.get('x-wechat-session'));
  if (wechatSession) return `wechat:${wechatSession.openid}`;
  // Mini Program accounts must be backed by a verified WeChat session. Do not
  // fall back to the device fingerprint, otherwise anonymous users can receive
  // the trial entitlement without logging in.
  if (request.headers.get('x-client') === 'miniprogram') return null;
  return request.headers.get('x-fingerprint') || null;
}
