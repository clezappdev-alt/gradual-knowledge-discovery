# references/

Read-only consultation clones. Clone contents are never committed: `.gitignore` ignores
`references/*` and re-includes only this file and `manifest.yml`.

Every clone has an entry in `manifest.yml` with a purpose, an owner and a TTL. No entry means the
directory is an orphan and gets deleted.
