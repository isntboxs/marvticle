import { useForm } from '@tanstack/react-form-start'
import {
  ArticleNyTimesIcon,
  ChatCircleTextIcon,
  EyeIcon,
  HeartIcon,
  LinkSimpleHorizontalIcon,
  NotePencilIcon,
  PlusIcon,
  QueueIcon,
  SparkleIcon,
  WarningCircleIcon,
} from '@phosphor-icons/react'
import { startTransition, useEffect, useId, useRef, useState } from 'react'
import { toast } from 'sonner'
import { z } from 'zod'
import type { ReactNode } from 'react'

import type { CommentNode } from '#/features/engagement/engagement.schemas'
import type { Post } from '#/features/posts/posts.schemas'
import { createCommentInputSchema } from '#/features/engagement/engagement.schemas'
import {
  useCommentsCountQuery,
  useCommentsQuery,
  useCreateCommentMutation,
  useLikesCountQuery,
  useToggleLikeMutation,
  useTrackViewMutation,
  useViewsCountQuery,
} from '#/features/engagement/engagement.queries'
import { createPostInputSchema } from '#/features/posts/posts.schemas'
import {
  useCreatePostMutation,
  usePostDetailQuery,
  usePostsInfiniteQuery,
} from '#/features/posts/posts.queries'
import { ApiClientError } from '#/lib/api/api-error'
import { getErrorMessage } from '#/lib/api/get-error-message'
import { Avatar, AvatarFallback } from '#/components/ui/avatar'
import { Badge } from '#/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '#/components/ui/alert'
import { Button } from '#/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { Checkbox } from '#/components/ui/checkbox'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '#/components/ui/empty'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '#/components/ui/field'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupTextarea,
} from '#/components/ui/input-group'
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from '#/components/ui/item'
import { ScrollArea } from '#/components/ui/scroll-area'
import { Separator } from '#/components/ui/separator'
import { Skeleton } from '#/components/ui/skeleton'
import { Spinner } from '#/components/ui/spinner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#/components/ui/tabs'

export function HomeApiProbe({ auth }: { auth: unknown }) {
  const isAuthenticated = Boolean(auth)
  const trackedPostsRef = useRef<Set<string>>(new Set())
  const [selectedPostIdState, setSelectedPostIdState] = useState<string>('')

  const postsQuery = usePostsInfiniteQuery(6)
  const posts = postsQuery.data?.pages.flatMap((page) => page.items) ?? []
  const selectedPostId = posts.some((post) => post.id === selectedPostIdState)
    ? selectedPostIdState
    : (posts.at(0)?.id ?? '')

  const selectedPostPreview =
    posts.find((post) => post.id === selectedPostId) ?? posts.at(0)
  const detailQuery = usePostDetailQuery(selectedPostId)
  const selectedPost = selectedPostPreview
    ? (detailQuery.data ?? selectedPostPreview)
    : null

  const likesCountQuery = useLikesCountQuery(selectedPostId)
  const commentsCountQuery = useCommentsCountQuery(selectedPostId)
  const viewsCountQuery = useViewsCountQuery(selectedPostId)
  const commentsQuery = useCommentsQuery(selectedPostId, 1, 20)
  const toggleLikeMutation = useToggleLikeMutation(selectedPostId)
  const trackViewMutation = useTrackViewMutation(selectedPostId)

  useEffect(() => {
    if (!selectedPostId || !selectedPost) return
    if (trackedPostsRef.current.has(selectedPostId)) return

    trackedPostsRef.current.add(selectedPostId)
    trackViewMutation.mutate()
  }, [selectedPostId, selectedPost, trackViewMutation])

  const selectPost = (postId: string) => {
    startTransition(() => {
      setSelectedPostIdState(postId)
    })
  }

  const handleToggleLike = async () => {
    if (!selectedPostId || !isAuthenticated) return

    try {
      await toggleLikeMutation.mutateAsync()
    } catch (error) {
      toast.error('Unable to update likes', {
        description: getMutationErrorMessage(error),
      })
    }
  }

  return (
    <main className="api-probe-shell min-h-svh">
      <div className="api-probe-grid mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 md:px-6 lg:px-8">
        <section className="grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
          <Card className="overflow-hidden border border-border/80 bg-background/95">
            <CardHeader className="gap-3 border-b border-border/70 pb-6">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="uppercase">
                  frontend contract probe
                </Badge>
                <Badge variant={isAuthenticated ? 'default' : 'secondary'}>
                  {isAuthenticated ? 'session attached' : 'anonymous'}
                </Badge>
              </div>

              <CardTitle className="max-w-3xl text-xl leading-tight md:text-2xl">
                A client-first control room for the new `/api/*` contract.
              </CardTitle>

              <CardDescription className="max-w-2xl">
                This screen exercises the shared envelope validator, typed query
                hooks, and cookie-authenticated mutations without routing API
                traffic through Better Auth helpers.
              </CardDescription>
            </CardHeader>

            <CardContent className="grid gap-4 pt-4 md:grid-cols-3">
              <MetricCard
                icon={<ArticleNyTimesIcon weight="duotone" />}
                label="Posts in memory"
                value={String(posts.length)}
                detail="Flattened from the infinite query cache."
              />
              <MetricCard
                icon={<QueueIcon weight="duotone" />}
                label="Selected post"
                value={
                  selectedPost !== null ? truncateId(selectedPost.id) : 'none'
                }
                detail={
                  selectedPost !== null
                    ? 'Detail, comments, likes, and views hydrate from this id.'
                    : 'Choose a post once the feed resolves.'
                }
              />
              <MetricCard
                icon={<SparkleIcon weight="duotone" />}
                label="Mutation gate"
                value={isAuthenticated ? 'open' : 'locked'}
                detail="Anonymous sessions stay browse-only."
              />
            </CardContent>
          </Card>

          <Card className="border border-border/80 bg-card/95">
            <CardHeader className="border-b border-border/70">
              <CardTitle>Request notes</CardTitle>
              <CardDescription>
                Shared assumptions pinned to this frontend implementation.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-4">
              <ProbeLine
                label="Origin"
                value="VITE_SERVER_URL"
                description="Auth and `/api/*` share one backend origin."
              />
              <ProbeLine
                label="Envelope"
                value="success | error"
                description="Every `/api/*` response is validated before unwrapping."
              />
              <ProbeLine
                label="Transport"
                value="fetch + credentials"
                description="Cookie-backed session requests include credentials by default."
              />
              <ProbeLine
                label="Caching"
                value="TanStack Query v5"
                description="Query keys are stable and mutation invalidation is centralized."
              />
            </CardContent>
          </Card>
        </section>

        {postsQuery.error ? (
          <Alert variant="destructive">
            <WarningCircleIcon weight="duotone" />
            <AlertTitle>Feed bootstrap failed</AlertTitle>
            <AlertDescription>
              {getErrorMessage(postsQuery.error)}
            </AlertDescription>
          </Alert>
        ) : null}

        <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <Card className="border border-border/80 bg-card/95">
            <CardHeader className="border-b border-border/70">
              <CardTitle>Posts feed</CardTitle>
              <CardDescription>
                `useInfiniteQuery` over `GET /api/posts`, keyed by stable
                filters only.
              </CardDescription>
              <CardAction>
                <Badge variant="outline">
                  {postsQuery.hasNextPage ? 'cursor open' : 'cursor drained'}
                </Badge>
              </CardAction>
            </CardHeader>

            <CardContent className="p-0">
              <ScrollArea className="h-[28rem]">
                <div className="p-4">
                  {postsQuery.isPending ? (
                    <FeedSkeleton />
                  ) : posts.length ? (
                    <ItemGroup>
                      {posts.map((post) => {
                        const isActive = post.id === selectedPostId
                        return (
                          <button
                            key={post.id}
                            type="button"
                            onClick={() => selectPost(post.id)}
                            className="w-full text-left"
                          >
                            <Item
                              variant={isActive ? 'muted' : 'outline'}
                              className="border-border/70 hover:bg-muted/40"
                            >
                              <ItemContent>
                                <div className="flex flex-wrap items-center gap-2">
                                  <ItemTitle className="max-w-[24rem]">
                                    {post.title}
                                  </ItemTitle>
                                  <Badge
                                    variant={
                                      post.published ? 'default' : 'secondary'
                                    }
                                  >
                                    {post.published ? 'published' : 'draft'}
                                  </Badge>
                                </div>
                                <ItemDescription>{post.slug}</ItemDescription>
                                <ItemDescription>
                                  {summarize(post.content)}
                                </ItemDescription>
                                <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                                  <span>{formatDate(post.createdAt)}</span>
                                  <span>{truncateId(post.id)}</span>
                                </div>
                              </ItemContent>
                            </Item>
                          </button>
                        )
                      })}
                    </ItemGroup>
                  ) : (
                    <Empty className="border border-dashed border-border/80">
                      <EmptyHeader>
                        <EmptyMedia variant="icon">
                          <ArticleNyTimesIcon weight="duotone" />
                        </EmptyMedia>
                        <EmptyTitle>No posts returned</EmptyTitle>
                        <EmptyDescription>
                          The helper is wired, but the backend did not return
                          any post records yet.
                        </EmptyDescription>
                      </EmptyHeader>
                    </Empty>
                  )}
                </div>
              </ScrollArea>
            </CardContent>

            <CardFooter className="justify-between gap-3 border-t border-border/70">
              <span className="text-muted-foreground">
                {postsQuery.isFetchingNextPage
                  ? 'Fetching next page…'
                  : postsQuery.hasNextPage
                    ? 'Next cursor available.'
                    : 'No more pages.'}
              </span>
              <Button
                type="button"
                variant="outline"
                onClick={() => void postsQuery.fetchNextPage()}
                disabled={
                  !postsQuery.hasNextPage || postsQuery.isFetchingNextPage
                }
              >
                {postsQuery.isFetchingNextPage ? (
                  <Spinner />
                ) : (
                  'Load more posts'
                )}
              </Button>
            </CardFooter>
          </Card>

          <div className="grid gap-6">
            <Card className="border border-border/80 bg-card/95">
              <CardHeader className="border-b border-border/70">
                <CardTitle>Post detail</CardTitle>
                <CardDescription>
                  Detail and engagement panels pivot around the currently
                  selected id.
                </CardDescription>
                <CardAction>
                  {detailQuery.isFetching && (
                    <Badge variant="outline">syncing</Badge>
                  )}
                </CardAction>
              </CardHeader>

              <CardContent className="space-y-4 pt-4">
                {selectedPost !== null ? (
                  <>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="outline">{selectedPost.slug}</Badge>
                          <Badge
                            variant={
                              selectedPost.published ? 'default' : 'secondary'
                            }
                          >
                            {selectedPost.published ? 'published' : 'draft'}
                          </Badge>
                        </div>
                        <h2 className="max-w-3xl text-lg leading-tight md:text-xl">
                          {selectedPost.title}
                        </h2>
                      </div>

                      <Button
                        type="button"
                        variant={
                          toggleLikeMutation.data?.data.liked
                            ? 'default'
                            : 'outline'
                        }
                        disabled={
                          !selectedPostId ||
                          !isAuthenticated ||
                          toggleLikeMutation.isPending
                        }
                        onClick={() => void handleToggleLike()}
                      >
                        {toggleLikeMutation.isPending ? (
                          <Spinner />
                        ) : (
                          <HeartIcon weight="duotone" />
                        )}
                        {toggleLikeMutation.data?.data.liked
                          ? 'Liked'
                          : 'Toggle like'}
                      </Button>
                    </div>

                    {!isAuthenticated ? (
                      <Alert>
                        <LinkSimpleHorizontalIcon weight="duotone" />
                        <AlertTitle>Mutations require a session</AlertTitle>
                        <AlertDescription>
                          Browse data freely, then sign in to create posts, add
                          comments, and toggle likes.
                        </AlertDescription>
                      </Alert>
                    ) : null}

                    <div className="grid gap-3 md:grid-cols-3">
                      <MetricCard
                        icon={<HeartIcon weight="duotone" />}
                        label="Likes"
                        value={readMetric(
                          likesCountQuery.data?.count,
                          likesCountQuery.isPending
                        )}
                        detail="`GET /api/engagement/likes/count`"
                      />
                      <MetricCard
                        icon={<ChatCircleTextIcon weight="duotone" />}
                        label="Comments"
                        value={readMetric(
                          commentsCountQuery.data?.count,
                          commentsCountQuery.isPending
                        )}
                        detail="`GET /api/engagement/comments/count`"
                      />
                      <MetricCard
                        icon={<EyeIcon weight="duotone" />}
                        label="Views"
                        value={readMetric(
                          viewsCountQuery.data?.count,
                          viewsCountQuery.isPending
                        )}
                        detail="Tracked once per selected post in this session."
                      />
                    </div>

                    {selectedPost.coverImage ? (
                      <div className="overflow-hidden border border-border/70">
                        <img
                          src={selectedPost.coverImage}
                          alt={selectedPost.title}
                          className="h-56 w-full object-cover grayscale"
                        />
                      </div>
                    ) : null}

                    <Tabs defaultValue="overview">
                      <TabsList variant="line">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="comments">Comments</TabsTrigger>
                      </TabsList>

                      <TabsContent value="overview">
                        <div className="space-y-4">
                          <div className="grid gap-2 md:grid-cols-3">
                            <ProbeLine
                              label="Created"
                              value={formatDate(selectedPost.createdAt)}
                              description="Raw ISO string rendered locally."
                            />
                            <ProbeLine
                              label="Updated"
                              value={
                                selectedPost.updatedAt
                                  ? formatDate(selectedPost.updatedAt)
                                  : 'never'
                              }
                              description="Nullable backend field preserved."
                            />
                            <ProbeLine
                              label="Author"
                              value={selectedPost.author.name}
                              description={
                                selectedPost.author.username
                                  ? `@${selectedPost.author.username}`
                                  : truncateId(selectedPost.author.id)
                              }
                            />
                          </div>
                          <Separator />
                          <article className="max-w-none text-xs/relaxed whitespace-pre-wrap text-foreground/90">
                            {selectedPost.content}
                          </article>
                        </div>
                      </TabsContent>

                      <TabsContent value="comments" className="space-y-4">
                        {commentsQuery.error ? (
                          <Alert variant="destructive">
                            <WarningCircleIcon weight="duotone" />
                            <AlertTitle>Comment thread failed</AlertTitle>
                            <AlertDescription>
                              {getErrorMessage(commentsQuery.error)}
                            </AlertDescription>
                          </Alert>
                        ) : commentsQuery.isPending ? (
                          <CommentSkeleton />
                        ) : commentsQuery.data.items.length > 0 ? (
                          <div className="space-y-3">
                            {commentsQuery.data.items.map((comment) => (
                              <CommentThread
                                key={comment.id}
                                comment={comment}
                              />
                            ))}
                          </div>
                        ) : (
                          <Empty className="border border-dashed border-border/80">
                            <EmptyHeader>
                              <EmptyMedia variant="icon">
                                <ChatCircleTextIcon weight="duotone" />
                              </EmptyMedia>
                              <EmptyTitle>No comments yet</EmptyTitle>
                              <EmptyDescription>
                                This post detail is valid, but the threaded
                                comment query returned an empty tree.
                              </EmptyDescription>
                            </EmptyHeader>
                          </Empty>
                        )}
                      </TabsContent>
                    </Tabs>
                  </>
                ) : (
                  <Empty className="border border-dashed border-border/80">
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <QueueIcon weight="duotone" />
                      </EmptyMedia>
                      <EmptyTitle>Select a post</EmptyTitle>
                      <EmptyDescription>
                        The detail panel will hydrate once the feed resolves and
                        a post is active.
                      </EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                )}
              </CardContent>
            </Card>

            <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
              <CreatePostComposer
                isAuthenticated={isAuthenticated}
                onPostCreated={(postId) => selectPost(postId)}
              />
              <CreateCommentComposer
                isAuthenticated={isAuthenticated}
                post={selectedPost}
              />
            </section>
          </div>
        </section>
      </div>
    </main>
  )
}

function CreatePostComposer({
  isAuthenticated,
  onPostCreated,
}: {
  isAuthenticated: boolean
  onPostCreated: (postId: string) => void
}) {
  const postId = useId()
  const createPostMutation = useCreatePostMutation()
  const createPostFormSchema = z.object({
    title: createPostInputSchema.shape.title,
    slug: createPostInputSchema.shape.slug,
    content: createPostInputSchema.shape.content,
    coverImage: z.string(),
    published: createPostInputSchema.shape.published,
  })

  const form = useForm({
    defaultValues: {
      title: '',
      slug: '',
      content: '',
      coverImage: '',
      published: true,
    },
    validators: {
      onChange: createPostFormSchema,
      onSubmit: createPostFormSchema,
    },
    onSubmit: async ({ value, formApi }) => {
      try {
        const result = await createPostMutation.mutateAsync({
          title: value.title,
          slug: value.slug,
          content: value.content,
          coverImage: value.coverImage.trim() || null,
          published: value.published,
        })

        toast.success('Post created', {
          description: result.message,
        })
        formApi.reset()
        onPostCreated(result.data.id)
      } catch (error) {
        if (
          error instanceof ApiClientError &&
          error.code === 'VALIDATION_ERROR'
        ) {
          const fieldErrors = error.fieldErrors ?? {}

          if (fieldErrors.title) {
            formApi.setFieldMeta('title', (meta) => ({
              ...meta,
              isTouched: true,
              isValid: false,
              errors: [fieldErrors.title],
              errorMap: {
                ...meta.errorMap,
                onSubmit: fieldErrors.title,
              },
            }))
          }
          if (fieldErrors.slug) {
            formApi.setFieldMeta('slug', (meta) => ({
              ...meta,
              isTouched: true,
              isValid: false,
              errors: [fieldErrors.slug],
              errorMap: {
                ...meta.errorMap,
                onSubmit: fieldErrors.slug,
              },
            }))
          }
          if (fieldErrors.content) {
            formApi.setFieldMeta('content', (meta) => ({
              ...meta,
              isTouched: true,
              isValid: false,
              errors: [fieldErrors.content],
              errorMap: {
                ...meta.errorMap,
                onSubmit: fieldErrors.content,
              },
            }))
          }
          if (fieldErrors.coverImage) {
            formApi.setFieldMeta('coverImage', (meta) => ({
              ...meta,
              isTouched: true,
              isValid: false,
              errors: [fieldErrors.coverImage],
              errorMap: {
                ...meta.errorMap,
                onSubmit: fieldErrors.coverImage,
              },
            }))
          }
          return
        }

        toast.error('Create post failed', {
          description: getMutationErrorMessage(error),
        })
      }
    },
  })

  return (
    <Card className="border border-border/80 bg-card/95">
      <CardHeader className="border-b border-border/70">
        <CardTitle>Compose post</CardTitle>
        <CardDescription>
          `POST /api/posts` with client-side schema validation before the
          request leaves the browser.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        {isAuthenticated ? (
          <form
            onSubmit={(event) => {
              event.preventDefault()
              event.stopPropagation()
              void form.handleSubmit()
            }}
          >
            <FieldGroup>
              <form.Field
                name="title"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid

                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={`${postId}-title`}>Title</FieldLabel>
                      <InputGroup>
                        <InputGroupAddon align="inline-start">
                          <ArticleNyTimesIcon weight="duotone" />
                        </InputGroupAddon>
                        <InputGroupInput
                          id={`${postId}-title`}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(event) =>
                            field.handleChange(event.target.value)
                          }
                          aria-invalid={isInvalid}
                          placeholder="Contract-first frontend architecture"
                        />
                      </InputGroup>
                      <FieldError errors={field.state.meta.errors} />
                    </Field>
                  )
                }}
              />

              <form.Field
                name="slug"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid

                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={`${postId}-slug`}>Slug</FieldLabel>
                      <InputGroup>
                        <InputGroupAddon align="inline-start">
                          <LinkSimpleHorizontalIcon weight="duotone" />
                        </InputGroupAddon>
                        <InputGroupInput
                          id={`${postId}-slug`}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(event) =>
                            field.handleChange(event.target.value)
                          }
                          aria-invalid={isInvalid}
                          placeholder="contract-first-frontend-architecture"
                        />
                      </InputGroup>
                      <FieldError errors={field.state.meta.errors} />
                    </Field>
                  )
                }}
              />

              <form.Field
                name="content"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid

                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={`${postId}-content`}>
                        Content
                      </FieldLabel>
                      <InputGroup>
                        <InputGroupAddon align="block-start">
                          <span>Body</span>
                        </InputGroupAddon>
                        <InputGroupTextarea
                          id={`${postId}-content`}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(event) =>
                            field.handleChange(event.target.value)
                          }
                          aria-invalid={isInvalid}
                          placeholder="Write a real post payload that the backend would accept."
                          rows={7}
                        />
                      </InputGroup>
                      <FieldError errors={field.state.meta.errors} />
                    </Field>
                  )
                }}
              />

              <form.Field
                name="coverImage"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid

                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={`${postId}-cover`}>
                        Cover image URL
                      </FieldLabel>
                      <InputGroup>
                        <InputGroupAddon align="inline-start">
                          <LinkSimpleHorizontalIcon weight="duotone" />
                        </InputGroupAddon>
                        <InputGroupInput
                          id={`${postId}-cover`}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(event) =>
                            field.handleChange(event.target.value)
                          }
                          aria-invalid={isInvalid}
                          placeholder="https://images.example.com/post-cover.jpg"
                        />
                      </InputGroup>
                      <FieldDescription>
                        Optional. Leave blank to submit `null`.
                      </FieldDescription>
                      <FieldError errors={field.state.meta.errors} />
                    </Field>
                  )
                }}
              />

              <form.Field
                name="published"
                children={(field) => (
                  <Field orientation="horizontal">
                    <Checkbox
                      id={`${postId}-published`}
                      checked={field.state.value}
                      onCheckedChange={(checked) =>
                        field.handleChange(checked === true)
                      }
                    />
                    <FieldContent>
                      <FieldLabel htmlFor={`${postId}-published`}>
                        Publish immediately
                      </FieldLabel>
                      <FieldDescription>
                        Toggled locally, then serialized into the mutation
                        payload.
                      </FieldDescription>
                    </FieldContent>
                  </Field>
                )}
              />
            </FieldGroup>

            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
              children={([canSubmit, isSubmitting]) => (
                <Button
                  type="submit"
                  className="mt-5"
                  disabled={
                    !canSubmit || isSubmitting || createPostMutation.isPending
                  }
                >
                  {isSubmitting || createPostMutation.isPending ? (
                    <Spinner />
                  ) : (
                    <PlusIcon weight="duotone" />
                  )}
                  Create post
                </Button>
              )}
            />
          </form>
        ) : (
          <SignInPrompt
            title="Compose is locked"
            description="Mutation controls stay behind the existing Better Auth session. Sign in to post through the shared `/api/*` helper."
          />
        )}
      </CardContent>
    </Card>
  )
}

function CreateCommentComposer({
  isAuthenticated,
  post,
}: {
  isAuthenticated: boolean
  post: Post | null
}) {
  const commentId = useId()
  const createCommentMutation = useCreateCommentMutation(post?.id ?? '', 1, 20)
  const form = useForm({
    defaultValues: {
      content: '',
    },
    validators: {
      onChange: createCommentInputSchema.pick({ content: true }),
      onSubmit: createCommentInputSchema.pick({ content: true }),
    },
    onSubmit: async ({ value, formApi }) => {
      if (!post) return

      try {
        const result = await createCommentMutation.mutateAsync({
          postId: post.id,
          content: value.content,
        })

        toast.success('Comment added', {
          description: result.message,
        })
        formApi.reset()
      } catch (error) {
        if (
          error instanceof ApiClientError &&
          error.code === 'VALIDATION_ERROR'
        ) {
          const contentError = error.fieldErrors?.content
          if (contentError) {
            formApi.setFieldMeta('content', (meta) => ({
              ...meta,
              isTouched: true,
              isValid: false,
              errors: [contentError],
              errorMap: {
                ...meta.errorMap,
                onSubmit: contentError,
              },
            }))
          }
          return
        }

        toast.error('Create comment failed', {
          description: getMutationErrorMessage(error),
        })
      }
    },
  })

  return (
    <Card className="border border-border/80 bg-card/95">
      <CardHeader className="border-b border-border/70">
        <CardTitle>Add comment</CardTitle>
        <CardDescription>
          `POST /api/engagement/comments` using the selected post id as the
          mutation target.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        {!post ? (
          <SignInPrompt
            title="Select a post first"
            description="The comment mutation is ready, but it needs an active post id to build a valid payload."
          />
        ) : isAuthenticated ? (
          <form
            onSubmit={(event) => {
              event.preventDefault()
              event.stopPropagation()
              void form.handleSubmit()
            }}
          >
            <FieldGroup>
              <Field orientation="horizontal">
                <Avatar>
                  <AvatarFallback>API</AvatarFallback>
                </Avatar>
                <FieldContent>
                  <FieldLabel htmlFor={`${commentId}-content`}>
                    Commenting on {post.slug}
                  </FieldLabel>
                  <FieldDescription>
                    Validation errors from the backend map directly into the
                    field state.
                  </FieldDescription>
                </FieldContent>
              </Field>

              <form.Field
                name="content"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid

                  return (
                    <Field data-invalid={isInvalid}>
                      <InputGroup>
                        <InputGroupAddon align="block-start">
                          <NotePencilIcon weight="duotone" />
                        </InputGroupAddon>
                        <InputGroupTextarea
                          id={`${commentId}-content`}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(event) =>
                            field.handleChange(event.target.value)
                          }
                          aria-invalid={isInvalid}
                          placeholder="Leave a note about the contract, payload shape, or UX."
                          rows={8}
                        />
                      </InputGroup>
                      <FieldError errors={field.state.meta.errors} />
                    </Field>
                  )
                }}
              />
            </FieldGroup>

            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
              children={([canSubmit, isSubmitting]) => (
                <Button
                  type="submit"
                  className="mt-5"
                  disabled={
                    !canSubmit ||
                    isSubmitting ||
                    createCommentMutation.isPending
                  }
                >
                  {isSubmitting || createCommentMutation.isPending ? (
                    <Spinner />
                  ) : (
                    <ChatCircleTextIcon weight="duotone" />
                  )}
                  Add comment
                </Button>
              )}
            />
          </form>
        ) : (
          <SignInPrompt
            title="Commenting is locked"
            description="Anonymous sessions can inspect the thread, but the form stays read-only until a session cookie is present."
          />
        )}
      </CardContent>
    </Card>
  )
}

function SignInPrompt({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="space-y-4">
      <Alert>
        <LinkSimpleHorizontalIcon weight="duotone" />
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription>{description}</AlertDescription>
      </Alert>
      <Button variant="outline" asChild>
        <a href="/sign-in">Sign in</a>
      </Button>
    </div>
  )
}

function CommentThread({
  comment,
  depth = 0,
}: {
  comment: CommentNode
  depth?: number
}) {
  const authorLabel =
    comment.user.displayName ??
    comment.user.username ??
    truncateId(comment.user.id)

  return (
    <div className="space-y-3">
      <div
        className="space-y-3 border border-border/70 bg-muted/20 p-3"
        style={{
          marginLeft: depth ? `${Math.min(depth, 4) * 16}px` : undefined,
        }}
      >
        <div className="flex flex-wrap items-center gap-2">
          <Avatar size="sm">
            <AvatarFallback>
              {authorLabel.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <Badge variant="outline">{authorLabel}</Badge>
          <span className="text-[11px] text-muted-foreground">
            {formatDate(comment.createdAt)}
          </span>
          <span className="text-[11px] text-muted-foreground">
            {comment.repliesCount} replies
          </span>
        </div>
        <p className="text-xs/relaxed whitespace-pre-wrap text-foreground/90">
          {comment.content}
        </p>
      </div>

      {comment.replies.length ? (
        <div className="space-y-3">
          {comment.replies.map((reply) => (
            <CommentThread key={reply.id} comment={reply} depth={depth + 1} />
          ))}
        </div>
      ) : null}
    </div>
  )
}

function MetricCard({
  icon,
  label,
  value,
  detail,
}: {
  icon: ReactNode
  label: string
  value: string
  detail: string
}) {
  return (
    <div className="border border-border/70 bg-muted/20 p-3">
      <div className="mb-4 flex items-center justify-between text-muted-foreground">
        <span className="text-xs tracking-[0.18em] uppercase">{label}</span>
        <span>{icon}</span>
      </div>
      <div className="text-lg leading-none">{value}</div>
      <p className="mt-2 max-w-xs text-xs/relaxed text-muted-foreground">
        {detail}
      </p>
    </div>
  )
}

function ProbeLine({
  label,
  value,
  description,
}: {
  label: string
  value: string
  description: string
}) {
  return (
    <div className="border border-border/60 bg-muted/20 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="tracking-[0.18em] text-muted-foreground uppercase">
          {label}
        </span>
        <span>{value}</span>
      </div>
      <p className="mt-2 text-xs/relaxed text-muted-foreground">
        {description}
      </p>
    </div>
  )
}

function FeedSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="border border-border/70 p-3">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="mt-3 h-3 w-3/4" />
          <Skeleton className="mt-2 h-3 w-full" />
          <Skeleton className="mt-2 h-3 w-1/3" />
        </div>
      ))}
    </div>
  )
}

function CommentSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="border border-border/70 p-3">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="mt-3 h-3 w-full" />
          <Skeleton className="mt-2 h-3 w-5/6" />
        </div>
      ))}
    </div>
  )
}

const getMutationErrorMessage = (error: unknown) => {
  if (error instanceof ApiClientError) {
    return error.message
  }

  return 'Unable to reach the server. Check the backend and try again.'
}

const summarize = (content: string) => {
  const compact = content.replace(/\s+/g, ' ').trim()
  return compact.length > 120 ? `${compact.slice(0, 117)}...` : compact
}

const truncateId = (value: string) => `${value.slice(0, 8)}…`

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))

const readMetric = (value: number | undefined, isPending: boolean) =>
  isPending ? '...' : (value?.toString() ?? '0')
