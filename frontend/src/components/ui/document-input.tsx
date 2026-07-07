import { forwardRef } from "react";
import { Input } from "./field";
import { formatDocument } from "@/lib/format-document";

interface DocumentInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
  value: string;
  onChange: (value: string) => void;
}

/** Text input for CPF/CNPJ with progressive masking — switches from CPF to CNPJ format automatically past 11 digits. */
export const DocumentInput = forwardRef<HTMLInputElement, DocumentInputProps>(function DocumentInput(
  { value, onChange, placeholder = "CPF ou CNPJ", ...props },
  ref,
) {
  return (
    <Input
      ref={ref}
      inputMode="numeric"
      autoComplete="off"
      maxLength={18}
      placeholder={placeholder}
      value={formatDocument(value)}
      onChange={(e) => onChange(formatDocument(e.target.value))}
      {...props}
    />
  );
});
