import chalk from 'chalk';

export function outputJson(data: unknown): void {
  console.log(JSON.stringify(data, null, 2));
}

export function outputTable(headers: string[], rows: string[][]): void {
  // Calculate column widths
  const widths = headers.map((h, i) => {
    const maxRowWidth = Math.max(...rows.map((r) => (r[i] || '').length));
    return Math.max(h.length, maxRowWidth);
  });

  // Print header
  const headerRow = headers.map((h, i) => h.padEnd(widths[i])).join('  ');
  console.log(chalk.bold(headerRow));

  // Print separator
  console.log(widths.map((w) => '-'.repeat(w)).join('  '));

  // Print rows
  for (const row of rows) {
    const formattedRow = row
      .map((cell, i) => (cell || '').padEnd(widths[i]))
      .join('  ');
    console.log(formattedRow);
  }
}

export function outputSuccess(message: string): void {
  console.log(chalk.green('✓'), message);
}

export function outputError(message: string): void {
  console.error(chalk.red('✗'), message);
}

export function outputWarning(message: string): void {
  console.warn(chalk.yellow('⚠'), message);
}

export function outputInfo(message: string): void {
  console.log(chalk.blue('ℹ'), message);
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
