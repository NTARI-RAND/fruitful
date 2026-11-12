# lupa lukin (Frontend)

> **toki pona:** lipu ni li lipu lili pi kulupu, tan nasin NTARI "P2-002". lipu
> ale li lipu "README.md" pi toki Inli (tenpo pi sitelen: 2026-10-05). ilo sona
> li pali e lipu ni, la kulupu o lukin o pona e ona, tan nasin "P2-002" kipisi
> nanpa 3.1.
>
> **English:** This is a condensed community rendering under NTARI policy
> P2-002. The complete document is the English original README.md (snapshot
> 2026-10-05). Machine-assisted draft pending community review per P2-002
> section 3.1.
>
> sina lukin e pakala lon toki ni la o pona e ona: o pali e "fork" lon
> https://github.com/NTARI-RAND/fruitful, o pana e "pull request". pana sina li
> pona tawa mi mute.

poki lipu ni li jo e lupa lukin pi ilo "Fruitful". lupa lukin ni li lon ilo lipu ("web").

## ilo lili insa (Sub-apps)

- `app/` – lipu "Next.js" ("site"). ona li pana e lupa lukin suli tawa jan kepeken.
- `chat-ui/` – lupa lukin pi toki jan. jan li pali e ona kepeken ilo "Vite" en ilo "React". sina wile sona e nasin ilo ona la o lukin e [chat-ui/ARCHITECTURE.md](chat-ui/ARCHITECTURE.md).

## ijo ante pi ma ilo ("environment variables")

ilo lili insa tu ni li kepeken ijo ante pi ma ilo. tan ni la ona li ken toki tawa ilo monsi ("backend").

### ilo "Next.js" (`app/`)

- `NEXT_PUBLIC_BACKEND_URL` – nimi "URL" open tawa wile "API" pi ilo monsi.
- `NEXT_PUBLIC_API_KEY` – ilo open "API" ("API key"). ona li pana e ken tawa wile tan lipu "Next.js".
- `NEXT_PUBLIC_APPSYNC_GRAPHQL_ENDPOINT` – nimi "URL" pi lupa "GraphQL" pi ilo "AppSync".
- `NEXT_PUBLIC_APPSYNC_API_KEY` – ilo open "API" tawa wile pi ilo "AppSync".

### lupa lukin pi toki jan (`chat-ui/`)

- `VITE_API_BASE_URL` – nimi "URL" open pi ilo "API". lupa lukin pi toki jan li kepeken ilo "API" ni.
- `VITE_API_KEY` – ilo open "API". lupa lukin pi toki jan li kepeken ona.
