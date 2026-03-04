import { createClient } from "@sanity/client";
import { randomUUID } from "crypto";
import https from "https";

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

const key = () => randomUUID().slice(0, 8);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function downloadBuffer(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return downloadBuffer(res.headers.location).then(resolve, reject);
        }
        if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}`));
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => resolve(Buffer.concat(chunks)));
        res.on("error", reject);
      })
      .on("error", reject);
  });
}

async function uploadImage(url, filename) {
  const buffer = await downloadBuffer(url);
  const asset = await client.assets.upload("image", buffer, { filename });
  return asset._id;
}

function imageRef(assetId, alt, extra = {}) {
  return {
    _type: "image",
    asset: { _type: "reference", _ref: assetId },
    alt,
    ...extra,
  };
}

function block(text, style = "normal") {
  return {
    _type: "block",
    _key: key(),
    style,
    markDefs: [],
    children: [{ _type: "span", _key: key(), text, marks: [] }],
  };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log("\n  Seeding Sanity with demo content...\n");

  if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || !process.env.SANITY_API_TOKEN) {
    console.error("  Error: NEXT_PUBLIC_SANITY_PROJECT_ID and SANITY_API_TOKEN must be set.");
    console.error("  Make sure .env.local is populated before running this script.\n");
    process.exit(1);
  }

  const seedIds = [
    "globalSettings",
    "navigation",
    "footer",
    "seed-homepage",
    "seed-about",
    "seed-contact",
    "seed-blog-post-1",
    "seed-team-1",
    "seed-team-2",
    "seed-team-3",
  ];

  const existing = await client.fetch(
    `count(*[_id in $ids])`,
    { ids: seedIds }
  );

  if (existing > 0 && !process.argv.includes("--force")) {
    console.log("  Seed data already exists. Run with --force to overwrite.\n");
    process.exit(0);
  }

  // -------------------------------------------------------------------------
  // 1. Upload placeholder images
  // -------------------------------------------------------------------------

  console.log("  Uploading placeholder images...");

  const imageUrls = {
    hero: "https://picsum.photos/1920/1080",
    blog: "https://picsum.photos/1200/630",
    team1: "https://picsum.photos/400/400?random=1",
    team2: "https://picsum.photos/400/400?random=2",
    team3: "https://picsum.photos/400/400?random=3",
    gallery1: "https://picsum.photos/800/600?random=10",
    gallery2: "https://picsum.photos/800/600?random=11",
    gallery3: "https://picsum.photos/800/600?random=12",
    gallery4: "https://picsum.photos/800/600?random=13",
    testimonial1: "https://picsum.photos/200/200?random=20",
    testimonial2: "https://picsum.photos/200/200?random=21",
    testimonial3: "https://picsum.photos/200/200?random=22",
  };

  const assets = {};
  const entries = Object.entries(imageUrls);

  for (const [name, url] of entries) {
    process.stdout.write(`    ${name}...`);
    assets[name] = await uploadImage(url, `seed-${name}.jpg`);
    console.log(" done");
  }

  console.log("");

  // -------------------------------------------------------------------------
  // 2. Team Members (created first — referenced by teamGrid)
  // -------------------------------------------------------------------------

  console.log("  Creating team members...");

  const teamMembers = [
    {
      _id: "seed-team-1",
      _type: "teamMember",
      name: "Alex Rivera",
      jobTitle: "Lead Developer",
      photo: imageRef(assets.team1, "Alex Rivera headshot"),
      bio: "Full-stack developer with 8 years of experience building modern web applications. Specializes in React, TypeScript, and headless CMS architectures.",
      order: 1,
    },
    {
      _id: "seed-team-2",
      _type: "teamMember",
      name: "Jordan Chen",
      jobTitle: "UX Designer",
      photo: imageRef(assets.team2, "Jordan Chen headshot"),
      bio: "Award-winning designer focused on creating intuitive, accessible digital experiences. Brings a user-first approach to every project.",
      order: 2,
    },
    {
      _id: "seed-team-3",
      _type: "teamMember",
      name: "Sam Patel",
      jobTitle: "Project Manager",
      photo: imageRef(assets.team3, "Sam Patel headshot"),
      bio: "Keeps projects on track and clients happy. 6 years of experience managing web development projects from kickoff to launch.",
      order: 3,
    },
  ];

  for (const member of teamMembers) {
    await client.createOrReplace(member);
  }

  // -------------------------------------------------------------------------
  // 3. Global Settings
  // -------------------------------------------------------------------------

  console.log("  Creating global settings...");

  await client.createOrReplace({
    _id: "globalSettings",
    _type: "globalSettings",
    siteTitle: "Demo Site",
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    defaultSeo: {
      metaTitle: "Demo Site — Built with JDA Catalyst",
      metaDescription:
        "A modern, accessible website built with Next.js, Tailwind CSS, and Sanity CMS.",
    },
    socialLinks: [
      { _key: key(), _type: "object", platform: "linkedin", url: "https://linkedin.com" },
      { _key: key(), _type: "object", platform: "twitter", url: "https://x.com" },
      { _key: key(), _type: "object", platform: "instagram", url: "https://instagram.com" },
    ],
  });

  // -------------------------------------------------------------------------
  // 4. Navigation
  // -------------------------------------------------------------------------

  console.log("  Creating navigation...");

  await client.createOrReplace({
    _id: "navigation",
    _type: "navigation",
    items: [
      { _key: key(), _type: "object", label: "Home", url: "/", isExternal: false },
      { _key: key(), _type: "object", label: "About", url: "/about", isExternal: false },
      {
        _key: key(),
        _type: "object",
        label: "Services",
        url: "/services",
        isExternal: false,
        children: [
          { _key: key(), _type: "link", label: "Web Development", url: "/services#web", isExternal: false },
          { _key: key(), _type: "link", label: "Design", url: "/services#design", isExternal: false },
          { _key: key(), _type: "link", label: "Strategy", url: "/services#strategy", isExternal: false },
        ],
      },
      { _key: key(), _type: "object", label: "Blog", url: "/blog", isExternal: false },
      { _key: key(), _type: "object", label: "Contact", url: "/contact", isExternal: false },
    ],
  });

  // -------------------------------------------------------------------------
  // 5. Footer
  // -------------------------------------------------------------------------

  console.log("  Creating footer...");

  await client.createOrReplace({
    _id: "footer",
    _type: "footer",
    columns: [
      {
        _key: key(),
        _type: "object",
        title: "Company",
        links: [
          { _key: key(), _type: "link", label: "Home", url: "/", isExternal: false },
          { _key: key(), _type: "link", label: "About", url: "/about", isExternal: false },
          { _key: key(), _type: "link", label: "Contact", url: "/contact", isExternal: false },
        ],
      },
      {
        _key: key(),
        _type: "object",
        title: "Resources",
        links: [
          { _key: key(), _type: "link", label: "Blog", url: "/blog", isExternal: false },
          { _key: key(), _type: "link", label: "Services", url: "/services", isExternal: false },
        ],
      },
    ],
    socialLinks: [
      { _key: key(), _type: "object", platform: "linkedin", url: "https://linkedin.com" },
      { _key: key(), _type: "object", platform: "twitter", url: "https://x.com" },
      { _key: key(), _type: "object", platform: "instagram", url: "https://instagram.com" },
    ],
    copyrightText: "\u00A9 {year} Demo Company. All rights reserved.",
  });

  // -------------------------------------------------------------------------
  // 6. Homepage
  // -------------------------------------------------------------------------

  console.log("  Creating homepage...");

  await client.createOrReplace({
    _id: "seed-homepage",
    _type: "page",
    title: "Home",
    slug: { _type: "slug", current: "home" },
    seo: {
      metaTitle: "Home — Demo Site",
      metaDescription: "Welcome to Demo Site. We build modern, accessible websites.",
    },
    modules: [
      // Hero
      {
        _key: key(),
        _type: "hero",
        heading: "We Build Modern Digital Experiences",
        subheading:
          "Strategy, design, and development for brands that want to stand out online.",
        cta: { _type: "link", label: "Get in Touch", url: "/contact", isExternal: false },
        backgroundImage: imageRef(assets.hero, "Abstract geometric background"),
      },

      // Feature Grid
      {
        _key: key(),
        _type: "featureGrid",
        heading: "What We Do",
        features: [
          {
            _key: key(),
            _type: "object",
            icon: "🎨",
            title: "Design",
            description:
              "User-centered design that balances aesthetics with usability. Every pixel serves a purpose.",
          },
          {
            _key: key(),
            _type: "object",
            icon: "💻",
            title: "Development",
            description:
              "Modern tech stacks built for performance, accessibility, and maintainability.",
          },
          {
            _key: key(),
            _type: "object",
            icon: "📈",
            title: "Strategy",
            description:
              "Data-driven decisions that align your digital presence with business goals.",
          },
          {
            _key: key(),
            _type: "object",
            icon: "🚀",
            title: "Launch & Support",
            description:
              "We don't disappear after launch. Ongoing support to keep your site running smoothly.",
          },
        ],
      },

      // Stats Counter
      {
        _key: key(),
        _type: "statsCounter",
        stats: [
          { _key: key(), _type: "object", number: 150, suffix: "+", label: "Projects Delivered" },
          { _key: key(), _type: "object", number: 98, suffix: "%", label: "Client Satisfaction" },
          { _key: key(), _type: "object", number: 12, label: "Years of Experience" },
        ],
      },

      // Testimonials
      {
        _key: key(),
        _type: "testimonials",
        heading: "What Our Clients Say",
        layout: "grid",
        items: [
          {
            _key: key(),
            _type: "object",
            quote:
              "They transformed our outdated website into a modern platform that our customers love. The attention to detail was exceptional.",
            name: "Maria Santos",
            title: "CEO, Greenfield Co.",
            photo: imageRef(assets.testimonial1, "Maria Santos"),
          },
          {
            _key: key(),
            _type: "object",
            quote:
              "Professional, responsive, and genuinely invested in our success. The new site increased our leads by 40% in the first quarter.",
            name: "David Kim",
            title: "Marketing Director, Apex Solutions",
            photo: imageRef(assets.testimonial2, "David Kim"),
          },
          {
            _key: key(),
            _type: "object",
            quote:
              "From the initial strategy session to launch day, every step was handled with care. Highly recommend.",
            name: "Emily Brooks",
            title: "Founder, Bright Studio",
            photo: imageRef(assets.testimonial3, "Emily Brooks"),
          },
        ],
      },

      // FAQ
      {
        _key: key(),
        _type: "faq",
        heading: "Frequently Asked Questions",
        items: [
          {
            _key: key(),
            _type: "object",
            question: "How long does a typical project take?",
            answer: [
              block(
                "Most projects take 6\u201312 weeks from kickoff to launch, depending on scope. We'll provide a detailed timeline during the discovery phase."
              ),
            ],
          },
          {
            _key: key(),
            _type: "object",
            question: "Do you offer ongoing maintenance?",
            answer: [
              block(
                "Yes. We offer monthly support plans that include content updates, performance monitoring, security patches, and priority bug fixes."
              ),
            ],
          },
          {
            _key: key(),
            _type: "object",
            question: "Can I manage the content myself?",
            answer: [
              block(
                "Absolutely. Every site we build includes Sanity CMS with an intuitive editing interface. We provide training so your team feels confident managing content from day one."
              ),
            ],
          },
        ],
      },

      // CTA
      {
        _key: key(),
        _type: "cta",
        heading: "Ready to Start Your Project?",
        body: "Let's talk about how we can help bring your vision to life.",
        primaryButton: { _type: "link", label: "Contact Us", url: "/contact", isExternal: false },
        secondaryButton: { _type: "link", label: "View Our Work", url: "/about", isExternal: false },
        backgroundColor: "primary",
      },
    ],
  });

  // -------------------------------------------------------------------------
  // 7. About Page
  // -------------------------------------------------------------------------

  console.log("  Creating about page...");

  await client.createOrReplace({
    _id: "seed-about",
    _type: "page",
    title: "About",
    slug: { _type: "slug", current: "about" },
    seo: {
      metaTitle: "About — Demo Site",
      metaDescription: "Learn more about our team, our values, and how we work.",
    },
    modules: [
      // Hero
      {
        _key: key(),
        _type: "hero",
        heading: "About Us",
        subheading: "A small team with big ambitions and a track record to match.",
      },

      // Text Block
      {
        _key: key(),
        _type: "textBlock",
        body: [
          block("Our Story", "h2"),
          block(
            "We started with a simple belief: every business deserves a website that works as hard as they do. Too many companies settle for cookie-cutter templates that don't reflect their brand or serve their customers."
          ),
          block(
            "That's where we come in. We combine thoughtful design, modern technology, and clear strategy to build digital experiences that drive real results. No fluff, no jargon — just solid work."
          ),
        ],
      },

      // Team Grid
      {
        _key: key(),
        _type: "teamGrid",
        heading: "Meet the Team",
        members: [
          { _key: key(), _type: "reference", _ref: "seed-team-1" },
          { _key: key(), _type: "reference", _ref: "seed-team-2" },
          { _key: key(), _type: "reference", _ref: "seed-team-3" },
        ],
      },

      // Image Gallery
      {
        _key: key(),
        _type: "imageGallery",
        images: [
          { _key: key(), ...imageRef(assets.gallery1, "Team working in modern office"), caption: "Our workspace" },
          { _key: key(), ...imageRef(assets.gallery2, "Whiteboard strategy session"), caption: "Strategy session" },
          { _key: key(), ...imageRef(assets.gallery3, "Team celebrating project launch"), caption: "Launch day" },
          { _key: key(), ...imageRef(assets.gallery4, "Design review meeting"), caption: "Design review" },
        ],
      },
    ],
  });

  // -------------------------------------------------------------------------
  // 8. Contact Page
  // -------------------------------------------------------------------------

  console.log("  Creating contact page...");

  await client.createOrReplace({
    _id: "seed-contact",
    _type: "page",
    title: "Contact",
    slug: { _type: "slug", current: "contact" },
    seo: {
      metaTitle: "Contact — Demo Site",
      metaDescription: "Get in touch with us. We'd love to hear about your project.",
    },
    modules: [
      {
        _key: key(),
        _type: "hero",
        heading: "Get in Touch",
        subheading: "Have a project in mind? We'd love to hear from you.",
      },
      {
        _key: key(),
        _type: "contactForm",
        heading: "Send Us a Message",
        description: "Fill out the form below and we'll get back to you within one business day.",
        recipientEmail: process.env.CONTACT_FORM_RECIPIENT || "hello@example.com",
        successMessage: "Thank you! Your message has been sent. We'll be in touch soon.",
      },
    ],
  });

  // -------------------------------------------------------------------------
  // 9. Blog Post
  // -------------------------------------------------------------------------

  console.log("  Creating sample blog post...");

  await client.createOrReplace({
    _id: "seed-blog-post-1",
    _type: "blogPost",
    title: "Why Headless CMS Is the Future of Content Management",
    slug: { _type: "slug", current: "why-headless-cms" },
    author: "Alex Rivera",
    publishedAt: new Date().toISOString(),
    excerpt:
      "Traditional CMS platforms are showing their age. Here's why headless architecture is the smarter choice for modern websites.",
    featuredImage: imageRef(assets.blog, "Laptop displaying code on a desk"),
    body: [
      block(
        "If you've ever wrestled with a monolithic CMS — fighting against rigid templates, slow page loads, and security vulnerabilities — you already know the pain points. Headless CMS solves all of them."
      ),
      block("What Is a Headless CMS?", "h2"),
      block(
        "A headless CMS separates your content from your presentation layer. You manage content through a structured editor (like Sanity Studio), and your frontend fetches that content via API. This means your developers can use any framework they want — React, Next.js, Vue, Svelte — without being locked into the CMS's templating system."
      ),
      block("The Benefits", "h2"),
      block(
        "Performance is the most immediate win. Without server-side rendering bottlenecks from a traditional CMS, your pages load faster. Combined with static generation and edge caching, you can achieve sub-second load times consistently."
      ),
      block(
        "Security improves dramatically too. There's no publicly accessible admin panel to attack, no database directly connected to your frontend, and no plugins with known vulnerabilities."
      ),
      block(
        "Finally, developer experience is night and day. Your team works with modern tools, type-safe queries, and component-based architecture instead of fighting PHP templates and plugin conflicts."
      ),
      block("Is It Right for You?", "h2"),
      block(
        "If your content needs to appear on a website, a mobile app, or any other channel, headless is the clear choice. If your team values performance, security, and developer productivity, it's worth the switch. The learning curve is modest, and the long-term benefits are substantial."
      ),
    ],
    seo: {
      metaTitle: "Why Headless CMS Is the Future of Content Management",
      metaDescription:
        "Traditional CMS platforms are showing their age. Learn why headless CMS architecture is the smarter choice for modern websites.",
    },
  });

  // -------------------------------------------------------------------------
  // Done
  // -------------------------------------------------------------------------

  console.log("\n  Seed complete! Demo content has been created.\n");
  console.log("  Start your dev server with: npm run dev");
  console.log("  Visit http://localhost:3000 to see the site.");
  console.log("  Visit http://localhost:3000/studio to edit content.\n");
}

main().catch((err) => {
  console.error("\n  Seed failed:", err.message, "\n");
  process.exit(1);
});
