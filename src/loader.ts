import type { ExtensionContext } from 'vscode'
import { window } from 'vscode'

import { $fetch } from 'ohmyfetch'
import { config } from './config'

export async function loadIconPath(ctx: ExtensionContext, key: string) {
  let cache: string | undefined = ctx.globalState.get(key)

  if (!cache) {
    try {
      const icons: Record<string, string> = await $fetch(config.collectionApi)
      Object.keys(icons).forEach((k) => {
        ctx.globalState.update(k, icons[k])
      })
      cache = icons[key]
    }
    catch (e) {
      // TODO: error handling
      window.showErrorMessage(<any>e)
    }
  }

  return cache!
}
