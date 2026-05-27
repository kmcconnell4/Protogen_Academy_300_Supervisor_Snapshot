/**
 * Exports a 2D array of strings as a CSV file download.
 * All cell values are double-quote wrapped with inner quotes escaped.
 */
export function exportCsv(rows: string[][], filename: string): void {
  const content = rows
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n')
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
