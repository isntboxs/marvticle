import {
  ProgressProvider,
  type RouterProgressProviderProps,
} from '@bprogress/react'

import { TanStackRouterProgress } from '#/components/tanstack-router-progress'

export type TanStackRouterProgressProviderProps = RouterProgressProviderProps

export const TanStackRouterProgressProvider = ({
  children,
  color,
  delay,
  disableSameURL,
  disableStyle,
  height,
  nonce,
  options,
  spinnerPosition,
  startPosition,
  stopDelay,
  style,
}: TanStackRouterProgressProviderProps) => {
  return (
    <ProgressProvider
      color={color}
      disableStyle={disableStyle}
      height={height}
      nonce={nonce}
      options={options}
      spinnerPosition={spinnerPosition}
      style={style}
    >
      <TanStackRouterProgress
        delay={delay}
        disableSameURL={disableSameURL}
        startPosition={startPosition}
        stopDelay={stopDelay}
      />
      {children}
    </ProgressProvider>
  )
}
