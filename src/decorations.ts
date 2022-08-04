import type { DecorationOptions, ExtensionContext, TextEditor } from 'vscode'
import { DecorationRangeBehavior, Range, Uri, window, workspace } from 'vscode'

import { REGEX, config, onConfigUpdated } from './config'
import { loadIconPath } from './loader'
import { isTruthy, pathToSvg, toDataUrl } from './utils'

const registerDecorations = (ctx: ExtensionContext) => {
  const inlineIconDecoration = window.createTextEditorDecorationType({
    textDecoration: 'none; opacity: 0.6 !important;',
    rangeBehavior: DecorationRangeBehavior.ClosedClosed,
  })
  const hideTextDecoration = window.createTextEditorDecorationType({
    textDecoration: 'none; display: none;',
  })

  let decorations: Array<DecorationOptions> = []
  let editor: TextEditor | undefined

  const refreshDecorations = () => {
    if (!editor)
      return

    editor.setDecorations(inlineIconDecoration, decorations)

    editor.setDecorations(
      hideTextDecoration,
      decorations
        .map(({ range }) => range)
        .filter(i => i.start.line !== editor!.selection.start.line),
    )
  }

  const updateDecorations = async () => {
    if (!editor)
      return

    const text = editor.document.getText()
    let match
    const regex = REGEX.value
    regex.lastIndex = 0
    const keys: [Range, string][] = []

    // eslint-disable-next-line no-cond-assign
    while ((match = regex.exec(text))) {
      const key = match[1]
      if (!key)
        continue

      const startPos = editor.document.positionAt(match.index + 1)
      const endPos = editor.document.positionAt(match.index + key.length + 1)
      keys.push([new Range(startPos, endPos), key])
    }

    decorations = (await Promise.all(keys.map(async ([range, key]) => {
      const icon = await loadIconPath(ctx, key)

      if (!icon)
        return undefined

      const dataurl = toDataUrl(pathToSvg(icon))

      return {
        range,
        renderOptions: {
          before: {
            contentIconPath: Uri.parse(dataurl),
            margin: `-${config.fontSize}px 2px; transform: translate(-2px, 3px);`,
            width: `${config.fontSize * 1.1}px`,
          },
        },
        key,
      }
    }))).filter(isTruthy)

    refreshDecorations()
  }

  /**
   * updateEditor
   * @param _editor TextEditor | undefined
   */
  const updateEditor = (_editor?: TextEditor) => {
    if (!_editor || editor === _editor)
      return

    editor = _editor
    decorations = []
  }

  let timeout: NodeJS.Timeout | undefined
  /**
   * triggerUpdateDecorations
   * @param _editor TextEditor | undefined
   */
  const triggerUpdateDecorations = (_editor?: TextEditor) => {
    updateEditor(_editor)
    if (timeout)
      clearTimeout(timeout)
    timeout = setTimeout(() => {
      updateDecorations()
    }, 200)
  }

  window.onDidChangeActiveTextEditor((e) => {
    triggerUpdateDecorations(e)
  }, null, ctx.subscriptions)

  workspace.onDidChangeTextDocument((event) => {
    if (window.activeTextEditor && event.document === window.activeTextEditor.document)
      triggerUpdateDecorations(window.activeTextEditor)
  }, null, ctx.subscriptions)

  workspace.onDidChangeConfiguration(() => {
    onConfigUpdated()
    triggerUpdateDecorations()
  }, null, ctx.subscriptions)

  window.onDidChangeVisibleTextEditors((editors) => {
    triggerUpdateDecorations(editors[0])
  }, null, ctx.subscriptions)

  window.onDidChangeTextEditorSelection((e) => {
    updateEditor(e.textEditor)
    refreshDecorations()
  })

  // on start up
  triggerUpdateDecorations(window.activeTextEditor)
}

export { registerDecorations }
