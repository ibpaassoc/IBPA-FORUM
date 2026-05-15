"use client";

import {
  EditorialHero,
  EditorialPhotoCard,
} from "@/shared/components/public";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function HomeHero() {
  const { t } = useLanguage();

  return (
    <EditorialHero
      title={t.home.hero.title}
      description={t.home.hero.description}
      className="pb-[clamp(3rem,7vw,6rem)]"
      variant="home"
      media={
        <div className="mx-auto w-full max-w-[460px] xl:max-w-none">
          <EditorialPhotoCard
            src="/images/editorial/HomeHero.jpg"
            alt="IBPA Beauty Award trophies"
            overlay="soft"
            aspect="portrait"
            objectPosition="center 50%"
            mobileObjectPosition="center 50%"
            priority
            className="
              relative z-10 overflow-hidden rounded-[var(--radius-lg)]
              shadow-[0_28px_80px_rgba(37,42,45,0.12)]
              xl:[&>div]:!aspect-auto
              xl:[&>div]:!h-[clamp(520px,52vw,760px)]
            "
          />
        </div>
      }
    />
  );
}
