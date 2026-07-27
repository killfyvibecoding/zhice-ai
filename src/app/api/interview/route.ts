import { NextRequest, NextResponse } from 'next/server';
import { resolveUser, getUserIdFromRequest } from '@/lib/auth/helpers';
import { interviewRepository } from '@/lib/db/repositories/interview.repository';
import { resumeRepository } from '@/lib/db/repositories/resume.repository';
import { getPresetInterviewer } from '@/lib/interview/interviewers';
import type { InterviewerConfig } from '@/types/interview';
import { dbReady } from '@/lib/db';

const NO_RESUME_INTERVIEWERS = new Set(['hr', 'behavioral', 'scenario']);
const WITH_RESUME_INTERVIEWERS = new Set(['technical', 'project_deep_dive', 'leader']);

function normalizeInterviewers(raw: unknown, hasResume: boolean): InterviewerConfig[] | null {
  if (!Array.isArray(raw) || raw.length === 0 || raw.length > 3) return null;
  const allowed = hasResume ? WITH_RESUME_INTERVIEWERS : NO_RESUME_INTERVIEWERS;
  const result: InterviewerConfig[] = [];

  for (const item of raw) {
    if (!item || typeof item !== 'object') return null;
    const candidate = item as Partial<InterviewerConfig>;
    const type = String(candidate.type || '');
    const preset = getPresetInterviewer(type, 'zh');
    if (preset) {
      if (!allowed.has(type)) return null;
      result.push(preset);
      continue;
    }

    if (!type.startsWith('custom_') || !candidate.name || !candidate.title || !Array.isArray(candidate.focusAreas)) {
      return null;
    }
    result.push({
      type,
      name: String(candidate.name),
      title: String(candidate.title),
      avatar: String(candidate.avatar || 'custom'),
      bio: String(candidate.bio || '围绕目标岗位进行结构化面试。'),
      style: String(candidate.style || '围绕岗位职责提问并追问具体经历。'),
      focusAreas: candidate.focusAreas.map(String).slice(0, 8),
      systemPrompt: '',
      personality: String(candidate.personality || '专业、客观、关注事实。'),
    });
  }

  return result;
}

export async function GET(request: NextRequest) {
  await dbReady;
  const fingerprint = getUserIdFromRequest(request);
  const user = await resolveUser(fingerprint);
  if (!user) return NextResponse.json({ error: '请先完成微信登录' }, { status: 401 });

  const sessions = await interviewRepository.findSessionsByUserId(user.id);
  return NextResponse.json(sessions);
}

export async function POST(request: NextRequest) {
  await dbReady;
  const fingerprint = getUserIdFromRequest(request);
  const user = await resolveUser(fingerprint);
  if (!user) return NextResponse.json({ error: '请先完成微信登录' }, { status: 401 });

  const body = await request.json();
  const { jobDescription, jobTitle, resumeId } = body;

  if (!jobDescription || !jobTitle) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  let resume = null;
  if (resumeId) {
    resume = await resumeRepository.findById(resumeId);
    if (!resume || resume.userId !== user.id) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }
  }

  const interviewers = normalizeInterviewers(body.interviewers, Boolean(resume));
  if (!interviewers) {
    return NextResponse.json({ error: '请选择与简历状态匹配的面试官' }, { status: 400 });
  }

  const session = await interviewRepository.createSession({
    userId: user.id,
    resumeId: resumeId || undefined,
    jobDescription,
    jobTitle,
    selectedInterviewers: interviewers,
  });

  for (let i = 0; i < interviewers.length; i++) {
    await interviewRepository.createRound({
      sessionId: session!.id,
      interviewerType: interviewers[i].type,
      interviewerConfig: interviewers[i],
      sortOrder: i,
    });
  }

  const rounds = await interviewRepository.findRoundsBySessionId(session!.id);
  return NextResponse.json({ session, rounds }, { status: 201 });
}
