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
      "Best Hair Transformation",
      "Best Color Technique",
      "Best Precision Cut",
      "Best Editorial Hair Styling",
    ],
  },
  {
    slug: "nail",
    name: "Nail",
    awards: [
      "Best Nail Extension",
      "Best Nail Design",
      "Best Natural Nail Care",
      "Best Editorial Nail Art",
    ],
  },
  {
    slug: "brow",
    name: "Brow",
    awards: [
      "Best Brow Shaping",
      "Best Brow Lamination",
      "Best Brow Correction",
      "Best Brow Styling Result",
    ],
  },
  {
    slug: "lash",
    name: "Lash",
    awards: [
      "Best Lash Extension Set",
      "Best Lash Lift Result",
      "Best Lash Styling Innovation",
      "Best Lash Educator Technique",
    ],
  },
  {
    slug: "skin-cosmetology",
    name: "Skin & Cosmetology",
    awards: [
      "Best Clinical Skin Transformation",
      "Best Acne Correction Result",
      "Best Anti-Aging Program",
      "Best Advanced Cosmetology Practice",
    ],
  },
  {
    slug: "facial-treatments",
    name: "Facial Treatments",
    awards: [
      "Best Signature Facial Program",
      "Best Device-Based Facial Treatment",
      "Best Luxury Spa Facial",
      "Best Results-Driven Treatment Plan",
    ],
  },
  {
    slug: "makeup-artistry",
    name: "Makeup Artistry",
    awards: [
      "Best Bridal Makeup",
      "Best Editorial Makeup",
      "Best Creative Beauty Look",
      "Best Client Transformation",
    ],
  },
  {
    slug: "permanent-makeup",
    name: "Permanent Makeup",
    awards: [
      "Best Lip Blush Result",
      "Best Brow PMU Result",
      "Best Eyeliner PMU Result",
      "Best Corrective PMU Case",
    ],
  },
  {
    slug: "body-wellness",
    name: "Body & Wellness",
    awards: [
      "Best Body Contouring Result",
      "Best Wellness Treatment Program",
      "Best Holistic Beauty Service",
      "Best Recovery & Sculpting Method",
    ],
  },
  {
    slug: "education",
    name: "Education",
    awards: [
      "Best Beauty Educator",
      "Best Academy Program",
      "Best Online Education Experience",
      "Best Student Outcomes",
    ],
  },
  {
    slug: "salon",
    name: "Salon",
    awards: [
      "Best Luxury Salon Experience",
      "Best Team Excellence",
      "Best Client Satisfaction Program",
      "Best Salon Growth & Reputation",
    ],
  },
  {
    slug: "brand",
    name: "Brand",
    awards: [
      "Best Professional Beauty Brand",
      "Best Product Innovation",
      "Best Packaging & Presentation",
      "Best Compliance & Safety Leadership",
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
