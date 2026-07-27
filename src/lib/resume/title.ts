export function buildResumeTitle(name: string, targetJob: string): string {
  const normalizedName = name.trim();
  const normalizedJob = targetJob.trim();
  if (normalizedName && normalizedJob) return `${normalizedName}｜${normalizedJob}`;
  if (normalizedName) return `${normalizedName}｜求职简历`;
  return '我的简历';
}

export function shouldAutoRename(title: string, name: string): boolean {
  const currentTitle = title.trim();
  const normalizedName = name.trim();
  return !currentTitle
    || currentTitle === '未命名简历'
    || currentTitle === '我的简历'
    || (Boolean(normalizedName) && currentTitle === normalizedName)
    || (Boolean(normalizedName) && currentTitle === `示例简历 - ${normalizedName}`);
}
