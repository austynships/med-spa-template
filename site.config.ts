/* =====================================================================
   SITE SETTINGS  —  This is the only file you need to edit.
   ---------------------------------------------------------------------
   • Change text between the quotes "like this".
   • Colors are hex codes (pick one at https://htmlcolorcodes.com).
   • To hide a whole section, set  show: false.
   • To add/remove a service, testimonial, FAQ, etc., copy or delete
     one { ... } block (keep the commas between blocks).
   • Images: put files in the /public/img folder and write the path
     starting with a slash, e.g. "/img/hero.jpg".
     Leave "" to use the built-in soft backdrop.
   • While `npm run dev` is running, saving this file updates the
     browser instantly.
   ===================================================================== */
import type { SiteConfig } from "@/lib/site-types";

export const site: SiteConfig = {

  /* ---------- BRAND ---------- */
  brand: {
    name: "Lumière Aesthetics",
    tagline: "Medical Spa & Wellness",
    description: "Physician-led med spa offering Botox, fillers, HydraFacials, laser and wellness treatments.", // shown in Google results
    logo: "/img/logo.svg",              // set to "" to show the name as text
    logoHeight: 44,                      // pixels
    invertLogoInFooter: true,            // makes a dark logo white on the dark footer
    favicon: "/img/favicon.svg",
  },

  /* ---------- COLORS ---------- */
  colors: {
    primary:    "#8A6F5C",   // buttons, links, highlights
    primaryDark:"#6B5444",   // button hover
    accent:     "#C9A98B",   // small details, icons
    background: "#FBF8F5",   // page background
    surface:    "#FFFFFF",   // cards
    soft:       "#F3ECE6",   // alternate section background
    text:       "#2B2522",   // main text
    muted:      "#6F6560",   // secondary text
    dark:       "#2B2522",   // footer & dark banner
  },

  /* ---------- FONTS (any Google Font name) ---------- */
  fonts: {
    heading: "Cormorant Garamond",
    body: "Jost",
  },

  /* ---------- CONTACT ---------- */
  contact: {
    phone: "(555) 123-4567",
    email: "hello@lumiereaesthetics.com",
    address: "123 Serenity Lane, Suite 200\nScottsdale, AZ 85251",
    mapLink: "https://maps.google.com",
    bookingUrl: "#contact",             // paste your booking link (Vagaro, Boulevard, Mindbody…)
    hours: [
      { days: "Mon – Fri", time: "9:00am – 7:00pm" },
      { days: "Saturday",  time: "9:00am – 4:00pm" },
      { days: "Sunday",    time: "Closed" },
    ],
    social: {                            // leave "" to hide an icon
      instagram: "https://instagram.com",
      facebook:  "https://facebook.com",
      tiktok:    "",
    },
  },

  /* ---------- TOP BAR & NAVIGATION ---------- */
  announcement: {
    show: true,
    text: "New clients: enjoy 20% off your first treatment.",
    linkText: "Book now",
    link: "#contact",
  },
  nav: [
    { label: "Services",     link: "#services" },
    { label: "About",        link: "#about" },
    { label: "Memberships",  link: "#memberships" },
    { label: "Reviews",      link: "#reviews" },
    { label: "FAQ",          link: "#faq" },
  ],
  bookButtonText: "Book Consultation",

  /* ---------- HERO ---------- */
  hero: {
    eyebrow: "Physician-led aesthetics",
    headline: "Look refreshed.\nFeel like yourself.",
    subheadline: "Natural-looking results from board-certified injectors and licensed aestheticians, in a calm space designed around you.",
    primaryButton:   { text: "Book a Consultation", link: "#contact" },
    secondaryButton: { text: "Explore Treatments",  link: "#services" },
    image: "",                           // e.g. "/img/hero.jpg"
    badge: "Licensed medical team",
    rating: { score: "4.9", label: "from 600+ Google reviews" },
  },

  /* ---------- TRUST STATS ---------- */
  stats: {
    show: true,
    items: [
      { number: "12+",    label: "Years of experience" },
      { number: "15,000", label: "Treatments performed" },
      { number: "4.9★",   label: "Average rating" },
      { number: "100%",   label: "Licensed providers" },
    ],
  },

  /* ---------- SERVICES ---------- */
  services: {
    show: true,
    eyebrow: "Treatments",
    title: "Results-driven care, tailored to you",
    intro: "Every plan starts with a one-on-one consultation so we can recommend only what you need.",
    items: [
      { icon: "syringe", name: "Botox & Neurotoxins", description: "Soften fine lines and prevent new ones with precise, natural-looking dosing.", price: "From $12/unit" },
      { icon: "drop",    name: "Dermal Fillers",      description: "Restore volume and contour to lips, cheeks and jawline.",                    price: "From $650" },
      { icon: "sparkle", name: "HydraFacial",         description: "Cleanse, extract and hydrate for an instant glow with zero downtime.",       price: "From $199" },
      { icon: "sun",     name: "Laser & IPL",         description: "Target sun spots, redness and uneven tone for clearer skin.",                price: "From $350" },
      { icon: "leaf",    name: "Microneedling",       description: "Stimulate collagen to improve texture, scars and pores.",                    price: "From $375" },
      { icon: "heart",   name: "Body & Wellness",     description: "IV therapy, weight-loss programs and body contouring.",                       price: "Consult" },
    ],
    // icons available: syringe, drop, sparkle, sun, leaf, heart, star, shield, clock
  },

  /* ---------- ABOUT ---------- */
  about: {
    show: true,
    eyebrow: "Our Philosophy",
    title: "Enhancing, never changing, who you are",
    paragraphs: [
      "Founded by Dr. Jane Doe, Lumière was built on a simple idea: the best aesthetic work is the kind no one can point to. Just a more rested, confident version of you.",
      "Our medical team combines clinical expertise with an artist's eye, using FDA-approved products and the latest technology in a warm, private setting.",
    ],
    checklist: [
      "Board-certified medical director",
      "Personalized treatment plans",
      "FDA-approved products only",
      "Complimentary follow-ups",
    ],
    image: "",                           // e.g. "/img/about.jpg"
    button: { text: "Meet the Team", link: "#team" },
  },

  /* ---------- TEAM ---------- */
  team: {
    show: true,
    eyebrow: "Our Experts",
    title: "The people behind your glow",
    members: [
      { name: "Dr. Jane Doe, MD",    role: "Medical Director",        photo: "" },
      { name: "Alexis Morgan, RN",   role: "Lead Nurse Injector",     photo: "" },
      { name: "Priya Shah, LE",      role: "Licensed Aesthetician",   photo: "" },
    ],
  },

  /* ---------- MEMBERSHIPS / PRICING ---------- */
  memberships: {
    show: true,
    eyebrow: "Memberships",
    title: "Glow all year for less",
    intro: "Monthly plans that make consistent care simple and save you more on every visit.",
    plans: [
      { name: "Essential", price: "$99",  period: "/month",
        perks: ["1 signature facial monthly", "10% off injectables", "Members-only events"] },
      { name: "Signature", price: "$179", period: "/month", featured: true, badge: "Most Popular",
        perks: ["1 HydraFacial monthly", "15% off injectables", "Free B12 shot monthly", "Priority booking"] },
      { name: "Luxe",      price: "$299", period: "/month",
        perks: ["Any treatment up to $300", "20% off everything", "Birthday gift treatment", "Concierge scheduling"] },
    ],
    buttonText: "Join Now",
  },

  /* ---------- TESTIMONIALS ---------- */
  testimonials: {
    show: true,
    eyebrow: "Client Love",
    title: "Real clients. Real results.",
    items: [
      { quote: "I've never felt so cared for. My results look completely natural, and friends just keep asking what my secret is.", name: "Sarah M.", detail: "Botox & Filler" },
      { quote: "The HydraFacial is my monthly reset. The space is gorgeous and the team remembers every detail about me.",               name: "Danielle R.", detail: "Signature Member" },
      { quote: "Professional, honest and never pushy. They talked me out of things I didn't need. That's why I trust them.",           name: "Monica T.", detail: "Laser Treatment" },
    ],
  },

  /* ---------- FAQ ---------- */
  faq: {
    show: true,
    eyebrow: "FAQ",
    title: "Questions, answered",
    items: [
      { q: "Is my first consultation free?", a: "Yes. Every new client receives a complimentary 30-minute consultation with one of our licensed providers." },
      { q: "Does it hurt?",                  a: "Most treatments involve minimal discomfort. We use topical numbing and gentle techniques to keep you comfortable." },
      { q: "Is there downtime?",             a: "Many treatments have little to none. Your provider will walk you through exactly what to expect beforehand." },
      { q: "Do you offer financing?",        a: "Yes. We accept Cherry and CareCredit so you can pay over time." },
    ],
  },

  /* ---------- BOTTOM CALL-TO-ACTION ---------- */
  cta: {
    show: true,
    title: "Ready to begin?",
    text: "Book your complimentary consultation today and let's create a plan that's right for you.",
    button: { text: "Book Your Visit", link: "#contact" },
  },

  /* ---------- CONTACT FORM ---------- */
  contactSection: {
    show: true,
    eyebrow: "Visit Us",
    title: "Let's get you on the books",
    intro: "Send us a note and our concierge will reach out within one business day.",
    // Form submissions: paste a Formspree / Basin endpoint below.
    // Leave "" and the form will open the visitor's email app instead.
    formAction: "",
    submitText: "Send Request",
  },

  /* ---------- FOOTER ---------- */
  footer: {
    blurb: "Physician-led aesthetics and wellness, delivered with care.",
    legal: "Results vary by individual. Treatments are performed by licensed medical professionals.",
  },
};
