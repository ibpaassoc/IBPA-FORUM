"use client";

import {
  IconBadge,
  StaggerContainer,
} from "@/shared/components/public";

import {
  Award,
  BadgeCheck,
  Calendar,
  Camera,
  Globe,
  HeartHandshake,
  Trophy,
  Users,
} from "lucide-react";

import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function HomeWhy() {
    const { t } = useLanguage();

    const categoryIconMap = [Camera, Trophy, Award, BadgeCheck, Globe, Users, HeartHandshake, Calendar];

    const leadershipItems = t.home.process.steps.slice(0, 4).map((step) => ({
        id: step.number,
        icon: <IconBadge icon={categoryIconMap[(Number(step.number) || 1) % categoryIconMap.length]} />,
        title: step.title,
        text: step.text,
    }));

    return (
        <section key="gallery" className="section-rhythm-tight">
                <div className="page-section">
                <div className="rounded-[var(--radius)] border border-[var(--border-default)] bg-[linear-gradient(180deg,var(--surface-tint)_0%,var(--surface)_100%)] p-[clamp(1.1rem,2.8vw,2rem)]">
                    <div className="max-w-3xl">
                    <p className="page-eyebrow">{t.home.copy.whyEyebrow}</p>
                    <h2 className="mt-[var(--space-sm)] text-[clamp(2rem,4.6vw,4.3rem)] leading-[1.05] text-[var(--color-ink)]">{t.home.copy.whyTitle}</h2>
                    <p className="mt-[var(--space-sm)] text-[clamp(0.95rem,1.7vw,1.12rem)] leading-[1.75] text-[var(--color-ink-soft)]">{t.home.copy.whyText}</p>
                    </div>

                    <StaggerContainer className="mt-[var(--space-lg)] grid gap-[var(--space-md)] md:grid-cols-2" stagger={0.09}>
                    {leadershipItems.map((item) => (
                        <article
                        key={item.id}
                        className="group relative overflow-hidden rounded-[var(--radius)] border border-[var(--border-default)] bg-[var(--surface)] p-[var(--space-lg)] transition-shadow duration-300 hover:shadow-[var(--shadow-md)]"
                        >
                        <div className="absolute inset-x-0 top-0 h-[2px] bg-[var(--color-hover)]/70 opacity-60 transition-opacity duration-300 group-hover:opacity-100" />
                        <div className="flex items-start justify-between gap-4">
                            {item.icon}
                            <h3 className="mt-[var(--space-sm)] text-[clamp(1.2rem,1.9vw,1.65rem)] leading-[1.2] text-[var(--color-ink)]">
                                {item.title}
                            </h3>
                            <span className="text-[0.68rem] font-medium tracking-[0.18em] text-[var(--color-hover)]">{item.id}</span>
                        </div>
                        </article>
                    ))}
                    </StaggerContainer>
                </div>
                </div>
            </section>
    );
}
