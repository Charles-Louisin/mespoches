export function formatCurrency(amount: number, currency: string = 'XAF'): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount) + ' ' + currency;
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

export function getTransactionTypeLabel(type: 'income' | 'expense' | 'transfer'): string {
  switch (type) {
    case 'income':
      return 'Revenu'
    case 'expense':
      return 'Dépense'
    case 'transfer':
      return 'Transfert'
  }
}

export function groupTransactionsByDate(transactions: any[]): Record<string, any[]> {
  // Attendu: `transactions` déjà triées par date décroissante.
  // On conserve l'ordre d'insertion des clés pour afficher les jours du plus récent au plus ancien.
  const grouped: Record<string, any[]> = {};

  transactions.forEach((transaction) => {
    const date = formatDate(transaction.date);
    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(transaction);
  });

  return grouped;
}
