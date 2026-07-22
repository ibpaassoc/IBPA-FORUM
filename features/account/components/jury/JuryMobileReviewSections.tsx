"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { useReducedMotion } from "framer-motion";
import {
  MobileLayeredNominationNavigation,
  type MobileNominationItem,
  type MobileSectionItem,
} from "@/features/account/components/mobile/MobileLayeredNominationNavigation";

type JuryReviewSectionId = "submission" | "files" | "scorecard";

export default function JuryMobileReviewSections({
  nominations,
  nominationId,
  sections,
  children,
}: {
  nominations: MobileNominationItem[];
  nominationId: string;
  sections: MobileSectionItem[];
  children: ReactNode;
}) {
  const shouldReduceMotion = useReducedMotion();
  const [activeSection, setActiveSection] = useState<JuryReviewSectionId>("submission");

  function selectSection(id: string) {
    if (id !== "submission" && id !== "files" && id !== "scorecard") return;
    setActiveSection(id);
    requestAnimationFrame(() => {
      document.getElementById("jury-review-sections")?.scrollIntoView({
        behavior: shouldReduceMotion ? "auto" : "smooth",
        block: "start",
      });
    });
  }

  return (
    <div
      className="group/jury flex flex-col gap-5"
      data-jury-section={activeSection}
    >
      <MobileLayeredNominationNavigation
        nominations={nominations}
        activeNominationId={nominationId}
        sections={sections}
        activeSectionId={activeSection}
        onSectionSelect={selectSection}
        progressEventName={`ibpa:jury-review-progress:${nominationId}`}
        labels={{
          backLabel: "All nominations",
          backHref: "/account/jury/nominations",
          selectorLabel: "Choose a nomination to review",
          drawerTitle: "Assigned nominations",
          drawerDescription: "Switch between nominations in your review queue.",
          sectionLabel: "Review sections",
          closeLabel: "Close nominations",
          selectedLabel: "Selected nomination",
        }}
      />
      {children}
    </div>
  );
}
