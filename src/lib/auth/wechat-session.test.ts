import { describe, expect, it } from 'vitest';
import { createWechatSession, verifyWechatSession } from './wechat-session';

describe('wechat mini program session', () => {
  it('round-trips an openid in a signed session', () => {
    const token = createWechatSession('openid-test', Date.now());
    expect(verifyWechatSession(token, Date.now())?.openid).toBe('openid-test');
  });

  it('rejects a modified or expired session', () => {
    const token = createWechatSession('openid-test', Date.now());
    expect(verifyWechatSession(`${token}changed`)).toBeNull();
    expect(verifyWechatSession(token, Date.now() + 31 * 24 * 60 * 60 * 1000)).toBeNull();
  });
});
