# 职策 AI 架构说明

## 目标

职策 AI 是一个以岗位为中心的求职准备工作台。核心原则是：用户数据由应用统一管理，AI 能力通过可替换的服务适配器接入，视觉主题不直接耦合业务流程。

## 系统边界

```text
Browser / Mini Program
        │
        ▼
Next.js App Router
  ├── localized pages (/zh, /en)
  ├── resume/editor APIs
  ├── AI and interview APIs
  ├── WeChat Mini Program APIs
  ├── export and share APIs
  └── auth / credit guards
        │
        ├── Drizzle ORM → SQLite or PostgreSQL
        ├── AI provider adapter → OpenAI-compatible / Anthropic / Google
        ├── image provider → server-side image endpoint
        └── Chromium / document libraries → PDF, DOCX, HTML exports
```

## 目录职责

| 目录 | 职责 |
| --- | --- |
| `src/app/[locale]` | 中英文页面、工作台、模板、编辑器和面试路由 |
| `src/app/api` | 服务端 API、鉴权、请求校验和响应格式 |
| `src/components` | 页面组件、交互组件和公共 UI |
| `src/lib/ai` | AI Provider、提示词、范围保护和错误归一化 |
| `src/lib/db` | Drizzle schema、适配器和 repository |
| `src/lib/resume` | 简历解析、标题、栏目优化和内容归一化 |
| `src/lib/interview` | 面试官配置、动态对话和报告数据 |
| `src/lib/miniprogram` | 小程序身份、积分和服务端业务辅助函数 |
| `src/stores` | 编辑器和前端偏好状态 |
| `drizzle` | SQLite 与 PostgreSQL 迁移文件 |
| `messages` | 中英文翻译资源 |

## 请求流

### 网页端简历

1. 页面通过 `next-intl` 加载当前语言。
2. 编辑器通过指纹用户或认证用户访问 `/api/resume`。
3. repository 根据 `DB_TYPE` 选择 SQLite/PostgreSQL。
4. AI 请求经过 Provider 适配器，统一处理 Base URL、模型、Key 和错误。
5. 保存后的简历由编辑器、预览、导出和分享路由复用。

### 服务端 AI

小程序使用的 AI Key 只从服务端环境变量读取。客户端只能传递业务参数，例如岗位、JD、简历内容和模板 ID；服务端负责模型选择、提示词、积分校验、调用和结果持久化。

### 模拟面试

1. 创建面试时保存岗位 JD、可选简历和面试官配置。
2. 面试对话接口根据面试官职责构造系统提示词。
3. 范围保护先拦截明显的无关问题和提示词注入，再决定是否调用模型。
4. 面试官根据岗位和回答质量动态追问、切换主题或结束，不使用固定轮数。
5. 报告接口读取面试记录，生成评分、亮点、短板和改进建议。

## 数据安全边界

- 浏览器端设置的 Key 只用于用户主动配置的网页工作流。
- 小程序服务端 Key、微信 AppSecret、数据库连接串和认证密钥只存在服务端环境。
- 简历、照片和面试记录属于个人信息，应使用 HTTPS、访问控制和脱敏日志。
- 导出文件和上传文件不得进入 Git 仓库。
- 数据库迁移必须先备份，再在目标环境执行。

## 可替换点

- `src/lib/ai/provider.ts`：切换 AI 服务商和兼容端点。
- `src/lib/db/adapters`：SQLite/PostgreSQL 存储适配。
- `src/app/api/linkedin-photo/route.ts`：职业照片图像服务。
- `src/app/api/resume/[id]/export`：导出格式和渲染器。
- `src/components/landing` 与 `src/app/globals.css`：主题和公开首页视觉。

## 生产部署注意事项

- 设置稳定的 `AUTH_SECRET`、数据库连接和生产 AI Key。
- 把局域网地址替换成 HTTPS 域名，并配置微信合法域名。
- 使用 PostgreSQL、对象存储、定期备份和错误告警。
- 为 AI 和文件 API 增加限流、超时、大小限制和失败重试上限。
- 发布前验证 PDF/DOCX 上传、AI 流式对话、职业照片、模拟面试和弱网场景。
