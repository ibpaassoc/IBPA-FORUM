import type { Metadata } from "next";
import WinnersGallery from "@/features/winners/WinnersGallery";
import { LandingPageShell } from "@/shared/components/public";

export const metadata: Metadata = {
  title: "Winners | IBPA Beauty Awards",
  description: "Meet the artists and innovators celebrated at the 2025 IBPA Beauty Awards.",
};

export default function WinnersPage() {
  return <LandingPageShell><WinnersGallery /></LandingPageShell>;
}
