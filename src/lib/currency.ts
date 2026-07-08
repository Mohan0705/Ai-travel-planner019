/**
 * Currency auto-detection based on destination country
 */

export function getCurrencySymbol(country: string | undefined): string {
  if (!country) return "$";
  const c = country.toLowerCase().trim();
  if (c === "india" || c.includes("india") || c === "in" || c.includes("bharat") || c.includes("delhi") || c.includes("mumbai") || c.includes("goa") || c.includes("kerala") || c.includes("agra")) {
    return "₹";
  }
  return "$";
}

export function getCurrencyCode(country: string | undefined): string {
  if (!country) return "USD";
  const c = country.toLowerCase().trim();
  if (c === "india" || c.includes("india") || c === "in" || c.includes("bharat") || c.includes("delhi") || c.includes("mumbai") || c.includes("goa") || c.includes("kerala") || c.includes("agra")) {
    return "INR";
  }
  return "USD";
}

export function formatPrice(amount: number, country: string | undefined): string {
  const symbol = getCurrencySymbol(country);
  return `${symbol}${Math.round(amount).toLocaleString()}`;
}
