# Sift CLI

The intended public install path is npm:

```bash
npm install -g @sift-wiki/cli
```

The package is live on the public npm registry and installs the `sift` command.
This private monorepo owns CLI source and package verification. Public npm
publishes are cut from the `goodnight000/sift-cli` release mirror so provenance
can point at a public GitHub source repository.

Repo maintainers can verify package changes before promoting a release artifact
with:

```bash
pnpm --filter @sift-wiki/cli pack:verify
```

For one-off use without a global install:

```bash
npx -y @sift-wiki/cli@latest auth status --json
npm exec --yes --package @sift-wiki/cli@latest -- sift auth status --json
```

The CLI bundles its own agent setup skill. An agent can install it before any
other setup (this is the entry point of the local-agent onboarding prompt):

```bash
npx -y @sift-wiki/cli@latest skill install   # writes .claude/skills/sift-setup/SKILL.md
sift skill print sift-cli                     # or print it to stdout
sift skill list                               # list bundled skills
```

`sift skill` commands are local and need no auth.

Then authenticate and check the installed command:

```bash
sift login
sift doctor
sift ask "what changed this week?"
```

The CLI is a hosted thin client. `sift login` is the normal setup path and opens
the existing browser login flow.

## Roam Research import

Open the graph in Roam Desktop, then approve read-only local access:

```bash
npx -y @roam-research/roam-mcp connect --access-level read-only
```

Import only pages marked `[[Sift]]` in Roam:

```bash
sift roam import --scope sift-tag
```

Import the whole graph only when you intentionally want Sift to read every
readable page:

```bash
sift roam import --scope whole-graph --confirm-whole-graph
```

For repo-local install details, troubleshooting, and advanced CI/headless
env-token auth, see `docs/cli/install.md`.
