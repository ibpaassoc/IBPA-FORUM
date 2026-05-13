
"use client";

import {
  CreditCard,
  FileText,
  Search,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import {
  IconBadge,
  ProcessTimeline,
} from "@/shared/components/public";


export default function JuryTimeline() {
  const { t } = useLanguage();

  return (
    <ProcessTimeline
      eyebrow={t.juryPage.copy.processLabel}
      title={t.juryPage.copy.processTitle}
      steps={[
        {
          id: "1",
          icon: <IconBadge icon={FileText} />,
          title: t.juryPage.copy.apply,
          text: t.juryPage.copy.applyText,
        },
        {
          id: "2",
          icon: <IconBadge icon={Search} />,
          title: t.juryPage.copy.approved,
          text: t.juryPage.copy.approvedText,
        },
        {
          id: "3",
          icon: <IconBadge icon={CreditCard} />,
          title: t.juryPage.copy.registration,
          text: t.juryPage.copy.registrationText,
        },
      ]}
    />
  );
}
