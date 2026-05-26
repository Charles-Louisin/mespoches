import { getCurrencySymbol } from './currencies'

export function formatCurrency(amount: number, currency: string = 'XAF'): string {
  const formatted = new Intl.NumberFormat('fr-FR', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)

  if (currency === 'EURO') return `${formatted}\u00a0€`
  if (currency === 'DOLLARS') return `${formatted}\u00a0$`
  return `${formatted} ${getCurrencySymbol(currency)}`
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(d);
}

export function formatTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

export function formatDateTime(date: string | Date): string {
  return `${formatDate(date)} à ${formatTime(date)}`;
}

export function formatRelativeDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const target = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const diffDays = Math.round((today.getTime() - target.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return "Aujourd'hui"
  if (diffDays === 1) return 'Hier'
  return formatDate(d)
}

export function operationsLabel(count: number): string {
  return count > 1 ? `${count} opérations` : `${count} opération`
}

export function getTransactionTypeLabel(
  type: 'income' | 'expense' | 'transfer',
  savingsGoalId?: string | null
): string {
  if (savingsGoalId) return 'Épargne'
  switch (type) {
    case 'income':
      return 'Revenu'
    case 'expense':
      return 'Dépense'
    case 'transfer':
      return 'Transfert'
  }
}

function compareTransactionAsc(a: { date: string; created_at?: string }, b: { date: string; created_at?: string }) {
  const diff = new Date(a.date).getTime() - new Date(b.date).getTime();
  if (diff !== 0) return diff;
  const ca = a.created_at ? new Date(a.created_at).getTime() : 0;
  const cb = b.created_at ? new Date(b.created_at).getTime() : 0;
  return ca - cb;
}

function compareTransactionDesc(a: { date: string; created_at?: string }, b: { date: string; created_at?: string }) {
  return -compareTransactionAsc(a, b);
}

export function sortTransactionsByDateAsc<T extends { date: string; created_at?: string }>(
  items: T[]
): T[] {
  return [...items].sort(compareTransactionAsc);
}

export function sortTransactionsByDateDesc<T extends { date: string; created_at?: string }>(
  items: T[]
): T[] {
  return [...items].sort(compareTransactionDesc);
}

export function groupTransactionsByDate(transactions: any[]): Record<string, any[]> {
  const grouped: Record<string, any[]> = {};

  sortTransactionsByDateDesc(transactions).forEach((transaction) => {
    const date = formatDate(transaction.date);
    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(transaction);
  });

  for (const key of Object.keys(grouped)) {
    grouped[key].sort(compareTransactionDesc);
  }

  return grouped;
}
