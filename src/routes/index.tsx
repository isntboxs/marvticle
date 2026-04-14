import { createFileRoute } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import { useSuspenseQuery } from '@tanstack/react-query'
import { appStatusQueryOptions } from '../lib/app-status'

export const Route = createFileRoute('/')({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(appStatusQueryOptions()),
  component: HomePage,
})

function HomePage() {
  const status = useSuspenseQuery(appStatusQueryOptions())
  const generatedAt = new Date(status.data.generatedAt).toUTCString()
  const form = useForm({
    defaultValues: {
      projectName: 'marvticle',
    },
    onSubmit: async () => {},
  })

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-10 px-6 py-16 sm:px-10">
      <section className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-8">
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-slate-500">
          Blank TanStack Start App
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
          React, Router, Query, and Form are wired and ready.
        </h1>
        <p className="max-w-2xl text-base leading-7 text-slate-600">
          This keeps the generated TanStack Start structure, removes demo pages,
          and leaves a minimal home route that exercises the requested TanStack
          libraries without adding product scaffolding.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 p-5">
          <h2 className="text-sm font-semibold text-slate-950">Start</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Server functions and the root document live in the standard Start
            route structure.
          </p>
        </article>
        <article className="rounded-2xl border border-slate-200 p-5">
          <h2 className="text-sm font-semibold text-slate-950">
            Router + Query
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            The route loader hydrates a TanStack Query entry through the router
            context.
          </p>
          <p className="mt-3 text-sm text-slate-500">
            Server status refreshed at{' '}
            <time dateTime={status.data.generatedAt}>{generatedAt}</time>.
          </p>
        </article>
        <article className="rounded-2xl border border-slate-200 p-5">
          <h2 className="text-sm font-semibold text-slate-950">Form</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            The form below uses TanStack Form directly with no extra UI kit or
            feature workflow attached.
          </p>
        </article>
      </section>

      <section className="rounded-3xl border border-slate-200 p-8">
        <form
          className="space-y-6"
          onSubmit={(event) => {
            event.preventDefault()
            event.stopPropagation()
            void form.handleSubmit()
          }}
        >
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-950">
              Form state example
            </h2>
            <p className="text-sm leading-6 text-slate-600">
              Edit the project name to confirm TanStack Form is active in the
              blank scaffold.
            </p>
          </div>

          <form.Field name="projectName">
            {(field) => (
              <label className="block space-y-2 text-sm font-medium text-slate-700">
                <span>Project name</span>
                <input
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-base text-slate-950 outline-none transition focus:border-slate-950"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  placeholder="Project name"
                />
              </label>
            )}
          </form.Field>

          <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
            <form.Subscribe selector={(state) => state.values.projectName}>
              {(projectName) => (
                <p className="m-0">
                  Current value:{' '}
                  <span className="font-semibold text-slate-950">
                    {projectName}
                  </span>
                </p>
              )}
            </form.Subscribe>
          </div>
        </form>
      </section>
    </main>
  )
}
