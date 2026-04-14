export const stats = [
  {
    title: "Entry Fee",
    value: "$50",
    text: "Per category application. Each category is submitted separately.",
  },
  {
    title: "Judge Fee",
    value: "$250",
    text: "Charged only after jury approval.",
  },
  {
    title: "Membership",
    value: "Trainer / Coach+",
    text: "Only eligible IBPA membership levels can apply.",
  },
  {
    title: "Grand Prix",
    value: "5+ Categories",
    text: "Awarded only if at least 5 categories produce winners.",
  },
];

export const categories = [
  "Hair",
  "Nail",
  "Brow",
  "Lash",
  "Skin & Cosmetology",
  "Facial Treatments",
  "Makeup Artistry",
  "Permanent Makeup",
  "Body & Wellness",
  "Education",
  "Salon",
  "Brand",
];

export const steps = [
  {
    number: "01",
    title: "Choose Your Category",
    text: "Select one of 12 professional categories and the specific award inside that category.",
  },
  {
    number: "02",
    title: "Verify Membership",
    text: "Enter your IBPA Membership Number. Only Trainer / Coach level or higher can continue.",
  },
  {
    number: "03",
    title: "Complete Your Entry",
    text: "Fill in the main application and upload category-specific materials.",
  },
  {
    number: "04",
    title: "Submit & Pay",
    text: "Submit your application and pay through Stripe Checkout in USD.",
  },
  {
    number: "05",
    title: "Jury Evaluation",
    text: "Applications move into the official judging period before the ceremony.",
  },
];

export const faqs = [
  {
    q: "How much does it cost to apply?",
    a: "Participant applications cost $50 per category.",
  },
  {
    q: "Do members get free category entry?",
    a: "No. Membership and championship participation are separate.",
  },
  {
    q: "Can anyone apply to become a judge?",
    a: "Professionals may apply, and the $250 fee is charged only after approval.",
  },
  {
    q: "How does Grand Prix work?",
    a: "The full jury selects the Grand Prix recipient from category winners in years with at least 5 active winning categories.",
  },
];
