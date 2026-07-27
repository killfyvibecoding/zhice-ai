export type InterviewScopeDecision =
  | { allowed: true }
  | { allowed: false; reason: 'prompt_injection' | 'off_topic' };

const PROMPT_INJECTION_PATTERNS = [
  /忽略(?:之前|上面|以上|所有)?(?:的)?(?:指令|规则|提示)/i,
  /(?:系统提示词|system\s*prompt|developer\s+message)/i,
  /(?:改变|切换|扮演|假装)(?:一下)?(?:你?的)?(?:角色|身份)/i,
  /(?:绕过|解除|关闭)(?:面试|安全|限制|规则)/i,
  /ignore\s+(?:all\s+)?(?:previous| the previous)\s+instructions?/i,
];

const OFF_TOPIC_PATTERNS = [
  /天气|气温|下雨|台风/i,
  /股票|股价|基金|彩票|汇率|币价/i,
  /新闻|热搜|娱乐|明星|电影|电视剧|音乐|游戏|八卦/i,
  /菜谱|做饭|减肥|健身计划|旅游攻略|星座/i,
  /你是谁|你叫什么|讲个笑话|陪我聊天/i,
];

export function getInterviewScopeDecision(content: string): InterviewScopeDecision {
  const text = content.trim();
  if (!text) return { allowed: true };
  if (PROMPT_INJECTION_PATTERNS.some((pattern) => pattern.test(text))) {
    return { allowed: false, reason: 'prompt_injection' };
  }
  if (OFF_TOPIC_PATTERNS.some((pattern) => pattern.test(text))) {
    return { allowed: false, reason: 'off_topic' };
  }
  return { allowed: true };
}

export function buildInterviewScopeRedirect(locale: string): string {
  if (locale === 'zh') {
    return '这个问题不属于当前面试，我不能回答面试以外的内容。我们回到目标岗位：请结合你的实际经历，说明一个你解决复杂问题的案例。';
  }
  return 'That is outside this interview, so I cannot answer unrelated questions. Let us return to the target role: please describe a real example of how you solved a complex problem.';
}
