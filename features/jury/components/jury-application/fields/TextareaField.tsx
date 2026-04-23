"use client";

import type { TextareaHTMLAttributes } from "react";
import FieldShell, { inputClassName } from "@/features/jury/components/jury-application/fields/FieldShell";

const textareaClassName =
  `${inputClassName} min-h-[132px]`;

export default function TextareaField(
  props: TextareaHTMLAttributes<HTMLTextAreaElement> & {
    label: string;
    hint?: string;
  }
) {
  const { label, hint, required, className, ...rest } = props;

  return (
    <FieldShell label={label} hint={hint} required={required}>
      <textarea
        className={className ?? textareaClassName}
        required={required}
        {...rest}
      />
    </FieldShell>
  );
}
