type ResumeSection = {
  id: string;
  type: string;
  title: string;
  sortOrder?: number;
  visible?: boolean;
  content: unknown;
};

type OptimizedSection = {
  type: string;
  title?: string;
  content: unknown;
};

export function mergeOptimizedSections(
  existing: ResumeSection[],
  optimized: OptimizedSection[],
): ResumeSection[] {
  const updates = new Map(optimized.map((section) => [section.type, section]));

  return existing.map((section) => {
    const update = updates.get(section.type);
    if (!update) return section;
    return {
      ...section,
      title: update.title || section.title,
      content: update.content,
    };
  });
}
