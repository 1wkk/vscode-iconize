import type { ExtensionContext, Position, TextDocument } from 'vscode'
import { CompletionItem, CompletionItemKind, languages } from 'vscode'

import icons from '../assets/icons.json'

const keys: Array<string> = Object.keys(icons)
const shortKeys: Array<string> = keys.map(k => k.substring(3))

export function registerCompletions(ctx: ExtensionContext) {
  const FullProvider = languages.registerCompletionItemProvider(
    'html',
    {
      provideCompletionItems(document: TextDocument, position: Position) {
        const linePrefix = document.lineAt(position).text.substr(0, position.character)
        if (!linePrefix.endsWith('@PROP="'))
          return undefined

        return keys.map(key => new CompletionItem(key, CompletionItemKind.Enum))
      },
    },
    '"')

  const IconProvider = languages.registerCompletionItemProvider(
    'html',
    {
      provideCompletionItems(document: TextDocument, position: Position) {
        const linePrefix = document.lineAt(position).text.substr(0, position.character)
        if (!linePrefix.endsWith('@PROP="@PREFIX@HYPHEN'))
          return undefined

        return shortKeys.map(key => new CompletionItem(key, CompletionItemKind.Enum))
      },
    },
    '@HYPHEN')

  ctx.subscriptions.push(IconProvider, FullProvider)
}
