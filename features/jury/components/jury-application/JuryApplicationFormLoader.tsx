"use client";

import dynamic from "next/dynamic";
import ApplicationFormSkeleton from "@/features/applications/components/application-form/ApplicationFormSkeleton";

const JuryApplicationForm = dynamic(() => import("./JuryApplicationForm"), {
  loading: () => <ApplicationFormSkeleton />,
});

export default function JuryApplicationFormLoader() {
  return <JuryApplicationForm />;
}
