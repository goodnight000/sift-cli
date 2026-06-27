#!/usr/bin/env node
import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm } from "node:fs/promises";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawn } from "node:child_process";

const root = resolve(new URL("..", import.meta.url).pathname);
const pkg = JSON.parse(await readFile(join(root, "package.json"), "utf8"));
const binPath = join(root, "dist/bin/sift.js");
const bin = await readFile(binPath, "utf8");

assert.equal(pkg.name, "@sift-wiki/cli");
assert.equal(pkg.version, "0.1.5");
assert.equal(pkg.bin?.sift, "dist/bin/sift.js");
assert.deepEqual(pkg.files, ["dist/bin", "README.md"]);
assert.equal(pkg.repository?.url, "git+https://github.com/goodnight000/sift-cli.git");
assert.equal(pkg.publishConfig?.access, "public");
assert.equal(pkg.dependencies, undefined);
assert.ok(bin.startsWith("#!/usr/bin/env node\n"), "dist/bin/sift.js must keep the node shebang");

for (const pattern of [
  /sk-[A-Za-z0-9_-]{20,}/,
  /ghp_[A-Za-z0-9_]{20,}/,
  /github_pat_[A-Za-z0-9_]{20,}/,
  /xox[baprs]-[A-Za-z0-9-]{20,}/,
  /-----BEGIN (?:RSA |OPENSSH |)PRIVATE KEY-----/,
]) {
  assert.equal(pattern.test(bin), false, `dist/bin/sift.js matched secret-like pattern ${pattern}`);
}

const workdir = await mkdtemp(join(tmpdir(), "sift-cli-release-"));
try {
  const home = join(workdir, "home");
  await mkdir(home, { recursive: true });
  const npmEnv = {
    ...process.env,
    HOME: home,
    USERPROFILE: home,
    npm_config_cache: join(workdir, "npm-cache"),
  };
  const pack = await run("npm", ["pack", "--json", "--pack-destination", workdir], {
    cwd: root,
    env: npmEnv,
  });
  const packResult = JSON.parse(pack.stdout);
  assert.equal(packResult.length, 1, "npm pack must produce exactly one tarball");
  const files = packResult[0].files.map((file) => file.path).sort();
  assert.deepEqual(files, ["README.md", "dist/bin/sift.js", "package.json"]);

  const prefix = join(workdir, "prefix");
  const tarball = join(workdir, packResult[0].filename);
  await run("npm", ["install", "--prefix", prefix, "-g", tarball], { env: npmEnv });

  const installedBin = join(prefix, "bin/sift");
  const status = await run(installedBin, ["auth", "status", "--json"], { env: npmEnv });
  assert.deepEqual(JSON.parse(status.stdout), { auth: "none" });

  const fakeApi = await startFakeApi();
  try {
    const env = {
      ...process.env,
      SIFT_API_BASE_URL: `http://127.0.0.1:${fakeApi.port}`,
      SIFT_API_TOKEN: "token_id:secret",
      SIFT_WORKSPACE_ID: "workspace_pkg_smoke",
      SIFT_BRAIN_ID: "brain_pkg_smoke",
      SIFT_PRINCIPAL_ID: "principal_pkg_smoke",
      SIFT_TOKEN_CAPABILITIES: "record:read",
    };

    const envStatus = await run(installedBin, ["auth", "status", "--json"], { env });
    const envStatusJson = JSON.parse(envStatus.stdout);
    assert.equal(envStatusJson.auth, "env");
    assert.equal(envStatusJson.token, undefined);

    await run(installedBin, ["whoami", "--json"], { env });
    await run(installedBin, ["ask", "package smoke", "--json"], { env });

    assert.deepEqual(fakeApi.requests.map((request) => request.path), [
      "/agent-tools/whoami",
      "/agent-tools/context.assemble",
    ]);
    for (const request of fakeApi.requests) {
      assert.equal(request.authorization, "Bearer token_id:secret");
      assert.equal(request.workspace, "workspace_pkg_smoke");
      assert.equal(request.brain, "brain_pkg_smoke");
    }
  } finally {
    await fakeApi.close();
  }
} finally {
  await rm(workdir, { recursive: true, force: true });
}

console.log(`Verified ${pkg.name}@${pkg.version}`);

function run(command, args, options = {}) {
  return new Promise((resolveRun, reject) => {
    const child = spawn(command, args, {
      cwd: options.cwd ?? root,
      env: options.env ?? process.env,
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolveRun({ stdout, stderr });
        return;
      }
      reject(new Error(`${command} ${args.join(" ")} failed with ${code}\n${stdout}\n${stderr}`));
    });
  });
}

function startFakeApi() {
  const requests = [];
  const server = createServer(async (request, response) => {
    const chunks = [];
    for await (const chunk of request) {
      chunks.push(chunk);
    }
    const body = Buffer.concat(chunks).toString("utf8");
    requests.push({
      path: request.url,
      authorization: request.headers.authorization,
      workspace: request.headers["x-sift-workspace-id"],
      brain: request.headers["x-sift-brain-id"],
      body,
    });

    response.setHeader("content-type", "application/json");
    if (request.url === "/agent-tools/whoami") {
      response.end(JSON.stringify({
        principalId: "principal_pkg_smoke",
        workspaceId: "workspace_pkg_smoke",
        brainId: "brain_pkg_smoke",
        capabilities: ["record:read"],
      }));
      return;
    }
    if (request.url === "/agent-tools/context.assemble") {
      response.end(JSON.stringify({
        markdown: "Package smoke answer",
        citations: [{ recordId: "record_pkg_smoke", label: "Package Smoke" }],
      }));
      return;
    }
    response.statusCode = 404;
    response.end(JSON.stringify({ error: "not_found" }));
  });

  return new Promise((resolveStart, reject) => {
    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (typeof address !== "object" || address === null) {
        reject(new Error("Fake API did not bind to a TCP port."));
        return;
      }
      resolveStart({
        port: address.port,
        requests,
        close: () => new Promise((resolveClose, rejectClose) => {
          server.close((error) => error ? rejectClose(error) : resolveClose());
        }),
      });
    });
  });
}
