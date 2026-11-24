# Fruitful

Fruitful is a single Next.js app. Run it from the repository root. Routes live
in `app/`, including chat in `app/chat/`.

The listing form supports explicitly saved, browser-local drafts. See
[listing drafts](docs/listing-drafts.md) for usage, privacy limits, and checks.

## Run locally

Install dependencies with `npm ci`. To use a particular backend, create
`.env.local` in the repository root and set its API base URL.

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Use your backend's API base, including any path prefix it requires, without a
trailing slash. The shared API client and home-page listing requests fall back
to `http://localhost:5000` when the variable is unset.

Start the development server with `npm run dev`. For production, set
`NEXT_PUBLIC_API_URL` before running `npm run build`. The build embeds the
value in the browser bundle, so changing the backend URL requires a rebuild.

If `NEXT_PUBLIC_API_KEY` is set, the shared API client sends it as the
`X-API-Key` header. Both `NEXT_PUBLIC_*` values are visible to browser users.
Keep privileged keys and other secrets on the server.
