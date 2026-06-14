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
  const result2 = {
    intent: requireString(input, "intent")
  };
  if (input.toolsetNames !== void 0) {
    result2.toolsetNames = requireStringArray(input, "toolsetNames");
  }
  if (input.limit !== void 0) {
    const limit = optionalInteger(input, "limit");
    if (limit === void 0 || limit < 1 || limit > 20) {
      throw new Error("limit must be an integer between 1 and 20.");
    }
    result2.limit = limit;
  }
  return result2;
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
    cliExample,
    hostedAgent: options?.hostedAgent
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
    idempotency: input.mutability === "write" ? "recommended" : "none",
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
  const [prefix] = name.split(".");
  switch (prefix) {
    case "decision":
    case "task":
      return ["work"];
    case "skill":
      return ["brain", "work"];
    case "record":
    case "source":
    case "capture":
    case "ingestion":
      return ["brain", "ingestion"];
    case "search":
    case "context":
    case "evidence":
    case "graph":
      return ["brain", "retrieval"];
    case "tools":
      return ["registry"];
    case "audit":
    case "event":
      return ["audit"];
    default:
      return ["brain"];
  }
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
var readTransports, writeTransports, NO_CAPABILITY, toolDefinitions;
var init_registry = __esm({
  "../tools/dist/registry.js"() {
    "use strict";
    init_gating();
    init_canvasTools();
    init_inputParsers();
    readTransports = ["cli", "hosted_mcp", "local_mcp"];
    writeTransports = ["cli", "hosted_mcp", "local_mcp"];
    NO_CAPABILITY = "none";
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
      readTool("search.query", "Search authorized brain context and return cited results.", {
        query: { type: "string" },
        limit: { type: "integer", minimum: 1, maximum: 20 }
      }, "sift search query 'launch risks'"),
      readTool("context.assemble", "Assemble compact cited context for an agent.", { query: { type: "string" }, maxChars: { type: "integer", minimum: 1 } }, "sift context assemble 'launch risks'", {
        hostedAgent: {
          toolsets: ["brain", "retrieval"],
          searchTerms: ["context", "cite", "answer", "evidence"]
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
function captureResult(result2) {
  return {
    status: result2.job?.status ?? result2.status ?? "captured",
    jobId: result2.job?.id,
    sourceId: result2.sourceId,
    sourceItemId: result2.sourceItemId,
    recordId: result2.recordId,
    versionId: result2.versionId,
    versionNumber: result2.versionNumber
  };
}
function workRecordResult(result2) {
  return {
    status: result2.job.status,
    jobId: result2.job.id,
    recordId: result2.recordId,
    versionId: result2.versionId,
    versionNumber: result2.versionNumber
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
  const result2 = await input.service.ingestText({ auth: input.auth, ...capture });
  return captureResult(result2);
}
async function executeCaptureFile(input, toolInput) {
  if (input.service.ingestFile === void 0) {
    throw new Error("Tool 'capture.file' requires a file ingestion service contract.");
  }
  const file = parseCaptureFile(toolInput);
  const result2 = await input.service.ingestFile({ auth: input.auth, ...file });
  return captureResult(result2);
}
async function executeCaptureBatch(input, toolInput) {
  const batch = parseCaptureBatch(toolInput);
  const results = [];
  for (const item of batch.items) {
    if (item.kind === "text") {
      const { kind: _kind2, ...capture } = item;
      const result3 = await input.service.ingestText({ auth: input.auth, ...capture });
      results.push(captureResult(result3));
      continue;
    }
    if (input.service.ingestFile === void 0) {
      throw new Error("Tool 'capture.batch' requires a file ingestion service contract.");
    }
    const { kind: _kind, ...file } = item;
    const result2 = await input.service.ingestFile({ auth: input.auth, ...file });
    results.push(captureResult(result2));
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
    }
  };
}
function skillToolAvailability(service) {
  return [
    [service.resolveSkills !== void 0, ["skill.resolve"]],
    [service.getSkill !== void 0, ["skill.get"]],
    [service.getSkillFile !== void 0, ["skill.file"]],
    [service.recordSkillExercise !== void 0, ["skill.exercise"]],
    [service.teachSkill !== void 0, ["skill.teach"]]
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
    [service.listAuditEvents !== void 0, ["audit.events"]]
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
        const result2 = await handler();
        logToolCall({
          auth: input.auth,
          onToolLog: input.onToolLog,
          operation: name,
          toolInput,
          status: "success",
          startedAt,
          result: result2
        });
        return result2;
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
  return input.service.retrieveCitedContext({
    auth: input.auth,
    query: query.query,
    limit: 8,
    maxChars: query.maxChars
  });
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
  const result2 = await input.service.createDecision({ auth: input.auth, ...decision });
  return workRecordResult(result2);
}
async function executeTaskCreate(input, toolInput) {
  if (input.service.createTask === void 0) {
    throw new Error("Tool 'task.create' requires a work-record service contract.");
  }
  const task = parseTask(toolInput);
  const result2 = await input.service.createTask({ auth: input.auth, ...task });
  return workRecordResult(result2);
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
  const result2 = await input.service.createMarkdownRecord({ auth: input.auth, ...record });
  return workRecordResult(result2);
}
async function executeRecordPatchSection(input, toolInput) {
  if (input.service.patchRecordSection === void 0) {
    throw new Error("Tool 'record.patch_section' requires a record write service contract.");
  }
  const patch = parseRecordSectionPatch(toolInput);
  const result2 = await input.service.patchRecordSection({ auth: input.auth, ...patch });
  return workRecordResult(result2);
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
  const available = listToolDefinitions().filter((tool) => availableNameSet.has(tool.name) && tool.transports.includes(input.transport) && input.capabilities.includes(tool.capability));
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
        const result2 = await input.executor.execute(call.name, call.arguments);
        return {
          isError: false,
          structuredContent: result2,
          content: [{ type: "text", text: renderToolResult(result2) }]
        };
      } catch (error) {
        return errorResult2(classifyToolError(error), messageForError(error));
      }
    }
  };
}
function renderToolResult(result2) {
  if (typeof result2 === "object" && result2 !== null && "contextMarkdown" in result2) {
    const context = result2;
    if (typeof context.contextMarkdown === "string") {
      return context.contextMarkdown;
    }
  }
  return JSON.stringify(result2);
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

// ../tools/dist/localMcpStdioServer.js
function createLocalMcpStdioServer(input) {
  return {
    async serve(serverInput) {
      const adapter = createMcpAdapter({
        transport: "local_mcp",
        capabilities: serverInput.capabilities,
        executor: serverInput.executor
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
            await handleLine(line, adapter, input.output, input.error);
          }
          newline = buffer.indexOf("\n");
        }
      }
      const trailing = buffer.trim();
      if (trailing.length > 0) {
        await handleLine(trailing, adapter, input.output, input.error);
      }
    }
  };
}
async function handleLine(line, adapter, output, error) {
  let message;
  try {
    message = JSON.parse(line);
  } catch {
    writeResponse(output, {
      jsonrpc: "2.0",
      id: null,
      error: { code: -32700, message: "Parse error" }
    });
    return;
  }
  if (message.id === void 0) {
    if (message.method === "notifications/initialized")
      return;
    error?.write(`Ignoring MCP notification '${String(message.method)}'.
`);
    return;
  }
  const id = normalizeId(message.id);
  if (message.jsonrpc !== "2.0" || typeof message.method !== "string") {
    writeResponse(output, {
      jsonrpc: "2.0",
      id,
      error: { code: -32600, message: "Invalid Request" }
    });
    return;
  }
  try {
    writeResponse(output, {
      jsonrpc: "2.0",
      id,
      result: await dispatchRequest(message.method, message.params, adapter)
    });
  } catch (err) {
    writeResponse(output, {
      jsonrpc: "2.0",
      id,
      error: {
        code: -32601,
        message: err instanceof Error ? err.message : "Method not found"
      }
    });
  }
}
async function dispatchRequest(method, params, adapter) {
  if (method === "initialize") {
    const requested = readProtocolVersion(params);
    return {
      protocolVersion: requested ?? MCP_PROTOCOL_VERSION,
      capabilities: { tools: { listChanged: false } },
      serverInfo: { name: "sift-local-mcp", version: "0.1.0" },
      instructions: "Call contract.get first and echo its contractVersion on every other Sift tool call. Use Sift tools to read and write the hosted canonical brain."
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
  throw new Error(`Method '${method}' is not supported by Sift local MCP.`);
}
function readProtocolVersion(params) {
  if (!isRecord(params))
    return void 0;
  return typeof params.protocolVersion === "string" ? params.protocolVersion : void 0;
}
function parseToolCall(params) {
  if (!isRecord(params) || typeof params.name !== "string") {
    throw new Error("tools/call requires a tool name.");
  }
  return {
    name: params.name,
    arguments: isRecord(params.arguments) ? params.arguments : {}
  };
}
function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function normalizeId(value) {
  if (typeof value === "string" || typeof value === "number" || value === null)
    return value;
  return null;
}
function writeResponse(output, response) {
  output.write(`${JSON.stringify(response)}
`);
}
var MCP_PROTOCOL_VERSION;
var init_localMcpStdioServer = __esm({
  "../tools/dist/localMcpStdioServer.js"() {
    "use strict";
    init_mcpAdapter();
    MCP_PROTOCOL_VERSION = "2025-11-25";
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
  createMcpToolSchemas: () => createMcpToolSchemas,
  createRuntimeToolExecutor: () => createRuntimeToolExecutor,
  isGatedTool: () => isGatedTool,
  isToolAuthorized: () => isToolAuthorized,
  listToolDefinitions: () => listToolDefinitions
});
var init_dist = __esm({
  "../tools/dist/index.js"() {
    "use strict";
    init_executor();
    init_generated();
    init_hostedMcpEntrypoint();
    init_localMcpStdioServer();
    init_mcpAdapter();
    init_gating();
    init_registry();
  }
});

// src/index.ts
import { readFile } from "fs/promises";

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
function validateAuthenticatedScope(config2, now) {
  const requiredScope = [
    ["apiBaseUrl", config2.apiBaseUrl],
    ["workspaceId", config2.workspaceId],
    ["brainId", config2.brainId],
    ["principalId", config2.principalId]
  ];
  const missing = requiredScope.find(([, value]) => value.trim().length === 0);
  if (missing !== void 0) {
    throw new Error(`Missing authenticated CLI scope: ${missing[0]}.`);
  }
  if (config2.tokenExpiresAt !== void 0) {
    const expiresAt = Date.parse(config2.tokenExpiresAt);
    if (!Number.isFinite(expiresAt)) {
      throw new Error("Invalid CLI auth expiry timestamp.");
    }
    if (expiresAt <= now.getTime()) {
      throw new Error("Sift CLI auth has expired. Reconnect or refresh the configured token.");
    }
  }
}
function renderSearchResult(result2) {
  if (typeof result2 === "object" && result2 !== null && "contextMarkdown" in result2) {
    const context = result2;
    return `${context.contextMarkdown}
`;
  }
  return `${JSON.stringify(result2)}
`;
}
function renderRecordResult(result2) {
  if (typeof result2 === "object" && result2 !== null && "markdown" in result2) {
    const record = result2;
    return `${record.markdown}
`;
  }
  return `${JSON.stringify(result2)}
`;
}
function renderProfileResult(result2) {
  if (typeof result2 === "object" && result2 !== null && "profileMarkdown" in result2) {
    const profile = result2;
    return `${profile.profileMarkdown}
`;
  }
  return `${JSON.stringify(result2)}
`;
}
function renderTools(tools) {
  return `${tools.map((tool) => `${tool.name}: ${tool.summary}`).join("\n")}
`;
}
function renderSiftFound(result2) {
  return `Sift found:

${renderSearchResult(result2)}`;
}
function renderWriteReceipt(action, result2) {
  if (typeof result2 !== "object" || result2 === null) {
    return `${action} complete.
${JSON.stringify(result2)}
`;
  }
  const record = result2;
  const lines = [`${action} complete.`];
  addReceiptLine(lines, "Record", record.recordId);
  addReceiptLine(lines, "Version", record.versionId);
  addReceiptLine(lines, "Source", record.sourceId);
  addReceiptLine(lines, "Source item", record.sourceItemId);
  if (typeof record.job === "object" && record.job !== null && "id" in record.job) {
    addReceiptLine(lines, "Job", record.job.id);
  }
  if (lines.length === 1) {
    lines.push(JSON.stringify(result2));
  }
  lines.push("");
  return lines.join("\n");
}
function renderDoctorResult(result2) {
  return `${result2.checks.map((check) => {
    const fix = check.fix === void 0 ? "" : ` Fix: ${check.fix}`;
    return `[${check.status}] ${check.label}: ${check.detail}${fix}`;
  }).join("\n")}
`;
}
function aliasJson(command, tool, result2) {
  return `${JSON.stringify({ command, tool, result: result2 })}
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
  const result2 = await executor.execute("agent.register", input);
  return ok(json ? `${JSON.stringify(result2)}
` : renderAgentRegisterResult(result2));
}
function renderAgentRegisterResult(result2) {
  if (typeof result2 !== "object" || result2 === null || !("agent" in result2)) {
    return `${JSON.stringify(result2)}
`;
  }
  const { agent, created, reactivated } = result2;
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
  "audit:events": "event:audit:read"
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
  const result2 = {
    ok: !checks.some((check) => check.status === "failed"),
    apiBaseUrl: input.config.apiBaseUrl.trim().length > 0 ? input.config.apiBaseUrl : void 0,
    scope: scopeResult(input.config),
    checks
  };
  return {
    exitCode: result2.ok ? 0 : 1,
    stdout: input.json ? `${JSON.stringify(result2)}
` : renderDoctorResult(result2),
    stderr: ""
  };
}
async function discoverToolNames(executor) {
  if (executor === void 0) return void 0;
  if (executor.listAvailableToolNames !== void 0) return executor.listAvailableToolNames();
  const result2 = await executor.execute("tools.list", {});
  return toolNamesFromResult(result2);
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
function scopeResult(config2) {
  if (config2.workspaceId.trim().length === 0 || config2.brainId.trim().length === 0 || config2.principalId.trim().length === 0) {
    return void 0;
  }
  return {
    workspaceId: config2.workspaceId,
    brainId: config2.brainId,
    principalId: config2.principalId,
    capabilities: [...config2.capabilities]
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
function authCheck(config2, now) {
  if (config2.apiBaseUrl.trim().length === 0 || config2.workspaceId.trim().length === 0 || config2.brainId.trim().length === 0 || config2.principalId.trim().length === 0) {
    return {
      id: "auth",
      status: "failed",
      label: "Auth",
      detail: "no authenticated CLI profile is loaded.",
      fix: "Run sift login."
    };
  }
  if (config2.tokenExpiresAt !== void 0 && Date.parse(config2.tokenExpiresAt) <= now.getTime()) {
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
function scopeCheck(config2) {
  if (config2.workspaceId.trim().length === 0 || config2.brainId.trim().length === 0) {
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
    detail: `${config2.workspaceId}/${config2.brainId}`
  };
}
function readToolsCheck(names) {
  return toolSetCheck("read-tools", "Read tools", ["context.assemble", "search.query"], names);
}
function writeToolsCheck(config2, names) {
  const hasWrite = config2.capabilities.includes("record:write") || config2.capabilities.includes("source:write");
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
function toolNamesFromResult(result2) {
  if (!Array.isArray(result2)) return [];
  return result2.flatMap((item) => {
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
  const result2 = await executor.execute("context.assemble", {
    query,
    maxChars: parseIntegerOption(parsed, "max-chars", 8e3)
  });
  return ok(json ? aliasJson("ask", "context.assemble", result2) : renderSiftFound(result2));
}
async function simpleSearch(executor, rest, json) {
  if (executor === void 0) {
    return fail("No Sift API executor is configured for search.query.");
  }
  const parsed = parseOptions(rest);
  const query = argsWithoutOptions(rest).join(" ").trim();
  const result2 = await executor.execute("search.query", {
    query,
    limit: parseIntegerOption(parsed, "limit", 10)
  });
  return ok(json ? aliasJson("search", "search.query", result2) : renderSearchResult(result2));
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
  const result2 = await executor.execute("capture.text", input);
  return ok(json ? aliasJson("remember", "capture.text", result2) : renderWriteReceipt("Remember", result2));
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
  const result2 = await executor.execute("capture.file", input);
  return ok(json ? aliasJson("add", "capture.file", result2) : renderWriteReceipt("Add", result2));
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
  const result2 = await executor.execute("record.patch_section", input);
  return ok(json ? aliasJson("edit", "record.patch_section", result2) : renderWriteReceipt("Edit", result2));
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
  const result2 = await executor.execute("decision.create", input);
  return ok(json ? aliasJson("decide", "decision.create", result2) : renderWriteReceipt("Decision", result2));
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
  const result2 = await executor.execute("task.create", input);
  return ok(json ? aliasJson("todo", "task.create", result2) : renderWriteReceipt("Task", result2));
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
  const result2 = await executor.execute("record.get", input);
  return ok(json ? aliasJson("show", "record.get", result2) : renderRecordResult(result2));
}
async function status(config2, executor, json) {
  const scope = {
    apiBaseUrl: config2.apiBaseUrl,
    principalId: config2.principalId,
    workspaceId: config2.workspaceId,
    brainId: config2.brainId,
    capabilities: [...config2.capabilities]
  };
  const api = await apiReachability(executor);
  const result2 = { scope, api };
  if (json) {
    return ok(`${JSON.stringify({ command: "status", result: result2 })}
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
  const result2 = await executor.execute(name, toolInput);
  return ok(json ? `${JSON.stringify(result2)}
` : `${JSON.stringify(result2)}
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
      const parsed = body.length > 0 ? parseJson(body) : {};
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
function parseJson(body) {
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
    "capture:file": () => captureFile(input.executor, input.readFile ?? readFile, rest, json),
    "capture:batch": () => captureBatch(input.executor, input.readFile ?? readFile, rest, json),
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
    "evidence:list": () => idTool({ executor: input.executor, toolName: "evidence.list", inputKey: "recordId", idLabel: "record ID", rest, json }),
    "evidence:get": () => idTool({ executor: input.executor, toolName: "evidence.get", inputKey: "evidenceId", idLabel: "evidence ID", rest, json }),
    "graph:neighbors": () => idTool({ executor: input.executor, toolName: "graph.neighbors", inputKey: "recordId", idLabel: "record ID", rest, json }),
    "event:list": () => executeSimple2(input.executor, "event.list", {}, json),
    "audit:events": () => auditEvents(input.executor, rest, json),
    "decision:create": () => createDecision(input.executor, rest, json),
    "task:create": () => createTask(input.executor, rest, json),
    "agent:register": () => agentRegister(input.executor, input.agentName, rest, json),
    "agent:status": () => executeSimple2(input.executor, "agent.status", {}, json),
    "mcp:serve": () => mcpServe(input.mcpServer, input.config, rawInput.executor, json),
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
    if (isAuthCommand(commandKey)) {
      return await handler();
    }
    validateAuthenticatedScope(input.config, input.now ?? /* @__PURE__ */ new Date());
    validateCommandCapability({ commandKey, config: input.config });
    return await handler();
  } catch (error) {
    return errorResult(error, json);
  }
}
async function runSpecialCommand(input, args, json, group, command) {
  if (group === "doctor" && command === void 0) {
    return doctor({ config: input.config, executor: input.executor, json, now: input.now ?? /* @__PURE__ */ new Date() });
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
async function mcpServe(mcpServer, config2, executor, json) {
  if (mcpServer === void 0) {
    return fail("No local MCP server is configured for mcp.serve.");
  }
  if (executor === void 0) {
    return fail("No Sift API executor is configured for mcp.serve.");
  }
  const result2 = await mcpServer.serve({ config: config2, executor, transport: "local_mcp" });
  if (result2 === void 0) return ok("");
  return ok(`${JSON.stringify(result2)}
`);
}
function scopeCurrent(config2, json) {
  const scope = {
    apiBaseUrl: config2.apiBaseUrl,
    tokenLabel: config2.tokenLabel,
    tokenExpiresAt: config2.tokenExpiresAt,
    principalId: config2.principalId,
    workspaceId: config2.workspaceId,
    brainId: config2.brainId,
    capabilities: config2.capabilities
  };
  return ok(json ? `${JSON.stringify(scope)}
` : renderScope(scope));
}
async function searchQuery(executor, rest, json) {
  if (executor === void 0) {
    return fail("No Sift API executor is configured for search.query.");
  }
  const query = rest.join(" ").trim();
  const result2 = await executor.execute("search.query", { query, limit: 10 });
  return ok(json ? `${JSON.stringify(result2)}
` : renderSearchResult(result2));
}
async function contextAssemble(executor, rest, json) {
  if (executor === void 0) {
    return fail("No Sift API executor is configured for context.assemble.");
  }
  const parsed = parseOptions(rest);
  const query = positionalArgs(rest).join(" ").trim();
  const result2 = await executor.execute("context.assemble", {
    query,
    maxChars: parseIntegerOption(parsed, "max-chars", 4e3)
  });
  return ok(json ? `${JSON.stringify(result2)}
` : renderSearchResult(result2));
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
  const result2 = await executor.execute("context.profile", input);
  return ok(json ? `${JSON.stringify(result2)}
` : renderProfileResult(result2));
}
async function executeSimple2(executor, name, toolInput, json) {
  if (executor === void 0) {
    return fail(`No Sift API executor is configured for ${name}.`);
  }
  const result2 = await executor.execute(name, toolInput);
  return ok(json ? `${JSON.stringify(result2)}
` : `${JSON.stringify(result2)}
`);
}
async function captureText(executor, rest, json) {
  if (executor === void 0) {
    return fail("No Sift API executor is configured for capture.text.");
  }
  const parsed = parseOptions(rest);
  const result2 = await executor.execute("capture.text", {
    sourceName: requireOption(parsed, "source"),
    externalId: requireOption(parsed, "external-id"),
    title: requireOption(parsed, "title"),
    visibility: [requireOption(parsed, "visibility")],
    markdown: requireOption(parsed, "markdown")
  });
  return ok(json ? `${JSON.stringify(result2)}
` : `${JSON.stringify(result2)}
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
  const result2 = await executor.execute("capture.file", {
    sourceName: requireOption(parsed, "source"),
    externalId: requireOption(parsed, "external-id"),
    title: requireOption(parsed, "title"),
    filename: basename(path),
    contentType: optionalOption(parsed, "content-type") ?? inferContentType(path),
    bytes,
    visibility: [requireOption(parsed, "visibility")]
  });
  return ok(json ? `${JSON.stringify(result2)}
` : `${JSON.stringify(result2)}
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
  const result2 = await executor.execute("capture.batch", { items: manifest });
  return ok(json ? `${JSON.stringify(result2)}
` : `${JSON.stringify(result2)}
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
  const result2 = await executor.execute("decision.create", input);
  return ok(json ? `${JSON.stringify(result2)}
` : `${JSON.stringify(result2)}
`);
}
async function sourceList(executor, json) {
  if (executor === void 0) {
    return fail("No Sift API executor is configured for source.list.");
  }
  const result2 = await executor.execute("source.list", {});
  return ok(json ? `${JSON.stringify(result2)}
` : `${JSON.stringify(result2)}
`);
}
async function sourceCreate(executor, rest, json) {
  if (executor === void 0) {
    return fail("No Sift API executor is configured for source.create.");
  }
  const parsed = parseOptions(rest);
  const result2 = await executor.execute("source.create", {
    name: requireOption(parsed, "name"),
    visibility: [requireOption(parsed, "visibility")]
  });
  return ok(json ? `${JSON.stringify(result2)}
` : `${JSON.stringify(result2)}
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
  const result2 = await executor.execute(toolName, { sourceId });
  return ok(json ? `${JSON.stringify(result2)}
` : `${JSON.stringify(result2)}
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
  const result2 = await executor.execute("ingestion.status", { jobId });
  return ok(json ? `${JSON.stringify(result2)}
` : `${JSON.stringify(result2)}
`);
}
async function recordList(executor, json) {
  if (executor === void 0) {
    return fail("No Sift API executor is configured for record.list.");
  }
  const result2 = await executor.execute("record.list", {});
  return ok(json ? `${JSON.stringify(result2)}
` : `${JSON.stringify(result2)}
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
  const result2 = await executor.execute(toolName, input);
  return ok(json ? `${JSON.stringify(result2)}
` : renderRecordResult(result2));
}
async function createMarkdownRecord(executor, rest, json) {
  if (executor === void 0) {
    return fail("No Sift API executor is configured for record.create_markdown.");
  }
  const parsed = parseOptions(rest);
  const result2 = await executor.execute("record.create_markdown", {
    recordType: requireOption(parsed, "type"),
    title: requireOption(parsed, "title"),
    markdown: requireOption(parsed, "markdown"),
    visibility: [requireOption(parsed, "visibility")]
  });
  return ok(json ? `${JSON.stringify(result2)}
` : `${JSON.stringify(result2)}
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
  const result2 = await executor.execute("record.patch_section", input);
  return ok(json ? `${JSON.stringify(result2)}
` : `${JSON.stringify(result2)}
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
  const result2 = await executor.execute("task.create", input);
  return ok(json ? `${JSON.stringify(result2)}
` : `${JSON.stringify(result2)}
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
  const result2 = await executor.execute("audit.events", input);
  return ok(json ? `${JSON.stringify(result2)}
` : `${JSON.stringify(result2)}
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
  const result2 = await input.executor.execute(input.toolName, { [input.inputKey]: id });
  return ok(input.json ? `${JSON.stringify(result2)}
` : `${JSON.stringify(result2)}
`);
}

// src/auth/configStore.ts
import { mkdir, readFile as readFile2, rm, writeFile, chmod } from "fs/promises";
import { dirname, join } from "path";
function resolveSiftConfigPath(input) {
  return join(input.homeDir, ".sift", "config.json");
}
async function readStoredSiftConfig(input) {
  let raw;
  try {
    raw = await readFile2(resolveSiftConfigPath(input), "utf8");
  } catch (error) {
    if (isNodeError(error) && error.code === "ENOENT") {
      return void 0;
    }
    throw error;
  }
  return parseStoredSiftConfig(JSON.parse(raw));
}
async function writeStoredSiftConfig(input) {
  const config2 = parseStoredSiftConfig(input.config);
  const path = resolveSiftConfigPath(input);
  await mkdir(dirname(path), { recursive: true, mode: 448 });
  await writeFile(path, `${JSON.stringify(config2, null, 2)}
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
  if (Date.parse(profile.tokenExpiresAt) <= input.now.getTime()) {
    throw new Error("Stored Sift CLI auth has expired; run `sift login` again.");
  }
  const token = await input.credentialStore.read({
    apiBaseUrl: profile.apiBaseUrl,
    tokenId: profile.tokenId
  });
  if (token === void 0) {
    throw new Error("Stored Sift credential store secret is missing; run `sift login` again.");
  }
  return {
    source: "stored",
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
  if ("token" in record || "secret" in record || "tokenSecret" in record) {
    throw new Error("Stored Sift config must not contain token secrets.");
  }
  return {
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
      const result2 = await runCommand(securityPath, ["list-keychains"]);
      if (result2.exitCode !== 0) {
        throw new UnsupportedCredentialStoreError();
      }
    },
    async read(readInput) {
      await requireSupported();
      const result2 = await runCommand(securityPath, [
        "find-generic-password",
        "-s",
        serviceName,
        "-a",
        account(readInput),
        "-w"
      ]);
      if (result2.exitCode !== 0) {
        return void 0;
      }
      const secret = result2.stdout.trim();
      return secret.length === 0 ? void 0 : secret;
    },
    async write(writeInput) {
      await requireSupported();
      const result2 = await runCommand(securityPath, [
        "add-generic-password",
        "-U",
        "-s",
        serviceName,
        "-a",
        account(writeInput),
        "-w",
        writeInput.secret
      ]);
      if (result2.exitCode !== 0) {
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
    const result2 = await execFileAsync(file, args);
    return { stdout: result2.stdout, stderr: result2.stderr, exitCode: 0 };
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
import { hostname } from "os";
import { promisify as promisify2 } from "util";

// src/auth/localCallback.ts
import { createServer } from "http";
async function createLocalCallbackServer() {
  let resolveCallback;
  let rejectCallback;
  const callbackPromise = new Promise((resolve, reject) => {
    resolveCallback = resolve;
    rejectCallback = reject;
  });
  const server = createServer((request, response) => {
    try {
      const url = new URL(request.url ?? "/", "http://127.0.0.1");
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
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      server.off("error", reject);
      resolve();
    });
  });
}
function closeServer(server) {
  return new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
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

// src/auth/loginFlow.ts
var execFileAsync2 = promisify2(execFile2);
function createSiftCliAuthCommands(input) {
  const now = input.now ?? (() => /* @__PURE__ */ new Date());
  const sleep = input.sleep ?? ((ms) => new Promise((resolve) => setTimeout(resolve, ms)));
  return {
    async login({ rest, json }) {
      try {
        return rest.includes("--no-browser") ? await deviceLogin(input, rest, sleep, json) : await browserLogin(input, rest, json);
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
        now: now()
      });
    }
  };
}
async function resolveLoginApiBaseUrl(input) {
  const options = parseOptions(input.argv);
  const fromFlag = clean2(options.get("api-base-url"));
  if (fromFlag !== void 0) return normalizeUrl(fromFlag);
  const fromEnv = clean2(input.env.SIFT_API_BASE_URL);
  if (fromEnv !== void 0) return normalizeUrl(fromEnv);
  const stored = await readStoredSiftConfig({ homeDir: input.homeDir });
  const profile = stored?.profiles[stored.currentProfile];
  if (profile !== void 0) return normalizeUrl(profile.apiBaseUrl);
  return "https://api.sift.com";
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
      deviceLabel: input.deviceLabel ?? hostname(),
      requestedCapabilities: requestedCapabilities(rest)
    });
    await tryOpenBrowser(input.openBrowser, request.authorizeUrl);
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
    deviceLabel: input.deviceLabel ?? hostname(),
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
      const result2 = await persistLogin(input, token, json);
      return result2.exitCode === 0 ? { ...result2, stdout: `Code: ${request.userCode}
${result2.stdout}` } : result2;
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
  const config2 = configFromToken(token);
  await writeStoredSiftConfig({ homeDir: input.homeDir, config: config2 });
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
function requestedCapabilities(rest) {
  const option = parseOptions(rest).get("capability");
  return option === void 0 ? ["record:read"] : option.split(",").map((item) => item.trim()).filter((item) => item.length > 0);
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
async function tryOpenBrowser(openBrowser, url) {
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
function failJson(message) {
  return {
    exitCode: 1,
    stdout: `${JSON.stringify({ error: { code: "auth_failed", message } })}
`,
    stderr: ""
  };
}
function normalizeUrl(value) {
  return value.replace(/\/+$/u, "");
}
function clean2(value) {
  const trimmed = value?.trim();
  return trimmed === void 0 || trimmed.length === 0 ? void 0 : trimmed;
}

// src/bin/sift.ts
var credentialStore = createMacOSKeychainStore();
var authCommands = createSiftCliAuthCommands({
  env: process.env,
  homeDir: process.env.HOME ?? process.cwd(),
  credentialStore,
  fetch
});
var loadedAuth = await authCommands.loadAuth();
var config = loadedAuth?.config ?? {
  apiBaseUrl: "",
  tokenLabel: "unset",
  workspaceId: "",
  brainId: "",
  principalId: "",
  capabilities: []
};
var { argv, agentName } = extractAgentName(process.argv.slice(2), process.env.SIFT_AGENT);
var result = await runSiftCli({
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
  authCommands,
  mcpServer: {
    serve: async ({ config: config2, executor }) => {
      if (executor === void 0) {
        throw new Error("No Sift API executor is configured for mcp.serve.");
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
