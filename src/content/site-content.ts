// All editable site content lives here. Use [TO BE ANNOUNCED] for unknowns; don't invent facts.
export const TBA = "[TO BE ANNOUNCED]";

export const homeStory = {
  heroTitle: "HackX. Big ideas start here.",
  heroIntro: "Made by students, for students. Meet builders and founders, and take your idea into the real world.",
  title: "We stopped waiting for the future. We started building it.",
  chapters: [
    { number: "01", title: "An idea. Nowhere to take it.", body: "Everyone tells students to get ready for the future. But having a big idea and finding a place to start are two different things." },
    { number: "02", title: "So we made our own starting point.", body: "HackX brings student builders and founders into one room. A place to meet, try something, and build alongside people who get it." },
    { number: "03", title: "Your idea is part of the next chapter.", body: "Bring it to HackX 1.0. Twelve hours to turn what if into something real." },
  ],
  pillarsTitle: "Meet. Make. Move forward.",
  eventEyebrow: "The next chapter",
  ctaTitle: "Your idea deserves a first day.",
  ctaBody: "28 December 2026. Twelve hours. Start with HackX 1.0.",
};

export const registerOptions = [
  { value: "hackx-1-0", label: "HackX 1.0 · 28 Dec 2026" },
  { value: "general", label: "No specific event, keep me posted" },
];

// HackX 1.0 tracks. Edit or add a track here; icon is one of: ai, industry, climate, open.
export const trackList = [
  { title: "AI & Automation", icon: "ai", body: "Build smart systems that learn, decide and take repetitive work off people's hands." },
  { title: "Industry & Supply Chain (Industry 5.0)", icon: "industry", body: "Make factories, logistics and supply chains faster, smarter and more human-friendly." },
  { title: "Climate & Agritech", icon: "climate", body: "Solve problems in farming, energy and the environment for a more sustainable future." },
  { title: "Open Track", icon: "open", body: "Have an idea that doesn't fit above? Build it anyway." },
] as const;
export const tracks = trackList.map((t) => t.title);

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
  { key: 1, name: "Dharun", role: "Founder", photo: "member" },
  { key: 2, name: "Santhosh", role: "Co-founder", photo: "santhosh" },
  { key: 3, name: "Lakshana", role: "Social Media Management", photo: "lakshana" },
  { key: 4, name: "Sujith", role: "Operations Coordinator", photo: "sujith" },
  { key: 5, name: "Jagankumar", role: "Operations Coordinator", photo: "jagankumar" },
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
  email: "clubhackx@gmail.com",
  instagram: "hackx.club",
  linkedin: TBA,
};
