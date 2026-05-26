/** Début du jour civil en UTC (00:00:00.000Z). */
export function getUtcDayStart(d: Date = new Date()): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

/** Parse une date saisie (YYYY-MM-DD) en jour UTC. */
export function parseToUtcDay(dateInput: string): Date {
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
    const [y, m, day] = dateInput.split('-').map(Number);
    return new Date(Date.UTC(y, m - 1, day));
  }
  const d = new Date(dateInput);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

export function isFutureUtcDay(dateInput: string): boolean {
  const day = parseToUtcDay(dateInput);
  return day.getTime() > getUtcDayStart().getTime();
}

/** Valeur `YYYY-MM-DD` pour input[type=date] (jour UTC courant). */
export function getTodayUtcDateInputValue(): string {
  return getUtcDayStart().toISOString().slice(0, 10);
}

/** Date minimale pour une dépense prévue (lendemain UTC). */
export function getMinFutureUtcDateInputValue(): string {
  const tomorrow = getUtcDayStart();
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  return tomorrow.toISOString().slice(0, 10);
}
