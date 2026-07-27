<div align="center">

# 职策 AI（Zhice AI）

**面向求职准备的一体化 AI 工作台**

从目标岗位出发，完成简历创建、JD 定向优化、职业照生成、模拟面试、报告分析与多格式导出。

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61dafb)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6)](https://www.typescriptlang.org/)
[![Docker](https://img.shields.io/badge/Docker-ready-2496ed)](Dockerfile)

[English](README.md) · [架构说明](ARCHITECTURE.md) · [贡献指南](CONTRIBUTING.md)

</div>

---

## 项目简介

职策 AI 是一个可自托管的求职准备平台。它把简历数据、AI 工作流、面试记录、导出和分享能力放在同一个响应式网页后台中，适合个人求职、职业咨询和小程序服务端接入。

- **简历工作台**：拖拽栏目、行内编辑、自动保存、撤销/重做、多份简历、复制和重命名。
- **模板系统**：模板预览、布局调整、颜色、字体、间距和边距设置。
- **AI 能力**：按岗位生成简历、上传简历并按 JD 优化、AI 对话、语法检查、翻译、JD 匹配和求职信。
- **文档解析**：支持 PDF、DOCX 和图片简历解析，提取后继续编辑。
- **职业照片**：通过服务端图片模型生成职业头像，模型 Key 不暴露给前端。
- **模拟面试**：6 类预设面试官、自定义面试官、关联简历追问、动态推进和面试报告。
- **导出与分享**：PDF、DOCX、HTML、Markdown、TXT、JSON，以及可选密码的分享链接。
- **小程序服务端桥接**：微信登录、简历、积分、AI 生成、图片生成和概览接口。
- **中英文界面**：访问 `/zh` 或 `/en`。

## UI 主题

网页端采用原创的深色商务视觉系统：深绿黑背景、薄荷绿强调色、响应式布局、字体变量、液态玻璃卡片和视频 Hero。视觉层与业务接口解耦，主题修改不会改变简历、AI、面试、登录、数据库和导出链路。

## 技术栈

| 模块 | 技术 |
| --- | --- |
| 应用 | Next.js 16 App Router、React 19、TypeScript |
| UI | Tailwind CSS 4、shadcn/ui、Radix UI、lucide-react |
| 状态 | Zustand |
| AI | Vercel AI SDK、OpenAI/Anthropic/Google 兼容模型 |
| 数据库 | SQLite（默认）或 PostgreSQL + Drizzle ORM |
| 文档 | Puppeteer/Chromium、DOCX、HTML、Markdown、TXT、JSON |
| 媒体 | hls.js 和服务端图片生成接口 |
| 运行 | Node.js 22+、pnpm、Docker |

## 快速开始

### 环境要求

- Node.js 22 或更高版本
- pnpm 10 或更高版本
- 本地开发可直接使用 SQLite；生产环境可使用 PostgreSQL
- AI 功能需要配置模型服务 Key

### 本地运行

```bash
git clone https://github.com/killfyvibecoding/zhice-ai.git
cd zhice-ai
pnpm install
cp .env.example .env.local
```

在 `.env.local` 至少配置一个稳定的认证密钥：

```bash
AUTH_SECRET="$(openssl rand -base64 32)"
DB_TYPE=sqlite
SQLITE_PATH=./data/jade.db
```

启动开发服务：

```bash
pnpm dev
```

浏览器访问 [http://localhost:3000/zh](http://localhost:3000/zh)。当 `AUTH_ENABLED=false` 时，开发环境默认使用浏览器指纹识别，便于不接 OAuth 也能进入工作台。

## AI 配置

系统支持两条 AI 链路：

1. **网页端工作台**：用户可以在设置中填写兼容的供应商、Base URL、模型和 Key，供网页编辑器使用。
2. **服务端托管链路**：微信小程序和职业照片接口使用 `AI_API_KEY`、`AI_BASE_URL`、`AI_MODEL`、`IMAGE_API_KEY`、`IMAGE_BASE_URL`、`IMAGE_MODEL`。这些值只能放在服务端环境变量中，不能提交到仓库或从小程序传入。

`.env.example` 只包含占位值。任何出现在日志、截图、Issue 或聊天记录中的 Key 都应立即撤销并重新生成。

## 数据库

默认 SQLite 数据保存在 `./data`。使用 PostgreSQL 时：

```bash
DB_TYPE=postgresql
DATABASE_URL=postgresql://user:password@localhost:5432/zhice_ai
pnpm db:generate:pg
pnpm db:migrate
```

SQLite 迁移：

```bash
pnpm db:generate
pnpm db:migrate
```

生产迁移前请备份数据库和上传文件。当前仓库没有内置微信支付网关，商业化上线前还需要接入支付、订单回调和生产级积分对账。

## Docker 部署

```bash
docker build -t zhice-ai:local .
AUTH_SECRET="$(openssl rand -base64 32)" \
  IMAGE=zhice-ai:local \
  ./docker_run_local.sh
```

脚本默认使用 `3003` 端口，把 SQLite 数据写入 `./zhice-ai-data`，不包含硬编码密钥。GitHub Actions 可以在配置 Docker Hub Secrets 后构建多架构镜像。

## 项目结构

```text
src/app/                  页面、路由和服务端 API
src/components/           首页、工作台、编辑器、面试和 UI 组件
src/hooks/                编辑器和面试交互 Hooks
src/i18n/                 多语言路由和消息加载
src/lib/                  AI、认证、数据库、简历、面试和导出服务
src/stores/               前端状态
src/types/                共享 TypeScript 类型
drizzle/                  SQLite/PostgreSQL 数据库迁移
messages/                 中英文翻译
public/                   图标和静态资源
images/                   文档截图
docs/                     架构、部署、安全和运营文档
```

## 验证命令

```bash
pnpm type-check
pnpm test
pnpm build
```

仓库仍保留部分上游历史 lint 问题，发布前以类型检查、自动化测试和生产构建为主要门禁，详见 [CONTRIBUTING.md](CONTRIBUTING.md)。

## 安全与隐私

- 不要提交 `.env`、`.env.local`、数据库文件、API Key、Cookie、上传文件或包含个人信息的模型响应。
- 简历、职业照片、面试记录和生成文档均应按个人信息处理。
- 生产环境必须使用 HTTPS、安全 Cookie、正式 `AUTH_SECRET`、限流、请求大小限制和日志脱敏。
- 漏洞报告请阅读 [SECURITY.md](SECURITY.md)。

## 许可证与来源

职策 AI 使用 Apache License 2.0 发布。本仓库是在 Apache-2.0 代码基础上的独立品牌和功能衍生版本，来源说明见 [NOTICE](NOTICE)，完整许可文本见 [LICENSE](LICENSE)。
