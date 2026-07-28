export type UploadQueueTask<Result> = {
  id: string;
  upload: (
    onProgress: (progress: {
      loaded: number;
      total: number;
      percentage: number;
    }) => void,
  ) => Promise<Result>;
};

export type UploadQueueFailure = {
  id: string;
  error: Error;
};

export type UploadQueueResult<Result> = {
  completed: Map<string, Result>;
  failed: UploadQueueFailure[];
};

type UploadQueueOptions<Result> = {
  concurrency?: number;
  onStart?: (id: string) => void;
  onProgress?: (
    id: string,
    progress: { loaded: number; total: number; percentage: number },
  ) => void;
  onComplete?: (id: string, result: Result) => void;
  onError?: (id: string, error: Error) => void;
};

function asError(error: unknown) {
  return error instanceof Error ? error : new Error("The upload failed.");
}

/**
 * Runs browser uploads through a small worker pool. A task failure is isolated
 * to that file so other uploads can finish and their Blob references can be
 * retained for a later retry.
 */
export async function runUploadQueue<Result>(
  tasks: UploadQueueTask<Result>[],
  options: UploadQueueOptions<Result> = {},
): Promise<UploadQueueResult<Result>> {
  const concurrency = Math.max(
    1,
    Math.min(tasks.length || 1, Math.floor(options.concurrency ?? 3)),
  );
  const completed = new Map<string, Result>();
  const failed: UploadQueueFailure[] = [];
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < tasks.length) {
      const task = tasks[nextIndex];
      nextIndex += 1;
      options.onStart?.(task.id);

      try {
        const result = await task.upload((progress) => {
          options.onProgress?.(task.id, progress);
        });
        completed.set(task.id, result);
        options.onComplete?.(task.id, result);
      } catch (uploadError) {
        const error = asError(uploadError);
        failed.push({ id: task.id, error });
        options.onError?.(task.id, error);
      }
    }
  }

  await Promise.all(Array.from({ length: concurrency }, () => worker()));
  return { completed, failed };
}
