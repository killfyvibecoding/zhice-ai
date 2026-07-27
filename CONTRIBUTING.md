# Contributing to Zhice AI

感谢参与职策 AI。提交代码前，请先确认改动不会泄露个人信息、API Key 或破坏现有导出数据。

## 开发流程

1. Fork 或创建功能分支。
2. 使用 Node.js 22+ 和 pnpm 10+ 安装依赖。
3. 复制 `.env.example` 为 `.env.local`，只使用本地测试值。
4. 小范围修改并补充对应测试。
5. 提交前运行：

```bash
pnpm type-check
pnpm test
pnpm build
```

6. Pull Request 中说明问题、方案、影响范围和验证结果。

## 改动边界

- 页面主题改动不应改变 API 请求格式。
- API 改动需要同时检查网页端和微信小程序调用方。
- 数据库 schema 改动必须提供迁移文件，并说明回滚风险。
- AI 提示词改动需要验证面试范围保护、中文输出和错误处理。
- 不要提交 `.env*`、数据库文件、截图中的 Key、上传文件或模型原始响应。

## 提交信息

推荐使用简短的 Conventional Commits，例如：

```text
feat: add resume template preview
fix: normalize provider error response
docs: update deployment guide
```

## 许可证

贡献内容将按本项目 Apache License 2.0 发布。由于本项目包含衍生代码，请同时遵守 [NOTICE](NOTICE) 中的来源说明。
