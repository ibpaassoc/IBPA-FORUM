import type { CategoryCatalogDefinition } from "@/features/applications/types/application.types";

/**
 * SEED-ONLY initial catalog.
 *
 * This static list is used to bootstrap the database (see prisma/seed.ts and
 * the seed-only syncApplicationCatalog helper). It is NOT the runtime source of
 * truth for the application flow: nominations/awards shown in the app are read
 * live from the DB via getApplicationCategories(). Do not import this into
 * request/runtime code to build the award selector — add awards to the DB
 * instead and they appear automatically.
 */
export const categoryCatalog: CategoryCatalogDefinition[] = [
  {
    slug: "hair",
    name: "Hair",
    awards: [
      "Award of Excellence in Hair Color Technique",
      "Barbering Excellence Award",
      "Hair Restoration Mastery Award",
    ],
  },
  {
    slug: "nail",
    name: "Nail",
    awards: [
      "Award of Excellence in Manicure",
      "Award of Excellence in Nail Extension",
      "Award of Excellence in Podology",
    ],
  },
  {
    slug: "brow",
    name: "Brow",
    awards: [
      "Award of Excellence in Brow Lamination",
      "Award of Excellence in Brow Styling & Design",
    ],
  },
  {
    slug: "lash",
    name: "Lash",
    awards: [
      "Award of Excellence in Classic Lash Extension",
      "Award of Excellence in Volume Lash Extension",
      "Award of Excellence in Creative Lash Extension Design",
      "Award of Excellence in Lash Lift",
    ],
  },
  {
    slug: "skin-cosmetology-facial",
    name: "Skin Care, Cosmetology & Facial",
    awards: [
      "Award of Excellence in Non-Invasive Rejuvenation",
      "Award of Excellence in Anti-Aging Facial Treatment",
      "Award of Excellence in Acne Treatment",
    ],
  },
  {
    slug: "makeup-artistry",
    name: "Makeup Artistry",
    awards: [
      "Award of Excellence in Bridal Makeup Artistry",
      "Award of Excellence in Creative Makeup Artistry",
      "Award of Excellence in Mature Makeup Artistry",
      "Award of Excellence in Daytime Makeup Artistry",
    ],
  },
  {
    slug: "permanent-makeup",
    name: "Permanent Makeup",
    awards: [
      "Award of Excellence in PMU Brows",
      "Award of Excellence in Eyeliner Precision",
      "Award of Excellence in Lips PMU",
      "Award of Excellence in Camouflage & Correction",
    ],
  },
  {
    slug: "body-wellness-nutrition",
    name: "Body, Wellness & Nutrition",
    awards: [
      "Award of Excellence in Body Transformation",
      "Award of Excellence in Sculpting Massage",
      "Award of Excellence in Nutrition & Diet Correction",
      "Award of Excellence in Anti-Cellulite Treatment",
    ],
  },
  {
    slug: "education",
    name: "Education",
    awards: [
      "Award of Excellence in Professional Beauty Training",
      "Award of Excellence in Online Beauty Education",
    ],
  },
  {
    slug: "salon",
    name: "Salon",
    awards: [
      "Award of Excellence in Beauty Salon Innovation",
      "Award for Outstanding Achievement in Beauty Business Development",
    ],
  },
  {
    slug: "brand",
    name: "Brand",
    awards: [
      "Award of Excellence in Professional Beauty Product Development",
      "Award of Excellence in Beauty Brand Development",
      "Innovation in Beauty Award",
    ],
  },
];
