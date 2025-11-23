"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";

type MoneyInputProps = {
  id?: string;
  valueCents: number | null; // estado fuente de verdad
  onChangeCents: (cents: number | null) => void;
  currency?: string; // "USD", "EUR", "MXN"
  locale?: string; // "en-US", "es-ES", "es-MX"
  placeholder?: string;
  className?: string;
};

export function MoneyInput({
  id,
  valueCents,
  onChangeCents,
  currency = "USD",
  locale = "en-US",
  placeholder = "$499.00",
  className = "",
}: MoneyInputProps) {
  const [display, setDisplay] = useState("");

  useEffect(() => {
    if (valueCents == null) {
      setDisplay("");
      return;
    }
    setDisplay(
      new Intl.NumberFormat(locale, { style: "currency", currency }).format(
        valueCents / 100
      )
    );
  }, [valueCents, currency, locale]);

  function parseToCents(raw: string): number | null {
    const cleaned = raw.replace(/[^\d.,]/g, "");
    if (!cleaned) return null;

    const lastComma = cleaned.lastIndexOf(",");
    const lastDot = cleaned.lastIndexOf(".");
    let normalized = cleaned;

    if (lastComma > lastDot) {
      // coma como decimal
      normalized = cleaned.replace(/\./g, "").replace(",", ".");
    } else {
      // punto como decimal
      normalized = cleaned.replace(/,/g, "");
    }

    const num = Number.parseFloat(normalized);
    if (Number.isNaN(num)) return null;
    return Math.round(num * 100);
  }

  const format = (cents: number) =>
    new Intl.NumberFormat(locale, { style: "currency", currency }).format(
      cents / 100
    );

  return (
    <Input
      id={id}
      type="text"
      inputMode="decimal"
      autoComplete="off"
      placeholder={placeholder}
      value={display}
      onChange={(e) => setDisplay(e.target.value)}
      onBlur={(e) => {
        const cents = parseToCents(e.target.value);
        onChangeCents(cents);
        setDisplay(cents != null ? format(cents) : "");
      }}
      className={className}
      aria-label="Amount"
    />
  );
}
