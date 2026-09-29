export function formatDateBR(date: string | null | undefined): string {
  if (!date) return "";

  const [year, month, day] = date.slice(0, 10).split("-");
  if (!year || !month || !day) return date;

  return `${day}/${month}/${year}`;
}
