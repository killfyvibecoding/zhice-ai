import { NextRequest } from 'next/server';
import { createUIMessageStream, createUIMessageStreamResponse, streamText, convertToModelMessages } from 'ai';
import { getModel, extractAIConfig, AIConfigError } from '@/lib/ai/provider';
import { resolveUser, getUserIdFromRequest } from '@/lib/auth/helpers';
import { interviewRepository } from '@/lib/db/repositories/interview.repository';
import { resumeRepository } from '@/lib/db/repositories/resume.repository';
import { buildInterviewSystemPrompt } from '@/lib/ai/interview-prompts';
import { buildInterviewScopeRedirect, getInterviewScopeDecision } from '@/lib/ai/interview-scope';
import { dbReady } from '@/lib/db';
import { consumeMiniProgramCredits, getMiniProgramAccount, MINI_CREDIT_COSTS, MINI_INSUFFICIENT_CREDITS_MESSAGE } from '@/lib/miniprogram/entitlements';

function createInterviewTextResponse(text: string) {
  const id = crypto.randomUUID();
  const stream = createUIMessageStream({
    execute({ writer }) {
      writer.write({ type: 'text-start', id });
      writer.write({ type: 'text-delta', id, delta: text });
      writer.write({ type: 'text-end', id });
    },
  });
  return createUIMessageStreamResponse({ stream });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbReady;
    const { id: sessionId } = await params;
    const fingerprint = getUserIdFromRequest(request);
    const user = await resolveUser(fingerprint);
    if (!user) {
      return new Response(JSON.stringify({ error: '请先完成微信登录' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const session = await interviewRepository.findSession(sessionId);
    if (!session || session.userId !== user.id) {
      return new Response('Not found', { status: 404 });
    }

    const { messages: rawMessages, roundId, model: modelId, locale = 'zh' } = await request.json();
    const messages = Array.isArray(rawMessages) ? rawMessages : [];

    const round = await interviewRepository.findRound(roundId);
    if (!round || round.sessionId !== sessionId) {
      return new Response('Round not found', { status: 404 });
    }
    if (round.status === 'completed' || round.status === 'skipped') {
      return createInterviewTextResponse(locale === 'zh' ? '本轮面试已经结束，请查看本轮总结。' : 'This interview round has ended. Please review the round summary.');
    }

    let resumeContent: string | undefined;
    if (session.resumeId) {
      const resume = await resumeRepository.findById(session.resumeId as string);
      if (resume) {
        resumeContent = JSON.stringify(resume.sections);
      }
    }

    const interviewerConfig = round.interviewerConfig as any;

    let lastUserContent = '';
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'user') {
        const textPart = lastMessage.parts?.find((p: { type: string }) => p.type === 'text');
        const content = textPart?.text || lastMessage.content || '';
        if (content) {
          lastUserContent = content;
          await interviewRepository.addMessage({
            roundId,
            role: 'candidate',
            content,
          });
        }
      }
    }

    if (!getInterviewScopeDecision(lastUserContent).allowed) {
      return createInterviewTextResponse(buildInterviewScopeRedirect(locale));
    }

    const isMiniProgram = request.headers.get('x-client') === 'miniprogram';
    if (isMiniProgram) {
      const account = await getMiniProgramAccount(user.id);
      if (account.credits < MINI_CREDIT_COSTS.interviewTurn) {
        return new Response(JSON.stringify({ error: MINI_INSUFFICIENT_CREDITS_MESSAGE }), {
          status: 402,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    const aiConfig = extractAIConfig(request);
    const model = getModel(aiConfig, modelId);
    const modelMessages = await convertToModelMessages(messages);

    if (round.status === 'pending') {
      await interviewRepository.updateRoundStatus(roundId, 'in_progress');
      await interviewRepository.updateSessionStatus(sessionId, 'in_progress');
    }

    const systemPrompt = buildInterviewSystemPrompt({
      interviewer: interviewerConfig,
      jobDescription: session.jobDescription,
      resumeContent,
      locale,
    });

    const result = streamText({
      model,
      maxRetries: 0,
      timeout: 60_000,
      system: systemPrompt,
      messages: modelMessages,
      onError: ({ error }) => {
        console.error('Interview AI stream error:', error);
      },
      onFinish: async ({ text }) => {
        if (!text) return;

        await interviewRepository.addMessage({
          roundId,
          role: 'interviewer',
          content: text,
        });

        await interviewRepository.incrementQuestionCount(roundId);

        if (isMiniProgram) {
          await consumeMiniProgramCredits(user.id, MINI_CREDIT_COSTS.interviewTurn);
        }

        if (text.includes('[ROUND_COMPLETE]')) {
          await interviewRepository.updateRoundStatus(roundId, 'completed');
          await interviewRepository.setRoundSummary(roundId, {
            score: 0,
            feedback: text.replace('[ROUND_COMPLETE]', '').trim(),
          });

          const rounds = await interviewRepository.findRoundsBySessionId(sessionId);
          const currentIndex = rounds.findIndex((r: { id: string }) => r.id === roundId);
          const nextRound = rounds[currentIndex + 1];

          if (nextRound) {
            await interviewRepository.updateSessionRound(sessionId, currentIndex + 1);
          } else {
            await interviewRepository.updateSessionStatus(sessionId, 'completed');
          }
        }
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    if (error instanceof AIConfigError) {
      return new Response(JSON.stringify({ error: error.message }), { status: 401 });
    }
    console.error('POST /api/interview/[id]/chat error:', error);
    return new Response('Internal server error', { status: 500 });
  }
}
