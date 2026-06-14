# Sift CLI

This repository is the public release mirror for `@sift-wiki/cli`.

The package installs the `sift` command:

```bash
npm install -g @sift-wiki/cli
sift login
sift doctor
```

For one-off use without a global install:

```bash
npx -y @sift-wiki/cli@latest auth status --json
npm exec --yes --package @sift-wiki/cli@latest -- sift auth status --json
```

## Release Shape

The private Sift monorepo builds the bundled CLI artifact. This public repo
contains only the files needed to publish the public npm package:

- `package.json`
- `README.md`
- `dist/bin/sift.js`
- `scripts/verify-release.mjs`
- `.github/workflows/publish-cli.yml`

The bundled `dist/bin/sift.js` is the same artifact npm users receive.

## Maintainer Release

1. Update `package.json` and `dist/bin/sift.js`.
2. Run `npm run verify`.
3. Commit and push to `main`.
4. Tag `cli-v<package-version>`.
5. Push the tag.

The tag workflow publishes through npm trusted publishing. It uses GitHub OIDC
and does not require an npm token secret.
