import picocolors from 'picocolors'

const { green, red, dim } = picocolors

/**
 * Simple diff viewer for showing file changes
 */
export function showDiff(oldContent: string, newContent: string, filePath: string): void {
  console.log(dim(`\n━━━ ${filePath} ━━━`))

  const oldLines = oldContent.split('\n')
  const newLines = newContent.split('\n')

  const maxLines = Math.max(oldLines.length, newLines.length)
  let changesShown = 0
  const MAX_CHANGES = 20 // Limit output

  for (let i = 0; i < maxLines && changesShown < MAX_CHANGES; i++) {
    const oldLine = oldLines[i]
    const newLine = newLines[i]

    if (oldLine !== newLine) {
      if (oldLine !== undefined) {
        console.log(red(`- ${oldLine}`))
      }
      if (newLine !== undefined) {
        console.log(green(`+ ${newLine}`))
      }
      changesShown++
    }
  }

  if (changesShown >= MAX_CHANGES) {
    console.log(dim('... (truncated)'))
  }

  console.log()
}

/**
 * Show file operation summary
 */
export function showFileSummary(operation: 'create' | 'update' | 'delete', filePath: string): void {
  const symbol = operation === 'create' ? green('+') : operation === 'delete' ? red('-') : dim('~')
  console.log(`${symbol} ${filePath}`)
}
