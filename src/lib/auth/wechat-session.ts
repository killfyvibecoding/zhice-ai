import { createHmac, timingSafeEqual } from 'node:crypto';

const SESSION_DAYS = 30;

function secret() {
  return process.env.WECHAT_SESSION_SECRET || process.env.AUTH_SECRET || 'zhice-ai-dev-wechat-session';
}

function encode(value: string) {
  return Buffer.from(value).toString('base64url');
}

function sign(payload: string) {
  return createHmac('sha256', secret()).update(payload).digest('base64url');
}

export function createWechatSession(openid: string, now = Date.now()) {
  const payload = encode(JSON.stringify({
    openid,
    exp: Math.floor(now / 1000) + SESSION_DAYS * 24 * 60 * 60,
  }));
  return `${payload}.${sign(payload)}`;
}

export function verifyWechatSession(token: string | null | undefined, now = Date.now()): { openid: string; exp: number } | null {
  if (!token) return null;
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return null;
  const expected = sign(payload);
  if (signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  try {
    const result = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as { openid?: string; exp?: number };
    if (!result.openid || !result.exp || result.exp <= Math.floor(now / 1000)) return null;
    return { openid: result.openid, exp: result.exp };
  } catch {
    return null;
  }
}
