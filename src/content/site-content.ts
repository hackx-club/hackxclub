// All editable site content lives here. Use [TO BE ANNOUNCED] for unknowns; don't invent facts.
export const TBA = "[TO BE ANNOUNCED]";

export const registerOptions = [
  { value: "hackx-1-0", label: "HackX 1.0 · 28 Dec 2026" },
  { value: "general", label: "No specific event, keep me posted" },
];

export const tracks = ["Track 1 " + TBA, "Track 2 " + TBA, "Track 3 " + TBA, "Track 4 " + TBA, "Track 5 " + TBA];

export const numbers = [
  { value: 0, suffix: "+", label: "Builders " + TBA },
  { value: 0, suffix: "", label: "Events " + TBA },
  { value: 0, suffix: "+", label: "Colleges " + TBA },
  { value: 20000, prefix: "₹", suffix: "+", label: "HackX 1.0 prize pool" },
];

export const pillars = [
  { title: "Hackathons", body: "Focused, time-boxed events where students ship working products." },
  { title: "Founder meetups", body: "Small rooms where student builders meet people who have started companies." },
  { title: "Builders' network", body: "People who build alongside each other between events." },
];

export const hackx1 = {
  slug: "hackx-1-0",
  name: "HackX 1.0",
  date: "28 December 2026",
  isoDate: "2026-12-28",
  duration: "12 hours",
  prize: "Over ₹20,000",
  food: "Food included",
  venue: TBA,
  schedule: [
    ["Hour 0", "Check-in and opening " + TBA],
    ["Hour 1", "Hacking starts"],
    ["Hour 4", "Lunch"],
    ["Hour 8", "Mentor rounds " + TBA],
    ["Hour 11", "Hacking ends, demos"],
    ["Hour 12", "Judging and winners"],
  ],
  prizes: ["Prize split " + TBA, "Total pool over ₹20,000"],
  rules: ["Team size " + TBA, "Eligibility " + TBA, "Code of conduct " + TBA],
  faq: [
    ["When is HackX 1.0?", "28 December 2026. It runs for 12 hours."],
    ["Where is it?", "The venue is " + TBA + "."],
    ["Is food provided?", "Yes, food is included."],
    ["How big is the prize pool?", "Over ₹20,000."],
    ["How do I register?", "Use the register page or message us on WhatsApp."],
  ],
};

export const team = [
  { key: 1, name: "Name " + TBA, role: "Founder", photo: "member" },
  { key: 2, name: "Santhosh", role: "Co-founder", photo: "santhosh" },
  { key: 3, name: "Team member " + TBA, role: "Role " + TBA },
  { key: 4, name: "Team member " + TBA, role: "Role " + TBA },
];

export const mentors = [
  {
    name: "Deekshana Reddy",
    role: "Mentor · Marketing & Branding",
    photo: "deekshana",
    bio: "Founder of Deetox Buddy, a consumer awareness and brand accountability platform backed by Microsoft for Startups. Known for viral, campaign-driven ingredient transparency, she has challenged global giants like Coca-Cola and Unilever. She guides HackX on consumer psychology, storytelling and building engaged audiences.",
  },
  {
    name: "Rodick J",
    role: "Mentor · Entrepreneurship & Community",
    photo: "rodick",
    bio: "Rodick J. is an entrepreneur and community builder, Co-Founder of GenC and F1 Community Chennai. He brings valuable insights into entrepreneurship, networking, leadership and community development as a mentor to our startup.",
  },
] as const;

export const socials = {
  email: TBA,
  instagram: TBA,
  linkedin: TBA,
};
