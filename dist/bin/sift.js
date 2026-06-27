#!/usr/bin/env node
var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// ../tools/dist/gating.js
function isGatedTool(name) {
  return !ungatedToolNames.has(name);
}
var UNGATED_TOOL_NAMES, ungatedToolNames;
var init_gating = __esm({
  "../tools/dist/gating.js"() {
    "use strict";
    UNGATED_TOOL_NAMES = [
      "contract.get",
      "whoami",
      "tools.list",
      "tools.schema",
      "tools.help",
      "tools.search",
      "brain.list",
      "brain.use",
      "scope.current"
    ];
    ungatedToolNames = new Set(UNGATED_TOOL_NAMES);
  }
});

// ../tools/dist/canvasTools.js
function canvasToolDefinitions(writeTool2) {
  return [
    writeTool2("canvas.create", "Create a canvas (a spatial board of live views and notes). Returns the canvas id; compose it with canvas.add_node.", {
      title: { type: "string" },
      intent: { type: "string" }
    }, "sift canvas create --title 'This week'", { required: ["title"] }),
    writeTool2("canvas.add_node", [
      "Add one node to a canvas. Pick the most structured nodeType that fits; prose is the",
      "last resort. nodeType: plan (title + tracks of {name, owners?, goal?, items:[{text,",
      "who?, when?, done?}]} \u2014 roadmaps, weekly plans, agendas), metric (label + value,",
      "optional delta {direction,magnitude,sentiment} \u2014 one number), chart (rows of",
      "{label, value:number}, optional title \u2014 comparing numbers), kanban or checklist",
      "(queryRef binding to a live workspace query), prose (markdown, optional title),",
      "note (text \u2014 a short plain annotation, never primary content).",
      "Content must come from brain data you actually read, never invented."
    ].join(" "), {
      canvasId: { type: "string" },
      nodeType: {
        type: "string",
        enum: ["plan", "metric", "chart", "kanban", "checklist", "prose", "note"]
      },
      text: { type: "string" },
      markdown: { type: "string" },
      title: { type: "string" },
      timeframe: { type: "string" },
      tracks: { type: "array", items: { type: "object" } },
      label: { type: "string" },
      value: { type: "string" },
      delta: { type: "object" },
      rows: { type: "array", items: { type: "object" } },
      queryRef: { type: "string" },
      position: { type: "object" }
    }, "sift canvas add-node <canvas-id> --type metric", { required: ["canvasId", "nodeType"] }),
    writeTool2("canvas.remove_node", "Remove a node or note from a canvas by id.", {
      canvasId: { type: "string" },
      nodeId: { type: "string" }
    }, "sift canvas remove-node <canvas-id> <node-id>", { required: ["canvasId", "nodeId"] })
  ];
}
var init_canvasTools = __esm({
  "../tools/dist/canvasTools.js"() {
    "use strict";
  }
});

// ../tools/dist/inputParsers.js
function parseCaptureFile(input) {
  return {
    sourceName: requireString(input, "sourceName"),
    externalId: requireString(input, "externalId"),
    title: requireString(input, "title"),
    filename: requireString(input, "filename"),
    contentType: requireString(input, "contentType"),
    bytes: requireBytes(input, "bytes"),
    visibility: requireStringArray(input, "visibility")
  };
}
function parseCaptureText(input) {
  return {
    sourceName: requireString(input, "sourceName"),
    externalId: requireString(input, "externalId"),
    title: requireString(input, "title"),
    markdown: requireCaptureMarkdown(input, "markdown"),
    visibility: requireStringArray(input, "visibility")
  };
}
function parseCaptureBatch(input) {
  const rawItems = input.items;
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    throw new Error("items must be a non-empty array.");
  }
  if (rawItems.length > 20) {
    throw new Error("items must contain no more than 20 captures.");
  }
  return {
    items: rawItems.map((item, index) => parseCaptureBatchItem(item, index))
  };
}
function parseCaptureBatchItem(item, index) {
  const record = requireRecord(item, `items[${index}]`);
  const kind = requireString(record, "kind");
  if (kind === "text") {
    return { kind, ...parseCaptureText(record) };
  }
  if (kind === "file") {
    return { kind, ...parseCaptureFile(record) };
  }
  throw new Error(`items[${index}].kind must be text or file.`);
}
function parseSourceCreate(input) {
  return {
    name: requireString(input, "name"),
    visibility: requireStringArray(input, "visibility")
  };
}
function parseSearchQuery(input) {
  return {
    query: requireString(input, "query"),
    limit: requireInteger(input, "limit", 10)
  };
}
function parseContextQuery(input) {
  return {
    query: requireString(input, "query"),
    queryIssuedAt: optionalString(input, "queryIssuedAt"),
    timezone: optionalString(input, "timezone"),
    maxChars: requireInteger(input, "maxChars", 4e3)
  };
}
function parseProfileQuery(input) {
  return {
    query: optionalString(input, "query"),
    limit: optionalInteger(input, "limit")
  };
}
function parseToolsSearch(input) {
  const result = {
    intent: requireString(input, "intent")
  };
  if (input.toolsetNames !== void 0) {
    result.toolsetNames = requireStringArray(input, "toolsetNames");
  }
  if (input.limit !== void 0) {
    const limit = optionalInteger(input, "limit");
    if (limit === void 0 || limit < 1 || limit > 20) {
      throw new Error("limit must be an integer between 1 and 20.");
    }
    result.limit = limit;
  }
  return result;
}
function parseDecision(input) {
  return {
    statement: requireString(input, "statement"),
    state: requireDecisionState(input, "state"),
    rationale: optionalString(input, "rationale"),
    authorship: optionalString(input, "authorship"),
    evidenceIds: optionalStringArray(input, "evidenceIds"),
    visibility: requireStringArray(input, "visibility")
  };
}
function parseTask(input) {
  return {
    title: requireString(input, "title"),
    status: optionalTaskStatus(input, "status"),
    owner: optionalString(input, "owner"),
    dueDate: optionalString(input, "dueDate"),
    rationale: optionalString(input, "rationale"),
    authorship: optionalString(input, "authorship"),
    evidenceIds: optionalStringArray(input, "evidenceIds"),
    visibility: requireStringArray(input, "visibility")
  };
}
function parseMarkdownRecord(input) {
  return {
    recordType: requireString(input, "recordType"),
    title: requireString(input, "title"),
    markdown: requireString(input, "markdown"),
    visibility: requireStringArray(input, "visibility")
  };
}
function parseRecordRead(input) {
  return {
    recordId: requireString(input, "recordId"),
    sectionAnchor: optionalString(input, "sectionAnchor")
  };
}
function parseRecordSectionPatch(input) {
  return {
    recordId: requireString(input, "recordId"),
    anchor: requireString(input, "anchor"),
    replacementMarkdown: requireString(input, "replacementMarkdown"),
    expectedMarkdown: optionalString(input, "expectedMarkdown")
  };
}
function parseAuditEvents(input) {
  return { targetId: optionalString(input, "targetId") };
}
function requireString(input, key) {
  const value = input[key];
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${key} is required.`);
  }
  return value;
}
function requireCaptureMarkdown(input, key) {
  const markdown = requireString(input, key);
  if (textEncoder.encode(markdown).byteLength > MAX_CAPTURE_MARKDOWN_BYTES) {
    throw new Error(`${key} must be no more than ${MAX_CAPTURE_MARKDOWN_BYTES} UTF-8 bytes. Use capture.file for larger material.`);
  }
  return markdown;
}
function optionalString(input, key) {
  const value = input[key];
  if (value === void 0) {
    return void 0;
  }
  if (typeof value !== "string") {
    throw new Error(`${key} must be a string.`);
  }
  const trimmed = value.trim();
  return trimmed.length === 0 ? void 0 : trimmed;
}
function optionalTaskStatus(input, key) {
  const value = input[key];
  if (value === void 0) {
    return void 0;
  }
  if (value !== "open" && value !== "in_progress" && value !== "done") {
    throw new Error(`${key} must be open, in_progress, or done.`);
  }
  return value;
}
function requireDecisionState(input, key) {
  const value = input[key];
  if (value !== "proposed" && value !== "accepted" && value !== "rejected" && value !== "superseded") {
    throw new Error(`${key} must be proposed, accepted, rejected, or superseded.`);
  }
  return value;
}
function requireStringArray(input, key) {
  const value = input[key];
  if (!Array.isArray(value) || !value.every((item) => typeof item === "string")) {
    throw new Error(`${key} must be a string array.`);
  }
  return value;
}
function optionalStringArray(input, key) {
  const value = input[key];
  if (value === void 0) {
    return void 0;
  }
  if (!Array.isArray(value) || !value.every((item) => typeof item === "string")) {
    throw new Error(`${key} must be a string array.`);
  }
  const trimmed = value.map((item) => item.trim()).filter((item) => item.length > 0);
  return trimmed.length === 0 ? void 0 : trimmed;
}
function requireRecord(value, label) {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error(`${label} must be an object.`);
  }
  return value;
}
function requireBytes(input, key) {
  const value = input[key];
  if (value instanceof Uint8Array) {
    return value;
  }
  if (Array.isArray(value) && value.every((item) => Number.isInteger(item) && Number(item) >= 0 && Number(item) <= 255)) {
    return new Uint8Array(value.map(Number));
  }
  throw new Error(`${key} must be a byte array.`);
}
function requireInteger(input, key, fallback) {
  const value = input[key];
  if (value === void 0) {
    return fallback;
  }
  if (!Number.isInteger(value)) {
    throw new Error(`${key} must be an integer.`);
  }
  return Number(value);
}
function optionalInteger(input, key) {
  const value = input[key];
  if (value === void 0) {
    return void 0;
  }
  if (!Number.isInteger(value)) {
    throw new Error(`${key} must be an integer.`);
  }
  return Number(value);
}
var MAX_CAPTURE_MARKDOWN_BYTES, textEncoder;
var init_inputParsers = __esm({
  "../tools/dist/inputParsers.js"() {
    "use strict";
    MAX_CAPTURE_MARKDOWN_BYTES = 256 * 1024;
    textEncoder = new TextEncoder();
  }
});

// ../tools/dist/registry.js
function listToolDefinitions() {
  return [...toolDefinitions, ...canvasToolDefinitions(writeTool)].map((tool) => isGatedTool(tool.name) ? withContractVersionProperty(tool) : tool);
}
function withContractVersionProperty(tool) {
  return {
    ...tool,
    inputSchema: {
      ...tool.inputSchema,
      properties: {
        ...tool.inputSchema.properties,
        contractVersion: {
          type: "string",
          description: "Echo the current Sift contract version from contract.get."
        }
      }
    }
  };
}
function isToolAuthorized(capabilities, tool) {
  return tool.capability === NO_CAPABILITY || capabilities.includes(tool.capability);
}
function identityTool(name, summary, properties, cliExample, options) {
  return defineTool({
    name,
    summary,
    properties,
    required: options.required ?? [],
    capability: NO_CAPABILITY,
    mutability: options.mutability,
    transports: writeTransports,
    cliExample,
    hostedAgent: { available: false, ...options.hostedAgent }
  });
}
function readTool(name, summary, properties, cliExample, options) {
  return defineTool({
    name,
    summary,
    properties,
    required: options?.required,
    capability: "record:read",
    mutability: "read",
    transports: readTransports,
    cliExample,
    hostedAgent: options?.hostedAgent
  });
}
function writeTool(name, summary, properties, cliExample, options) {
  return defineTool({
    name,
    summary,
    properties,
    required: options?.required,
    capability: "record:write",
    mutability: "write",
    transports: writeTransports,
    idempotency: options?.idempotency,
    cliExample,
    hostedAgent: options?.hostedAgent
  });
}
function hostedAgentOnlyReadTool(name, summary, properties, options) {
  return defineTool({
    name,
    summary,
    properties,
    required: options.required,
    capability: "record:read",
    mutability: "read",
    transports: [],
    cliExample: "",
    hostedAgent: { available: true, ...options.hostedAgent }
  });
}
function sourceWriteTool(name, summary, properties, cliExample) {
  return defineTool({
    name,
    summary,
    properties,
    capability: "source:write",
    mutability: "write",
    transports: writeTransports,
    cliExample
  });
}
function adminTool(name, summary, properties, cliExample) {
  return defineTool({
    name,
    summary,
    properties,
    capability: "event:audit:read",
    mutability: "admin",
    transports: readTransports,
    cliExample
  });
}
function defineTool(input) {
  const required = input.required ?? Object.keys(input.properties);
  return {
    name: input.name,
    summary: input.summary,
    inputSchema: {
      type: "object",
      required,
      properties: input.properties,
      additionalProperties: false
    },
    outputSchema: { type: "object", properties: {}, additionalProperties: false },
    capability: input.capability,
    mutability: input.mutability,
    auditCategory: input.mutability === "admin" ? "admin" : input.mutability,
    transports: input.transports,
    idempotency: input.idempotency ?? (input.mutability === "write" ? "recommended" : "none"),
    resultSize: "compact",
    cliExample: input.cliExample,
    hostedAgent: hostedAgentMetadata(input, required)
  };
}
function hostedAgentMetadata(input, required) {
  return {
    available: input.hostedAgent?.available ?? true,
    toolsets: input.hostedAgent?.toolsets ?? defaultToolsets(input.name),
    searchTerms: input.hostedAgent?.searchTerms ?? defaultSearchTerms(input.name, input.summary),
    inputHints: input.hostedAgent?.inputHints ?? required,
    riskClass: input.hostedAgent?.riskClass ?? defaultRiskClass(input.mutability)
  };
}
function defaultRiskClass(mutability) {
  if (mutability === "write") {
    return "medium";
  }
  if (mutability === "admin") {
    return "high";
  }
  return "low";
}
function defaultToolsets(name) {
  const [prefix = ""] = name.split(".");
  return defaultToolsetsByPrefix[prefix] ?? ["brain"];
}
function defaultSearchTerms(name, summary) {
  return [.../* @__PURE__ */ new Set([...tokenize(name), ...tokenize(summary)])];
}
function tokenize(text) {
  return text.toLowerCase().split(/[^a-z0-9]+/u).filter(Boolean);
}
function stringProps(names) {
  return Object.fromEntries(names.map((name) => [name, { type: "string" }]));
}
var readTransports, writeTransports, NO_CAPABILITY, defaultToolsetsByPrefix, toolDefinitions;
var init_registry = __esm({
  "../tools/dist/registry.js"() {
    "use strict";
    init_gating();
    init_canvasTools();
    init_inputParsers();
    readTransports = ["cli", "hosted_mcp", "local_mcp"];
    writeTransports = ["cli", "hosted_mcp", "local_mcp"];
    NO_CAPABILITY = "none";
    defaultToolsetsByPrefix = {
      audit: ["audit"],
      capture: ["brain", "ingestion"],
      context: ["brain", "retrieval"],
      decision: ["work"],
      event: ["audit"],
      evidence: ["brain", "retrieval"],
      graph: ["brain", "retrieval"],
      ingestion: ["brain", "ingestion"],
      record: ["brain", "ingestion"],
      search: ["brain", "retrieval"],
      skill: ["brain", "work"],
      source: ["brain", "ingestion"],
      task: ["work"],
      tools: ["registry"],
      web: ["web"]
    };
    toolDefinitions = [
      readTool("contract.get", "Fetch the Sift agent contract (kernel + workspace overlay) and the contractVersion to echo on every gated tool call. Call this before any other Sift work.", {}, "sift contract get"),
      readTool("whoami", "Return principal, actor, scope, and capabilities.", {}, "sift whoami"),
      readTool("brain.list", "List brains available to the current scope.", {}, "sift brain list"),
      readTool("brain.use", "Select the current brain scope for subsequent operations.", stringProps(["brainId"]), "sift brain use <brain-id>"),
      readTool("scope.current", "Show the authenticated workspace and brain scope.", {}, "sift scope current"),
      readTool("tools.list", "List tools available to this transport and scope.", {}, "sift tools list"),
      readTool("tools.schema", "Return JSON schemas for available tools.", {}, "sift tools schema --json"),
      readTool("tools.help", "Return compact help for a tool.", stringProps(["name"]), "sift tools help search.query"),
      readTool("tools.search", "Search compact authorized tool entries by hosted-agent intent.", {
        intent: { type: "string" },
        toolsetNames: { type: "array", items: { type: "string" } },
        limit: { type: "integer", minimum: 1, maximum: 20 }
      }, "sift tools search 'record this as a decision'", {
        required: ["intent"],
        hostedAgent: { toolsets: ["registry", "brain"], searchTerms: ["discover", "tool", "search"] }
      }),
      readTool("source.list", "List sources visible in the selected brain.", {}, "sift source list"),
      readTool("source.get", "Read source metadata.", stringProps(["sourceId"]), "sift source get <source-id>"),
      sourceWriteTool("source.create", "Create a source for future captures.", { name: { type: "string" }, visibility: { type: "array", items: { type: "string" } } }, "sift source create --name Notes --visibility team"),
      readTool("source.status", "Inspect source processing status.", stringProps(["sourceId"]), "sift source status <source-id>"),
      sourceWriteTool("capture.text", "Capture text or markdown through the ingestion spine.", {
        sourceName: { type: "string" },
        externalId: { type: "string" },
        title: { type: "string" },
        markdown: { type: "string", maxLength: MAX_CAPTURE_MARKDOWN_BYTES },
        visibility: { type: "array", items: { type: "string" } }
      }, "sift capture text --source Notes --external-id note-1"),
      sourceWriteTool("capture.file", "Capture file metadata and content without treating the local path as canonical.", {
        sourceName: { type: "string" },
        externalId: { type: "string" },
        title: { type: "string" },
        filename: { type: "string" },
        contentType: { type: "string" },
        bytes: { type: "array", items: { type: "integer" } },
        visibility: { type: "array", items: { type: "string" } }
      }, "sift capture file ./notes.md --source Notes --external-id note-1"),
      sourceWriteTool("capture.batch", "Capture a bounded batch of text or file inputs.", {
        items: {
          type: "array",
          items: {
            type: "object",
            required: ["kind", "sourceName", "externalId", "title", "visibility"],
            properties: {
              kind: { type: "string" },
              sourceName: { type: "string" },
              externalId: { type: "string" },
              title: { type: "string" },
              markdown: { type: "string", maxLength: MAX_CAPTURE_MARKDOWN_BYTES },
              filename: { type: "string" },
              contentType: { type: "string" },
              bytes: { type: "array", items: { type: "integer" } },
              visibility: { type: "array", items: { type: "string" } }
            }
          }
        }
      }, "sift capture batch manifest.json"),
      readTool("ingestion.status", "Inspect ingestion job status.", stringProps(["jobId"]), "sift ingestion status <job-id>"),
      readTool("record.list", "List authorized records.", {}, "sift record list"),
      readTool("record.get", "Read an authorized markdown record.", { recordId: { type: "string" }, sectionAnchor: { type: "string" } }, "sift record get <record-id>", { required: ["recordId"] }),
      writeTool("record.create_markdown", "Create a versioned markdown brain record.", {
        recordType: { type: "string" },
        title: { type: "string" },
        markdown: { type: "string" },
        visibility: { type: "array", items: { type: "string" } }
      }, "sift record create-markdown --title Note"),
      writeTool("record.patch_section", "Patch a stable markdown heading section with conflict detection.", stringProps(["recordId", "anchor", "replacementMarkdown", "expectedMarkdown"]), "sift record patch-section <record-id> <anchor>", { required: ["recordId", "anchor", "replacementMarkdown"] }),
      readTool("record.versions", "List record versions.", stringProps(["recordId"]), "sift record versions <record-id>"),
      writeTool("decision.create", "Create a canonical decision record.", {
        statement: { type: "string" },
        state: { type: "string" },
        rationale: { type: "string" },
        authorship: { type: "string" },
        evidenceIds: { type: "array", items: { type: "string" } },
        visibility: { type: "array", items: { type: "string" } }
      }, "sift decision create", { required: ["statement", "state", "visibility"] }),
      writeTool("task.create", "Create a canonical task record.", {
        title: { type: "string" },
        status: { type: "string" },
        owner: { type: "string" },
        dueDate: { type: "string" },
        rationale: { type: "string" },
        authorship: { type: "string" },
        evidenceIds: { type: "array", items: { type: "string" } },
        visibility: { type: "array", items: { type: "string" } }
      }, "sift task create", { required: ["title", "visibility"] }),
      identityTool("agent.register", "Register the calling agent as a workspace agent worker acting for the token's owner; idempotent on (workspace, owner, normalized name) and never mutates token state.", {
        name: { type: "string", maxLength: 80 },
        description: { type: "string", maxLength: 280 },
        kind: { type: "string" }
      }, 'sift agent register --name "Claude Code" --description "Coding agent"', { required: ["name"], mutability: "write" }),
      identityTool("agent.status", "Report the request's resolved agent identity (from the asserted agent name) or none.", {}, "sift agent status --json", { mutability: "read" }),
      readTool("skill.resolve", "Resolve at most three advisory skill candidates for a task description, each with the skill record id, pinned active version id, title, and applicability summary, or an empty list.", { query: { type: "string" } }, "sift skill resolve 'draft the monthly investor update'", { required: ["query"] }),
      readTool("skill.get", "Read a skill's pinned active version markdown body, version id, and bundle file paths by skill record id.", { skillId: { type: "string" } }, "sift skill get <skill-id>", { required: ["skillId"] }),
      readTool("skill.file", "Read one of a skill's bundle files by path; fetch a file only when the skill body references it and the task needs that detail, using a path listed by skill.get.", { skillId: { type: "string" }, path: { type: "string" } }, "sift skill file <skill-id> examples/2026-05-29-good.md", { required: ["skillId", "path"] }),
      writeTool("skill.exercise", "Report that a skill version informed an output on a surface; the report is an attribution claim only.", {
        skillId: { type: "string" },
        versionId: { type: "string" },
        surface: { type: "string" },
        outputRef: {
          type: "object",
          properties: {
            kind: { type: "string" },
            recordId: { type: "string" },
            versionId: { type: "string" },
            externalRef: { type: "string" }
          },
          required: ["kind"]
        },
        idempotencyKey: { type: "string" }
      }, "sift skill exercise <skill-id> <version-id>", { required: ["skillId", "versionId", "surface", "outputRef", "idempotencyKey"] }),
      writeTool("skill.teach", "Capture an explicit correction lesson for a skill with optional exercise reference; the explicit correction floor for surfaces without ambient capture.", {
        skillId: { type: "string" },
        lesson: { type: "string" },
        exerciseId: { type: "string" },
        severity: { type: "string" },
        visibility: { type: "array", items: { type: "string" } }
      }, "sift skill teach <skill-id> --lesson 'when X, do Y'", { required: ["skillId", "lesson", "visibility"] }),
      writeTool("skill.feedback", "Report structured feedback for a pinned skill version; external-agent reports remain reported until trusted Sift evidence verifies them.", {
        skillId: { type: "string" },
        skillVersionId: { type: "string" },
        exerciseRef: {
          type: "object",
          properties: { exerciseId: { type: "string" } },
          required: ["exerciseId"]
        },
        subjectRef: { type: "object", properties: {} },
        signalKind: { type: "string" },
        polarity: { type: "string", enum: ["positive", "negative", "mixed", "unknown"] },
        strength: { type: "string", enum: ["weak", "medium", "strong"] },
        payload: { type: "object", properties: {} },
        idempotencyKey: { type: "string" }
      }, "sift skill feedback <skill-id> <skill-version-id>", {
        required: [
          "skillId",
          "skillVersionId",
          "signalKind",
          "polarity",
          "strength",
          "payload",
          "idempotencyKey"
        ],
        idempotency: "required"
      }),
      readTool("search.query", "Search authorized brain context and return raw cited candidate results for exploration.", {
        query: { type: "string" },
        limit: { type: "integer", minimum: 1, maximum: 20 }
      }, "sift search query 'launch risks'"),
      readTool("context.assemble", "Assemble grounded answer-preparation context with request time, caller identity, task guidance from visible Sift skills when available, safe source metadata, gaps, and raw cited fallback.", {
        query: { type: "string" },
        queryIssuedAt: { type: "string" },
        timezone: { type: "string" },
        maxChars: { type: "integer", minimum: 1 }
      }, "sift context assemble 'launch risks'", {
        required: ["query"],
        hostedAgent: {
          toolsets: ["brain", "retrieval"],
          searchTerms: ["context", "cite", "answer", "evidence"]
        }
      }),
      hostedAgentOnlyReadTool("web.search", "Search public web sources for current or public facts.", {
        query: {
          type: "string",
          description: "Public web search query. Do not include private Sift brain context unless the user explicitly provided it for public lookup."
        },
        limit: { type: "integer", minimum: 1, maximum: 10 },
        recencyDays: { type: "integer", minimum: 1, maximum: 3650 },
        allowedDomains: { type: "array", items: { type: "string" } },
        blockedDomains: { type: "array", items: { type: "string" } }
      }, {
        required: ["query"],
        hostedAgent: {
          toolsets: ["web"],
          searchTerms: [
            "web",
            "search",
            "current",
            "public",
            "company",
            "product",
            "docs",
            "news",
            "pricing",
            "people",
            "law",
            "rules"
          ],
          inputHints: ["query", "limit", "recencyDays", "allowedDomains", "blockedDomains"],
          riskClass: "medium"
        }
      }),
      hostedAgentOnlyReadTool("web.fetch", "Read one selected public URL through guarded bounded extraction.", {
        url: {
          type: "string",
          description: "Public http(s) URL to fetch. Local, private, and metadata URLs are refused."
        },
        maxChars: { type: "integer", minimum: 1, maximum: 12e3 }
      }, {
        required: ["url"],
        hostedAgent: {
          toolsets: ["web"],
          searchTerms: ["web", "fetch", "read", "url", "page", "extract", "public"],
          inputHints: ["url", "maxChars"],
          riskClass: "medium"
        }
      }),
      readTool("context.profile", "Read a permission-filtered profile context model.", {}, "sift context profile"),
      readTool("evidence.list", "List authorized evidence links for a record.", stringProps(["recordId"]), "sift evidence list <record-id>"),
      readTool("evidence.get", "Read an authorized evidence item.", stringProps(["evidenceId"]), "sift evidence get <evidence-id>"),
      readTool("graph.neighbors", "Traverse authorized graph neighbors.", stringProps(["recordId"]), "sift graph neighbors <record-id>"),
      readTool("event.list", "List authorized brain events.", {}, "sift event list"),
      adminTool("audit.events", "Inspect redacted audit events when authorized.", stringProps(["targetId"]), "sift audit events <target-id>")
    ];
  }
});

// ../tools/dist/discovery.js
function executeWhoami(auth) {
  return {
    principal: { id: auth.principalId, type: auth.principalType },
    actor: { id: auth.actorId, type: auth.actorType },
    ...auth.agent === void 0 ? {} : { agent: auth.agent },
    scope: { workspaceId: auth.workspaceId, brainId: auth.brainId },
    requestId: auth.requestId,
    authPath: auth.authPath,
    capabilities: auth.capabilities,
    allowedVisibility: auth.allowedVisibility
  };
}
function executeScopeCurrent(auth) {
  return {
    workspaceId: auth.workspaceId,
    brainId: auth.brainId,
    principalId: auth.principalId,
    authPath: auth.authPath,
    capabilities: auth.capabilities,
    allowedVisibility: auth.allowedVisibility
  };
}
function executeBrainList(auth) {
  return [{ workspaceId: auth.workspaceId, brainId: auth.brainId, selected: true }];
}
function executeBrainUse(auth, brainId) {
  return { workspaceId: auth.workspaceId, brainId, selected: true };
}
function executeToolsList(input) {
  return availableTools(input).map((tool) => ({
    name: tool.name,
    summary: tool.summary,
    capability: tool.capability,
    mutability: tool.mutability
  }));
}
function executeToolsSchema(input) {
  return availableTools(input);
}
function executeToolsHelp(input, name) {
  const tool = availableTools(input).find((candidate) => candidate.name === name);
  if (tool === void 0) {
    throw new Error(`Tool '${name}' is unavailable for this transport or scope.`);
  }
  return {
    name: tool.name,
    summary: tool.summary,
    capability: tool.capability,
    mutability: tool.mutability,
    example: tool.cliExample
  };
}
function executeToolsSearch(input, searchInput) {
  const intentTokens = tokenize2(searchInput.intent);
  const requestedToolsets = new Set(searchInput.toolsetNames ?? []);
  const limit = searchInput.limit ?? 8;
  return availableTools(input).filter((tool) => tool.hostedAgent.available).filter((tool) => {
    if (requestedToolsets.size === 0)
      return true;
    return tool.hostedAgent.toolsets.some((toolset) => requestedToolsets.has(toolset));
  }).map((tool) => ({ tool, score: scoreTool(tool, intentTokens) })).filter((entry) => entry.score > 0 || intentTokens.length === 0).sort((left, right) => right.score - left.score || left.tool.name.localeCompare(right.tool.name)).slice(0, limit).map(({ tool }) => ({
    name: tool.name,
    summary: tool.summary,
    mutability: tool.mutability,
    requiredCapability: tool.capability,
    inputHints: tool.hostedAgent.inputHints
  }));
}
function availableTools(input) {
  const transport = input.transport ?? "local_mcp";
  const availableNames = new Set(input.availableToolNames ?? IMPLEMENTED_TOOL_NAMES);
  return listToolDefinitions().filter((tool) => availableNames.has(tool.name) && tool.transports.includes(transport) && isToolAuthorized(input.auth.capabilities, tool));
}
function scoreTool(tool, intentTokens) {
  const haystack = /* @__PURE__ */ new Set([
    ...tokenize2(tool.name),
    ...tokenize2(tool.summary),
    ...tool.hostedAgent.searchTerms.flatMap(tokenize2),
    ...tool.hostedAgent.inputHints.flatMap(tokenize2)
  ]);
  return intentTokens.reduce((score, token) => score + (haystack.has(token) ? 1 : 0), 0);
}
function tokenize2(text) {
  return text.toLowerCase().split(/[^a-z0-9]+/u).filter(Boolean);
}
var IMPLEMENTED_TOOL_NAMES;
var init_discovery = __esm({
  "../tools/dist/discovery.js"() {
    "use strict";
    init_registry();
    IMPLEMENTED_TOOL_NAMES = [
      "contract.get",
      "whoami",
      "brain.list",
      "brain.use",
      "scope.current",
      "tools.list",
      "tools.schema",
      "tools.help",
      "tools.search",
      "capture.text",
      "capture.file",
      "capture.batch",
      "search.query",
      "context.assemble",
      "context.profile",
      "decision.create",
      "task.create",
      "source.list",
      "source.create",
      "source.get",
      "source.status",
      "ingestion.status",
      "record.list",
      "record.get",
      "record.create_markdown",
      "record.patch_section",
      "record.versions",
      "evidence.list",
      "evidence.get",
      "graph.neighbors",
      "event.list",
      "audit.events",
      "agent.register",
      "agent.status"
    ];
  }
});

// ../tools/dist/results.js
function captureResult(result) {
  return {
    status: result.job?.status ?? result.status ?? "captured",
    jobId: result.job?.id,
    sourceId: result.sourceId,
    sourceItemId: result.sourceItemId,
    recordId: result.recordId,
    versionId: result.versionId,
    versionNumber: result.versionNumber
  };
}
function workRecordResult(result) {
  return {
    status: result.job.status,
    jobId: result.job.id,
    recordId: result.recordId,
    versionId: result.versionId,
    versionNumber: result.versionNumber
  };
}
var init_results = __esm({
  "../tools/dist/results.js"() {
    "use strict";
  }
});

// ../tools/dist/captureTools.js
async function executeCaptureText(input, toolInput) {
  const capture = parseCaptureText(toolInput);
  const result = await input.service.ingestText({ auth: input.auth, ...capture });
  return captureResult(result);
}
async function executeCaptureFile(input, toolInput) {
  if (input.service.ingestFile === void 0) {
    throw new Error("Tool 'capture.file' requires a file ingestion service contract.");
  }
  const file = parseCaptureFile(toolInput);
  const result = await input.service.ingestFile({ auth: input.auth, ...file });
  return captureResult(result);
}
async function executeCaptureBatch(input, toolInput) {
  const batch = parseCaptureBatch(toolInput);
  const results = [];
  for (const item of batch.items) {
    if (item.kind === "text") {
      const { kind: _kind2, ...capture } = item;
      const result2 = await input.service.ingestText({ auth: input.auth, ...capture });
      results.push(captureResult(result2));
      continue;
    }
    if (input.service.ingestFile === void 0) {
      throw new Error("Tool 'capture.batch' requires a file ingestion service contract.");
    }
    const { kind: _kind, ...file } = item;
    const result = await input.service.ingestFile({ auth: input.auth, ...file });
    results.push(captureResult(result));
  }
  return results;
}
var init_captureTools = __esm({
  "../tools/dist/captureTools.js"() {
    "use strict";
    init_inputParsers();
    init_results();
  }
});

// ../tools/dist/contractTools.js
function contractToolHandlers(input) {
  return {
    "contract.get": () => {
      if (input.service.getContract === void 0) {
        throw new Error("Tool 'contract.get' requires a runtime service contract.");
      }
      return input.service.getContract({ auth: input.auth });
    }
  };
}
function contractToolAvailability(service) {
  return [[service.getContract !== void 0, ["contract.get"]]];
}
var init_contractTools = __esm({
  "../tools/dist/contractTools.js"() {
    "use strict";
  }
});

// ../tools/dist/skillTools.js
function skillToolHandlers(input, toolInput) {
  return {
    "skill.resolve": () => {
      if (input.service.resolveSkills === void 0)
        throw missingSkillService("skill.resolve");
      return input.service.resolveSkills({
        auth: input.auth,
        query: requireString(toolInput, "query")
      });
    },
    "skill.get": () => {
      if (input.service.getSkill === void 0)
        throw missingSkillService("skill.get");
      return input.service.getSkill({
        auth: input.auth,
        skillId: requireString(toolInput, "skillId")
      });
    },
    "skill.file": () => {
      if (input.service.getSkillFile === void 0)
        throw missingSkillService("skill.file");
      return input.service.getSkillFile({
        auth: input.auth,
        skillId: requireString(toolInput, "skillId"),
        path: requireString(toolInput, "path")
      });
    },
    "skill.exercise": () => {
      if (input.service.recordSkillExercise === void 0) {
        throw missingSkillService("skill.exercise");
      }
      return input.service.recordSkillExercise({
        auth: input.auth,
        ...parseSkillExercise(toolInput)
      });
    },
    "skill.teach": () => {
      if (input.service.teachSkill === void 0)
        throw missingSkillService("skill.teach");
      return input.service.teachSkill({ auth: input.auth, ...parseSkillTeach(toolInput) });
    },
    "skill.feedback": () => {
      if (input.service.reportFeedbackSignal === void 0) {
        throw missingSkillService("skill.feedback");
      }
      return input.service.reportFeedbackSignal({
        auth: input.auth,
        ...parseSkillFeedback(toolInput)
      });
    }
  };
}
function skillToolAvailability(service) {
  return [
    [service.resolveSkills !== void 0, ["skill.resolve"]],
    [service.getSkill !== void 0, ["skill.get"]],
    [service.getSkillFile !== void 0, ["skill.file"]],
    [service.recordSkillExercise !== void 0, ["skill.exercise"]],
    [service.teachSkill !== void 0, ["skill.teach"]],
    [service.reportFeedbackSignal !== void 0, ["skill.feedback"]]
  ];
}
function parseSkillExercise(input) {
  return {
    skillId: requireString(input, "skillId"),
    versionId: requireString(input, "versionId"),
    surface: requireString(input, "surface"),
    outputRef: requireSkillOutputRef(input, "outputRef"),
    idempotencyKey: requireString(input, "idempotencyKey")
  };
}
function parseSkillTeach(input) {
  const exerciseId = input.exerciseId;
  const severity = input.severity;
  const visibility = input.visibility;
  if (exerciseId !== void 0 && typeof exerciseId !== "string") {
    throw new Error("exerciseId must be a string.");
  }
  if (severity !== void 0 && severity !== "normal" && severity !== "harmful") {
    throw new Error("severity must be normal or harmful.");
  }
  if (!Array.isArray(visibility) || !visibility.every((item) => typeof item === "string")) {
    throw new Error("visibility must be a string array.");
  }
  return {
    skillId: requireString(input, "skillId"),
    lesson: requireString(input, "lesson"),
    exerciseId,
    severity,
    visibility
  };
}
function parseSkillFeedback(input) {
  const exerciseRef = optionalObject(input, "exerciseRef");
  const subjectRef = optionalObject(input, "subjectRef");
  const polarity = requireString(input, "polarity");
  const strength = requireString(input, "strength");
  if (!isSkillFeedbackPolarity(polarity)) {
    throw new Error("polarity must be positive, negative, mixed, or unknown.");
  }
  if (!isSkillFeedbackStrength(strength)) {
    throw new Error("strength must be weak, medium, or strong.");
  }
  return {
    skillId: requireString(input, "skillId"),
    skillVersionId: requireString(input, "skillVersionId"),
    exerciseRef: exerciseRef === void 0 ? void 0 : { exerciseId: requireString(exerciseRef, "exerciseId") },
    subjectRef,
    signalKind: requireString(input, "signalKind"),
    polarity,
    strength,
    payload: optionalObject(input, "payload") ?? {},
    idempotencyKey: requireString(input, "idempotencyKey")
  };
}
function requireSkillOutputRef(input, key) {
  const value = input[key];
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error(`${key} must be an object.`);
  }
  const ref = value;
  if (ref.kind === "record") {
    const versionId = ref.versionId;
    if (versionId !== void 0 && typeof versionId !== "string") {
      throw new Error(`${key}.versionId must be a string.`);
    }
    return { kind: "record", recordId: requireString(ref, "recordId"), versionId };
  }
  if (ref.kind === "external") {
    return { kind: "external", externalRef: requireString(ref, "externalRef") };
  }
  throw new Error(`${key}.kind must be record or external.`);
}
function optionalObject(input, key) {
  const value = input[key];
  if (value === void 0) {
    return void 0;
  }
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error(`${key} must be an object.`);
  }
  return value;
}
function isSkillFeedbackPolarity(value) {
  return value === "positive" || value === "negative" || value === "mixed" || value === "unknown";
}
function isSkillFeedbackStrength(value) {
  return value === "weak" || value === "medium" || value === "strong";
}
function missingSkillService(toolName) {
  return new Error(`Tool '${toolName}' requires a runtime service contract.`);
}
var init_skillTools = __esm({
  "../tools/dist/skillTools.js"() {
    "use strict";
    init_inputParsers();
  }
});

// ../tools/dist/agentIdentityTools.js
function agentIdentityToolHandlers(input, toolInput) {
  return {
    "agent.register": () => {
      if (input.service.registerAgent === void 0) {
        throw missingAgentIdentityService("agent.register");
      }
      return input.service.registerAgent({
        auth: input.auth,
        name: requireString(toolInput, "name"),
        description: optionalString(toolInput, "description"),
        kind: parseAgentKind(toolInput)
      });
    },
    "agent.status": () => {
      if (input.service.getAgentStatus === void 0) {
        throw missingAgentIdentityService("agent.status");
      }
      return input.service.getAgentStatus({ auth: input.auth });
    }
  };
}
function agentIdentityToolAvailability(service) {
  return [
    [service.registerAgent !== void 0, ["agent.register"]],
    [service.getAgentStatus !== void 0, ["agent.status"]]
  ];
}
function parseAgentKind(toolInput) {
  const kind = optionalString(toolInput, "kind");
  if (kind === void 0) {
    return void 0;
  }
  if (kind !== "agent" && kind !== "service") {
    throw new Error("kind must be 'agent' or 'service'.");
  }
  return kind;
}
function missingAgentIdentityService(toolName) {
  return new Error(`Tool '${toolName}' requires a runtime service contract.`);
}
var init_agentIdentityTools = __esm({
  "../tools/dist/agentIdentityTools.js"() {
    "use strict";
    init_inputParsers();
  }
});

// ../tools/dist/toolAvailability.js
function runtimeAvailableToolNames(service) {
  const baseNames = [
    "whoami",
    "tools.list",
    "tools.schema",
    "tools.help",
    "tools.search",
    "brain.list",
    "brain.use",
    "scope.current",
    "capture.text",
    "capture.batch",
    "search.query",
    "context.assemble"
  ];
  const optionalNames = [
    [service.ingestFile !== void 0, ["capture.file"]],
    [service.createDecision !== void 0, ["decision.create"]],
    [service.createTask !== void 0, ["task.create"]],
    ...skillToolAvailability(service),
    ...agentIdentityToolAvailability(service),
    ...contractToolAvailability(service),
    [service.listSources !== void 0, ["source.list"]],
    [service.createSource !== void 0, ["source.create"]],
    [service.getSource !== void 0, ["source.get", "source.status"]],
    [service.getIngestionStatus !== void 0, ["ingestion.status"]],
    [service.listRecords !== void 0, ["record.list"]],
    [service.getRecord !== void 0, ["record.get"]],
    [service.createMarkdownRecord !== void 0, ["record.create_markdown"]],
    [service.patchRecordSection !== void 0, ["record.patch_section"]],
    [service.listRecordVersions !== void 0, ["record.versions"]],
    [service.listEvidence !== void 0, ["evidence.list"]],
    [service.getEvidence !== void 0, ["evidence.get"]],
    [service.listGraphNeighbors !== void 0, ["graph.neighbors"]],
    [service.listEvents !== void 0, ["event.list"]],
    [service.getContextProfile !== void 0, ["context.profile"]],
    [service.listAuditEvents !== void 0, ["audit.events"]],
    [service.webSearch !== void 0, ["web.search"]],
    [service.webFetch !== void 0, ["web.fetch"]]
  ];
  return [...baseNames, ...optionalNames.flatMap(([enabled, names]) => enabled ? names : [])];
}
var init_toolAvailability = __esm({
  "../tools/dist/toolAvailability.js"() {
    "use strict";
    init_agentIdentityTools();
    init_contractTools();
    init_skillTools();
  }
});

// ../tools/dist/toolLog.js
function logToolCall(input) {
  input.onToolLog?.({
    operation: input.operation,
    requestId: input.auth.requestId,
    workspaceId: input.auth.workspaceId,
    brainId: input.auth.brainId,
    inputKeys: Object.keys(input.toolInput).sort(),
    sizeClass: classifyInputSize(input.toolInput),
    status: input.status,
    latencyMs: Date.now() - input.startedAt,
    auditTargetIds: collectAuditTargetIds(input.toolInput, input.result)
  });
}
function classifyInputSize(toolInput) {
  return estimateValueSize(toolInput, /* @__PURE__ */ new WeakSet()) > 2e3 ? "large" : "small";
}
function estimateValueSize(value, seen) {
  if (typeof value === "string")
    return value.length;
  if (typeof value === "number" || typeof value === "boolean" || typeof value === "bigint") {
    return 8;
  }
  if (value === void 0 || value === null || typeof value === "symbol")
    return 0;
  if (value instanceof Uint8Array)
    return value.byteLength;
  if (Array.isArray(value)) {
    let total = 0;
    for (const item of value) {
      total += estimateValueSize(item, seen);
    }
    return total;
  }
  if (typeof value === "object") {
    if (seen.has(value))
      return 0;
    seen.add(value);
    let total = 0;
    for (const [key, item] of Object.entries(value)) {
      total += key.length + estimateValueSize(item, seen);
    }
    return total;
  }
  return 0;
}
function collectAuditTargetIds(...values) {
  const ids = /* @__PURE__ */ new Set();
  for (const value of values) {
    if (typeof value !== "object" || value === null || Array.isArray(value))
      continue;
    for (const [key, candidate] of Object.entries(value)) {
      if (key.endsWith("Id") && typeof candidate === "string" && candidate.trim().length > 0) {
        ids.add(candidate);
      }
    }
  }
  return [...ids].sort();
}
var init_toolLog = __esm({
  "../tools/dist/toolLog.js"() {
    "use strict";
  }
});

// ../tools/dist/webToolRuntime.js
function webToolHandlers(input, toolInput) {
  return {
    "web.search": () => executeWebSearch(input, toolInput),
    "web.fetch": () => executeWebFetch(input, toolInput)
  };
}
function executeWebSearch(input, toolInput) {
  if (input.service.webSearch === void 0) {
    throw new Error("Tool 'web.search' is unavailable without a web search service contract.");
  }
  return input.service.webSearch({ auth: input.auth, ...parseWebSearch(toolInput) });
}
function executeWebFetch(input, toolInput) {
  if (input.service.webFetch === void 0) {
    throw new Error("Tool 'web.fetch' is unavailable without a web fetch service contract.");
  }
  return input.service.webFetch({ auth: input.auth, ...parseWebFetch(toolInput) });
}
function parseWebSearch(input) {
  const parsed = {
    query: requireString(input, "query"),
    limit: requireBoundedInteger(input, "limit", 5, 1, 10)
  };
  if (input.recencyDays !== void 0) {
    parsed.recencyDays = requireBoundedInteger(input, "recencyDays", 30, 1, 3650);
  }
  if (input.allowedDomains !== void 0) {
    parsed.allowedDomains = requireBoundedStringArray(input, "allowedDomains", 10);
  }
  if (input.blockedDomains !== void 0) {
    parsed.blockedDomains = requireBoundedStringArray(input, "blockedDomains", 10);
  }
  return parsed;
}
function parseWebFetch(input) {
  return {
    url: requireString(input, "url"),
    maxChars: requireBoundedInteger(input, "maxChars", 8e3, 1, 12e3)
  };
}
function requireBoundedStringArray(input, key, maxItems) {
  const value = input[key];
  if (!Array.isArray(value) || !value.every((item) => typeof item === "string")) {
    throw new Error(`${key} must be a string array.`);
  }
  const values = value.map((item) => item.trim()).filter((item) => item.length > 0);
  if (values.length > maxItems) {
    throw new Error(`${key} must contain no more than ${maxItems} items.`);
  }
  return values;
}
function requireBoundedInteger(input, key, fallback, minimum, maximum) {
  const value = input[key];
  const integer = value === void 0 ? fallback : value;
  if (!Number.isInteger(integer) || Number(integer) < minimum || Number(integer) > maximum) {
    throw new Error(`${key} must be an integer between ${minimum} and ${maximum}.`);
  }
  return Number(integer);
}
var init_webToolRuntime = __esm({
  "../tools/dist/webToolRuntime.js"() {
    "use strict";
    init_inputParsers();
  }
});

// ../tools/dist/executor.js
function createRuntimeToolExecutor(input) {
  const availableToolNames = runtimeAvailableToolNames(input.service);
  return {
    listAvailableToolNames() {
      return [...availableToolNames];
    },
    async execute(name, toolInput) {
      const startedAt = Date.now();
      const handlers = createToolHandlers({ ...input, availableToolNames }, toolInput);
      const handler = handlers[name];
      if (handler === void 0) {
        const error = new Error(`Tool '${name}' is unavailable in this implementation slice.`);
        logToolCall({
          auth: input.auth,
          onToolLog: input.onToolLog,
          operation: name,
          toolInput,
          status: "error",
          startedAt
        });
        throw error;
      }
      try {
        const result = await handler();
        logToolCall({
          auth: input.auth,
          onToolLog: input.onToolLog,
          operation: name,
          toolInput,
          status: "success",
          startedAt,
          result
        });
        return result;
      } catch (error) {
        logToolCall({
          auth: input.auth,
          onToolLog: input.onToolLog,
          operation: name,
          toolInput,
          status: "error",
          startedAt
        });
        throw error;
      }
    }
  };
}
function createToolHandlers(input, toolInput) {
  return {
    whoami: () => Promise.resolve(executeWhoami(input.auth)),
    "brain.list": () => Promise.resolve(executeBrainList(input.auth)),
    "brain.use": () => Promise.resolve(executeBrainUse(input.auth, requireString(toolInput, "brainId"))),
    "scope.current": () => Promise.resolve(executeScopeCurrent(input.auth)),
    "tools.list": () => Promise.resolve(executeToolsList(input)),
    "tools.schema": () => Promise.resolve(executeToolsSchema(input)),
    "tools.help": () => Promise.resolve(executeToolsHelp(input, requireString(toolInput, "name"))),
    "tools.search": () => Promise.resolve(executeToolsSearch(input, parseToolsSearch(toolInput))),
    "capture.text": () => executeCaptureText(input, toolInput),
    "capture.file": () => executeCaptureFile(input, toolInput),
    "capture.batch": () => executeCaptureBatch(input, toolInput),
    "search.query": () => executeSearchQuery(input, toolInput),
    "context.assemble": () => executeContextAssemble(input, toolInput),
    "context.profile": () => executeContextProfile(input, toolInput),
    "decision.create": () => executeDecisionCreate(input, toolInput),
    "task.create": () => executeTaskCreate(input, toolInput),
    ...webToolHandlers(input, toolInput),
    ...skillToolHandlers(input, toolInput),
    ...agentIdentityToolHandlers(input, toolInput),
    ...contractToolHandlers(input),
    "source.list": () => executeSourceList(input),
    "source.create": () => executeSourceCreate(input, toolInput),
    "source.get": () => executeSourceRead(input, toolInput, "source.get"),
    "source.status": () => executeSourceRead(input, toolInput, "source.status"),
    "ingestion.status": () => executeIngestionStatus(input, toolInput),
    "record.list": () => executeRecordList(input),
    "record.get": () => executeRecordRead(input, toolInput),
    "record.create_markdown": () => executeRecordCreateMarkdown(input, toolInput),
    "record.patch_section": () => executeRecordPatchSection(input, toolInput),
    "record.versions": () => executeRecordVersions(input, toolInput),
    "evidence.list": () => {
      if (input.service.listEvidence === void 0)
        throw missingService("evidence.list");
      return input.service.listEvidence({
        auth: input.auth,
        recordId: requireString(toolInput, "recordId")
      });
    },
    "evidence.get": () => {
      if (input.service.getEvidence === void 0)
        throw missingService("evidence.get");
      return input.service.getEvidence({
        auth: input.auth,
        evidenceId: requireString(toolInput, "evidenceId")
      });
    },
    "graph.neighbors": () => {
      if (input.service.listGraphNeighbors === void 0)
        throw missingService("graph.neighbors");
      return input.service.listGraphNeighbors({
        auth: input.auth,
        recordId: requireString(toolInput, "recordId")
      });
    },
    "event.list": () => {
      if (input.service.listEvents === void 0)
        throw missingService("event.list");
      return input.service.listEvents({ auth: input.auth });
    },
    "audit.events": () => executeAuditEvents(input, toolInput)
  };
}
function missingService(toolName) {
  return new Error(`Tool '${toolName}' requires a runtime service contract.`);
}
function executeSearchQuery(input, toolInput) {
  const query = parseSearchQuery(toolInput);
  return input.service.retrieveCitedContext({
    auth: input.auth,
    query: query.query,
    limit: query.limit,
    maxChars: 4e3
  });
}
function executeContextAssemble(input, toolInput) {
  const query = parseContextQuery(toolInput);
  if (input.service.assembleGroundedContext !== void 0) {
    return input.service.assembleGroundedContext({
      auth: input.auth,
      query: query.query,
      queryIssuedAt: query.queryIssuedAt ?? (/* @__PURE__ */ new Date()).toISOString(),
      timezone: query.timezone ?? "UTC",
      requester: {
        principalId: input.auth.principalId,
        actorId: input.auth.actorId
      },
      surface: taskGuidanceSurface(input.transport),
      limit: 8,
      maxChars: query.maxChars
    });
  }
  return input.service.retrieveCitedContext({
    auth: input.auth,
    query: query.query,
    limit: 8,
    maxChars: query.maxChars
  });
}
function taskGuidanceSurface(transport) {
  if (transport === "cli")
    return "cli";
  if (transport === "hosted_mcp" || transport === "local_mcp")
    return "mcp";
  return "app";
}
function executeContextProfile(input, toolInput) {
  if (input.service.getContextProfile === void 0) {
    throw new Error("Tool 'context.profile' requires a profile read service contract.");
  }
  const profile = parseProfileQuery(toolInput);
  return input.service.getContextProfile({ auth: input.auth, ...profile });
}
async function executeDecisionCreate(input, toolInput) {
  if (input.service.createDecision === void 0) {
    throw new Error("Tool 'decision.create' requires a work-record service contract.");
  }
  const decision = parseDecision(toolInput);
  const result = await input.service.createDecision({ auth: input.auth, ...decision });
  return workRecordResult(result);
}
async function executeTaskCreate(input, toolInput) {
  if (input.service.createTask === void 0) {
    throw new Error("Tool 'task.create' requires a work-record service contract.");
  }
  const task = parseTask(toolInput);
  const result = await input.service.createTask({ auth: input.auth, ...task });
  return workRecordResult(result);
}
function executeSourceList(input) {
  if (input.service.listSources === void 0) {
    throw new Error("Tool 'source.list' requires a source read service contract.");
  }
  return input.service.listSources({ auth: input.auth });
}
function executeSourceCreate(input, toolInput) {
  if (input.service.createSource === void 0) {
    throw new Error("Tool 'source.create' requires a source write service contract.");
  }
  const source = parseSourceCreate(toolInput);
  return input.service.createSource({ auth: input.auth, ...source });
}
function executeSourceRead(input, toolInput, toolName) {
  if (input.service.getSource === void 0) {
    throw new Error(`Tool '${toolName}' requires a source read service contract.`);
  }
  return input.service.getSource({
    auth: input.auth,
    sourceId: requireString(toolInput, "sourceId")
  });
}
function executeIngestionStatus(input, toolInput) {
  if (input.service.getIngestionStatus === void 0) {
    throw new Error("Tool 'ingestion.status' requires an ingestion read service contract.");
  }
  return input.service.getIngestionStatus({
    auth: input.auth,
    jobId: requireString(toolInput, "jobId")
  });
}
function executeRecordList(input) {
  if (input.service.listRecords === void 0) {
    throw new Error("Tool 'record.list' requires a record read service contract.");
  }
  return input.service.listRecords({ auth: input.auth });
}
function executeRecordRead(input, toolInput) {
  if (input.service.getRecord === void 0) {
    throw new Error("Tool 'record.get' requires a record read service contract.");
  }
  const record = parseRecordRead(toolInput);
  return input.service.getRecord({ auth: input.auth, ...record });
}
async function executeRecordCreateMarkdown(input, toolInput) {
  if (input.service.createMarkdownRecord === void 0) {
    throw new Error("Tool 'record.create_markdown' requires a record write service contract.");
  }
  const record = parseMarkdownRecord(toolInput);
  const result = await input.service.createMarkdownRecord({ auth: input.auth, ...record });
  return workRecordResult(result);
}
async function executeRecordPatchSection(input, toolInput) {
  if (input.service.patchRecordSection === void 0) {
    throw new Error("Tool 'record.patch_section' requires a record write service contract.");
  }
  const patch = parseRecordSectionPatch(toolInput);
  const result = await input.service.patchRecordSection({ auth: input.auth, ...patch });
  return workRecordResult(result);
}
function executeRecordVersions(input, toolInput) {
  if (input.service.listRecordVersions === void 0) {
    throw new Error("Tool 'record.versions' requires a record read service contract.");
  }
  return input.service.listRecordVersions({
    auth: input.auth,
    recordId: requireString(toolInput, "recordId")
  });
}
function executeAuditEvents(input, toolInput) {
  if (input.service.listAuditEvents === void 0) {
    throw new Error("Tool 'audit.events' requires an audit read service contract.");
  }
  const auditInput = parseAuditEvents(toolInput);
  return input.service.listAuditEvents({ auth: input.auth, ...auditInput });
}
var init_executor = __esm({
  "../tools/dist/executor.js"() {
    "use strict";
    init_discovery();
    init_captureTools();
    init_inputParsers();
    init_contractTools();
    init_skillTools();
    init_agentIdentityTools();
    init_toolAvailability();
    init_results();
    init_toolLog();
    init_webToolRuntime();
  }
});

// ../tools/dist/generated.js
function createMcpToolSchemas(filter) {
  return availableTools2(filter).map((tool) => ({
    name: tool.name,
    description: tool.summary,
    inputSchema: tool.inputSchema
  }));
}
function createCliCommandMetadata(filter) {
  return availableTools2(filter).map((tool) => ({
    name: tool.name,
    summary: tool.summary,
    capability: tool.capability,
    mutability: tool.mutability,
    example: tool.cliExample
  }));
}
function availableTools2(filter) {
  const availableNames = new Set(filter.toolNames ?? IMPLEMENTED_TOOL_NAMES);
  return listToolDefinitions().filter((tool) => availableNames.has(tool.name) && tool.transports.includes(filter.transport) && isToolAuthorized(filter.capabilities, tool));
}
var init_generated = __esm({
  "../tools/dist/generated.js"() {
    "use strict";
    init_registry();
    init_discovery();
  }
});

// ../tools/dist/mcpAdapter.js
function createMcpAdapter(input) {
  const availableToolNames = input.executor.listAvailableToolNames?.() ?? [
    ...IMPLEMENTED_TOOL_NAMES
  ];
  const availableNameSet = new Set(availableToolNames);
  const available = listToolDefinitions().filter((tool) => availableNameSet.has(tool.name) && tool.transports.includes(input.transport) && isToolAuthorized(input.capabilities, tool));
  return {
    listTools() {
      return createMcpToolSchemas({
        transport: input.transport,
        capabilities: input.capabilities,
        toolNames: availableToolNames
      });
    },
    async callTool(call) {
      if (!available.some((tool) => tool.name === call.name)) {
        return errorResult2("tool_unavailable", `Tool '${call.name}' is unavailable for this MCP transport or scope.`);
      }
      try {
        const result = await input.executor.execute(call.name, call.arguments);
        return {
          isError: false,
          structuredContent: result,
          content: [{ type: "text", text: renderToolResult(result) }]
        };
      } catch (error) {
        return errorResult2(classifyToolError(error), messageForError(error));
      }
    }
  };
}
function renderToolResult(result) {
  if (typeof result === "object" && result !== null && "contextMarkdown" in result) {
    const context = result;
    if (typeof context.contextMarkdown === "string") {
      return context.contextMarkdown;
    }
  }
  return JSON.stringify(result);
}
function classifyToolError(error) {
  if (error instanceof Error) {
    if (error.message.startsWith("Sift contract required.")) {
      return "contract_required";
    }
    if (isPermissionError2(error)) {
      return "permission_denied";
    }
    if (isMissingServiceContractError2(error)) {
      return "tool_unavailable";
    }
    if (isConflictError2(error)) {
      return "conflict";
    }
    if (isNotFoundError2(error)) {
      return "not_found";
    }
    if (isRetriableUpstreamError2(error)) {
      return "retriable_upstream_failure";
    }
    if (isValidationError2(error)) {
      return "validation_failure";
    }
  }
  return "internal_error";
}
function isPermissionError2(error) {
  return error.name === "RuntimePermissionDeniedError" || error.message.startsWith("missing capability ");
}
function isMissingServiceContractError2(error) {
  return error.message.includes(" requires ") && error.message.includes(" service contract.");
}
function isConflictError2(error) {
  return error.name.includes("Conflict") || error.message.includes(" changed before ");
}
function isNotFoundError2(error) {
  return error.name.includes("NotFound") || /\bnot found\b/iu.test(error.message);
}
function isRetriableUpstreamError2(error) {
  return error.message.includes("fetch failed") || error.message.includes("ECONN") || error.message.toLowerCase().includes("timeout") || error.name.includes("Upstream");
}
function isValidationError2(error) {
  return error.message.endsWith(" is required.") || error.message.includes(" must be ") || error.message.includes(" is not valid");
}
function messageForError(error) {
  return error instanceof Error ? error.message : "Tool failed.";
}
function errorResult2(errorCode, message) {
  return {
    isError: true,
    errorCode,
    message,
    content: [{ type: "text", text: message }]
  };
}
var init_mcpAdapter = __esm({
  "../tools/dist/mcpAdapter.js"() {
    "use strict";
    init_generated();
    init_discovery();
    init_registry();
  }
});

// ../tools/dist/hostedMcpEntrypoint.js
function createHostedMcpEntrypoint(input) {
  return {
    discovery() {
      return input.authenticator.discovery();
    },
    async listTools(request) {
      const auth = await input.authenticator.authenticate({
        authorizationHeader: request.authorizationHeader
      });
      if (!auth.ok) {
        return { ok: false, error: authFailure(auth) };
      }
      return {
        ok: true,
        tools: createMcpAdapter({
          transport: "hosted_mcp",
          capabilities: auth.capabilities,
          executor: auth.executor
        }).listTools()
      };
    },
    async callTool(request) {
      const auth = await input.authenticator.authenticate({
        authorizationHeader: request.authorizationHeader
      });
      if (!auth.ok) {
        return authFailure(auth);
      }
      return createMcpAdapter({
        transport: "hosted_mcp",
        capabilities: auth.capabilities,
        executor: auth.executor
      }).callTool(request.call);
    }
  };
}
function authFailure(auth) {
  return {
    isError: true,
    errorCode: "auth_failed",
    message: auth.message,
    reconnectUrl: auth.reconnectUrl,
    content: [{ type: "text", text: auth.message }]
  };
}
var init_hostedMcpEntrypoint = __esm({
  "../tools/dist/hostedMcpEntrypoint.js"() {
    "use strict";
    init_mcpAdapter();
  }
});

// ../tools/dist/mcpJsonRpcCore.js
function createMcpJsonRpcCore(input) {
  const { adapter, config } = input;
  return {
    async handleMessage(message) {
      if (message.id === void 0) {
        return null;
      }
      const id = normalizeId(message.id);
      if (message.jsonrpc !== "2.0" || typeof message.method !== "string") {
        return errorResponse(id, -32600, "Invalid Request");
      }
      try {
        return {
          jsonrpc: "2.0",
          id,
          result: await dispatchRequest(message.method, message.params, adapter, config)
        };
      } catch (err) {
        return errorResponse(id, -32601, err instanceof Error ? err.message : "Method not found");
      }
    }
  };
}
function parseErrorResponse() {
  return errorResponse(null, -32700, "Parse error");
}
async function dispatchRequest(method, params, adapter, config) {
  if (method === "initialize") {
    const requested = readProtocolVersion(params);
    return {
      protocolVersion: requested ?? MCP_PROTOCOL_VERSION,
      capabilities: { tools: { listChanged: false } },
      serverInfo: { name: config.serverName, version: config.version },
      instructions: config.instructions
    };
  }
  if (method === "ping")
    return {};
  if (method === "tools/list")
    return { tools: adapter.listTools() };
  if (method === "tools/call") {
    const call = parseToolCall(params);
    return adapter.callTool(call);
  }
  throw new Error(`Method '${method}' is not supported by Sift MCP.`);
}
function readProtocolVersion(params) {
  if (!isRecord2(params))
    return void 0;
  return typeof params.protocolVersion === "string" ? params.protocolVersion : void 0;
}
function parseToolCall(params) {
  if (!isRecord2(params) || typeof params.name !== "string") {
    throw new Error("tools/call requires a tool name.");
  }
  return {
    name: params.name,
    arguments: isRecord2(params.arguments) ? params.arguments : {}
  };
}
function errorResponse(id, code, message) {
  return { jsonrpc: "2.0", id, error: { code, message } };
}
function isRecord2(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function normalizeId(value) {
  if (typeof value === "string" || typeof value === "number" || value === null)
    return value;
  return null;
}
var MCP_PROTOCOL_VERSION;
var init_mcpJsonRpcCore = __esm({
  "../tools/dist/mcpJsonRpcCore.js"() {
    "use strict";
    MCP_PROTOCOL_VERSION = "2025-11-25";
  }
});

// ../tools/dist/localMcpStdioServer.js
function createLocalMcpStdioServer(input) {
  return {
    async serve(serverInput) {
      const adapter = createMcpAdapter({
        transport: "local_mcp",
        capabilities: serverInput.capabilities,
        executor: serverInput.executor
      });
      const core = createMcpJsonRpcCore({
        adapter,
        config: {
          serverName: "sift-local-mcp",
          version: "0.1.0",
          instructions: LOCAL_INSTRUCTIONS
        }
      });
      let buffer = "";
      input.input.setEncoding("utf8");
      for await (const chunk of input.input) {
        buffer += chunk;
        let newline = buffer.indexOf("\n");
        while (newline >= 0) {
          const line = buffer.slice(0, newline).trim();
          buffer = buffer.slice(newline + 1);
          if (line.length > 0) {
            await handleLine(line, core, input.output, input.error);
          }
          newline = buffer.indexOf("\n");
        }
      }
      const trailing = buffer.trim();
      if (trailing.length > 0) {
        await handleLine(trailing, core, input.output, input.error);
      }
    }
  };
}
async function handleLine(line, core, output, error) {
  let message;
  try {
    message = JSON.parse(line);
  } catch {
    writeResponse(output, parseErrorResponse());
    return;
  }
  if (message.id === void 0 && message.method !== "notifications/initialized") {
    error?.write(`Ignoring MCP notification '${String(message.method)}'.
`);
  }
  const response = await core.handleMessage(message);
  if (response !== null) {
    writeResponse(output, response);
  }
}
function writeResponse(output, response) {
  output.write(`${JSON.stringify(response)}
`);
}
var LOCAL_INSTRUCTIONS;
var init_localMcpStdioServer = __esm({
  "../tools/dist/localMcpStdioServer.js"() {
    "use strict";
    init_mcpAdapter();
    init_mcpJsonRpcCore();
    LOCAL_INSTRUCTIONS = "Call contract.get first and echo its contractVersion on every other Sift tool call. Use Sift tools to read and write the hosted canonical brain.";
  }
});

// ../tools/dist/index.js
var dist_exports = {};
__export(dist_exports, {
  MCP_PROTOCOL_VERSION: () => MCP_PROTOCOL_VERSION,
  NO_CAPABILITY: () => NO_CAPABILITY,
  UNGATED_TOOL_NAMES: () => UNGATED_TOOL_NAMES,
  createCliCommandMetadata: () => createCliCommandMetadata,
  createHostedMcpEntrypoint: () => createHostedMcpEntrypoint,
  createLocalMcpStdioServer: () => createLocalMcpStdioServer,
  createMcpAdapter: () => createMcpAdapter,
  createMcpJsonRpcCore: () => createMcpJsonRpcCore,
  createMcpToolSchemas: () => createMcpToolSchemas,
  createRuntimeToolExecutor: () => createRuntimeToolExecutor,
  isGatedTool: () => isGatedTool,
  isToolAuthorized: () => isToolAuthorized,
  listToolDefinitions: () => listToolDefinitions,
  parseErrorResponse: () => parseErrorResponse
});
var init_dist = __esm({
  "../tools/dist/index.js"() {
    "use strict";
    init_executor();
    init_generated();
    init_hostedMcpEntrypoint();
    init_localMcpStdioServer();
    init_mcpAdapter();
    init_mcpJsonRpcCore();
    init_gating();
    init_registry();
  }
});

// src/index.ts
import { readFile as readFile2 } from "fs/promises";

// src/support.ts
import { createHash } from "crypto";
var DEFAULT_CLI_CAPTURE_SOURCE = "CLI Capture";
var DEFAULT_CLI_VISIBILITY = "team";
function renderScope(scope) {
  return [
    `API: ${scope.apiBaseUrl}`,
    `Token: ${scope.tokenLabel}`,
    `Principal: ${scope.principalId}`,
    `Workspace: ${scope.workspaceId}`,
    `Brain: ${scope.brainId}`,
    `Capabilities: ${scope.capabilities.join(", ")}`,
    ""
  ].join("\n");
}
function validateAuthenticatedScope(config, now) {
  const requiredScope = [
    ["apiBaseUrl", config.apiBaseUrl],
    ["workspaceId", config.workspaceId],
    ["brainId", config.brainId],
    ["principalId", config.principalId]
  ];
  const missing = requiredScope.find(([, value]) => value.trim().length === 0);
  if (missing !== void 0) {
    throw new Error(`Missing authenticated CLI scope: ${missing[0]}.`);
  }
  if (config.tokenExpiresAt !== void 0) {
    const expiresAt = Date.parse(config.tokenExpiresAt);
    if (!Number.isFinite(expiresAt)) {
      throw new Error("Invalid CLI auth expiry timestamp.");
    }
    if (expiresAt <= now.getTime()) {
      throw new Error("Sift CLI auth has expired. Reconnect or refresh the configured token.");
    }
  }
}
function renderSearchResult(result) {
  if (typeof result === "object" && result !== null && "contextMarkdown" in result) {
    const context = result;
    return `${context.contextMarkdown}
`;
  }
  return `${JSON.stringify(result)}
`;
}
function renderRecordResult(result) {
  if (typeof result === "object" && result !== null && "markdown" in result) {
    const record = result;
    return `${record.markdown}
`;
  }
  return `${JSON.stringify(result)}
`;
}
function renderProfileResult(result) {
  if (typeof result === "object" && result !== null && "profileMarkdown" in result) {
    const profile = result;
    return `${profile.profileMarkdown}
`;
  }
  return `${JSON.stringify(result)}
`;
}
function renderTools(tools) {
  return `${tools.map((tool) => `${tool.name}: ${tool.summary}`).join("\n")}
`;
}
function renderSiftFound(result) {
  return `Sift found:

${renderSearchResult(result)}`;
}
function renderWriteReceipt(action, result) {
  if (typeof result !== "object" || result === null) {
    return `${action} complete.
${JSON.stringify(result)}
`;
  }
  const record = result;
  const lines = [`${action} complete.`];
  addReceiptLine(lines, "Record", record.recordId);
  addReceiptLine(lines, "Version", record.versionId);
  addReceiptLine(lines, "Source", record.sourceId);
  addReceiptLine(lines, "Source item", record.sourceItemId);
  if (typeof record.job === "object" && record.job !== null && "id" in record.job) {
    addReceiptLine(lines, "Job", record.job.id);
  }
  if (lines.length === 1) {
    lines.push(JSON.stringify(result));
  }
  lines.push("");
  return lines.join("\n");
}
function renderDoctorResult(result) {
  return `${result.checks.map((check) => {
    const fix = check.fix === void 0 ? "" : ` Fix: ${check.fix}`;
    return `[${check.status}] ${check.label}: ${check.detail}${fix}`;
  }).join("\n")}
`;
}
function aliasJson(command, tool, result) {
  return `${JSON.stringify({ command, tool, result })}
`;
}
function positionalArgs(args) {
  const positionals = [];
  for (let index = 0; index < args.length; index += 1) {
    const key = args[index];
    if (key?.startsWith("--") === true) {
      index += 1;
    } else if (key !== void 0) {
      positionals.push(key);
    }
  }
  return positionals;
}
function parseOptions(args) {
  const parsed = /* @__PURE__ */ new Map();
  for (let index = 0; index < args.length; index += 1) {
    const key = args[index];
    const value = args[index + 1];
    if (key?.startsWith("--") === true && value !== void 0 && !value.startsWith("--")) {
      parsed.set(key.slice(2), value);
      index += 1;
    }
  }
  return parsed;
}
function parseIntegerOption(options, key, fallback) {
  const raw = options.get(key);
  if (raw === void 0) {
    return fallback;
  }
  const parsed = Number(raw);
  if (!Number.isInteger(parsed)) {
    throw new Error(`Option --${key} must be an integer.`);
  }
  return parsed;
}
function requireOption(options, key) {
  const value = options.get(key);
  if (value === void 0 || value.trim().length === 0) {
    throw new Error(`Missing required option --${key}.`);
  }
  return value;
}
function optionalOption(options, key) {
  const value = options.get(key);
  if (value === void 0 || value.trim().length === 0) {
    return void 0;
  }
  return value;
}
function addOptionalWorkMetadata(input, parsed) {
  const authorship = optionalOption(parsed, "authorship");
  if (authorship !== void 0) {
    input.authorship = authorship;
  }
  const evidence = optionalOption(parsed, "evidence");
  if (evidence !== void 0) {
    input.evidenceIds = evidence.split(",").map((item) => item.trim()).filter((item) => item.length > 0);
  }
}
function basename(path) {
  const normalized = path.replaceAll("\\", "/");
  return normalized.slice(normalized.lastIndexOf("/") + 1);
}
function sha256Hex(input) {
  return createHash("sha256").update(input).digest("hex");
}
function normalizeCliTextBody(text) {
  const withoutBom = text.startsWith("\uFEFF") ? text.slice(1) : text;
  return withoutBom.replace(/\r\n?/gu, "\n").trim();
}
function defaultCliTextExternalId(input) {
  const normalized = normalizeCliTextBody(input.body);
  const date = input.now.toISOString().slice(0, 10);
  return `cli-text:${date}:${sha256Hex(normalized)}`;
}
function defaultCliFileExternalId(input) {
  const hash = createHash("sha256");
  hash.update(input.basename);
  hash.update(new Uint8Array([0]));
  hash.update(String(input.bytes.byteLength));
  hash.update(new Uint8Array([0]));
  hash.update(input.bytes);
  return `cli-file:${hash.digest("hex")}`;
}
function anchorFromHeadingTitle(title) {
  const anchor = title.toLowerCase().replace(/[^a-z0-9]+/gu, "-").replace(/^-+|-+$/gu, "");
  return anchor.length === 0 ? "section" : anchor;
}
function defaultCliTitle(body) {
  const firstLine = normalizeCliTextBody(body).split("\n").map((line) => line.trim()).find((line) => line.length > 0);
  return firstLine === void 0 ? "" : firstLine.slice(0, 80);
}
function inferContentType(path) {
  const lower = path.toLowerCase();
  if (lower.endsWith(".md") || lower.endsWith(".markdown")) return "text/markdown";
  if (lower.endsWith(".txt")) return "text/plain";
  if (lower.endsWith(".html") || lower.endsWith(".htm")) return "text/html";
  if (lower.endsWith(".pdf")) return "application/pdf";
  return "application/octet-stream";
}
function errorResult(error, json) {
  const code = classifyError(error);
  const message = error instanceof Error ? error.message : "Command failed.";
  return errorResultWithCode(code, message, json);
}
function errorResultWithCode(code, message, json) {
  if (json) {
    return {
      exitCode: 1,
      stdout: `${JSON.stringify({ error: { code, message } })}
`,
      stderr: ""
    };
  }
  return fail(`${code}: ${message}`);
}
function ok(stdout) {
  return { exitCode: 0, stdout, stderr: "" };
}
function fail(message) {
  return { exitCode: 1, stdout: "", stderr: `${message}
` };
}
function classifyError(error) {
  if (error instanceof Error) {
    if (error.message.startsWith("Sift contract required.")) {
      return "contract_required";
    }
    if (isPermissionError(error)) {
      return "permission_denied";
    }
    if (isMissingServiceContractError(error)) {
      return "tool_unavailable";
    }
    if (error.message.includes("CLI auth has expired")) {
      return "auth_failed";
    }
    if (isConflictError(error)) {
      return "conflict";
    }
    if (isNotFoundError(error)) {
      return "not_found";
    }
    if (isValidationError(error)) {
      return "validation_failure";
    }
    if (isRetriableUpstreamError(error)) {
      return "retriable_upstream_failure";
    }
  }
  return "internal_error";
}
function isPermissionError(error) {
  return error.name === "RuntimePermissionDeniedError" || error.message.startsWith("missing capability ");
}
function isMissingServiceContractError(error) {
  return error.message.includes(" requires ") && error.message.includes(" service contract.");
}
function isConflictError(error) {
  return error.name.includes("Conflict") || error.message.includes(" changed before ");
}
function isNotFoundError(error) {
  return error.name.includes("NotFound") || /\bnot found\b/iu.test(error.message);
}
function isValidationError(error) {
  return error.message.endsWith(" is required.") || error.message.includes("Missing required option") || error.message.includes("Missing authenticated CLI scope") || error.message.includes("Invalid CLI auth expiry");
}
function isRetriableUpstreamError(error) {
  return error.message.includes("fetch failed") || error.message.includes("ECONN") || error.message.toLowerCase().includes("timeout") || error.name.includes("Upstream");
}
function addReceiptLine(lines, label, value) {
  if (typeof value === "string" && value.trim().length > 0) {
    lines.push(`${label}: ${value}`);
  }
}

// src/agentCommands.ts
async function agentRegister(executor, assertedAgentName, rest, json) {
  if (executor === void 0) {
    return fail("No Sift API executor is configured for agent.register.");
  }
  const parsed = parseOptions(rest);
  const name = optionalOption(parsed, "name") ?? assertedAgentName;
  if (name === void 0 || name.trim().length === 0) {
    return fail("Missing agent name: pass --name or set SIFT_AGENT.");
  }
  const input = { name };
  const description = optionalOption(parsed, "description");
  if (description !== void 0) {
    input.description = description;
  }
  const kind = optionalOption(parsed, "kind");
  if (kind !== void 0) {
    input.kind = kind;
  }
  const result = await executor.execute("agent.register", input);
  return ok(json ? `${JSON.stringify(result)}
` : renderAgentRegisterResult(result));
}
function renderAgentRegisterResult(result) {
  if (typeof result !== "object" || result === null || !("agent" in result)) {
    return `${JSON.stringify(result)}
`;
  }
  const { agent, created, reactivated } = result;
  const verb = created === true ? "Registered" : reactivated === true ? "Reactivated" : "Already registered";
  const actsFor = agent.actsForDisplayName === void 0 ? "" : ` (acting for ${agent.actsForDisplayName})`;
  return `${verb} agent worker '${agent.name ?? "unknown"}'${actsFor}.
`;
}

// src/auth/commandAdapter.ts
function isAuthCommand(commandKey) {
  return commandKey === "login:" || commandKey === "auth:status" || commandKey === "logout:";
}
function authCommand(authCommands2, command, input) {
  if (authCommands2 === void 0) {
    return errorResultWithCode(
      "tool_unavailable",
      "No Sift CLI auth command runtime is configured.",
      input.json
    );
  }
  if (command === "login") {
    return authCommands2.login({ rest: input.rest ?? [], json: input.json });
  }
  if (command === "status") {
    return authCommands2.status({ json: input.json });
  }
  return authCommands2.logout({ json: input.json });
}

// src/capabilityGuard.ts
var commandCapabilities = {
  "contract:get": "record:read",
  "whoami:": "record:read",
  "brain:list": "record:read",
  "brain:use": "record:read",
  "ask:": "record:read",
  "search:": "record:read",
  "show:": "record:read",
  "status:": "record:read",
  "scope:current": "record:read",
  "tools:list": "record:read",
  "tools:schema": "record:read",
  "tools:help": "record:read",
  "capture:text": "source:write",
  "capture:file": "source:write",
  "capture:batch": "source:write",
  "remember:": "source:write",
  "add:": "source:write",
  "source:list": "record:read",
  "source:create": "source:write",
  "source:get": "record:read",
  "source:status": "record:read",
  "ingestion:status": "record:read",
  "record:list": "record:read",
  "record:get": "record:read",
  "record:create-markdown": "record:write",
  "record:patch-section": "record:write",
  "record:versions": "record:read",
  "edit:": "record:write",
  "decision:create": "record:write",
  "task:create": "record:write",
  "decide:": "record:write",
  "todo:": "record:write",
  "search:query": "record:read",
  "context:assemble": "record:read",
  "context:profile": "record:read",
  "evidence:list": "record:read",
  "evidence:get": "record:read",
  "graph:neighbors": "record:read",
  "event:list": "record:read",
  "audit:events": "event:audit:read",
  "roam:import": "source:manage"
};
function validateCommandCapability(input) {
  const capability = commandCapabilities[input.commandKey];
  if (capability !== void 0 && !input.config.capabilities.includes(capability)) {
    throw new Error(`missing capability ${capability}`);
  }
}

// src/contractOption.ts
function extractContractVersion(argv2) {
  const index = argv2.indexOf("--contract");
  if (index === -1) {
    return { argv: argv2 };
  }
  const value = argv2[index + 1];
  if (value === void 0 || value.trim().length === 0 || value.startsWith("--")) {
    return { argv: [...argv2.slice(0, index), ...argv2.slice(index + 1)] };
  }
  return {
    argv: [...argv2.slice(0, index), ...argv2.slice(index + 2)],
    contractVersion: value
  };
}
function applyContractOption(input) {
  const { argv: argv2, contractVersion } = extractContractVersion(input.argv);
  if (contractVersion === void 0 || input.executor === void 0) {
    return { ...input, argv: argv2 };
  }
  return { ...input, argv: argv2, executor: withContractVersion(input.executor, contractVersion) };
}
function withContractVersion(executor, contractVersion) {
  return {
    ...executor,
    execute: (name, toolInput) => executor.execute(name, { ...toolInput, contractVersion })
  };
}

// src/roamImport.ts
async function runRoamImportCommand(input) {
  try {
    const parsed = parseOptions(input.rest);
    const scope = parseCliRoamScope(optionalOption(parsed, "scope") ?? "sift-tag");
    const mode = parseCliRoamMode(optionalOption(parsed, "mode") ?? "personal");
    const limit = parseIntegerOption(parsed, "limit", 100);
    if (limit < 1 || limit > 100) {
      throw new Error("Option --limit must be between 1 and 100.");
    }
    const wholeGraphConfirmed = input.rest.includes("--confirm-whole-graph") || input.rest.includes("--yes");
    if (scope === "whole_graph" && !wholeGraphConfirmed) {
      throw new Error("Option --confirm-whole-graph is required.");
    }
    const workspaceAttestation = input.rest.includes("--workspace-attestation") || input.rest.includes("--confirm-workspace");
    if (mode === "workspace" && !workspaceAttestation) {
      throw new Error("Option --workspace-attestation is required.");
    }
    if (input.reader === void 0) {
      throw new Error(
        "Roam import needs the local Roam helper. Run this command through the Sift CLI package."
      );
    }
    if (input.importer === void 0) {
      throw new Error("Not signed in. Run 'sift login', then retry 'sift roam import'.");
    }
    const records = await input.reader.exportPages({
      scope,
      graph: optionalOption(parsed, "graph"),
      limit,
      now: input.now
    });
    if (records.length === 0) {
      throw new Error(
        scope === "sift_tag" ? "No Roam pages marked [[Sift]] were found." : "No Roam pages were found for import."
      );
    }
    const result = await input.importer.importRecords({
      mode,
      scope,
      records,
      defaultVisibility: visibilityOption(parsed),
      workspaceAttestation,
      wholeGraphConfirmed
    });
    return ok(input.json ? `${JSON.stringify(result)}
` : renderRoamImportResult(result));
  } catch (error) {
    return errorResult(error, input.json);
  }
}
function createSiftRoamImportClient(input) {
  const fetchImpl = input.fetch ?? globalThis.fetch;
  return {
    async importRecords(request) {
      const response = await fetchImpl(roamImportUrl(input.apiBaseUrl, input.workspaceId), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${input.token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(request)
      });
      const body = await response.text();
      const parsed = body.length > 0 ? parseJson(body) : {};
      if (!response.ok) {
        throw new Error(responseError(parsed, response.status));
      }
      return parseRoamImportResult(parsed);
    }
  };
}
function parseCliRoamScope(value) {
  if (value === "sift-tag" || value === "sift_tag" || value === "marked" || value === "sift") {
    return "sift_tag";
  }
  if (value === "whole-graph" || value === "whole_graph" || value === "everything") {
    return "whole_graph";
  }
  throw new Error("Roam scope must be sift-tag or whole-graph.");
}
function parseCliRoamMode(value) {
  if (value === "personal" || value === "workspace") return value;
  throw new Error("Roam import mode must be personal or workspace.");
}
function visibilityOption(parsed) {
  const visibility = optionalOption(parsed, "visibility");
  if (visibility === void 0) return void 0;
  const values = visibility.split(",").map((value) => value.trim()).filter((value) => value.length > 0);
  if (values.length === 0) {
    throw new Error("Option --visibility must include at least one visibility segment.");
  }
  return values;
}
function renderRoamImportResult(result) {
  return [
    `Imported ${result.importedCount} Roam pages.`,
    `Stored: ${result.storedCount}`,
    `Deduped: ${result.dedupedCount}`,
    `Rejected: ${result.rejectedCount}`,
    ""
  ].join("\n");
}
function roamImportUrl(apiBaseUrl, workspaceId) {
  const base = `${apiBaseUrl.replace(/\/+$/u, "")}/integrations/roam/import`;
  return workspaceId === void 0 ? base : `${base}?workspaceId=${encodeURIComponent(workspaceId)}`;
}
function parseJson(body) {
  try {
    return JSON.parse(body);
  } catch {
    throw new Error("Sift Roam import API returned invalid JSON.");
  }
}
function responseError(parsed, status2) {
  if (typeof parsed === "object" && parsed !== null) {
    const record = parsed;
    const message = record.message;
    if (typeof message === "string" && message.trim().length > 0) return message;
    const error = record.error;
    if (typeof error === "object" && error !== null && "message" in error) {
      const nested = error.message;
      if (typeof nested === "string" && nested.trim().length > 0) return nested;
    }
  }
  return `Sift Roam import API failed with status ${status2}.`;
}
function parseRoamImportResult(value) {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error("Sift Roam import API returned an invalid result.");
  }
  const record = value;
  if (record.providerKind !== "roam") {
    throw new Error("Sift Roam import API returned an unexpected provider kind.");
  }
  return {
    providerKind: "roam",
    importedCount: integerField(record, "importedCount"),
    storedCount: integerField(record, "storedCount"),
    dedupedCount: integerField(record, "dedupedCount"),
    rejectedCount: integerField(record, "rejectedCount")
  };
}
function integerField(record, key) {
  const value = record[key];
  if (typeof value !== "number" || !Number.isInteger(value)) {
    throw new Error(`Sift Roam import API result field ${key} must be an integer.`);
  }
  return value;
}

// src/mcpServeCommand.ts
async function mcpServe(input) {
  if (input.mcpServer === void 0) {
    return fail("No local MCP server is configured for mcp.serve.");
  }
  if (input.executor === void 0) {
    return fail("Not signed in. Run 'sift login', then 'sift mcp serve'.");
  }
  const result = await input.mcpServer.serve({
    config: input.config,
    executor: input.executor,
    transport: "local_mcp"
  });
  if (result === void 0) return ok("");
  return ok(`${JSON.stringify(result)}
`);
}

// src/scopeCurrentCommand.ts
function scopeCurrent(config, json) {
  const scope = {
    apiBaseUrl: config.apiBaseUrl,
    tokenLabel: config.tokenLabel,
    tokenExpiresAt: config.tokenExpiresAt,
    principalId: config.principalId,
    workspaceId: config.workspaceId,
    brainId: config.brainId,
    capabilities: config.capabilities
  };
  return ok(json ? `${JSON.stringify(scope)}
` : renderScope(scope));
}

// src/specialCommands.ts
import { readFile } from "fs/promises";

// src/doctor.ts
async function doctor(input) {
  const checks = [
    { id: "bin", status: "ok", label: "Bin", detail: "sift command entrypoint is configured." },
    { id: "package", status: "ok", label: "Package", detail: "@sift-wiki/cli version unknown, bin sift." },
    authCheck(input.config, input.now),
    scopeCheck(input.config)
  ];
  const apiCheck = await checkApi(input.executor);
  checks.push(apiCheck);
  const availableTools3 = await discoverToolNames(input.executor);
  checks.push(readToolsCheck(availableTools3));
  checks.push(writeToolsCheck(input.config, availableTools3));
  checks.push(recordGetCheck(availableTools3));
  const result = {
    ok: !checks.some((check) => check.status === "failed"),
    apiBaseUrl: input.config.apiBaseUrl.trim().length > 0 ? input.config.apiBaseUrl : void 0,
    scope: scopeResult(input.config),
    checks
  };
  return {
    exitCode: result.ok ? 0 : 1,
    stdout: input.json ? `${JSON.stringify(result)}
` : renderDoctorResult(result),
    stderr: ""
  };
}
async function discoverToolNames(executor) {
  if (executor === void 0) return void 0;
  if (executor.listAvailableToolNames !== void 0) return executor.listAvailableToolNames();
  const result = await executor.execute("tools.list", {});
  return toolNamesFromResult(result);
}
async function apiReachability(executor) {
  if (executor === void 0) return { reachable: false, detail: "No API executor is configured." };
  try {
    await executor.execute("whoami", {});
    return { reachable: true, detail: "whoami succeeded." };
  } catch (error) {
    return {
      reachable: false,
      detail: error instanceof Error ? error.message : "Hosted Sift API request failed."
    };
  }
}
function scopeResult(config) {
  if (config.workspaceId.trim().length === 0 || config.brainId.trim().length === 0 || config.principalId.trim().length === 0) {
    return void 0;
  }
  return {
    workspaceId: config.workspaceId,
    brainId: config.brainId,
    principalId: config.principalId,
    capabilities: [...config.capabilities]
  };
}
async function checkApi(executor) {
  if (executor === void 0) {
    return {
      id: "api",
      status: "warning",
      label: "API",
      detail: "not checked because no API executor is configured.",
      fix: "Run sift login or configure hosted API credentials."
    };
  }
  const api = await apiReachability(executor);
  return api.reachable ? { id: "api", status: "ok", label: "API", detail: "whoami succeeded." } : { id: "api", status: "failed", label: "API", detail: api.detail };
}
function authCheck(config, now) {
  if (config.apiBaseUrl.trim().length === 0 || config.workspaceId.trim().length === 0 || config.brainId.trim().length === 0 || config.principalId.trim().length === 0) {
    return {
      id: "auth",
      status: "failed",
      label: "Auth",
      detail: "no authenticated CLI profile is loaded.",
      fix: "Run sift login."
    };
  }
  if (config.tokenExpiresAt !== void 0 && Date.parse(config.tokenExpiresAt) <= now.getTime()) {
    return {
      id: "auth",
      status: "failed",
      label: "Auth",
      detail: "configured CLI auth has expired.",
      fix: "Run sift login again."
    };
  }
  return { id: "auth", status: "ok", label: "Auth", detail: "authenticated profile loaded." };
}
function scopeCheck(config) {
  if (config.workspaceId.trim().length === 0 || config.brainId.trim().length === 0) {
    return {
      id: "scope",
      status: "failed",
      label: "Scope",
      detail: "workspace or brain scope is missing.",
      fix: "Run sift scope current after login."
    };
  }
  return {
    id: "scope",
    status: "ok",
    label: "Scope",
    detail: `${config.workspaceId}/${config.brainId}`
  };
}
function readToolsCheck(names) {
  return toolSetCheck("read-tools", "Read tools", ["context.assemble", "search.query"], names);
}
function writeToolsCheck(config, names) {
  const hasWrite = config.capabilities.includes("record:write") || config.capabilities.includes("source:write");
  if (!hasWrite) {
    return {
      id: "write-tools",
      status: "warning",
      label: "Write tools",
      detail: "write capability is not present for this token."
    };
  }
  return toolSetCheck(
    "write-tools",
    "Write tools",
    ["capture.text", "capture.file", "record.patch_section", "decision.create", "task.create"],
    names
  );
}
function recordGetCheck(names) {
  if (names === void 0) {
    return {
      id: "record-get-contract",
      status: "warning",
      label: "record.get",
      detail: "runtime tool discovery was not available."
    };
  }
  return names.includes("record.get") ? { id: "record-get-contract", status: "ok", label: "record.get", detail: "available." } : {
    id: "record-get-contract",
    status: "failed",
    label: "record.get",
    detail: "runtime discovery did not advertise record.get."
  };
}
function toolSetCheck(id, label, required, names) {
  if (names === void 0) {
    return { id, status: "warning", label, detail: "runtime tool discovery was not available." };
  }
  const missing = required.filter((name) => !names.includes(name));
  return missing.length === 0 ? { id, status: "ok", label, detail: "required tools are available." } : { id, status: "failed", label, detail: `missing ${missing.join(", ")}.` };
}
function toolNamesFromResult(result) {
  if (!Array.isArray(result)) return [];
  return result.flatMap((item) => {
    if (typeof item === "object" && item !== null && "name" in item) {
      const name = item.name;
      return typeof name === "string" ? [name] : [];
    }
    return [];
  });
}

// src/simpleCommands.ts
var knownTopLevelCommands = /* @__PURE__ */ new Set([
  "add",
  "agent",
  "ask",
  "audit",
  "auth",
  "brain",
  "capture",
  "context",
  "contract",
  "decision",
  "decide",
  "doctor",
  "edit",
  "event",
  "evidence",
  "graph",
  "ingestion",
  "login",
  "logout",
  "mcp",
  "record",
  "remember",
  "roam",
  "scope",
  "search",
  "show",
  "source",
  "status",
  "task",
  "thread",
  "todo",
  "tools",
  "whoami"
]);
var valueOptions = /* @__PURE__ */ new Set([
  "anchor",
  "authorship",
  "content-type",
  "due-date",
  "evidence",
  "expected",
  "external-id",
  "limit",
  "max-chars",
  "owner",
  "rationale",
  "replace",
  "section",
  "source",
  "state",
  "status",
  "title",
  "visibility"
]);
function resolveSimpleCommand(input) {
  const [group, command] = input.args;
  if (group === void 0) {
    return void 0;
  }
  if (group === "ask") {
    return { commandKey: "ask:", run: () => ask(input.executor, input.args.slice(1), input.json) };
  }
  if (group === "search" && command !== "query") {
    return {
      commandKey: "search:",
      run: () => simpleSearch(input.executor, input.args.slice(1), input.json)
    };
  }
  if (group === "remember") {
    return {
      commandKey: "remember:",
      run: () => remember(input.executor, input.args.slice(1), input.json, input.readStdin, input.now)
    };
  }
  if (group === "add") {
    return {
      commandKey: "add:",
      run: () => addFile(input.executor, input.readFile, input.args.slice(1), input.json)
    };
  }
  if (group === "edit") {
    return { commandKey: "edit:", run: () => edit(input.executor, input.args.slice(1), input.json) };
  }
  if (group === "decide") {
    return {
      commandKey: "decide:",
      run: () => decide(input.executor, input.args.slice(1), input.json)
    };
  }
  if (group === "todo") {
    return { commandKey: "todo:", run: () => todo(input.executor, input.args.slice(1), input.json) };
  }
  if (group === "show") {
    return {
      commandKey: "show:",
      run: () => show(input.executor, input.args.slice(1), input.json)
    };
  }
  if (group === "status" && command === void 0) {
    return {
      commandKey: "status:",
      run: () => status(input.config, input.executor, input.json)
    };
  }
  if (!knownTopLevelCommands.has(group)) {
    return { commandKey: "ask:", run: () => ask(input.executor, input.args, input.json) };
  }
  return void 0;
}
async function ask(executor, rest, json) {
  if (executor === void 0) {
    return fail("No Sift API executor is configured for context.assemble.");
  }
  const parsed = parseOptions(rest);
  const query = argsWithoutOptions(rest).join(" ").trim();
  const result = await executor.execute("context.assemble", {
    query,
    maxChars: parseIntegerOption(parsed, "max-chars", 8e3)
  });
  return ok(json ? aliasJson("ask", "context.assemble", result) : renderSiftFound(result));
}
async function simpleSearch(executor, rest, json) {
  if (executor === void 0) {
    return fail("No Sift API executor is configured for search.query.");
  }
  const parsed = parseOptions(rest);
  const query = argsWithoutOptions(rest).join(" ").trim();
  const result = await executor.execute("search.query", {
    query,
    limit: parseIntegerOption(parsed, "limit", 10)
  });
  return ok(json ? aliasJson("search", "search.query", result) : renderSearchResult(result));
}
async function remember(executor, rest, json, readStdin2, now) {
  if (executor === void 0) {
    return fail("No Sift API executor is configured for capture.text.");
  }
  const parsed = parseOptions(rest);
  const rawBody = rest.includes("--stdin") ? await readRequiredStdin(readStdin2) : argsWithoutOptions(rest).join(" ");
  const markdown = normalizeCliTextBody(rawBody);
  if (markdown.length === 0) {
    throw new Error("remember content is required.");
  }
  const input = {
    sourceName: optionalOption(parsed, "source") ?? DEFAULT_CLI_CAPTURE_SOURCE,
    externalId: optionalOption(parsed, "external-id") ?? defaultCliTextExternalId({ body: markdown, now }),
    title: optionalOption(parsed, "title") ?? defaultCliTitle(markdown),
    visibility: [optionalOption(parsed, "visibility") ?? DEFAULT_CLI_VISIBILITY],
    markdown
  };
  const result = await executor.execute("capture.text", input);
  return ok(json ? aliasJson("remember", "capture.text", result) : renderWriteReceipt("Remember", result));
}
async function addFile(executor, fileReader, rest, json) {
  if (executor === void 0) {
    return fail("No Sift API executor is configured for capture.file.");
  }
  const [path, ...optionArgs] = rest;
  if (path === void 0 || path.trim().length === 0) {
    return fail("Missing required file path for add.");
  }
  const parsed = parseOptions(optionArgs);
  const bytes = await fileReader(path);
  const fileBasename = basename(path);
  const input = {
    sourceName: optionalOption(parsed, "source") ?? DEFAULT_CLI_CAPTURE_SOURCE,
    externalId: optionalOption(parsed, "external-id") ?? defaultCliFileExternalId({ basename: fileBasename, bytes }),
    title: optionalOption(parsed, "title") ?? fileBasename,
    filename: fileBasename,
    contentType: optionalOption(parsed, "content-type") ?? inferContentType(path),
    bytes,
    visibility: [optionalOption(parsed, "visibility") ?? DEFAULT_CLI_VISIBILITY]
  };
  const result = await executor.execute("capture.file", input);
  return ok(json ? aliasJson("add", "capture.file", result) : renderWriteReceipt("Add", result));
}
async function edit(executor, rest, json) {
  if (executor === void 0) {
    return fail("No Sift API executor is configured for record.patch_section.");
  }
  const [recordId, ...optionArgs] = rest;
  if (recordId === void 0 || recordId.trim().length === 0) {
    return fail("Missing required record ID for edit.");
  }
  const parsed = parseOptions(optionArgs);
  const section = optionalOption(parsed, "section");
  const anchor = optionalOption(parsed, "anchor");
  if (section === void 0 && anchor === void 0 || section !== void 0 && anchor !== void 0) {
    throw new Error("Exactly one of --section or --anchor is required.");
  }
  const input = {
    recordId,
    anchor: anchor === void 0 ? anchorFromHeadingTitle(section ?? "") : anchor.trim(),
    replacementMarkdown: requireOption(parsed, "replace")
  };
  const expectedMarkdown = optionalOption(parsed, "expected");
  if (expectedMarkdown !== void 0) {
    input.expectedMarkdown = expectedMarkdown;
  }
  const result = await executor.execute("record.patch_section", input);
  return ok(json ? aliasJson("edit", "record.patch_section", result) : renderWriteReceipt("Edit", result));
}
async function decide(executor, rest, json) {
  if (executor === void 0) {
    return fail("No Sift API executor is configured for decision.create.");
  }
  const parsed = parseOptions(rest);
  const input = {
    statement: argsWithoutOptions(rest).join(" ").trim(),
    state: optionalOption(parsed, "state") ?? "accepted",
    visibility: [optionalOption(parsed, "visibility") ?? DEFAULT_CLI_VISIBILITY]
  };
  addOptionalWorkAliasMetadata(input, parsed);
  const result = await executor.execute("decision.create", input);
  return ok(json ? aliasJson("decide", "decision.create", result) : renderWriteReceipt("Decision", result));
}
async function todo(executor, rest, json) {
  if (executor === void 0) {
    return fail("No Sift API executor is configured for task.create.");
  }
  const parsed = parseOptions(rest);
  const input = {
    title: argsWithoutOptions(rest).join(" ").trim(),
    status: optionalOption(parsed, "status") ?? "open",
    visibility: [optionalOption(parsed, "visibility") ?? DEFAULT_CLI_VISIBILITY]
  };
  const owner = optionalOption(parsed, "owner");
  if (owner !== void 0) input.owner = owner;
  const dueDate = optionalOption(parsed, "due-date");
  if (dueDate !== void 0) input.dueDate = dueDate;
  addOptionalWorkAliasMetadata(input, parsed);
  const result = await executor.execute("task.create", input);
  return ok(json ? aliasJson("todo", "task.create", result) : renderWriteReceipt("Task", result));
}
async function show(executor, rest, json) {
  if (executor === void 0) {
    return fail("No Sift API executor is configured for record.get.");
  }
  if (!await isToolAvailable(executor, "record.get")) {
    return errorResultWithCode(
      "tool_unavailable",
      "Tool 'record.get' is unavailable for this CLI transport or scope.",
      json
    );
  }
  const [recordId, ...optionArgs] = rest;
  if (recordId === void 0 || recordId.trim().length === 0) {
    return fail("Missing required record ID for show.");
  }
  const parsed = parseOptions(optionArgs);
  const input = { recordId };
  const sectionAnchor = optionalOption(parsed, "section");
  if (sectionAnchor !== void 0) {
    input.sectionAnchor = sectionAnchor;
  }
  const result = await executor.execute("record.get", input);
  return ok(json ? aliasJson("show", "record.get", result) : renderRecordResult(result));
}
async function status(config, executor, json) {
  const scope = {
    apiBaseUrl: config.apiBaseUrl,
    principalId: config.principalId,
    workspaceId: config.workspaceId,
    brainId: config.brainId,
    capabilities: [...config.capabilities]
  };
  const api = await apiReachability(executor);
  const result = { scope, api };
  if (json) {
    return ok(`${JSON.stringify({ command: "status", result })}
`);
  }
  return ok(`${renderScope({ ...scope, tokenLabel: "configured" })}API reachable: ${api.reachable}
`);
}
async function readRequiredStdin(readStdin2) {
  if (readStdin2 === void 0) {
    throw new Error("stdin reader is required.");
  }
  return readStdin2();
}
async function isToolAvailable(executor, toolName) {
  const names = await discoverToolNames(executor);
  return names?.includes(toolName) === true;
}
function addOptionalWorkAliasMetadata(input, parsed) {
  const rationale = optionalOption(parsed, "rationale");
  if (rationale !== void 0) input.rationale = rationale;
  const authorship = optionalOption(parsed, "authorship");
  if (authorship !== void 0) input.authorship = authorship;
  const evidence = optionalOption(parsed, "evidence");
  if (evidence !== void 0) {
    input.evidenceIds = evidence.split(",").map((item) => item.trim()).filter((item) => item.length > 0);
  }
}
function argsWithoutOptions(args) {
  const positionals = [];
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === void 0) continue;
    if (!arg.startsWith("--")) {
      positionals.push(arg);
      continue;
    }
    const key = arg.slice(2);
    if (valueOptions.has(key)) {
      index += 1;
    }
  }
  return positionals;
}

// src/skill/skillCommands.ts
import { access, mkdir as nodeMkdir, writeFile as nodeWriteFile } from "fs/promises";
import { homedir } from "os";
import { isAbsolute, join, resolve } from "path";

// src/skill/skillContent.ts
var SIFT_SETUP_SKILL_MARKDOWN = '---\nname: sift-setup\ndescription: Connect this agent to Sift, the team\'s shared cited brain, by setting up the Sift CLI: install it, have the human sign in, register this agent on the workspace, and confirm it works. Use this skill whenever the user pastes a Sift onboarding/setup prompt or says anything like "set up Sift", "connect me to Sift", "install the sift CLI", "sign me in to Sift", or "give you access to our brain" \u2014 even if they never say "CLI". This is first-run setup; once `sift doctor` is green you have full access and can use the brain. Hand off to the sift-cli skill for the full read/write playbook.\n---\n\n# Sift Setup\n\nSift is your team\'s shared, cited brain: context that people and agents both read\nand write. The `sift` CLI is how you reach it. Once the human signs in and you\nregister yourself, you are an agent on the workspace with full access \u2014 you read\nthe brain before answering and write back to it like a teammate.\n\nWork top to bottom. Each step says how to confirm it. If a step is genuinely\nblocked, say so and ask the human for the one thing you need \u2014 do not fake\nprogress. Never print token values, `.env` contents, or keychain secrets.\n\n## 1. Install the CLI\n\nThe package is `@sift-wiki/cli` (Node.js 20+); it installs a `sift` command.\n\n- If it will be used repeatedly, install it globally:\n\n  ```bash\n  npm install -g @sift-wiki/cli\n  ```\n\n- For a one-off or a sandbox, run it with no install: `npx -y\n  @sift-wiki/cli@latest <command>`.\n\nIf `sift` is missing right after a global install, npm\'s global bin directory is\nnot on `PATH` \u2014 find it with `npm config get prefix` and ensure `<prefix>/bin` is\non `PATH`. If the install fails, confirm Node is 20+ with `node --version`.\n\nConfirm: `sift auth status --json` runs (it will say `{"auth":"none"}` until\nsign-in \u2014 expected).\n\n## 2. The human signs in\n\n`sift login` opens the browser sign-in and stores the profile on this machine.\n\n- Run `sift login` (or ask the human to), then have them finish the approval in\n  the browser tab that opened. Wait for it to complete. One sign-in covers this\n  machine.\n- Headless box with no browser (CI, a remote runner): use env-token auth instead\n  with credentials the human provides \u2014 `SIFT_API_BASE_URL`, `SIFT_API_TOKEN`,\n  `SIFT_WORKSPACE_ID`, `SIFT_BRAIN_ID`, `SIFT_PRINCIPAL_ID`,\n  `SIFT_TOKEN_CAPABILITIES`. Never invent these.\n\nConfirm: `sift auth status --json` reports `"auth":"stored"` (sign-in) or\n`"auth":"env"` (token).\n\n## 3. Register yourself as an agent\n\nThis puts you on the workspace as an agent and signs your writes as you.\n\n- Set `SIFT_AGENT="<your product name>"` on every `sift` call (for example\n  `SIFT_AGENT="Claude Code"`), or pass `--as-agent "<name>"`. Use your own\n  product identity \u2014 never the human\'s name, never the device label.\n- Register once:\n\n  ```bash\n  sift agent register --name "<your product name>" --description "<one line>"\n  ```\n\n  Registration is idempotent and makes you visible to the workspace on the People\n  page. If your name is refused as "removed from this workspace," a human removed\n  it deliberately \u2014 stop and tell the user; do not assert a different name.\n\nConfirm: `sift agent status --json` shows your registration.\n\n## 4. Confirm it works\n\n```bash\nsift doctor --json\n```\n\nWhen the checks pass, you are connected with full access \u2014 say so. If a check\nfails, fix that one thing (missing command \u2192 install; missing auth \u2192 `sift\nlogin`; API unreachable \u2192 report the configured base URL and ask the human).\nDon\'t fall back to local files; local files are not the brain.\n\n## 5. Now use it \u2014 write like a teammate\n\nYou have full access. Treat Sift as your source of truth.\n\n- Read before answering: `sift ask "<question>"` or `sift search "<query>"`.\n- Before substantive work, run `sift context assemble "<task>"` or the equivalent\n  `sift ask` path and inspect any returned `## Task guidance` section. That\n  section may contain relevant workspace skills/custom prompts. Follow it before\n  producing output, and if you use a matched skill and your token can write,\n  record `skill.exercise` after the output.\n- **Write freely** for routine, non-destructive things \u2014 capturing notes,\n  context, decisions, and tasks (`sift remember`, `sift add`, `sift decide`,\n  `sift todo`). You don\'t need to ask permission to record what\'s worth keeping;\n  that\'s the job.\n- **Ask the human first only for important or destructive changes** \u2014 deleting or\n  overwriting existing records, editing someone else\'s work, or recording a\n  consequential decision. The test is simple: if it\'s hard to undo or could\n  mislead the team, confirm first; otherwise just do it.\n\nFor the full read/write playbook (context assembly, capture-before-derived,\npatching records, citations), load the companion skill:\n\n```bash\nsift skill print sift-cli\n```\n\n## Report back\n\nWhen setup is done, tell the human, without exposing secrets: which CLI path you\nused, the auth source (`stored`, `env`, or `none`), the agent name you\nregistered, and that the brain is reachable \u2014 or the one step that\'s blocked and\nwhat you need from them.\n';
var SIFT_CLI_SKILL_MARKDOWN = '---\nname: sift-cli\ndescription: Use this skill whenever an agent needs to use the Sift CLI to read from or write to the Sift brain, including searching, assembling context, capturing text or files, patching records, creating decisions or tasks, debugging auth/scope, handling local API or sandbox failures, or falling back from missing `sift` on PATH. Prefer this skill for Sift CLI work even if the user only says "use Sift", "query the brain", "capture this", "remember this", "record a decision", or "what is latest in Sift".\n---\n\n# Sift CLI\n\nUse the Sift CLI as a thin client to the hosted Sift brain. The hosted brain is\ncanonical. Local files, terminal output, and chat text are not canonical until\ncaptured into Sift.\n\nThe CLI package is `@sift-wiki/cli` and it installs a `sift` bin. The package is\nlive on npm, npm-first, and Node.js 20+. Install or upgrade with `@latest`. It is\na command package, not a public SDK. Do not import it as a library, publish\ninternal Sift packages, or make local files a source of truth.\n\nInstall the live CLI with:\n\n```bash\nnpm install -g @sift-wiki/cli\n```\n\nThe CLI bundles its own agent skills, versioned with the package. The first-run\nsetup skill is `sift-setup`; `sift skill install` installs it by default (writes\n`.claude/skills/sift-setup/SKILL.md`; add `--global` for `~/.claude/skills` or\n`--dir <path>`). Install this usage skill on disk with\n`sift skill install sift-cli`, print any skill with `sift skill print <name>`,\nor list bundled skills with `sift skill list`. The zero-install setup entry point\nis `npx -y @sift-wiki/cli@latest skill install`, which works before any global\ninstall. These skill commands are local and need no auth.\n\nFor one-off or headless use without a global install, run the live package\ndirectly from npm:\n\n```bash\nnpx -y @sift-wiki/cli@latest auth status --json\nnpm exec --yes --package @sift-wiki/cli@latest -- sift auth status --json\n```\n\nFor CLI distribution changes inside the repo, build, pack, and verify the\ninstalled tarball with `pnpm --filter @sift-wiki/cli pack:verify` before a\nrelease. This private monorepo owns the CLI source and verifier; npm publishes\nare cut from the public `goodnight000/sift-cli` release mirror so npm provenance\ncan point at public GitHub release source.\n\n## Preflight\n\nBefore reading or writing, establish the command path, auth, and scope.\n\n1. Prefer installed `sift` when it exists on `PATH`.\n2. If `sift` is missing outside the repo and the user needs repeated\n   interactive use, install the live package with\n   `npm install -g @sift-wiki/cli`.\n3. If `sift` is missing outside the repo and the user needs one-off, CI, or\n   headless execution, use\n   `npm exec --yes --package @sift-wiki/cli@latest -- sift ...` or\n   `npx -y @sift-wiki/cli@latest ...`.\n4. For normal human setup, use `sift login`; it opens the existing browser login\n   flow and stores the CLI profile.\n5. For CI/headless agents only, use env-token auth when the user or environment\n   provides it: `SIFT_API_BASE_URL`, `SIFT_API_TOKEN`, `SIFT_WORKSPACE_ID`,\n   `SIFT_BRAIN_ID`, `SIFT_PRINCIPAL_ID`, and `SIFT_TOKEN_CAPABILITIES`.\n6. Do not print `.env` files, token values, keychain output, bearer secrets, or\n   full credential-store output.\n7. Check auth and scope with `sift auth status --json`, then\n   `sift scope current --json` when authenticated.\n8. Declare your agent identity on every invocation: set\n   `SIFT_AGENT="<your product name>"` (for example `SIFT_AGENT="Claude Code"`)\n   in the environment of each `sift` call, or pass `--as-agent "<name>"`. Use\n   your own product identity \u2014 never the device label and never the human\'s\n   name. This keeps authorship correct when several agents share one CLI\n   profile and token; your writes are stamped as you, acting for the human who\n   approved the token. A human running `sift` directly sets nothing and stays\n   plainly themselves.\n9. Once authenticated, check `sift agent status --json`; if it reports no\n   agent identity registration for your name, run `sift agent register` with\n   your product name and a one-line description. Registration is idempotent\n   (re-running converges on the same identity and refreshes the description),\n   requires only your usable token, and makes you visible to the workspace on\n   the People page. First use of a `SIFT_AGENT` name also auto-registers it;\n   explicit register is how you add a self-description.\n10. Run `sift doctor --json` when setup, auth, API reachability, or tool\n    availability is unclear.\n11. In the `sift-v3` repo only, if `sift` is missing and you need the\n    development CLI, build first and run the built JS entrypoint:\n\n    ```bash\n    pnpm --filter @sift-wiki/cli build\n    node packages/cli/dist/bin/sift.js auth status --json\n    ```\n\n12. Do not run TypeScript source as the CLI bin. The package bin points to\n    `dist/bin/sift.js`.\n13. If a local development API is required and down, report that directly. Do\n    not silently switch to local files.\n\nUse package verification only when the task is about distribution or installed\nartifact proof:\n\n```bash\npnpm --filter @sift-wiki/cli pack:verify\n```\n\nThat verifier packs `@sift-wiki/cli`, installs the tarball into an isolated npm\nprefix, runs installed unauthenticated `sift auth status --json`, then uses\nenv-token auth against a local fake hosted API to prove `auth status`,\n`whoami --json`, and `ask "package smoke" --json` with bearer, workspace, and\nbrain headers.\n\nStop and ask for the minimum missing permission or setup action when:\n\n- no runnable CLI path exists;\n- auth is missing or expired;\n- workspace or brain scope is missing;\n- the hosted/local API cannot be reached from the runtime;\n- sandbox/network restrictions block the command;\n- a required write is requested with read-only capabilities;\n- tool discovery says the required runtime contract is unavailable.\n- the user asks to publish a new CLI version that has not passed post-publish\n  install smoke.\n\n## Fast Read Path\n\nUse one focused context command before broad search loops.\n\nPreferred simple commands, when available:\n\n```bash\nsift "what is latest with the company?"\nsift ask "what changed since the last meeting?"\nsift search "Slack ingestion launch"\nsift status --json\nsift whoami --json\n```\n\nCurrent power-command fallback:\n\n```bash\nsift context assemble "what is latest with the company?" --max-chars 12000 --json\nsift search query "Slack ingestion launch" --json\nsift context profile "reviewer evidence" --limit 6 --json\n```\n\nRules:\n\n- Use `context assemble` for grounded answers, summaries, handoffs, write\n  preparation, and "latest/current" questions.\n- Before substantive work, inspect any returned `## Task guidance` section. It\n  may contain relevant workspace skills/custom prompts; follow the matched\n  skill/custom prompt before producing output.\n- If `## Task guidance` names a matched skill and you produce output informed by\n  it, call `skill exercise` / `skill.exercise` after the output when your token\n  can write. Use the skill id, pinned version id, surface, outputRef, and a\n  stable idempotency key. If the token is read-only, do not claim exercise\n  attribution was recorded.\n- Use `search query` for raw retrieval or to find candidate records.\n- Do not call `record get` until `tools list` or `doctor` proves it is backed by\n  the runtime; older slices may advertise it while returning `tool_unavailable`.\n- Keep broad context calls capped with `--max-chars`; increase only when the\n  returned context is too thin.\n- Include Sift citations, record IDs, version IDs, source IDs, headings, or\n  chunk locators when the CLI returns them.\n\n## Fast Write Path\n\nWrites must go through Sift tools, not local notes.\n\nPreferred simple commands, when available:\n\n```bash\nsift remember "Follow up with Caleb about the Underscore intro."\nsift remember --stdin\nsift add ./meeting-notes.md\nsift decide "Ship the retrieval-only slice first."\nsift todo "Collect three evidence examples for onboarding."\nsift edit <record-id> --section Risks --replace "..."\n```\n\nCurrent power-command fallbacks:\n\n```bash\nsift capture text \\\n  --source "CLI Capture" \\\n  --external-id "cli-text:<stable-id>" \\\n  --title "Follow up with Caleb" \\\n  --visibility team \\\n  --markdown "Follow up with Caleb about the Underscore intro."\n\nsift capture file ./meeting-notes.md \\\n  --source "CLI Capture" \\\n  --external-id "cli-file:<stable-id>" \\\n  --title "Meeting notes" \\\n  --visibility team\n\nsift decision create \\\n  --statement "Ship the retrieval-only slice first." \\\n  --state accepted \\\n  --visibility team\n\nsift task create \\\n  --title "Collect three evidence examples for onboarding." \\\n  --status open \\\n  --visibility team\n\nsift record patch-section <record-id> risks \\\n  --replacement-markdown "..." \\\n  --expected-markdown "..."\n```\n\nRules:\n\n- Verify the token has `record:write` before writes.\n- Verify the token has `source:write` before `remember`, `add`, `capture text`,\n  `capture file`, or `capture batch`.\n- Prefer capture before derived records when the user supplies raw source.\n- Use stable external IDs for capture retries.\n- Read a record before patching it, and include expected content when available.\n- If a conflict is returned, surface current version metadata and do not\n  overwrite.\n- Print or summarize write receipts with record, version, source item, and job\n  IDs. Do not claim a write happened without a receipt.\n\n## Troubleshooting\n\nClassify failures before retrying.\n\n- **Command missing:** for repeated interactive use, install the live package\n  with `npm install -g @sift-wiki/cli`. For one-off or headless use, run\n  `npm exec --yes --package @sift-wiki/cli@latest -- sift ...` or\n  `npx -y @sift-wiki/cli@latest ...`. In `sift-v3`, build and use\n  `node packages/cli/dist/bin/sift.js` as the development fallback when working\n  on unpublished local CLI changes.\n- **Auth missing:** run or request `sift login`; use env-token auth only when it\n  is explicitly provided for CI/headless use.\n- **Read-only token:** reads may proceed, writes must stop.\n- **API down:** report the configured API base URL and failure class.\n- **Sandbox network block:** rerun with approved escalation only when the user\n  asked for live CLI execution and policy allows it.\n- **Local listener blocked:** `pack:verify` uses a fake API on `127.0.0.1`; if\n  the sandbox returns `listen EPERM`, rerun with approved escalation instead of\n  weakening the installed-artifact test.\n- **Tool unavailable:** use `tools list`, `tools help`, or `doctor`; do not\n  retry the same unsupported command repeatedly.\n- **Agent identity refused:** a `SIFT_AGENT` name that returns "has been\n  removed from this workspace" was deliberately removed by a human. Stop and\n  tell the user; do not work around it by asserting a different name.\n- **`agent` commands unavailable:** the installed CLI or the API predates\n  agent workers; proceed without identity assertion and note the limitation.\n- **GitHub Actions publish blocked:** package publishing runs from the public\n  `goodnight000/sift-cli` release mirror. The private `sift-v3` workflow is\n  verify-only; do not publish `@sift-wiki/cli` from the private repo.\n- **Large output:** reduce `--max-chars`, search more narrowly, then assemble\n  context for the narrowed query.\n\n## Expected Response\n\nWhen answering the user after CLI work:\n\n- State which CLI path was used: installed `sift`, zero-install `npx`/`npm exec`,\n  built repo JS, or verified packed tarball.\n- State the auth source only at a safe level: `stored`, `env`, or `none`.\n- State the agent identity asserted (the `SIFT_AGENT` name), or that none was\n  set.\n- State the API scope used without exposing secrets.\n- Summarize the answer or write result in normal prose.\n- Include Sift citations or write receipt IDs.\n- Call out limitations such as read-only auth, local API dependency, missing\n  runtime contract, sandbox escalation, unpublished package version, or\n  stale/unverified context.\n';
var SIFT_AGENT_SKILL_MARKDOWN = '---\nname: sift-agent\ndescription: Use this skill whenever an external coding or research agent needs to read from, capture into, patch, or create work objects in a Sift brain through Sift CLI or MCP tools. Prefer this skill when the user mentions Sift, the hosted brain, brain records, captured source, cited context, decisions, tasks, or choosing between CLI and MCP access.\n---\n\n# Sift Agent\n\nUse Sift as the canonical shared brain for accumulated human and agent context.\nThe hosted Sift brain is canonical. Local files are not canonical brain state\nunless they have been captured into Sift; local files are not canonical by\nthemselves.\n\n## The Contract Comes First\n\nBefore any other Sift work, fetch the Sift agent contract and read it:\n\n- CLI: run `sift contract get --json`.\n- MCP: call `contract.get`.\n\nThe contract is the authoritative protocol (reading, writing, the learning\nloop, restraint) plus this workspace\'s own rules. Echo the returned\n`contractVersion` in the input of every other tool call (CLI: pass\n`--contract <version>`). A call refused with `contract_required` returns the\ncurrent contract in the error message \u2014 read it and retry with the new\nversion. The full rules live in the served contract, not in this file.\n\n## Transport Choice\n\nAgents should prefer CLI when it is already installed, authenticated, and\nscoped; otherwise use MCP.\n\n1. Prefer CLI when `sift` is installed, authenticated, and already scoped to the\n   correct workspace and brain.\n2. Use MCP when CLI is unavailable, unauthenticated, unscoped, or blocked by the\n   runtime.\n3. Do not ask the user to install CLI during the task if MCP tools are already\n   available.\n4. Treat both CLI and MCP as access transports. Do not treat local markdown,\n   local manifests, or chat transcript text as canonical storage.\n\n## First Checks\n\nAfter fetching the contract, establish identity and scope:\n\n- CLI: run `sift scope current --json` or `sift whoami --json`.\n- MCP: call `scope.current` or `whoami`.\n\nIf the tool reports missing scope, expired auth, or insufficient capability,\nreturn the compact tool error and ask for the minimum permission or reconnect\naction needed. Do not guess a workspace, brain, source, or principal.\n\n## Agent Identity\n\nDeclare who you are so your writes are authored as you, acting for the human\nwho approved the token:\n\n1. Set `SIFT_AGENT="<your product name>"` (for example "Claude Code") in the\n   environment of every CLI invocation, or pass `--as-agent "<name>"`. Use\n   your own product identity \u2014 never the device label and never the human\'s\n   name. First use auto-registers you as a workspace agent worker, visible on\n   the People page.\n2. Check `sift agent status --json` (CLI) or `agent.status` (MCP); register a\n   one-line self-description with `sift agent register --name "<name>"\n   --description "<one line>"` or `agent.register`. Registration is idempotent\n   and requires only your usable token.\n3. Identity is authorship, not authority: asserting a name never changes what\n   the token may read or write.\n4. If your asserted name is refused as removed from the workspace, stop and\n   tell the user; do not assert a different name to work around it.\n\n## Search And Context\n\nSearch and assemble context before answering from memory:\n\n1. Use `search.query` for targeted lookup.\n2. Use `context.assemble` when the user needs a grounded answer, handoff, patch,\n   decision, or task.\n3. Before substantive work, inspect any returned `## Task guidance` section.\n   It may contain the relevant workspace skills/custom prompts for this task;\n   follow the matched skill/custom prompt before producing output.\n4. Use `context.profile` only for durable profile or workspace context.\n5. Keep responses grounded in returned Sift citations. Do not invent facts\n   outside the brain.\n\nCite record IDs, version IDs, source IDs, source item IDs, heading anchors, and\nchunk locators when the tool returns them. Prefer compact cited summaries over\ndumping large content.\n\nIf `## Task guidance` names a matched skill and you produce output informed by\nit, call `skill.exercise` after the output when your token can write. Use the\nskill id, pinned version id, surface (`cli`, `mcp`, or `api`), an outputRef, and\na stable idempotency key. If your token is read-only, do not claim exercise\nattribution was recorded.\n\n## Capture And Derived Writes\n\nCapture raw source before creating derived knowledge when possible:\n\n1. Use `capture.text` for copied text or markdown.\n2. Use `capture.file` for local files; the file path is only an input, not\n   canonical brain state.\n3. Use `capture.batch` for bounded repeatable imports.\n4. Reuse stable external IDs or idempotency keys when retrying capture.\n\nOnly create a derived markdown record after the relevant raw source is captured\nor after the user explicitly asks for an authored record without source capture.\n\n## Records And Patches\n\nRead the current record version before editing. Patch bounded sections instead\nof rewriting whole records:\n\n- Use `record.get` to inspect the current record or requested section.\n- Patch bounded sections with `record.patch_section`.\n- Include expected content when available so conflicts are detected.\n- If a patch conflict is returned, show the current version metadata and ask for\n  the next edit boundary. Do not silently overwrite.\n\n## Decisions And Tasks\n\nCreate decisions and tasks only from explicit user intent or grounded context:\n\n- Use `decision.create` when the user asks to record a decision or the context\n  clearly contains a chosen course of action.\n- Use `task.create` when the user asks to track follow-up work or the context\n  clearly assigns a next action.\n- Include rationale or explicit authorship.\n- Link evidence when available.\n- Do not create thread-like records; `thread.create` is unavailable until the\n  Collaboration Threads spec owns that behavior.\n\n## Safety Boundaries\n\n- Do not use destructive forget, delete, broad admin, connector OAuth install,\n  or hosted-agent run-control tools in this first tool slice.\n- Do not expose token values, secrets, raw private snippets, or full provider\n  payloads in logs or user-facing messages.\n- Preserve principal, actor, request, workspace, brain, and source scope across\n  tool calls.\n- If a permission denial hides a private object, do not reveal private\n  existence, title, count, or snippet.\n';

// src/skill/skillCommands.ts
var BUNDLED_SKILLS = [
  {
    name: "sift-setup",
    summary: "Set up the Sift CLI and connect this agent to the brain (first run).",
    markdown: SIFT_SETUP_SKILL_MARKDOWN
  },
  {
    name: "sift-cli",
    summary: "Set up and use the Sift CLI as a thin client to the hosted brain.",
    markdown: SIFT_CLI_SKILL_MARKDOWN
  },
  {
    name: "sift-agent",
    summary: "Read, capture, and patch the Sift brain over CLI or MCP.",
    markdown: SIFT_AGENT_SKILL_MARKDOWN
  }
];
var DEFAULT_SKILL = "sift-setup";
function defaultSkillIo(input) {
  return {
    writeFile: (path, data) => nodeWriteFile(path, data, "utf8"),
    mkdir: async (path) => {
      await nodeMkdir(path, { recursive: true });
    },
    pathExists: async (path) => {
      try {
        await access(path);
        return true;
      } catch {
        return false;
      }
    },
    homeDir: input?.homeDir ?? homedir(),
    cwd: input?.cwd ?? process.cwd()
  };
}
async function runSkillCommand(input) {
  const [subcommand, ...rest] = input.rest;
  if (subcommand === void 0 || subcommand === "list") {
    return listSkills(input.json);
  }
  if (subcommand === "print" || subcommand === "show") {
    return printSkill(rest, input.json);
  }
  if (subcommand === "install") {
    return installSkill(rest, input.json, input.io);
  }
  return errorResultWithCode(
    "tool_unavailable",
    `Unknown skill subcommand '${subcommand}'. Use 'list', 'print [name]', or 'install [name]'.`,
    input.json
  );
}
function listSkills(json) {
  if (json) {
    return ok(
      `${JSON.stringify({
        skills: BUNDLED_SKILLS.map(({ name, summary }) => ({ name, summary }))
      })}
`
    );
  }
  const lines = BUNDLED_SKILLS.map((skill) => `${skill.name}: ${skill.summary}`);
  return ok(`${lines.join("\n")}
`);
}
function printSkill(rest, json) {
  const requested = positionalArgs(rest)[0];
  const skill = findSkill(requested);
  if (skill === void 0) {
    return unknownSkill(requested, json);
  }
  if (json) {
    return ok(`${JSON.stringify({ skill: skill.name, markdown: skill.markdown })}
`);
  }
  return ok(withTrailingNewline(skill.markdown));
}
async function installSkill(rest, json, io) {
  const requested = positionalArgs(rest)[0];
  const skill = findSkill(requested);
  if (skill === void 0) {
    return unknownSkill(requested, json);
  }
  const parsed = parseOptions(rest);
  const baseDir = resolveBaseDir({ rest, parsed, io });
  const targetDir = join(baseDir, skill.name);
  const targetPath = join(targetDir, "SKILL.md");
  const existed = await io.pathExists(targetPath);
  await io.mkdir(targetDir);
  const markdown = withTrailingNewline(skill.markdown);
  await io.writeFile(targetPath, markdown);
  const status2 = existed ? "updated" : "created";
  if (json) {
    return ok(
      `${JSON.stringify({
        installed: true,
        skill: skill.name,
        path: targetPath,
        status: status2,
        bytes: Buffer.byteLength(markdown, "utf8")
      })}
`
    );
  }
  return ok(renderInstall(skill.name, targetPath, status2));
}
function resolveBaseDir(input) {
  const explicit = optionalOption(input.parsed, "dir");
  if (explicit !== void 0) {
    return isAbsolute(explicit) ? explicit : resolve(input.io.cwd, explicit);
  }
  if (input.rest.includes("--global")) {
    return join(input.io.homeDir, ".claude", "skills");
  }
  return resolve(input.io.cwd, ".claude", "skills");
}
function findSkill(name) {
  const target = name ?? DEFAULT_SKILL;
  return BUNDLED_SKILLS.find((skill) => skill.name === target);
}
function unknownSkill(name, json) {
  const available = BUNDLED_SKILLS.map((skill) => skill.name).join(", ");
  return errorResultWithCode(
    "validation_failure",
    `Unknown skill '${name}'. Available skills: ${available}.`,
    json
  );
}
function renderInstall(name, path, status2) {
  const verb = status2 === "created" ? "Installed" : "Updated";
  return [
    `${verb} the Sift skill: ${name}`,
    `Path: ${path}`,
    "",
    "Next, open that SKILL.md and follow it to finish setup:",
    "  1. Put the CLI on PATH:   npm install -g @sift-wiki/cli",
    "  2. Authenticate:          sift login",
    '  3. Identify yourself:     set SIFT_AGENT to your product name (e.g. "Claude Code"), then sift agent register',
    "  4. Confirm:               sift doctor",
    "",
    "Then use Sift as your source of truth: search and assemble context before",
    "answering, and capture decisions and notes back into the brain.",
    ""
  ].join("\n");
}
function withTrailingNewline(markdown) {
  return markdown.endsWith("\n") ? markdown : `${markdown}
`;
}

// src/specialCommands.ts
async function runSpecialCommand(input, args, json, group, command) {
  if (group === "doctor" && command === void 0) {
    return doctor({
      config: input.config,
      executor: input.executor,
      json,
      now: input.now ?? /* @__PURE__ */ new Date()
    });
  }
  if (group === "skill") {
    const io = input.skillIo ?? defaultSkillIo({ cwd: input.cwd, homeDir: input.homeDir });
    return runSkillCommand({ rest: args.slice(1), json, io });
  }
  const simpleCommand = resolveSimpleCommand({
    args,
    json,
    config: input.config,
    executor: input.executor,
    readFile: input.readFile ?? readFile,
    readStdin: input.readStdin,
    now: input.now ?? /* @__PURE__ */ new Date()
  });
  if (simpleCommand === void 0) return void 0;
  try {
    validateAuthenticatedScope(input.config, input.now ?? /* @__PURE__ */ new Date());
    validateCommandCapability({ commandKey: simpleCommand.commandKey, config: input.config });
    return await simpleCommand.run();
  } catch (error) {
    return errorResult(error, json);
  }
}

// src/toolDiscovery.ts
function toolsList(input) {
  if (input.executor !== void 0) {
    return executeSimple(input.executor, "tools.list", {}, input.json);
  }
  const tools = input.metadata?.filter((tool) => input.config.capabilities.includes(tool.capability)) ?? [];
  return ok(input.json ? `${JSON.stringify(tools)}
` : renderTools(tools));
}
function toolsHelp(input) {
  const [name] = input.rest;
  if (name === void 0 || name.trim().length === 0) {
    return Promise.resolve(fail("Missing required tool name for tools.help."));
  }
  if (input.executor === void 0) {
    const tool = input.metadata?.find(
      (item) => item.name === name && input.config.capabilities.includes(item.capability)
    );
    if (tool === void 0) {
      return Promise.resolve(
        errorResultWithCode(
          "tool_unavailable",
          `Tool '${name}' is unavailable for this CLI transport or scope.`,
          input.json
        )
      );
    }
    return Promise.resolve(ok(input.json ? `${JSON.stringify(tool)}
` : renderTools([tool])));
  }
  return executeSimple(input.executor, "tools.help", { name }, input.json);
}
async function executeSimple(executor, name, toolInput, json) {
  const result = await executor.execute(name, toolInput);
  return ok(json ? `${JSON.stringify(result)}
` : `${JSON.stringify(result)}
`);
}

// src/hostedApiExecutor.ts
function createHostedApiExecutor(input) {
  const fetchImpl = input.fetch ?? globalThis.fetch;
  return {
    async execute(name, toolInput) {
      const response = await fetchImpl(toolUrl(input.apiBaseUrl, name), {
        method: "POST",
        headers: {
          authorization: `Bearer ${input.token}`,
          "content-type": "application/json",
          "x-sift-brain-id": input.brainId,
          "x-sift-workspace-id": input.workspaceId,
          ...input.agentName === void 0 || input.agentName.trim().length === 0 ? {} : { "x-sift-agent-name": input.agentName.trim() }
        },
        body: JSON.stringify({ input: toolInput }, serializeJsonValue)
      });
      const body = await response.text();
      const parsed = body.length > 0 ? parseJson2(body) : {};
      if (!response.ok) {
        throw new Error(errorMessage(parsed, response.status));
      }
      return parsed;
    }
  };
}
function serializeJsonValue(_key, value) {
  if (value instanceof Uint8Array) {
    return [...value];
  }
  return value;
}
function toolUrl(apiBaseUrl, name) {
  return `${apiBaseUrl.replace(/\/+$/u, "")}/agent-tools/${encodeURIComponent(name)}`;
}
function parseJson2(body) {
  try {
    return JSON.parse(body);
  } catch {
    throw new Error("Hosted Sift API returned invalid JSON.");
  }
}
function errorMessage(parsed, status2) {
  if (typeof parsed === "object" && parsed !== null && "error" in parsed) {
    const error = parsed.error;
    if (typeof error === "object" && error !== null && "message" in error) {
      const message = error.message;
      if (typeof message === "string" && message.trim().length > 0) {
        return message;
      }
    }
  }
  return `Hosted Sift API request failed with status ${status2}.`;
}

// src/index.ts
async function runSiftCli(rawInput) {
  const input = applyContractOption(rawInput);
  const json = input.argv.includes("--json");
  const args = input.argv.filter((arg) => arg !== "--json");
  const [group, command, ...rest] = args;
  const special = await runSpecialCommand(input, args, json, group, command);
  if (special !== void 0) return special;
  const commandKey = group === "login" ? "login:" : `${group ?? ""}:${command ?? ""}`;
  const commandRest = group === "login" ? args.slice(1) : rest;
  const handlers = {
    "contract:get": () => executeSimple2(rawInput.executor, "contract.get", {}, json),
    "whoami:": () => executeSimple2(input.executor, "whoami", {}, json),
    "brain:list": () => executeSimple2(input.executor, "brain.list", {}, json),
    "brain:use": () => idTool({
      executor: input.executor,
      toolName: "brain.use",
      inputKey: "brainId",
      idLabel: "brain ID",
      rest,
      json
    }),
    "scope:current": () => scopeCurrent(input.config, json),
    "search:query": () => searchQuery(input.executor, rest, json),
    "context:assemble": () => contextAssemble(input.executor, rest, json),
    "context:profile": () => contextProfile(input.executor, rest, json),
    "tools:list": () => toolsList({
      config: input.config,
      executor: input.executor,
      metadata: input.toolMetadata,
      json
    }),
    "tools:schema": () => executeSimple2(input.executor, "tools.schema", {}, json),
    "tools:help": () => toolsHelp({
      config: input.config,
      executor: input.executor,
      metadata: input.toolMetadata,
      rest,
      json
    }),
    "capture:text": () => captureText(input.executor, rest, json),
    "capture:file": () => captureFile(input.executor, input.readFile ?? readFile2, rest, json),
    "capture:batch": () => captureBatch(input.executor, input.readFile ?? readFile2, rest, json),
    "source:list": () => sourceList(input.executor, json),
    "source:create": () => sourceCreate(input.executor, rest, json),
    "source:get": () => sourceRead(input.executor, "get", rest, json),
    "source:status": () => sourceRead(input.executor, "status", rest, json),
    "ingestion:status": () => ingestionStatus(input.executor, rest, json),
    "record:list": () => recordList(input.executor, json),
    "record:get": () => recordRead(input.executor, "record.get", rest, json),
    "record:create-markdown": () => createMarkdownRecord(input.executor, rest, json),
    "record:patch-section": () => patchRecordSection(input.executor, rest, json),
    "record:versions": () => recordRead(input.executor, "record.versions", rest, json),
    "evidence:list": () => idTool({
      executor: input.executor,
      toolName: "evidence.list",
      inputKey: "recordId",
      idLabel: "record ID",
      rest,
      json
    }),
    "evidence:get": () => idTool({
      executor: input.executor,
      toolName: "evidence.get",
      inputKey: "evidenceId",
      idLabel: "evidence ID",
      rest,
      json
    }),
    "graph:neighbors": () => idTool({
      executor: input.executor,
      toolName: "graph.neighbors",
      inputKey: "recordId",
      idLabel: "record ID",
      rest,
      json
    }),
    "event:list": () => executeSimple2(input.executor, "event.list", {}, json),
    "audit:events": () => auditEvents(input.executor, rest, json),
    "decision:create": () => createDecision(input.executor, rest, json),
    "task:create": () => createTask(input.executor, rest, json),
    "agent:register": () => agentRegister(input.executor, input.agentName, rest, json),
    "agent:status": () => executeSimple2(input.executor, "agent.status", {}, json),
    "mcp:serve": () => mcpServe({
      mcpServer: input.mcpServer,
      config: input.config,
      executor: rawInput.executor
    }),
    "roam:import": () => runRoamImportCommand({
      rest,
      json,
      config: input.config,
      reader: input.roamReader,
      importer: input.roamImporter,
      now: input.now ?? /* @__PURE__ */ new Date()
    }),
    "login:": () => authCommand(input.authCommands, "login", { rest: commandRest, json }),
    "auth:status": () => authCommand(input.authCommands, "status", { json }),
    "logout:": () => authCommand(input.authCommands, "logout", { json })
  };
  const handler = handlers[commandKey];
  if (handler === void 0) {
    return errorResultWithCode(
      "tool_unavailable",
      `Tool or command '${args.join(" ")}' is unavailable for this CLI transport or implementation slice.`,
      json
    );
  }
  try {
    if (isAuthCommand(commandKey) || commandKey === "mcp:serve") {
      return await handler();
    }
    validateAuthenticatedScope(input.config, input.now ?? /* @__PURE__ */ new Date());
    validateCommandCapability({ commandKey, config: input.config });
    return await handler();
  } catch (error) {
    return errorResult(error, json);
  }
}
async function searchQuery(executor, rest, json) {
  if (executor === void 0) {
    return fail("No Sift API executor is configured for search.query.");
  }
  const query = rest.join(" ").trim();
  const result = await executor.execute("search.query", { query, limit: 10 });
  return ok(json ? `${JSON.stringify(result)}
` : renderSearchResult(result));
}
async function contextAssemble(executor, rest, json) {
  if (executor === void 0) {
    return fail("No Sift API executor is configured for context.assemble.");
  }
  const parsed = parseOptions(rest);
  const query = positionalArgs(rest).join(" ").trim();
  const result = await executor.execute("context.assemble", {
    query,
    maxChars: parseIntegerOption(parsed, "max-chars", 4e3)
  });
  return ok(json ? `${JSON.stringify(result)}
` : renderSearchResult(result));
}
async function contextProfile(executor, rest, json) {
  if (executor === void 0) {
    return fail("No Sift API executor is configured for context.profile.");
  }
  const parsed = parseOptions(rest);
  const input = {
    limit: parseIntegerOption(parsed, "limit", 6)
  };
  const query = positionalArgs(rest).join(" ").trim();
  if (query.length > 0) {
    input.query = query;
  }
  const result = await executor.execute("context.profile", input);
  return ok(json ? `${JSON.stringify(result)}
` : renderProfileResult(result));
}
async function executeSimple2(executor, name, toolInput, json) {
  if (executor === void 0) {
    return fail(`No Sift API executor is configured for ${name}.`);
  }
  const result = await executor.execute(name, toolInput);
  return ok(json ? `${JSON.stringify(result)}
` : `${JSON.stringify(result)}
`);
}
async function captureText(executor, rest, json) {
  if (executor === void 0) {
    return fail("No Sift API executor is configured for capture.text.");
  }
  const parsed = parseOptions(rest);
  const result = await executor.execute("capture.text", {
    sourceName: requireOption(parsed, "source"),
    externalId: requireOption(parsed, "external-id"),
    title: requireOption(parsed, "title"),
    visibility: [requireOption(parsed, "visibility")],
    markdown: requireOption(parsed, "markdown")
  });
  return ok(json ? `${JSON.stringify(result)}
` : `${JSON.stringify(result)}
`);
}
async function captureFile(executor, fileReader, rest, json) {
  if (executor === void 0) {
    return fail("No Sift API executor is configured for capture.file.");
  }
  const [path, ...optionArgs] = rest;
  if (path === void 0 || path.trim().length === 0) {
    return fail("Missing required file path for capture.file.");
  }
  const parsed = parseOptions(optionArgs);
  const bytes = await fileReader(path);
  const result = await executor.execute("capture.file", {
    sourceName: requireOption(parsed, "source"),
    externalId: requireOption(parsed, "external-id"),
    title: requireOption(parsed, "title"),
    filename: basename(path),
    contentType: optionalOption(parsed, "content-type") ?? inferContentType(path),
    bytes,
    visibility: [requireOption(parsed, "visibility")]
  });
  return ok(json ? `${JSON.stringify(result)}
` : `${JSON.stringify(result)}
`);
}
async function captureBatch(executor, fileReader, rest, json) {
  if (executor === void 0) {
    return fail("No Sift API executor is configured for capture.batch.");
  }
  const [manifestPath] = rest;
  if (manifestPath === void 0 || manifestPath.trim().length === 0) {
    return fail("Missing required manifest path for capture.batch.");
  }
  const manifest = parseBatchManifest(await fileReader(manifestPath));
  const result = await executor.execute("capture.batch", { items: manifest });
  return ok(json ? `${JSON.stringify(result)}
` : `${JSON.stringify(result)}
`);
}
function parseBatchManifest(bytes) {
  const parsed = JSON.parse(new TextDecoder().decode(bytes));
  if (!Array.isArray(parsed)) {
    throw new Error("Batch manifest must be a JSON array.");
  }
  return parsed;
}
async function createDecision(executor, rest, json) {
  if (executor === void 0) {
    return fail("No Sift API executor is configured for decision.create.");
  }
  const parsed = parseOptions(rest);
  const input = {
    statement: requireOption(parsed, "statement"),
    state: requireOption(parsed, "state"),
    visibility: [requireOption(parsed, "visibility")]
  };
  const rationale = optionalOption(parsed, "rationale");
  if (rationale !== void 0) {
    input.rationale = rationale;
  }
  addOptionalWorkMetadata(input, parsed);
  const result = await executor.execute("decision.create", input);
  return ok(json ? `${JSON.stringify(result)}
` : `${JSON.stringify(result)}
`);
}
async function sourceList(executor, json) {
  if (executor === void 0) {
    return fail("No Sift API executor is configured for source.list.");
  }
  const result = await executor.execute("source.list", {});
  return ok(json ? `${JSON.stringify(result)}
` : `${JSON.stringify(result)}
`);
}
async function sourceCreate(executor, rest, json) {
  if (executor === void 0) {
    return fail("No Sift API executor is configured for source.create.");
  }
  const parsed = parseOptions(rest);
  const result = await executor.execute("source.create", {
    name: requireOption(parsed, "name"),
    visibility: [requireOption(parsed, "visibility")]
  });
  return ok(json ? `${JSON.stringify(result)}
` : `${JSON.stringify(result)}
`);
}
async function sourceRead(executor, command, rest, json) {
  const toolName = command === "get" ? "source.get" : "source.status";
  if (executor === void 0) {
    return fail(`No Sift API executor is configured for ${toolName}.`);
  }
  const [sourceId] = rest;
  if (sourceId === void 0 || sourceId.trim().length === 0) {
    return fail(`Missing required source ID for ${toolName}.`);
  }
  const result = await executor.execute(toolName, { sourceId });
  return ok(json ? `${JSON.stringify(result)}
` : `${JSON.stringify(result)}
`);
}
async function ingestionStatus(executor, rest, json) {
  if (executor === void 0) {
    return fail("No Sift API executor is configured for ingestion.status.");
  }
  const [jobId] = rest;
  if (jobId === void 0 || jobId.trim().length === 0) {
    return fail("Missing required job ID for ingestion.status.");
  }
  const result = await executor.execute("ingestion.status", { jobId });
  return ok(json ? `${JSON.stringify(result)}
` : `${JSON.stringify(result)}
`);
}
async function recordList(executor, json) {
  if (executor === void 0) {
    return fail("No Sift API executor is configured for record.list.");
  }
  const result = await executor.execute("record.list", {});
  return ok(json ? `${JSON.stringify(result)}
` : `${JSON.stringify(result)}
`);
}
async function recordRead(executor, toolName, rest, json) {
  if (executor === void 0) {
    return fail(`No Sift API executor is configured for ${toolName}.`);
  }
  const [recordId] = rest;
  if (recordId === void 0 || recordId.trim().length === 0) {
    return fail(`Missing required record ID for ${toolName}.`);
  }
  const input = { recordId };
  if (toolName === "record.get") {
    const sectionAnchor = optionalOption(parseOptions(rest.slice(1)), "section");
    if (sectionAnchor !== void 0) {
      input.sectionAnchor = sectionAnchor;
    }
  }
  const result = await executor.execute(toolName, input);
  return ok(json ? `${JSON.stringify(result)}
` : renderRecordResult(result));
}
async function createMarkdownRecord(executor, rest, json) {
  if (executor === void 0) {
    return fail("No Sift API executor is configured for record.create_markdown.");
  }
  const parsed = parseOptions(rest);
  const result = await executor.execute("record.create_markdown", {
    recordType: requireOption(parsed, "type"),
    title: requireOption(parsed, "title"),
    markdown: requireOption(parsed, "markdown"),
    visibility: [requireOption(parsed, "visibility")]
  });
  return ok(json ? `${JSON.stringify(result)}
` : `${JSON.stringify(result)}
`);
}
async function patchRecordSection(executor, rest, json) {
  if (executor === void 0) {
    return fail("No Sift API executor is configured for record.patch_section.");
  }
  const [recordId, anchor, ...optionArgs] = rest;
  if (recordId === void 0 || recordId.trim().length === 0) {
    return fail("Missing required record ID for record.patch_section.");
  }
  if (anchor === void 0 || anchor.trim().length === 0) {
    return fail("Missing required anchor for record.patch_section.");
  }
  const parsed = parseOptions(optionArgs);
  const input = {
    recordId,
    anchor,
    replacementMarkdown: requireOption(parsed, "replacement-markdown")
  };
  const expectedMarkdown = optionalOption(parsed, "expected-markdown");
  if (expectedMarkdown !== void 0) {
    input.expectedMarkdown = expectedMarkdown;
  }
  const result = await executor.execute("record.patch_section", input);
  return ok(json ? `${JSON.stringify(result)}
` : `${JSON.stringify(result)}
`);
}
async function createTask(executor, rest, json) {
  if (executor === void 0) {
    return fail("No Sift API executor is configured for task.create.");
  }
  const parsed = parseOptions(rest);
  const input = {
    title: requireOption(parsed, "title"),
    visibility: [requireOption(parsed, "visibility")]
  };
  const status2 = optionalOption(parsed, "status");
  if (status2 !== void 0) {
    input.status = status2;
  }
  const owner = optionalOption(parsed, "owner");
  if (owner !== void 0) {
    input.owner = owner;
  }
  const dueDate = optionalOption(parsed, "due-date");
  if (dueDate !== void 0) {
    input.dueDate = dueDate;
  }
  const rationale = optionalOption(parsed, "rationale");
  if (rationale !== void 0) {
    input.rationale = rationale;
  }
  addOptionalWorkMetadata(input, parsed);
  const result = await executor.execute("task.create", input);
  return ok(json ? `${JSON.stringify(result)}
` : `${JSON.stringify(result)}
`);
}
async function auditEvents(executor, rest, json) {
  if (executor === void 0) {
    return fail("No Sift API executor is configured for audit.events.");
  }
  const [targetId] = rest;
  const input = {};
  if (targetId !== void 0 && targetId.trim().length > 0) {
    input.targetId = targetId;
  }
  const result = await executor.execute("audit.events", input);
  return ok(json ? `${JSON.stringify(result)}
` : `${JSON.stringify(result)}
`);
}
async function idTool(input) {
  if (input.executor === void 0) {
    return fail(`No Sift API executor is configured for ${input.toolName}.`);
  }
  const [id] = input.rest;
  if (id === void 0 || id.trim().length === 0) {
    return fail(`Missing required ${input.idLabel} for ${input.toolName}.`);
  }
  const result = await input.executor.execute(input.toolName, { [input.inputKey]: id });
  return ok(input.json ? `${JSON.stringify(result)}
` : `${JSON.stringify(result)}
`);
}

// src/auth/configStore.ts
import { mkdir, readFile as readFile3, rm, writeFile, chmod } from "fs/promises";
import { dirname, join as join2 } from "path";
function refreshSlotTokenId(tokenId) {
  return `refresh:${tokenId}`;
}
function resolveSiftConfigPath(input) {
  return join2(input.homeDir, ".sift", "config.json");
}
async function readStoredSiftConfig(input) {
  let raw;
  try {
    raw = await readFile3(resolveSiftConfigPath(input), "utf8");
  } catch (error) {
    if (isNodeError(error) && error.code === "ENOENT") {
      return void 0;
    }
    throw error;
  }
  return parseStoredSiftConfig(JSON.parse(raw));
}
async function writeStoredSiftConfig(input) {
  const config = parseStoredSiftConfig(input.config);
  const path = resolveSiftConfigPath(input);
  await mkdir(dirname(path), { recursive: true, mode: 448 });
  await writeFile(path, `${JSON.stringify(config, null, 2)}
`, { mode: 384 });
  await chmod(path, 384);
}
async function clearStoredSiftConfig(input) {
  await rm(resolveSiftConfigPath(input), { force: true });
}
async function loadCliAuthConfig(input) {
  const envToken = clean(input.env.SIFT_API_TOKEN);
  if (envToken !== void 0) {
    return loadEnvAuth(input.env, envToken);
  }
  const stored = await readStoredSiftConfig({ homeDir: input.homeDir });
  if (stored === void 0) {
    return void 0;
  }
  const profile = stored.profiles[stored.currentProfile];
  if (profile === void 0) {
    throw new Error(`Stored Sift profile '${stored.currentProfile}' was not found.`);
  }
  const tokenKind = profile.tokenKind ?? "legacy";
  const expired = Date.parse(profile.tokenExpiresAt) <= input.now.getTime();
  const token = await resolveStoredToken({
    homeDir: input.homeDir,
    credentialStore: input.credentialStore,
    profile,
    tokenKind,
    expired,
    oauthRefresher: input.oauthRefresher
  });
  return {
    source: "stored",
    tokenKind,
    token,
    config: {
      apiBaseUrl: profile.apiBaseUrl,
      tokenLabel: profile.tokenLabel,
      tokenExpiresAt: profile.tokenExpiresAt,
      workspaceId: profile.workspaceId,
      brainId: profile.brainId,
      principalId: profile.principalId,
      capabilities: [...profile.capabilities]
    }
  };
}
async function resolveStoredToken(input) {
  const { profile } = input;
  if (input.expired && input.tokenKind === "oauth" && profile.refreshable === true && input.oauthRefresher !== void 0) {
    return refreshOAuthToken({
      homeDir: input.homeDir,
      credentialStore: input.credentialStore,
      profile,
      oauthRefresher: input.oauthRefresher
    });
  }
  if (input.expired) {
    throw new Error("Stored Sift CLI auth has expired; run `sift login` again.");
  }
  const token = await input.credentialStore.read({
    apiBaseUrl: profile.apiBaseUrl,
    tokenId: profile.tokenId
  });
  if (token === void 0) {
    throw new Error("Stored Sift credential store secret is missing; run `sift login` again.");
  }
  return token;
}
async function refreshOAuthToken(input) {
  const { profile } = input;
  const refreshToken = await input.credentialStore.read({
    apiBaseUrl: profile.apiBaseUrl,
    tokenId: refreshSlotTokenId(profile.tokenId)
  });
  if (refreshToken === void 0) {
    throw new Error("Stored Sift OAuth refresh token is missing; run `sift login` again.");
  }
  const refreshed = await input.oauthRefresher({
    apiBaseUrl: profile.apiBaseUrl,
    refreshToken
  });
  await input.credentialStore.write({
    apiBaseUrl: profile.apiBaseUrl,
    tokenId: profile.tokenId,
    secret: refreshed.accessToken
  });
  if (refreshed.refreshToken !== void 0) {
    await input.credentialStore.write({
      apiBaseUrl: profile.apiBaseUrl,
      tokenId: refreshSlotTokenId(profile.tokenId),
      secret: refreshed.refreshToken
    });
  }
  const updated = {
    ...profile,
    tokenExpiresAt: refreshed.expiresAt ?? profile.tokenExpiresAt
  };
  await writeStoredSiftConfig({
    homeDir: input.homeDir,
    config: { currentProfile: "default", profiles: { default: updated } }
  });
  return refreshed.accessToken;
}
function loadEnvAuth(env, token) {
  return {
    source: "env",
    token,
    config: {
      apiBaseUrl: requiredEnv(env, "SIFT_API_BASE_URL").replace(/\/+$/u, ""),
      tokenLabel: clean(env.SIFT_TOKEN_LABEL) ?? "env-token",
      tokenExpiresAt: clean(env.SIFT_TOKEN_EXPIRES_AT),
      workspaceId: requiredEnv(env, "SIFT_WORKSPACE_ID"),
      brainId: requiredEnv(env, "SIFT_BRAIN_ID"),
      principalId: requiredEnv(env, "SIFT_PRINCIPAL_ID"),
      capabilities: (clean(env.SIFT_TOKEN_CAPABILITIES) ?? "").split(",").map((item) => item.trim()).filter((item) => item.length > 0)
    }
  };
}
function parseStoredSiftConfig(value) {
  const record = objectValue(value, "config");
  const currentProfile = stringValue(record.currentProfile, "currentProfile");
  const profilesRecord = objectValue(record.profiles, "profiles");
  const profiles = {};
  for (const [name, profileValue] of Object.entries(profilesRecord)) {
    profiles[name] = parseStoredSiftProfile(profileValue);
  }
  if (profiles[currentProfile] === void 0) {
    throw new Error("currentProfile must reference an existing stored profile.");
  }
  return { currentProfile, profiles };
}
function parseStoredSiftProfile(value) {
  const record = objectValue(value, "profile");
  if ("token" in record || "secret" in record || "tokenSecret" in record || "accessToken" in record || "refreshToken" in record) {
    throw new Error("Stored Sift config must not contain token secrets.");
  }
  const profile = {
    apiBaseUrl: stringValue(record.apiBaseUrl, "apiBaseUrl").replace(/\/+$/u, ""),
    appBaseUrl: stringValue(record.appBaseUrl, "appBaseUrl").replace(/\/+$/u, ""),
    workspaceId: stringValue(record.workspaceId, "workspaceId"),
    brainId: stringValue(record.brainId, "brainId"),
    principalId: stringValue(record.principalId, "principalId"),
    tokenId: stringValue(record.tokenId, "tokenId"),
    tokenLabel: stringValue(record.tokenLabel, "tokenLabel"),
    tokenExpiresAt: stringValue(record.tokenExpiresAt, "tokenExpiresAt"),
    capabilities: stringArray(record.capabilities, "capabilities")
  };
  const tokenKind = tokenKindValue(record.tokenKind);
  if (tokenKind !== void 0) {
    profile.tokenKind = tokenKind;
  }
  if (record.refreshable === true) {
    profile.refreshable = true;
  }
  return profile;
}
function tokenKindValue(value) {
  if (value === void 0) return void 0;
  if (value === "legacy" || value === "oauth" || value === "service") {
    return value;
  }
  throw new Error("tokenKind must be one of legacy, oauth, service.");
}
function requiredEnv(env, name) {
  const value = clean(env[name]);
  if (value === void 0) {
    throw new Error(`Missing authenticated CLI scope: ${name}.`);
  }
  return value;
}
function objectValue(value, name) {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error(`${name} must be an object.`);
  }
  return value;
}
function stringValue(value, name) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${name} is required.`);
  }
  return value;
}
function stringArray(value, name) {
  if (!Array.isArray(value) || !value.every((item) => typeof item === "string")) {
    throw new Error(`${name} must be a string array.`);
  }
  return [...value];
}
function clean(value) {
  const trimmed = value?.trim();
  return trimmed === void 0 || trimmed.length === 0 ? void 0 : trimmed;
}
function isNodeError(error) {
  return error instanceof Error && "code" in error;
}

// src/auth/keychainStore.ts
import { execFile } from "child_process";
import { promisify } from "util";
var securityPath = "/usr/bin/security";
var serviceName = "sift-cli";
var execFileAsync = promisify(execFile);
var UnsupportedCredentialStoreError = class extends Error {
  constructor() {
    super(
      "Sift CLI interactive login requires macOS Keychain in this slice. Use SIFT_API_TOKEN for env-token auth on unsupported platforms."
    );
    this.name = "UnsupportedCredentialStoreError";
  }
};
function createMacOSKeychainStore(input = {}) {
  const platform = input.platform ?? process.platform;
  const runCommand = input.runCommand ?? runSecurityCommand;
  async function requireSupported() {
    if (platform !== "darwin") {
      throw new UnsupportedCredentialStoreError();
    }
    await Promise.resolve();
  }
  return {
    async assertAvailable() {
      await requireSupported();
      const result = await runCommand(securityPath, ["list-keychains"]);
      if (result.exitCode !== 0) {
        throw new UnsupportedCredentialStoreError();
      }
    },
    async read(readInput) {
      await requireSupported();
      const result = await runCommand(securityPath, [
        "find-generic-password",
        "-s",
        serviceName,
        "-a",
        account(readInput),
        "-w"
      ]);
      if (result.exitCode !== 0) {
        return void 0;
      }
      const secret = result.stdout.trim();
      return secret.length === 0 ? void 0 : secret;
    },
    async write(writeInput) {
      await requireSupported();
      const result = await runCommand(securityPath, [
        "add-generic-password",
        "-U",
        "-s",
        serviceName,
        "-a",
        account(writeInput),
        "-w",
        writeInput.secret
      ]);
      if (result.exitCode !== 0) {
        throw new Error("Failed to write Sift CLI token secret to macOS Keychain.");
      }
    },
    async delete(deleteInput) {
      await requireSupported();
      await runCommand(securityPath, [
        "delete-generic-password",
        "-s",
        serviceName,
        "-a",
        account(deleteInput)
      ]);
    }
  };
}
async function runSecurityCommand(file, args) {
  try {
    const result = await execFileAsync(file, args);
    return { stdout: result.stdout, stderr: result.stderr, exitCode: 0 };
  } catch (error) {
    if (isExecError(error)) {
      return {
        stdout: typeof error.stdout === "string" ? error.stdout : "",
        stderr: typeof error.stderr === "string" ? error.stderr : "",
        exitCode: typeof error.code === "number" ? error.code : 1
      };
    }
    throw error;
  }
}
function account(input) {
  return `${input.apiBaseUrl}|${input.tokenId}`;
}
function isExecError(error) {
  return error instanceof Error;
}

// src/auth/loginFlow.ts
import { execFile as execFile2 } from "child_process";
import { hostname as hostname3 } from "os";
import { promisify as promisify2 } from "util";

// src/auth/loginHelpers.ts
var DEFAULT_SIFT_API_BASE_URL = "https://sift-wiki-api.fly.dev";
async function resolveLoginApiBaseUrl(input) {
  const options = parseOptions(input.argv);
  const fromFlag = clean2(options.get("api-base-url"));
  if (fromFlag !== void 0) return normalizeUrl(fromFlag);
  const fromEnv = clean2(input.env.SIFT_API_BASE_URL);
  if (fromEnv !== void 0) return normalizeUrl(fromEnv);
  const stored = await readStoredSiftConfig({ homeDir: input.homeDir });
  const profile = stored?.profiles[stored.currentProfile];
  if (profile !== void 0) return normalizeUrl(profile.apiBaseUrl);
  return DEFAULT_SIFT_API_BASE_URL;
}
function requestedCapabilities(rest) {
  const option = parseOptions(rest).get("capability");
  return option === void 0 ? ["record:read"] : option.split(",").map((item) => item.trim()).filter((item) => item.length > 0);
}
function errorMessage2(parsed, status2) {
  if (typeof parsed === "object" && parsed !== null && "error" in parsed) {
    const error = parsed.error;
    if (typeof error === "object" && error !== null && "message" in error) {
      const message = error.message;
      if (typeof message === "string") return message;
    }
  }
  return `CLI auth request failed with status ${status2}.`;
}
function normalizeUrl(value) {
  return value.replace(/\/+$/u, "");
}
function clean2(value) {
  const trimmed = value?.trim();
  return trimmed === void 0 || trimmed.length === 0 ? void 0 : trimmed;
}

// src/auth/oauthConfig.ts
var TRUE_VALUES = /* @__PURE__ */ new Set(["1", "true", "yes", "on"]);
function oauthLoginSelected(input) {
  if (input.argv.includes("--no-oauth")) return false;
  if (input.argv.includes("--oauth")) return true;
  const fromEnv = input.env.SIFT_OAUTH?.trim().toLowerCase();
  return fromEnv !== void 0 && TRUE_VALUES.has(fromEnv);
}
function resolveCliOAuthConfig(input) {
  const options = parseOptions(input.argv);
  const authorizeUrl = clean3(options.get("oauth-authorize-url")) ?? clean3(input.env.SIFT_OAUTH_AUTHORIZE_URL);
  const tokenUrl = clean3(options.get("oauth-token-url")) ?? clean3(input.env.SIFT_OAUTH_TOKEN_URL);
  const clientId = clean3(options.get("oauth-client-id")) ?? clean3(input.env.SIFT_OAUTH_CLIENT_ID);
  if (authorizeUrl === void 0 || tokenUrl === void 0 || clientId === void 0) {
    return void 0;
  }
  const registrationUrl = clean3(options.get("oauth-registration-url")) ?? clean3(input.env.SIFT_OAUTH_REGISTRATION_URL);
  const config = { authorizeUrl, tokenUrl, clientId };
  if (registrationUrl !== void 0) {
    config.registrationUrl = registrationUrl;
  }
  const scopes = parseScopeList(clean3(options.get("oauth-scopes")) ?? clean3(input.env.SIFT_OAUTH_SCOPES));
  if (scopes.length > 0) {
    config.defaultScopes = scopes;
  }
  return config;
}
function scopesForCapabilities(capabilities) {
  const scopes = /* @__PURE__ */ new Set(["read"]);
  for (const capability of capabilities) {
    if (capability.endsWith(":write")) {
      scopes.add("write");
    }
  }
  return [...scopes];
}
function parseScopeList(value) {
  if (value === void 0) return [];
  return value.split(/[\s,]+/u).map((item) => item.trim()).filter((item) => item.length > 0);
}
function clean3(value) {
  const trimmed = value?.trim();
  return trimmed === void 0 || trimmed.length === 0 ? void 0 : trimmed;
}

// src/auth/oauthLoginFlow.ts
import { hostname } from "os";

// src/auth/localCallback.ts
import { createServer } from "http";
async function createLocalCallbackServer() {
  let resolveCallback;
  let rejectCallback;
  const callbackPromise = new Promise((resolve2, reject) => {
    resolveCallback = resolve2;
    rejectCallback = reject;
  });
  const server = createServer((request, response) => {
    try {
      const url = new URL(request.url ?? "/", "http://127.0.0.1");
      const error = url.searchParams.get("error");
      if (error !== null) {
        const description = url.searchParams.get("error_description");
        response.writeHead(400, { "Content-Type": "text/plain" });
        response.end("Sift CLI authorization failed. You can return to the terminal.");
        rejectCallback?.(
          new Error(
            description === null || description.trim().length === 0 ? `Authorization failed: ${error}.` : `Authorization failed: ${error}: ${description}`
          )
        );
        return;
      }
      const code = url.searchParams.get("code");
      const state = url.searchParams.get("state");
      if (code === null || state === null) {
        response.writeHead(400, { "Content-Type": "text/plain" });
        response.end("Missing Sift CLI authorization callback fields.");
        rejectCallback?.(new Error("Missing CLI authorization callback fields."));
        return;
      }
      response.writeHead(200, { "Content-Type": "text/plain" });
      response.end("Sift CLI authorization complete. You can return to the terminal.");
      resolveCallback?.({ code, state });
    } catch (error) {
      rejectCallback?.(error instanceof Error ? error : new Error("Invalid callback."));
    }
  });
  await listen(server);
  const address = server.address();
  if (address === null || typeof address === "string") {
    throw new Error("Failed to bind Sift CLI callback server.");
  }
  return {
    redirectUri: `http://127.0.0.1:${address.port}/callback`,
    waitForCallback: () => callbackPromise,
    close: () => closeServer(server)
  };
}
function listen(server) {
  return new Promise((resolve2, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      server.off("error", reject);
      resolve2();
    });
  });
}
function closeServer(server) {
  return new Promise((resolve2, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
      } else {
        resolve2();
      }
    });
  });
}

// src/auth/pkce.ts
import { createHash as createHash2, randomUUID } from "crypto";
function createPkceState(input = {}) {
  const nextSecret = input.nextSecret ?? (() => randomUUID().replaceAll("-", ""));
  const state = nextSecret();
  const codeVerifier = nextSecret();
  return {
    state,
    stateHash: sha256Hex2(state),
    codeVerifier,
    codeChallenge: sha256Base64Url(codeVerifier)
  };
}
function sha256Hex2(value) {
  return createHash2("sha256").update(value).digest("hex");
}
function sha256Base64Url(value) {
  return createHash2("sha256").update(value).digest("base64url");
}

// src/auth/oauthLoginFlow.ts
async function oauthBrowserLogin(input) {
  await input.credentialStore.assertAvailable();
  const callbackServer = await (input.createCallbackServer ?? createLocalCallbackServer)();
  try {
    const pkce = createPkceState({ nextSecret: input.nextSecret });
    const scopes = mergeScopes(scopesForCapabilities(input.capabilities), input.oauth.defaultScopes);
    const authorizeUrl = buildAuthorizeUrl({
      oauth: input.oauth,
      redirectUri: callbackServer.redirectUri,
      codeChallenge: pkce.codeChallenge,
      state: pkce.state,
      scopes
    });
    await tryOpenBrowser(input.openBrowser, authorizeUrl);
    const callback = await callbackServer.waitForCallback();
    if (callback.state !== pkce.state) {
      throw new Error("OAuth callback state mismatch.");
    }
    const tokens = await exchangeAuthorizationCode({
      oauth: input.oauth,
      fetch: input.fetch,
      code: callback.code,
      codeVerifier: pkce.codeVerifier,
      redirectUri: callbackServer.redirectUri
    });
    return finalizeOAuthLogin(input, tokens);
  } finally {
    await callbackServer.close();
  }
}
async function oauthRefresh(input) {
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: input.refreshToken,
    client_id: input.oauth.clientId
  });
  const tokens = await postForm(input.fetch, input.oauth.tokenUrl, body);
  return toTokenSet(tokens);
}
async function finalizeOAuthLogin(input, tokens) {
  const scope = await input.resolveScope({
    apiBaseUrl: input.apiBaseUrl,
    token: tokens.accessToken,
    fetch: input.fetch
  });
  const profile = {
    apiBaseUrl: input.apiBaseUrl,
    appBaseUrl: input.appBaseUrl,
    workspaceId: scope.workspaceId,
    brainId: scope.brainId,
    principalId: scope.principalId,
    // Synthetic, non-secret slot id so the converged token reuses the same
    // keychain account scheme (apiBaseUrl|tokenId) as the legacy flow.
    tokenId: "oauth",
    tokenLabel: tokens.tokenLabel,
    tokenExpiresAt: tokens.expiresAt ?? farFuture(),
    capabilities: scope.capabilities,
    tokenKind: "oauth",
    refreshable: tokens.refreshToken !== void 0
  };
  const result = { profile, accessToken: tokens.accessToken };
  if (tokens.refreshToken !== void 0) {
    result.refreshToken = tokens.refreshToken;
  }
  return result;
}
function buildAuthorizeUrl(input) {
  const url = new URL(input.oauth.authorizeUrl);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", input.oauth.clientId);
  url.searchParams.set("redirect_uri", input.redirectUri);
  url.searchParams.set("code_challenge", input.codeChallenge);
  url.searchParams.set("code_challenge_method", "S256");
  url.searchParams.set("state", input.state);
  if (input.scopes.length > 0) {
    url.searchParams.set("scope", input.scopes.join(" "));
  }
  return url.toString();
}
async function exchangeAuthorizationCode(input) {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code: input.code,
    redirect_uri: input.redirectUri,
    client_id: input.oauth.clientId,
    code_verifier: input.codeVerifier
  });
  const tokens = await postForm(input.fetch, input.oauth.tokenUrl, body);
  return toTokenSet(tokens);
}
async function postForm(fetchImpl, url, body) {
  const response = await fetchImpl(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json"
    },
    body: body.toString()
  });
  const text = await response.text();
  const parsed = text.length === 0 ? {} : JSON.parse(text);
  if (!response.ok) {
    throw new Error(oauthTokenError(parsed, response.status));
  }
  if (typeof parsed !== "object" || parsed === null) {
    throw new Error("OAuth token endpoint returned a non-object response.");
  }
  return parsed;
}
function toTokenSet(tokens) {
  const accessToken = tokens.access_token;
  if (typeof accessToken !== "string" || accessToken.trim().length === 0) {
    throw new Error("OAuth token endpoint did not return an access token.");
  }
  const set = { accessToken, tokenLabel: oauthTokenLabel() };
  const refreshToken = tokens.refresh_token;
  if (typeof refreshToken === "string" && refreshToken.trim().length > 0) {
    set.refreshToken = refreshToken;
  }
  const expiresAt = expiresAtFrom(tokens.expires_in);
  if (expiresAt !== void 0) {
    set.expiresAt = expiresAt;
  }
  return set;
}
function expiresAtFrom(expiresIn) {
  if (typeof expiresIn !== "number" || !Number.isFinite(expiresIn) || expiresIn <= 0) {
    return void 0;
  }
  return new Date(Date.now() + expiresIn * 1e3).toISOString();
}
function mergeScopes(derived, defaults) {
  const merged = new Set(derived);
  for (const scope of defaults ?? []) {
    merged.add(scope);
  }
  return [...merged];
}
function oauthTokenLabel() {
  const name = hostname().trim();
  return name.length === 0 ? "oauth" : `oauth-${name}`;
}
function farFuture() {
  return new Date(Date.now() + 365 * 24 * 60 * 60 * 1e3).toISOString();
}
async function tryOpenBrowser(openBrowser, url) {
  if (openBrowser === void 0) return;
  await openBrowser(url).catch(() => void 0);
}
function oauthTokenError(parsed, status2) {
  if (typeof parsed === "object" && parsed !== null) {
    const record = parsed;
    const error = typeof record.error === "string" ? record.error : void 0;
    const description = typeof record.error_description === "string" ? record.error_description : void 0;
    if (error !== void 0) {
      return description === void 0 ? `OAuth token request failed: ${error}.` : `OAuth token request failed: ${error}: ${description}`;
    }
  }
  return `OAuth token request failed with status ${status2}.`;
}

// src/auth/serviceTokenLogin.ts
import { hostname as hostname2 } from "os";
async function serviceTokenLogin(input) {
  await input.credentialStore.assertAvailable();
  const callerBearer = await input.resolveCallerBearer();
  if (callerBearer === void 0) {
    throw new Error(
      "Headless login needs an authenticated caller. Set SIFT_API_TOKEN or run 'sift login' once interactively, then retry 'sift login --no-browser'."
    );
  }
  const options = parseOptions(input.rest);
  const requestBody = buildServiceTokenRequest({
    rest: input.rest,
    capabilities: input.capabilities,
    label: options.get("label"),
    workspaceId: options.get("workspace-id"),
    ttlDays: options.get("ttl-days")
  });
  const minted = await postServiceTokenMint(
    input.fetch,
    `${input.apiBaseUrl}/cli-auth/service-token`,
    callerBearer,
    requestBody
  );
  const profile = {
    apiBaseUrl: input.apiBaseUrl,
    appBaseUrl: input.appBaseUrl,
    workspaceId: minted.workspaceId,
    brainId: minted.brainId,
    principalId: minted.principalId,
    tokenId: minted.tokenId,
    tokenLabel: minted.tokenLabel,
    tokenExpiresAt: minted.tokenExpiresAt,
    capabilities: minted.capabilities,
    tokenKind: "service"
  };
  return { profile, token: minted.token };
}
function buildServiceTokenRequest(input) {
  const body = {
    label: clean4(input.label) ?? defaultLabel()
  };
  const workspaceId = clean4(input.workspaceId);
  if (workspaceId !== void 0) {
    body.workspaceId = workspaceId;
  }
  if (capabilityFlagPresent(input.rest)) {
    body.capabilities = input.capabilities;
  }
  const ttlDays = clean4(input.ttlDays);
  if (ttlDays !== void 0) {
    const parsed = Number(ttlDays);
    if (!Number.isInteger(parsed) || parsed <= 0) {
      throw new Error("Option --ttl-days must be a positive integer.");
    }
    body.ttlDays = parsed;
  }
  return body;
}
function capabilityFlagPresent(rest) {
  return rest.includes("--capability");
}
async function postServiceTokenMint(fetchImpl, url, callerBearer, body) {
  const response = await fetchImpl(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${callerBearer}`
    },
    body: JSON.stringify(body)
  });
  const text = await response.text();
  const parsed = text.length === 0 ? {} : JSON.parse(text);
  if (!response.ok) {
    throw new Error(serviceTokenError(parsed, response.status));
  }
  return assertServiceTokenResponse(parsed);
}
function assertServiceTokenResponse(parsed) {
  if (typeof parsed !== "object" || parsed === null) {
    throw new Error("Service-token mint returned a non-object response.");
  }
  const record = parsed;
  return {
    token: requiredString(record.token, "token"),
    tokenId: requiredString(record.tokenId, "tokenId"),
    tokenLabel: requiredString(record.tokenLabel, "tokenLabel"),
    tokenExpiresAt: requiredString(record.tokenExpiresAt, "tokenExpiresAt"),
    workspaceId: requiredString(record.workspaceId, "workspaceId"),
    brainId: requiredString(record.brainId, "brainId"),
    principalId: requiredString(record.principalId, "principalId"),
    capabilities: stringArray2(record.capabilities, "capabilities")
  };
}
function requiredString(value, name) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Service-token mint response missing ${name}.`);
  }
  return value;
}
function stringArray2(value, name) {
  if (!Array.isArray(value) || !value.every((item) => typeof item === "string")) {
    throw new Error(`Service-token mint response field ${name} must be a string array.`);
  }
  return [...value];
}
function serviceTokenError(parsed, status2) {
  if (typeof parsed === "object" && parsed !== null && "error" in parsed) {
    const error = parsed.error;
    if (typeof error === "object" && error !== null && "message" in error) {
      const message = error.message;
      if (typeof message === "string" && message.trim().length > 0) {
        return message;
      }
    }
  }
  return `Service-token mint failed with status ${status2}.`;
}
function defaultLabel() {
  const name = hostname2().trim();
  return name.length === 0 ? "sift-cli-service" : `sift-cli-service-${name}`;
}
function clean4(value) {
  const trimmed = value?.trim();
  return trimmed === void 0 || trimmed.length === 0 ? void 0 : trimmed;
}

// src/auth/convergedLogin.ts
function oauthRefresherFor(input, rest) {
  const oauth = input.oauthConfig ?? resolveCliOAuthConfig({ argv: rest, env: input.env });
  if (oauth === void 0) return void 0;
  return ({ refreshToken }) => oauthRefresh({ oauth, fetch: input.fetch, refreshToken });
}
async function oauthBrowserLoginFlow(input, rest, json) {
  const apiBaseUrl = await resolveLoginApiBaseUrl({ argv: rest, env: input.env, homeDir: input.homeDir });
  const oauth = resolveOAuthConfigOrThrow(input, rest);
  const result = await oauthBrowserLogin({
    apiBaseUrl,
    appBaseUrl: resolveAppBaseUrl(input.env, apiBaseUrl),
    oauth,
    capabilities: requestedCapabilities(rest),
    fetch: input.fetch,
    credentialStore: input.credentialStore,
    ...input.openBrowser === void 0 ? {} : { openBrowser: input.openBrowser },
    ...input.createCallbackServer === void 0 ? {} : { createCallbackServer: input.createCallbackServer },
    resolveScope: input.resolveScope ?? whoamiResolveScope,
    ...input.nextSecret === void 0 ? {} : { nextSecret: input.nextSecret }
  });
  return persistConvergedLogin(
    input,
    {
      profile: result.profile,
      accessToken: result.accessToken,
      ...result.refreshToken === void 0 ? {} : { refreshToken: result.refreshToken }
    },
    json
  );
}
async function serviceTokenLoginFlow(input, rest, json) {
  const apiBaseUrl = await resolveLoginApiBaseUrl({ argv: rest, env: input.env, homeDir: input.homeDir });
  const result = await serviceTokenLogin({
    apiBaseUrl,
    appBaseUrl: resolveAppBaseUrl(input.env, apiBaseUrl),
    rest,
    capabilities: requestedCapabilities(rest),
    fetch: input.fetch,
    credentialStore: input.credentialStore,
    resolveCallerBearer: defaultCallerBearerResolver(input)
  });
  return persistConvergedLogin(input, { profile: result.profile, accessToken: result.token }, json);
}
function resolveOAuthConfigOrThrow(input, rest) {
  const oauth = input.oauthConfig ?? resolveCliOAuthConfig({ argv: rest, env: input.env });
  if (oauth === void 0) {
    throw new Error(
      "OAuth login is not yet enabled. Set SIFT_OAUTH_AUTHORIZE_URL, SIFT_OAUTH_TOKEN_URL, and SIFT_OAUTH_CLIENT_ID, or omit --oauth to use the default sign-in."
    );
  }
  return oauth;
}
function defaultCallerBearerResolver(input) {
  return async () => {
    const envToken = clean2(input.env.SIFT_API_TOKEN);
    if (envToken !== void 0) return envToken;
    const stored = await readStoredSiftConfig({ homeDir: input.homeDir });
    const profile = stored?.profiles[stored.currentProfile];
    if (profile === void 0) return void 0;
    return input.credentialStore.read({
      apiBaseUrl: profile.apiBaseUrl,
      tokenId: profile.tokenId
    });
  };
}
var whoamiResolveScope = async ({ apiBaseUrl, token, fetch: fetchImpl }) => {
  const response = await fetchImpl(`${apiBaseUrl}/agent-tools/whoami`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ input: {} })
  });
  const text = await response.text();
  const parsed = text.length === 0 ? {} : JSON.parse(text);
  if (!response.ok) {
    throw new Error(errorMessage2(parsed, response.status));
  }
  return whoamiScopeFrom(parsed);
};
function whoamiScopeFrom(parsed) {
  if (typeof parsed !== "object" || parsed === null) {
    throw new Error("whoami returned a non-object response.");
  }
  const record = parsed;
  const principalId = nestedString(record.principal, "id");
  const workspaceId = nestedString(record.scope, "workspaceId");
  const brainId = nestedString(record.scope, "brainId");
  if (principalId === void 0 || workspaceId === void 0 || brainId === void 0) {
    throw new Error("whoami response is missing principal or scope fields.");
  }
  const capabilities = Array.isArray(record.capabilities) ? record.capabilities.filter((item) => typeof item === "string") : [];
  return { principalId, workspaceId, brainId, capabilities };
}
function nestedString(parent, key) {
  if (typeof parent !== "object" || parent === null) return void 0;
  const value = parent[key];
  return typeof value === "string" && value.length > 0 ? value : void 0;
}
function resolveAppBaseUrl(env, apiBaseUrl) {
  const fromEnv = clean2(env.SIFT_APP_BASE_URL);
  if (fromEnv !== void 0) return normalizeUrl(fromEnv);
  return apiBaseUrl.replace(/\/\/api\./u, "//");
}
async function persistConvergedLogin(input, result, json) {
  const { profile } = result;
  try {
    await input.credentialStore.write({
      apiBaseUrl: profile.apiBaseUrl,
      tokenId: profile.tokenId,
      secret: result.accessToken
    });
    if (result.refreshToken !== void 0) {
      await input.credentialStore.write({
        apiBaseUrl: profile.apiBaseUrl,
        tokenId: refreshSlotTokenId(profile.tokenId),
        secret: result.refreshToken
      });
    }
  } catch (error) {
    return fail(
      `Sift CLI login storage failure: ${error instanceof Error ? error.message : "credential store write failed"}`
    );
  }
  await writeStoredSiftConfig({
    homeDir: input.homeDir,
    config: { currentProfile: "default", profiles: { default: profile } }
  });
  const scope = {
    apiBaseUrl: profile.apiBaseUrl,
    tokenLabel: profile.tokenLabel,
    tokenExpiresAt: profile.tokenExpiresAt,
    principalId: profile.principalId,
    workspaceId: profile.workspaceId,
    brainId: profile.brainId,
    capabilities: profile.capabilities
  };
  return ok(json ? `${JSON.stringify(scope)}
` : `Authenticated Sift CLI
${renderScope(scope)}`);
}

// src/auth/loginFlow.ts
var execFileAsync2 = promisify2(execFile2);
function createSiftCliAuthCommands(input) {
  const now = input.now ?? (() => /* @__PURE__ */ new Date());
  const sleep = input.sleep ?? ((ms) => new Promise((resolve2) => setTimeout(resolve2, ms)));
  return {
    async login({ rest, json }) {
      try {
        return await routeLogin(input, rest, sleep, json);
      } catch (error) {
        return json ? failJson(error instanceof Error ? error.message : "Login failed.") : fail(error instanceof Error ? error.message : "Login failed.");
      }
    },
    async status({ json }) {
      return authStatus(input, now(), json);
    },
    async logout({ json }) {
      return logout(input, now(), json);
    },
    async loadAuth() {
      return loadCliAuthConfig({
        env: input.env,
        homeDir: input.homeDir,
        credentialStore: input.credentialStore,
        now: now(),
        oauthRefresher: oauthRefresherFor(input, [])
      });
    }
  };
}
async function routeLogin(input, rest, sleep, json) {
  const noBrowser = rest.includes("--no-browser");
  if (oauthLoginSelected({ argv: rest, env: input.env })) {
    return noBrowser ? serviceTokenLoginFlow(input, rest, json) : oauthBrowserLoginFlow(input, rest, json);
  }
  return noBrowser ? deviceLogin(input, rest, sleep, json) : browserLogin(input, rest, json);
}
async function browserLogin(input, rest, json) {
  await input.credentialStore.assertAvailable();
  const apiBaseUrl = await resolveLoginApiBaseUrl({ argv: rest, env: input.env, homeDir: input.homeDir });
  const callbackServer = await (input.createCallbackServer ?? createLocalCallbackServer)();
  try {
    const pkce = createPkceState({ nextSecret: input.nextSecret });
    const request = await postJson(input.fetch, `${apiBaseUrl}/cli-auth/requests`, {
      mode: "browser",
      redirectUri: callbackServer.redirectUri,
      codeChallenge: pkce.codeChallenge,
      codeChallengeMethod: "S256",
      stateHash: pkce.stateHash,
      deviceLabel: input.deviceLabel ?? hostname3(),
      requestedCapabilities: requestedCapabilities(rest)
    });
    await tryOpenBrowser2(input.openBrowser, request.authorizeUrl);
    const callback = await callbackServer.waitForCallback();
    if (callback.state !== pkce.stateHash) {
      throw new Error("CLI auth callback state mismatch.");
    }
    const token = await postJson(input.fetch, `${apiBaseUrl}/cli-auth/token`, {
      requestId: request.requestId,
      code: callback.code,
      codeVerifier: pkce.codeVerifier,
      state: pkce.state
    });
    return persistLogin(input, token, json);
  } finally {
    await callbackServer.close();
  }
}
async function deviceLogin(input, rest, sleep, json) {
  await input.credentialStore.assertAvailable();
  const apiBaseUrl = await resolveLoginApiBaseUrl({ argv: rest, env: input.env, homeDir: input.homeDir });
  const request = await postJson(input.fetch, `${apiBaseUrl}/cli-auth/device`, {
    deviceLabel: input.deviceLabel ?? hostname3(),
    requestedCapabilities: requestedCapabilities(rest)
  });
  let intervalSeconds = request.intervalSeconds;
  for (; ; ) {
    await sleep(intervalSeconds * 1e3);
    const token = await postJson(
      input.fetch,
      `${apiBaseUrl}/cli-auth/device/token`,
      { requestId: request.requestId, userCode: request.userCode }
    );
    if ("token" in token) {
      const result = await persistLogin(input, token, json);
      return result.exitCode === 0 ? { ...result, stdout: `Code: ${request.userCode}
${result.stdout}` } : result;
    }
    if (token.status === "authorization_pending" || token.status === "slow_down") {
      intervalSeconds = token.intervalSeconds;
      continue;
    }
    throw new Error(`Device authorization failed: ${token.status}.`);
  }
}
async function persistLogin(input, token, json) {
  const oldConfig = await readStoredSiftConfig({ homeDir: input.homeDir });
  const oldProfile = oldConfig?.profiles[oldConfig.currentProfile];
  try {
    await input.credentialStore.write({
      apiBaseUrl: token.apiBaseUrl,
      tokenId: token.tokenId,
      secret: token.token
    });
  } catch (error) {
    await revokeToken(input.fetch, token.apiBaseUrl, token.token).catch(() => void 0);
    return fail(
      `Sift CLI login storage failure: ${error instanceof Error ? error.message : "credential store write failed"}`
    );
  }
  const config = configFromToken(token);
  await writeStoredSiftConfig({ homeDir: input.homeDir, config });
  if (oldProfile !== void 0) {
    const oldSecret = await input.credentialStore.read({
      apiBaseUrl: oldProfile.apiBaseUrl,
      tokenId: oldProfile.tokenId
    });
    if (oldSecret !== void 0) {
      await revokeToken(input.fetch, oldProfile.apiBaseUrl, oldSecret).catch(() => void 0);
    }
  }
  const scope = {
    apiBaseUrl: token.apiBaseUrl,
    tokenLabel: token.tokenLabel,
    tokenExpiresAt: token.tokenExpiresAt,
    principalId: token.principalId,
    workspaceId: token.workspaceId,
    brainId: token.brainId,
    capabilities: token.capabilities
  };
  return ok(json ? `${JSON.stringify(scope)}
` : `Authenticated Sift CLI
${renderScope(scope)}`);
}
async function authStatus(input, now, json) {
  const envToken = clean2(input.env.SIFT_API_TOKEN);
  if (envToken !== void 0) {
    const loaded = await loadCliAuthConfig({
      env: input.env,
      homeDir: input.homeDir,
      credentialStore: input.credentialStore,
      now
    });
    return okStatus("env", loaded, json);
  }
  const stored = await readStoredSiftConfig({ homeDir: input.homeDir });
  const profile = stored?.profiles[stored.currentProfile];
  if (profile === void 0) {
    return ok(json ? '{"auth":"none"}\n' : "Auth: none\n");
  }
  const expired = Date.parse(profile.tokenExpiresAt) <= now.getTime();
  if (expired) {
    return staleStoredStatus(
      profile,
      "expired",
      "Stored Sift CLI auth has expired; run `sift login` again.",
      json
    );
  }
  let secret;
  try {
    secret = await input.credentialStore.read({
      apiBaseUrl: profile.apiBaseUrl,
      tokenId: profile.tokenId
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Stored Sift credential store could not be read; run `sift login` again.";
    return staleStoredStatus(profile, "credential_store_unavailable", message, json);
  }
  if (secret === void 0) {
    return staleStoredStatus(
      profile,
      "credential_missing",
      "Stored Sift credential store secret is missing; run `sift login` again.",
      json
    );
  }
  return ok(
    json ? `${JSON.stringify({ auth: "stored", ...profile })}
` : [
      "Auth: stored",
      `API: ${profile.apiBaseUrl}`,
      `Token: ${profile.tokenLabel}`,
      `Principal: ${profile.principalId}`,
      `Workspace: ${profile.workspaceId}`,
      `Brain: ${profile.brainId}`,
      `Capabilities: ${profile.capabilities.join(", ")}`,
      ""
    ].join("\n")
  );
}
function staleStoredStatus(profile, reason, message, json) {
  if (json) {
    return ok(
      `${JSON.stringify({ auth: "stored", status: "stale", reason, message, ...profile })}
`
    );
  }
  return ok(
    [
      "Auth: stale",
      `Reason: ${reason}`,
      message,
      `API: ${profile.apiBaseUrl}`,
      `Token: ${profile.tokenLabel}`,
      ""
    ].join("\n")
  );
}
async function logout(input, now, json) {
  if (clean2(input.env.SIFT_API_TOKEN) !== void 0) {
    return ok(json ? '{"status":"env_auth_active"}\n' : "Auth: env\nUnset SIFT_API_TOKEN to log out.\n");
  }
  const stored = await readStoredSiftConfig({ homeDir: input.homeDir });
  const profile = stored?.profiles[stored.currentProfile];
  if (profile === void 0) {
    return ok(json ? '{"status":"not_logged_in"}\n' : "Not logged in.\n");
  }
  const secret = await input.credentialStore.read({
    apiBaseUrl: profile.apiBaseUrl,
    tokenId: profile.tokenId
  });
  let revoked = false;
  if (secret !== void 0) {
    revoked = await revokeToken(input.fetch, profile.apiBaseUrl, secret).then(() => true).catch(() => false);
  }
  await input.credentialStore.delete({ apiBaseUrl: profile.apiBaseUrl, tokenId: profile.tokenId });
  await clearStoredSiftConfig({ homeDir: input.homeDir });
  const message = revoked ? "Logged out of Sift CLI." : `Logged out locally. Remote revoke was not confirmed; revoke from ${profile.appBaseUrl}.`;
  return ok(json ? `${JSON.stringify({ status: "logged_out", remoteRevoked: revoked, at: now.toISOString() })}
` : `${message}
`);
}
function okStatus(source, loaded, json) {
  if (loaded === void 0) {
    return ok(json ? '{"auth":"none"}\n' : "Auth: none\n");
  }
  return ok(
    json ? `${JSON.stringify({ auth: source, ...loaded.config })}
` : `Auth: ${source}
${renderScope(loaded.config)}`
  );
}
function configFromToken(token) {
  return {
    currentProfile: "default",
    profiles: {
      default: {
        apiBaseUrl: token.apiBaseUrl,
        appBaseUrl: token.appBaseUrl,
        workspaceId: token.workspaceId,
        brainId: token.brainId,
        principalId: token.principalId,
        tokenId: token.tokenId,
        tokenLabel: token.tokenLabel,
        tokenExpiresAt: token.tokenExpiresAt,
        capabilities: [...token.capabilities]
      }
    }
  };
}
async function tryOpenBrowser2(openBrowser, url) {
  await (openBrowser ?? openBrowserUrl)(url).catch(() => void 0);
}
async function openBrowserUrl(url) {
  if (process.platform === "darwin") {
    await execFileAsync2("open", [url]);
    return;
  }
  if (process.platform === "win32") {
    await execFileAsync2("cmd", ["/c", "start", "", url]);
    return;
  }
  await execFileAsync2("xdg-open", [url]);
}
async function revokeToken(fetchImpl, apiBaseUrl, token) {
  await postJson(fetchImpl, `${apiBaseUrl}/cli-auth/revoke`, {}, { Authorization: `Bearer ${token}` });
}
async function postJson(fetchImpl, url, body, headers = {}) {
  const response = await fetchImpl(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body)
  });
  const text = await response.text();
  const parsed = text.length === 0 ? {} : JSON.parse(text);
  if (!response.ok) {
    throw new Error(errorMessage2(parsed, response.status));
  }
  return parsed;
}
function failJson(message) {
  return {
    exitCode: 1,
    stdout: `${JSON.stringify({ error: { code: "auth_failed", message } })}
`,
    stderr: ""
  };
}

// src/roamMcpReader.ts
import { spawn } from "child_process";
function createRoamMcpReader(input = {}) {
  return {
    async exportPages(request) {
      const client = createRoamMcpJsonLineClient({
        command: input.command ?? "npx",
        args: input.args ?? ["-y", "@roam-research/roam-mcp"],
        spawnProcess: input.spawnProcess ?? spawn
      });
      try {
        return await exportRoamPagesFromMcp(client, request);
      } finally {
        await client.close();
      }
    }
  };
}
async function exportRoamPagesFromMcp(client, input) {
  const graphId = await resolveGraphId(client, input.graph);
  await client.callTool("get_graph_guidelines", graphArgs(graphId)).catch(() => void 0);
  const tuples = input.scope === "sift_tag" ? await queryMarkedPageTuples(client, graphId, input.limit) : await queryWholeGraphPageTuples(client, graphId, input.limit);
  const records = [];
  const seen = /* @__PURE__ */ new Set();
  for (const tuple of tuples) {
    const key = tuple.uid ?? tuple.title;
    if (seen.has(key)) continue;
    seen.add(key);
    const markdown = await fetchPageMarkdown(client, graphId, tuple);
    records.push({
      graphId,
      pageUid: tuple.uid ?? stableFallbackUid(tuple.title),
      pageTitle: tuple.title,
      markdown,
      scope: input.scope,
      blockCount: estimateBlockCount(markdown),
      importedAt: input.now.toISOString()
    });
  }
  return records;
}
async function resolveGraphId(client, graph) {
  if (graph !== void 0) return graph;
  const result = await client.callTool("list_graphs", {});
  const parsed = parseToolJson(result);
  const graphId = firstGraphId(parsed);
  if (graphId !== void 0) return graphId;
  const message = errorMessageFromParsedTool(parsed);
  if (message !== void 0) throw new Error(message);
  return "local-graph";
}
async function queryMarkedPageTuples(client, graphId, limit) {
  const result = await client.callTool("datalog_query", {
    ...graphArgs(graphId),
    query: '[:find ?title ?uid :where [?tag :node/title "Sift"] [?block :block/refs ?tag] [?block :block/page ?page] [?page :node/title ?title] [?page :block/uid ?uid]]'
  });
  return tuplesFromToolResult(result).slice(0, limit);
}
async function queryWholeGraphPageTuples(client, graphId, limit) {
  const result = await client.callTool("datalog_query", {
    ...graphArgs(graphId),
    query: "[:find ?title ?uid :where [?page :node/title ?title] [?page :block/uid ?uid]]"
  });
  return tuplesFromToolResult(result).slice(0, limit);
}
async function fetchPageMarkdown(client, graphId, tuple) {
  const result = await client.callTool("get_page", {
    ...graphArgs(graphId),
    ...tuple.uid === void 0 ? { title: tuple.title } : { uid: tuple.uid }
  });
  const text = toolText(result);
  const parsed = parseJsonIfPossible(text);
  const markdown = markdownFromParsed(parsed) ?? text;
  return stripRoamMetadataTags(markdown).trim();
}
function graphArgs(graphId) {
  return { graph: graphId };
}
function tuplesFromToolResult(result) {
  const parsed = parseToolJson(result);
  const values = candidateArrays(parsed);
  const tuples = [];
  for (const value of values) {
    if (Array.isArray(value) && typeof value[0] === "string") {
      tuples.push({ title: value[0], ...typeof value[1] === "string" ? { uid: value[1] } : {} });
    } else if (isRecord(value)) {
      const title = stringProperty(value, ["title", "pageTitle", "name"]);
      const uid = stringProperty(value, ["uid", "pageUid"]);
      if (title !== void 0) tuples.push({ title, ...uid === void 0 ? {} : { uid } });
    }
  }
  return tuples;
}
function parseToolJson(result) {
  const text = toolText(result);
  return parseJsonIfPossible(text);
}
function toolText(result) {
  if (isRecord(result) && Array.isArray(result.content)) {
    return result.content.flatMap((item) => isRecord(item) && typeof item.text === "string" ? [item.text] : []).join("\n").trim();
  }
  return typeof result === "string" ? result : JSON.stringify(result);
}
function parseJsonIfPossible(text) {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
function candidateArrays(value) {
  if (Array.isArray(value)) return value;
  if (!isRecord(value)) return [];
  for (const key of ["results", "result", "data", "rows", "pages"]) {
    const candidate = value[key];
    if (Array.isArray(candidate)) return candidate;
  }
  return [];
}
function markdownFromParsed(value) {
  if (typeof value === "string") return value;
  if (!isRecord(value)) return void 0;
  return stringProperty(value, ["markdown", "content", "text"]);
}
function firstGraphId(value) {
  const graphs = isRecord(value) && Array.isArray(value.graphs) ? value.graphs : candidateArrays(value);
  for (const graph of graphs) {
    if (!isRecord(graph)) continue;
    const id = stringProperty(graph, ["nickname", "graph", "name", "id"]);
    if (id !== void 0) return id;
  }
  return void 0;
}
function errorMessageFromParsedTool(value) {
  if (!isRecord(value) || !isRecord(value.error)) return void 0;
  const message = value.error.message;
  return typeof message === "string" ? message : void 0;
}
function stringProperty(record, keys) {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim().length > 0) return value;
  }
  return void 0;
}
function stripRoamMetadataTags(markdown) {
  return markdown.replace(/<roam\b[^>]*>/giu, "").replace(/<\/roam>/giu, "");
}
function estimateBlockCount(markdown) {
  const lines = markdown.split("\n").map((line) => line.trim()).filter((line) => line.length > 0);
  return Math.max(1, lines.length);
}
function stableFallbackUid(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/gu, "-").replace(/^-+|-+$/gu, "").slice(0, 80);
}
function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function createRoamMcpJsonLineClient(input) {
  const child = input.spawnProcess(input.command, input.args, {
    stdio: ["pipe", "pipe", "pipe"]
  });
  child.stderr.resume();
  child.stdout.setEncoding("utf8");
  let nextId = 1;
  let buffer = "";
  const pending = /* @__PURE__ */ new Map();
  child.stdout.on("data", (chunk) => {
    buffer += chunk;
    let newline = buffer.indexOf("\n");
    while (newline >= 0) {
      const line = buffer.slice(0, newline).trim();
      buffer = buffer.slice(newline + 1);
      if (line.length > 0) handleJsonRpcLine(line, pending);
      newline = buffer.indexOf("\n");
    }
  });
  child.on("error", (error) => {
    for (const entry of pending.values()) entry.reject(error);
    pending.clear();
  });
  child.on("exit", () => {
    for (const entry of pending.values()) entry.reject(new Error("Roam MCP server exited."));
    pending.clear();
  });
  const request = (method, params) => {
    const id = nextId;
    nextId += 1;
    const promise = new Promise((resolve2, reject) => {
      pending.set(id, { resolve: resolve2, reject });
    });
    child.stdin.write(`${JSON.stringify({ jsonrpc: "2.0", id, method, params })}
`);
    return promise;
  };
  const initialized = request("initialize", {
    protocolVersion: "2025-11-25",
    capabilities: {},
    clientInfo: { name: "sift-roam-import", version: "0.1.0" }
  }).then(() => {
    child.stdin.write(
      `${JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" })}
`
    );
  });
  return {
    async callTool(name, args) {
      await initialized;
      return request("tools/call", { name, arguments: args });
    },
    async close() {
      child.stdin.end();
      child.kill("SIGTERM");
    }
  };
}
function handleJsonRpcLine(line, pending) {
  let parsed;
  try {
    parsed = JSON.parse(line);
  } catch {
    return;
  }
  if (typeof parsed.id !== "number") return;
  const entry = pending.get(parsed.id);
  if (entry === void 0) return;
  pending.delete(parsed.id);
  if (parsed.error !== void 0) {
    entry.reject(
      new Error(
        typeof parsed.error.message === "string" ? parsed.error.message : "Roam MCP error."
      )
    );
    return;
  }
  entry.resolve(parsed.result);
}

// src/bin/sift.ts
var credentialStore = createMacOSKeychainStore();
var authCommands = createSiftCliAuthCommands({
  env: process.env,
  homeDir: process.env.HOME ?? process.cwd(),
  credentialStore,
  fetch
});
var { argv, agentName } = extractAgentName(process.argv.slice(2), process.env.SIFT_AGENT);
var startupAuth = await loadAuthForStartup(authCommands, argv);
if (startupAuth.ok === false) {
  process.stderr.write(`${startupAuth.message}
`);
  process.exitCode = 1;
} else {
  const loadedAuth = startupAuth.loadedAuth;
  const config = loadedAuth?.config ?? {
    apiBaseUrl: "",
    tokenLabel: "unset",
    workspaceId: "",
    brainId: "",
    principalId: "",
    capabilities: []
  };
  const result = await runSiftCli({
    argv,
    config,
    readStdin,
    agentName,
    executor: loadedAuth === void 0 ? void 0 : createHostedApiExecutor({
      apiBaseUrl: loadedAuth.config.apiBaseUrl,
      token: loadedAuth.token,
      workspaceId: loadedAuth.config.workspaceId,
      brainId: loadedAuth.config.brainId,
      agentName
    }),
    roamReader: createRoamMcpReader(),
    roamImporter: loadedAuth === void 0 ? void 0 : createSiftRoamImportClient({
      apiBaseUrl: loadedAuth.config.apiBaseUrl,
      token: loadedAuth.token,
      workspaceId: loadedAuth.config.workspaceId
    }),
    authCommands,
    mcpServer: {
      serve: async ({ config: config2, executor }) => {
        if (executor === void 0) {
          throw new Error(
            "Not signed in. Run 'sift login' to authenticate, then 'sift mcp serve' to start the local MCP server."
          );
        }
        const { createLocalMcpStdioServer: createLocalMcpStdioServer2 } = await Promise.resolve().then(() => (init_dist(), dist_exports));
        return createLocalMcpStdioServer2({
          input: process.stdin,
          output: process.stdout,
          error: process.stderr
        }).serve({
          capabilities: config2.capabilities,
          executor
        });
      }
    }
  });
  process.stdout.write(result.stdout);
  process.stderr.write(result.stderr);
  process.exitCode = result.exitCode;
}
async function loadAuthForStartup(commands, args) {
  try {
    const loadedAuth = await commands.loadAuth();
    if (loadedAuth === void 0 && !canRunWithoutLoadedAuth(args)) {
      return { ok: false, message: missingAuthMessage(args) };
    }
    return { ok: true, loadedAuth };
  } catch (error) {
    if (canRunWithoutLoadedAuth(args)) {
      return { ok: true, loadedAuth: void 0 };
    }
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Failed to load Sift CLI auth."
    };
  }
}
function missingAuthMessage(args) {
  const commandArgs = args.filter((arg) => arg !== "--json");
  const [group, command] = commandArgs;
  const capability = group === "roam" && command === "import" ? " --capability record:read,source:manage" : "";
  return `Not signed in. Run 'npx -y @sift-wiki/cli@latest login --api-base-url ${DEFAULT_SIFT_API_BASE_URL}${capability}', then retry this command.`;
}
function canRunWithoutLoadedAuth(args) {
  const commandArgs = args.filter((arg) => arg !== "--json");
  const [group, command] = commandArgs;
  return group === void 0 || group === "help" || group === "--help" || group === "doctor" || group === "skill" || group === "login" || group === "logout" || group === "auth" && command === "status";
}
function extractAgentName(args, envAgentName) {
  const flagIndex = args.indexOf("--as-agent");
  if (flagIndex !== -1 && args[flagIndex + 1] !== void 0) {
    const name = args[flagIndex + 1];
    return {
      argv: [...args.slice(0, flagIndex), ...args.slice(flagIndex + 2)],
      agentName: name
    };
  }
  const env = envAgentName?.trim();
  return { argv: args, agentName: env === void 0 || env.length === 0 ? void 0 : env };
}
async function readStdin() {
  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk)));
  }
  return Buffer.concat(chunks).toString("utf8");
}
