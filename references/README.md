# references/

Read-only consultation clones. Nothing here is product code, and clone contents are never committed:
`.gitignore` keeps `references/*` out except this file and `manifest.yml`.

Every clone has an entry in `manifest.yml` with a purpose, an owner and a TTL. No entry means the
directory is an orphan and gets deleted.
