import { describe, expect, it } from 'vitest';
import { classifyImageProviderError } from './image-provider-error';

describe('image provider errors', () => {
  it('maps upstream quota failures to a user-safe service message', () => {
    expect(classifyImageProviderError(403, '{"error":{"code":"insufficient_user_quota"}}')).toEqual({
      status: 503,
      code: 'IMAGE_PROVIDER_QUOTA',
      message: '图片生成服务额度不足，请管理员充值或更换服务 Key。',
    });
  });

  it('does not expose upstream response details for other failures', () => {
    expect(classifyImageProviderError(500, '{"error":{"message":"secret provider detail"}}')).toEqual({
      status: 502,
      code: 'IMAGE_PROVIDER_FAILED',
      message: '图片生成服务暂不可用，请稍后重试。',
    });
  });
});
