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

export const legacyAwardNameMappings: Record<string, Record<string, string>> = {
  hair: {
    "Best Color Technique": "Award of Excellence in Hair Color Technique",
    "Best Hair Color Transformation": "Award of Excellence in Hair Color Technique",
    "Best Hair Transformation": "Award of Excellence in Hair Color Technique",
    "Best Hair Restoration": "Hair Restoration Mastery Award",
    "Best Precision Cut": "Barbering Excellence Award",
    "Best Editorial Hair Styling": "Barbering Excellence Award",
  },
  nail: {
    "Best Nail Extension": "Award of Excellence in Nail Extension",
    "Best Nail Design": "Award of Excellence in Nail Extension",
    "Best Natural Nail Care": "Award of Excellence in Manicure",
    "Best Editorial Nail Art": "Award of Excellence in Nail Extension",
  },
  brow: {
    "Best Brow Lamination": "Award of Excellence in Brow Lamination",
    "Best Brow Shaping": "Award of Excellence in Brow Styling & Design",
    "Best Brow Correction": "Award of Excellence in Brow Styling & Design",
    "Best Brow Styling Result": "Award of Excellence in Brow Styling & Design",
  },
  lash: {
    "Best Lash Extension Set": "Award of Excellence in Classic & Volume Lash",
    "Best Lash Styling Innovation": "Award of Excellence in Creative Lash Design",
    "Best Lash Lift Result": "Award of Excellence in Lash Lift",
    "Best Lash Educator Technique": "Award of Excellence in Creative Lash Design",
  },
  "skin-cosmetology": {
    "Best Clinical Skin Transformation": "Skin Transformation Award",
    "Best Acne Correction Result": "Acne Treatment Transformation Award",
    "Best Anti-Aging Program": "Award of Excellence in Non-Invasive Rejuvenation",
    "Best Advanced Cosmetology Practice": "Award of Excellence in Non-Invasive Rejuvenation",
  },
  "facial-treatments": {
    "Best Signature Facial Program": "Award of Excellence in Facial Treatment Protocol",
    "Best Device-Based Facial Treatment": "Award of Excellence in Facial Treatment Protocol",
    "Best Luxury Spa Facial": "Hydration & Glow Mastery Award",
    "Best Results-Driven Treatment Plan": "Award of Excellence in Anti-Aging Facial",
  },
  "makeup-artistry": {
    "Best Bridal Makeup": "Award of Excellence in Bridal Makeup Artistry",
    "Best Editorial Makeup": "Award of Excellence in Editorial & Creative Makeup",
    "Best Creative Beauty Look": "Award of Excellence in Editorial & Creative Makeup",
    "Best Client Transformation": "Award of Excellence in Everyday Makeup Artistry",
  },
  "permanent-makeup": {
    "Best Brow PMU Result": "Award of Excellence in PMU Brows",
    "Best Eyeliner PMU Result": "Award of Excellence in Eyeliner Precision",
    "Best Lip Blush Result": "Award of Excellence in Lips PMU",
    "Best Corrective PMU Case": "Award of Excellence in Camouflage & Correction",
  },
  "body-wellness": {
    "Best Body Contouring Result": "Body Transformation Award",
    "Best Holistic Beauty Service": "Body Transformation Award",
    "Best Recovery & Sculpting Method": "Sculpting Massage Mastery Award",
    "Best Wellness Treatment Program": "Sculpting Massage Mastery Award",
  },
  education: {
    "Best Beauty Educator": "Award of Excellence in Professional Beauty Training",
    "Best Academy Program": "Award of Excellence in Professional Beauty Training",
    "Best Online Education Experience": "Award of Excellence in Online Beauty Education",
    "Best Student Outcomes": "Award of Excellence in Professional Beauty Training",
  },
  salon: {
    "Best Luxury Salon Experience": "Award of Excellence in Beauty Salon Innovation",
    "Best Team Excellence": "Award of Excellence in Beauty Salon Innovation",
    "Best Client Satisfaction Program":
      "Award for Outstanding Achievement in Beauty Business Development",
    "Best Salon Growth & Reputation":
      "Award for Outstanding Achievement in Beauty Business Development",
  },
  brand: {
    "Best Professional Beauty Brand":
      "Award of Excellence in Beauty Brand Development",
    "Best Product Innovation":
      "Award of Excellence in Professional Beauty Product Development",
    "Best Packaging & Presentation": "Innovation in Beauty Award",
    "Best Compliance & Safety Leadership": "Innovation in Beauty Award",
  },
};

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
