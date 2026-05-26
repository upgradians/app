// Deterministic code validator — runs BEFORE the execution provider.
// Rejects obviously invalid or placeholder submissions without spending compute.
// Seven stages run in order; the first failure returns immediately.
// Returns null if code passes all checks, or an error message string if not.

// ─── Language rule schema ─────────────────────────────────────────────────────

interface LanguageRule {
  minLength:       number;
  commentPrefixes: string[];
  requiredAny:     RegExp[];                              // at least ONE must match
  forbiddenAll:    RegExp[];                              // NONE may match
  structureChecks: ((code: string) => string | null)[];  // custom structural checks
}

// ─── Per-language rules ───────────────────────────────────────────────────────

const RULES: Record<string, LanguageRule> = {

  // ── Python ──────────────────────────────────────────────────────────────────
  python: {
    minLength: 20,
    commentPrefixes: ["#"],
    requiredAny: [
      /\bdef\s+\w+\s*\(/,
      /\bfor\s+\w.*?\bin\b/,
      /\bwhile\s+.+:/,
      /\breturn\b/,
      /\bprint\s*\(/,
      /\bclass\s+\w+/,
      /\blambda\b/,
      /\blen\s*\(/,
      /\brange\s*\(/,
      /\bmap\s*\(/,
      /\bfilter\s*\(/,
      /\bsorted\s*\(/,
      /\bsum\s*\(/,
      /\bmax\s*\(/,
      /\bmin\s*\(/,
      /\bzip\s*\(/,
      /\benumerate\s*\(/,
      /\binput\s*\(/,
      /\bint\s*\(/,
      /\bstr\s*\(/,
    ],
    forbiddenAll: [
      /raise\s+NotImplementedError\s*(?:\(\s*\))?/,
      /raise\s+Exception\s*\(\s*["']not\s+implemented/i,
    ],
    structureChecks: [
      // Reject if every non-comment executable line is just "pass"
      (code) => {
        const execLines = code.split("\n")
          .map(l => l.trim())
          .filter(l => l.length > 0 && !l.startsWith("#"));
        if (execLines.length > 0 && execLines.every(l => l === "pass")) {
          return "All function bodies consist only of 'pass'. Please implement a real solution.";
        }
        return null;
      },
    ],
  },

  // ── JavaScript ──────────────────────────────────────────────────────────────
  javascript: {
    minLength: 20,
    commentPrefixes: ["//", "/*", " *"],
    requiredAny: [
      /\bfunction\s+\w+\s*\(/,
      /=>\s*[\{(]/,
      /=>\s*\w/,
      /\breturn\b/,
      /\bconsole\.(log|error|warn)\s*\(/,
      /\bfor\s*\(/,
      /\bwhile\s*\(/,
      /\bif\s*\(/,
      /\bnew\s+\w+\s*\(/,
      /\bMath\.\w+\s*\(/,
      /\bArray\b/,
      /\bMap\s*\(/,
      /\bSet\s*\(/,
      /\bObject\.\w+\s*\(/,
      /\bparseInt\s*\(/,
      /\bparseFloat\s*\(/,
    ],
    forbiddenAll: [
      /throw\s+new\s+Error\s*\(\s*["']not\s+implemented/i,
    ],
    structureChecks: [],
  },

  // ── TypeScript ───────────────────────────────────────────────────────────────
  typescript: {
    minLength: 20,
    commentPrefixes: ["//", "/*", " *"],
    requiredAny: [
      /\bfunction\s+\w+\s*[<(]/,
      /=>\s*[\{(]/,
      /=>\s*\w/,
      /\breturn\b/,
      /\bconsole\.(log|error|warn)\s*\(/,
      /\bfor\s*\(/,
      /\bwhile\s*\(/,
      /\bif\s*\(/,
      /\binterface\s+\w+/,
      /\btype\s+\w+\s*=/,
      /\bclass\s+\w+/,
      /\bconst\s+\w+\s*(?::\s*\w[\w<>[\]|&\s]*\s*)?=\s*(?:\(|function\b)/,
    ],
    forbiddenAll: [
      /throw\s+new\s+Error\s*\(\s*["']not\s+implemented/i,
    ],
    structureChecks: [],
  },

  // ── Java ─────────────────────────────────────────────────────────────────────
  java: {
    minLength: 50,
    commentPrefixes: ["//", "/*", " *"],
    requiredAny: [
      /\bclass\s+\w+/,
    ],
    forbiddenAll: [
      /throw\s+new\s+UnsupportedOperationException\s*\(\s*\)/i,
      /throw\s+new\s+RuntimeException\s*\(\s*["']not\s+implemented/i,
    ],
    structureChecks: [
      (code) => {
        if (!/\bclass\s+\w+[^{]*\{/.test(code)) {
          return "Java requires a class definition with a body (`class Name { ... }`).";
        }
        // Must have at least one method signature with a body
        const METHOD = /(?:public|private|protected|static|void|int|String|boolean|double|float|long|char)\s+\w+\s*\([^)]*\)\s*(?:throws[\w,\s]+)?\s*\{/;
        if (!METHOD.test(code)) {
          return "Java class must contain at least one method definition.";
        }
        // Reject if all braced blocks are empty
        const blocks = [...code.matchAll(/\{([^{}]*)\}/g)];
        if (blocks.length > 0 && blocks.every(m => (m[1] ?? "").trim().length === 0)) {
          return "Java method bodies are all empty. Please implement the solution.";
        }
        return null;
      },
    ],
  },

  // ── C ────────────────────────────────────────────────────────────────────────
  c: {
    minLength: 30,
    commentPrefixes: ["//", "/*", " *"],
    requiredAny: [
      /int\s+main\s*\(/,
      /void\s+main\s*\(/,
      /\bprintf\s*\(/,
      /\bscanf\s*\(/,
      /\bputchar\s*\(/,
      /\bputs\s*\(/,
      /\breturn\b/,
      /\bint\s+\w+\s*\(/,
    ],
    forbiddenAll: [],
    structureChecks: [
      (code) => {
        // At least one function with a non-empty body
        const FN_RE = /\w+\s+\w+\s*\([^)]*\)\s*\{([^{}]*)\}/g;
        const matches = [...code.matchAll(FN_RE)];
        if (matches.length === 0) {
          return "C submission must contain at least one function with a body.";
        }
        if (matches.every(m => (m[1] ?? "").trim().length === 0)) {
          return "All C function bodies are empty. Please implement the solution.";
        }
        return null;
      },
    ],
  },

  // ── C++ ──────────────────────────────────────────────────────────────────────
  cpp: {
    minLength: 30,
    commentPrefixes: ["//", "/*", " *"],
    requiredAny: [
      /int\s+main\s*\(/,
      /void\s+main\s*\(/,
      /\bstd::/,
      /\bcout\b/,
      /\bcin\b/,
      /\bvector\s*</,
      /\bstring\b/,
      /\breturn\b/,
      /\bprintf\s*\(/,
    ],
    forbiddenAll: [],
    structureChecks: [
      (code) => {
        const FN_RE = /\w[\w\s*<>&:,]*\s+\w+\s*\([^)]*\)\s*(?:const\s*)?\{([^{}]*)\}/g;
        const matches = [...code.matchAll(FN_RE)];
        if (matches.length === 0) {
          return "C++ submission must contain at least one function with a body.";
        }
        if (matches.every(m => (m[1] ?? "").trim().length === 0)) {
          return "All C++ function bodies are empty. Please implement the solution.";
        }
        return null;
      },
    ],
  },

  // ── Go ───────────────────────────────────────────────────────────────────────
  go: {
    minLength: 30,
    commentPrefixes: ["//", "/*", " *"],
    requiredAny: [
      /\bfunc\s+\w+\s*\(/,
    ],
    forbiddenAll: [],
    structureChecks: [
      (code) => {
        if (!/\bfunc\s+\w+/.test(code)) {
          return "Go submission must contain at least one function (func) definition.";
        }
        // At least one func with non-empty body
        const FN_RE = /\bfunc\s+\w+[^{]*\{([^{}]*)\}/g;
        const matches = [...code.matchAll(FN_RE)];
        if (matches.length > 0 && matches.every(m => (m[1] ?? "").trim().length === 0)) {
          return "Go function bodies are all empty. Please implement the solution.";
        }
        return null;
      },
    ],
  },

  // ── Rust ─────────────────────────────────────────────────────────────────────
  rust: {
    minLength: 30,
    commentPrefixes: ["//", "/*", " *"],
    requiredAny: [
      /\bfn\s+\w+\s*[<(]/,
    ],
    forbiddenAll: [
      /\btodo!\s*\(\s*\)/,
      /\bunimplemented!\s*\(\s*\)/,
      /\bpanic!\s*\(\s*["']not\s+implemented/i,
    ],
    structureChecks: [
      (code) => {
        if (!/\bfn\s+\w+/.test(code)) {
          return "Rust submission must contain at least one function (fn) definition.";
        }
        const FN_RE = /\bfn\s+\w+[^{]*\{([^{}]*)\}/g;
        const matches = [...code.matchAll(FN_RE)];
        if (matches.length > 0 && matches.every(m => (m[1] ?? "").trim().length === 0)) {
          return "Rust function bodies are all empty. Please implement the solution.";
        }
        return null;
      },
    ],
  },

  // ── Kotlin ───────────────────────────────────────────────────────────────────
  kotlin: {
    minLength: 20,
    commentPrefixes: ["//", "/*", " *"],
    requiredAny: [
      /\bfun\s+\w+\s*\(/,
    ],
    forbiddenAll: [
      /\bTODO\s*\(\s*\)/,
    ],
    structureChecks: [
      (code) => {
        if (!/\bfun\s+\w+/.test(code)) {
          return "Kotlin submission must contain at least one function (fun) definition.";
        }
        const FN_RE = /\bfun\s+\w+[^{]*\{([^{}]*)\}/g;
        const matches = [...code.matchAll(FN_RE)];
        if (matches.length > 0 && matches.every(m => (m[1] ?? "").trim().length === 0)) {
          return "Kotlin function bodies are all empty. Please implement the solution.";
        }
        return null;
      },
    ],
  },

  // ── C# ──────────────────────────────────────────────────────────────────────
  csharp: {
    minLength: 40,
    commentPrefixes: ["//", "/*", " *"],
    requiredAny: [
      /\bclass\s+\w+/,
      /\bConsole\.(WriteLine|Write|ReadLine)\s*\(/,
      /\bstatic\s+(?:void|int|string|bool|double)\s+Main\b/,
      /\breturn\b/,
      /\bint\s+\w+\s*=\s*/,
    ],
    forbiddenAll: [
      /throw\s+new\s+NotImplementedException\s*\(\s*\)/i,
    ],
    structureChecks: [
      (code) => {
        // At least one code block with content
        const blocks = [...code.matchAll(/\{([^{}]*)\}/g)];
        if (blocks.length === 0) {
          return "C# submission must contain at least one code block.";
        }
        if (blocks.every(m => (m[1] ?? "").trim().length === 0)) {
          return "All C# code blocks are empty. Please implement the solution.";
        }
        return null;
      },
    ],
  },
};

// ─── Universal placeholder patterns (all languages) ──────────────────────────

const UNIVERSAL_FORBIDDEN: RegExp[] = [
  /\/\/\s*TODO[:\s]/i,
  /#\s*TODO[:\s]/i,
  /TODO:\s*your\s+solution/i,
  /TODO:\s*implement/i,
  /write\s+your\s+solution\s+here/i,
  /implement\s+(?:your|the)\s+solution\s+here/i,
  /\/\/\s*[Yy]our\s+code\s+(?:here|goes\s+here)/i,
  /#\s*[Yy]our\s+code\s+(?:here|goes\s+here)/i,
  /\/\*\s*[Yy]our\s+code\s+here\s*\*\//i,
];

// ─── Main export ──────────────────────────────────────────────────────────────

// Returns null on success, an error message string on failure.
export function preValidateCode(
  code:        string,
  language:    string,
  starterCode?: string | null,
): string | null {
  const trimmed = code.trim();
  const rule    = RULES[language];
  const minLen  = rule?.minLength ?? 15;

  // ── Stage 1: Minimum length ──────────────────────────────────────────────────
  if (trimmed.length < minLen) {
    return `Submission is too short (${trimmed.length} chars). Please write a complete solution.`;
  }

  // ── Stage 2: Unchanged starter template ─────────────────────────────────────
  if (starterCode && trimmed === starterCode.trim()) {
    return "You haven't modified the starter code. Please write your solution.";
  }

  // ── Stage 3: Comment / whitespace only ──────────────────────────────────────
  if (rule) {
    const { commentPrefixes } = rule;
    const nonEmpty = trimmed.split("\n").filter(l => l.trim().length > 0);
    const allComments = nonEmpty.every(l =>
      commentPrefixes.some(p => l.trim().startsWith(p))
    );
    if (nonEmpty.length > 0 && allComments) {
      return "Submission contains only comments. Please write executable code.";
    }
  }

  // ── Stage 4: Universal placeholder patterns ──────────────────────────────────
  for (const p of UNIVERSAL_FORBIDDEN) {
    if (p.test(trimmed)) {
      return "Submission contains an unimplemented placeholder. Please write your actual solution.";
    }
  }

  if (!rule) return null; // unknown language — pass through to executor

  // ── Stage 5: Language-specific forbidden patterns ────────────────────────────
  for (const p of rule.forbiddenAll) {
    if (p.test(trimmed)) {
      return "Submission contains an unimplemented placeholder. Please write your actual solution.";
    }
  }

  // ── Stage 6: Required keyword presence (at least ONE must match) ─────────────
  if (rule.requiredAny.length > 0 && !rule.requiredAny.some(p => p.test(trimmed))) {
    return `Submission appears incomplete for ${language}. Please ensure your code contains real executable logic (functions, loops, conditionals, or output statements).`;
  }

  // ── Stage 7: Language-specific structural integrity ──────────────────────────
  for (const check of rule.structureChecks) {
    const err = check(trimmed);
    if (err) return err;
  }

  return null;
}
