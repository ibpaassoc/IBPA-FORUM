"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { upload } from "@vercel/blob/client";
import { CheckCircle2, ImageUp, Loader2, UploadCloud, X } from "lucide-react";
import type { BlobFileInfo } from "@/features/jury/server/uploads";
import {
  PROFILE_PHOTO_ACCEPT_ATTR,
  getProfilePhotoRejectReason,
} from "@/features/jury/lib/profile-photo";
import { adminT } from "@/lib/i18n/admin";
import {
  DashboardPrimaryBtn,
  DashboardSecondaryBtn,
} from "@/shared/components/admin/DashboardUI";

function sanitizeBlobName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

type Status =
  | { type: "idle" }
  | { type: "uploading" }
  | { type: "saving" }
  | { type: "success" }
  | { type: "error"; message: string };

function PreviewTile({
  caption,
  src,
  alt,
  highlight,
}: {
  caption: string;
  src: string;
  alt: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-ink-soft)]">
        {caption}
      </p>
      <div
        className={`overflow-hidden rounded-[22px] border bg-white/62 ${
          highlight
            ? "border-[rgba(114,160,193,0.5)] ring-2 ring-[rgba(114,160,193,0.28)]"
            : "border-[rgba(37,42,45,0.08)]"
        }`}
      >
        <Image
          src={src}
          alt={alt}
          width={480}
          height={480}
          unoptimized
          className="aspect-square w-full object-cover"
        />
      </div>
    </div>
  );
}

export default function JuryProfilePhotoEditor({
  applicationId,
  currentPhotoFileId,
  fullName,
}: {
  applicationId: string;
  currentPhotoFileId: string | null;
  fullName: string;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>({ type: "idle" });

  // Revoke the object URL whenever it changes or the component unmounts.
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const isBusy = status.type === "uploading" || status.type === "saving";

  function clearSelection() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(null);
    setPreviewUrl(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  function handleSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    event.target.value = "";
    if (!file) return;

    const reason = getProfilePhotoRejectReason({
      mimeType: file.type,
      fileSize: file.size,
    });
    if (reason === "type") {
      setStatus({ type: "error", message: adminT.edit.photoInvalidType });
      return;
    }
    if (reason === "size") {
      setStatus({ type: "error", message: adminT.edit.photoTooLarge });
      return;
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setStatus({ type: "idle" });
  }

  async function handleSave() {
    if (!selectedFile) return;

    try {
      setStatus({ type: "uploading" });

      const uploadSessionId = crypto.randomUUID();
      const result = await upload(
        `jury/${uploadSessionId}/profilePhoto-1-${sanitizeBlobName(selectedFile.name)}`,
        selectedFile,
        { access: "private", handleUploadUrl: "/api/jury/upload", multipart: true }
      );

      const profilePhotoBlob: BlobFileInfo = {
        fileName: selectedFile.name,
        mimeType: selectedFile.type || "image/jpeg",
        fileSize: selectedFile.size,
        storageKey: result.pathname,
      };

      setStatus({ type: "saving" });

      const res = await fetch(
        `/api/admin/jury-applications/${applicationId}/photo`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profilePhotoBlob }),
        }
      );

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error || adminT.edit.photoSaveError);
      }

      // Old photo stays visible until the refreshed server data swaps in the new one.
      clearSelection();
      setStatus({ type: "success" });
      router.refresh();
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : adminT.edit.photoSaveError,
      });
    }
  }

  const hasCurrent = Boolean(currentPhotoFileId);
  const hasSelection = Boolean(selectedFile && previewUrl);

  return (
    <div className="rounded-[28px] border border-[rgba(114,160,193,0.18)] bg-white/76 shadow-[0_22px_70px_rgba(37,42,45,0.075)] backdrop-blur-2xl">
      <div className="border-b border-[rgba(37,42,45,0.08)] p-4 md:p-5">
        <div className="flex items-center gap-2 text-[var(--color-blue)]">
          <ImageUp aria-hidden size={16} />
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em]">
            {adminT.edit.profilePhoto}
          </p>
        </div>
        <p className="mt-2 text-xs leading-5 text-[var(--color-ink-soft)]">
          {adminT.edit.photoSectionHint}
        </p>
      </div>

      <div className="flex flex-col gap-4 p-4 md:p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          {hasCurrent ? (
            <PreviewTile
              caption={adminT.edit.currentPhoto}
              src={`/api/admin/jury-files/${currentPhotoFileId}`}
              alt={fullName}
            />
          ) : !hasSelection ? (
            <div className="flex aspect-square items-center justify-center rounded-[22px] border border-dashed border-[rgba(37,42,45,0.14)] bg-white/62 text-sm text-[var(--color-ink-soft)] sm:col-span-2">
              {adminT.edit.noPhotoYet}
            </div>
          ) : null}

          {hasSelection && previewUrl ? (
            <PreviewTile
              caption={adminT.edit.newPhoto}
              src={previewUrl}
              alt={selectedFile?.name ?? adminT.edit.newPhoto}
              highlight
            />
          ) : null}
        </div>

        {status.type === "error" ? (
          <div className="rounded-[18px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {status.message}
          </div>
        ) : null}

        {status.type === "success" ? (
          <div className="flex items-center gap-2 rounded-[18px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            <CheckCircle2 aria-hidden size={15} />
            {adminT.edit.photoUpdated}
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-2">
          <label
            className={`inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full border border-[rgba(114,160,193,0.22)] bg-white/78 px-5 py-2.5 text-[0.72rem] font-semibold uppercase leading-none tracking-[0.12em] text-[var(--color-ink)] shadow-[0_12px_28px_rgba(37,42,45,0.055)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-[var(--color-blue)] hover:bg-[var(--color-blue-wash)] focus-within:ring-4 focus-within:ring-[rgba(114,160,193,0.22)] ${
              isBusy ? "pointer-events-none opacity-50" : ""
            }`}
          >
            <UploadCloud aria-hidden size={15} />
            {hasCurrent || hasSelection
              ? adminT.edit.replacePhoto
              : adminT.edit.selectPhoto}
            <input
              ref={inputRef}
              type="file"
              accept={PROFILE_PHOTO_ACCEPT_ATTR}
              disabled={isBusy}
              className="sr-only"
              onChange={handleSelect}
            />
          </label>

          {hasSelection ? (
            <>
              <DashboardPrimaryBtn
                type="button"
                onClick={handleSave}
                disabled={isBusy}
              >
                {status.type === "uploading" ? (
                  <>
                    <Loader2 aria-hidden size={15} className="animate-spin" />
                    {adminT.edit.uploadingPhoto}
                  </>
                ) : status.type === "saving" ? (
                  <>
                    <Loader2 aria-hidden size={15} className="animate-spin" />
                    {adminT.edit.savingPhoto}
                  </>
                ) : (
                  <>
                    <CheckCircle2 aria-hidden size={15} />
                    {adminT.edit.savePhoto}
                  </>
                )}
              </DashboardPrimaryBtn>
              <DashboardSecondaryBtn
                type="button"
                onClick={clearSelection}
                disabled={isBusy}
              >
                <X aria-hidden size={15} />
                {adminT.common.cancel}
              </DashboardSecondaryBtn>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
