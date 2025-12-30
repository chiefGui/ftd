export function formatMoney(amount: number): string {
  if (amount < 0) return `-$${formatMoney(-amount).slice(1)}`;
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(2)}M`;
  }
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(1)}K`;
  }
  return `$${Math.floor(amount).toLocaleString()}`;
}

export function formatMoneyPerSec(amount: number): string {
  if (amount >= 0) {
    return `+${formatMoney(amount)}/s`;
  }
  return `${formatMoney(amount)}/s`;
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return Math.floor(num).toLocaleString();
}
