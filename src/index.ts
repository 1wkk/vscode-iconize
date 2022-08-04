import type { ExtensionContext } from 'vscode'

import { registerDecorations } from './decorations'
import { registerCompletions } from './completions'
import { updateIconSet } from './loader'

export function activate(ctx: ExtensionContext) {
  // force update
  updateIconSet(ctx)

  registerDecorations(ctx)
  registerCompletions(ctx)
}

export function deactivate() {

}
