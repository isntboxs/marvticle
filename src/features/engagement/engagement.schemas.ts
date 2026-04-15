import { z } from 'zod'

export const countSchema = z.object({
  count: z.number().int().nonnegative(),
})

export const toggleLikeInputSchema = z.object({
  postId: z.string().uuid(),
})

export const toggleLikeResultSchema = z.object({
  liked: z.boolean(),
  likesCount: z.number().int().nonnegative(),
})

const commentUserSchema = z.object({
  id: z.string().uuid(),
  username: z.string().nullable(),
  displayName: z.string().nullable(),
})

export type CommentNode = {
  id: string
  content: string
  parentId: string | null
  createdAt: string
  updatedAt: string | null
  user: z.infer<typeof commentUserSchema>
  replies: CommentNode[]
  repliesCount: number
}

export const commentSchema: z.ZodType<CommentNode> = z.lazy(() =>
  z.object({
    id: z.string().uuid(),
    content: z.string(),
    parentId: z.string().uuid().nullable(),
    createdAt: z.string(),
    updatedAt: z.string().nullable(),
    user: commentUserSchema,
    replies: z.array(commentSchema),
    repliesCount: z.number().int().nonnegative(),
  })
)

export const commentListSchema = z.object({
  items: z.array(commentSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().min(1),
  limit: z.number().int().min(1),
})

export const createCommentInputSchema = z.object({
  postId: z.string().uuid(),
  content: z.string().min(1).max(2000),
  parentId: z.string().uuid().optional(),
})

export const createCommentResultSchema = z.object({
  id: z.string().uuid(),
  content: z.string(),
  parentId: z.string().uuid().nullable(),
  createdAt: z.string(),
  updatedAt: z.string().nullable(),
})

export const updateCommentInputSchema = z.object({
  content: z.string().min(1).max(2000),
})

export const updateCommentResultSchema = z.object({
  id: z.string().uuid(),
  content: z.string(),
  updatedAt: z.string().nullable(),
})

export const deleteCommentResultSchema = z.object({
  deleted: z.boolean(),
})

export const trackViewInputSchema = z.object({
  postId: z.string().uuid(),
})

export const trackViewResultSchema = z.object({
  viewsCount: z.number().int().nonnegative(),
})
