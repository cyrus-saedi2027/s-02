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

  /* --- the case study at /projects/<slug> --- */

  /** Last segment of the project's own URL. */
  slug: string;
  client: string;
  /** What I actually did, as against what the project was. */
  role: string;
  duration: string;
  /** The one line the project page opens on. */
  lede: string;
  /** What was wrong before the work started. */
  problem: string;
  /**
   * The work itself, in two or three moves. Each carries a plate, which
   * alternates side down the page the way the index rows do.
   */
  chapters: { title: string; body: string; art: string }[];
  /** Three figures. `value` counts up from zero when it comes into view. */
  metrics: { value: number; suffix?: string; label: string }[];
  /** What changed, once it shipped. */
  outcome: string;
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
    slug: "halcyon",
    client: "Halcyon Instruments",
    role: "Product design, design system, front-end",
    duration: "14 weeks",
    lede: "Eleven screens became one canvas.",
    problem:
      "Halcyon's technicians ran diagnostics across eleven separate screens, and every one of them had been added by a different team in a different year. The work itself was fast; finding where to do it was not. Support saw the same three questions every week, and all three were really the same question — where is that setting now.",
    chapters: [
      {
        title: "Watching the work, not the software",
        body: "Two weeks in the workshop before a pixel moved. Technicians were doing the same six tasks over and over, and every one of them crossed at least four screens. I mapped the crossings rather than the screens, which is what showed the shape: the software had been organised by which team built it, not by what anybody did with it.",
        art: "/art/work-01.svg",
      },
      {
        title: "One canvas, six tools",
        body: "Everything collapsed onto a single canvas with the instrument at the centre and the six tasks as tools around it. Nothing was deleted — the settings all survived, they just stopped being destinations. The rarely-used ninety percent moved behind one panel that opens where the cursor is.",
        art: "/art/panel-design.svg",
      },
      {
        title: "A system the team can extend",
        body: "Twenty-eight components, each documented with the decision behind it rather than only its props. The point was that the next person to add a tool would not need me: eight months on, three tools have shipped that I had nothing to do with, and they look like they belong.",
        art: "/art/panel-development.svg",
      },
    ],
    metrics: [
      { value: 11, suffix: "→1", label: "Screens, collapsed to one canvas" },
      { value: 62, suffix: "%", label: "Faster to complete a full diagnostic" },
      { value: 3, suffix: "×", label: "Drop in support tickets about navigation" },
    ],
    outcome:
      "A full diagnostic that used to take just under seven minutes now takes two and a half. The three questions support kept fielding have not been asked since the second month. The design system has outlived my involvement, which is the part I am actually proud of.",
  },
  {
    index: "/ 02",
    title: "Vantable",
    cover: "/art/cover-02.svg",
    tags: "Branding, UI/UX Design, Illustration",
    year: "2024",
    art: "/art/work-02.svg",
    blurb: "An identity system for a research lab, from mark to motion kit.",
    slug: "vantable",
    client: "Vantable Research",
    role: "Identity, illustration, motion, web",
    duration: "9 weeks",
    lede: "A lab that looked like nine different labs.",
    problem:
      "Vantable published good work under a name nobody could picture. Every paper, deck and poster had been set by whoever made it, so the same institute appeared in nine typefaces and four blues. Recruiters could not tell two of their groups apart, and neither could their funders.",
    chapters: [
      {
        title: "A mark built from their own data",
        body: "The logo is a plot. Vantable's founding paper turned on one particular curve, and the mark is that curve, redrawn at a weight that survives being embroidered on a fleece. It means something to the forty people inside and reads as a confident abstract shape to everyone else, which is the only honest way to make a mark carry meaning.",
        art: "/art/work-02.svg",
      },
      {
        title: "Illustration instead of stock",
        body: "Research pages need pictures and there are no photographs of most of this work. A drawing system — a fixed palette, one line weight, one construction grid — lets any group make its own diagrams without them drifting apart. Sixty-odd have been drawn since, four by me.",
        art: "/art/panel-strategy.svg",
      },
    ],
    metrics: [
      { value: 9, suffix: "→1", label: "Typefaces in use across the institute" },
      { value: 40, label: "People onboarded to the kit" },
      { value: 60, suffix: "+", label: "Diagrams drawn in the system since" },
    ],
    outcome:
      "One institute that reads as one institute. The kit went out with a two-page guide rather than a forty-page manual, which is why people actually use it — the constraint that made that possible was refusing to add a rule I could not justify in a sentence.",
  },
  {
    index: "/ 03",
    title: "Ottermade",
    cover: "/art/cover-03.svg",
    tags: "Branding, UI/UX Design, Web Development",
    year: "2024",
    art: "/art/work-03.svg",
    blurb: "Editorial commerce for a studio that sells very few, very good objects.",
    slug: "ottermade",
    client: "Ottermade",
    role: "Brand, design, front-end",
    duration: "11 weeks",
    lede: "Nine objects a year, sold like ninety thousand.",
    problem:
      "Ottermade makes nine objects a year and was selling them through a template built for a catalogue of thousands. Filters nobody needed, a search nobody used, related-products rails pointing at the only other four things in the shop. The work was quiet and considered and the shop around it was shouting.",
    chapters: [
      {
        title: "Fewer things, more room",
        body: "The whole shop is one scroll. Each object gets a full screen, photographed the way the studio photographs it, with the price set at the same size as the body copy rather than in a badge. Nothing competes with anything else because there is nothing else on screen.",
        art: "/art/work-03.svg",
      },
      {
        title: "The making is the marketing",
        body: "Every object page carries the process behind it — the material, the failed version, the person who made it. That is what the studio talks about anyway; putting it in the buying flow rather than in a separate journal is what changed the numbers.",
        art: "/art/panel-production.svg",
      },
    ],
    metrics: [
      { value: 34, suffix: "%", label: "Rise in conversion, first quarter" },
      { value: 2, suffix: "×", label: "Time spent on an object page" },
      { value: 0, label: "Filters, searches or related-product rails" },
    ],
    outcome:
      "Conversion up a third in the first quarter, and — the number the studio cared about more — the objects that used to sit unsold now sell at the same rate as the popular ones. Giving each of them a whole screen turned out to be the entire trick.",
  },
  {
    index: "/ 04",
    title: "Persimmon",
    cover: "/art/cover-04.svg",
    tags: "Product Design, Branding",
    year: "2023",
    art: "/art/work-04.svg",
    blurb: "A scheduling product reduced to the three screens people actually use.",
    slug: "persimmon",
    client: "Persimmon",
    role: "Product design, brand",
    duration: "16 weeks",
    lede: "Forty features, three of them used.",
    problem:
      "Persimmon had shipped forty features in two years and churn was climbing. The analytics were blunt about it: three screens carried ninety-four percent of all sessions and the other thirty-seven features were being maintained for almost nobody. Every one of them still had to be understood before a new user could get to the three that mattered.",
    chapters: [
      {
        title: "Reading the analytics honestly",
        body: "The uncomfortable part was not finding the number. It was that four of the unused features had been someone's whole quarter. I wrote the case for cutting them around what each one cost to keep rather than around whether it was any good, which is the argument that survives a room.",
        art: "/art/work-04.svg",
      },
      {
        title: "Three screens, done properly",
        body: "Book, reschedule, and see the week. Every hour that came out of the other thirty-seven went into these: keyboard-first, sensible when two people book the same slot, and legible on the phone screens people actually use rather than the one in the mock.",
        art: "/art/panel-design.svg",
      },
      {
        title: "A brand that stopped apologising",
        body: "The old identity hedged — a soft blue that could have been any of two hundred scheduling tools. The new one commits to one warm red and a typeface with an opinion, and it reads as a product made by people rather than by a category.",
        art: "/art/panel-strategy.svg",
      },
    ],
    metrics: [
      { value: 37, label: "Features removed" },
      { value: 41, suffix: "%", label: "Fall in first-month churn" },
      { value: 8, suffix: "s", label: "Median time to book, down from 46" },
    ],
    outcome:
      "Churn in the first month fell by two fifths and has stayed there. Booking went from forty-six seconds to eight. Nothing in the three screens is clever — the work was in getting permission to delete the other thirty-seven.",
  },
  {
    index: "/ 05",
    title: "Tallowfield",
    cover: "/art/cover-05.svg",
    tags: "Branding, UI/UX Design, Web Development",
    year: "2023",
    art: "/art/work-01.svg",
    blurb: "A seasonal kitchen brought online without losing the handwriting.",
    slug: "tallowfield",
    client: "Tallowfield Kitchen",
    role: "Brand, design, front-end",
    duration: "7 weeks",
    lede: "The menu changes daily. So does the site.",
    problem:
      "Tallowfield writes its menu each morning on a board by the door, in the chef's handwriting, and it changes with what the growers bring. Their website showed a PDF from eleven months earlier. Every booking started with a phone call asking what was on.",
    chapters: [
      {
        title: "Keeping the hand in it",
        body: "The board is the brand. A typeface drawn from the chef's own lettering carries the headings, and the daily menu is set in it too — typed into a phone in the morning, on the site before service. It reads as the same hand because it is.",
        art: "/art/panel-production.svg",
      },
      {
        title: "Fast on a bad connection",
        body: "Half the traffic arrives from a phone on the street outside, deciding whether to come in. The whole site is under 90 kB and the menu is the first thing painted. Nothing loads that is not on screen.",
        art: "/art/work-01.svg",
      },
    ],
    metrics: [
      { value: 90, suffix: "kB", label: "Total page weight" },
      { value: 78, suffix: "%", label: "Fewer 'what's on today' calls" },
      { value: 4, label: "Minutes to publish the day's menu" },
    ],
    outcome:
      "The calls asking what is on have all but stopped, and the kitchen publishes the menu itself in four minutes without opening a laptop. The brand survived the move online, which was the only thing they were actually worried about.",
  },
  {
    index: "/ 06",
    title: "Mesa",
    cover: "/art/cover-06.svg",
    tags: "Website Development",
    year: "2023",
    art: "/art/work-02.svg",
    blurb: "A documentation site that loads in a blink on a bad connection.",
    slug: "mesa",
    client: "Mesa",
    role: "Front-end, performance",
    duration: "6 weeks",
    lede: "Documentation that loads before you finish blinking.",
    problem:
      "Mesa's docs took eleven seconds to become readable on a mid-range Android phone on 3G, and a good share of their users are on exactly that. The site shipped 2.4 MB of JavaScript to render text. Search worked, once it had loaded, which was after most people had left.",
    chapters: [
      {
        title: "Text first, everything else after",
        body: "Every page is server-rendered HTML that reads without a single byte of JavaScript. The interactive parts — search, the version switcher, the code playground — load after the text is already on screen, and only when they are reachable.",
        art: "/art/work-02.svg",
      },
      {
        title: "Search that fits in a page",
        body: "The old search shipped a 900 kB index. The new one is a 34 kB prefix trie built at deploy time, and it answers in under 5 ms on the phone I tested on rather than the laptop I wrote it on.",
        art: "/art/panel-development.svg",
      },
    ],
    metrics: [
      { value: 11, suffix: "→1.2s", label: "Time to readable text on 3G" },
      { value: 96, suffix: "%", label: "Less JavaScript shipped" },
      { value: 34, suffix: "kB", label: "Search index, down from 900" },
    ],
    outcome:
      "Eleven seconds to one and a bit, and the search that used to be the heaviest thing on the page is now smaller than one of its old icons. None of this needed a new framework — it needed deciding what was allowed to block the text.",
  },
  {
    index: "/ 07",
    title: "Lune",
    cover: "/art/cover-07.svg",
    tags: "Branding, Packaging Design",
    year: "2022",
    art: "/art/work-03.svg",
    blurb: "Packaging for a small-batch perfumer, built around one folded form.",
    slug: "lune",
    client: "Lune Parfums",
    role: "Brand, packaging, art direction",
    duration: "10 weeks",
    lede: "One fold, six products, no glue.",
    problem:
      "Lune had six products in six different boxes from four suppliers, and the unit cost was eating a startup's margin. They also could not say, out loud, what held the range together — which is a branding problem wearing a packaging problem's clothes.",
    chapters: [
      {
        title: "One fold, six sizes",
        body: "A single die-line, scaled six ways, folded from one sheet with no glue and no insert. Same tooling, same supplier, same gesture when you open it. The saving paid for the paper stock they actually wanted.",
        art: "/art/work-03.svg",
      },
      {
        title: "Print you can only get on paper",
        body: "The range is told apart by a blind deboss that catches light rather than by colour, so it reads in a dim shop and photographs badly on purpose — you have to hold one. The decision was as much about where they sell as about how it looks.",
        art: "/art/panel-strategy.svg",
      },
    ],
    metrics: [
      { value: 6, suffix: "→1", label: "Die-lines across the range" },
      { value: 44, suffix: "%", label: "Lower packaging cost per unit" },
      { value: 0, label: "Glue, inserts or plastic" },
    ],
    outcome:
      "Packaging cost per unit down by nearly half, one supplier instead of four, and a range that finally looks like a range. The deboss has since become the thing people photograph, despite it being the part designed not to photograph well.",
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
/**
 * Where to find the studio elsewhere.
 *
 * `href` is the whole configuration: fill one in and it becomes a link that
 * opens in a new tab; leave it empty and the name is rendered as plain text
 * instead. That is deliberate — an account nobody has set up yet should read
 * as "not on this platform", not as a link that swallows the click. These are
 * empty until real accounts exist to point at.
 */
export type Social = { label: string; href: string };

export const socials: Social[] = [
  { label: "Instagram", href: "" },
  { label: "Twitter", href: "" },
  { label: "LinkedIn", href: "" },
  { label: "Dribbble", href: "" },
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
