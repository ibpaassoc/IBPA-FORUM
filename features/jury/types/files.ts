export type JuryApplicationFileView = {
  id: string;
  fieldKey: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  storageKey: string | null;
  createdAt: Date;
};
