"use client";

import type { InputHTMLAttributes } from "react";
import FieldShell, { inputClassName } from "@/features/jury/components/jury-application/fields/FieldShell";

export default function TextInput(
  props: InputHTMLAttributes<HTMLInputElement> & {
    label: string;
    hint?: string;
  }
) {
  const { label, hint, required, className, ...rest } = props;

  return (
    <FieldShell label={label} hint={hint} required={required}>
      <input className={className ?? inputClassName} required={required} {...rest} />
    </FieldShell>
  );
}
