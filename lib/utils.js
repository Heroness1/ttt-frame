
export function normalizeAddress(addr) {
  if (!addr) throw new Error("⚠️ Empty address provided");
  if (typeof addr !== "string") throw new Error("⚠️ Address must be string");

  
  const clean = addr.trim().toLowerCase();
  return clean.startsWith("0x") ? clean : `0x${clean}`;
}
