import { z } from 'zod'

export const postAuthorSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  username: z.string().nullable(),
  image: z.string().nullable(),
})

export const postSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  slug: z.string(),
  content: z.string(),
  coverImage: z.string().nullable(),
  published: z.boolean(),
  author: postAuthorSchema,
  createdAt: z.string(),
  updatedAt: z.string().nullable(),
})

export const postListSchema = z.object({
  items: z.array(postSchema),
  nextCursor: z.string().nullable(),
  hasMore: z.boolean(),
})

export const createPostInputSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  content: z.string().min(1),
  coverImage: z.string().nullable(),
  published: z.boolean(),
})

export type Post = z.infer<typeof postSchema>
export type PostList = z.infer<typeof postListSchema>
export type CreatePostInput = z.infer<typeof createPostInputSchema>
