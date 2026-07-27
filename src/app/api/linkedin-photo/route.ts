import { NextRequest, NextResponse } from 'next/server';
import { resolveUser, getUserIdFromRequest } from '@/lib/auth/helpers';
import { consumeMiniProgramCredits, getMiniProgramAccount, MINI_CREDIT_COSTS, MINI_INSUFFICIENT_CREDITS_MESSAGE } from '@/lib/miniprogram/entitlements';
import { classifyImageProviderError, type ImageProviderFailure } from '@/lib/miniprogram/image-provider-error';
import { findImageReference } from '@/lib/miniprogram/image-reference';

export const maxDuration = 60;

const DEFAULT_GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';
const DEFAULT_GEMINI_MODEL = 'gemini-3.1-flash-image-preview';
const PHOTO_PROMPTS = {
  portrait: '将这张自拍照生成一张 2:3 的普通纵向职业人像。保留本人的真实面部特征和身份，不改变性别、年龄和肤色。使用自然、干净的背景、柔和光线、得体的商务着装和可信的自然表情，构图适合简历、作品集和求职资料。不要添加文字、水印、Logo 或夸张的美颜效果。',
  id_blue: '将这张自拍照制作成标准正式蓝底证件照。必须保留本人的真实面部特征和身份，不改变性别、年龄和肤色。使用均匀的纯浅蓝色证件照背景，人物正面平视镜头，头部居中，肩膀水平，头肩比例规范，面部光线均匀，表情自然端正，穿着整洁正式。画面简洁、无环境场景、无明显阴影、无道具。不要生成 LinkedIn 环境头像、侧身照、艺术写真、文字、水印、Logo 或夸张美颜。',
  id_white: '将这张自拍照制作成标准正式白底证件照。必须保留本人的真实面部特征和身份，不改变性别、年龄和肤色。使用均匀的纯白色证件照背景，人物正面平视镜头，头部居中，肩膀水平，头肩比例规范，面部光线均匀，表情自然端正，穿着整洁正式。画面简洁、无环境场景、无明显阴影、无道具。不要生成 LinkedIn 环境头像、侧身照、艺术写真、文字、水印、Logo 或夸张美颜。',
} as const;
const DEFAULT_PHOTO_PROMPT = '将这张自拍照生成一张自然、专业、可信的职业头像。保留本人的真实面部特征和身份，不改变性别、年龄和肤色。使用干净的商务背景、自然光线、得体的商务着装和友好的专业表情，构图适合求职资料和 LinkedIn 头像。不要添加文字、水印、Logo 或夸张的美颜效果。';

class ImageProviderError extends Error {
  constructor(readonly failure: ImageProviderFailure) {
    super(failure.message);
    this.name = 'ImageProviderError';
  }
}

function getAspectRatioSize(aspectRatio: string) {
  return ({
    '1:1': '1024x1024',
    '3:4': '1024x1365',
    '2:3': '1024x1536',
    '4:3': '1365x1024',
  } as Record<string, string>)[aspectRatio] || '1024x1024';
}

function normalizePhotoRequest(photoType: unknown, aspectRatio: unknown) {
  if (photoType === 'portrait') return { type: 'portrait' as const, aspectRatio: '2:3' };
  if (photoType === 'id_blue') return { type: 'id_blue' as const, aspectRatio: '3:4' };
  if (photoType === 'id_white') return { type: 'id_white' as const, aspectRatio: '3:4' };
  return {
    type: null,
    aspectRatio: typeof aspectRatio === 'string' ? aspectRatio : '1:1',
  };
}

function getOpenAIEndpoint(baseUrl: string) {
  const normalized = baseUrl.replace(/\/+$/, '');
  return normalized.endsWith('/v1') ? `${normalized}/chat/completions` : `${normalized}/v1/chat/completions`;
}

async function toDataUrl(reference: string) {
  if (reference.startsWith('data:image/')) return reference;
  if (reference.startsWith('http://') || reference.startsWith('https://')) {
    const response = await fetch(reference);
    if (!response.ok) throw new Error('Generated image download failed');
    const contentType = response.headers.get('content-type') || 'image/png';
    const buffer = Buffer.from(await response.arrayBuffer());
    return `data:${contentType};base64,${buffer.toString('base64')}`;
  }
  return `data:image/png;base64,${reference}`;
}

async function generateWithOpenAI(baseUrl: string, apiKey: string, model: string, image: string, prompt: string, aspectRatio: string) {
  const response = await fetch(getOpenAIEndpoint(baseUrl), {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages: [{
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          { type: 'image_url', image_url: { url: image } },
        ],
      }],
      size: getAspectRatioSize(aspectRatio),
      n: 1,
    }),
  });
  if (!response.ok) {
    throw new ImageProviderError(classifyImageProviderError(response.status, await response.text()));
  }
  const data = await response.json();
  const reference = findImageReference(data?.data?.[0]) || findImageReference(data?.choices?.[0]?.message);
  if (!reference) throw new Error('Image provider returned no image');
  return toDataUrl(reference);
}

async function generateWithGemini(baseUrl: string, apiKey: string, model: string, image: string, prompt: string, aspectRatio: string) {
  const match = image.match(/^data:(image\/[\w+.-]+);base64,([\s\S]+)$/);
  const endpoint = `${baseUrl.replace(/\/+$/, '')}/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [
        { text: `${prompt}\n\n输出比例：${aspectRatio}` },
        { inlineData: { mimeType: match?.[1] || 'image/jpeg', data: match?.[2] || image } },
      ] }],
      generationConfig: { responseModalities: ['TEXT', 'IMAGE'] },
    }),
  });
  if (!response.ok) {
    throw new ImageProviderError(classifyImageProviderError(response.status, await response.text()));
  }
  const data = await response.json();
  const parts = data?.candidates?.[0]?.content?.parts || [];
  const inline = parts.find((part: Record<string, unknown>) => part.inlineData || part.inline_data) as Record<string, unknown> | undefined;
  const inlineData = (inline?.inlineData || inline?.inline_data) as Record<string, string> | undefined;
  if (!inlineData?.data) throw new Error('Gemini image provider returned no image');
  return `data:${inlineData.mimeType || inlineData.mime_type || 'image/png'};base64,${inlineData.data}`;
}

export async function POST(request: NextRequest) {
  try {
    const user = await resolveUser(getUserIdFromRequest(request));
    if (!user) return NextResponse.json({ error: '请先完成微信登录' }, { status: 401 });

    const body = await request.json();
    const isMiniProgram = request.headers.get('x-client') === 'miniprogram';
    const image = body.image;
    const photoRequest = normalizePhotoRequest(body.photoType, body.aspectRatio);
    const aspectRatio = photoRequest.aspectRatio;
    const requirements = typeof body.requirements === 'string' ? body.requirements.trim().slice(0, 1000) : '';
    if (typeof image !== 'string' || image.length < 100) {
      return NextResponse.json({ error: 'Image is required' }, { status: 400 });
    }
    if (image.length > 12 * 1024 * 1024) {
      return NextResponse.json({ error: 'Image is too large' }, { status: 400 });
    }

    if (isMiniProgram) {
      const account = await getMiniProgramAccount(user.id);
      if (account.credits < MINI_CREDIT_COSTS.linkedinPhoto) return NextResponse.json({ error: MINI_INSUFFICIENT_CREDITS_MESSAGE }, { status: 402 });
    }

    const apiKey = process.env.IMAGE_API_KEY || (!isMiniProgram ? body.apiKey : '');
    const baseUrl = process.env.IMAGE_BASE_URL || DEFAULT_GEMINI_BASE_URL;
    const model = process.env.IMAGE_MODEL || DEFAULT_GEMINI_MODEL;
    const format = process.env.IMAGE_API_FORMAT || (process.env.IMAGE_BASE_URL ? 'openai' : 'gemini');
    if (!apiKey) return NextResponse.json({ error: 'Image service is not configured' }, { status: 503 });

    const basePrompt = photoRequest.type ? PHOTO_PROMPTS[photoRequest.type] : DEFAULT_PHOTO_PROMPT;
    const prompt = requirements ? `${basePrompt}\n额外要求：${requirements}` : basePrompt;
    const result = format === 'gemini'
      ? await generateWithGemini(baseUrl, apiKey, model, image, prompt, aspectRatio)
      : await generateWithOpenAI(baseUrl, apiKey, model, image, prompt, aspectRatio);

    if (isMiniProgram) await consumeMiniProgramCredits(user.id, MINI_CREDIT_COSTS.linkedinPhoto);
    return NextResponse.json({ image: result });
  } catch (error) {
    if (error instanceof ImageProviderError) {
      return NextResponse.json({ error: error.message, code: error.failure.code }, { status: error.failure.status });
    }
    console.error('LinkedIn photo generation error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Image generation failed' }, { status: 500 });
  }
}
