"use client";

import dynamic from "next/dynamic";
import ApplicationFormSkeleton from "@/features/applications/components/application-form/ApplicationFormSkeleton";

const JuryApplicationForm = dynamic(() => import("./JuryApplicationForm"), {
  loading: () => <ApplicationFormSkeleton />,
});

export default function JuryApplicationFormLoader({
  accessToken,
}: {
  accessToken: string;
}) {
  return <JuryApplicationForm accessToken={accessToken} />;
}
