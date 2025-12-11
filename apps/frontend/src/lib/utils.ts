import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const disclaimers = [
  "Products are for research use only. Not for human consumption.",
  "No medical advice or guidance is provided.",
  "Consult a licensed professional for any health-related questions.",
];
