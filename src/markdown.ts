import type { ExtensionContext } from 'vscode'
import { MarkdownString } from 'vscode'

import { loadIconPath } from './loader'
import { pathToSvg, toDataUrl } from './utils'

export async function iconMarkdown(ctx: ExtensionContext, key: string) {
  const path = await loadIconPath(ctx, key)

  if (!path)
    return ''

  const icon = toDataUrl(pathToSvg(path, 100))

  return new MarkdownString(`| |\n|:---:|\n | ${key} |\n | ![](${icon}) |`)
}
