import type { EnvironmentVariables } from './src/config/env.validator'

declare global {
  namespace NodeJS {
    // eslint-disable-next-line
    interface ProcessEnv extends EnvironmentVariables {}
  }
}

export {}
