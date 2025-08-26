export function formatNumber(num: string | number): string {
  const n = typeof num === 'string' ? parseInt(num.replace(/,/g, ''), 10) : num;
  
  if (isNaN(n)) return '0';
  
  if (n >= 1000000000) {
    return (n / 1000000000).toFixed(1).replace(/\.0$/, '') + 'B';
  }
  if (n >= 1000000) {
    return (n / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (n >= 1000) {
    return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return n.toString();
}