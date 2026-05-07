import { Fragment } from 'react'
import { Link, useMatches } from '@tanstack/react-router'

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '#/components/ui/breadcrumb'

export const MainBreadcrumb = () => {
  const matches = useMatches()

  const crumbs = matches
    .filter(
      (m) => (m.staticData as { breadcrumb?: string }).breadcrumb !== undefined
    )
    .map((m) => ({
      label:
        (m.staticData as { breadcrumb?: string }).breadcrumb ??
        (m.params as { username?: string }).username ??
        '',
      to: m.pathname,
    }))

  return (
    <Breadcrumb className="font-heading">
      <BreadcrumbList>
        {crumbs.map((crumb, i) => {
          const isLast = i === crumbs.length - 1

          return (
            <Fragment key={crumb.to}>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage className="text-sm">
                    {crumb.label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link className="text-sm" to={crumb.to}>
                      {crumb.label}
                    </Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
