<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

## Project conventions

- **Security**: read all secrets from `process.env` only. Never hardcode tokens/keys. The old `FALLBACK_BLOB_TOKEN` pattern has been removed; do not reintroduce it.
- **Admin auth**: server-side HMAC session cookie via `src/lib/auth.js`. Protect admin routes with `src/middleware.js`. Login at `/api/admin/login`, session check at `/api/admin/me`.
- **Plugin uploads**: `/api/upload` and `/api/upload/presign` require `X-Plugin-Key` header matching env `PLUGIN_UPLOAD_KEY`. See `src/lib/plugin-auth.js`.
- **R2 access**: proxy-only via `/api/cad/download`. No public R2 domain configured. Keep `forcePathStyle: true` on all S3Client instances.
- **Visits log**: `logs/visits.json` in Vercel Blob. POST from viewer is public (records access); GET requires admin session. Write is retry-looped to mitigate races.

## Verification commands

Before committing, run:
```bash
npm run lint
npm run build
```
Both must pass. If `next.config.mjs` or middleware changes, also smoke-test: login flow, upload with plugin key, viewer load, admin list/delete.
<!-- END:nextjs-agent-rules -->
