export const getPostReadTime = (content: string) => {
  const wordsPerMinute = 200
  const wordCount = content.trim().split(/\s+/).filter(Boolean).length

  return Math.max(1, Math.ceil(wordCount / wordsPerMinute))
}
