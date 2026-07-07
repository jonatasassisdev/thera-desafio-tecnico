function maskCPF(digits: string): string {
  let out = "";
  for (let i = 0; i < digits.length; i++) {
    if (i === 3 || i === 6) out += ".";
    if (i === 9) out += "-";
    out += digits[i];
  }
  return out;
}

function maskCNPJ(digits: string): string {
  let out = "";
  for (let i = 0; i < digits.length; i++) {
    if (i === 2 || i === 5) out += ".";
    if (i === 8) out += "/";
    if (i === 12) out += "-";
    out += digits[i];
  }
  return out;
}

/** Formats a raw string as CPF (up to 11 digits) or CNPJ (12-14 digits), switching mask progressively as the user types. */
export function formatDocument(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 14);
  return digits.length <= 11 ? maskCPF(digits) : maskCNPJ(digits);
}
