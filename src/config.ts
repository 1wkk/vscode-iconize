import { ColorThemeKind, window, workspace } from 'vscode'

import { computed, reactive, ref } from '@vue/reactivity'

import { EXT_NAMESPACE } from './meta'

const _configState = ref(0)

function getConfig<T = any>(key: string): T | undefined {
  return workspace
    .getConfiguration()
    .get<T>(key)
}

async function setConfig(key: string, value: any, isGlobal = true) {
  // update value
  return await workspace
    .getConfiguration()
    .update(key, value, isGlobal)
}

function createConfigRef<T>(key: string, defaultValue: T, isGlobal = true) {
  return computed({
    get: () => {
      // to force computed update
      // eslint-disable-next-line no-unused-expressions
      _configState.value
      return getConfig<T>(key) ?? defaultValue
    },
    set: (v) => {
      setConfig(key, v, isGlobal)
    },
  })
}

export const config = reactive({
  color: createConfigRef(`${EXT_NAMESPACE}.color`, 'auto'),
  fontSize: createConfigRef('editor.fontSize', 14),
  collection: createConfigRef(`${EXT_NAMESPACE}.collection`, '@PREFIX'),
  delimiter: createConfigRef(`${EXT_NAMESPACE}.delimiters`, '@HYPHEN'),
  collectionApi: createConfigRef(`${EXT_NAMESPACE}.collectionApi`, '@ICON_SET'),
})

function escapeRegExp(text: string) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')
}

const delimiter = computed(() => `[${escapeRegExp(config.delimiter)}]`)

export const REGEX = computed(() => new RegExp(`[^\\w\\d]((?:${config.collection})${delimiter.value}[\\w-]+)`, 'g'))

// First try the activeColorThemeKind (if available) otherwise apply regex on the color theme's name
function isDarkTheme() {
  const themeKind = window?.activeColorTheme?.kind
  if (themeKind && themeKind === ColorThemeKind?.Dark)
    return true

  const theme = createConfigRef('workbench.colorTheme', '', true)

  // must be dark
  if (theme.value.match(/dark|black/i) != null)
    return true

  // must be light
  if (theme.value.match(/light/i) != null)
    return false

  // IDK, maybe dark
  return true
}

export const color = computed(() => {
  return config.color === 'auto'
    ? isDarkTheme()
      ? '#eee'
      : '#222'
    : config.color
})

export function onConfigUpdated() {
  _configState.value = +new Date()
}
