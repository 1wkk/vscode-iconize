import type { ExtensionContext } from 'vscode'

import { registerDecorations } from './decorations'
import { registerCompletions } from './completions'

export function activate(ctx: ExtensionContext) {
  registerDecorations(ctx)
  registerCompletions(ctx)
}

export function deactivate() {

}
