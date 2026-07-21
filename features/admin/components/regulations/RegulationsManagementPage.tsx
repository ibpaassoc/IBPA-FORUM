"use client";

import { upload } from "@vercel/blob/client";
import { FileCheck2, FileText, LoaderCircle, Trash2, UploadCloud } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import type {
  AdminRegulationItem,
  RegulationLanguage,
} from "@/features/regulations/types";
import { regulationLanguages } from "@/features/regulations/types";
import {
  MAX_REGULATION_PDF_BYTES,
  regulationBlobPath,
} from "@/features/regulations/config";
import {
  DashboardBadge,
  DashboardCard,
  DashboardPageHeader,
} from "@/shared/components/admin/DashboardUI";
import Modal from "@/shared/components/ui/Modal";
import RegulationPdfFrame from "@/features/regulations/components/RegulationPdfFrame";

const languageLabels: Record<RegulationLanguage, string> = {
  en: "English",
  ru: "Русский",
  ua: "Українська",
};

type Props = {
  general: AdminRegulationItem;
  categories: AdminRegulationItem[];
};

function fileUrl(item: AdminRegulationItem, language: RegulationLanguage, version: number) {
  const params = new URLSearchParams({
    key: item.key,
    language,
    exact: "1",
    version: String(version),
  });
  return `/api/regulations/file?${params.toString()}`;
}

function RegulationCard({
  item,
  onOpen,
}: {
  item: AdminRegulationItem;
  onOpen: () => void;
}) {
  const fileCount = Object.values(item.availability).filter(Boolean).length;

  return (
    <button type="button" onClick={onOpen} className="block w-full text-left">
      <DashboardCard className="group h-full p-5 transition duration-200 hover:-translate-y-1 hover:border-[rgba(114,160,193,0.42)] hover:shadow-[0_24px_64px_rgba(79,115,139,0.14)]">
        <div className="flex items-start justify-between gap-4">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-[18px] border border-[rgba(114,160,193,0.18)] bg-[var(--color-blue-wash)] text-[var(--color-blue)]">
            <FileText aria-hidden size={20} strokeWidth={1.6} />
          </span>
          <DashboardBadge tone={fileCount === 3 ? "green" : fileCount > 0 ? "blue" : "neutral"}>
            {fileCount}/3
          </DashboardBadge>
        </div>

        <h2 className="mt-5 font-[var(--font-title-family)] text-[1.7rem] font-light leading-tight tracking-[-0.025em] text-[var(--color-ink)]">
          {item.title}
        </h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {regulationLanguages.map((language) => (
            <span
              key={language}
              className={`inline-flex min-h-7 items-center rounded-full border px-2.5 text-[0.62rem] font-semibold uppercase tracking-[0.1em] ${
                item.availability[language]
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-[rgba(37,42,45,0.08)] bg-white/62 text-[var(--color-ink-muted)]"
              }`}
            >
              {language.toUpperCase()}
            </span>
          ))}
        </div>
      </DashboardCard>
    </button>
  );
}

export default function RegulationsManagementPage({ general, categories }: Props) {
  const [items, setItems] = useState<AdminRegulationItem[]>([general, ...categories]);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [language, setLanguage] = useState<RegulationLanguage>("en");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [versions, setVersions] = useState<Record<string, number>>({});
  const inputRef = useRef<HTMLInputElement>(null);

  const activeItem = useMemo(
    () => items.find((item) => item.key === activeKey) ?? null,
    [activeKey, items],
  );
  const generalItem = items[0];
  const categoryItems = items.slice(1);
  const versionKey = activeItem ? `${activeItem.key}:${language}` : "";
  const hasFile = activeItem?.availability[language] ?? false;

  function updateAvailability(key: string, nextLanguage: RegulationLanguage, available: boolean) {
    setItems((current) =>
      current.map((item) =>
        item.key === key
          ? {
              ...item,
              availability: { ...item.availability, [nextLanguage]: available },
            }
          : item,
      ),
    );
  }

  function openItem(key: string) {
    setActiveKey(key);
    setLanguage("en");
    setMessage(null);
  }

  async function handleUpload(file: File) {
    if (!activeItem) return;
    if (file.type !== "application/pdf") {
      setMessage({ tone: "error", text: "Выберите PDF-файл." });
      return;
    }
    if (file.size > MAX_REGULATION_PDF_BYTES) {
      setMessage({ tone: "error", text: "Размер PDF не должен превышать 25 МБ." });
      return;
    }

    setPending(true);
    setMessage(null);
    try {
      const result = await upload(
        regulationBlobPath(activeItem.storageScope, language),
        file,
        {
          access: "private",
          handleUploadUrl: "/api/admin/regulations/upload",
          multipart: true,
          clientPayload: JSON.stringify({
            key: activeItem.key,
            categoryId: activeItem.categoryId,
            language,
          }),
        },
      );

      const response = await fetch("/api/admin/regulations", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: activeItem.key,
          categoryId: activeItem.categoryId,
          language,
          url: result.url,
        }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(payload.error || "Не удалось сохранить PDF.");

      updateAvailability(activeItem.key, language, true);
      setVersions((current) => ({ ...current, [versionKey]: Date.now() }));
      setMessage({ tone: "success", text: "PDF сохранён." });
    } catch (error) {
      setMessage({
        tone: "error",
        text: error instanceof Error ? error.message : "Не удалось загрузить PDF.",
      });
    } finally {
      setPending(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleDelete() {
    if (!activeItem || !hasFile) return;
    if (!window.confirm(`Удалить PDF (${languageLabels[language]})?`)) return;

    setPending(true);
    setMessage(null);
    try {
      const response = await fetch("/api/admin/regulations", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: activeItem.key,
          categoryId: activeItem.categoryId,
          language,
        }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(payload.error || "Не удалось удалить PDF.");

      updateAvailability(activeItem.key, language, false);
      setMessage({ tone: "success", text: "PDF удалён." });
    } catch (error) {
      setMessage({
        tone: "error",
        text: error instanceof Error ? error.message : "Не удалось удалить PDF.",
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-7">
      <DashboardPageHeader
        label="Документы"
        title="Регламенты"
      />

      <section>
        <p className="mb-3 text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-[var(--color-ink-soft)]">
          Общие регламенты
        </p>
        <div className="max-w-xl">
          <RegulationCard item={generalItem} onOpen={() => openItem(generalItem.key)} />
        </div>
      </section>

      <section>
        <p className="mb-3 text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-[var(--color-ink-soft)]">
          Регламенты категорий
        </p>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {categoryItems.map((item) => (
            <RegulationCard key={item.key} item={item} onOpen={() => openItem(item.key)} />
          ))}
        </div>
      </section>

      <Modal
        isOpen={Boolean(activeItem)}
        onClose={() => {
          if (!pending) setActiveKey(null);
        }}
        title={activeItem?.title ?? "Регламенты"}
        labelledById="regulation-admin-dialog-title"
      >
        {activeItem ? (
          <div className="space-y-4 font-[var(--font-ui-family)]">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {regulationLanguages.map((itemLanguage) => (
                <button
                  key={itemLanguage}
                  type="button"
                  onClick={() => {
                    setLanguage(itemLanguage);
                    setMessage(null);
                  }}
                  className={`min-h-10 shrink-0 rounded-[16px] border px-4 text-sm font-semibold transition ${
                    language === itemLanguage
                      ? "border-[var(--color-blue)] bg-[var(--color-blue)] text-white"
                      : "border-[rgba(114,160,193,0.2)] bg-white/72 text-[var(--color-ink-soft)] hover:bg-[var(--color-blue-wash)]"
                  }`}
                >
                  {languageLabels[itemLanguage]}
                </button>
              ))}
            </div>

            {hasFile ? (
              <div className="overflow-hidden rounded-[22px] border border-[rgba(114,160,193,0.2)] bg-[#eef3f6]">
                <RegulationPdfFrame
                  key={`${versionKey}:${versions[versionKey] ?? 0}`}
                  src={fileUrl(activeItem, language, versions[versionKey] ?? 0)}
                  title={`${activeItem.title} — ${languageLabels[language]}`}
                  loadingText="Загрузка PDF…"
                  errorText="Не удалось загрузить PDF. Попробуйте заменить файл."
                  className="h-[46vh] min-h-[320px]"
                />
              </div>
            ) : (
              <div className="flex min-h-[320px] flex-col items-center justify-center rounded-[22px] border border-dashed border-[rgba(114,160,193,0.38)] bg-[var(--color-blue-wash)]/55 px-6 text-center">
                <UploadCloud aria-hidden size={34} className="text-[var(--color-blue)]" strokeWidth={1.4} />
                <p className="mt-4 font-[var(--font-title-family)] text-2xl text-[var(--color-ink)]">
                  PDF ещё не загружен
                </p>
                <p className="mt-2 max-w-sm text-sm leading-6 text-[var(--color-ink-soft)]">
                  Загрузите положение на языке {languageLabels[language]}.
                </p>
              </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  ref={inputRef}
                  type="file"
                  accept="application/pdf,.pdf"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) void handleUpload(file);
                  }}
                />
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => inputRef.current?.click()}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[18px] bg-[var(--color-blue)] px-5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(114,160,193,0.28)] transition hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-60"
                >
                  {pending ? <LoaderCircle aria-hidden size={16} className="animate-spin" /> : hasFile ? <FileCheck2 aria-hidden size={16} /> : <UploadCloud aria-hidden size={16} />}
                  {hasFile ? "Заменить" : "Загрузить"}
                </button>
                {hasFile ? (
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => void handleDelete()}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[18px] border border-red-200 bg-red-50 px-5 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-wait disabled:opacity-60"
                  >
                    <Trash2 aria-hidden size={16} /> Удалить
                  </button>
                ) : null}
              </div>

              {message ? (
                <p
                  role="status"
                  className={`rounded-[16px] border px-4 py-2 text-sm ${
                    message.tone === "success"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-red-200 bg-red-50 text-red-700"
                  }`}
                >
                  {message.text}
                </p>
              ) : null}
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
