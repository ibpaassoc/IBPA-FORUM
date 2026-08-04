import { getTestActor } from "@/features/test/server/auth";
import { stopTestActorAction } from "@/app/test/actions";

export async function TestActorBanner() {
  const actor = await getTestActor();
  if (!actor) return null;
  return (
    <div className="fixed inset-x-3 top-3 z-[90] mx-auto flex max-w-xl items-center justify-between gap-3 rounded-full border border-amber-300 bg-amber-50/95 px-4 py-2 text-xs font-semibold text-amber-950 shadow-lg backdrop-blur-xl">
      <span>TEST SESSION · {actor.role.toLowerCase()} · no production data</span>
      <form action={stopTestActorAction}>
        <button type="submit" className="rounded-full bg-amber-950 px-3 py-1.5 text-white">Return to /test</button>
      </form>
    </div>
  );
}
