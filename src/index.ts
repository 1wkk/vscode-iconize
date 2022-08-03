import type { ExtensionContext } from 'vscode'

import { registerDecorations } from './decorations'

export function activate(context: ExtensionContext) {
  registerDecorations(context)
}

export function deactivate() {

}
