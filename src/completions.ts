import type { ExtensionContext, Position, TextDocument } from 'vscode'
import { CompletionItem, CompletionItemKind, languages } from 'vscode'

import { loadIconSet } from './loader'
import { iconMarkdown } from './markdown'

export function registerCompletions(ctx: ExtensionContext) {
  const FullProvider = languages.registerCompletionItemProvider(
    'html',
    {
      async provideCompletionItems(document: TextDocument, position: Position) {
        const linePrefix = document.lineAt(position).text.substr(0, position.character)
        if (!linePrefix.endsWith('@PROP="'))
          return undefined

        const iconSet = await loadIconSet(ctx)

        return Object.keys(iconSet).map(key => new CompletionItem(key, CompletionItemKind.Enum))
      },
      async resolveCompletionItem(item: CompletionItem) {
        return {
          ...item,
          documentation: await iconMarkdown(ctx, item.label as string),
        }
      },
    },
    '"')

  // FIXME: @HYPHEN completions
  // const IconProvider = languages.registerCompletionItemProvider(
  //   'html',
  //   {
  //     provideCompletionItems(document: TextDocument, position: Position) {
  //       const linePrefix = document.lineAt(position).text.substr(0, position.character)
  //       if (!linePrefix.endsWith('@PROP="@PREFIX@HYPHEN'))
  //         return undefined

  //       return shortKeys.map(key => new CompletionItem(key, CompletionItemKind.Enum))
  //     },
  //   },
  //   '@HYPHEN')

  ctx.subscriptions.push(FullProvider /** IconProvider */)
}
