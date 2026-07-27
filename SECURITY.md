# Security Policy

## Supported versions

只对默认分支和最新发布版本提供安全修复。部署者应及时更新依赖、迁移文件和镜像。

## Reporting a vulnerability

请不要在公开 Issue 中发布 API Key、数据库连接串、用户简历、职业照片或可复现的未修复漏洞。

优先通过 GitHub Security Advisories 私下报告，或联系仓库维护者，并提供：

- 影响的版本和部署方式
- 最小复现步骤
- 影响范围和可能的数据暴露
- 可行的修复建议

收到报告后，维护者会先确认问题，再评估修复、披露和受影响部署的通知方式。

## Deployment checklist

- 生产环境使用 HTTPS 和强随机 `AUTH_SECRET`。
- API Key、微信 AppSecret、数据库密码只放在服务端 Secret/环境变量。
- 禁止把 `.env.local`、数据库、上传文件和 AI 原始响应提交到 Git。
- 对 AI、文件上传、登录和导出接口配置限流、大小限制、超时和日志脱敏。
- 轮换已经出现在日志、截图、聊天或 Issue 中的所有密钥。
