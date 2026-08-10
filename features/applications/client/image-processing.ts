"use client";

const COMPRESS_QUALITY = 0.78;
const COMPRESS_MAX_DIM = 2400;
const AUTO_COMPRESS_THRESHOLD_BYTES = 5 * 1024 * 1024;
const THUMBNAIL_QUALITY = 0.72;
const THUMBNAIL_MAX_DIM = 720;

const uploadThumbnails = new WeakMap<File, File>();

function scaledDimensions(width: number, height: number, maxDimension: number) {
  if (width <= maxDimension && height <= maxDimension) return { width, height };
  const scale = maxDimension / Math.max(width, height);
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

function canvasBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
): Promise<Blob | null> {
  return new Promise((resolve) => {
    try {
      canvas.toBlob(resolve, type, quality);
    } catch {
      resolve(null);
    }
  });
}

function releaseCanvas(canvas: HTMLCanvasElement) {
  canvas.width = 1;
  canvas.height = 1;
}

/**
 * Decode one selected image, cap its upload dimensions, and retain only a small
 * thumbnail for the grid. Full-resolution thumbnails are expensive on mobile:
 * a 12 MP JPEG occupies roughly 48 MB once decoded even when displayed in a
 * 200 px card.
 */
export async function processUploadImage(file: File): Promise<File> {
  return new Promise((resolve) => {
    const image = new Image();
    const sourceUrl = URL.createObjectURL(file);
    let sourceReleased = false;

    function releaseSource() {
      if (sourceReleased) return;
      sourceReleased = true;
      URL.revokeObjectURL(sourceUrl);
      image.onload = null;
      image.onerror = null;
      image.src = "";
    }

    image.onerror = () => {
      releaseSource();
      resolve(file);
    };

    image.onload = async () => {
      const originalWidth = image.naturalWidth || image.width;
      const originalHeight = image.naturalHeight || image.height;
      if (!originalWidth || !originalHeight) {
        releaseSource();
        resolve(file);
        return;
      }

      const uploadSize = scaledDimensions(
        originalWidth,
        originalHeight,
        COMPRESS_MAX_DIM,
      );
      const uploadCanvas = document.createElement("canvas");
      uploadCanvas.width = uploadSize.width;
      uploadCanvas.height = uploadSize.height;
      const uploadContext = uploadCanvas.getContext("2d");
      if (!uploadContext) {
        releaseSource();
        resolve(file);
        return;
      }

      try {
        uploadContext.drawImage(image, 0, 0, uploadSize.width, uploadSize.height);
        releaseSource();

        const thumbnailSize = scaledDimensions(
          uploadSize.width,
          uploadSize.height,
          THUMBNAIL_MAX_DIM,
        );
        const thumbnailCanvas = document.createElement("canvas");
        thumbnailCanvas.width = thumbnailSize.width;
        thumbnailCanvas.height = thumbnailSize.height;
        const thumbnailContext = thumbnailCanvas.getContext("2d");
        if (!thumbnailContext) {
          releaseCanvas(uploadCanvas);
          resolve(file);
          return;
        }
        thumbnailContext.drawImage(
          uploadCanvas,
          0,
          0,
          thumbnailSize.width,
          thumbnailSize.height,
        );

        const shouldCompressUpload =
          file.size > AUTO_COMPRESS_THRESHOLD_BYTES ||
          uploadSize.width !== originalWidth ||
          uploadSize.height !== originalHeight;
        const [uploadBlob, thumbnailBlob] = await Promise.all([
          shouldCompressUpload
            ? canvasBlob(uploadCanvas, "image/jpeg", COMPRESS_QUALITY)
            : Promise.resolve(null),
          canvasBlob(thumbnailCanvas, "image/jpeg", THUMBNAIL_QUALITY),
        ]);
        releaseCanvas(uploadCanvas);
        releaseCanvas(thumbnailCanvas);

        const processed =
          uploadBlob && uploadBlob.size < file.size
            ? new File([uploadBlob], file.name.replace(/\.[^.]+$/, ".jpg"), {
                type: "image/jpeg",
                lastModified: file.lastModified,
              })
            : file;
        if (thumbnailBlob) {
          uploadThumbnails.set(
            processed,
            new File([thumbnailBlob], `${processed.name}.thumbnail.jpg`, {
              type: "image/jpeg",
              lastModified: processed.lastModified,
            }),
          );
        }
        resolve(processed);
      } catch {
        releaseSource();
        releaseCanvas(uploadCanvas);
        resolve(file);
      }
    };

    image.src = sourceUrl;
  });
}

export function getUploadThumbnail(file: File) {
  return uploadThumbnails.get(file);
}
