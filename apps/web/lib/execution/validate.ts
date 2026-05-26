// Pre-validation for code submissions — runs BEFORE Piston to catch obviously invalid code early.
// This is a guard, not a judge: it rejects placeholder/empty submissions but cannot prove correctness.

const PLACEHOLDER_PATTERNS: RegExp[] = [
  /^\s*pass\s*$/m,                           // Python pass
  /^\s*\/\/\s*TODO[:\s]/im,                 // // TODO:
  /^\s*#\s*TODO[:\s]/im,                    // # TODO:
  /throw\s+new\s+Error\s*\(\s*["']not\s+implemented/i,
  /unimplemented!\s*\(\s*\)/i,              // Rust unimplemented!()
  /todo!\s*\(\s*\)/i,                       // Rust todo!()
  /raise\s+NotImplementedError/i,           // Python NotImplementedError
  /\/\*\s*write\s+your\s+solution\s+here\s*\*\//i,
  /#\s*write\s+your\s+solution\s+here/i,
  /\/\/\s*write\s+your\s+solution\s+here/i,
];

// Returns error message if code fails pre-validation, null if it's acceptable to send to executor
export function preValidateCode(
  code:        string,
  language:    string,
  starterCode: string | null | undefined,
): string | null {
  const trimmed = code.trim();

  if (trimmed.length < 15) {
    return "Submission is too short. Please write a complete solution.";
  }

  // Reject if identical to starter template
  if (starterCode && trimmed === starterCode.trim()) {
    return "You haven't modified the starter code. Please write your solution.";
  }

  // Reject if every non-empty line is a comment
  const nonEmptyLines = trimmed.split("\n").filter(l => l.trim().length > 0);
  const commentPrefixes = language === "python" ? ["#"] : ["//", "*", "/*"];
  const allComments = nonEmptyLines.every(l => commentPrefixes.some(p => l.trim().startsWith(p)));
  if (nonEmptyLines.length > 0 && allComments) {
    return "Your submission contains only comments. Please write executable code.";
  }

  for (const pattern of PLACEHOLDER_PATTERNS) {
    if (pattern.test(trimmed)) {
      return "Submission contains an unimplemented placeholder. Please write your actual solution.";
    }
  }

  return null; // passes pre-validation
}
