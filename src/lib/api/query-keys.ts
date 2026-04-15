export const queryKeys = {
  posts: {
    all: ['posts'] as const,
    list: (params: { limit: number }) => ['posts', 'list', params] as const,
    detail: (id: string) => ['posts', 'detail', id] as const,
  },
  engagement: {
    likesCount: (postId: string) =>
      ['engagement', 'likes-count', postId] as const,
    comments: (params: { postId: string; page: number; limit: number }) =>
      ['engagement', 'comments', params] as const,
    commentsCount: (postId: string) =>
      ['engagement', 'comments-count', postId] as const,
    viewsCount: (postId: string) =>
      ['engagement', 'views-count', postId] as const,
  },
}
