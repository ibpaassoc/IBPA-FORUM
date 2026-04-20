import type { CategoryCatalogDefinition } from "@/lib/apply/types";

export const applicationTimeline = {
  deadlineLabel: "July 31, 2026",
  judgingLabel: "August 5-20, 2026",
  ceremonyLabel: "September 4-5, 2026",
  membershipMinimum: "Trainer / Coach",
  feeLabel: "$50 per category",
};

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
      "Award of Excellence in Classic & Volume Lash",
      "Award of Excellence in Creative Lash Design",
      "Award of Excellence in Lash Lift",
    ],
  },
  {
    slug: "skin-cosmetology",
    name: "Skin & Cosmetology",
    awards: [
      "Acne Treatment Transformation Award",
      "Skin Transformation Award",
      "Award of Excellence in Non-Invasive Rejuvenation",
    ],
  },
  {
    slug: "facial-treatments",
    name: "Facial Treatments",
    awards: [
      "Award of Excellence in Facial Treatment Protocol",
      "Hydration & Glow Mastery Award",
      "Award of Excellence in Anti-Aging Facial",
    ],
  },
  {
    slug: "makeup-artistry",
    name: "Makeup Artistry",
    awards: [
      "Award of Excellence in Bridal Makeup Artistry",
      "Award of Excellence in Editorial & Creative Makeup",
      "Award of Excellence in Everyday Makeup Artistry",
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
    slug: "body-wellness",
    name: "Body & Wellness",
    awards: [
      "Body Transformation Award",
      "Sculpting Massage Mastery Award",
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

export const heardAboutOptions = [
  { label: "Instagram", value: "instagram" },
  { label: "Facebook", value: "facebook" },
  { label: "Email newsletter", value: "email" },
  { label: "Friend or colleague", value: "referral" },
  { label: "Google search", value: "google" },
  { label: "Event / expo", value: "event" },
  { label: "Other", value: "other" },
];

export const trainingFormatOptions = [
  { label: "In-person", value: "in-person" },
  { label: "Online", value: "online" },
  { label: "Hybrid", value: "hybrid" },
  { label: "Masterclass", value: "masterclass" },
];
