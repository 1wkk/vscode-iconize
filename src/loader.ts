import type { ExtensionContext } from 'vscode'
import { window } from 'vscode'

import { $fetch } from 'ohmyfetch'

import { API, EXT_NAMESPACE } from './meta'

export async function updateIconSet(ctx: ExtensionContext) {
  const icons = await $fetch<Record<string, string>>(API, {
    headers: {
      'PRIVATE-TOKEN': '@TOKEN',
    },
    parseResponse: JSON.parse,
  })
  ctx.globalState.update('iconize', icons)
  return icons
}

export async function loadIconSet(ctx: ExtensionContext) {
  let iconSet = ctx.globalState.get<Record<string, string>>(EXT_NAMESPACE)

  if (!iconSet) {
    try {
      iconSet = await updateIconSet(ctx)
    }
    catch (e) {
      // TODO: error handling
      window.showErrorMessage(<any>e)
    }
  }

  return iconSet!
}

export async function loadIconPath(ctx: ExtensionContext, key: string) {
  const iconSet = await loadIconSet(ctx)
  let cache = iconSet[key]

  if (!cache) {
    try {
      const icons = await loadIconSet(ctx)
      cache = icons[key]
    }
    catch (e) {
      // TODO: error handling
      window.showErrorMessage(<any>e)
    }
  }

  return cache
}
