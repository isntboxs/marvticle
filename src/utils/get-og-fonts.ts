import fs from 'node:fs'
import path from 'node:path'
import type { ImageResponseOptions } from '@vercel/og'

const getFont = async ({
  font,
  fileName,
}: {
  font: string
  fileName: string
}) => {
  const fontPath = path.join(process.cwd(), 'public', 'fonts', font, fileName)
  const data = await fs.promises.readFile(fontPath)

  return data
}

export const getOGOptions = async (): Promise<ImageResponseOptions> => {
  const [interFontRegular, interFontMedium, interFontSemiBold, interFontBold] =
    await Promise.all([
      // regular
      getFont({
        font: 'inter',
        fileName: 'inter-latin-400-normal.ttf',
      }),

      // medium
      getFont({
        font: 'inter',
        fileName: 'inter-latin-500-normal.ttf',
      }),

      // semibold
      getFont({
        font: 'inter',
        fileName: 'inter-latin-600-normal.ttf',
      }),

      // bold
      getFont({
        font: 'inter',
        fileName: 'inter-latin-700-normal.ttf',
      }),
    ])

  const options: ImageResponseOptions = {
    width: 1200,
    height: 630,
    fonts: [
      {
        name: 'Inter',
        data: interFontRegular,
        weight: 400,
        style: 'normal',
      },
      {
        name: 'Inter',
        data: interFontMedium,
        weight: 500,
        style: 'normal',
      },
      {
        name: 'Inter',
        data: interFontSemiBold,
        weight: 600,
        style: 'normal',
      },
      {
        name: 'Inter',
        data: interFontBold,
        weight: 700,
        style: 'normal',
      },
    ],
  }

  return options
}
