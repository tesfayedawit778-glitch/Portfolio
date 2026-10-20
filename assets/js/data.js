/* ------------------------------------------------------------------
   All portfolio content lives here. Edit this file to update the site.
   Image paths are relative to index.html.
------------------------------------------------------------------- */

window.PORTFOLIO = {
  owner: {
    name: "Dawit Tesfaye",
    title: "Product Designer & UI/UX Designer",
    photo: "assets/img/dawit.png",
    location: "Addis Ababa, Ethiopia",
    experience: "3+ years",
    focus: "Web · Mobile · Systems",
    intro:
      "Product & UI/UX Designer focused on creating clear, scalable digital experiences across web, mobile, and emerging interactive products. I work from research and user flows through UI systems, prototyping, and delivery.",
    note:
      "I’m a product designer with several years of experience turning complex problems into clear, useful interfaces. I work from early ideas through to the details that make a product feel right.",
    outside:
      "Outside of design, I explore iOS development, using AI to turn my own ideas into apps I can use.",
    email: "davemak4621@gmail.com",
    phone: "+251 931 73 10 63",
  },

  links: {
    figma: "https://www.figma.com/files/team/1384856473691602065/folder/597472750?fuid=1384856471585799222",
    x: "https://x.com/dave_design19",
    linkedin: "https://www.linkedin.com/in/dawittesfaye01/",
    telegram: "https://t.me/Davlvmak",
  },

  music: {
    title: "lofi musics",
    artist: "Dawit Tsige",
    artwork: "assets/img/dawit.png",
    src: "assets/audio/lofi.mp3",
  },

  /* Default wallpaper per operating system (ids from the list below). */
  defaultWallpaper: { mac: "tahoe", win: "win11", linux: "ubuntu-crown" },

  wallpapers: [
    { id: "tahoe", name: "Lake Tahoe", src: "assets/img/wallpaper-tahoe.jpg" },
    { id: "win11", name: "Windows 11", src: "assets/img/wall-win11.jpg" },
    { id: "ubuntu-crown", name: "Ubuntu", src: "assets/img/wall-ubuntu-crown.jpg" },
    { id: "ubuntu-jellyfish", name: "Jammy Jellyfish", src: "assets/img/wall-ubuntu-jellyfish.jpg" },
    { id: "contrail", name: "Contrail", src: "assets/img/photo-contrail.jpg" },
    { id: "dusk", name: "Dusk", src: "assets/img/photo-dusk.jpg" },
    { id: "fog", name: "Fog", src: "assets/img/photo-fog.jpg" },
    { id: "prism", name: "Prism", src: "assets/img/photo-prism.jpg" },
    { id: "bloom", name: "Bloom", src: "assets/img/photo-bloom.jpg" },
    { id: "sequoia", name: "Sequoia", gradient: "linear-gradient(160deg,#0b1d4f 0%,#2a3fa3 35%,#d4588c 70%,#f6b26b 100%)" },
    { id: "graphite", name: "Graphite", gradient: "radial-gradient(120% 90% at 30% 20%,#4a4f5a 0%,#22252b 55%,#111214 100%)" },
  ],

  /* x / y = icon centre as % of the desktop (desktop layout only). */
  projects: [
    {
      slug: "vita-food-complex",
      title: "Vita Food Complex",
      label: "Vita Food Complex",
      icon: "assets/img/icon-vita.png",
      x: 10.3, y: 13,
      category: ["FMCG", "Corporate Website"],
      client: "Vita Hydro Agro-Processing PLC",
      timeline: "2026",
      role: ["Product Designer", "UI/UX Designer"],
      overview:
        "VITA Food Complex is a digital experience for an Ethiopian food manufacturing and agro-processing company. The website presents the company's products, brands, production capabilities, sustainability initiatives, innovation, and connection with distributors and customers.",
      delivered: ["Corporate Website", "Product Experience", "Brand Experience", "Content System"],
      challenge:
        "The business needed to communicate a wide range of information — from products and manufacturing capabilities to sustainability and innovation — without creating a complicated browsing experience.",
      solution:
        "I organized the experience around clear content categories and product-focused navigation, creating a visual system that allows users to explore the company's brands, products, recipes, sustainability initiatives, innovation, and business information.",
      shots: [
        { src: "assets/img/shot-vita-hero.png", caption: "Homepage hero" },
        { src: "assets/img/shot-vita-home.jpg", caption: "Homepage" },
        { src: "assets/img/shot-vita-product.jpg", caption: "Product detail" },
      ],
    },
    {
      slug: "orbit-eye-care",
      title: "Orbit Eye Care",
      label: "Orbit Eye Care",
      icon: "assets/img/icon-orbit.jpg",
      x: 31.2, y: 15,
      category: ["Healthcare"],
      client: "Orbit Eye Care",
      timeline: "2025",
      role: ["Product Designer", "UX/UI Designer"],
      overview:
        "Orbit Eye Care is a digital healthcare experience designed to make eye-care services easier to discover and appointments easier to book. The project includes a patient-facing experience and an administrative workflow for managing appointments and patient information.",
      challenge:
        "Patients needed a simple way to book appointments, while the internal team needed a structured workflow for managing new and returning patients and communicating appointment information with doctors.",
      solution:
        "I designed a streamlined appointment journey that guides patients from choosing their patient type through date selection and booking confirmation. I also designed the admin experience to support appointment management and doctor communication.",
    },
    {
      slug: "blih-erp",
      title: "Blih ERP",
      label: "Blih ERP",
      icon: "assets/img/icon-blih.jpg",
      x: 50.5, y: 17,
      category: ["Enterprise SaaS", "HR", "ERP"],
      client: "Blih Marketing and Communication",
      timeline: "2025 – 2026",
      role: ["Product Designer", "UI/UX Designer"],
      overview:
        "Blih ERP is an enterprise management platform designed to support business operations across different organizational functions. My work focused on the HR experience, particularly the recruitment and hiring workflow.",
      challenge:
        "Recruitment teams need to manage large amounts of candidate information, interviews, evaluations, shortlists, and offers without losing visibility across the hiring process.",
      solution:
        "I designed a structured recruitment experience that organizes candidates and hiring activities into clear stages. The experience provides dedicated workflows for ongoing recruitment, interviews, candidate evaluation, shortlisting, wishlists, and offer management.",
      shots: [{ src: "assets/img/shot-blih-dashboard.png", caption: "HR dashboard" }],
    },
    {
      slug: "build-the-coffee-belt",
      title: "Build the Coffee Belt",
      label: "Build the coffee belt",
      icon: "assets/img/icon-coffee-belt.jpg",
      x: 69, y: 20,
      category: ["Interactive Experience", "Educational Game", "Museum Kiosk"],
      client: "Ablaze Labs",
      timeline: "2026",
      role: ["Product Designer", "UI/UX Designer"],
      overview:
        "Build the Coffee Belt is an interactive touchscreen experience designed to teach visitors about the world's coffee-growing regions through exploration and game-based interaction.",
      challenge:
        "The experience needed to educate visitors about coffee geography and processing while remaining engaging for an older, general audience. Complex information also needed to work naturally within a large touchscreen environment.",
    },
    {
      slug: "dagmawi-video-editor",
      title: "Dagmawi Video Editor",
      label: "Dagemawi Video Editor",
      icon: "assets/img/icon-dagmawi.jpg",
      x: 16.2, y: 36,
      category: ["Creative Services", "Portfolio Website"],
      client: "Dagmawi Tesfaye",
      timeline: "2024",
      role: ["Product Designer", "UI/UX Designer"],
      overview:
        "A personal portfolio and service website designed for a professional video editor to showcase creative work, communicate editing services, and convert visitors into potential clients.",
      delivered: ["Portfolio Website", "Service Experience", "Project Showcase", "Pricing Section", "Responsive Web Experience"],
      challenge:
        "The website needed to present creative work visually while making the editor's services, process, packages, and contact options easy to understand.",
      solution:
        "I designed a visual-first portfolio experience that combines project showcases with clearly structured service categories, an editing process, pricing packages, and strong calls to action.",
    },
    {
      slug: "coffee-quiz",
      title: "Coffee Quiz",
      label: "Quiz Game",
      icon: "assets/img/icon-quiz.jpg",
      x: 33.7, y: 38.5,
      category: ["Interactive Kiosk", "Quiz Game", "Educational Experience"],
      client: "Coffee Interpretation Center",
      timeline: "2026",
      role: ["Product Designer", "UI/UX Designer"],
      overview:
        "Coffee Quiz is a game-based learning experience that tests visitors' knowledge of coffee through interactive questions and challenges.",
      delivered: ["Interactive Quiz", "Touchscreen Game", "Question & Answer Flow", "Feedback System", "Prototype"],
      challenge:
        "After exploring the exhibition, visitors need a fun way to recall and test what they've learned without turning the experience into a traditional educational test.",
      solution:
        "I designed a lightweight quiz experience with clear questions, intuitive touch interactions, immediate feedback, and game-like progression to make learning feel more engaging and memorable.",
    },
    {
      slug: "lms",
      title: "Learning Management System",
      label: "LMS",
      icon: "assets/img/icon-lms.jpg",
      x: 50.5, y: 42,
      category: ["EdTech", "Learning Platform"],
      client: "Debre",
      timeline: "2026",
      role: ["Product Designer", "UI/UX Designer"],
      overview:
        "A learning management platform designed to support digital learning through structured courses, learning content, and an organized student experience.",
      delivered: ["LMS Platform", "Learning Dashboard", "Course Experience", "User Interface", "Interactive Prototype"],
      challenge:
        "Learning platforms can become difficult to navigate when courses, lessons, progress, and learning resources are not organized around the learner's journey.",
      solution:
        "I focused on creating a clear learning structure with intuitive navigation, organized course content, and a dashboard experience that helps learners understand where they are and what to do next.",
      shots: [
        { src: "assets/img/shot-lms-home.png", caption: "Homepage" },
        { src: "assets/img/shot-lms-course.png", caption: "Course detail" },
        { src: "assets/img/shot-gubaye-home.png", caption: "Community site" },
      ],
    },
    {
      slug: "from-bean-to-coffee",
      title: "From Bean to Coffee",
      label: "Bean to Coffee",
      icon: "assets/img/icon-bean.jpg",
      x: 66.9, y: 38.5,
      category: ["Interactive Kiosk", "Educational Experience", "Storytelling"],
      client: "Coffee Interpretation Center",
      timeline: "2026",
      role: ["Product Designer", "UI/UX Designer"],
      overview:
        "From Bean to Coffee is an interactive experience that explains how coffee moves from the coffee cherry through processing and eventually becomes the coffee bean people know.",
      delivered: ["Interactive Kiosk", "Coffee Journey Experience", "Process Visualization", "Touch Interaction", "Prototype"],
      challenge:
        "Coffee production involves multiple stages that can be difficult to understand when presented as static information. The experience needed to turn the process into something visitors could explore naturally.",
      solution:
        "I designed the experience as an interactive journey through the coffee-production process, allowing visitors to explore different stages and understand how coffee changes from cherry to processed bean through visual interaction and contextual information.",
    },
    {
      slug: "wave-app",
      title: "Wave App",
      label: "Wave App",
      icon: "assets/img/icon-wave.jpg",
      x: 11, y: 58,
      category: ["Fintech", "Mobile App"],
      client: "Blih Marketing and Communication PLC",
      timeline: "2025 – 2026",
      role: ["Product Designer", "UI/UX Designer"],
      overview:
        "Wave is a mobile product experience designed around simplifying digital financial interactions and creating a clear, accessible mobile experience for users.",
      challenge:
        "Financial products often contain multiple actions, states, and pieces of information that can make everyday tasks difficult to understand and navigate.",
      solution:
        "I focused on creating a clear mobile information hierarchy, simplifying key interactions, and designing reusable patterns that make the experience easier to navigate and scale.",
    },
    {
      slug: "bunna-bank-ecommerce",
      title: "Bunna Bank Ecommerce",
      label: "Bunna Bank Ecommerce",
      icon: "assets/img/icon-bunna.jpg",
      x: 29.6, y: 60,
      category: ["Banking", "E-commerce", "Responsive Web"],
      client: "Bunna Bank",
      timeline: "January 2025",
      role: ["UI/UX Designer"],
      overview:
        "This project focused on improving the responsiveness and user experience of a digital banking/e-commerce experience across different screen sizes and devices.",
      challenge:
        "The experience needed to maintain usability, visual consistency, and clear content hierarchy across desktop, tablet, and mobile breakpoints.",
      solution:
        "I worked on responsive layouts and interface behavior to ensure that key content and interactions remain accessible and usable across different viewport sizes.",
    },
    {
      slug: "maya-ai",
      title: "MAYA AI",
      label: "MAYA AI",
      icon: "assets/img/icon-maya.jpg",
      x: 52.6, y: 63,
      category: ["AI", "Architecture", "AR"],
      client: "Academic / Final Year Project",
      timeline: "2024 – 2025",
      role: ["Product Designer", "UI/UX Designer"],
      overview:
        "MAYA AI is an intelligent architectural design system created to help users generate architectural concepts, including floor, interior, and exterior plans, while using AR technology to visualize designs in their environment.",
      challenge:
        "Architectural planning can involve complex communication between ideas, drawings, and physical spaces. Users need a more interactive way to explore and visualize design concepts.",
    },
    {
      slug: "bible-website",
      title: "Bible Website",
      label: "Bible Website",
      icon: "assets/img/icon-bible.jpg",
      x: 70.3, y: 59,
      category: ["Content Platform"],
      client: "Mahbere Nehemeya / Community Project",
      timeline: "December 2024",
      role: ["Product Designer", "UI/UX Designer"],
      overview:
        "A digital Bible website designed to make scripture content easier to discover, navigate, and read through a focused web experience.",
      delivered: ["Responsive Website", "Bible Content Experience", "Navigation System", "Reading Experience"],
      challenge:
        "Large amounts of scripture content require clear information architecture and navigation so users can quickly find the book, chapter, and content they are looking for.",
      solution:
        "I designed a structured reading experience with clear navigation and content hierarchy, keeping the interface focused on accessibility and comfortable reading.",
    },
  ],

  services: [
    {
      title: "Product Design",
      icon: "cube",
      text: "End-to-end product thinking — from research and user flows to shipped interfaces for web and mobile products.",
    },
    {
      title: "UI/UX Design",
      icon: "pen",
      text: "Clear information hierarchy, wireframes and high-fidelity UI that make complex tasks feel simple.",
    },
    {
      title: "Design Systems",
      icon: "grid",
      text: "Reusable components and patterns that keep products consistent and easy to scale.",
    },
    {
      title: "Interactive & Kiosk Experiences",
      icon: "hand",
      text: "Touchscreen and museum experiences that teach through exploration, play and storytelling.",
    },
    {
      title: "Responsive Web",
      icon: "devices",
      text: "Corporate sites, portfolios and platforms that hold up across desktop, tablet and mobile.",
    },
    {
      title: "Prototyping",
      icon: "play",
      text: "Interactive prototypes in Figma to test ideas early and hand off with confidence.",
    },
  ],

  gallery: [
    {
      title: "Contrail",
      category: "Sky",
      image: "assets/img/photo-contrail.jpg",
      summary: "A single mark on an empty field, and what that does to a composition.",
      body: [
        "The sky was empty that morning until a plane crossed it. For a few minutes there was exactly one thing to look at, and the frame held together because of it.",
        "I keep this one near my desk. Most interfaces fail for the opposite reason. There is nothing in them that asks to be looked at first.",
      ],
    },
    {
      title: "Dusk",
      category: "Light",
      image: "assets/img/photo-dusk.jpg",
      summary: "Twenty minutes when the sky shows its full range at once.",
      body: [
        "Blue at the top, gold at the bottom, and a long band in the middle that has no name. Dusk is the only hour where all three sit in one frame.",
        "I sampled this into a palette and it collapsed. Six flat stops looked nothing like the photograph, because the value is in the transition and not in the colours.",
      ],
    },
    {
      title: "Fog",
      category: "Atmosphere",
      image: "assets/img/photo-fog.jpg",
      summary: "A ridge losing its edges, and the case for soft boundaries.",
      body: [
        "By the time I set up, the ridge had no outline left. A dark mass on one side, white on the other, and a border that kept moving between them.",
        "Soft edges are expensive on a screen. Every blur is another repaint. This is the argument for spending it anyway.",
      ],
    },
    {
      title: "Prism",
      category: "Colour",
      image: "assets/img/photo-prism.jpg",
      summary: "Light through broken glass, kept at the point it stops behaving.",
      body: [
        "A piece of glass on a black desk, a torch, and an hour of moving both around. The colour is not edited. It is what the glass did.",
        "The black had to be real black. Lift it even slightly and the colour loses its weight.",
      ],
    },
    {
      title: "Bloom",
      category: "Colour",
      image: "assets/img/photo-bloom.jpg",
      summary: "Red pushed to the edge of what a display can hold.",
      body: [
        "A long exposure of a red light with the lens moving. The colour ran past where it should have stopped and the file came back like this.",
        "There is no black anywhere in the frame. The darkest point is a deep orange, which is why the corners still feel warm.",
      ],
    },
  ],
};
