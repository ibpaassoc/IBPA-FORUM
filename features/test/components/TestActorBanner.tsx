import { getAppSession } from "@/auth";
import { stopTestActorAction } from "@/app/test/actions";
import { getTestActor } from "@/features/test/server/auth";

export async function TestActorBanner() {
  const actor = await getTestActor();
  if (actor) {
    return (
      <div className="fixed inset-x-3 top-3 z-[90] mx-auto flex max-w-xl items-center justify-between gap-3 rounded-full border border-white/15 bg-zinc-950/90 px-4 py-2 text-xs font-semibold text-zinc-200 shadow-2xl backdrop-blur-xl">
        <span>TEST · {actor.role.toLowerCase()}</span>
        <form action={stopTestActorAction}>
          <button type="submit" className="rounded-full bg-white px-3 py-1.5 text-zinc-950">Return to console</button>
        </form>
      </div>
    );
  }

  const session = await getAppSession();
  if (session?.user?.dataScope !== "DEV") return null;

  return (
    <div className="fixed inset-x-3 top-3 z-[90] mx-auto flex max-w-xl items-center justify-between gap-3 rounded-full border border-white/15 bg-zinc-950/90 px-4 py-2 text-xs font-semibold text-zinc-200 shadow-2xl backdrop-blur-xl">
      <span>DEV · {session.user.role.toLowerCase()}</span>
      <a href="/test/dev-accounts" className="rounded-full bg-white px-3 py-1.5 text-zinc-950">Open DEV panel</a>
    </div>
  );
}
