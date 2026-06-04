export const BANKS = [
  { id: "gtbank", name: "Guaranty Trust Bank", shortName: "GTBank", color: "#E74C3C" },
  { id: "access", name: "Access Bank", shortName: "Access Bank", color: "#E67E22" },
  { id: "zenith", name: "Zenith Bank", shortName: "Zenith Bank", color: "#2980B9" },
  { id: "uba", name: "United Bank for Africa", shortName: "UBA", color: "#C0392B" },
  { id: "firstbank", name: "First Bank of Nigeria", shortName: "First Bank", color: "#1E8449" },
  { id: "kuda", name: "Kuda Bank", shortName: "Kuda", color: "#52057B" },
  { id: "opay", name: "OPay", shortName: "OPay", color: "#009688" },
  { id: "palmpay", name: "PalmPay", shortName: "PalmPay", color: "#4CAF50" },
] as const;

export type Bank = (typeof BANKS)[number];

export function getBanks(): Bank[] {
  return [...BANKS];
}

export function getBankById(id: string): Bank | undefined {
  return BANKS.find((b) => b.id === id);
}
