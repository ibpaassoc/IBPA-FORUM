"use client";

import { useRef, useState } from "react";
import { upload } from "@vercel/blob/client";
import { CheckCircle2, FileUp, Loader2, Upload } from "lucide-react";
import type { BlobFileInfo } from "@/features/jury/server/uploads";
import FilePreviewGallery from "@/shared/components/files/FilePreviewGallery";

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
      <label className="text-sm font-semibold text-[var(--color-ink)]">
        {label}
        {required ? <span className="ml-1 text-[var(--color-blue)]">*</span> : null}
      </label>
      {hint ? <p className="text-xs leading-5 text-[var(--color-ink-soft)]">{hint}</p> : null}
      {children}
      {error ? <p className="text-xs font-medium text-red-600">{error}</p> : null}
    </div>
  );
}

const inputClass =
  "w-full rounded-[22px] border border-[rgba(37,42,45,0.1)] bg-white/76 px-4 py-3 text-sm text-[var(--color-ink)] outline-none transition placeholder:text-[rgba(70,82,90,0.46)] focus:border-[rgba(114,160,193,0.58)] focus:ring-4 focus:ring-[rgba(114,160,193,0.14)] disabled:opacity-50";

const textareaClass =
  "w-full resize-none rounded-[22px] border border-[rgba(37,42,45,0.1)] bg-white/76 px-4 py-3 text-sm leading-7 text-[var(--color-ink)] outline-none transition placeholder:text-[rgba(70,82,90,0.46)] focus:border-[rgba(114,160,193,0.58)] focus:ring-4 focus:ring-[rgba(114,160,193,0.14)] disabled:opacity-50";

function sanitizeBlobName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

function isValidUrl(value: string) {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
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
    if (!website.trim()) e.website = "Instagram is required.";
    else if (!isValidUrl(website.trim())) e.website = "Please enter a valid Instagram URL.";
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
        // Public blob: shown on the public jury page once approved (served by URL).
        const result = await upload(
          `jury/${uploadSessionId}/profilePhoto-1-${sanitizeBlobName(profilePhotoFile.name)}`,
          profilePhotoFile,
          {
            access: "public",
            handleUploadUrl: `/api/jury/upload?infoToken=${encodeURIComponent(token)}`,
            multipart: true,
          }
        );
        profilePhotoBlob = {
          fileName: profilePhotoFile.name,
          mimeType: profilePhotoFile.type || "image/jpeg",
          fileSize: profilePhotoFile.size,
          storageKey: result.url,
        };
      }

      for (let i = 0; i < certFiles.length; i++) {
        const file = certFiles[i];
        const result = await upload(
          `jury/${uploadSessionId}/certifications-${i + 1}-${sanitizeBlobName(file.name)}`,
          file,
          {
            access: "private",
            handleUploadUrl: `/api/jury/upload?infoToken=${encodeURIComponent(token)}`,
            multipart: true,
          }
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
          professionalWebsite: website.trim(),
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
      <div className="flex flex-col items-center gap-5 rounded-[28px] border border-emerald-200 bg-white/82 px-8 py-12 text-center shadow-[0_24px_70px_rgba(42,66,82,0.08)] backdrop-blur-xl">
        <div className="flex size-16 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle2 className="text-emerald-600" size={32} />
        </div>
        <div>
          <h2 className="font-[var(--font-title-family)] text-3xl font-light text-[var(--color-ink)]">Application updated</h2>
          <p className="mt-2 max-w-md text-sm leading-7 text-[var(--color-ink-soft)]">
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
        <div className="rounded-[20px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
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
          placeholder="Describe your professional background, key achievements, and expertise..."
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
          placeholder="Your motivation for serving on the IBPA jury..."
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
          placeholder="Describe any potential conflicts of interest..."
          disabled={isLoading}
          className={textareaClass}
        />
      </Field>

      <Field
        label="Instagram"
        hint="Required - provide your Instagram profile link."
        required
        error={errors.website}
      >
        <input
          type="url"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          placeholder="https://instagram.com/yourprofile"
          disabled={isLoading}
          className={inputClass}
        />
      </Field>

      <div className="border-t border-[rgba(37,42,45,0.08)] pt-7">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-blue)]">
          File updates (optional)
        </p>
        <p className="mt-1 text-xs leading-5 text-[var(--color-ink-soft)]">
          Upload a new profile photo or additional certifications if requested. Leave blank to keep your existing files.
        </p>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <Field label="Replace Profile Photo" hint="JPG or PNG, max 3 MB.">
            <label className="group flex cursor-pointer flex-col items-center gap-2 rounded-[24px] border-2 border-dashed border-[rgba(37,42,45,0.12)] bg-white/72 px-4 py-5 text-center transition hover:border-[rgba(114,160,193,0.56)] hover:bg-[var(--color-blue-wash)]">
              <Upload size={20} className="text-[var(--color-ink-muted)] transition group-hover:text-[var(--color-blue)]" />
              <span className="text-xs text-[var(--color-ink-soft)]">
                {profilePhotoFile ? "Click to replace photo" : "Click to upload photo"}
              </span>
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
            {profilePhotoFile ? (
              <FilePreviewGallery
                items={[{
                  id: `profile-${profilePhotoFile.name}-${profilePhotoFile.size}-${profilePhotoFile.lastModified}`,
                  name: profilePhotoFile.name,
                  size: profilePhotoFile.size,
                  mimeType: profilePhotoFile.type,
                  source: profilePhotoFile,
                }]}
                onRemove={() => {
                  setProfilePhotoFile(null);
                  if (photoInputRef.current) photoInputRef.current.value = "";
                }}
                className="mt-2 sm:grid-cols-1 xl:grid-cols-1"
              />
            ) : null}
          </Field>

          <Field label="Additional Certifications" hint="JPG, PNG, or PDF. Up to 5 files, max 3 MB each.">
            <label className="group flex cursor-pointer flex-col items-center gap-2 rounded-[24px] border-2 border-dashed border-[rgba(37,42,45,0.12)] bg-white/72 px-4 py-5 text-center transition hover:border-[rgba(114,160,193,0.56)] hover:bg-[var(--color-blue-wash)]">
              <FileUp size={20} className="text-[var(--color-ink-muted)] transition group-hover:text-[var(--color-blue)]" />
              <span className="text-xs text-[var(--color-ink-soft)]">
                {certFiles.length > 0 ? "Click to replace certifications" : "Click to upload certifications"}
              </span>
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
            {certFiles.length > 0 ? (
              <FilePreviewGallery
                items={certFiles.map((file, index) => ({
                  id: `cert-${file.name}-${file.size}-${file.lastModified}-${index}`,
                  name: file.name,
                  size: file.size,
                  mimeType: file.type,
                  source: file,
                }))}
                onRemove={(id) => {
                  setCertFiles((current) => current.filter((file, index) => `cert-${file.name}-${file.size}-${file.lastModified}-${index}` !== id));
                }}
                className="mt-2"
              />
            ) : null}
          </Field>
        </div>
      </div>

      <div className="border-t border-[rgba(37,42,45,0.08)] pt-5">
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex min-h-[52px] w-full items-center justify-center gap-2.5 rounded-full border border-[var(--color-blue)] bg-[var(--color-blue)] px-6 py-3 text-sm font-semibold tracking-wide text-white shadow-[0_18px_48px_rgba(114,160,193,0.22)] transition hover:-translate-y-0.5 hover:bg-[var(--color-hover-accent)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              {formState.type === "uploading" ? "Uploading files..." : "Submitting..."}
            </>
          ) : (
            "Submit Updated Application"
          )}
        </button>
      </div>
    </form>
  );
}
