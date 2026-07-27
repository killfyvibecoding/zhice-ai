export interface ImageProviderFailure {
  status: 502 | 503;
  code: 'IMAGE_PROVIDER_QUOTA' | 'IMAGE_PROVIDER_FAILED';
  message: string;
}

export function classifyImageProviderError(status: number, body: string): ImageProviderFailure {
  if (body.includes('insufficient_user_quota')) {
    return {
      status: 503,
      code: 'IMAGE_PROVIDER_QUOTA',
      message: '图片生成服务额度不足，请管理员充值或更换服务 Key。',
    };
  }

  return {
    status: 502,
    code: 'IMAGE_PROVIDER_FAILED',
    message: '图片生成服务暂不可用，请稍后重试。',
  };
}
