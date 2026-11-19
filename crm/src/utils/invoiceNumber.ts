/** Invoice ids must not be drawn from a 900-value range. INV-YYYY-NNN collided across leads. */
export function createInvoiceNumber(date = new Date()): string {
  const year = date.getFullYear();
  const time = date.getTime().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `INV-${year}-${time}${rand}`;
}
