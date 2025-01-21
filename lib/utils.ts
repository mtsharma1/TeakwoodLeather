import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const safeNumber = (value: string | number): number =>
    typeof value === 'string' ? Number(value) || 0 : value || 0

export const roundToDecimals = (value: number, decimals: number = 2): number =>
    Number(value.toFixed(decimals))

export const formatLargeCurrency = (value: number) => {
  const roundToDecimals = (num: number, decimals: number = 2) => Number(num.toFixed(decimals));

  if (value >= 1_00_00_000) { // Convert to crores if value is 1 crore or more
    return `₹${roundToDecimals(value / 1_00_00_000)} Cr`;
  } else if (value >= 1_00_000) { // Convert to lakhs if value is 1 lakh or more
    return `₹${roundToDecimals(value / 1_00_000)} L`;
  } else {
    // For values less than 1 lakh, use standard formatting
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }
};