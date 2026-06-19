"use client";

import { useRef, useState } from "react";
import { upload } from "@vercel/blob/client";
import { CheckCircle2, FileUp, Loader2, Upload, X } from "lucide-react";
import type { BlobFileInfo } from "@/features/jury/server/uploads";

type FieldProps = {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
  error?: string;
};

function Field({ label, hint, required, children, error }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-[#1a1a1a]">
        {label}
        {required ? <span className="ml-1 text-[#c4874a]">*</span> : null}
      </label>
      {hint ? <p className="text-xs leading-5 text-black/50">{hint}</p> : null}
      {children}
      {error ? <p className="text-xs font-medium text-red-600">{error}</p> : null}
    </div>
  );
}

const inputClass =
  "w-full rounded-lg border border-black/12 bg-white px-4 py-3 text-sm text-[#1a1a1a] outline-none transition placeholder:text-black/35 focus:border-[#7DC8EE] focus:ring-4 focus:ring-[#EAF6FF] disabled:opacity-50";

const textareaClass =
  "w-full rounded-lg border border-black/12 bg-white px-4 py-3 text-sm leading-7 text-[#1a1a1a] outline-none transition placeholder:text-black/35 focus:border-[#7DC8EE] focus:ring-4 focus:ring-[#EAF6FF] disabled:opacity-50 resize-none";

function sanitizeBlobName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

type FormState =
  | { type: "idle" }
  | { type: "uploading" }
  | { type: "submitting" }
  | { type: "success" }
  | { type: "error"; message: string };

export default function AdditionalInfoForm({
  token,
  adminRequest,
  defaultBio,
  defaultMotivation,
  defaultConflictDisclosure,
  defaultWebsite,
}: {
  token: string;
  adminRequest: string;
  defaultBio: string;
  defaultMotivation: string;
  defaultConflictDisclosure: string;
  defaultWebsite?: string | null;
}) {
  const [bio, setBio] = useState(defaultBio);
  const [motivation, setMotivation] = useState(defaultMotivation);
  const [conflict, setConflict] = useState(defaultConflictDisclosure);
  const [website, setWebsite] = useState(defaultWebsite ?? "");
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);
  const [certFiles, setCertFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formState, setFormState] = useState<FormState>({ type: "idle" });
  void adminRequest;

  const photoInputRef = useRef<HTMLInputElement>(null);
  const certInputRef = useRef<HTMLInputElement>(null);

  function validate() {
    const e: Record<string, string> = {};
    if (!bio.trim()) e.bio = "Professional bio is required.";
    if (!motivation.trim()) e.motivation = "This field is required.";
    if (!conflict.trim()) e.conflict = "Conflict disclosure is required.";
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});

    const uploadSessionId = crypto.randomUUID();

    try {
      setFormState({ type: "uploading" });

      let profilePhotoBlob: BlobFileInfo | null = null;
      const certBlobs: BlobFileInfo[] = [];

      if (profilePhotoFile) {
        const result = await upload(
          `jury/${uploadSessionId}/profilePhoto-1-${sanitizeBlobName(profilePhotoFile.name)}`,
          profilePhotoFile,
          { access: "private", handleUploadUrl: "/api/jury/upload", multipart: true }
        );
        profilePhotoBlob = {
          fileName: profilePhotoFile.name,
          mimeType: profilePhotoFile.type || "image/jpeg",
          fileSize: profilePhotoFile.size,
          storageKey: result.pathname,
        };
      }

      for (let i = 0; i < certFiles.length; i++) {
        const file = certFiles[i];
        const result = await upload(
          `jury/${uploadSessionId}/certifications-${i + 1}-${sanitizeBlobName(file.name)}`,
          file,
          { access: "private", handleUploadUrl: "/api/jury/upload", multipart: true }
        );
        certBlobs.push({
          fileName: file.name,
          mimeType: file.type || "application/octet-stream",
          fileSize: file.size,
          storageKey: result.pathname,
        });
      }

      setFormState({ type: "submitting" });

      const res = await fetch(`/api/jury/additional-info/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          professionalBio: bio.trim(),
          motivation: motivation.trim(),
          conflictDisclosure: conflict.trim(),
          professionalWebsite: website.trim() || undefined,
          profilePhotoBlob,
          certificationBlobs: certBlobs,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Something went wrong. Please try again.");
      }

      setFormState({ type: "success" });
    } catch (err) {
      setFormState({
        type: "error",
        message: err instanceof Error ? err.message : "Something went wrong. Please try again.",
      });
    }
  }

  if (formState.type === "success") {
    return (
      <div className="flex flex-col items-center gap-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-8 py-12 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle2 className="text-emerald-600" size={32} />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-[#1a1a1a]">Application updated</h2>
          <p className="mt-2 max-w-md text-sm leading-7 text-black/60">
            Your updated application has been submitted to the IBPA review committee. You will be contacted when a decision has been reached.
          </p>
        </div>
      </div>
    );
  }

  const isLoading = formState.type === "uploading" || formState.type === "submitting";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-7">
      {formState.type === "error" ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {formState.message}
        </div>
      ) : null}

      <Field
        label="Professional Bio"
        hint="Share your background, achievements, and role in the industry. This bio may be published on the jury page if approved."
        required
        error={errors.bio}
      >
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={7}
          placeholder="Describe your professional background, key achievements, and expertise…"
          maxLength={2200}
          disabled={isLoading}
          className={textareaClass}
        />
      </Field>

      <Field
        label="Why do you want to serve as a judge?"
        hint="Describe what you would bring to the IBPA jury panel and why the role matters to you."
        required
        error={errors.motivation}
      >
        <textarea
          value={motivation}
          onChange={(e) => setMotivation(e.target.value)}
          rows={5}
          placeholder="Your motivation for serving on the IBPA jury…"
          maxLength={1500}
          disabled={isLoading}
          className={textareaClass}
        />
      </Field>

      <Field
        label="Conflict of Interest Disclosure"
        hint="Disclose any relationships with nominees, schools, salons, brands, or other participants."
        required
        error={errors.conflict}
      >
        <textarea
          value={conflict}
          onChange={(e) => setConflict(e.target.value)}
          rows={4}
          placeholder="Describe any potential conflicts of interest…"
          disabled={isLoading}
          className={textareaClass}
        />
      </Field>

      <Field
        label="Professional Website / LinkedIn"
        hint="Optional — provide a link to your professional profile or portfolio."
      >
        <input
          type="url"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          placeholder="https://"
          disabled={isLoading}
          className={inputClass}
        />
      </Field>

      <div className="border-t border-black/8 pt-7">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1673A5]">
          File updates (optional)
        </p>
        <p className="mt-1 text-xs leading-5 text-black/50">
          Upload a new profile photo or additional certifications if requested. Leave blank to keep your existing files.
        </p>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <Field label="Replace Profile Photo" hint="JPG or PNG, max 3 MB.">
            <label className="group flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-black/12 bg-[#FAFAFA] px-4 py-5 text-center transition hover:border-[#7DC8EE] hover:bg-[#EAF6FF]/40">
              <Upload size={20} className="text-black/30 transition group-hover:text-[#1673A5]" />
              {profilePhotoFile ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-[#1a1a1a]">{profilePhotoFile.name}</span>
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); setProfilePhotoFile(null); if (photoInputRef.current) photoInputRef.current.value = ""; }}
                    className="text-black/35 hover:text-red-600"
                  >
                    <X size={13} />
                  </button>
                </div>
              ) : (
                <span className="text-xs text-black/45">Click to upload photo</span>
              )}
              <input
                ref={photoInputRef}
                type="file"
                accept=".jpg,.jpeg,.png"
                disabled={isLoading}
                className="sr-only"
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null;
                  setProfilePhotoFile(file);
                }}
              />
            </label>
          </Field>

          <Field label="Additional Certifications" hint="JPG, PNG, or PDF. Up to 5 files, max 3 MB each.">
            <label className="group flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-black/12 bg-[#FAFAFA] px-4 py-5 text-center transition hover:border-[#7DC8EE] hover:bg-[#EAF6FF]/40">
              <FileUp size={20} className="text-black/30 transition group-hover:text-[#1673A5]" />
              {certFiles.length > 0 ? (
                <div className="flex flex-col items-center gap-1">
                  <span className="text-xs font-medium text-[#1a1a1a]">{certFiles.length} file{certFiles.length > 1 ? "s" : ""} selected</span>
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); setCertFiles([]); if (certInputRef.current) certInputRef.current.value = ""; }}
                    className="text-xs text-black/35 hover:text-red-600"
                  >
                    Clear
                  </button>
                </div>
              ) : (
                <span className="text-xs text-black/45">Click to upload certifications</span>
              )}
              <input
                ref={certInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                multiple
                disabled={isLoading}
                className="sr-only"
                onChange={(e) => {
                  const files = Array.from(e.target.files ?? []).slice(0, 5);
                  setCertFiles(files);
                }}
              />
            </label>
          </Field>
        </div>
      </div>

      <div className="border-t border-black/8 pt-5">
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex min-h-[52px] w-full items-center justify-center gap-2.5 rounded-xl bg-[#252a2d] px-6 py-3 text-sm font-semibold tracking-wide text-[#f3d881] transition hover:bg-[#1a1e21] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              {formState.type === "uploading" ? "Uploading files…" : "Submitting…"}
            </>
          ) : (
            "Submit Updated Application"
          )}
        </button>
      </div>
    </form>
  );
}
