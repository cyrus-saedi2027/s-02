export const identity = {
  name: "Zayla Monroe",
  role: "Creative Developer",
  location: "Netherlands",
  email: "studio@zaylamonroe.com",
  address: "Prinsengracht 123, 1016 GV Amsterdam, The Netherlands",
};

/**
 * Hero artwork. The card is 3:4 and uses object-fit: cover, so any
 * portrait-ish file works — point `src` at whatever you drop into
 * `public/art/`. A photographic pair (hero.webp / hero.jpg) is also bundled
 * there if you want to switch back to it.
 *
 * The bundled default is drawn by scripts/generate-hero-art.mjs.
 */
export const heroImage = {
  src: "/art/hero.svg",
  alt: "Ink-wash landscape: a red sun over a snow-capped mountain, a lakeside pagoda, and maple leaves drifting onto still water",
};

/** Sits under the hero card, split into words for the staggered reveal. */
export const heroTagline = "An independent creative Designer & Developer based in Netherlands";

/** Oversized wordmark that scrolls behind the hero card. */
export const heroMarquee = "Zayla Monroe";

export const about = {
  eyebrow: "who i am",
  body:
    "I design and build digital products from Amsterdam. Eight years in, my work sits where interface design, motion and front-end engineering overlap — which means I can take an idea from a blank canvas through to a shipped, running site without handing it off three times.",
  secondary:
    "I work with founders and small teams who care about how a thing feels, not only how it looks in a screenshot.",
  stats: [
    { value: "08", label: "Years in practice" },
    { value: "60", label: "Projects shipped" },
    { value: "24", label: "Awards & mentions" },
  ],
};

export type Project = {
  index: string;
  title: string;
  tags: string;
  year: string;
  art: string;
  /** Wide cover used by the feature rows. */
  cover: string;
  blurb: string;
};

export const projects: Project[] = [
  {
    index: "/ 01",
    title: "Halcyon",
    cover: "/art/cover-01.svg",
    tags: "UX Design, UI Design, Branding",
    year: "2025",
    art: "/art/work-01.svg",
    blurb: "A workshop tooling suite rebuilt around one uncluttered canvas.",
  },
  {
    index: "/ 02",
    title: "Vantable",
    cover: "/art/cover-02.svg",
    tags: "Branding, UI/UX Design, Illustration",
    year: "2024",
    art: "/art/work-02.svg",
    blurb: "An identity system for a research lab, from mark to motion kit.",
  },
  {
    index: "/ 03",
    title: "Ottermade",
    cover: "/art/cover-03.svg",
    tags: "Branding, UI/UX Design, Web Development",
    year: "2024",
    art: "/art/work-03.svg",
    blurb: "Editorial commerce for a studio that sells very few, very good objects.",
  },
  {
    index: "/ 04",
    title: "Persimmon",
    cover: "/art/cover-04.svg",
    tags: "Product Design, Branding",
    year: "2023",
    art: "/art/work-04.svg",
    blurb: "A scheduling product reduced to the three screens people actually use.",
  },
  {
    index: "/ 05",
    title: "Tallowfield",
    cover: "/art/cover-05.svg",
    tags: "Branding, UI/UX Design, Web Development",
    year: "2023",
    art: "/art/work-01.svg",
    blurb: "A seasonal kitchen brought online without losing the handwriting.",
  },
  {
    index: "/ 06",
    title: "Mesa",
    cover: "/art/cover-06.svg",
    tags: "Website Development",
    year: "2023",
    art: "/art/work-02.svg",
    blurb: "A documentation site that loads in a blink on a bad connection.",
  },
  {
    index: "/ 07",
    title: "Lune",
    cover: "/art/cover-07.svg",
    tags: "Branding, Packaging Design",
    year: "2022",
    art: "/art/work-03.svg",
    blurb: "Packaging for a small-batch perfumer, built around one folded form.",
  },
];

/**
 * What the home page shows.
 *
 * The full list belongs to /projects; the home page carries a selection and
 * sends the reader on for the rest, which is how the reference splits them
 * too — four rows there, seven on the index.
 */
export const featuredProjects = projects.slice(0, 4);

export const solutions = [
  {
    n: "01",
    title: "Strategy",
    art: "/art/panel-strategy.svg",
    items: ["Discovery", "Research", "Analysis", "Consultation", "Optimization"],
  },
  {
    n: "02",
    title: "Design",
    art: "/art/panel-design.svg",
    items: ["Branding", "UI/UX", "Visual Identity", "Graphics", "Illustration"],
  },
  {
    n: "03",
    title: "Development",
    art: "/art/panel-development.svg",
    items: ["Full Stack", "Framer", "API Integration", "Testing", "Deployment"],
  },
  {
    n: "04",
    title: "Production",
    art: "/art/panel-production.svg",
    items: ["3D Modeling", "VR Experiences", "Visualization", "Motion Graphics", "Animations"],
  },
];

export const process = [
  {
    n: "/ 01",
    title: "Discover",
    body:
      "We start by getting the problem right. I dig into your goals, your audience and the constraints nobody mentions until week three, then write down what success actually looks like.",
  },
  {
    n: "/ 02",
    title: "Design",
    body:
      "With a direction agreed, I move into layout, type and motion — building real screens rather than mood boards, so we are judging the thing itself and not a picture of it.",
  },
  {
    n: "/ 03",
    title: "Develop",
    body:
      "I write the front-end myself. Componentised, accessible and fast on a mid-range phone, because that is where most of your traffic will read it.",
  },
  {
    n: "/ 04",
    title: "Deliver",
    body:
      "Testing, performance passes and a proper handover. After launch I stay reachable for the fixes and small additions that always follow a first release.",
  },
];

export const testimonials = [
  {
    quote:
      "Zayla took a half-formed brief and turned it into a storefront that finally looks like us. Sales in the first quarter after launch were up by a third.",
    name: "Perrine Vaugh",
    role: "Founder, Ashgrove Botanics",
  },
  {
    quote:
      "The 3D work went straight into our client pitches. Detailed, quick to revise, and delivered ahead of the date we agreed.",
    name: "Idris Bellweather",
    role: "Creative Director, Fathom Nine",
  },
  {
    quote:
      "A rebuild that was genuinely collaborative. Zayla pushed back where it mattered and the site is better for it.",
    name: "Noor Vasquez",
    role: "Marketing Lead, Kelpwood",
  },
  {
    quote:
      "Design through to deployment on our dashboard, handled by one person. The performance numbers speak for themselves.",
    name: "Callum Trent",
    role: "CEO, Ironleaf Systems",
  },
  {
    quote:
      "Our furniture line reads better in Zayla's renders than in the photography we commissioned. That was not the plan, but we will take it.",
    name: "Sena Okonkwo",
    role: "Art Director, Marlowe Interiors",
  },
  {
    quote:
      "Fresh, careful branding that matched our mission without shouting about it. The whole process was calm.",
    name: "Bram Oosterhuis",
    role: "Co-Founder, Northlight Learning",
  },
  {
    quote:
      "Easy to work with and genuinely good at the details — typography, spacing, the way things move. It all feels considered.",
    name: "Wren Ashby",
    role: "Brand Manager, Studio Quintal",
  },
  {
    quote:
      "Modelling plus the front-end integration for our AR platform, both to a standard we had not managed in-house.",
    name: "Mateo Ferreira",
    role: "Head of Product, Loamfield",
  },
];

/**
 * The showcase wall — six plates that ride in over the testimonials on their
 * own layer. Titles are short on purpose: they sit under the frame as a
 * caption, not as a heading.
 */
export const showcase = {
  eyebrow: "Archive",
  lines: ["Recent", "Frames"],
  blurb:
    "Loose ends, test renders and the frames that never made it into a case study.",
  items: [
    { n: "01", title: "Kinetic Grid", meta: "Motion study", art: "/art/showcase-01.svg" },
    { n: "02", title: "Vermilion", meta: "Colour test", art: "/art/showcase-02.svg" },
    { n: "03", title: "Long Form", meta: "Editorial layout", art: "/art/showcase-03.svg" },
    { n: "04", title: "Contour", meta: "Type specimen", art: "/art/showcase-04.svg" },
    { n: "05", title: "Night Shift", meta: "Interface pass", art: "/art/showcase-05.svg" },
    { n: "06", title: "Off Register", meta: "Print trial", art: "/art/showcase-06.svg" },
  ],
};

/**
 * The booking panel. `availability` is wall-clock time on the visitor's own
 * clock: the day runs the full twenty-four hours, in half hours, whichever zone
 * they happen to be reading it in.
 */
export const booking = {
  title: "Intro call",
  blurb: "Tell me what you are building and where it is stuck. Thirty minutes is usually enough to work out whether I am the right person for it.",
  place: "Google Meet",
  duration: 30,
  availability: {
    days: [0, 1, 2, 3, 4, 5, 6],
    start: 0,
    end: 24,
    horizon: 90,
  },
} as const;

/** The plate that stands beside the recognition ledger. */
export const accolade = {
  src: "/art/accolade.svg",
  alt: "An award seal: an eight-point star inside a graduated bezel, framed by laurel branches over a ribbon",
};

export const awards = [
  {
    org: "Site of the Day",
    lines: [
      "1× Studio of the year nominee",
      "3× E-commerce of the year nominee",
      "2× Site of the month",
      "12× Site of the day",
      "11× Developer award",
      "20× Honourable mention",
    ],
  },
  {
    org: "Interaction Annual",
    lines: ["12× Motion feature", "1× Grand jury shortlist"],
  },
  {
    org: "Type & Layout Review",
    lines: [
      "2× Editorial craft",
      "3× Interface of the month",
      "7× Interface of the day",
      "1× Studio of the year nominee",
      "5× Innovation",
    ],
  },
  { org: "Frontend Guild", lines: ["1× Performance citation"] },
];

export const navLinks = [
  { label: "Home", href: "/" },
  { label: "About Me", href: "/about" },
  { label: "Projects", href: "/projects" },
  { label: "Playground", href: "/playground" },
  { label: "Contact", href: "/contact" },
];
export const socials = [
  { label: "Instagram", href: "#" },
  { label: "Twitter", href: "#" },
  { label: "LinkedIn", href: "#" },
  { label: "Dribbble", href: "#" },
];

/**
 * Tiles for the gallery that closes the case-studies section. Heights vary so
 * the three columns stagger rather than lining up in bands.
 */
export const gallery = [
  "/art/tile-01.svg",
  "/art/tile-02.svg",
  "/art/tile-03.svg",
  "/art/tile-04.svg",
  "/art/tile-05.svg",
  "/art/tile-06.svg",
  "/art/tile-07.svg",
  "/art/tile-08.svg",
  "/art/tile-09.svg",
];

/* ---------------------------------------------------------------------------
 * /about
 * ------------------------------------------------------------------------- */

export const aboutPage = {
  /** Set edge to edge as one word, scaled to the shell width. */
  title: "About",
  lead: "Over 8 years of experience, continuously pushing the boundaries of design and development.",
  secondary:
    "Enthusiastic about crafting seamless experiences that combine ideas, visuals, design, and development.",
  portrait: {
    src: "/art/about-portrait.svg",
    alt: "A figure in three-quarter profile, dark against a hot orange field, with a cold highlight along the lit edge",
  },
  avatar: {
    src: "/art/about-avatar.svg",
    alt: "Portrait of Zayla Monroe",
  },
  statement:
    "I focus on understanding your goals to create a visually stunning, user-friendly website that performs flawlessly. By combining creative design with cutting-edge technology, I deliver results that make an impact from day one.",
};

/**
 * The five-card ledger under the statement.
 *
 * `span` is in columns of a four-column grid, which is what puts the first
 * card and the two closing cards across two columns each and leaves the
 * middle pair single-width — the arrangement the reference uses.
 */
export type AboutFigure = {
  index: string;
  span: 1 | 2;
  /** Counts up from zero when the card comes into view. */
  value: number;
  suffix: string;
  label: string;
  /** The one card that carries the accent gradient instead of the dark fill. */
  feature?: boolean;
};

export type AboutNote = {
  index: string;
  span: 1 | 2;
  title: string;
  body: string;
};

export const aboutFigures: AboutFigure[] = [
  { index: "/ 01", span: 2, value: 95, suffix: "+", label: "Projects delivered", feature: true },
  { index: "/ 02", span: 1, value: 100, suffix: "+", label: "Happy clients" },
  { index: "/ 03", span: 1, value: 80, suffix: "+", label: "Award recognitions" },
];

export const aboutNotes: AboutNote[] = [
  {
    index: "/ 04",
    span: 2,
    title: "End-to-end execution",
    body: "From idea to launch, I handle everything from branding and design to scalable development.",
  },
  {
    index: "/ 05",
    span: 2,
    title: "Trusted by visionaries",
    body: "I've been chosen by founders, agencies and creative teams who value bold, high-performing digital experiences.",
  },
];

export const experience = {
  eyebrow: "where i've worked",
  heading: "Shaped by Experience",
  years: "2017 — 2025",
  roles: [
    {
      period: "2024 — Current",
      company: "NovaOne",
      role: "Lead Product Designer",
      blurb:
        "Directed UI/UX for a SaaS suite, leading strategy, design systems and the handover between product and engineering.",
    },
    {
      period: "2021 — 2023",
      company: "PixelRise Studio",
      role: "UI/UX Designer",
      blurb:
        "Built responsive sites and brand systems for commerce clients, with a strong bias toward clean layout and legible user flows.",
    },
    {
      period: "2019 — 2021",
      company: "Freelance",
      role: "Web Designer & Developer",
      blurb:
        "Worked directly with startups and independent makers, taking ideas through to custom-built sites and the visual language around them.",
    },
    {
      period: "2017 — 2019",
      company: "MotionGrid Agency",
      role: "Junior Designer",
      blurb:
        "Assisted on interface design, prototyping and asset production across branding and mobile work for early-stage teams.",
    },
  ],
};

/** Heading block above the recognition ledger on /about. */
export const honors = {
  eyebrow: "i've got featured",
  heading: "Awards & Honors",
  years: "2017 — 2025",
  plate: {
    src: "/art/about-honors.svg",
    alt: "The same figure lit from behind, framed for the recognition ledger",
  },
};


/* ---------------------------------------------------------------------------
 * /projects and /playground
 * ------------------------------------------------------------------------- */

/**
 * The two index pages open on their title alone — no standfirst under it, as
 * in the reference. The word is the whole opener and the work starts directly
 * beneath it.
 */
export const projectsPage = { title: "Projects" };

export const playgroundPage = { title: "Playground" };

/* ---------------------------------------------------------------------------
 * /contact
 * ------------------------------------------------------------------------- */

export const contactPage = {
  title: "Contact",
  quote: "Got an idea in mind? Let's connect and explore how I can bring it to life.",
  phone: "+31 20 123 4567",
};

/**
 * The eight questions the FAQ answers, in the order the reference asks them.
 * Any number works — the column just grows.
 */
export const faqs = [
  {
    q: "Do you work with clients worldwide?",
    a: "Yes, absolutely. I collaborate with clients globally — remotely and efficiently — across time zones.",
  },
  {
    q: "What's your typical project turnaround time?",
    a: "It depends on the scope, but most projects are completed within 3 to 6 weeks. Timelines are discussed upfront to ensure smooth delivery.",
  },
  {
    q: "How do I get started with you?",
    a: "Book a call or send a note through the form above. A paragraph about what you are building is plenty to start with.",
  },
  {
    q: "Do you work with startups or only big brands?",
    a: "Both. Whether you're a solo founder, a growing startup, or an established brand, I tailor solutions to fit your needs and budget.",
  },
  {
    q: "Can you design and develop my website?",
    a: "That is the usual arrangement — design through to a shipped front-end, handled by one person, so nothing is lost in the handover.",
  },
  {
    q: "Do you offer support after the project is completed?",
    a: "Yes. Every launch comes with a handover and a support window for the fixes and small additions that always follow.",
  },
  {
    q: "What tools do you use?",
    a: "Figma for design, React and TypeScript for the build, and whatever your project already runs on for the rest.",
  },
  {
    q: "Do you provide content or just design?",
    a: "Design and build are mine. I will shape copy you bring, and bring in a writer when a project needs one.",
  },
];

/**
 * The playground wall.
 *
 * `ratio` is the frame's width over its height — the plate is cut to the same
 * shape, so nothing is cropped. Rows are as tall as their tallest tile and the
 * shorter ones simply stop, which is what leaves the wall its air: the grid is
 * not there to be filled. `wide` takes two of the four columns.
 */
export type WallTile = { src: string; alt: string; ratio: number; wide?: boolean };

export const playgroundWall: WallTile[] = [
  { src: "/art/play-01.svg", alt: "Study: a banded field over a dark ground", ratio: 1.315 },
  { src: "/art/play-02.svg", alt: "Study: stacked arcs in vermilion", ratio: 0.749 },
  { src: "/art/play-03.svg", alt: "Study: contour lines drifting off the frame", ratio: 0.877 },
  { src: "/art/play-04.svg", alt: "Study: loose shapes over an ember ground", ratio: 1.31 },
  { src: "/art/play-05.svg", alt: "Plate: a specimen sheet, set large", ratio: 1.167, wide: true },
  { src: "/art/play-06.svg", alt: "Study: vertical bars, unevenly spaced", ratio: 1.315 },
  { src: "/art/play-07.svg", alt: "Study: an interface mock in near-black", ratio: 1.31 },
  { src: "/art/play-08.svg", alt: "Study: contours crossing a warm field", ratio: 0.877 },
  { src: "/art/play-09.svg", alt: "Study: a lettering specimen, cropped", ratio: 1.31 },
  { src: "/art/play-10.svg", alt: "Plate: a mesh dissolving toward one corner", ratio: 1.233, wide: true },
  { src: "/art/play-11.svg", alt: "Plate: overlapping planes in ember", ratio: 1.233, wide: true },
  { src: "/art/play-12.svg", alt: "Study: bars against a deep ground", ratio: 1.31 },
  { src: "/art/play-13.svg", alt: "Study: contour lines over vermilion", ratio: 0.877 },
];
