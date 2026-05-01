/**
 * Strip markdown syntax and return plain text, truncated to < 160 chars.
 */
export function parseMarkdownToWords(markdown: string): string {
  if (!markdown) return ''

  const cleaned = markdown
    // Remove code blocks
    .replace(/```[\s\S]*?```/g, ' ')
    // Remove inline code
    .replace(/`[^`]+`/g, ' ')
    // Remove images
    .replace(/!\[.*?\]\(.*?\)/g, ' ')
    // Remove links, keep text
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    // Remove HTML tags
    .replace(/<[^>]+>/g, ' ')
    // Remove heading markers
    .replace(/^#{1,6}\s+/gm, ' ')
    // Remove bold / italic / strikethrough markers
    .replace(/(\*{1,2}|_{1,2}|~~)(.*?)\1/g, '$2')
    // Remove blockquotes
    .replace(/^>\s?/gm, ' ')
    // Remove list markers
    .replace(/^(\s*[-*+]|\s*\d+\.)\s+/gm, ' ')
    // Remove horizontal rules
    .replace(/^(\s*[-*_]){3,}\s*$/gm, ' ')
    // Collapse whitespace
    .replace(/\s+/g, ' ')
    .trim()

  if (cleaned.length <= 157) return cleaned

  // Truncate to < 160 chars with ellipsis, avoiding mid-word cuts
  const truncated = cleaned
    .slice(0, 157)
    .trimEnd()
    .replace(/\s+\S*$/, '')
  return truncated + '...'
}
