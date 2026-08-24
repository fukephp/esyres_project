const fs = require("fs");
const path = require("path");

const contextPath = path.join(".cursor", "CONTEXT.md");
let extra = "Follow .cursor/CONTEXT.md for all work under .cursor/ (rules, hooks, skills, commands).";

try {
  extra = fs.readFileSync(contextPath, "utf8");
} catch {
  // Keep the fallback reminder if CONTEXT.md is missing.
}

process.stdout.write(JSON.stringify({ additional_context: extra }));
