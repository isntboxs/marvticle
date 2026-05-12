import { UAParser } from 'ua-parser-js'

export function parseUserAgent(userAgent: string | null | undefined) {
  if (!userAgent) return

  const parser = new UAParser(userAgent)
  return {
    getBrowser: parser.getBrowser(),
    getCPU: parser.getCPU(),
    getDevice: parser.getDevice(),
    getEngine: parser.getEngine(),
    getOS: parser.getOS(),
    getResult: parser.getResult(),
    getUA: parser.getUA(),
  }
}
