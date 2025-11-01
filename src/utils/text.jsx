// Simple text truncation utility with ellipsis
export function truncateText(input, maxChars = 100, suffix = "…") {
  if (input == null) return "";
  const s = String(input);
  if (s.length <= maxChars) return s;
  // try to avoid cutting mid-word: backtrack to last space within last 12 chars
  const hard = s.slice(0, maxChars);
  const lastSpace = hard.lastIndexOf(" ");
  if (lastSpace > maxChars - 12) {
    return hard.slice(0, lastSpace).trimEnd() + suffix;
  }
  return hard.trimEnd() + suffix;
}
