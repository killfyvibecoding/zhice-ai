# 本地快速启动

## 1. 安装

```bash
corepack enable
pnpm install
cp .env.example .env.local
```

## 2. 最小配置

```env
APP_NAME=职策AI
AUTH_ENABLED=false
AUTH_SECRET=请替换为随机字符串
DB_TYPE=sqlite
SQLITE_PATH=./data/jade.db
```

## 3. 启动

```bash
pnpm dev
```

中文页面：`http://localhost:3000/zh`
英文页面：`http://localhost:3000/en`

## 4. 开启服务端 AI

```env
AI_PROVIDER=openai
AI_API_KEY=服务端模型Key
AI_BASE_URL=https://api.example.com/v1
AI_MODEL=模型名称
IMAGE_API_KEY=服务端图片Key
IMAGE_BASE_URL=https://image.example.com/v1
IMAGE_MODEL=图片模型名称
IMAGE_API_FORMAT=openai
```

不要把上述 Key 写入前端代码、小程序代码、README、截图或 GitHub Actions 日志。
