> Tradução comunitária (rascunho) — política P2-002 da NTARI, Transmissão Multilíngue Global. Fonte: README.md (original em inglês, snapshot de 2026-10-05). Rascunho comunitário assistido por máquina, pendente de revisão do mantenedor regional conforme P2-002 §3.1. As especificações técnicas centrais permanecem em inglês conforme §2.2.
>
> Notou algum erro nesta tradução? Correções de tradução são contribuições
> valiosas e muito bem-vindas: faça um fork do repositório e abra um pull
> request em https://github.com/NTARI-RAND/fruitful.

# Frontend

Este diretório abriga as interfaces web do Fruitful.

## Subaplicações

- `app/` – Site em Next.js que fornece a interface principal do usuário.
- `chat-ui/` – Interface conversacional construída com Vite e React. Consulte [chat-ui/ARCHITECTURE.md](chat-ui/ARCHITECTURE.md) para detalhes de arquitetura.

## Variáveis de ambiente

Ambas as subaplicações dependem de variáveis de ambiente para se comunicar com os serviços de backend.

### Next.js (`app/`)

- `NEXT_PUBLIC_BACKEND_URL` – URL base para as requisições à API do backend.
- `NEXT_PUBLIC_API_KEY` – Chave de API usada para autorizar as requisições vindas do site em Next.js.
- `NEXT_PUBLIC_APPSYNC_GRAPHQL_ENDPOINT` – URL do endpoint GraphQL do AppSync.
- `NEXT_PUBLIC_APPSYNC_API_KEY` – Chave de API para as requisições ao AppSync.

### Interface de chat (`chat-ui/`)

- `VITE_API_BASE_URL` – URL base da API usada pela interface de chat.
- `VITE_API_KEY` – Chave de API usada pela interface de chat.
