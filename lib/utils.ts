import { isAddress } from "viem";

export function shortAddress(address: string): string {
  if (!address) return "";
  if (address.length <= 10) return address;
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function formatDate(timestamp: number | bigint): string {
  const date = new Date(Number(timestamp) * 1000);
  return date.toLocaleString();
}

export function formatDateFromMs(timestamp: number): string {
  return new Date(timestamp).toLocaleString();
}

export function isValidEthereumAddress(address: string): boolean {
  if (!address || typeof address !== "string") return false;
  return isAddress(address.trim());
}

export function classNames(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}
