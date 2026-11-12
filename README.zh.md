> 社区翻译（草稿）—— NTARI 政策 P2-002《全球多语言广播》。来源：README.md（英文原版，2026-10-05 快照）。本文件为机器辅助的社区草稿，依据 P2-002 §3.1 尚待区域维护者审校。根据 §2.2，核心技术规范仍以英文为准。
>
> 如发现译文有误，欢迎 fork 仓库并提交 Pull Request
> 来改进翻译：https://github.com/NTARI-RAND/fruitful。翻译修正与代码贡献同样宝贵，我们诚挚欢迎。

# 前端

本目录存放 Fruitful 的 Web 界面。

## 子应用

- `app/` – 提供主要用户界面的 Next.js 站点。
- `chat-ui/` – 使用 Vite 和 React 构建的对话式界面。架构细节请参阅 [chat-ui/ARCHITECTURE.md](chat-ui/ARCHITECTURE.md)。

## 环境变量

两个子应用都依赖环境变量与后端服务通信。

### Next.js（`app/`）

- `NEXT_PUBLIC_BACKEND_URL` – 后端 API 请求的基础 URL。
- `NEXT_PUBLIC_API_KEY` – 用于对来自 Next.js 站点的请求进行授权的 API 密钥。
- `NEXT_PUBLIC_APPSYNC_GRAPHQL_ENDPOINT` – AppSync GraphQL 端点 URL。
- `NEXT_PUBLIC_APPSYNC_API_KEY` – 用于 AppSync 请求的 API 密钥。

### 聊天界面（`chat-ui/`）

- `VITE_API_BASE_URL` – 聊天界面所用 API 的基础 URL。
- `VITE_API_KEY` – 聊天界面使用的 API 密钥。
