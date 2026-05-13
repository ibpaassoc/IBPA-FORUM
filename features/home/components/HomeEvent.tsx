"use client";

import { EventExperienceCollage } from "@/features/home/components/";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function HomeTimeline() {
    const { t } = useLanguage();

    return (
        <EventExperienceCollage
                eyebrow={t.home.copy.eventExperience}
                title={t.home.copy.eventTitle}
                primaryCaption={t.home.copy.eventPrimaryCaption}
                audienceCaption={t.home.copy.eventAudienceCaption}
                detailCaption={t.home.copy.eventDetailCaption}
                stageCaption={t.home.copy.eventStageCaption}
                ambienceLabel={t.home.copy.eventAmbienceLabel}
                liveLabel={t.home.copy.eventLiveLabel}
        />
    );
}
