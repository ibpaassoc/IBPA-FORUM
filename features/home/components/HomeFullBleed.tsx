"use client";

import { FullBleedPhotoBreak } from "@/shared/components/public";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function HomeFullBleed() {
    const { t } = useLanguage();

    return (
        <FullBleedPhotoBreak
                src="/images/curated/home_photo_break.jpg"
                alt="Cinematic beauty portrait for IBPA visual break"
                eyebrow={t.home.copy.fullBleedEyebrow}
                title={t.home.copy.fullBleedTitle}
                className="mt-[clamp(1.6rem,3vw,2.4rem)] mb-[var(--space-2xl)]"
                objectPosition="center 38%"
                mobileObjectPosition="center 28%"
        />
    );
}
