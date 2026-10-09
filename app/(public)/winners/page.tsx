import type { Metadata } from "next";
import WinnersGallery from "@/features/winners/WinnersGallery";
import { LandingPageShell } from "@/shared/components/public";

export const metadata: Metadata = {
  title: "Winners | IBPA Beauty Awards",
  description: "Meet the winners of the 2026 IBPA Beauty Awards and explore the 2025 archive.",
};

export default function WinnersPage() {
  return <LandingPageShell><WinnersGallery /></LandingPageShell>;
}
