export const languages = ["en", "ru", "ua"] as const;

export type Language = (typeof languages)[number];

export const languageLabels: Record<Language, { short: string; label: string }> = {
  en: { short: "EN", label: "English" },
  ru: { short: "RU", label: "Русский" },
  ua: { short: "UA", label: "Українська" },
};

const en = {
  account: {
    nav: {
      brand: "Applicant account",
      overview: "Overview",
      overviewShort: "Overview",
      nominations: "My Nominations",
      nominationsShort: "Nominations",
      tickets: "Tickets",
      ticketsShort: "Tickets",
      profile: "Profile",
      profileShort: "Profile",
      settings: "Account Settings",
      settingsShort: "Settings",
      signOut: "Log out",
      expandSidebar: "Expand sidebar",
      collapseSidebar: "Collapse sidebar",
      openMenu: "Open applicant menu",
      drawerTitle: "Applicant account",
      navAria: "Applicant navigation",
      drawerAria: "Applicant drawer navigation",
    },
    statuses: {
      DRAFT: "Draft",
      PAYMENT_PENDING: "Payment pending",
      PURCHASED: "Purchased",
      SUBMITTED: "Submitted",
      UNDER_REVIEW: "Under review",
      RETURNED_FOR_CHANGES: "Returned for changes",
      LOCKED: "Locked",
      SCORED: "Scored",
      WITHDRAWN: "Withdrawn",
      APPROVED: "Approved",
      REJECTED: "Rejected",
      PAID: "Paid",
      PENDING: "Pending payment",
      FAILED: "Payment failed",
      EXPIRED: "Expired",
      REFUNDED: "Refunded",
      CANCELED: "Canceled",
    } as Record<string, string>,
    common: {
      back: "Back",
      edit: "Edit",
      save: "Save",
      loading: "Loading",
      notProvided: "Not provided",
      required: "required",
      optional: "optional",
    },
    badges: {
      paid: "Paid",
      paymentPending: "Payment pending",
      locked: "Locked",
      completion: "Completion",
    },
    editor: {
      backToNominations: "Back to nominations",
      subtitle: "Complete your nomination application",
      lockedDescription:
        "This application has been finalized and is shown read-only. Contact us if something looks wrong.",
      submittedDescription:
        "Submitted to the jury. You can keep refining your answers and uploads until applications close.",
      draftDescription:
        "Complete the required fields and uploads below, save your progress at any time, then submit to the jury.",
      sectionNavLabel: "Application sections",
      sections: {
        details: "Work Details",
        detailsDescription: "Key facts about you and your professional work.",
        description: "Description",
        descriptionDescription: "Tell the jury about your work in your own words.",
        uploads: "File Uploads",
        uploadsDescription: "Portfolio images, documents, and supporting files for the jury.",
        review: "Review",
        reviewDescription: "Check every section, then submit your nomination to the jury.",
      },
      requiredBefore: "Required before submission",
      missingHint: "Select an item to jump to that section.",
      moreMissing: "more",
      allComplete: "All required fields and uploads are complete.",
      submitWhenReady: "Submit when you are ready.",
      completion: "Completion",
      lastSaved: "Last saved",
      justNow: "just now",
      filesAttached: "Files attached",
      finalScore: "Final score",
      scoresPending: "Scores have not been released yet.",
      saveDraft: "Save draft",
      submit: "Submit to jury",
      updateSubmission: "Update submission",
      uploadingFiles: "Uploading files…",
      saving: "Saving…",
      submitting: "Submitting…",
      draftSaved: "Draft saved.",
      submittedNotice: "Nomination submitted to the jury.",
      saveError: "Could not save this nomination.",
      lockedNotice: "This nomination has been finalized and can no longer be edited.",
      paymentPendingNotice: "Editing unlocks once payment is confirmed.",
      submittedHint: "Submitted nominations stay editable until applications close.",
      reviewReadiness: "Submission readiness",
      readyToSubmit: "This nomination is ready to submit.",
      missingBeforeSubmit: "Complete the missing items before submitting.",
      emptySection: "This section has no fields for your nomination.",
      editSection: "Edit",
      notFilled: "Not filled in yet",
      noFilesUploaded: "No files uploaded yet",
      wordsLabel: "words",
      select: "Select",
    },
    addFlow: {
      label: "Applicant account",
      title: "Add nominations",
      description:
        "Pick a category, choose the nominations you want to compete in, review your total, and continue to secure checkout.",
      steps: {
        category: "Category",
        nominations: "Nominations",
        review: "Review",
        payment: "Payment",
      },
      selectedCategory: "Selected category",
      changeCategory: "Change category",
      available: "available",
      nominationLabel: "nomination",
      nominationsLabel: "nominations",
      allOwned: "You already own every nomination here.",
      chooseNominations: "Choose nominations",
      viewNominations: "View nominations",
      selectedBadge: "selected",
      alreadyPurchased: "Already purchased",
      allOwnedCategory:
        "You already own every nomination in this category. Pick another category to keep building your selection.",
      noneSelected: "No nominations selected yet.",
      totalLabel: "total",
      reviewSelection: "Review selection",
      emptySelection: "Your selection is empty. Go back to the previous steps to choose nominations.",
      removeAward: "Remove",
      orderSummary: "Order summary",
      nominationsRow: "Nominations",
      rateRow: "Rate",
      memberRate: "IBPA member",
      standardRate: "Standard",
      packageRow: "Package",
      totalDue: "Total due today",
      memberApplied: "Verified member pricing applied",
      continuePayment: "Continue to payment",
      creatingCheckout: "Creating checkout…",
      stripeNote: "You will be redirected to secure Stripe Checkout.",
      checkoutError: "Could not create checkout. Please try again.",
      redirectTitle: "Redirecting to secure checkout",
      redirectText: "Hold on — we are preparing your secure Stripe Checkout session.",
      noCategoriesTitle: "No categories available",
      noCategoriesText: "Award categories have not been published yet. Please check back soon.",
      backToDashboard: "Back to dashboard",
      backToNominations: "Back to nominations",
    },
    settings: {
      label: "Applicant account",
      title: "Account settings",
      description:
        "Your sign-in and account details. Nomination and profile information live on their own pages.",
      account: "Account",
      email: "Email",
      role: "Role",
      applicant: "Applicant",
      memberSince: "Member since",
      language: "Language",
      languageText:
        "Choose the language of your applicant account. Your choice is saved for future visits.",
      languageAria: "Account language",
      password: "Password",
      passwordText: "To change your password we send a secure reset link to your email address.",
      sendResetLink: "Send reset link",
      otherTitle: "Need to change something else?",
      otherText:
        "Email changes and account removal are handled by our team so your nominations and tickets stay correctly linked.",
      contactSupport: "Contact support",
    },
    overview: {
      eyebrow: "Applicant dashboard",
      closedTitle: "Applications are closed",
      openTitle: "Complete your purchased nominations",
      overallProgress: "Overall progress",
      allSubmitted: "All nominations submitted",
      remainingLabel: "Nominations remaining:",
      closesPrefix: "Applications close",
      closedPrefix: "Applications closed",
      daysRemaining: "Days remaining",
      daysWord: "days",
      untilClose: "until applications close",
      myNominations: "My nominations",
      viewAll: "View all",
      emptyTitle: "No nominations yet",
      emptyText: "Paid nominations will appear here after checkout is confirmed.",
      addNominations: "Add nominations",
    },
    stats: {
      purchased: "Purchased",
      purchasedDetail: "Paid nominations in your account",
      drafts: "Drafts",
      draftsDetail: "Saved progress, not visible to judges",
      submitted: "Submitted",
      submittedDetail: "Visible to the jury",
      completion: "Completion",
      completionDetail: "Average across nominations",
    },
    widgets: {
      quickActions: "Quick actions",
      continueLatest: "Continue latest nomination",
      addNominations: "Add nominations",
      openTickets: "Open tickets",
      editProfile: "Edit profile",
      reminder: "Important reminder",
      close: "Applications close",
      closed: "Applications closed",
      closedText: "Submitted nominations are read-only for judging.",
      daysRemainingLabel: "Days remaining:",
      supportTitle: "Thank you for being part of the IBPA community.",
      supportText: "We can't wait to see your work. If anything is unclear, our team is happy to help.",
      contactSupport: "Contact support",
    },
    card: {
      progress: "Progress",
      updated: "Updated",
      view: "View",
      start: "Start",
      continue: "Continue",
      allComplete: "All required fields complete",
      missingLabel: "Required fields missing:",
    },
    nominationsPage: {
      title: "My nominations",
      purchasedWord: "purchased",
      draftWord: "in draft",
      submittedWord: "submitted",
      visibilityNote: "Purchased and draft nominations are not visible to judges until submitted.",
    },
    profile: {
      title: "Profile",
      description:
        "These details are attached to every nomination you submit. To correct anything, contact our support team.",
      verifiedMember: "Verified member",
      phone: "Phone",
      professionalTitle: "Professional title",
      yearsExperience: "Years of experience",
      country: "Country",
      stateProvince: "State / province",
      city: "City",
      membership: "IBPA membership",
      membershipNumber: "Membership number",
      membershipLevel: "Membership level",
      verified: "Verified",
      notVerified: "Not verified",
      publicLinks: "Public links",
      website: "Website",
      socialProfile: "Social profile",
      reviews: "Reviews",
      linksNote: "Links may be shown to the jury alongside your nominations.",
      notSet: "Not set",
    },
    tickets: {
      title: "Tickets",
      description:
        "Your forum and gala access. Tickets purchased with this email appear here automatically after payment.",
      emptyTitle: "No ticket found",
      emptyText: "Tickets purchased with this email will appear here after payment.",
      browseTickets: "Browse tickets",
      access: "Access",
      purchased: "Purchased",
      galaIncluded: "Gala dinner included",
      forumAccess: "Forum access",
      qrPending: "QR code is not active yet. It will appear here once your entry credential is issued.",
      entryInstructions: "Entry instructions",
      stepQrTitle: "Present your QR code",
      stepQrText: "Your personal QR code is scanned once at the entrance on the day of the event.",
      stepBrightTitle: "Keep your screen bright",
      stepBrightText: "Open the QR code full screen and raise your brightness so scanning is instant.",
      stepMailTitle: "Bring your confirmation",
      stepMailText: "Your ticket is tied to the email used at purchase. A copy was sent to your inbox.",
    },
  },
  common: {
    applyNow: "Apply",
    applyAsParticipant: "Apply as Participant",
    applyAsJury: "Apply as Judge",
    browseCategories: "Browse Categories",
    juryAccount: "Jury Account",
    jury: "Jury",
    categories: "Categories",
    grandPrix: "Grand Prix",
    home: "Home",
    from: "from",
  },
  header: {
    navigation: {
      home: "Home",
      categories: "Categories",
      jury: "Jury",
      grandPrix: "Grand Prix",
    },
    openMenu: "Open menu",
    closeMenu: "Close menu",
    language: "Language",
  },
  home: {
    hero: {
      eyebrow: "Industry Leadership Conference",
      title: "IBPA Beauty Award 2026",
      subtitle: "Beauty Business Forum + IBPA Beauty Award 2026",
      date: "September 25–26, 2026",
      location: "950 South Broadway, Los Angeles, CA 90015",
      buyTickets: "Buy Forum Tickets",
      description: "",
      categoriesCta: "Explore Categories",
      ticker: [
        "IBPA Beauty Award 2026",
        "International Recognition",
        "Professional Excellence",
        "11 Categories",
        "Global Jury",
        "Open to the World",
      ],
    },
    awardsInfo: {
      eyebrow: "About the award",
      title: "IBPA Beauty Awards 2026",
      text: "IBPA Beauty Awards 2026 is an international award in beauty, education, and beauty business, held as part of the IBPA Beauty Business Forum. Our mission is to recognize outstanding professionals, support professional development, and unite industry leaders for the exchange of experience, innovation, and new growth opportunities.",
    },
    threeExperiences: {
      eyebrow: "One Event",
      title: "Three Powerful Experiences",

      forum: {
        title: "Beauty Business Forum",
        subtitle: "Knowledge. Connections. Growth.",
        bullets: [
          "Insights from successful entrepreneurs and beauty industry experts.",
          "Practical strategies for business growth and scaling.",
          "Networking opportunities with salon owners, educators, brands, and industry leaders.",
          "A space for collaboration, innovation, and new business opportunities."
        ],
        footer:
          "Designed for beauty professionals, educators, business owners, and brands seeking growth, meaningful connections, and long-term success."
      },
      awards: {
        title: "IBPA Beauty Awards 2026",
        subtitle: "Recognition. Prestige. Opportunity.",
        bullets: [
          "An international award celebrating excellence in the beauty industry.",
          "Independent evaluation by a panel of respected international experts.",
          "An opportunity to strengthen your professional reputation and personal brand.",
          "Awards that highlight outstanding achievements and industry leadership."
        ],
        footer:
          "Created for beauty professionals, educators, business owners, and brands seeking recognition, credibility, and greater visibility within the industry."
      },

      exhibition: {
        title: "Brand Exhibition",
        subtitle: "Innovation. Partnership. Growth.",
        bullets: [
          "Discover the latest beauty products and technologies.",
          "Connect with leading brands and industry suppliers.",
          "Test products and receive professional consultations.",
          "Access exclusive offers and valuable business connections."
        ],
        footer:
          "For beauty professionals and business owners looking for new opportunities and industry innovations."
      }
    },
    registrationSection: {
      eyebrow: "Participation",
      title: "Everything You Need to Join",

      registration: {
        title: "Registration Period",
        date: "1 June – 8 July 2026",
        description:
          "Applications are accepted from June 20 through August 15, 2026."
      },

      tabs: {
        tickets: "Tickets",
        awards: "Awards",
        jury: "Jury"
      },

      tickets: {
        title: "Beauty Business Forum",
        price: "$395",
        suffix: "from / day",
        description:
          "Business growth, networking, education, and industry connections.",
        cta: "Buy Ticket",

        items: [
          ["1 Day Forum", "$395"],
          ["2 Day Forum", "$695"],
          ["Gala Dinner", "$150"]
        ],
      },

      cta: "Apply Now",

      registrationInfo: {
        eyebrow: "Registration Period",
        value: "2 July – 10 August",
        text: "Applications are accepted from June 1 through July 8, 2026 inclusive.",
      },

      feeInfo: {
        eyebrow: "Registration Fee",
        value: "$50+",
        text: "Participation is paid separately for each selected nomination.",
      },

      juryInfo: {
        eyebrow: "Jury Registration",
        value: "$100+",
        text: "Professionals with at least 5 years of experience may apply to join the jury. The registration fee is paid only after approval.",
      },

      participationInfo: {
        eyebrow: "Participation",
        value: "Open to Everyone",
        text: "Specialists of all levels may apply, with no restrictions by country or years of experience.",
      },

      grandPrixInfo: {
        eyebrow: "Grand Prix",
        value: "5+",
        text: "Participants who submit applications in 5 or more nominations automatically enter the Grand Prix category.",
      },

      pricing: {
        eyebrow: "Pricing",
        title: "Participation Pricing",
        description:
          "Forum tickets, award nominations, and jury registration are priced separately. Forum and award pricing differs for IBPA members and guests.",
        option: "Option",
        members: "IBPA Members",
        standard: "Guest",
        nonMembers: "Non-members",
        memberPricingNote: "IBPA Member pricing is available to current IBPA Association members.",
        awardPricingNote: "Save more with multi-nomination packages.",
        memberDiscountNote: "IBPA members receive a discounted jury registration rate.",
        mostPopular: "Most popular",

        forum: {
          eyebrow: "Tickets",
          title: "Forum Tickets",
          oneDay: "1 Day Forum",
          twoDays: "2 Days Forum",
          galaDinner: "Gala Dinner",
        },

        award: {
          eyebrow: "Award",
          title: "Award Nominations",
          oneNomination: "1 Nomination",
          threeNominations: "3 Nominations",
          fiveNominations: "5 Nominations",
          note: "Grand Prix participation is activated automatically for participants with 5 or more nominations.",
        },

        jury: {
          eyebrow: "Jury",
          title: "Jury Registration",
          member: "IBPA Member",
          standard: "Guest",
        },

        ctaEyebrow: "Ready to Join",
        ctaTitle: "Start your IBPA 2026 application",
        ctaText:
          "Choose the participation format that fits you best and submit your application online.",
      },
      awards: {
        title: "IBPA Beauty Awards",
        price: "$50",
        suffix: "per nomination",
        description:
          "International recognition, professional credibility, and visibility.",
        cta: "Submit Nomination",

        member: "IBPA Member",
        standard: "Non-member",

        rows: [
          ["1 Nomination", "$50", "$70"],
          ["3 Nominations", "$130", "$190"],
          ["5 Nominations", "$200", "$300"]
        ],

        grandPrixTitle: "Grand Prix",
        grandPrixDescription:
          "Automatically included for participants with 5 or more nominations."
      },

      jury: {
        title: "Jury Registration",
        price: "$100+",
        description:
          "Open to professionals with 5+ years of industry experience.",
        cta: "Apply as Jury",

        points: [
          "Minimum 5 years of professional experience",
          "International jury community",
          "Recognition as an industry expert"
        ],

        note:
          "Registration fee is paid only after the application is approved."
      },

      openParticipation: {
        title: "Open Participation",
        description:
          "Professionals of all levels and from all countries are welcome."
      }
    },
    speakersSection: {
      eyebrow: "Forum Speakers",
      title: "Learn from Industry Leaders",
      description:
        "Successful beauty entrepreneurs and experts will share practical strategies, real-world experience, and proven systems that help professionals build stronger businesses.",

      readMore: "Read more",
      showLess: "Show less",
      topicLabel: "Topic",
      presentationLabel: "Presentation",

      speakers: [
        {
          name: "Yaroslavna Atapina",
          photo: "/images/speakers/yara-atapina.jpeg",
          role:
            "Owner of two nail salons in Silicon Valley, USA, and an active nail professional with more than 10 years of experience. Over the past three years, she has built a strong business ecosystem with structured operations, exceptional customer service, and an efficiently managed team of 30 professionals.",
          city: "San Jose, California, USA",
          topic: "Systems Instead of Chaos: The Foundations of Scaling a Beauty Business",
          description:
            "In this presentation, I will explain how to build a beauty business based on systems rather than chaos from the very beginning. This session is valuable both for independent professionals who want to grow into salon owners and for studio owners looking to strengthen operations, customer service, and team management. I will share practical tools and solutions that are successfully implemented in my own business.",
          instagram: "https://www.instagram.com/yara.yaroslavna?igsh=NTc4MTIwNjQ2YQ==",
          website: ""
        },
        {
          name: "Natalie Vaulin",
          photo: "/images/speakers/natalie-vaulin.jpg",
          role:
            "Founder and CEO of Vaulabs, a U.S.-based contract cosmetics manufacturer specializing in Clean Beauty products. With more than 15 years of experience in marketing, branding, and business development, Natalie helps entrepreneurs transform ideas into market-ready beauty brands.",
          city: "Tampa, Florida, USA",
          topic:
            "How to Build Your Own Beauty Brand in the USA: From Idea to Store Shelf",
          description:
            "Launching a beauty brand in the U.S. can seem overwhelming. Natalie will share a step-by-step framework for creating and launching a successful beauty product—from validating the idea to selecting formulas, packaging, manufacturing, and preparing for market. Participants will learn how to avoid common mistakes, make informed decisions, and build products ready for long-term growth and scaling. The presentation is based on real U.S. product launches and practical industry experience.",
          instagram: "https://www.instagram.com/natalievaulin",
          website: "https://www.vaulabs.com"
        },
        {
          name: "Gulnara Chekoeva",
          photo: "/images/speakers/gulnara-chekoeva.jpg",
          role:
            "International-class hairstylist, hair designer, international judge and championship trainer. Asia Champion 2025, One Shot Hair Awards (USA) winner, and founder of one of the world's largest online hair education academies.",
          city: "United States",
          topic:
            "Building a World-Class Beauty Career Through Education, Championships, and Leadership",
          description:
            "Gulnara will share her journey of building an international career in the beauty industry, creating a strong personal brand, and educating professionals worldwide. She will explain how to develop successful educational programs, train beauty educators, and organize international championships based on her experience of teaching more than 100,000 professionals and delivering educational programs in over 20 countries.",
          instagram: "https://www.instagram.com/gulnarachekoeva?igsh=NTc4MTIwNjQ2YQ==",
          website: ""
        },
        {
          name: "Eleonora Bediukh",
          photo: "/images/speakers/eleonora-bediukh.jpg",
          role:
            "Brow artist and brow lamination specialist, educator, author of the book Brows Top Start, international judge, organizer of TB Champions, co-founder of TE’ORA Beauty Corp, and beauty influencer.",
          city: "Sacramento, California, USA",
          topic:
            "Content That Sells: A Social Media Growth System for Beauty Professionals Without Burnout",
          description:
            "This session is designed for brow artists, lash artists, nail technicians, makeup artists, cosmetologists, salon owners, educators, and beginners. Eleonora will demonstrate how to build a sustainable content strategy, attract clients through social media, create content that converts into sales, and grow a strong personal brand. The presentation is based on her real experience of growing an audience from 1,700 to 30,000 followers in just six months.",
          instagram: "https://www.instagram.com/elionora.brows?igsh=NTc4MTIwNjQ2YQ==",
          website: ""
        },
        {
          name: "Yulia Malina",
          photo: "/images/speakers/yulia-malina.png",
          role:
              "AI strategist, entrepreneur, and founder of the educational platform AI Insiders. Yulia develops AI agents and intelligent systems for content creation, marketing, and business automation, helping entrepreneurs transform scattered AI usage into efficient teams of specialized AI assistants.",
          city: "Miami, Florida, USA",
          topic:
              "The Next Generation of Beauty Business: How an AI Team Helps You Create, Sell, and Grow",
          description:
              "Artificial intelligence is no longer just one chatbot or a collection of disconnected tools. Yulia will demonstrate how a team of specialized AI assistants can help beauty professionals research the market, develop new services and products, create content, strengthen marketing, improve client communication, analyze business data, and streamline operations. The presentation includes practical use cases for independent beauty professionals, salons, academies, entrepreneurs, and beauty brands. Participants will also learn which business tasks should remain human-driven to preserve authenticity, expertise, and customer trust.",
          instagram: "https://www.instagram.com/yulia.malina.usa/",
          website: "https://ainsiders.club"
        },
        {
          name: "Hanna Vakulych",
          photo: "/images/speakers/hanna-vakulych.jpg",
          role:
              "Founder of Magica Beauty LLC (USA), international educator, beauty industry expert with more than 25 years of experience, former regional trainer for L'Oréal and Vitality's, international championship judge, and creator of proprietary educational methodologies.",
          city: "United States",
          topic:
              "Who Is Your Client? The Psychology of Sales Through Simple Examples",
          description:
              "Hanna will introduce her unique client profiling methodology based on well-known cartoon characters. This practical approach helps beauty professionals quickly understand different customer personalities, confidently handle objections, improve communication, and naturally increase sales. Participants will leave with an easy-to-use psychological framework that can be applied immediately in consultations and everyday client interactions.",
          instagram: "https://www.instagram.com/anna.vakulych.miami?igsh=NTc4MTIwNjQ2YQ==",
          website: ""
        },
        {
          name: "Yulia Bailo",
          photo: "/images/speakers/yulia-bailo.jpg",
          role:
            "Certified business mentor, neurocoach, entrepreneur with more than 15 years of business experience in the United States, and international speaker.",
          city: "United States",
          topic:
            "Before Scaling: How to Identify Bottlenecks and Find Growth Opportunities in Your Beauty Business",
          description:
            "In this presentation, participants will discover where sustainable business growth truly begins. Yulia will explain how to define clear business goals, identify the hidden limitations that slow growth and profitability, and recognize the most common bottlenecks beauty business owners face. She will also demonstrate which growth opportunities should be addressed before investing in scaling. Attendees will leave with a practical framework for diagnosing their own business, identifying what is holding it back, and understanding the highest-priority actions needed to build a more systematic, profitable, and sustainable business.",
          instagram: "https://www.instagram.com/yuliabailo_coach?igsh=NTc4MTIwNjQ2YQ==",
          website: ""
        },
      ]
    },
    dressCode: {
      eyebrow: "Beauty Business Forum",
      title: "Dress Code",
      description:
        "A style that highlights your professionalism and creates an inspiring atmosphere.",
      image: {
        src: "/images/forum/dress-code.jpg",
        alt: "Beauty Business Forum dress code examples",
      },
      colors: [
        {
          label: "White",
          value: "#FFFFFF",
        },
        {
          label: "Milk",
          value: "#E9DCCF",
        },
        {
          label: "Light Blue",
          value: "#B8CDE5",
        },
        {
          label: "Chocolate",
          value: "#442817",
        },
      ],
      days: [
        {
          eyebrow: "Day 1",
          title: "Business Casual",
          description:
            "A polished and comfortable business look in white, milk, light blue, and chocolate tones.",
        },
        {
          eyebrow: "Day 2",
          title: "Business Casual",
          description:
            "Modern business styling with refined silhouettes and harmonious details.",
        },
        {
          eyebrow: "Gala Dinner",
          title: "Evening Look",
          description:
            "An elegant evening outfit in sophisticated milk or chocolate tones.",
        },
      ],
      values: [
        {
          title: "Lightness",
          description: "Style and confidence",
        },
        {
          title: "Refinement",
          description: "Harmony in the details",
        },
        {
          title: "Modernity",
          description: "Inspiration and individuality",
        },
        {
          title: "Be Yourself",
          description: "Inspire. Create.",
        },
      ],
      footer:
        "We look forward to seeing you in the style of our forum!",
    },
    previousForum: {
      eyebrow: "Previous Event",
      title: "Beauty Business Forum 2025",
      award: "Top Beauty Master Award",
      date: "November 7–8, 2025",
      location: "San Francisco, California",
      videoLabel: "Forum Video",
      quote:"A look back at the atmosphere, professional community, and industry moments that shaped our previous forum.",
      videoTitle: "Beauty Business Forum 2025 video",
      playLabel: "Play",
      pauseLabel: "Pause",
      muteLabel: "Mute",
      unmuteLabel: "Unmute",
    },
    previousWinners: {
      eyebrow: "Previous Winners",
      title: "Winners who shaped the previous forum",
      prevLabel: "Previous winners",
      nextLabel: "Next winners",
      goToLabel: "Go to winner",
    },
    program: {
      eyebrow: "Program",
      title: "The full program is coming soon",
      description:
        "Speakers, masterclasses, the schedule, and more will be published here.",
    },
    speakers: {
      eyebrow: "Speakers",
      title: "Speakers to be announced",
      description: "The forum lineup will be revealed closer to the event.",
    },
    partners: {
      eyebrow: "Partners",
      title: "Our partners",
      description:
        "The brands and organizations supporting IBPA Beauty Awards 2026.",
      cta: "Become a partner",
      items: [
        { name: "Partner", text: "One sentence about the partner.", href: "#" },
        { name: "Partner", text: "One sentence about the partner.", href: "#" },
        { name: "Partner", text: "One sentence about the partner.", href: "#" },
        { name: "Partner", text: "One sentence about the partner.", href: "#" },
      ],
    },
    contactUs: {
      eyebrow: "Contact Us",
      title: "Let's create something exceptional together",
      description:
        "Whether you have questions about participation, partnerships, sponsorships, or IBPA membership, our team is here to help.",

      email: "forum-support@ibpassociations.org",
      note: "We usually reply within one business day.",

      nameLabel: "Full Name",
      namePlaceholder: "Enter your full name",

      emailLabel: "Email",
      emailPlaceholder: "Enter your email",

      subjectLabel: "Subject",
      subjectPlaceholder: "What would you like to discuss?",

      messageLabel: "Message",
      messagePlaceholder: "Tell us more about your request...",

      submitLabel: "Send Message",
      sendingLabel: "Sending…",

      privacyNote:
        "By submitting this form you agree to our privacy policy.",

      successMessage:
        "Thank you! Your message has been sent — we'll get back to you shortly.",
      errorMessage:
        "Something went wrong. Please try again or email us directly.",
      validationMessage:
        "Please fill in your name, a valid email, and a short message.",
    },
    copy: {
      whyEyebrow: "Why IBPA Beauty Award 2026",
      whyTitle: "Designed for professional beauty leadership",
      whyText: "Structured selection, transparent judging, and global brand-level presentation.",
      heroMediaTitle: "Luxury Editorial Presence",
      heroMediaDescription: "Professional beauty excellence staged with international credibility.",
      juryStandards: "Jury Standards",
      juryStandardsTitle: "Official judging with trust, structure, and transparency",
      juryBenefit1: "Professional standards & certification",
      juryBenefit2: "International collaboration network",
      juryBenefit3: "Access to global beauty community",
      juryBenefit4: "Industry recognition & visibility",
      eventExperience: "Event Experience",
      eventTitle: "Photography integrated into every stage.",
      eventText: "One dominant visual frame, supported by two contextual moments.",
      eventPrimaryCaption: "Premium ceremony credentials that set the visual tone from arrival.",
      eventAudienceCaption: "Live audience focus and jury attention throughout each stage.",
      eventDetailCaption: "Trophies and award details reinforce craft-level prestige.",
      eventStageCaption: "Stage energy and category highlights captured in real time.",
      eventAmbienceLabel: "Ceremony atmosphere",
      eventLiveLabel: "Live audience",
      fullBleedEyebrow: "IBPA 2026",
      fullBleedTitle: "Global beauty artistry deserves a world-class stage.",
      fullBleedText: "A calm, premium platform for artists, educators, salons, and brands.",
      intlRecognition: "International recognition",
      judgingIntegrity: "Structured judging integrity",
      whyFeatures: [
        { title: "International Recognition", text: "Your work is evaluated and recognized internationally — among beauty industry professionals worldwide." },
        { title: "Transparent Judging", text: "Each entry is evaluated by the official IBPA Beauty Award 2026 jury according to clear professional criteria — fairly and without bias." },
        { title: "Structured Selection", text: "11 categories and nominations within each — IBPA Beauty Award 2026 covers all key specializations in the beauty industry." },
        { title: "Professional Jury", text: "The IBPA Beauty Award 2026 jury includes practicing specialists with 5+ years of experience — experts who understand the industry from within." },
        { title: "Official Winner Status", text: "Winners and runners-up of IBPA Beauty Award 2026 receive certificates, supporting documents, and public recognition on the award platform." },
        { title: "Grand Prix for the Best", text: "Participants in 5 or more nominations automatically become nominees for the Grand Prix — the highest award of IBPA Beauty Award 2026." },
      ],
    },
    pricing: {
      award: {
        eyebrow: "Award Participants",
        title: "Participation Cost",
        ibpaMember: {
          label: "IBPA ASSOCIATION MEMBERS",
          rows: [
            { label: "1 nomination", value: "$50" },
            { label: "3 nominations", value: "$130" },
            { label: "5 nominations", value: "$200" },
          ],
          grandPrixLabel: "Grand Prix",
          grandPrixNote: "from 5 nominations — automatically",
        },
        nonMember: {
          label: "NON-IBPA MEMBERS",
          rows: [
            { label: "1 nomination", value: "$70" },
            { label: "3 nominations", value: "$190" },
            { label: "5 nominations", value: "$300" },
          ],
          grandPrixLabel: "Grand Prix",
          grandPrixNote: "from 5 nominations — automatically",
        },
      },
      jury: {
        eyebrow: "Judging Panel",
        title: "Judge Registration",
        standard: {
          label: "STANDARD FEE",
          value: "$250",
          text: "For specialists with at least 5 years of experience. The fee is payable only after candidacy approval.",
        },
        ibpaTrainer: {
          label: "IBPA ASSOCIATION MEMBERS — TRAINER AND ABOVE",
          value: "$100",
          text: "Special fee for IBPA association members at trainer level and above.",
          note: "Also payable after candidacy approval.",
        },
      },
    },
    categoriesPreview: {
      label: "Categories",
      title: "11 Categories of Excellence in the Beauty Industry",
      viewAll: "View all Categories",
      items: [
        "Hair Stylist",
        "Nail Technician",
        "Brow Artist",
        "Lash Artist",
        "Cosmetologist / Aesthetician",
        "Makeup Artist",
        "Permanent Makeup Artist",
        "Body & Wellness Specialist",
        "Beauty Educator / Trainer",
        "Salon / Studio",
        "Beauty Brand",
      ],
    },
    process: {
      label: "Award Process",
      title: "How the IBPA Award Process Works",
      steps: [
        {
          number: "01",
          title: "Select your category",
          text: "The award covers 11 professional categories—from artistry to branding. Choose the one that is closest to your field of activity.",
        },
        {
          number: "02",
          title: "Determine the category.",
          text: "Within each category, there are several nominations. Select the one that most accurately describes your specialization and what you do.",
        },
        {
          number: "03",
          title: "Confirm your IBPA status",
          text: "If you are an accredited IBPA specialist, enter your certificate ID to confirm and receive the IBPA member rate.",
        },
        {
          number: "04",
          title: "Fill out the application and upload your materials.",
          text: "Fill out the main form and attach materials corresponding to the selected category and nomination.",
        },
        {
          number: "05",
          title: "Submit your application and pay the fee.",
          text: "For IBPA members — from $50 per nomination; for non-members — from $70. Participating in 5+ nominations automatically includes you in the Grand Prix.",
        },
      ],
    },
    grandPrix: {
      label: "Grand Prix",
      title: "IBPA Grand Prix 2026",
      text1:
        "The highest award for outstanding performance, granted to participants with the best combined results across 5 or more nominations.",
      text2:
        "The Grand Prix recognizes overall performance across multiple nominations. A participant becomes a nominee by competing in 5 or more nominations, within one or across multiple categories.",
      cta: "Learn About Grand Prix",
    },
    juryCta: {
      label: "Jury",
      title: "Apply to Become an Official Judge of the IBPA 2026 Award",
      text1: "Candidates for the judging panel go through a professional selection process.",
      text2:
        "Submit your application as a judge — it will be reviewed by the IBPA expert panel. If approved, you will receive an invitation and a payment link for the registration fee: $250 for all specialists, or $100 for accredited IBPA specialists at trainer level and above.",
      text3:
        "After payment, judges receive official confirmation, certification documents, and a public profile on the judges page.",
      button: "Apply as a Judge",
    },
    faq: {
      label: "Questions",
      title: "Frequently asked questions",
      items: [
        {
          q: "How much does it cost to apply?",
          a: "Participant applications cost $50 per selected category.",
        },
        {
          q: "Who can participate?",
          a: "All active members of the IBPA association may apply to participate in the award.",
        },
        {
          q: "Can anyone apply to become a judge?",
          a: "Professionals may apply, and the $250 fee is charged only after approval.",
        },
        {
          q: "How does Grand Prix work?",
          a: "Qualification happens automatically when a participant competes in 5 or more nominations.",
        },
      ],
    },
    cta: {
      label: "Ready to participate?",
      title: "Your place is among the best",
      text: "Prepare your portfolio, select a category, and submit your entry for official evaluation by the IBPA jury. Recognition begins with a single step.",
      judge: "Become a Judge",
    },
    forum: {
      eyebrow: "IBPA BEAUTY AWARD 2026",
      title: "IBPA BEAUTY AWARD 2026",
      description: "An international gathering of beauty industry leaders uniting award recognition, professional education, business networking, and the Grand Gala Ceremony — all in one premier event.",
    },
    participation: {
      eyebrow: "Choose Your Participation",
      description: "Access the forum, connect with beauty professionals, and join the main IBPA business program.",
      tickets: {
        label: "FORUM TICKETS",
        mostPopular: "Most Popular",
        features: "1 Day Pass · 2 Day Pass · Gala Dinner",
        cta: "Buy Tickets",
      },
      award: {
        label: "AWARD PARTICIPATION",
        description: "Submit your work for international recognition.",
        cta: "Apply Now",
      },
      judge: {
        label: "JUDGE REGISTRATION",
        description: "Join the official judging panel.",
        cta: "Register as Judge",
      },
    },
    pricingSection: {
      eyebrow: "Pricing",
      title: "Transparent Pricing for Every Path",
      forumTickets: "Forum Tickets",
      awardParticipation: "Award Participation",
      judgeRegistration: "Judge Registration",
      standard: "Standard",
      ibpaMembers: "IBPA Members",
      nonMembers: "Non-Members",
      oneDayPass: "1 Day Pass",
      twoDayPass: "2 Day Pass",
      galaDinner: "Gala Dinner",
      oneNomination: "1 Nomination",
      threeNominations: "3 Nominations",
      fiveNominations: "5 Nominations",
      grandPrixNote: "5+ nominations automatically qualify for Grand Prix.",
      judgePaidAfterApproval: "Paid after approval",
      mostPopular: "Most Popular",
      startingFrom: "Starting from",
      from: "From",
      perPerson: "/ person",
      perNom: "/ nom.",
      fee: "Fee",
      perJudge: "/ judge",
    },
    grandPrixSpotlight: {
      eyebrow: "Grand Prix",
      title: "GRAND PRIX",
      description: "Participants submitting 5 or more nominations automatically compete for the Grand Prix award — the highest distinction at IBPA BEAUTY AWARD 2026.",
      cta: "Apply for Award",
      learnMore: "Learn More",
      stats: [
        { value: "5+", label: "Nominations" },
        { value: "Auto", label: "Qualification" },
      ],
    },
    whyAttend: {
      eyebrow: "Why Attend",
      items: [
        {
          title: "Business Networking",
          description: "Meet professionals, build partnerships and grow your business in an international setting.",
        },
        {
          title: "Educational Sessions",
          description: "Gain knowledge from industry experts and innovative leaders shaping the future of beauty.",
        },
        {
          title: "International Recognition",
          description: "Showcase your talent and receive global industry recognition at the highest level.",
        },
        {
          title: "Award Ceremony",
          description: "Celebrate excellence in an unforgettable evening with the beauty industry's finest.",
        },
      ],
    },
    finalCta: {
      eyebrow: "Join IBPA BEAUTY AWARD 2026",
      title: "Ready to Join IBPA BEAUTY AWARD 2026?",
      buyTicket: "Buy Forum Ticket",
      applyAward: "Apply for Award",
      registerJudge: "Register as Judge",
    },
  },
  categoriesPage: {
    hero: {
      eyebrow: "Award Categories",
      title: "11 Categories of Excellence in the Beauty Industry",
      description: "The beauty industry is not merely a single profession, but an entire ecosystem of craftsmanship. We have established 11 categories to ensure that every specialization receives a fair, professional evaluation. Artistry, education, skincare, and brand management—each discipline is assessed by a dedicated jury based on clear-cut criteria. Choose your category and submit your application.",
      entryRules: "Entry Rules",
      feeLabel: "Registration Fee",
      feeValue: "$50 per category",
      eligibilityLabel: "Participation",
      eligibilityValue: "For IBPA Beauty Award 2026 Members",
      cta: "Apply In A Category",
    },
    participation: {
      eyebrow: "How to participate",

      title: "An international award created for professionals shaping the future of the beauty industry.",

      description:
        "Transparent judging, structured evaluation, and international recognition designed for professionals, educators, clinics, academies, salons, and beauty businesses.",

      steps: [
        {
          number: "01",
          title: "Complete your application",
        },
        {
          number: "02",
          title: "Choose your category",
        },
        {
          number: "03",
          title: "Select your nomination",
        },
        {
          number: "04",
          title:
            "Provide your personal information, upload photos/videos, and describe your achievements",
        },
        {
          number: "05",
          title: "Complete the payment",
        },
        {
          number: "06",
          title: "Submit before August 10, 2026",
        },
      ],

      doneTitle: "Done!",

      doneDescription:
        "Your application will be evaluated by our international panel of judges.",
    },
    whyJoin: {
      eyebrow: "Why join",
      title: "Why it is worth joining IBPA Beauty Awards",
      benefits: [
        "International recognition of your professional achievements.",
        "Evaluation by an international panel of experts.",
        "Increased client trust and stronger personal brand.",
        "Opportunity to receive the winner or finalist status at IBPA Beauty Awards 2026.",
        "Publication and promotion of the best participants in the professional community.",
        "No need to attend in person — participation takes place online.",
      ],
      grandPrixEyebrow: "Grand Prix rule",
      grandPrixTitle: "5+ nominations — and you are in the Grand Prix",
      grandPrixDescription:
        "Submit applications in 5 or more nominations and automatically become a Grand Prix nominee of IBPA Beauty Awards. No additional application is required.",
      grandPrixBadge: "Chance to win the Grand Prix trophy",
    },
    cardText: "Professional submissions are reviewed within the official IBPA Beauty Award 2026 framework.",
    directions: [
      {
        slug: "hair",
        title: "Hair",
        nominations: [
          "Award of Excellence in Hair Color Technique",
          "Barbering Excellence Award",
          "Hair Restoration Mastery Award",
          "Award for Outstanding Achievements in Hair Extensions"
        ],
      },
      {
        slug: "nail",
        title: "Nail",
        nominations: [
          "Award of Excellence in Manicure",
          "Award of Excellence in Nail Extension",
          "Award of Excellence in Podology",
        ],
      },
      {
        slug: "brow",
        title: "Brow",
        nominations: [
          "Award of Excellence in Brow Lamination",
          "Award of Excellence in Brow Styling & Design",
        ],
      },
      {
        slug: "lash",
        title: "Lash",
        nominations: [
          "Award of Excellence in Classic Lash Extension",
          "Award of Excellence in Volume Lash Extension",
          "Award of Excellence in Creative Lash Extension Design",
          "Award of Excellence in Lash Lift",
        ],
      },
      {
        slug: "skin-cosmetology-facial",
        title: "Skin Care, Cosmetology & Facial",
        nominations: [
          "Award of Excellence in Non-Invasive Rejuvenation",
          "Award of Excellence in Anti-Aging Facial Treatment",
          "Award of Excellence in Acne Treatment",
        ],
      },
      {
        slug: "makeup-artistry",
        title: "Makeup Artistry",
        nominations: [
          "Award of Excellence in Bridal Makeup Artistry",
          "Award of Excellence in Creative Makeup Artistry",
          "Award of Excellence in Mature Makeup Artistry",
          "Award of Excellence in Daytime Makeup Artistry",
        ],
      },
      {
        slug: "permanent-makeup",
        title: "Permanent Makeup",
        nominations: [
          "Award of Excellence in PMU Brows",
          "Award of Excellence in Eyeliner Precision",
          "Award of Excellence in Lips PMU",
          "Award of Excellence in Camouflage & Correction",
        ],
      },
      {
        slug: "body-wellness-nutrition",
        title: "Body, Wellness & Nutrition",
        nominations: [
          "Award of Excellence in Body Transformation",
          "Award of Excellence in Sculpting Massage",
          "Award of Excellence in Nutrition & Diet Correction",
          "Award of Excellence in Anti-Cellulite Treatment",
        ],
      },
      {
        slug: "education",
        title: "Education",
        nominations: [
          "Award of Excellence in Professional Beauty Training",
          "Award of Excellence in Online Beauty Education",
        ],
      },
      {
        slug: "salon",
        title: "Salon",
        nominations: [
          "Award of Excellence in Beauty Salon Innovation",
          "Award for Outstanding Achievement in Beauty Business Development",
        ],
      },
      {
        slug: "brand",
        title: "Brand",
        nominations: [
          "Award of Excellence in Professional Beauty Product Development",
          "Award of Excellence in Beauty Brand Development",
          "Innovation in Beauty Award",
        ],
      },
    ],
    copy: {
        nominationSingular: "nomination",
        nominationPlural: "nominations",
        heroMediaTitle: "Category depth meets real event energy",
        association: "Association",
        associationTitle: "IBPA — an international community of beauty industry professionals",
        associationText: "IBPA brings together strong and ambitious beauty professionals from around the world. Our mission is to support the growth of professional standards and cultivate a culture of responsibility, ethics, and excellence within the industry.",
        associationQuote: "The association works with artists, educators, salon owners, and brands — those who strive to uphold quality, integrity, and professionalism.",
        associationButton: "Visit IBPA Association",
        ctaEyebrow: "Category Entry",
        ctaTitle: "Ready to showcase your professional mastery?",
        ctaText: "Choose your nomination and become part of IBPA Beauty Awards 2026 — an international award created to recognize the outstanding achievements of professionals, educators, business owners, and brands in the beauty industry.",
        ctaButton: "Registration",
    },
    awardResults: {
      eyebrow: "Award results",
      title: "Award results",
      timeline: {
        applicationsOpen: {
          label: "Applications open",
          date: "Jul 2",
          sub: "2026",
        },
        registrationCloses: {
          label: "Registration closes",
          date: "10 Aug",
          sub: "2026",
        },
        awardCeremony: {
          label: "Award ceremony",
          date: "Sep 26",
          sub: "Beauty Business Forum",
        },
      },
      jury: {
        title: "International jury",
        note: "The jury panel is made up of international trainers and leading industry experts.",
        points: [
          "International experts",
          "Independent evaluation",
          "Professional scoring",
        ],
      },
      pricing: {
        eyebrow: "Participation fees",
        headers: {
          nominations: "Nominations",
          members: "IBPA members",
          nonMembers: "Non-members",
        },
        oneNomination: {
          label: "1 nomination",
          member: "$50",
          nonMember: "$70",
        },
        threeNominations: {
          label: "3 nominations",
          member: "$130",
          nonMember: "$190",
        },
        fiveNominations: {
          label: "5 nominations",
          member: "$200",
          nonMember: "$300",
        },
        grandPrixEligibility: "Grand Prix eligibility",
        nonRefundable:
          "The registration fee is non-refundable after the application has been submitted.",
      },
    },
    faq: {
      eyebrow: "FAQ",
      title: "Frequently asked questions",
      items: [
        {
          question: "Who can take part in IBPA Beauty Awards 2026?",
          answer:
            "Professionals, educators, business owners, academies, studios, salons, and brands of the beauty industry are invited to participate.",
        },
        {
          question: "Do I have to live in the USA to participate?",
          answer:
            "No. Candidates from any country in the world can take part in the award.",
        },
        {
          question: "How does participation work?",
          answer:
            "Participants submit an application and competition materials through an online form. Entries are evaluated by an international panel of judges.",
        },
        {
          question: "Do I need to attend the award ceremony?",
          answer:
            "No. Participation and the evaluation of entries take place independently of attendance at the ceremony.",
        },
        {
          question: "How many entries can I submit?",
          answer:
            "A participant may submit several entries and take part in several categories.",
        },
        {
          question: "Can one entry be submitted in several categories?",
          answer:
            "Yes, provided the entry meets the requirements of the selected categories.",
        },
        {
          question: "When does the application period close?",
          answer:
            "Applications are open from June 1 to July 8, 2026, inclusive.",
        },
        {
          question: "When will the results be announced?",
          answer:
            "The results will be announced during IBPA Beauty Awards 2026 and published on the official resources of the award.",
        },
        {
          question: "What do winners and finalists receive?",
          answer:
            "Winners and finalists receive official awards, certificates, and publications within the framework of the award.",
        },
        {
          question: "Can I apply if I have less than 5 years of experience?",
          answer:
            "Yes, provided the chosen category has no minimum work-experience requirement.",
        },
        {
          question: "Is the registration fee refundable?",
          answer:
            "No. The registration fee is non-refundable after the application has been submitted.",
        },
      ],
    },
  },
  juryPage: {
    hero: {
      eyebrow: "IBPA Beauty Award 2026",
      title: "Apply to Become an Official Judge of the IBPA 2026 Award",
      description:
        "Candidates for the judging panel go through a professional selection process. First, an application is submitted and reviewed by the expert panel. If approved, the candidate receives an invitation and a payment link for the $250 registration fee.",
      requirements: "View Requirements",
      overview: "Jury Overview",
      experience: "Experience",
      experienceValue: "5+ Years",
      review: "Review",
      reviewValue: "Up to 14 Business Days",
      fee: "Fee",
      feeValue: "$250",
      feeNote: "Charged only after approval",
    },
    about: {
      eyebrow: "About the Award",
      title: "IBPA Beauty Awards 2026",
      description:
        "IBPA Beauty Awards 2026 is an international award in the beauty industry, created to recognize the professionalism, talent, and outstanding achievements of specialists, educators, business owners, and brands.",
      recognition:
        "The award celebrates strong professional results, expertise, creativity, and contribution to the beauty industry.",
      objectiveEvaluation:
        "The jury panel plays a key role in providing objective, honest, and professional evaluation of competition entries.",
      trust:
        "Through expert judging, the jury helps build trust in the award and strengthens its international credibility.",
    },
    timeline: {
      eyebrow: "Judging period",
      title: "Important dates",
      formatLabel: "Judging format",
      formatValue: "Online",
      yearLabel: "Year",
      year: "2026",
      items: [
        {
          label: "Applications to the jury panel",
          title: "Jury Submissions",
          date: "June 1 – July 8",
        },
        {
          label: "Evaluation of competition entries",
          title: "Judging",
          date: "August 16 – September 5",
        },
        {
          label: "Final and announcement of results",
          title: "Results",
          date: "September 26",
        },
      ],
    },
    gallery: {
      eyebrow: "Forum moments",
      title: "Highlights from the IBPA community",
      description:
        "A visual look at the atmosphere, guests, professionals, and moments that make the IBPA Beauty Business Forum special.",
      prevLabel: "Previous photo",
      nextLabel: "Next photo",
      goToLabel: "Go to photo",
      photoAlt: "IBPA Forum photo",
    },
    requirements: {
      label: "Who can become a judge",
      title: "Candidate requirements",
      description:
        "The jury panel is formed from experienced professionals who can provide fair, objective, and expert evaluation of competition entries.",
      items: [
        {
          label: "Experience",
          text: "At least 5 years of experience in the beauty industry.",
        },
        {
          label: "Expertise",
          text: "Confirmed professional expertise in your category.",
        },
        {
          label: "Documents",
          text: "Certificates, diplomas, licenses, or other supporting documents.",
        },
        {
          label: "Professional activity",
          text: "Teaching, competition, or expert activity is welcomed.",
        },
        {
          label: "Judging background",
          text: "Previous judging experience is preferred, but not required.",
        },
        {
          label: "Standards",
          text: "Readiness to follow the regulations, confidentiality, and principles of objective evaluation.",
        },
      ],
    },
    responsibilities: {
      eyebrow: "A judge's role in the award",
      title: "What the responsibilities of a judge include",
      items: [
        "Evaluating competition entries in accordance with the award's approved criteria.",
        "Reviewing work only within your own professional category.",
        "Awarding objective and independent scores based on experience and expertise.",
        "Maintaining the confidentiality of competition materials, participants, and results.",
        "Working within the set deadlines through the online judging format.",
        "Confirming final scores and contributing to fair award results.",
      ],
    },
    feeCard: {
      eyebrow: "Registration fee",
      title: "Cost of joining the jury panel",
      standardLabel: "Standard",
      standardPrice: "$250",
      membersLabel: "IBPA Members",
      membersPrice: "$100",
      note: "The registration fee is charged only after approval and is non-refundable.",
    },
    process: {
      label: "Process",
      title: "How the jury application works",
      steps: [
        {
          number: "01",
          title: "Submit Application",
          text: "Complete the jury application form and upload all required materials.",
        },
        {
          number: "02",
          title: "IBPA Beauty Award 2026 Review",
          text: "Your professional background, experience, and documents are reviewed.",
        },
        {
          number: "03",
          title: "Receive Decision",
          text: "Approved candidates receive an official email with the next steps.",
        },
        {
          number: "04",
          title: "Complete Payment",
          text: "Only approved candidates are invited to pay the $250 jury fee.",
        },
        {
          number: "05",
          title: "Join the Panel",
          text: "After payment confirmation, you become an official jury panel member.",
        },
      ],
    },
    faq: {
      label: "Frequently asked questions",
      title: "FAQ",
      items: [
        {
          question: "Is judging conducted online?",
          answer:
            "Yes, all competition entries are evaluated remotely through the judge’s personal dashboard.",
        },
        {
          question: "When will I know the result of my jury application review?",
          answer:
            "After the professional experience and documents are reviewed, the candidate receives a notification with the commission’s decision.",
        },
        {
          question: "Do I need to attend the award ceremony?",
          answer:
            "No, attendance at the award ceremony is not required.",
        },
        {
          question: "Is there financial compensation?",
          answer:
            "No, participation in the jury panel is voluntary.",
        },
        {
          question: "When will I receive access to the entries?",
          answer:
            "Access is provided after the application period closes and the final list of competition entries is approved.",
        },
        {
          question: "Can I be a judge if I do not live in the United States?",
          answer:
            "Yes, the jury panel may include specialists from different countries.",
        },
        {
          question: "Is previous judging experience required?",
          answer:
            "Judging experience is welcomed, but it is not required. If the candidate does not have judging experience, they should have significant professional achievements, teaching, competition, or expert experience confirming a high level of qualification and understanding of professional evaluation.",
        },
        {
          question: "How much time does the evaluation process take?",
          answer:
            "The number of entries depends on the category. The process is organized so that judging can be completed comfortably within the established deadlines.",
        },
      ],
    },
    cta: {
      label: "Jury",
      title: "Apply to Become an Official Judge of the IBPA 2026 Award",
      text: "Candidates for the judging panel go through a professional selection process. After approval, judges receive official confirmation, supporting documents, and a public profile on the jury page.",
      button: "Apply as a Judge",
    },
    apply: {
      eyebrow: "Jury Application",
      title: "Apply to Become a Judge of the IBPA 2026 Award",
      text: "Submit your professional profile, experience, and areas of expertise to be considered for the judging panel.",
    },
    copy: {
      heroEyebrow: "IBPA Beauty Award 2026 Jury Council",
      heroTitle: "Become an Official Judge of IBPA Beauty Award 2026",
      heroText: "A premium judging council built for fairness, expertise, and global credibility.",
      leadershipTitle: "Leadership, trust, and independent standards",
      credibility: "Credibility",
      credibilityText: "Every judge must demonstrate proven professional experience and category-level expertise.",
      processLabel: "Selection process",
      processTitle: "Three steps to judge status",
      processText: "Clear progression from submission to official panel activation.",
      apply: "Application Submission",
      approved: "Review and Approval",
      registration: "Payment and Confirmation",
      applyText: "Submit your professional profile, work experience, and required materials for review by the IBPA Beauty Award 2026 panel.",
      approvedText: "IBPA Beauty Award 2026 evaluates your expertise and professional fit. Upon approval, you receive an official invitation.",
      registrationText: "Approved candidates pay the registration fee and receive official judge status, a certificate, and a public profile on the award website.",
      benefitsEyebrow: "Judge Benefits",
      benefitsTitle: "Why experts join the IBPA Beauty Award 2026 judging council",
      benefitsText: "A serious professional role with visible impact and international recognition.",
      b1Title: "Official recognition",
      b1Text: "Be listed as a verified IBPA Beauty Award 2026 jury member and represent industry standards.",
      b2Title: "Trusted framework",
      b2Text: "Evaluate submissions through a transparent and structured judging process.",
      b3Title: "Professional network",
      b3Text: "Join an international community of beauty leaders and educators.",
      b4Title: "Profile credibility",
      b4Text: "Strengthen your professional authority through an official award role.",
      statementEyebrow: "Credibility Statement",
      statementTitle: "Every score should reflect both artistry and professional integrity",
      statementText: "IBPA Beauty Award 2026 judges are selected for expertise, neutrality, and commitment to fair evaluation.",
      statementText2: "Each member of the jury acts independently and evaluates works exclusively on the basis of approved award criteria.",
      statementQuote: "Judging is not only about outcomes. It is about trust in the process.",
      approvedEyebrow: "Approved Jury",
      approvedTitle: "Current IBPA Beauty Award 2026 Jury Members",
      approvedSectionText: "A live roster of approved judges participating in the award.",
      ctaEyebrow: "Jury Council",
      ctaTitle: "Bring your expertise to the IBPA Beauty Award 2026 stage",
      ctaText: "Apply to become an official judge and contribute to fair, professional nomination decisions.",
      ctaAside: "Approval is required before registration payment.",
    },
    benefits: {
      eyebrow: "Official judge privileges",
      title: "Privileges of an official IBPA Beauty Awards 2026 judge",
      description:
        "After participation is confirmed, judges receive an official package of documents, publications, and professional privileges confirming their status as part of the international jury panel of IBPA Beauty Awards 2026.",
      items: [
        "Official invitation to join the jury panel of IBPA Beauty Awards 2026.",
        "Regulations and methodological materials for the judging process.",
        "Access to the personal judge dashboard for evaluating competition entries.",
        "Official judging score sheet for evaluating participants.",
        "Personal certificate of an official IBPA Beauty Awards 2026 judge.",
        "Letter of appreciation for participation in the international jury panel.",
        "Personal judge banner for publication on social media and in a professional portfolio.",
        "Public placement of the judge profile on the official award website.",
        "Publication as part of the international jury panel of IBPA Beauty Awards 2026.",
        "Mention in the final article and publications dedicated to the award and its results.",
      ],
    },
    juryCta: {
      eyebrow: "Jury registration",
      title: "Join the international IBPA judging panel.",
      description: "Apply as a jury member to evaluate excellence in beauty, support professional standards, and contribute to a respected global award platform.",
      registrationFee: "Registration fee",
      registrationNote:
        "The registration fee is payable only after the candidate has been approved and is non-refundable.",
    },
  },
  grandPrixPage: {
    hero: {
      eyebrow: "Grand Prix",
      title: "IBPA Grand Prix 2026",
      description:
        "The highest award for outstanding performance, granted to participants with the best combined results across 5 or more nominations.",
      body:
        "The Grand Prix recognizes overall performance across multiple nominations. A participant becomes a nominee by competing in 5 or more nominations, within one or across multiple categories.",
      snapshot: "Selection Snapshot",
      eligibility: "Eligibility",
      eligibilityValue: "Minimum 5 nominations",
      evaluation: "Evaluation",
      evaluationValue: "Total combined score",
      decision: "Decision",
      decisionValue: "Full judging panel",
      cta: "Review Categories",
      learnMore: "Learn More",
    },
    pillars: [
      {
        title: "How to Become a Grand Prix Nominee",
        text: "A participant automatically becomes a Grand Prix nominee by competing in at least 5 nominations. Nominations can be within one category or across multiple categories.",
      },
      {
        title: "Example",
        text: "3 nominations in Brows + 2 nominations in Lashes qualifies a participant for Grand Prix consideration.",
      },
      {
        title: "How the Grand Prix Winner is Determined",
        text: "Each category is judged separately. All scores are combined into a total result, and the participant with the highest total score among all nominees wins.",
      },
    ],
    criteria: {
      label: "Important",
      title: "5 nominations for qualification",
      text: "Grand Prix qualification is based on participation in at least 5 nominations. Those nominations may be inside one category or spread across several categories.",
      listLabel: "Core Criteria",
      items: [
        "Eligibility: minimum 5 nominations",
        "Evaluation: total combined score across all nominations",
        "Decision: full judging panel",
      ],
    },
    flow: {
      label: "Selection Flow",
      title: "More nominations, more chances.",
      steps: [
        {
          number: "01",
          title: "5+ Nominations — You're in the Grand Prix!",
          text: "The broader your presence in the awards, the higher your chances. With five or more nominations, you automatically become a nominee for the IBPA Grand Prix.",
        },
        {
          number: "02",
          title: "The jury evaluates each category.",
          text: "Your work receives a professional evaluation from the IBPA Beauty Award 2026 jury—fairly and based on uniform criteria.",
        },
        {
          number: "03",
          title: "Grand Prix Winner",
          text: "The Grand Prix is ​​awarded to the participant with the highest cumulative score across all categories. The best result is a well-deserved victory.",
        },
      ],
    },
    faq: {
      label: "Questions",
      title: "Grand Prix FAQ",
      items: [
        {
          question: "Do I need to apply for the Grand Prix separately?",
          answer:
            "No. Entry is activated automatically once you submit applications in 5 or more nominations.",
        },
        {
          question: "Is there an additional fee for the Grand Prix?",
          answer: "No. There is no separate registration fee.",
        },
        {
          question: "Can I take part in the Grand Prix with only one entry?",
          answer:
            "No. To take part you must submit applications in at least 5 nominations.",
        },
        {
          question: "How many Grand Prix winners are chosen each year?",
          answer: "One Grand Prix holder within the award.",
        },
      ],
    },
    copy: {
      apply: "Apply to Compete",
      reviewCategories: "Review Categories",
      mediaTitle: "Compete Across Categories",
      mediaDescription: "Nomination begins when your footprint expands across categories.",
      rule: "Grand Prix Rule",
      selectionTitle: "Nomination, judging, and final award decision",
      timelineEyebrow: "Timeline Highlights",
      timelineTitle: "Designed for clarity at each award stage",
      timelineDescription: "Visual emphasis across nomination, review, and award presentation.",
      appWindow: "Application window",
      appWindowText: "Submit your nominations from July 2 to August 10, 2026.",
      scorePeriod: "Panel scoring period",
      scorePeriodText: "Judges evaluate entries from August 16 to September 5, 2026.",
      reveal: "Grand reveal",
      revealText: "Winners are announced at the IBPA Beauty Awards 2026 ceremony on September 26, 2026.",
      breakEyebrow: "Grand Prix Atmosphere",
      breakTitle: "A final stage built for standout multi-category performance",
      breakText: "A premium award environment where cumulative excellence is visibly recognized.",
      ctaEyebrow: "Grand Prix Entry",
      ctaTitle: "Build your path to the highest distinction",
      ctaText: "Enter multiple categories, elevate your profile, and compete for IBPA Beauty Award 2026's top honor.",
      startEntry: "Start Entry",
      viewCategories: "View Categories",
      strategy: "Multi-categories strategy matters.",
      fiveCategories: "5+ Nominations — and you're in the Grand Prix",
      qualificationRule: "Submit entries in 5 or more categories, and you automatically become a nominee for the IBPA Grand Prix—no additional applications required.",
      decision: "Award Decision",
    },
    about: {
      whatEyebrow: "About the Grand Prix",
      whatTitle: "What is the Grand Prix",
      whatText:
        "The Grand Prix is the main award of IBPA Beauty Awards 2026, granted to the participant with the highest combined score among the contenders.",
      whoEyebrow: "Who qualifies",
      whoTitle: "Who becomes a Grand Prix contender",
      whoHighlight: "5+ nominations = automatic entry",
      whoText:
        "Participants who submit work in five or more nominations automatically become candidates for the Grand Prix.",
      whoNote: "No additional registration is required.",
    },
    whySpecial: {
      eyebrow: "Why it matters",
      title: "Why the Grand Prix is considered a special award",
      lead: "The Grand Prix evaluates not a single piece of work, but the overall professional level of a specialist.",
      cards: [
        { title: "Mastery", text: "Strong results across several categories at once." },
        { title: "Consistency", text: "Confirmation of quality across different disciplines." },
        { title: "Versatility", text: "Broad professional expertise." },
        { title: "Recognition", text: "The highest level of award within the program." },
      ],
    },
    decision: {
      eyebrow: "Selection",
      title: "How the winner is determined",
      steps: [
        {
          number: "01",
          title: "Automatic selection",
          text: "Five or more nominations automatically add a participant to the list of Grand Prix contenders.",
        },
        {
          number: "02",
          title: "Independent evaluation",
          text: "Each entry is evaluated by an international panel of judges against unified criteria.",
        },
        {
          number: "03",
          title: "Score tallying",
          text: "Points are summed across all of the participant's nominations.",
        },
        {
          number: "04",
          title: "Determining the winner",
          text: "The Grand Prix goes to the participant with the highest total result.",
        },
      ],
    },
    rewards: {
      eyebrow: "Rewards",
      title: "What the Grand Prix winner receives",
      items: [
        "The main Grand Prix trophy",
        "A special winner's diploma",
        "International recognition",
        "Publication on IBPA resources",
        "Coverage of the win on the award's social media",
        "Grand Prix holder status at IBPA Beauty Awards 2026",
      ],
    },
    participationCta: {
      eyebrow: "Award participation",
      title: "Ready to declare your professional level?",
      description: "Submit your work in the selected nominations and earn the chance to become a contender for the Grand Prix of IBPA Beauty Awards 2026.",
      nominationFees: "Nomination fees",
      members: "Members",
      perNomSubmission: "Per nomination submission",
      nominationsActivate: "Nominations activate eligibility",
    },
  },
  associationPage: {
    hero: {
      eyebrow: "IBPA Association",
      title: "International Beauty Professionals Association",
      subtitle: "International association of beauty industry professionals",
      description:
        "The International Beauty Professionals Association (IBPA) unites specialists, educators, business owners, academies, studios, salons, and beauty brands from around the world.",
      applyButton: "Apply for Membership",
      websiteButton: "Visit IBPA Website",
    },
    whoCanJoin: {
      eyebrow: "Who can join?",
      title: "IBPA welcomes:",
      items: [
        "Beauty industry specialists",
        "Educators and trainers",
        "Owners of studios, salons, and academies",
        "Beauty brands and companies",
        "Emerging specialists and students in beauty-related fields",
      ],
    },
    advantages: {
      eyebrow: "Membership benefits",
      title: "More trust, connections, and professional growth.",
      description:
        "IBPA membership helps strengthen your personal brand, expand professional opportunities, and become part of an international beauty community.",
      items: [
        "Educational webinars and professional resources",
        "Discounts on association events, awards, and projects",
        "Access to a private professional community",
        "Opportunities for publications, speaking, and promotion",
        "Participation in international forums, awards, and business events",
        "Profile in the association directory",
        "IBPA membership certificate",
        "Partner programs, special offers, and many other privileges",
      ],
    },
    process: {
      eyebrow: "How does membership work?",
      title: "A clear and simple membership process.",
      stepLabel: "Step",
      steps: [
        {
          title: "Choose a category",
          text: "Select the membership category that best fits your professional path.",
        },
        {
          title: "Submit an application",
          text: "Complete and send your membership application through the online form.",
        },
        {
          title: "Wait for review",
          text: "The IBPA team will review your application and confirm the next steps.",
        },
        {
          title: "Complete registration",
          text: "After approval, complete the payment, finalize registration, and get access to the benefits of your selected category.",
        },
      ],
    },
    cta: {
      eyebrow: "Learn more",
      title: "Ready to join the international beauty community?",
      description:
        "Detailed information about membership categories, pricing, benefits, and conditions is available on the official IBPA website.",
      applyButton: "Apply for Membership",
      websiteButton: "Visit IBPA Website",
    },
  },
  applyPage: {
    intro: {
      eyebrow: "Candidate Application",
      title: "Submit your award entry.",
      text: "Complete the form below with your professional details and category materials.",
    },
    form: {
      blockA: "Block A",
      blockATitle: "Professional Profile & Eligibility",
      blockADescription:
        "Complete the shared award application section before moving into the category-specific evaluation materials.",
      blockB: "Block B",
      blockBTitle: "Category-Specific Nomination Materials",
      blockBDescription: "Block B changes based on the category you select.",
      progress: "Application Progress",
      requiredComplete: "required items complete",
      submit: "Submit Award Application",
      submitting: "Submitting Application...",
      validationError:
        "Please review the highlighted fields before submitting your award entry.",
      submitError: "We could not submit the application. Please try again.",
      submitException:
        "Something went wrong during submission. Please try again in a moment.",
      redirecting: "Redirecting to secure Stripe Checkout.",
    },
    introCards: {
      eligibility: "Eligibility & Important Notes",
      feeHtml: "Participation fee: <strong>$50 per category</strong>.",
      separate: "Each category is submitted as a separate application.",
      juryNote: "Jury fee rules do not apply to this participant application page.",
      before: "Before You Start",
      items: [
        "Prepare your license or certification file.",
        "Choose one category and one specific nomination.",
        "Gather all portfolio and supporting files for Block B.",
        "Review your portfolio files before uploading.",
      ],
    },
  },
  admin: {
    common: {
      logout: "Log Out",
      review: "Review",
      open: "Open",
      total: "Total",
      submitted: "Submitted",
      approved: "Approved",
      paymentPending: "Payment Pending",
      underReview: "Under Review",
      rejected: "Rejected",
      applicant: "Applicant",
      candidate: "Candidate",
      category: "Category",
      award: "Nomination",
      status: "Status",
      payment: "Payment",
      created: "Created",
      date: "Date",
      title: "Title",
      expertise: "Expertise",
      application: "Application",
    },
    login: {
      eyebrow: "Admin Access",
      title: "Review participant and jury applications in one private workspace.",
      text:
        "Sign in to access the same premium site language, tuned for internal review, file inspection, and decision tracking across both application flows.",
      cards: ["Private review access", "Fast application scanning", "Status management"],
      signIn: "Sign In",
      loginTitle: "Admin login",
      loginText: "Enter the admin password to access the application dashboards.",
      password: "Admin password",
      placeholder: "Enter password",
      opening: "Opening Admin...",
      open: "Open Admin",
    },
    participants: {
      eyebrow: "Participant Admin",
      title: "Award participant applications",
      text:
        "Review applicant profiles, category entries, supporting files, and current review status in one private workspace.",
      juryDashboard: "Jurys",
      scoringDashboard: "Scorings",
      appStatus: "App Status",
      empty: "No participant applications matched this filter.",
    },
    jury: {
      eyebrow: "Jury Admin",
      title: "Jury applications dashboard",
      text:
        "Review submitted applications, send payment links after approval, and track final activation in one place.",
      participantDashboard: "Participants",
      scoringDashboard: "Scorings",
      paidJurors: "Paid Jurors",
      empty: "No jury applications have been submitted yet.",
    },
  },
  juryDashboard: {
    dashboard: "Jury Dashboard",
    accessText: "Review access is limited to the categories you were approved to judge.",
    approvedCategories: "Approved Categories",
    assigned: "Assigned Applications",
    scored: "Scored",
    remaining: "Remaining",
    allCategories: "All Categories",
    applicant: "Applicant",
    category: "Category",
    award: "Nomination",
    status: "Status",
    submitted: "Submitted",
    open: "Open",
    reviewScore: "Review & Score",
    continueDraft: "Continue Draft",
    viewSubmitted: "View Submitted",
    empty: "No participant applications matched your category access.",
    signOut: "Log Out",
  },
  auth: {
    shellCards: [
      "Private member access",
      "Luxury IBPA Beauty Award 2026 styling",
      "Protected award pages",
    ],
    access: "Access",
    accessText:
      "Sign in to access the IBPA Beauty Award 2026 site. New visitors can register with email and password, then continue directly to the main site.",
    loginLink: "Login",
    registerLink: "Register",
    statement: "Every score should reflect both artistry and professional integrity.",
    trustBadge: "Official Jury Portal · IBPA Beauty Award 2026",
    forgotPage: {
      eyebrow: "Password Recovery",
      title: "Restore your jury workspace access",
      description: "Enter your registered email address and we will send you a secure link to set a new password.",
      cardEyebrow: "Reset Link",
      cardTitle: "Enter your email address",
      cardText: "If an account is registered with this email, you will receive password reset instructions shortly.",
    },
    resetPage: {
      eyebrow: "New Password",
      title: "Set a new password for your jury account",
      description: "Create a strong new password to restore access to your IBPA Beauty Award 2026 jury workspace.",
      cardTitle: "Create a new password",
      cardText: "Enter and confirm your new password below.",
    },
    loginPage: {
      eyebrow: "Jury Login",
      title: "Access the IBPA Beauty Award 2026 jury member experience",
      description:
        "Sign in with your email and password to continue to the jury dashboard. Protected pages will send unauthenticated visitors here first.",
      cardEyebrow: "Jury Login",
      cardTitle: "Welcome back",
      cardText: "Enter your credentials to continue to the IBPA Beauty Award 2026 jury workspace.",
    },
    registerPage: {
      eyebrow: "Jury Register",
      title: "Create your private IBPA Beauty Award 2026 jury access",
      description:
        "Create an email and password to enter the site. Registration signs you in immediately and redirects you to the main homepage.",
      cardEyebrow: "Jury Register",
      cardTitle: "Create your account",
      cardText: "Use your email address and create a password to begin.",
    },
    form: {
      email: "Email",
      emailPlaceholder: "Enter your email",
      password: "Password",
      passwordPlaceholder: "Enter your password",
      passwordRegisterPlaceholder: "At least 8 characters",
      confirmPassword: "Confirm Password",
      confirmPasswordPlaceholder: "Repeat your password",
      openingSite: "Opening Site...",
      creatingAccount: "Creating Account...",
      login: "Login",
      register: "Register",
      noAccount: "Don't have an account?",
      haveAccount: "Already have an account?",
      backToLogin: "Back to login",
      noRegisteredAccount: "No account is registered with this email.",
      invalidCredentials: "Invalid email or password. Please try again.",
      forgotPassword: "Forgot your password?",
      sendResetLink: "Send Reset Link",
      sendingLink: "Sending...",
      resetPassword: "Set New Password",
      resettingPassword: "Updating Password...",
      newPassword: "New Password",
      newPasswordPlaceholder: "At least 8 characters",
      confirmNewPassword: "Confirm New Password",
      confirmNewPasswordPlaceholder: "Repeat your new password",
      checkYourEmail: "Check your email",
      checkYourEmailText: "If this email is registered, you will receive a password reset link shortly.",
      invalidResetToken: "This password reset link is invalid or has already been used.",
      expiredResetToken: "This password reset link has expired. Please request a new one.",
      passwordResetSuccess: "Your password has been updated. You can now sign in.",
    },
  },
  statuses: {
    DRAFT: "Draft",
    PAYMENT_PENDING: "Payment Pending",
    SUBMITTED: "Submitted",
    UNDER_REVIEW: "Under Review",
    ADDITIONAL_INFO_REQUIRED: "Info Required",
    APPROVED: "Approved",
    REJECTED: "Rejected",
    PAID: "Paid",
    PENDING: "Pending",
    FAILED: "Failed",
    EXPIRED: "Expired",
    REFUNDED: "Refunded",
    NOT_STARTED: "Not Started",
    REOPENED: "Reopened",
    IN_PROGRESS: "In Progress",
    COMPLETE: "Complete",
  },
  filters: {
    search: "Search by name, email or IBPA number",
    allStatuses: "All statuses",
    allCategories: "All categories",
    allPayments: "All payments",
    sortLabel: "Sort",
    sortNewest: "Newest first",
    sortOldest: "Oldest first",
    sortName: "Name A–Z",
    toggle: "Filters",
    clearAll: "Clear all",
  },
  ticketFlow: {
    alreadyPurchased: "You have already purchased a ticket using this email address.",
    success: {
      eyebrow: "IBPA BEAUTY AWARD 2026",
      title: "Payment Confirmed",
      subtitle: "Your ticket for the IBPA BEAUTY AWARD 2026 is confirmed.",
      emailed:
        "We've emailed your QR code ticket to the address you provided. Please show it at the forum check-in desk.",
      backHome: "Back to Home",
      refundNotice:
        "Please note! If you have purchased a ticket to the Beauty Business Forum but your plans change and you are unable to attend, please notify us no later than one month before the event begins. In that case, we will be able to issue a refund in accordance with the event's refund policy.",
    },
  },
  notFound: {
    title: "Page not found",
    description: "The page you are looking for does not exist or is no longer available.",
    backHome: "Return to homepage",
    back: "Go back",
  },
};

const ru: typeof en = {
  account: {
    nav: {
      brand: "Аккаунт участника",
      overview: "Обзор",
      overviewShort: "Обзор",
      nominations: "Мои номинации",
      nominationsShort: "Номинации",
      tickets: "Билеты",
      ticketsShort: "Билеты",
      profile: "Профиль",
      profileShort: "Профиль",
      settings: "Настройки аккаунта",
      settingsShort: "Настройки",
      signOut: "Выйти",
      expandSidebar: "Развернуть меню",
      collapseSidebar: "Свернуть меню",
      openMenu: "Открыть меню участника",
      drawerTitle: "Аккаунт участника",
      navAria: "Навигация участника",
      drawerAria: "Мобильная навигация участника",
    },
    statuses: {
      DRAFT: "Черновик",
      PAYMENT_PENDING: "Ожидает оплаты",
      PURCHASED: "Куплено",
      SUBMITTED: "Отправлено",
      UNDER_REVIEW: "На рассмотрении",
      RETURNED_FOR_CHANGES: "Возвращено на правки",
      LOCKED: "Закрыто",
      SCORED: "Оценено",
      WITHDRAWN: "Отозвано",
      APPROVED: "Одобрено",
      REJECTED: "Отклонено",
      PAID: "Оплачен",
      PENDING: "Ожидает оплаты",
      FAILED: "Ошибка оплаты",
      EXPIRED: "Истёк",
      REFUNDED: "Возврат",
      CANCELED: "Отменён",
    } as Record<string, string>,
    common: {
      back: "Назад",
      edit: "Редактировать",
      save: "Сохранить",
      loading: "Загрузка",
      notProvided: "Не указано",
      required: "обязательно",
      optional: "необязательно",
    },
    badges: {
      paid: "Оплачено",
      paymentPending: "Ожидает оплаты",
      locked: "Закрыто",
      completion: "Заполнено",
    },
    editor: {
      backToNominations: "К номинациям",
      subtitle: "Заполните заявку на номинацию",
      lockedDescription:
        "Заявка финализирована и доступна только для просмотра. Свяжитесь с нами, если что-то выглядит неверно.",
      submittedDescription:
        "Отправлено жюри. Вы можете дорабатывать ответы и файлы, пока приём заявок открыт.",
      draftDescription:
        "Заполните обязательные поля и загрузки, сохраняйте прогресс в любой момент, затем отправьте жюри.",
      sectionNavLabel: "Разделы заявки",
      sections: {
        details: "О работе",
        detailsDescription: "Ключевые факты о вас и вашей профессиональной работе.",
        description: "Описание",
        descriptionDescription: "Расскажите жюри о своей работе своими словами.",
        uploads: "Файлы",
        uploadsDescription: "Портфолио, документы и дополнительные файлы для жюри.",
        review: "Проверка",
        reviewDescription: "Проверьте каждый раздел и отправьте номинацию жюри.",
      },
      requiredBefore: "Нужно заполнить перед отправкой",
      missingHint: "Нажмите на пункт, чтобы перейти к разделу.",
      moreMissing: "ещё",
      allComplete: "Все обязательные поля и файлы заполнены.",
      submitWhenReady: "Отправьте, когда будете готовы.",
      completion: "Заполнено",
      lastSaved: "Сохранено",
      justNow: "только что",
      filesAttached: "Файлов прикреплено",
      finalScore: "Итоговый балл",
      scoresPending: "Оценки ещё не опубликованы.",
      saveDraft: "Сохранить черновик",
      submit: "Отправить жюри",
      updateSubmission: "Обновить заявку",
      uploadingFiles: "Загружаем файлы…",
      saving: "Сохраняем…",
      submitting: "Отправляем…",
      draftSaved: "Черновик сохранён.",
      submittedNotice: "Номинация отправлена жюри.",
      saveError: "Не удалось сохранить номинацию.",
      lockedNotice: "Номинация финализирована, редактирование недоступно.",
      paymentPendingNotice: "Редактирование откроется после подтверждения оплаты.",
      submittedHint: "Отправленные номинации можно редактировать, пока приём заявок открыт.",
      reviewReadiness: "Готовность к отправке",
      readyToSubmit: "Номинация готова к отправке.",
      missingBeforeSubmit: "Заполните недостающие пункты перед отправкой.",
      emptySection: "В этом разделе нет полей для вашей номинации.",
      editSection: "Изменить",
      notFilled: "Пока не заполнено",
      noFilesUploaded: "Файлы ещё не загружены",
      wordsLabel: "слов",
      select: "Выберите",
    },
    addFlow: {
      label: "Аккаунт участника",
      title: "Добавить номинации",
      description:
        "Выберите категорию и номинации, проверьте сумму и переходите к безопасной оплате.",
      steps: {
        category: "Категория",
        nominations: "Номинации",
        review: "Проверка",
        payment: "Оплата",
      },
      selectedCategory: "Выбранная категория",
      changeCategory: "Сменить категорию",
      available: "доступно",
      nominationLabel: "номинация",
      nominationsLabel: "номинаций",
      allOwned: "Все номинации здесь уже куплены.",
      chooseNominations: "Выбрать номинации",
      viewNominations: "Посмотреть номинации",
      selectedBadge: "выбрано",
      alreadyPurchased: "Уже куплено",
      allOwnedCategory:
        "В этой категории все номинации уже куплены. Выберите другую категорию, чтобы продолжить.",
      noneSelected: "Номинации пока не выбраны.",
      totalLabel: "итого",
      reviewSelection: "Проверить выбор",
      emptySelection: "Выбор пуст. Вернитесь на предыдущие шаги и выберите номинации.",
      removeAward: "Убрать",
      orderSummary: "Сумма заказа",
      nominationsRow: "Номинации",
      rateRow: "Тариф",
      memberRate: "Член IBPA",
      standardRate: "Стандартный",
      packageRow: "Пакет",
      totalDue: "К оплате сегодня",
      memberApplied: "Применён тариф подтверждённого участника",
      continuePayment: "Перейти к оплате",
      creatingCheckout: "Создаём оплату…",
      stripeNote: "Вы будете перенаправлены на безопасную оплату Stripe.",
      checkoutError: "Не удалось создать оплату. Попробуйте ещё раз.",
      redirectTitle: "Переходим к безопасной оплате",
      redirectText: "Секунду — готовим вашу сессию Stripe Checkout.",
      noCategoriesTitle: "Категории недоступны",
      noCategoriesText: "Категории номинаций ещё не опубликованы. Загляните позже.",
      backToDashboard: "К обзору",
      backToNominations: "К номинациям",
    },
    settings: {
      label: "Аккаунт участника",
      title: "Настройки аккаунта",
      description:
        "Данные для входа и сведения об аккаунте. Номинации и профиль — на отдельных страницах.",
      account: "Аккаунт",
      email: "Email",
      role: "Роль",
      applicant: "Участник",
      memberSince: "Зарегистрирован",
      language: "Язык",
      languageText:
        "Выберите язык аккаунта участника. Выбор сохранится для будущих визитов.",
      languageAria: "Язык аккаунта",
      password: "Пароль",
      passwordText: "Для смены пароля мы отправим защищённую ссылку на ваш email.",
      sendResetLink: "Отправить ссылку",
      otherTitle: "Нужно изменить что-то ещё?",
      otherText:
        "Смену email и удаление аккаунта выполняет наша команда, чтобы номинации и билеты остались корректно привязаны.",
      contactSupport: "Написать в поддержку",
    },
    overview: {
      eyebrow: "Кабинет участника",
      closedTitle: "Приём заявок закрыт",
      openTitle: "Заполните купленные номинации",
      overallProgress: "Общий прогресс",
      allSubmitted: "Все номинации отправлены",
      remainingLabel: "Осталось номинаций:",
      closesPrefix: "Приём заявок до",
      closedPrefix: "Приём заявок закрыт",
      daysRemaining: "Осталось дней",
      daysWord: "дн.",
      untilClose: "до закрытия приёма заявок",
      myNominations: "Мои номинации",
      viewAll: "Смотреть все",
      emptyTitle: "Номинаций пока нет",
      emptyText: "Оплаченные номинации появятся здесь после подтверждения оплаты.",
      addNominations: "Добавить номинации",
    },
    stats: {
      purchased: "Куплено",
      purchasedDetail: "Оплаченные номинации в аккаунте",
      drafts: "Черновики",
      draftsDetail: "Сохранённый прогресс, жюри не видит",
      submitted: "Отправлено",
      submittedDetail: "Видно жюри",
      completion: "Заполнено",
      completionDetail: "В среднем по номинациям",
    },
    widgets: {
      quickActions: "Быстрые действия",
      continueLatest: "Продолжить последнюю номинацию",
      addNominations: "Добавить номинации",
      openTickets: "Открыть билеты",
      editProfile: "Открыть профиль",
      reminder: "Важное напоминание",
      close: "Приём заявок закрывается",
      closed: "Приём заявок закрыт",
      closedText: "Отправленные номинации доступны только для чтения на время оценивания.",
      daysRemainingLabel: "Осталось дней:",
      supportTitle: "Спасибо, что вы часть сообщества IBPA.",
      supportText: "Нам не терпится увидеть вашу работу. Если что-то непонятно — команда с радостью поможет.",
      contactSupport: "Написать в поддержку",
    },
    card: {
      progress: "Прогресс",
      updated: "Обновлено",
      view: "Открыть",
      start: "Начать",
      continue: "Продолжить",
      allComplete: "Все обязательные поля заполнены",
      missingLabel: "Не хватает обязательных полей:",
    },
    nominationsPage: {
      title: "Мои номинации",
      purchasedWord: "куплено",
      draftWord: "в черновиках",
      submittedWord: "отправлено",
      visibilityNote: "Купленные номинации и черновики не видны жюри до отправки.",
    },
    profile: {
      title: "Профиль",
      description:
        "Эти данные прикрепляются к каждой отправленной номинации. Чтобы исправить их, напишите в поддержку.",
      verifiedMember: "Подтверждённый участник",
      phone: "Телефон",
      professionalTitle: "Профессиональный статус",
      yearsExperience: "Стаж работы",
      country: "Страна",
      stateProvince: "Штат / регион",
      city: "Город",
      membership: "Членство IBPA",
      membershipNumber: "Номер участника",
      membershipLevel: "Уровень членства",
      verified: "Подтверждено",
      notVerified: "Не подтверждено",
      publicLinks: "Публичные ссылки",
      website: "Сайт",
      socialProfile: "Соцсети",
      reviews: "Отзывы",
      linksNote: "Ссылки могут быть показаны жюри вместе с вашими номинациями.",
      notSet: "Не указано",
    },
    tickets: {
      title: "Билеты",
      description:
        "Ваш доступ на форум и гала-ужин. Билеты, купленные на этот email, появляются здесь автоматически после оплаты.",
      emptyTitle: "Билеты не найдены",
      emptyText: "Билеты, купленные на этот email, появятся здесь после оплаты.",
      browseTickets: "Купить билеты",
      access: "Доступ",
      purchased: "Куплен",
      galaIncluded: "Гала-ужин включён",
      forumAccess: "Доступ на форум",
      qrPending: "QR-код ещё не активен. Он появится здесь после выпуска вашего пропуска.",
      entryInstructions: "Как пройти на событие",
      stepQrTitle: "Покажите QR-код",
      stepQrText: "Ваш личный QR-код сканируется один раз на входе в день события.",
      stepBrightTitle: "Сделайте экран ярче",
      stepBrightText: "Откройте QR-код на весь экран и увеличьте яркость, чтобы сканирование прошло мгновенно.",
      stepMailTitle: "Возьмите подтверждение",
      stepMailText: "Билет привязан к email, указанному при покупке. Копия отправлена вам на почту.",
    },
  },
  common: {
    applyNow: "Подать заявку",
    applyAsParticipant: "Подать заявку участника",
    applyAsJury: "Подать заявку судьи",
    browseCategories: "Смотреть категории",
    juryAccount: "Кабинет судьи",
    jury: "Жюри",
    categories: "Категории",
    grandPrix: "Гран-при",
    home: "Главная",
    from: "от",
  },
  header: {
    navigation: {
      home: "Главная",
      categories: "Категории",
      jury: "Жюри",
      grandPrix: "Гран-при",
    },
    openMenu: "Открыть меню",
    closeMenu: "Закрыть меню",
    language: "Язык",
  },
  home: {
    hero: {
      eyebrow: "Отраслевая конференция лидеров",
      title: "IBPA Beauty Award 2026",
      subtitle: "Beauty Business Forum + IBPA Beauty Award 2026",
      date: "25–26 сентября 2026",
      location: "950 South Broadway, Los Angeles, CA 90015",
      buyTickets: "Купить билеты на форум",
      description: "Признание выдающихся достижений в сфере красоты, обучения в бьюти-индустрии, здоровья и инноваций в брендинге",
      categoriesCta: "Изучить категории",
      ticker: [
        "IBPA Beauty Award 2026",
        "Международное признание",
        "Профессиональное мастерство",
        "11 категорий",
        "Международное жюри",
        "Открыто для всего мира",
      ],
    },
    awardsInfo: {
      eyebrow: "О премии",
      title: "IBPA Beauty Awards 2026",
      text: "IBPA Beauty Awards 2026 — международная премия в сфере красоты, образования и бьюти-бизнеса, проводимая в рамках IBPA Beauty Business Forum. Наша миссия — признавать выдающихся специалистов, поддерживать профессиональное развитие и объединять лидеров индустрии для обмена опытом, инновациями и новыми возможностями роста.",
    },
    threeExperiences: {
      eyebrow: "Одно событие",
      title: "Три мощных направления",

      forum: {
        title: "Beauty Business Forum",
        subtitle: "Знания. Связи. Рост.",
        bullets: [
          "Выступления успешных предпринимателей и экспертов индустрии красоты.",
          "Практические стратегии развития и масштабирования бизнеса.",
          "Нетворкинг с владельцами салонов, брендами и лидерами рынка.",
          "Пространство для новых партнерств, идей и возможностей."
        ],
        footer:
          "Для специалистов, преподавателей, владельцев бизнеса и брендов, которые стремятся к профессиональному развитию, сильному окружению и новым возможностям роста."
      },

      awards: {
        title: "IBPA Beauty Awards 2026",
        subtitle: "Признание. Статус. Возможности.",
        bullets: [
          "Международная премия для лучших специалистов индустрии красоты.",
          "Независимая оценка работ международной коллегией экспертов.",
          "Возможность укрепить профессиональную репутацию и личный бренд.",
          "Награды, подтверждающие высокий уровень мастерства и профессионализма."
        ],
        footer:
          "Для специалистов, преподавателей, владельцев бизнеса и брендов, которые стремятся получить признание своих достижений и укрепить позиции на рынке."
      },

      exhibition: {
        title: "Выставка брендов",
        subtitle: "Инновации. Партнерство. Развитие.",
        bullets: [
          "Новинки продукции и технологий индустрии красоты.",
          "Общение с представителями ведущих брендов.",
          "Тестирование продукции и профессиональные консультации.",
          "Специальные предложения и новые деловые контакты."
        ],
        footer:
          "Для специалистов и владельцев бизнеса, которые хотят быть в курсе трендов и находить новые возможности для роста."
      }
    },
    registrationSection: {
      eyebrow: "Участие",
      title: "Всё необходимое для участия",

      registration: {
        title: "Период регистрации",
        date: "1 июня – 8 июля 2026",
        description:
          "Приём заявок осуществляется с 1 июня по 8 июля 2026 года включительно."
      },

      tabs: {
        tickets: "Форум",
        awards: "Премия",
        jury: "Жюри"
      },

      tickets: {
        title: "Beauty Business Forum",
        price: "$395",
        suffix: "от / день",
        description:
          "Развитие бизнеса, нетворкинг, образование и новые возможности.",
        cta: "Купить билет",

        items: [
          ["1 день форума", "$395"],
          ["2 дня форума", "$695"],
          ["Гала-ужин", "$150"]
        ]
      },

      cta: "Подать заявку",

      registrationInfo: {
        eyebrow: "Период регистрации",
        value: "2 июля – 10 августа 2026",
        text: "Приём заявок на участие осуществляется с 1 июня по 8 июля 2026 года включительно.",
      },

      feeInfo: {
        eyebrow: "Регистрационный взнос",
        value: "$50+",
        text: "Стоимость участия оплачивается отдельно за каждую выбранную номинацию.",
      },

      juryInfo: {
        eyebrow: "Регистрация судьи",
        value: "$100+",
        text: "Подать заявку в судейскую коллегию могут специалисты с опытом работы от 5 лет. Регистрационный взнос оплачивается только после одобрения кандидатуры.",
      },

      participationInfo: {
        eyebrow: "Участие",
        value: "Открыто для всех",
        text: "Подать заявку на участие могут специалисты всех уровней без ограничений по стране и стажу.",
      },

      grandPrixInfo: {
        eyebrow: "Гран-при",
        value: "5+",
        text: "Участники, подавшие заявки в 5 и более номинациях, автоматически участвуют в категории Гран-при.",
      },

      pricing: {
        eyebrow: "Стоимость",
        title: "Стоимость участия",
        description:
          "Билеты на форум, номинации премии и регистрация судей оплачиваются отдельно. Стоимость форума и премии отличается для участников IBPA и гостей.",

        option: "Опция",
        members: "IBPA Участники",
        standard: "Гости",
        nonMembers: "Без участия",
        memberPricingNote: "Специальные цены для участников IBPA.",
        awardPricingNote: "Сэкономьте больше с пакетами для подачи нескольких заявок.",
        memberDiscountNote: "Участники IBPA могут зарегистрироваться по льготной цене.",
        mostPopular: "Популярное",

        forum: {
          eyebrow: "Билеты",
          title: "Билеты на форум",
          oneDay: "1 день форума",
          twoDays: "2 дня форума",
          galaDinner: "Гала-ужин",
        },

        award: {
          eyebrow: "Премия",
          title: "Номинации премии",
          oneNomination: "1 номинация",
          threeNominations: "3 номинации",
          fiveNominations: "5 номинаций",
          note: "Участие в Гран-при активируется автоматически для участников с 5 и более номинациями.",
        },

        jury: {
          eyebrow: "Жюри",
          title: "Регистрация судьи",
          member: "Участник IBPA",
          standard: "Гости",
        },

        ctaEyebrow: "Готовы участвовать",
        ctaTitle: "Начните заявку IBPA 2026",
        ctaText:
          "Выберите подходящий формат участия и подайте заявку онлайн.",
      },

      awards: {
        title: "IBPA Beauty Awards",
        price: "$50",
        suffix: "за номинацию",
        description:
          "Признание, профессиональный статус и новые возможности.",
        cta: "Подать заявку",

        member: "Участник IBPA",
        standard: "Не участник",

        rows: [
          ["1 номинация", "$50", "$70"],
          ["3 номинации", "$130", "$190"],
          ["5 номинаций", "$200", "$300"]
        ],

        grandPrixTitle: "Гран-при",
        grandPrixDescription:
          "Автоматическое участие при подаче 5 и более номинаций."
      },

      jury: {
        title: "Регистрация судьи",
        price: "$100+",
        description:
          "Для специалистов с опытом работы от 5 лет.",
        cta: "Подать заявку",

        points: [
          "Минимум 5 лет профессионального опыта",
          "Международное сообщество судей",
          "Статус эксперта индустрии"
        ],

        note:
          "Регистрационный взнос оплачивается только после одобрения кандидатуры."
      },

      openParticipation: {
        title: "Открыто для всех",
        description:
          "Подать заявку могут специалисты любого уровня из любой страны."
      }
    },
    speakersSection: {
      eyebrow: "Спикеры форума",
      title: "Учитесь у лидеров индустрии",
      description:
        "Успешные предприниматели и эксперты beauty-индустрии поделятся практическим опытом, рабочими инструментами и стратегиями развития бизнеса.",

      readMore: "Подробнее",
      showLess: "Свернуть",
      topicLabel: "Тема",
      presentationLabel: "Презентация",

      speakers: [
        {
          name: "Ярославна Атапина",
          photo: "/images/speakers/yara-atapina.jpeg",
          role:
            "Владелец двух салонов ногтевого сервиса в Кремниевой долине (США) и практикующий nail-специалист с опытом более 10 лет. За последние три года построила эффективную бизнес-систему с четкими процессами, высоким уровнем сервиса и командой из 30 сотрудников.",
          city: "Сан-Хосе, Калифорния, США",
          topic:
            "Система вместо хаоса: основы масштабирования beauty-бизнеса",
          description:
            "На выступлении вы узнаете, как с первых шагов строить beauty-бизнес не в хаосе, а на системе, которая позволяет стабильно расти и масштабироваться. Тема будет полезна как мастерам, планирующим открыть салон и собрать команду, так и владельцам студий, которые хотят выстроить сильные процессы, высокий уровень сервиса и эффективное управление командой. Я поделюсь инструментами и решениями, которые ежедневно работают внутри моего бизнеса.",
          instagram: "https://www.instagram.com/yara.yaroslavna?igsh=NTc4MTIwNjQ2YQ==",
          website: ""
        },
        {
          name: "Натали Ваулин",
          photo: "/images/speakers/natalie-vaulin.jpg",
          role:
            "Основатель и CEO компании Vaulabs — американского контрактного производства косметики, специализирующегося на продуктах Clean Beauty. Более 15 лет работает в сфере маркетинга, брендинга и развития бизнеса, помогая предпринимателям создавать собственные beauty-бренды.",
          city: "Тампа, Флорида, США",
          topic:
            "Как создать собственный beauty-бренд в США: от идеи до полки магазина",
          description:
            "На выступлении Натали представит пошаговую систему создания собственного beauty-продукта — от проверки идеи и разработки формулы до выбора упаковки, производства и подготовки к выходу на рынок. Участники узнают, как избежать распространённых ошибок, принимать правильные решения на каждом этапе и создавать продукты, готовые к масштабированию. Доклад основан на реальных кейсах запуска beauty-продуктов в США.",
          instagram: "https://www.instagram.com/natalievaulin",
          website: "https://www.vaulabs.com"
        },
        {
          name: "Гульнара Чекоева",
          photo: "/images/speakers/gulnara-chekoeva.jpg",
          role:
            "Мастер международного класса, художник-модельер по прическам, международный судья и тренер чемпионатов. Чемпионка Азии 2025 года, победитель премии One Shot Hair Awards (USA), основатель международной онлайн-академии парикмахерского искусства.",
          city: "США",
          topic:
            "Путь мастера мирового уровня: образование, чемпионаты и построение международной карьеры",
          description:
            "Гульнара поделится своим опытом развития международной карьеры в индустрии красоты, расскажет, как создать сильный личный бренд, выйти на мировой уровень и обучать профессионалов по всему миру. Она раскроет принципы создания успешных образовательных программ, подготовки преподавателей нового поколения и организации международных чемпионатов, основанные на опыте обучения более 100 000 мастеров и проведения авторских программ более чем в 20 странах.",
          instagram: "https://www.instagram.com/gulnarachekoeva?igsh=NTc4MTIwNjQ2YQ==",
          website: ""
        },
        {
          name: "Eleonora Bediukh",
          photo: "/images/speakers/eleonora-bediukh.jpg",
          role:
            "Мастер-бровист и лами-мейкер, преподаватель по коррекции, окрашиванию и ламинированию бровей. Автор книги Brows Top Start, международный судья, организатор чемпионата TB Champions, соучредитель TE’ORA Beauty Corp и beauty-инфлюэнсер.",
          city: "Сакраменто, Калифорния, США",
          topic:
            "Контент, который продаёт: система продвижения бьюти-мастера в соцсетях без хаоса и выгорания",
          description:
            "Выступление предназначено для бровистов, лешмейкеров, нейл-мастеров, визажистов, косметологов, владельцев салонов, тренеров и начинающих специалистов. Элеонора расскажет, как выстроить понятную контент-стратегию, привлекать клиентов через социальные сети без постоянного выгорания, создавать контент, который действительно продаёт, и развивать личный бренд. Основано на личном опыте роста аудитории с 1 700 до 30 000 подписчиков всего за 6 месяцев.",
          instagram: "https://www.instagram.com/elionora.brows?igsh=NTc4MTIwNjQ2YQ==",
          website: ""
        },
        {
          name: "Юлия Малина",
          photo: "/images/speakers/yulia-malina.png",
          role:
            "AI-стратег, предприниматель и создатель образовательного проекта «ИИнсайдеры». Разрабатывает AI-агентов и интеллектуальные системы для создания контента, маркетинга и автоматизации бизнес-процессов, помогая предпринимателям перейти от разрозненного использования нейросетей к системной работе с командой специализированных AI-помощников.",
          city: "Майами, Флорида, США",
          topic:
            "Beauty-бизнес нового поколения: как AI-команда помогает создавать, продавать и расти",
          description:
            "Сегодня искусственный интеллект — это уже не один чат и не набор отдельных инструментов, а команда специализированных AI-помощников для разных задач бизнеса. Юлия покажет, как AI-команда помогает исследовать рынок, создавать новые услуги, продукты и контент, усиливать маркетинг и коммуникацию с клиентами, анализировать данные и систематизировать бизнес-процессы. Практические кейсы будут полезны мастерам, салонам, студиям, преподавателям, предпринимателям и beauty-брендам. Участники также узнают, какие задачи важно оставить человеку, чтобы сохранить экспертность, индивидуальность и доверие клиентов.",
          instagram: "https://www.instagram.com/yulia.malina.usa/",
          website: "https://ainsiders.club"
        },
        {
          name: "Ханна Вакулич",
          photo: "/images/speakers/hanna-vakulych.jpg",
          role:
            "Основатель компании Magica Beauty LLC (США), международный преподаватель и эксперт beauty-индустрии с опытом более 25 лет. Много лет являлась региональным тренером L'Oréal и Vitality's, международным судьёй чемпионатов и автором собственных образовательных методик.",
          city: "США",
          topic:
            "Кто ваш клиент? Психология продаж на простых примерах",
          description:
            "Ханна представит авторскую методику определения типа клиента, основанную на известных мультипликационных персонажах. Вы получите простой и понятный инструмент, который поможет с первых минут понимать клиента, легко работать с возражениями, выстраивать доверительное общение и уверенно увеличивать продажи. Методика легко применяется в ежедневной работе мастеров, преподавателей и владельцев beauty-бизнеса.",
          instagram: "https://www.instagram.com/anna.vakulych.miami?igsh=NTc4MTIwNjQ2YQ==",
          website: ""
        },
        {
          name: "Юлия Байло",
          photo: "/images/speakers/yulia-bailo.jpg",
          role:
            "Сертифицированный бизнес-наставник, нейрокоуч, предприниматель с более чем 15-летним опытом ведения бизнеса в США и международный спикер.",
          city: "США",
          topic:
            "Перед масштабом: как выявить узкие места и найти точки роста в бьюти-бизнесе",
          description:
            "На выступлении участники разберутся, с чего начинается устойчивый рост бизнеса, как правильно определить свои цели и увидеть ограничения, которые мешают развитию и увеличению прибыли. Юлия покажет основные узкие места, с которыми чаще всего сталкиваются владельцы бьюти-бизнеса, и объяснит, на какие точки роста важно обратить внимание прежде, чем вкладываться в масштабирование. После выступления участники смогут провести первичную диагностику своего бизнеса, определить, что именно сдерживает рост, и понять, какие действия необходимо предпринять в первую очередь для более системного, устойчивого и прибыльного развития.",
          instagram: "https://www.instagram.com/yuliabailo_coach?igsh=NTc4MTIwNjQ2YQ==",
          website: ""
        },
      ]
    },
    dressCode: {
      eyebrow: "Beauty Business Forum",
      title: "Дресс-код",
      description:
        "Стиль, который подчёркивает ваш профессионализм и создаёт вдохновляющую атмосферу.",
      image: {
        src: "/images/forum/dress-code.jpg",
        alt: "Примеры дресс-кода Beauty Business Forum",
      },
      colors: [
        {
          label: "Белый",
          value: "#FFFFFF",
        },
        {
          label: "Молочный",
          value: "#E9DCCF",
        },
        {
          label: "Голубой",
          value: "#B8CDE5",
        },
        {
          label: "Шоколадный",
          value: "#442817",
        },
      ],
      days: [
        {
          eyebrow: "День 1",
          title: "Business Casual",
          description:
            "Элегантный и комфортный деловой образ в белых, молочных, голубых и шоколадных оттенках.",
        },
        {
          eyebrow: "День 2",
          title: "Business Casual",
          description:
            "Современный деловой стиль с утончёнными силуэтами и гармоничными деталями.",
        },
        {
          eyebrow: "Гала-ужин",
          title: "Вечерний образ",
          description:
            "Элегантный вечерний образ в изысканных молочных или шоколадных оттенках.",
        },
      ],
      values: [
        {
          title: "Лёгкость",
          description: "Стиль и уверенность",
        },
        {
          title: "Утончённость",
          description: "Гармония в деталях",
        },
        {
          title: "Современность",
          description: "Вдохновение и индивидуальность",
        },
        {
          title: "Будьте собой",
          description: "Вдохновляйте. Создавайте.",
        },
      ],
      footer:
        "Будем рады видеть вас в стиле нашего форума!",
    },
    previousForum: {
      eyebrow: "Предыдущий ивент",
      title: "Beauty Business Forum 2025",
      award: "Премия Top Beauty Master",
      date: "7–8 ноября 2025",
      location: "Сан-Франциско, Калифорния",
      videoLabel: "Видео форума",
      quote:"Вспоминаем атмосферу, профессиональное сообщество и ключевые моменты индустрии, которые стали частью предыдущего форума.",
      videoTitle: "Видео Beauty Business Forum 2025",
      playLabel: "Воспроизвести",
      pauseLabel: "Пауза",
      muteLabel: "Выключить звук",
      unmuteLabel: "Включить звук",
    },
    previousWinners: {
      eyebrow: "Победители прошлого форума",
      title: "Победители, ставшие частью Beauty Business Forum 2025",
      prevLabel: "Предыдущие победители",
      nextLabel: "Следующие победители",
      goToLabel: "Перейти к победителю",
    },
    program: {
      eyebrow: "Программа",
      title: "Полная программа скоро появится",
      description:
        "Здесь будут опубликованы спикеры, мастер-классы, расписание и многое другое.",
    },
    speakers: {
      eyebrow: "Спикеры",
      title: "Спикеры будут объявлены",
      description: "Состав форума будет раскрыт ближе к событию.",
    },
    partners: {
      eyebrow: "Партнёры",
      title: "Наши партнёры",
      description:
        "Бренды и организации, поддерживающие IBPA Beauty Awards 2026.",
      cta: "Стать партнёром",
      items: [
        { name: "Партнёр", text: "Одно предложение о партнёре.", href: "#" },
        { name: "Партнёр", text: "Одно предложение о партнёре.", href: "#" },
        { name: "Партнёр", text: "Одно предложение о партнёре.", href: "#" },
        { name: "Партнёр", text: "Одно предложение о партнёре.", href: "#" },
      ],
    },
    contactUs: {
      eyebrow: "Свяжитесь с нами",
      title: "Давайте создадим что-то исключительное вместе",
      description:
        "Если у вас есть вопросы об участии, партнерстве, спонсорстве или участии в IBPA — наша команда всегда готова помочь.",

      email: "forum-support@ibpassociations.org",
      note: "Обычно мы отвечаем в течение одного рабочего дня.",

      nameLabel: "Полное имя",
      namePlaceholder: "Введите ваше полное имя",

      emailLabel: "Email",
      emailPlaceholder: "Введите ваш email",

      subjectLabel: "Тема",
      subjectPlaceholder: "О чем вы хотите поговорить?",

      messageLabel: "Сообщение",
      messagePlaceholder: "Расскажите подробнее о вашем запросе...",

      submitLabel: "Отправить сообщение",
      sendingLabel: "Отправляем…",

      privacyNote:
        "Отправляя форму, вы соглашаетесь с нашей политикой конфиденциальности.",

      successMessage:
        "Спасибо! Ваше сообщение отправлено — мы скоро свяжемся с вами.",
      errorMessage:
        "Что-то пошло не так. Попробуйте ещё раз или напишите нам напрямую.",
      validationMessage:
        "Пожалуйста, укажите имя, корректный email и короткое сообщение.",
    },
    copy: {
      whyEyebrow: "Почему IBPA Beauty Award 2026",
      whyTitle: "Премия, созданная для профессионального лидерства в индустрии красоты",
      whyText: "Структурированный отбор, прозрачная оценка и мировая презентация на уровне брендов.",
      heroMediaTitle: "Роскошное редакционное присутствие",
      heroMediaDescription: "Профессиональное признание красоты на международной сцене.",
      juryStandards: "Стандарты жюри",
      juryStandardsTitle: "Официальная оценка с доверием, структурой и прозрачностью",
      juryBenefit1: "Профессиональные стандарты и сертификация",
      juryBenefit2: "Сеть международного сотрудничества",
      juryBenefit3: "Доступ к мировому бьюти-сообществу",
      juryBenefit4: "Признание в индустрии и видимость",
      eventExperience: "Опыт участия",
      eventTitle: "Фотография интегрирована в каждую стадию.",
      eventText: "Один доминирующий визуальный кадр, поддерживаемый двумя контекстными моментами.",
      eventPrimaryCaption: "Премиальные аккредитации церемонии, которые устанавливают визуальный тон с момента прибытия.",
      eventAudienceCaption: "Внимание живой аудитории и жюри на протяжении всех этапов.",
      eventDetailCaption: "Трофеи и детали награды подчеркивают престиж мастерства.",
      eventStageCaption: "Энергия и направление сцены, запечатленные в реальном времени.",
      eventAmbienceLabel: "Атмосфера церемонии",
      eventLiveLabel: "Живая аудитория",
      fullBleedEyebrow: "IBPA 2026",
      fullBleedTitle: "Глобальное искусство красоты заслуживает мирового класса.",
      fullBleedText: "Спокойная, премиальная платформа для артистов, преподавателей, салонов и брендов.",
      intlRecognition: "Международное признание",
      judgingIntegrity: "Структурированная оценка",
      whyFeatures: [
        { title: "Международное признание", text: "Ваша работа получает оценку и признание на международном уровне — среди профессионалов индустрии красоты по всему миру." },
        { title: "Прозрачная оценка", text: "Каждая заявка оценивается официальным жюри IBPA Beauty Award 2026 по чётким профессиональным критериям — честно и без предвзятости." },
        { title: "Структурированный отбор", text: "11 категорий и номинации внутри каждой — IBPA Beauty Award 2026 охватывает все ключевые специализации индустрии красоты." },
        { title: "Профессиональное жюри", text: "В состав жюри IBPA Beauty Award 2026 входят практикующие специалисты с опытом от 5 лет — эксперты, которые понимают индустрию изнутри." },
        { title: "Официальный статус победителя", text: "Победители и призёры IBPA Beauty Award 2026 получают сертификаты, подтверждающие документы и публичное признание на платформе премии." },
        { title: "Гран-при для лучших", text: "Участники 5 и более номинаций автоматически становятся номинантами на Гран-при — высшую награду IBPA Beauty Award 2026." },
      ],
    },
    pricing: {
      award: {
        eyebrow: "Участники премии",
        title: "Стоимость участия",
        ibpaMember: {
          label: "УЧАСТНИКИ АССОЦИАЦИИ IBPA",
          rows: [
            { label: "1 номинация", value: "$50" },
            { label: "3 номинации", value: "$130" },
            { label: "5 номинаций", value: "$200" },
          ],
          grandPrixLabel: "Гран-при",
          grandPrixNote: "от 5 номинаций — автоматически",
        },
        nonMember: {
          label: "УЧАСТНИКИ БЕЗ АССОЦИАЦИИ IBPA",
          rows: [
            { label: "1 номинация", value: "$70" },
            { label: "3 номинации", value: "$190" },
            { label: "5 номинаций", value: "$300" },
          ],
          grandPrixLabel: "Гран-при",
          grandPrixNote: "от 5 номинаций — автоматически",
        },
      },
      jury: {
        eyebrow: "Судейский состав",
        title: "Регистрация судьи",
        standard: {
          label: "СТАНДАРТНЫЙ ВЗНОС",
          value: "$250",
          text: "Для специалистов с опытом от 5 лет. Взнос оплачивается только после одобрения кандидатуры.",
        },
        ibpaTrainer: {
          label: "УЧАСТНИКИ АССОЦИАЦИИ IBPA — ТРЕНЕР И ВЫШЕ",
          value: "$100",
          text: "Специальный взнос для участников ассоциации IBPA категории тренер и выше.",
          note: "Также оплачивается после одобрения кандидатуры.",
        },
      },
    },
    categoriesPreview: {
      label: "Категории",
      title: "11 категорий превосходства в индустрии красоты",
      viewAll: "Все категории",
      items: [
        "Парикмахер / стилист по волосам",
        "Нейл-мастер",
        "Бровист",
        "Мастер по наращиванию ресниц",
        "Косметолог / эстетист",
        "Визажист",
        "Мастер перманентного макияжа",
        "Специалист по телу и здоровью",
        "Преподаватель / тренер в бьюти-сфере",
        "Салон / студия",
        "Бренд",
      ],
    },
    process: {
      label: "Процесс премии",
      title: "Как проходит премия IBPA",
      steps: [
        {
          number: "01",
          title: "Выберите свою категорию",
          text: "Премия охватывает 11 профессиональных категорий — от мастерства до брендинга. Выберите ту, которая ближе всего к вашей сфере деятельности.",
        },
        {
          number: "02",
          title: "Определите номинацию",
          text: "Внутри каждой категории - несколько номинаций. Выберите ту, которая точнее всего описывает вашу специализацию и то, чем вы занимаетесь.",
        },
        {
          number: "03",
          title: "Подтвердите ваш статус в IBPA",
          text: "Если вы аккредитованный специалист IBPA — укажите ID сертификата для подтверждения и получения тарифа для участников IBPA.",
        },
        {
          number: "04",
          title: "Заполните заявку и загрузите материалы",
          text: "Заполните основную форму и прикрепите материалы, соответствующие выбранной категории и номинации.",
        },
        {
          number: "05",
          title: "Отправьте заявку и оплатите взнос",
          text: "Для участников IBPA — от $50 за номинацию, для участников которые не состоят в ассоциации — от $70. Участие в 5+ номинациях автоматически включает вас в Гран-при.",
        },
      ],
    },
    grandPrix: {
      label: "Гран-при",
      title: "Гран-при IBPA 2026",
      text1:
        "Высшая награда за выдающийся результат, присуждаемая участникам, показавшим лучший суммарный результат в 5 и более номинациях.",
      text2:
        "Гран-при - это абсолютная победа, основанная на суммарных результатах участия в нескольких номинациях. Участник становится номинантом при участии в 5 и более номинациях - в одном или нескольких категориях.",
      cta: "Подробнее о Гран-при",
    },
    juryCta: {
      label: "Жюри",
      title: "Подайте заявку, чтобы стать официальным судьёй премии IBPA 2026",
      text1: "Кандидаты на роль судей проходят профессиональный отбор.",
      text2:
        "Подайте заявку на должность судьи — её рассмотрит экспертная комиссия IBPA. В случае одобрения вы получите приглашение и ссылку для оплаты регистрационного взноса: $250 для всех специалистов или $100 для аккредитованных специалистов IBPA категории тренер и выше.",
      text3:
        "После оплаты судья получает официальное подтверждение, комплект документов и публичный профиль на странице жюри.",
      button: "Подать заявку на должность судьи",
    },
    faq: {
      label: "Вопросы",
      title: "Часто задаваемые вопросы",
      items: [
        {
          q: "Сколько стоит участие?",
          a: "Регистрационный взнос составляет $50 за каждую выбранную категорию.",
        },
        {
          q: "Кто может участвовать?",
          a: "Подать заявку на участие в премии могут все действующие участники ассоциации IBPA.",
        },
        {
          q: "Можно ли подать заявку в жюри?",
          a: "Да. Кандидаты проходят отбор, а взнос $250 оплачивается только после одобрения.",
        },
        {
          q: "Как работает Гран-при?",
          a: "Участие формируется автоматически при участии в 5 и более номинациях.",
        },
      ],
    },
    cta: {
      label: "Готовы участвовать?",
      title: "Ваше место среди лучших",
      text: "Подготовьте портфолио, выберите номинацию и подайте заявку на официальную оценку жюри IBPA. Признание начинается с одного шага.",
      judge: "Стать судьёй",
    },
    forum: {
      eyebrow: "IBPA BEAUTY AWARD 2026",
      title: "IBPA BEAUTY AWARD 2026",
      description: "Международная встреча лидеров beauty-индустрии, объединяющая нагородение, профессиональное образование, деловые связи и торжественный Гала-вечер — всё в одном премиальном событии.",
    },
    participation: {
      eyebrow: "Выберите участие",
      description: "Посетите форум, пообщайтесь с экспертами индустрии красоты и присоединитесь к основной бизнес-программе IBPA.",
      tickets: {
        label: "БИЛЕТЫ НА ФОРУМ",
        mostPopular: "Самое популярное",
        features: "1 день · 2 дня · Гала-ужин",
        cta: "Купить билеты",
      },
      award: {
        label: "УЧАСТИЕ В КОНКУРСЕ",
        description: "Представьте свою работу на международное признание.",
        cta: "Подать заявку",
      },
      judge: {
        label: "РЕГИСТРАЦИЯ СУДЬИ",
        description: "Присоединитесь к официальному составу жюри.",
        cta: "Зарегистрироваться",
      },
    },
    pricingSection: {
      eyebrow: "Стоимость участия",
      title: "Прозрачные цены для каждого пути",
      forumTickets: "Билеты на форум",
      awardParticipation: "Участие в конкурсе",
      judgeRegistration: "Регистрация судьи",
      standard: "Стандарт",
      ibpaMembers: "Участники",
      nonMembers: "Не участники",
      oneDayPass: "1 день",
      twoDayPass: "2 дня",
      galaDinner: "Гала-ужин",
      oneNomination: "1 номинация",
      threeNominations: "3 номинации",
      fiveNominations: "5 номинаций",
      grandPrixNote: "5+ номинаций автоматически квалифицируют на Гран-при.",
      judgePaidAfterApproval: "Оплачивается после одобрения",
      mostPopular: "Самое популярное",
      startingFrom: "Начиная от",
      from: "От",
      perPerson: "/ чел.",
      perNom: "/ ном.",
      fee: "Взнос",
      perJudge: "/ судья",
    },
    grandPrixSpotlight: {
      eyebrow: "Гран-при",
      title: "ГРАН-ПРИ",
      description: "Участники, подающие 5 и более номинаций, автоматически участвуют в розыгрыше Гран-при — высшего звания IBPA BEAUTY AWARD 2026.",
      cta: "Подать заявку на участие",
      learnMore: "Подробнее",
      stats: [
        { value: "5+", label: "Номинаций" },
        { value: "Авто", label: "Квалификация" },
      ],
    },
    whyAttend: {
      eyebrow: "Зачем участвовать",
      items: [
        {
          title: "Деловые связи",
          description: "Знакомьтесь с профессионалами, стройте партнёрства и развивайте бизнес на международном уровне.",
        },
        {
          title: "Образовательные сессии",
          description: "Получайте знания от экспертов индустрии и инновационных лидеров, формирующих будущее красоты.",
        },
        {
          title: "Международное признание",
          description: "Продемонстрируйте свой талант и получите мировое признание на высочайшем уровне.",
        },
        {
          title: "Церемония награждения",
          description: "Отпразднуйте профессиональное совершенство в незабываемый вечер с лучшими индустрии красоты.",
        },
      ],
    },
    finalCta: {
      eyebrow: "Присоединяйтесь к IBPA BEAUTY AWARD 2026",
      title: "Готовы присоединиться к IBPA BEAUTY AWARD 2026?",
      buyTicket: "Купить билет",
      applyAward: "Подать заявку",
      registerJudge: "Регистрация судьи",
    },
  },
  categoriesPage: {
    hero: {
      eyebrow: "Категории премии",
      title: "11 категорий превосходства в индустрии красоты",
      description: "Индустрия красоты - это не одна профессия, а целая экосистема мастерства. Мы выделили 11 категорий, чтобы каждая специализация получила честную, профессиональную оценку. Артистизм, образование, уход за кожей, управление брендом - каждая категория оценивается отдельным жюри по чётким критериям. Выберите свою категорию и подайте заявку.",
      entryRules: "Правила участия",
      feeLabel: "Регистрационный взнос",
      feeValue: "$50 за категорию",
      eligibilityLabel: "Участие",
      eligibilityValue: "Для участников IBPA Beauty Award 2026",
      cta: "Подать заявку по категории",
    },
    participation: {
      eyebrow: "Как принять участие",

      title:
        "Премия, созданная для профессионального лидерства в индустрии красоты.",

      description:
        "Структурированный отбор, прозрачная оценка и международное признание для специалистов, преподавателей, клиник, академий, салонов и представителей beauty-бизнеса.",

      steps: [
        {
          number: "01",
          title: "Заполните заявку",
        },
        {
          number: "02",
          title: "Выберите свою категорию",
        },
        {
          number: "03",
          title: "Определите номинацию",
        },
        {
          number: "04",
          title:
            "Укажите личные данные, загрузите фото и видео, подробно опишите ваши достижения",
        },
        {
          number: "05",
          title: "Произведите оплату",
        },
        {
          number: "06",
          title: "Приём заявок до 10 августа 2026 года",
        },
      ],

      doneTitle: "Готово!",

      doneDescription:
        "Ваша работа будет оценена международной коллегией судей.",
    },
    whyJoin: {
      eyebrow: "Почему стоит присоединиться",
      title: "Почему стоит принять участие в IBPA Beauty Awards",
      benefits: [
        "Международное признание ваших профессиональных достижений.",
        "Оценка работ международной коллегией экспертов.",
        "Повышение доверия клиентов и укрепление личного бренда.",
        "Возможность получить статус победителя или призёра IBPA Beauty Awards 2026.",
        "Публикация и продвижение лучших участников в профессиональном сообществе.",
        "Нет необходимости присутствовать лично — участие проходит онлайн.",
      ],
      grandPrixEyebrow: "Правило Гран-при",
      grandPrixTitle: "5+ номинаций — и вы в Гран-при",
      grandPrixDescription:
        "Подайте заявки в 5 и более номинаций — и вы автоматически становитесь номинантом на Гран-при IBPA. Без дополнительных заявок.",
      grandPrixBadge: "Шанс выиграть трофей Гран-при",
    },
    cardText: "Профессиональные заявки рассматриваются в рамках официальной премии IBPA Beauty Award 2026.",
    directions: [
      {
        slug: "hair",
        title: "Волосы",
        nominations: [
          "Премия за выдающиеся достижения в технике окрашивания волос",
          "Премия за выдающиеся достижения в барберинге",
          "Премия за выдающиеся достижения в восстановлении волос",
          "Премия за выдающиеся достижения в области наращивания волос"
        ],
      },
      {
        slug: "nail",
        title: "Ногти",
        nominations: [
          "Премия за выдающиеся достижения в маникюре",
          "Премия за выдающиеся достижения в наращивании ногтей",
          "Премия за выдающиеся достижения в подологии",
        ],
      },
      {
        slug: "brow",
        title: "Брови",
        nominations: [
          "Премия за выдающиеся достижения в ламинировании бровей",
          "Премия за выдающиеся достижения в стайлинге и дизайне бровей",
        ],
      },
      {
        slug: "lash",
        title: "Наращивание и Ламинирование Ресниц",
        nominations: [
          "Премия за выдающиеся достижения в классическом наращивании ресниц",
          "Премия за выдающиеся достижения в объёмном наращивании ресниц",
          "Премия за выдающиеся достижения в креативном дизайне наращивания ресниц",
          "Премия за выдающиеся достижения в ламинировании ресниц",
        ],
      },
      {
        slug: "skin-cosmetology-facial",
        title: "Уход за Кожей, Косметология и Лицо",
        nominations: [
          "Премия за выдающиеся достижения в неинвазивном омоложении",
          "Премия за выдающиеся достижения в антивозрастном уходе за лицом",
          "Премия за выдающиеся достижения в лечении акне",
        ],
      },
      {
        slug: "makeup-artistry",
        title: "Искусство макияжа",
        nominations: [
          "Премия за выдающиеся достижения в свадебном макияже",
          "Премия за выдающиеся достижения в креативном макияже",
          "Премия за выдающиеся достижения в возрастном макияже",
          "Премия за выдающиеся достижения в дневном макияже",
        ],
      },
      {
        slug: "permanent-makeup",
        title: "Перманетный Макияж",
        nominations: [
          "Премия за выдающиеся достижения в перманентном макияже бровей",
          "Премия за выдающиеся достижения в технике перманентной подводки век",
          "Премия за выдающиеся достижения в перманентном макияже губ",
          "Премия за выдающиеся достижения в камуфляже и коррекции",
        ],
      },
      {
        slug: "body-wellness-nutrition",
        title: "Тело, Велнес и Нутрициология",
        nominations: [
          "Премия за выдающиеся достижения в трансформации тела",
          "Премия за выдающиеся достижения в скульптурирующем массаже",
          "Премия за выдающиеся достижения в нутрициологии и коррекции питания",
          "Премия за выдающиеся достижения в антицеллюлитном уходе",
        ],
      },
      {
        slug: "education",
        title: "Обучение",
        nominations: [
          "Премия за выдающиеся достижения в профессиональном обучении в индустрии красоты",
          "Премия за выдающиеся достижения в онлайн-обучении в индустрии красоты",
        ],
      },
      {
        slug: "salon",
        title: "Салон",
        nominations: [
          "Премия за выдающиеся достижения в инновациях бьюти-салона",
          "Премия за выдающиеся достижения в развитии бьюти-бизнеса",
        ],
      },
      {
        slug: "brand",
        title: "Бренд",
        nominations: [
          "Премия за выдающиеся достижения в разработке профессиональной бьюти-продукции",
          "Премия за выдающиеся достижения в развитии бьюти-бренда",
          "Инновационная премия в индустрии красоты",
        ],
      },
    ],
    copy: {
        nominationSingular: "номинация",
        nominationPlural: "номинации",
        heroMediaTitle: "Глубина категории и живая энергия события",
        association: "Ассоциация",
        associationTitle: "IBPA — международное сообщество профессионалов индустрии красоты",
        associationText: "IBPA объединяет сильных и перспективных специалистов индустрии красоты по всему миру. Наша миссия — поддерживать рост профессиональных стандартов и формировать культуру ответственности, этики и профессионализма в профессии.",
        associationQuote: "Ассоциация работает с мастерами, педагогами, салонами и брендами — всеми, кто стремится соответствовать высокой планке качества и профессиональной культуры.",
        associationButton: "Перейти в ассоциацию IBPA",
        ctaEyebrow: "Подача по категории",
        ctaTitle: "Готовы продемонстрировать своё профессиональное мастерство?",
        ctaText: "Выберите свою номинацию и станьте частью IBPA Beauty Awards 2026 — международной премии, созданной для признания выдающихся достижений специалистов, преподавателей, владельцев бизнеса и брендов в индустрии красоты.",
        ctaButton: "Регистрация",
    },
    awardResults: {
      eyebrow: "Результаты премии",
      title: "Результаты премии",
      timeline: {
        applicationsOpen: {
          label: "Прием заявок открыт",
          date: "2 июля",
          sub: "2026",
        },
        registrationCloses: {
          label: "Регистрация закрывается",
          date: "10 августа",
          sub: "2026",
        },
        awardCeremony: {
          label: "Церемония награждения",
          date: "26 сентября",
          sub: "IBPA Beauty Awards",
        },
      },
      jury: {
        title: "Международное жюри",
        note: "В состав жюри входят международные тренеры и ведущие эксперты отрасли.",
        points: [
          "Международные эксперты",
          "Независимая оценка",
          "Профессиональная система оценивания",
        ],
      },
      pricing: {
        eyebrow: "Стоимость участия",
        headers: {
          nominations: "Номинации",
          members: "Участники",
          nonMembers: "Стандарт",
        },
        oneNomination: {
          label: "1 номинация",
          member: "$50",
          nonMember: "$70",
        },
        threeNominations: {
          label: "3 номинации",
          member: "$130",
          nonMember: "$190",
        },
        fiveNominations: {
          label: "5 номинаций",
          member: "$200",
          nonMember: "$300",
        },
        grandPrixEligibility: "Участие в Гран-при",
        nonRefundable:
          "Регистрационный взнос является невозвратным после подачи заявки.",
      },
    },
    faq: {
      eyebrow: "Вопросы",
      title: "Часто задаваемые вопросы",
      items: [
        {
          question: "Кто может принять участие в IBPA Beauty Awards 2026?",
          answer:
            "К участию приглашаются специалисты, преподаватели, владельцы бизнеса, академии, студии, салоны и бренды индустрии красоты.",
        },
        {
          question: "Обязательно ли проживать в США для участия?",
          answer:
            "Нет. В премии могут принимать участие кандидаты из любой страны мира.",
        },
        {
          question: "Как проходит участие в премии?",
          answer:
            "Участники подают заявку и конкурсные материалы через онлайн-форму. Оценка работ проводится международной коллегией судей.",
        },
        {
          question: "Нужно ли присутствовать на церемонии награждения?",
          answer:
            "Нет. Участие в премии и оценка работ проходят независимо от присутствия на церемонии.",
        },
        {
          question: "Сколько работ можно подать?",
          answer:
            "Участник может подать несколько работ и участвовать в нескольких категориях.",
        },
        {
          question: "Можно ли подать одну работу в несколько категорий?",
          answer:
            "Да, если работа соответствует требованиям выбранных категорий.",
        },
        {
          question: "Когда заканчивается приём заявок?",
          answer:
            "Приём заявок открыт с 1 июня по 8 июля 2026 года включительно.",
        },
        {
          question: "Когда будут объявлены результаты?",
          answer:
            "Результаты будут объявлены во время IBPA Beauty Awards 2026 и опубликованы на официальных ресурсах премии.",
        },
        {
          question: "Что получают победители и призёры?",
          answer:
            "Победители и призёры получают официальные награды, сертификаты и публикации в рамках премии.",
        },
        {
          question: "Могу ли я подать заявку, если работаю менее 5 лет?",
          answer:
            "Да, если выбранная категория не предусматривает требований к минимальному стажу работы.",
        },
        {
          question: "Возвращается ли регистрационный взнос?",
          answer:
            "Нет. Регистрационный взнос является невозвратным после подачи заявки.",
        },
      ],
    },
  },
  juryPage: {
    hero: {
      eyebrow: "IBPA Beauty Award 2026",
      title: "Подайте заявку, чтобы стать официальным судьёй премии IBPA 2026",
      description:
        "Кандидаты на роль судей проходят профессиональный отбор. Сначала подаётся заявка, после чего она рассматривается экспертной комиссией. В случае одобрения кандидат получает приглашение и ссылку для оплаты регистрационного взноса $250.",
      requirements: "Смотреть требования",
      overview: "Обзор для жюри",
      experience: "Опыт",
      experienceValue: "5+ лет",
      review: "Рассмотрение",
      reviewValue: "До 14 рабочих дней",
      fee: "Взнос",
      feeValue: "$250",
      feeNote: "Оплачивается только после одобрения",
    },
    about: {
      eyebrow: "О премии",
      title: "IBPA Beauty Awards 2026",
      description:
        "IBPA Beauty Awards 2026 — международная премия в сфере красоты, созданная для признания профессионализма, таланта и выдающихся достижений специалистов, преподавателей, владельцев бизнеса и брендов.",
      recognition:
        "Премия отмечает сильные профессиональные результаты, экспертность, креативность и вклад в развитие индустрии красоты.",
      objectiveEvaluation:
        "Судейская коллегия играет ключевую роль в обеспечении объективной, честной и профессиональной оценки конкурсных работ.",
      trust:
        "Благодаря экспертному судейству жюри формирует доверие к премии и усиливает её международный статус.",
    },
    timeline: {
      eyebrow: "Период судейства",
      title: "Важные даты",
      formatLabel: "Формат судейства",
      formatValue: "Онлайн",
      yearLabel: "Год",
      year: "2026",
      items: [
        {
          label: "Подача заявок в судейскую коллегию",
          title: "Прием заявок",
          date: "1 июня – 8 июля",
        },
        {
          label: "Период оценки конкурсных работ",
          title: "Оценка работ",
          date: "16 августа – 5 сентября",
        },
        {
          label: "Финал и оглашение результатов",
          title: "Награждение",
          date: "26 сентября",
        },
      ],
    },
    gallery: {
      eyebrow: "Моменты форума",
      title: "Атмосфера сообщества IBPA",
      description:
        "Визуальный взгляд на атмосферу, гостей, профессионалов и моменты, которые делают IBPA Beauty Business Forum особенным.",
      prevLabel: "Предыдущее фото",
      nextLabel: "Следующее фото",
      goToLabel: "Перейти к фото",
      photoAlt: "Фото IBPA Forum",
    },
    requirements: {
      label: "Кто может стать судьёй",
      title: "Требования к кандидатам",
      description:
        "Судейская коллегия формируется из опытных профессионалов, способных обеспечить честную, объективную и экспертную оценку конкурсных работ.",
      items: [
        {
          label: "Опыт",
          text: "Опыт работы в индустрии красоты от 5 лет.",
        },
        {
          label: "Экспертиза",
          text: "Подтверждённая профессиональная экспертиза в своей категории.",
        },
        {
          label: "Документы",
          text: "Наличие сертификатов, дипломов, лицензий или других подтверждающих документов.",
        },
        {
          label: "Профессиональная деятельность",
          text: "Преподавательская, конкурсная или экспертная деятельность приветствуется.",
        },
        {
          label: "Опыт судейства",
          text: "Опыт судейства желателен, но не является обязательным.",
        },
        {
          label: "Стандарты",
          text: "Готовность соблюдать регламент, конфиденциальность и принципы объективной оценки.",
        },
      ],
    },
    responsibilities: {
      eyebrow: "Роль судьи в премии",
      title: "Что входит в обязанности судьи",
      items: [
        "Оценка конкурсных работ в соответствии с утверждёнными критериями премии.",
        "Рассмотрение работ только в своей профессиональной категории.",
        "Выставление объективных и независимых оценок на основе опыта и экспертизы.",
        "Соблюдение конфиденциальности конкурсных материалов, участников и результатов.",
        "Работа в установленные сроки через онлайн-формат судейства.",
        "Подтверждение итоговых оценок и участие в формировании справедливых результатов премии.",
      ],
    },
    feeCard: {
      eyebrow: "Регистрационный взнос",
      title: "Стоимость участия в составе жюри",
      standardLabel: "Стандарт",
      standardPrice: "$250",
      membersLabel: "Участники",
      membersPrice: "$100",
      note: "Регистрационный взнос оплачивается только после одобрения кандидатуры и является невозвратным.",
    },
    process: {
      label: "Процесс",
      title: "Как проходит заявка в жюри",
      steps: [
        {
          number: "01",
          title: "Подайте заявку",
          text: "Заполните форму заявки в жюри и загрузите все необходимые материалы.",
        },
        {
          number: "02",
          title: "Рассмотрение IBPA Beauty Award 2026",
          text: "Ваш профессиональный опыт, квалификация и документы проходят проверку.",
        },
        {
          number: "03",
          title: "Получите решение",
          text: "Одобренные кандидаты получают официальное письмо со следующими шагами.",
        },
        {
          number: "04",
          title: "Оплатите взнос",
          text: "Только одобренные кандидаты получают приглашение оплатить взнос жюри $250.",
        },
        {
          number: "05",
          title: "Войдите в состав жюри",
          text: "После подтверждения оплаты вы становитесь официальным участником жюри.",
        },
      ],
    },
    faq: {
      label: "Часто задаваемые вопросы",
      title: "FAQ",
      items: [
        {
          question: "Судейство проходит онлайн?",
          answer:
            "Да, все конкурсные работы оцениваются дистанционно через личный кабинет судьи.",
        },
        {
          question:
            "Когда я узнаю результат рассмотрения моей заявки в судейскую коллегию?",
          answer:
            "После проверки профессионального опыта и документов кандидат получает уведомление о решении комиссии.",
        },
        {
          question: "Нужно ли присутствовать на церемонии награждения?",
          answer:
            "Нет, присутствие на церемонии не является обязательным.",
        },
        {
          question: "Есть ли финансовое вознаграждение?",
          answer:
            "Нет, участие в судейской коллегии осуществляется на добровольной основе.",
        },
        {
          question: "Когда я получу доступ к работам?",
          answer:
            "После завершения приёма заявок и утверждения списка конкурсных работ.",
        },
        {
          question: "Могу ли я быть судьёй, если живу не в США?",
          answer:
            "Да, в состав жюри могут входить специалисты из разных стран.",
        },
        {
          question: "Обязательно ли иметь опыт судейства?",
          answer:
            "Опыт судейства приветствуется, но не является обязательным требованием. При отсутствии опыта судейства кандидат должен иметь значительные профессиональные достижения, преподавательский, конкурсный или экспертный опыт, подтверждающий высокий уровень квалификации и понимание процесса профессиональной оценки работ.",
        },
        {
          question: "Сколько времени занимает оценка работ?",
          answer:
            "Количество работ зависит от категории. Процесс организован так, чтобы судейство можно было пройти комфортно в установленные сроки.",
        },
      ],
    },
    cta: {
      label: "Жюри",
      title: "Подайте заявку, чтобы стать официальным судьёй премии IBPA 2026",
      text: "Кандидаты на роль судей проходят профессиональный отбор. После одобрения судьи получают официальное подтверждение, комплект документов и публичный профиль на странице жюри.",
      button: "Подать заявку на должность судьи",
    },
    apply: {
      eyebrow: "Заявка в жюри",
      title: "Подайте заявку, чтобы стать судьёй премии IBPA 2026",
      text: "Представьте свой профессиональный профиль, опыт и области специализации для прохождения отбора в состав жюри.",
    },
    copy: {
      heroEyebrow: "Совет жюри IBPA Beauty Award 2026",
      heroTitle: "Станьте официальным судьей IBPA Beauty Award 2026",
      heroText: "Премиальный состав жюри для честного, экспертного и международно признанного судейства.",
      leadershipTitle: "Лидерство, доверие и независимые стандарты",
      credibility: "Доверие",
      credibilityText: "Каждый судья должен подтвердить профессиональный опыт и экспертизу по категориям",
      processLabel: "Как проходит отбор",
      processTitle: "Три шага до статуса судьи",
      processText: "Понятный путь от подачи до официального включения в состав жюри.",
      apply: "Подача заявки",
      approved: "Рассмотрение и одобрение",
      registration: "Оплата и подтверждение",
      applyText: "Отправьте профессиональный профиль, опыт работы и необходимые материалы для рассмотрения комиссией IBPA Beauty Award 2026.",
      approvedText: "IBPA Beauty Award 2026 оценивает вашу экспертизу и профессиональное соответствие. При одобрении вы получаете официальное приглашение.",
      registrationText: "Одобренные кандидаты оплачивают регистрационный взнос и получают официальный статус судьи, сертификат и публичный профиль на сайте премии.",
      benefitsEyebrow: "Преимущества судьи",
      benefitsTitle: "Почему эксперты входят в совет жюри IBPA Beauty Award 2026",
      benefitsText: "Серьезная профессиональная роль с заметным вкладом и международным признанием.",
      b1Title: "Официальное признание",
      b1Text: "Публикуйтесь как подтвержденный участник жюри IBPA Beauty Award 2026 и представляйте отраслевые стандарты.",
      b2Title: "Надежная система",
      b2Text: "Оценивайте заявки через прозрачный и структурированный процесс судейства.",
      b3Title: "Профессиональное сообщество",
      b3Text: "Присоединяйтесь к международному кругу лидеров и преподавателей beauty-сферы.",
      b4Title: "Профильная репутация",
      b4Text: "Укрепляйте профессиональный авторитет через официальную роль в премии.",
      statementEyebrow: "Позиция доверия",
      statementTitle: "Каждый балл должен отражать мастерство и профессиональную честность",
      statementText: "Судьи IBPA Beauty Award 2026 отбираются по экспертизе, нейтральности и приверженности справедливой оценке.",
      statementText2: "Каждый участник жюри действует независимо и оценивает работы исключительно на основании утверждённых критериев премии.",
      statementQuote: "Судейство - это не только результат. Это доверие к процессу.",
      approvedEyebrow: "Одобренное жюри",
      approvedTitle: "Текущий состав жюри IBPA Beauty Award 2026",
      approvedSectionText: "Актуальный список одобренных судей, участвующих в премии.",
      ctaEyebrow: "Совет жюри",
      ctaTitle: "Примените свою экспертизу на сцене IBPA Beauty Award 2026",
      ctaText: "Подайте заявку в жюри и участвуйте в справедливых профессиональных решениях по номинациям.",
      ctaAside: "Оплата регистрации доступна только после одобрения.",
    },
    benefits: {
      eyebrow: "Привилегии официального судьи",
      title: "Привилегии официального судьи IBPA Beauty Awards 2026",
      description:
        "После подтверждения участия судьи получают официальный пакет документов, публикаций и профессиональных привилегий, подтверждающих их статус в составе международной судейской коллегии IBPA Beauty Awards 2026.",
      items: [
        "Официальное приглашение в состав жюри IBPA Beauty Awards 2026.",
        "Регламент и методические материалы для проведения судейства.",
        "Доступ к личному кабинету судьи для оценки конкурсных работ.",
        "Официальную судейскую ведомость для проведения оценки участников.",
        "Именной сертификат официального судьи IBPA Beauty Awards 2026.",
        "Благодарственное письмо за участие в работе международной судейской коллегии.",
        "Персональный баннер судьи для публикации в социальных сетях и профессиональном портфолио.",
        "Публичное размещение профиля судьи на официальном сайте премии.",
        "Публикацию в составе международной судейской коллегии IBPA Beauty Awards 2026.",
        "Упоминание в итоговой статье и публикациях, посвящённых проведению премии и её результатам.",
      ],
    },
    juryCta: {
      eyebrow: "Регистрация судьи",
      title: "Присоединяйтесь к международному жюри IBPA.",
      description: "Подайте заявку как участник жюри для оценки профессионального мастерства в индустрии красоты и участия в уважаемой международной премии.",
      registrationFee: "Регистрационный взнос",
      registrationNote:
        "Регистрационный взнос оплачивается только после одобрения кандидатуры и является невозвратным.",
    },
  },
  grandPrixPage: {
    hero: {
      eyebrow: "Гран-при",
      title: "Гран-при IBPA 2026",
      description:
        "Высшая награда за выдающийся результат, присуждаемая участникам, показавшим лучший суммарный результат в 5 и более номинациях.",
      body:
        "Гран-при - это абсолютная победа, основанная на суммарных результатах участия в нескольких номинациях. Участник становится номинантом при участии в 5 и более номинациях - в одном или нескольких категориях.",
      snapshot: "Ключевые условия",
      eligibility: "Критерии участия",
      eligibilityValue: "Минимум 5 номинаций",
      evaluation: "Оценка",
      evaluationValue: "Суммарный балл по всем номинациям",
      decision: "Решение",
      decisionValue: "Полный состав жюри",
      cta: "Смотреть категории",
      learnMore: "Подробнее",
    },
    pillars: [
      {
        title: "Как стать номинантом на Гран-при",
        text: "Участник автоматически становится номинантом на Гран-при, если принимает участие минимум в 5 номинациях. Номинации могут быть в одной категории или в нескольких.",
      },
      {
        title: "Пример",
        text: "3 номинации в категории «Брови» + 2 номинации в категории «Ресницы» дают право на участие в Гран-при.",
      },
      {
        title: "Как определяется победитель Гран-при",
        text: "Каждая номинация оценивается судьями отдельно. Все баллы суммируются в общий результат, и побеждает участник с наибольшей суммой баллов среди всех номинантов.",
      },
    ],
    criteria: {
      label: "Важно",
      title: "5 номинаций для квалификации",
      text: "Квалификация на Гран-при основана на участии минимум в 5 номинациях. Эти номинации могут быть внутри одного категории или распределены по нескольким категориям.",
      listLabel: "Ключевые критерии",
      items: [
        "Критерии участия: минимум 5 номинаций",
        "Оценка: суммарный балл по всем номинациям",
        "Решение: полный состав жюри",
      ],
    },
    flow: {
      label: "Логика отбора",
      title: "Больше номинаций - больше шансов",
      steps: [
        {
          number: "01",
          title: "5+ номинаций - вы в Гран-при",
          text: "Чем шире вы представлены в премии, тем выше ваши шансы. 5 и более номинаций — и вы автоматически становитесь номинантом на Гран-при IBPA.",
        },
        {
          number: "02",
          title: "Жюри оценивает каждую номинацию",
          text: "Ваша работа получает профессиональную оценку жюри IBPA Beauty Award 2026 - честно, по единым критериям.",
        },
        {
          number: "03",
          title: "Победитель Гран-при",
          text: "Гран-при достаётся участнику с наибольшим суммарным баллом по всем номинациям. Лучший результат - заслуженная победа.",
        },
      ],
    },
    faq: {
      label: "Вопросы",
      title: "FAQ Гран-при",
      items: [
        {
          question: "Нужно ли отдельно подаваться на Гран-при?",
          answer:
            "Нет. Участие активируется автоматически после подачи заявок в 5 и более номинациях.",
        },
        {
          question: "Есть ли дополнительный взнос за Гран-при?",
          answer: "Нет. Отдельный регистрационный взнос не предусмотрен.",
        },
        {
          question: "Можно ли участвовать в Гран-при только с одной работой?",
          answer:
            "Нет. Для участия необходимо подать заявки минимум в 5 номинациях.",
        },
        {
          question: "Сколько победителей Гран-при определяется ежегодно?",
          answer: "Один обладатель Гран-при в рамках премии.",
        },
      ],
    },
    copy: {
      apply: "Подать заявку на участие",
      reviewCategories: "Смотреть категории",
      mediaTitle: "Соревнуйтесь по нескольким категориям",
      mediaDescription: "Номинация начинается, когда вы выступаете в нескольких категориях.",
      rule: "Правило Гран-при",
      selectionTitle: "Номинация, судейство и итоговое решение премии",
      timelineEyebrow: "Ключевые этапы",
      timelineTitle: "Понятная логика на каждом этапе премии",
      timelineDescription: "Акцент на номинации, оценивании и финальной презентации премии.",
      appWindow: "Период подачи заявок",
      appWindowText: "Подавайте номинации с 2 июля по 10 августа 2026 года.",
      scorePeriod: "Период оценивания",
      scorePeriodText: "Жюри оценивает работы с 16 августа по 5 сентября 2026 года.",
      reveal: "Финальное объявление",
      revealText: "Победителей объявляют на церемонии IBPA Beauty Awards 2026 — 26 сентября 2026 года.",
      breakEyebrow: "Атмосфера Гран-при",
      breakTitle: "Финальная сцена для сильного результата в нескольких категориях",
      breakText: "Премиальная среда, где суммарное мастерство получает заметное признание.",
      ctaEyebrow: "Участие в Гран-при",
      ctaTitle: "Постройте путь к высшей награде",
      ctaText: "Выступайте в нескольких категориях, усиливайте профиль и боритесь за главный титул IBPA Beauty Award 2026.",
      startEntry: "Начать подачу",
      viewCategories: "Смотреть категории",
      strategy: "Стратегия нескольких категорий имеет значение.",
      fiveCategories: "5+ номинаций - и вы в Гран-при",
      qualificationRule: "Подайте заявки в 5 и более номинаций - и вы автоматически становитесь номинантом на Гран-при IBPA. Без дополнительных заявок.",
      decision: "Решение премии",
    },
    about: {
      whatEyebrow: "О Гран-при",
      whatTitle: "Что такое Гран-при",
      whatText:
        "Гран-при — это главная награда IBPA Beauty Awards 2026, которая присуждается участнику с самым высоким суммарным результатом среди претендентов.",
      whoEyebrow: "Кто претендует",
      whoTitle: "Кто становится претендентом на Гран-при",
      whoHighlight: "5+ номинаций = автоматическое участие",
      whoText:
        "Участники, подавшие работы в пяти и более номинациях, автоматически становятся кандидатами на получение Гран-при.",
      whoNote: "Дополнительная регистрация не требуется.",
    },
    whySpecial: {
      eyebrow: "Почему это важно",
      title: "Почему Гран-при считается особой наградой",
      lead: "Гран-при оценивает не отдельную работу, а общий профессиональный уровень специалиста.",
      cards: [
        { title: "Мастерство", text: "Высокие результаты сразу в нескольких категориях." },
        { title: "Стабильность", text: "Подтверждение качества работы в разных направлениях." },
        { title: "Универсальность", text: "Широкая профессиональная экспертиза." },
        { title: "Признание", text: "Высший уровень награды в рамках премии." },
      ],
    },
    decision: {
      eyebrow: "Отбор",
      title: "Как определяется победитель",
      steps: [
        {
          number: "01",
          title: "Автоматический отбор",
          text: "5 и более номинаций автоматически включают участника в список претендентов на Гран-при.",
        },
        {
          number: "02",
          title: "Независимая оценка",
          text: "Каждая работа оценивается международной коллегией судей по единым критериям.",
        },
        {
          number: "03",
          title: "Подсчёт результатов",
          text: "Баллы суммируются по всем номинациям участника.",
        },
        {
          number: "04",
          title: "Определение победителя",
          text: "Гран-при получает участник с наивысшим итоговым результатом.",
        },
      ],
    },
    rewards: {
      eyebrow: "Награды",
      title: "Что получает обладатель Гран-при",
      items: [
        "Главный трофей Гран-при",
        "Специальный диплом победителя",
        "Международное признание",
        "Публикация на ресурсах IBPA",
        "Освещение победы в социальных сетях премии",
        "Статус обладателя Гран-при IBPA Beauty Awards 2026",
      ],
    },
    participationCta: {
      eyebrow: "Участие в премии",
      title: "Готовы заявить о своём профессиональном уровне?",
      description: "Подайте работы в выбранные номинации и получите возможность стать претендентом на Гран-при IBPA Beauty Awards 2026.",
      nominationFees: "Взносы за номинации",
      members: "Участники",
      perNomSubmission: "За одну номинацию",
      nominationsActivate: "Номинации активируют право участия",
    },
  },
  associationPage: {
    hero: {
      eyebrow: "Ассоциация IBPA",
      title: "International Beauty Professionals Association",
      subtitle: "Международная ассоциация профессионалов индустрии красоты",
      description:
        "International Beauty Professionals Association (IBPA) объединяет специалистов, преподавателей, владельцев бизнеса, академии, студии, салоны и бренды индустрии красоты из разных стран мира.",
      applyButton: "Подать заявку",
      websiteButton: "Перейти на сайт IBPA",
    },
    whoCanJoin: {
      eyebrow: "Кто может присоединиться?",
      title: "IBPA открыта для:",
      items: [
        "Специалисты индустрии красоты",
        "Преподаватели и тренеры",
        "Владельцы студий, салонов и академий",
        "Бьюти-бренды и компании",
        "Начинающие специалисты и студенты профильных направлений",
      ],
    },
    advantages: {
      eyebrow: "Преимущества участия",
      title: "Больше доверия, связей и профессионального роста.",
      description:
        "Участие в IBPA помогает усиливать личный бренд, расширять профессиональные возможности и быть частью международного beauty-сообщества.",
      items: [
        "Образовательные вебинары и профессиональные материалы",
        "Скидки на мероприятия, премии и проекты ассоциации",
        "Доступ к закрытому профессиональному сообществу",
        "Возможности для публикаций, выступлений и продвижения",
        "Участие в международных форумах, премиях и бизнес-мероприятиях",
        "Профиль в каталоге ассоциации",
        "Сертификат участника IBPA",
        "Партнерские программы, специальные предложения и множество других привилегий",
      ],
    },
    process: {
      eyebrow: "Как проходит вступление?",
      title: "Четкий и понятный процесс вступления.",
      stepLabel: "Шаг",
      steps: [
        {
          title: "Выберите категорию",
          text: "Выберите подходящую категорию участия в ассоциации.",
        },
        {
          title: "Заполните заявку",
          text: "Заполните заявку на вступление через форму сайта.",
        },
        {
          title: "Дождитесь рассмотрения",
          text: "Команда IBPA рассмотрит заявку и подтвердит дальнейшие шаги.",
        },
        {
          title: "Завершите регистрацию",
          text: "После одобрения проведите оплату, завершите регистрацию и получите доступ к преимуществам выбранной категории.",
        },
      ],
    },
    cta: {
      eyebrow: "Узнать больше",
      title: "Готовы присоединиться к международному сообществу профессионалов?",
      description:
        "Подробная информация о категориях участия, стоимости, преимуществах и условиях вступления доступна на официальном сайте IBPA.",
      applyButton: "Подать заявку на вступление",
      websiteButton: "Перейти на сайт IBPA",
    },
  },
  applyPage: {
    intro: {
      eyebrow: "Заявка участника",
      title: "Отправьте заявку на участие в премии.",
      text: "Заполните форму ниже, указав профессиональные данные и материалы по выбранной категории и номинации.",
    },
    form: {
      blockA: "Блок A",
      blockATitle: "Профессиональный профиль и право на участие",
      blockADescription:
        "Заполните общий раздел заявки перед переходом к материалам для оценки по категории.",
      blockB: "Блок B",
      blockBTitle: "Материалы по выбранной категории и номинации",
      blockBDescription: "Блок B меняется в зависимости от выбранного категории и номинации.",
      progress: "Прогресс заявки",
      requiredComplete: "обязательных пунктов заполнено",
      submit: "Отправить заявку на премию",
      submitting: "Отправка заявки...",
      validationError:
        "Пожалуйста, проверьте выделенные поля перед отправкой заявки.",
      submitError: "Не удалось отправить заявку. Попробуйте ещё раз.",
      submitException:
        "Во время отправки что-то пошло не так. Попробуйте ещё раз через минуту.",
      redirecting: "Переход к защищённой оплате Stripe Checkout.",
    },
    introCards: {
      eligibility: "Право на участие и важные примечания",
      feeHtml: "Взнос за участие: <strong>$50 за категорию</strong>.",
      separate: "Каждая категория подаётся как отдельная заявка.",
      juryNote: "Правила оплаты для жюри не относятся к этой странице заявки участника.",
      before: "Перед началом",
      items: [
        "Подготовьте файл лицензии или сертификата.",
        "Выберите одну категорию и одну конкретную номинацию.",
        "Соберите портфолио и дополнительные файлы для Блока B.",
        "Проверьте файлы портфолио перед загрузкой.",
      ],
    },
  },
  admin: {
    common: {
      logout: "Выйти",
      review: "Открыть",
      open: "Открыть",
      total: "Всего",
      submitted: "Отправлено",
      approved: "Одобрено",
      paymentPending: "Ожидает оплаты",
      underReview: "На рассмотрении",
      rejected: "Отклонено",
      applicant: "Участник",
      candidate: "Кандидат",
      category: "Категория",
      award: "Номинация",
      status: "Статус",
      payment: "Оплата",
      created: "Создано",
      date: "Дата",
      title: "Звание",
      expertise: "Экспертиза",
      application: "Заявка",
    },
    login: {
      eyebrow: "Доступ администратора",
      title: "Проверяйте заявки участников и жюри в едином закрытом пространстве.",
      text:
        "Войдите, чтобы получить доступ к внутренней проверке, просмотру файлов и отслеживанию решений по обоим потокам заявок.",
      cards: ["Закрытый доступ", "Быстрый просмотр заявок", "Управление статусами"],
      signIn: "Вход",
      loginTitle: "Вход администратора",
      loginText: "Введите пароль администратора для доступа к панелям заявок.",
      password: "Пароль администратора",
      placeholder: "Введите пароль",
      opening: "Открываем админ-панель...",
      open: "Открыть админ-панель",
    },
    participants: {
      eyebrow: "Администрирование участников",
      title: "Заявки участников премии",
      text:
        "Проверяйте профили участников, категории, файлы и текущие статусы в одном закрытом рабочем пространстве.",
      juryDashboard: "Жюри",
      scoringDashboard: "Оценки",
      appStatus: "Статус заявки",
      empty: "Нет заявок участников, соответствующих этому фильтру.",
    },
    jury: {
      eyebrow: "Администрирование жюри",
      title: "Панель заявок жюри",
      text:
        "Проверяйте заявки, отправляйте ссылки на оплату после одобрения и отслеживайте активацию в одном месте.",
      participantDashboard: "Участники",
      scoringDashboard: "Оценки",
      paidJurors: "Оплаченные судьи",
      empty: "Заявки в жюри пока не отправлены.",
    },
  },
  juryDashboard: {
    dashboard: "Панель жюри",
    accessText: "Доступ к проверке ограничен категориями, для которых вы одобрены.",
    approvedCategories: "Одобренные категории",
    assigned: "Назначенные заявки",
    scored: "Оценено",
    remaining: "Осталось",
    allCategories: "Все категории",
    applicant: "Участник",
    category: "Категория",
    award: "Номинация",
    status: "Статус",
    submitted: "Отправлено",
    open: "Открыть",
    reviewScore: "Проверить и оценить",
    continueDraft: "Продолжить черновик",
    viewSubmitted: "Смотреть отправленное",
    empty: "Нет заявок участников для вашего доступа по категории.",
    signOut: "Выйти",
  },
  auth: {
    shellCards: [
      "Закрытый доступ для участников",
      "Премиальный стиль IBPA Beauty Award 2026",
      "Защищённые страницы премии",
    ],
    access: "Доступ",
    accessText:
      "Войдите, чтобы получить доступ к сайту IBPA Beauty Award 2026. Новые пользователи могут зарегистрироваться по email и паролю, а затем перейти на основной сайт.",
    loginLink: "Войти",
    registerLink: "Регистрация",
    statement: "Каждая оценка должна отражать как мастерство, так и профессиональную честность.",
    trustBadge: "Официальный портал жюри · IBPA Beauty Award 2026",
    forgotPage: {
      eyebrow: "Восстановление пароля",
      title: "Восстановите доступ к кабинету жюри",
      description: "Введите зарегистрированный email-адрес, и мы отправим вам защищённую ссылку для сброса пароля.",
      cardEyebrow: "Ссылка для сброса",
      cardTitle: "Введите ваш email",
      cardText: "Если аккаунт зарегистрирован с этим email, вы получите инструкции по сбросу пароля.",
    },
    resetPage: {
      eyebrow: "Новый пароль",
      title: "Установите новый пароль для аккаунта жюри",
      description: "Создайте надёжный новый пароль для восстановления доступа к кабинету жюри IBPA Beauty Award 2026.",
      cardTitle: "Создайте новый пароль",
      cardText: "Введите и подтвердите новый пароль.",
    },
    loginPage: {
      eyebrow: "Вход жюри",
      title: "Доступ к рабочему пространству жюри IBPA Beauty Award 2026",
      description:
        "Войдите с email и паролем, чтобы перейти в панель жюри. Защищённые страницы сначала направят неавторизованных пользователей сюда.",
      cardEyebrow: "Вход жюри",
      cardTitle: "Добро пожаловать",
      cardText: "Введите данные для входа в рабочее пространство жюри IBPA Beauty Award 2026.",
    },
    registerPage: {
      eyebrow: "Регистрация жюри",
      title: "Создайте закрытый доступ жюри IBPA Beauty Award 2026",
      description:
        "Создайте email и пароль для входа на сайт. После регистрации вход выполняется автоматически, и вы переходите на главную страницу.",
      cardEyebrow: "Регистрация жюри",
      cardTitle: "Создайте аккаунт",
      cardText: "Укажите email и создайте пароль, чтобы начать.",
    },
    form: {
      email: "Email",
      emailPlaceholder: "Введите email",
      password: "Пароль",
      passwordPlaceholder: "Введите пароль",
      passwordRegisterPlaceholder: "Минимум 8 символов",
      confirmPassword: "Подтвердите пароль",
      confirmPasswordPlaceholder: "Повторите пароль",
      openingSite: "Открываем сайт...",
      creatingAccount: "Создаём аккаунт...",
      login: "Войти",
      register: "Зарегистрироваться",
      noAccount: "Нет аккаунта?",
      haveAccount: "Уже есть аккаунт?",
      backToLogin: "Вернуться ко входу",
      noRegisteredAccount: "Аккаунт с этим email не зарегистрирован.",
      invalidCredentials: "Неверный email или пароль. Попробуйте ещё раз.",
      forgotPassword: "Забыли пароль?",
      sendResetLink: "Отправить ссылку",
      sendingLink: "Отправка...",
      resetPassword: "Сохранить пароль",
      resettingPassword: "Обновление пароля...",
      newPassword: "Новый пароль",
      newPasswordPlaceholder: "Минимум 8 символов",
      confirmNewPassword: "Подтвердите новый пароль",
      confirmNewPasswordPlaceholder: "Повторите новый пароль",
      checkYourEmail: "Проверьте почту",
      checkYourEmailText: "Если этот email зарегистрирован, вы получите ссылку для сброса пароля.",
      invalidResetToken: "Ссылка для сброса пароля недействительна или уже была использована.",
      expiredResetToken: "Срок действия ссылки истёк. Пожалуйста, запросите новую.",
      passwordResetSuccess: "Пароль успешно обновлён. Теперь вы можете войти.",
    },
  },
  statuses: {
    DRAFT: "Черновик",
    PAYMENT_PENDING: "Ожидает оплаты",
    SUBMITTED: "Отправлено",
    UNDER_REVIEW: "На рассмотрении",
    ADDITIONAL_INFO_REQUIRED: "Требует уточнения",
    APPROVED: "Одобрено",
    REJECTED: "Отклонено",
    PAID: "Оплачено",
    PENDING: "Ожидание",
    FAILED: "Ошибка",
    EXPIRED: "Истекло",
    REFUNDED: "Возврат",
    NOT_STARTED: "Не начато",
    REOPENED: "Открыто заново",
    IN_PROGRESS: "В процессе",
    COMPLETE: "Завершено",
  },
  filters: {
    search: "Поиск по имени, email или номеру IBPA",
    allStatuses: "Все статусы",
    allCategories: "Все категории",
    allPayments: "Все оплаты",
    sortLabel: "Сортировка",
    sortNewest: "Сначала новые",
    sortOldest: "Сначала старые",
    sortName: "Имя А–Я",
    toggle: "Фильтры",
    clearAll: "Очистить",
  },
  ticketFlow: {
    alreadyPurchased: "Вы уже приобрели билет, используя этот адрес электронной почты.",
    success: {
      eyebrow: "IBPA BEAUTY AWARD 2026",
      title: "Оплата подтверждена",
      subtitle: "Ваш билет на IBPA BEAUTY AWARD 2026 подтверждён.",
      emailed:
        "Мы отправили ваш билет с QR-кодом на указанный адрес. Пожалуйста, покажите его на стойке регистрации форума.",
      backHome: "На главную",
      refundNotice:
        "Обратите, пожалуйста, внимание! Если вы уже приобрели билет на Beauty Business Forum, но ваши планы изменились и вы не сможете присутствовать, пожалуйста, сообщите нам об этом не позднее чем за один месяц до начала мероприятия. В этом случае мы сможем оформить возврат средств согласно правилам мероприятия.",
    },
  },
  notFound: {
    title: "Страница не найдена",
    description: "Страница, которую вы ищете, не существует или больше недоступна.",
    backHome: "Вернуться на главную",
    back: "Назад",
  },
};

const ua: typeof en = {
  account: {
    nav: {
      brand: "Акаунт учасника",
      overview: "Огляд",
      overviewShort: "Огляд",
      nominations: "Мої номінації",
      nominationsShort: "Номінації",
      tickets: "Квитки",
      ticketsShort: "Квитки",
      profile: "Профіль",
      profileShort: "Профіль",
      settings: "Налаштування акаунта",
      settingsShort: "Налаштування",
      signOut: "Вийти",
      expandSidebar: "Розгорнути меню",
      collapseSidebar: "Згорнути меню",
      openMenu: "Відкрити меню учасника",
      drawerTitle: "Акаунт учасника",
      navAria: "Навігація учасника",
      drawerAria: "Мобільна навігація учасника",
    },
    statuses: {
      DRAFT: "Чернетка",
      PAYMENT_PENDING: "Очікує оплати",
      PURCHASED: "Придбано",
      SUBMITTED: "Надіслано",
      UNDER_REVIEW: "На розгляді",
      RETURNED_FOR_CHANGES: "Повернено на правки",
      LOCKED: "Закрито",
      SCORED: "Оцінено",
      WITHDRAWN: "Відкликано",
      APPROVED: "Схвалено",
      REJECTED: "Відхилено",
      PAID: "Оплачено",
      PENDING: "Очікує оплати",
      FAILED: "Помилка оплати",
      EXPIRED: "Прострочено",
      REFUNDED: "Повернення",
      CANCELED: "Скасовано",
    } as Record<string, string>,
    common: {
      back: "Назад",
      edit: "Редагувати",
      save: "Зберегти",
      loading: "Завантаження",
      notProvided: "Не вказано",
      required: "обов'язково",
      optional: "необов'язково",
    },
    badges: {
      paid: "Оплачено",
      paymentPending: "Очікує оплати",
      locked: "Закрито",
      completion: "Заповнено",
    },
    editor: {
      backToNominations: "До номінацій",
      subtitle: "Заповніть заявку на номінацію",
      lockedDescription:
        "Заявку фіналізовано, вона доступна лише для перегляду. Зв'яжіться з нами, якщо щось виглядає неправильно.",
      submittedDescription:
        "Надіслано журі. Ви можете доопрацьовувати відповіді та файли, поки приймання заявок відкрите.",
      draftDescription:
        "Заповніть обов'язкові поля та завантаження, зберігайте прогрес будь-коли, а потім надішліть журі.",
      sectionNavLabel: "Розділи заявки",
      sections: {
        details: "Про роботу",
        detailsDescription: "Ключові факти про вас і вашу професійну роботу.",
        description: "Опис",
        descriptionDescription: "Розкажіть журі про свою роботу власними словами.",
        uploads: "Файли",
        uploadsDescription: "Портфоліо, документи та додаткові файли для журі.",
        review: "Перевірка",
        reviewDescription: "Перевірте кожен розділ і надішліть номінацію журі.",
      },
      requiredBefore: "Потрібно заповнити перед надсиланням",
      missingHint: "Натисніть на пункт, щоб перейти до розділу.",
      moreMissing: "ще",
      allComplete: "Усі обов'язкові поля та файли заповнено.",
      submitWhenReady: "Надішліть, коли будете готові.",
      completion: "Заповнено",
      lastSaved: "Збережено",
      justNow: "щойно",
      filesAttached: "Файлів прикріплено",
      finalScore: "Підсумковий бал",
      scoresPending: "Оцінки ще не опубліковано.",
      saveDraft: "Зберегти чернетку",
      submit: "Надіслати журі",
      updateSubmission: "Оновити заявку",
      uploadingFiles: "Завантажуємо файли…",
      saving: "Зберігаємо…",
      submitting: "Надсилаємо…",
      draftSaved: "Чернетку збережено.",
      submittedNotice: "Номінацію надіслано журі.",
      saveError: "Не вдалося зберегти номінацію.",
      lockedNotice: "Номінацію фіналізовано, редагування недоступне.",
      paymentPendingNotice: "Редагування відкриється після підтвердження оплати.",
      submittedHint: "Надіслані номінації можна редагувати, поки приймання заявок відкрите.",
      reviewReadiness: "Готовність до надсилання",
      readyToSubmit: "Номінація готова до надсилання.",
      missingBeforeSubmit: "Заповніть пункти, яких бракує, перед надсиланням.",
      emptySection: "У цьому розділі немає полів для вашої номінації.",
      editSection: "Змінити",
      notFilled: "Ще не заповнено",
      noFilesUploaded: "Файли ще не завантажено",
      wordsLabel: "слів",
      select: "Оберіть",
    },
    addFlow: {
      label: "Акаунт учасника",
      title: "Додати номінації",
      description:
        "Оберіть категорію та номінації, перевірте суму й переходьте до безпечної оплати.",
      steps: {
        category: "Категорія",
        nominations: "Номінації",
        review: "Перевірка",
        payment: "Оплата",
      },
      selectedCategory: "Обрана категорія",
      changeCategory: "Змінити категорію",
      available: "доступно",
      nominationLabel: "номінація",
      nominationsLabel: "номінацій",
      allOwned: "Усі номінації тут уже придбано.",
      chooseNominations: "Обрати номінації",
      viewNominations: "Переглянути номінації",
      selectedBadge: "обрано",
      alreadyPurchased: "Вже придбано",
      allOwnedCategory:
        "У цій категорії всі номінації вже придбано. Оберіть іншу категорію, щоб продовжити.",
      noneSelected: "Номінації ще не обрано.",
      totalLabel: "разом",
      reviewSelection: "Перевірити вибір",
      emptySelection: "Вибір порожній. Поверніться на попередні кроки та оберіть номінації.",
      removeAward: "Прибрати",
      orderSummary: "Підсумок замовлення",
      nominationsRow: "Номінації",
      rateRow: "Тариф",
      memberRate: "Член IBPA",
      standardRate: "Стандартний",
      packageRow: "Пакет",
      totalDue: "До сплати сьогодні",
      memberApplied: "Застосовано тариф підтвердженого учасника",
      continuePayment: "Перейти до оплати",
      creatingCheckout: "Створюємо оплату…",
      stripeNote: "Вас буде перенаправлено на безпечну оплату Stripe.",
      checkoutError: "Не вдалося створити оплату. Спробуйте ще раз.",
      redirectTitle: "Переходимо до безпечної оплати",
      redirectText: "Хвилинку — готуємо вашу сесію Stripe Checkout.",
      noCategoriesTitle: "Категорії недоступні",
      noCategoriesText: "Категорії номінацій ще не опубліковано. Завітайте пізніше.",
      backToDashboard: "До огляду",
      backToNominations: "До номінацій",
    },
    settings: {
      label: "Акаунт учасника",
      title: "Налаштування акаунта",
      description:
        "Дані для входу та відомості про акаунт. Номінації та профіль — на окремих сторінках.",
      account: "Акаунт",
      email: "Email",
      role: "Роль",
      applicant: "Учасник",
      memberSince: "Зареєстровано",
      language: "Мова",
      languageText:
        "Оберіть мову акаунта учасника. Вибір збережеться для наступних візитів.",
      languageAria: "Мова акаунта",
      password: "Пароль",
      passwordText: "Для зміни пароля ми надішлемо захищене посилання на ваш email.",
      sendResetLink: "Надіслати посилання",
      otherTitle: "Потрібно змінити щось інше?",
      otherText:
        "Зміну email та видалення акаунта виконує наша команда, щоб номінації та квитки залишалися коректно прив'язаними.",
      contactSupport: "Написати в підтримку",
    },
    overview: {
      eyebrow: "Кабінет учасника",
      closedTitle: "Приймання заявок закрито",
      openTitle: "Заповніть придбані номінації",
      overallProgress: "Загальний прогрес",
      allSubmitted: "Усі номінації надіслано",
      remainingLabel: "Залишилося номінацій:",
      closesPrefix: "Приймання заявок до",
      closedPrefix: "Приймання заявок закрито",
      daysRemaining: "Залишилося днів",
      daysWord: "дн.",
      untilClose: "до закриття приймання заявок",
      myNominations: "Мої номінації",
      viewAll: "Переглянути всі",
      emptyTitle: "Номінацій поки немає",
      emptyText: "Оплачені номінації з'являться тут після підтвердження оплати.",
      addNominations: "Додати номінації",
    },
    stats: {
      purchased: "Придбано",
      purchasedDetail: "Оплачені номінації в акаунті",
      drafts: "Чернетки",
      draftsDetail: "Збережений прогрес, журі не бачить",
      submitted: "Надіслано",
      submittedDetail: "Видно журі",
      completion: "Заповнено",
      completionDetail: "У середньому за номінаціями",
    },
    widgets: {
      quickActions: "Швидкі дії",
      continueLatest: "Продовжити останню номінацію",
      addNominations: "Додати номінації",
      openTickets: "Відкрити квитки",
      editProfile: "Відкрити профіль",
      reminder: "Важливе нагадування",
      close: "Приймання заявок закривається",
      closed: "Приймання заявок закрито",
      closedText: "Надіслані номінації доступні лише для читання на час оцінювання.",
      daysRemainingLabel: "Залишилося днів:",
      supportTitle: "Дякуємо, що ви частина спільноти IBPA.",
      supportText: "Нам не терпиться побачити вашу роботу. Якщо щось незрозуміло — команда радо допоможе.",
      contactSupport: "Написати в підтримку",
    },
    card: {
      progress: "Прогрес",
      updated: "Оновлено",
      view: "Відкрити",
      start: "Почати",
      continue: "Продовжити",
      allComplete: "Усі обов'язкові поля заповнено",
      missingLabel: "Бракує обов'язкових полів:",
    },
    nominationsPage: {
      title: "Мої номінації",
      purchasedWord: "придбано",
      draftWord: "у чернетках",
      submittedWord: "надіслано",
      visibilityNote: "Придбані номінації та чернетки не видно журі до надсилання.",
    },
    profile: {
      title: "Профіль",
      description:
        "Ці дані додаються до кожної надісланої номінації. Щоб виправити їх, напишіть у підтримку.",
      verifiedMember: "Підтверджений учасник",
      phone: "Телефон",
      professionalTitle: "Професійний статус",
      yearsExperience: "Стаж роботи",
      country: "Країна",
      stateProvince: "Штат / регіон",
      city: "Місто",
      membership: "Членство IBPA",
      membershipNumber: "Номер учасника",
      membershipLevel: "Рівень членства",
      verified: "Підтверджено",
      notVerified: "Не підтверджено",
      publicLinks: "Публічні посилання",
      website: "Сайт",
      socialProfile: "Соцмережі",
      reviews: "Відгуки",
      linksNote: "Посилання можуть бути показані журі разом із вашими номінаціями.",
      notSet: "Не вказано",
    },
    tickets: {
      title: "Квитки",
      description:
        "Ваш доступ на форум і гала-вечерю. Квитки, придбані на цей email, з'являються тут автоматично після оплати.",
      emptyTitle: "Квитки не знайдено",
      emptyText: "Квитки, придбані на цей email, з'являться тут після оплати.",
      browseTickets: "Придбати квитки",
      access: "Доступ",
      purchased: "Придбано",
      galaIncluded: "Гала-вечеря включена",
      forumAccess: "Доступ на форум",
      qrPending: "QR-код ще не активний. Він з'явиться тут після випуску вашої перепустки.",
      entryInstructions: "Як пройти на подію",
      stepQrTitle: "Покажіть QR-код",
      stepQrText: "Ваш особистий QR-код сканується один раз на вході в день події.",
      stepBrightTitle: "Зробіть екран яскравішим",
      stepBrightText: "Відкрийте QR-код на весь екран і збільште яскравість, щоб сканування було миттєвим.",
      stepMailTitle: "Візьміть підтвердження",
      stepMailText: "Квиток прив'язано до email, вказаного під час купівлі. Копію надіслано вам на пошту.",
    },
  },
  common: {
    applyNow: "Подати заявку",
    applyAsParticipant: "Подати заявку учасника",
    applyAsJury: "Подати заявку судді",
    browseCategories: "Дивитись Категорії",
    juryAccount: "Кабінет судді",
    jury: "Журі",
    categories: "Категорії",
    grandPrix: "Гран-прі",
    home: "Головна",
    from: "від",
  },
  header: {
    navigation: {
      home: "Головна",
      categories: "Категорії",
      jury: "Журі",
      grandPrix: "Гран-прі",
    },
    openMenu: "Відкрити меню",
    closeMenu: "Закрити меню",
    language: "Мова",
  },
  home: {
    hero: {
      eyebrow: "Галузева конференція лідерів",
      title: "IBPA Beauty Award 2026",
      subtitle: "Beauty Business Forum + IBPA Beauty Award 2026",
      date: "25–26 вересня 2026",
      location: "950 South Broadway, Los Angeles, CA 90015",
      buyTickets: "Купити квитки на форум",
      description: "Визнання видатних досягнень у сфері краси, освіти у сфері краси, здоров'я та інновацій у брендингу",
      categoriesCta: "Переглянути категорії",
      ticker: [
        "IBPA Beauty Award 2026",
        "Міжнародне визнання",
        "Професійна майстерність",
        "11 категорій",
        "Міжнародне журі",
        "Відкрито для всього світу",
      ],
    },
    awardsInfo: {
      eyebrow: "Про премію",
      title: "IBPA Beauty Awards 2026",
      text: "IBPA Beauty Awards 2026 — міжнародна премія у сфері краси, освіти та beauty-бізнесу, що проводиться в межах IBPA Beauty Business Forum. Наша місія — визнавати видатних спеціалістів, підтримувати професійний розвиток і об’єднувати лідерів індустрії для обміну досвідом, інноваціями та новими можливостями зростання.",
    },
    threeExperiences: {
      eyebrow: "Одна подія",
      title: "Три потужні напрями",

      forum: {
        title: "Beauty Business Forum",
        subtitle: "Знання. Зв'язки. Зростання.",
        bullets: [
          "Виступи успішних підприємців та експертів індустрії краси.",
          "Практичні стратегії розвитку та масштабування бізнесу.",
          "Нетворкінг із власниками салонів, брендами та лідерами ринку.",
          "Простір для нових партнерств, ідей та можливостей."
        ],
        footer:
          "Для фахівців, викладачів, власників бізнесу та брендів, які прагнуть професійного розвитку, сильного оточення та нових можливостей."
      },

      awards: {
        title: "IBPA Beauty Awards 2026",
        subtitle: "Визнання. Статус. Можливості.",
        bullets: [
          "Міжнародна премія для найкращих спеціалістів індустрії краси.",
          "Незалежне оцінювання робіт міжнародною колегією експертів.",
          "Можливість зміцнити професійну репутацію та особистий бренд.",
          "Нагороди, що підтверджують високий рівень майстерності та професіоналізму."
        ],
        footer:
          "Для фахівців, викладачів, власників бізнесу та брендів, які прагнуть отримати визнання своїх досягнень та зміцнити свої позиції на ринку."
      },

      exhibition: {
        title: "Виставка брендів",
        subtitle: "Інновації. Партнерство. Розвиток.",
        bullets: [
          "Новинки продукції та технологій індустрії краси.",
          "Спілкування з представниками провідних брендів.",
          "Тестування продукції та професійні консультації.",
          "Спеціальні пропозиції та нові ділові контакти."
        ],
        footer:
          "Для фахівців та власників бізнесу, які хочуть бути в курсі трендів та знаходити нові можливості для розвитку."
      }
    },
    registrationSection: {
      eyebrow: "Участь",
      title: "Усе необхідне для участі",

      registration: {
        title: "Період реєстрації",
        date: "1 червня – 8 липня 2026",
        description:
          "Прийом заявок триває з 1 червня до 8 липня 2026 року включно."
      },

      tabs: {
        tickets: "Форум",
        awards: "Премія",
        jury: "Журі"
      },

      tickets: {
        title: "Beauty Business Forum",
        price: "$395",
        suffix: "від / день",
        description:
          "Розвиток бізнесу, нетворкінг, освіта та нові можливості.",
        cta: "Купити квиток",

        items: [
          ["1 день форуму", "$395"],
          ["2 дні форуму", "$695"],
          ["Гала-вечеря", "$150"]
        ]
      },

      cta: "Подати заявку",

      registrationInfo: {
        eyebrow: "Період реєстрації",
        value: "2 липня – 10 серпня 2026",
        text: "Прийом заявок на участь здійснюється з 1 червня до 8 липня 2026 року включно.",
      },

      feeInfo: {
        eyebrow: "Реєстраційний внесок",
        value: "$50+",
        text: "Вартість участі сплачується окремо за кожну обрану номінацію.",
      },

      juryInfo: {
        eyebrow: "Реєстрація судді",
        value: "$100+",
        text: "Подати заявку до суддівської колегії можуть спеціалісти з досвідом роботи від 5 років. Реєстраційний внесок сплачується лише після схвалення кандидатури.",
      },

      participationInfo: {
        eyebrow: "Участь",
        value: "Відкрита для всіх",
        text: "Подати заявку на участь можуть спеціалісти всіх рівнів без обмежень за країною чи стажем.",
      },

      grandPrixInfo: {
        eyebrow: "Гран-прі",
        value: "5+",
        text: "Учасники, які подали заявки у 5 або більше номінаціях, автоматично беруть участь у категорії Гран-прі.",
      },

      pricing: {
        eyebrow: "Вартість",
        title: "Вартість участі",
        description:
          "Квитки на форум, номінації премії та реєстрація суддів оплачуються окремо. Вартість форуму й премії відрізняється для учасників IBPA та гостей.",

        option: "Опція",
        members: "IBPA Учасники",
        standard: "Гості",
        nonMembers: "Без участі",
        memberPricingNote: "Спеціальні ціни для учасників IBPA",
        awardPricingNote: "Заощаджуйте більше з пакетами для подання кількох заявок.",
        memberDiscountNote: "Учасники IBPA можуть зареєструватися за пільговою ціною.",
        mostPopular: "Популярне",

        forum: {
          eyebrow: "Квитки",
          title: "Квитки на форум",
          oneDay: "1 день форуму",
          twoDays: "2 дні форуму",
          galaDinner: "Гала-вечеря",
        },

        award: {
          eyebrow: "Премія",
          title: "Номінації премії",
          oneNomination: "1 номінація",
          threeNominations: "3 номінації",
          fiveNominations: "5 номінацій",
          note: "Участь у Гран-прі активується автоматично для учасників із 5 або більше номінаціями.",
        },

        jury: {
          eyebrow: "Журі",
          title: "Реєстрація судді",
          member: "Учасник IBPA",
          standard: "Гості",
        },

        ctaEyebrow: "Готові долучитися",
        ctaTitle: "Почніть заявку IBPA 2026",
        ctaText:
          "Оберіть відповідний формат участі та подайте заявку онлайн.",
      },
      awards: {
        title: "IBPA Beauty Awards",
        price: "$50",
        suffix: "за номінацію",
        description:
          "Визнання, професійний статус та нові можливості.",
        cta: "Подати заявку",

        member: "Учасник IBPA",
        standard: "Не учасник",

        rows: [
          ["1 номінація", "$50", "$70"],
          ["3 номінації", "$130", "$190"],
          ["5 номінацій", "$200", "$300"]
        ],

        grandPrixTitle: "Гран-прі",
        grandPrixDescription:
          "Автоматична участь при подачі 5 і більше номінацій."
      },

      jury: {
        title: "Реєстрація журі",
        price: "$100+",
        description:
          "Для спеціалістів з досвідом роботи від 5 років.",
        cta: "Подати заявку",

        points: [
          "Мінімум 5 років професійного досвіду",
          "Міжнародна спільнота журі",
          "Статус експерта індустрії"
        ],

        note:
          "Реєстраційний внесок сплачується лише після схвалення заявки."
      },

      openParticipation: {
        title: "Відкрито для всіх",
        description:
          "Подати заявку можуть спеціалісти будь-якого рівня з будь-якої країни."
      }
    },
    speakersSection: {
      eyebrow: "Спікери форуму",
      title: "Навчайтеся у лідерів індустрії",
      description:
        "Успішні підприємці та експерти beauty-індустрії поділяться практичним досвідом, перевіреними інструментами та стратегіями розвитку бізнесу.",

      readMore: "Детальніше",
      showLess: "Згорнути",
      topicLabel: "Тема",
      presentationLabel: "Презентація",

      speakers: [
        {
          name: "Ярославна Атапіна",
          photo: "/images/speakers/yara-atapina.jpeg",
          role:
            "Власниця двох nail-салонів у Кремнієвій долині (США) та практикуючий nail-майстер із понад 10-річним досвідом. За останні три роки побудувала ефективну бізнес-систему з чіткими процесами, високим рівнем сервісу та командою з 30 співробітників.",
          city: "Сан-Хосе, Каліфорнія, США",
          topic:
            "Система замість хаосу: основи масштабування beauty-бізнесу",
          description:
            "Під час виступу ви дізнаєтесь, як із перших кроків будувати beauty-бізнес не в хаосі, а на системі, що дозволяє стабільно зростати та масштабуватися. Тема буде корисною як майстрам, які планують відкрити власний салон і сформувати команду, так і власникам студій, які прагнуть вибудувати сильні процеси, високий рівень сервісу та ефективне управління командою. Я поділюся інструментами та рішеннями, які щодня працюють у моєму бізнесі.",
          instagram: "https://www.instagram.com/yara.yaroslavna?igsh=NTc4MTIwNjQ2YQ==",
          website: ""
        },
        {
          name: "Наталі Ваулін",
          photo: "/images/speakers/natalie-vaulin.jpg",
          role:
            "Засновниця та CEO компанії Vaulabs — американського контрактного виробництва косметики, що спеціалізується на продуктах Clean Beauty. Понад 15 років працює у сфері маркетингу, брендингу та розвитку бізнесу, допомагаючи підприємцям створювати власні beauty-бренди.",
          city: "Тампа, Флорида, США",
          topic:
            "Як створити власний beauty-бренд у США: від ідеї до полиці магазину",
          description:
            "На виступі Наталі представить покрокову систему створення власного beauty-продукту — від перевірки ідеї та розробки формули до вибору пакування, виробництва та підготовки до виходу на ринок. Учасники дізнаються, як уникнути найпоширеніших помилок, приймати правильні рішення на кожному етапі та створювати продукти, готові до масштабування. Виступ базується на реальних кейсах запуску beauty-продуктів у США.",
          instagram: "https://www.instagram.com/natalievaulin",
          website: "https://www.vaulabs.com"
        },
        {
          name: "Гульнара Чекоєва",
          photo: "/images/speakers/gulnara-chekoeva.jpg",
          role:
            "Майстер міжнародного класу, художник-модельєр зачісок, міжнародний суддя та тренер чемпіонатів. Чемпіонка Азії 2025 року, переможниця One Shot Hair Awards (USA), засновниця однієї з найбільших міжнародних онлайн-академій перукарського мистецтва.",
          city: "США",
          topic:
            "Шлях майстра світового рівня: освіта, чемпіонати та побудова міжнародної кар'єри",
          description:
            "Гульнара поділиться досвідом розвитку міжнародної кар'єри у beauty-індустрії, розповість, як створити сильний особистий бренд, вийти на світовий рівень та навчати професіоналів по всьому світу. Вона розкриє принципи створення успішних освітніх програм, підготовки викладачів нового покоління та організації міжнародних чемпіонатів, спираючись на досвід навчання понад 100 000 майстрів і проведення авторських програм у більш ніж 20 країнах.",
          instagram: "https://www.instagram.com/gulnarachekoeva?igsh=NTc4MTIwNjQ2YQ==",
          website: ""
        },
        {
          name: "Eleonora Bediukh",
          photo: "/images/speakers/eleonora-bediukh.jpg",
          role:
            "Бровист і ламі-мейкер, викладач з корекції, фарбування та ламінування брів. Автор книги Brows Top Start, міжнародний суддя, організатор чемпіонату TB Champions, співзасновниця TE’ORA Beauty Corp та beauty-інфлюенсер.",
          city: "Сакраменто, Каліфорнія, США",
          topic:
            "Контент, який продає: система просування beauty-майстра в соціальних мережах без хаосу та вигорання",
          description:
            "Виступ буде корисний бровистам, лешмейкерам, нейл-майстрам, візажистам, косметологам, власникам салонів, викладачам та початківцям. Елеонора покаже, як побудувати зрозумілу контент-стратегію, залучати клієнтів через соціальні мережі без постійного вигорання, створювати контент, який продає, та розвивати особистий бренд. В основі виступу — власний досвід зростання аудиторії з 1 700 до 30 000 підписників лише за шість місяців.",
          instagram: "https://www.instagram.com/elionora.brows?igsh=NTc4MTIwNjQ2YQ==",
          website: ""
        },
        {
          name: "Юлія Маліна",
          photo: "/images/speakers/yulia-malina.png",
          role:
            "AI-стратег, підприємиця та засновниця освітнього проєкту «AI Insiders». Розробляє AI-агентів та інтелектуальні системи для створення контенту, маркетингу й автоматизації бізнес-процесів, допомагаючи підприємцям перейти від хаотичного використання нейромереж до системної роботи з командою спеціалізованих AI-помічників.",
          city: "Маямі, Флорида, США",
          topic:
            "Beauty-бізнес нового покоління: як AI-команда допомагає створювати, продавати та зростати",
          description:
            "Сьогодні штучний інтелект — це вже не один чат і не набір окремих інструментів, а команда спеціалізованих AI-помічників для різних бізнес-завдань. Юлія покаже, як AI-команда допомагає досліджувати ринок, створювати нові послуги, продукти та контент, посилювати маркетинг і комунікацію з клієнтами, аналізувати дані та систематизувати бізнес-процеси. Практичні приклади будуть корисними для майстрів, салонів, студій, викладачів, підприємців і beauty-брендів. Окрему увагу буде приділено тому, які завдання важливо залишити людині, щоб зберегти експертність, індивідуальність і довіру клієнтів.",
          instagram: "https://www.instagram.com/yulia.malina.usa/",
          website: "https://ainsiders.club"
        },
        {
          name: "Ганна Вакулич",
          photo: "/images/speakers/hanna-vakulych.jpg",
          role:
            "Засновниця Magica Beauty LLC (США), міжнародний викладач та експерт beauty-індустрії з понад 25-річним досвідом. Багато років працювала регіональним тренером L'Oréal і Vitality's, є міжнародним суддею чемпіонатів та авторкою власних освітніх методик.",
          city: "США",
          topic:
            "Хто ваш клієнт? Психологія продажів на простих прикладах",
          description:
            "Ганна представить авторську методику визначення типу клієнта, засновану на відомих мультиплікаційних персонажах. Ви отримаєте простий і зрозумілий інструмент, який допоможе з перших хвилин зрозуміти клієнта, легко працювати із запереченнями, будувати довірливу комунікацію та впевнено збільшувати продажі. Методика легко застосовується у щоденній роботі майстрів, викладачів і власників beauty-бізнесу.",
          instagram: "https://www.instagram.com/anna.vakulych.miami?igsh=NTc4MTIwNjQ2YQ==",
          website: ""
        },
        {
          name: "Юлія Байло",
          photo: "/images/speakers/yulia-bailo.jpg",
          role:
            "Сертифікований бізнес-наставник, нейрокоуч, підприємиця з понад 15-річним досвідом ведення бізнесу у США та міжнародна спікерка.",
          city: "США",
          topic:
            "Перед масштабуванням: як виявити вузькі місця та знайти точки зростання в beauty-бізнесі",
          description:
            "Під час виступу учасники дізнаються, з чого починається стале зростання бізнесу, як правильно визначити свої цілі та побачити обмеження, що заважають розвитку й збільшенню прибутку. Юлія покаже найпоширеніші вузькі місця, з якими стикаються власники beauty-бізнесу, та пояснить, на які точки зростання варто звернути увагу ще до інвестування в масштабування. Після виступу учасники зможуть провести первинну діагностику свого бізнесу, визначити, що саме стримує його розвиток, і зрозуміти, які кроки потрібно зробити насамперед для більш системного, стабільного та прибуткового зростання.",
          instagram: "https://www.instagram.com/yuliabailo_coach?igsh=NTc4MTIwNjQ2YQ==",
          website: ""
        },
      ]
    },
    dressCode: {
      eyebrow: "Beauty Business Forum",
      title: "Дрес-код",
      description:
        "Стиль, який підкреслює ваш професіоналізм і створює натхненну атмосферу.",
      image: {
        src: "/images/forum/dress-code.jpg",
        alt: "Приклади дрес-коду Beauty Business Forum",
      },
      colors: [
        {
          label: "Білий",
          value: "#FFFFFF",
        },
        {
          label: "Молочний",
          value: "#E9DCCF",
        },
        {
          label: "Блакитний",
          value: "#B8CDE5",
        },
        {
          label: "Шоколадний",
          value: "#442817",
        },
      ],
      days: [
        {
          eyebrow: "День 1",
          title: "Business Casual",
          description:
            "Елегантний і комфортний діловий образ у білих, молочних, блакитних і шоколадних відтінках.",
        },
        {
          eyebrow: "День 2",
          title: "Business Casual",
          description:
            "Сучасний діловий стиль із витонченими силуетами та гармонійними деталями.",
        },
        {
          eyebrow: "Гала-вечеря",
          title: "Вечірній образ",
          description:
            "Елегантний вечірній образ у вишуканих молочних або шоколадних відтінках.",
        },
      ],
      values: [
        {
          title: "Легкість",
          description: "Стиль і впевненість",
        },
        {
          title: "Вишуканість",
          description: "Гармонія в деталях",
        },
        {
          title: "Сучасність",
          description: "Натхнення та індивідуальність",
        },
        {
          title: "Будьте собою",
          description: "Надихайте. Створюйте.",
        },
      ],
      footer:
        "Будемо раді бачити вас у стилі нашого форуму!",
    },
    previousForum: {
      eyebrow: "Попередній івент",
      title: "Beauty Business Forum 2025",
      award: "Премія Top Beauty Master",
      date: "7–8 листопада 2025",
      location: "Сан-Франциско, Каліфорнія",
      videoLabel: "Відео форуму",
      quote:"Згадуємо атмосферу, професійну спільноту та ключові моменти індустрії, які стали частиною попереднього форуму.",
      videoTitle: "Відео Beauty Business Forum 2025",
      playLabel: "Відтворити",
      pauseLabel: "Пауза",
      muteLabel: "Вимкнути звук",
      unmuteLabel: "Увімкнути звук",
    },
    previousWinners: {
      eyebrow: "Переможці попереднього форуму",
      title: "Переможці, які стали частиною Beauty Business Forum 2025",
      prevLabel: "Попередні переможці",
      nextLabel: "Наступні переможці",
      goToLabel: "Перейти до переможця",
    },
    program: {
      eyebrow: "Програма",
      title: "Повна програма скоро з'явиться",
      description:
        "Тут будуть опубліковані спікери, майстер-класи, розклад та багато іншого.",
    },
    speakers: {
      eyebrow: "Спікери",
      title: "Спікерів буде оголошено",
      description: "Склад форуму розкриють ближче до події.",
    },
    partners: {
      eyebrow: "Партнери",
      title: "Наші партнери",
      description:
        "Бренди та організації, що підтримують IBPA Beauty Awards 2026.",
      cta: "Стати партнером",
      items: [
        { name: "Партнер", text: "Одне речення про партнера.", href: "#" },
        { name: "Партнер", text: "Одне речення про партнера.", href: "#" },
        { name: "Партнер", text: "Одне речення про партнера.", href: "#" },
        { name: "Партнер", text: "Одне речення про партнера.", href: "#" },
      ],
    },
    contactUs: {
      eyebrow: "Зв'яжіться з нами",
      title: "Створімо щось виняткове разом",
      description:
        "Якщо у вас є запитання щодо участі, партнерства, спонсорства або участі в IBPA — наша команда із задоволенням допоможе.",

      email: "forum-support@ibpassociations.org",
      note: "Зазвичай ми відповідаємо протягом одного робочого дня.",

      nameLabel: "Повне ім'я",
      namePlaceholder: "Введіть ваше повне ім'я",

      emailLabel: "Email",
      emailPlaceholder: "Введіть вашу електронну пошту",

      subjectLabel: "Тема",
      subjectPlaceholder: "Про що ви хочете поговорити?",

      messageLabel: "Повідомлення",
      messagePlaceholder: "Розкажіть детальніше про ваш запит...",

      submitLabel: "Надіслати повідомлення",
      sendingLabel: "Надсилаємо…",

      privacyNote:
        "Надсилаючи форму, ви погоджуєтесь з нашою політикою конфіденційності.",

      successMessage:
        "Дякуємо! Ваше повідомлення надіслано — ми скоро зв'яжемося з вами.",
      errorMessage:
        "Щось пішло не так. Спробуйте ще раз або напишіть нам напряму.",
      validationMessage:
        "Будь ласка, вкажіть ім'я, коректний email і коротке повідомлення.",
    },
    copy: {
      whyEyebrow: "Чому IBPA Beauty Award 2026",
      whyTitle: "Створено для професійного лідерства у beauty-сфері",
      whyText: "Структурований відбір, прозоре суддівство та міжнародний рівень представлення.",
      heroMediaTitle: "Преміальна редакційна подача",
      heroMediaDescription: "Професійна майстерність у сфері краси на міжнародному рівні.",
      juryStandards: "Стандарти журі",
      juryStandardsTitle: "Офіційне суддівство з довірою, структурою та прозорістю",
      juryBenefit1: "Професійні стандарти та сертифікація",
      juryBenefit2: "Мережа міжнародної співпраці",
      juryBenefit3: "Доступ до світової бьюті-спільноти",
      juryBenefit4: "Визнання в індустрії та видимість",
      eventExperience: "Атмосфера події",
      eventTitle: "Фотографії інтегровані в кожен етап.",
      eventText: "Один головний візуальний акцент і два контекстні кадри.",
      eventPrimaryCaption: "Преміальні акредитації церемонії задають візуальний тон від перших хвилин.",
      eventAudienceCaption: "Жива увага аудиторії та фокус журі впродовж усього програмного шляху.",
      eventDetailCaption: "Трофеї та деталі премії підкреслюють статус і рівень майстерності.",
      eventStageCaption: "Сценічна енергія та ключові моменти категорій у реальному часі.",
      eventAmbienceLabel: "Атмосфера церемонії",
      eventLiveLabel: "Жива аудиторія",
      fullBleedEyebrow: "IBPA 2026",
      fullBleedTitle: "Світова майстерність у сфері краси заслуговує на світову сцену.",
      fullBleedText: "Преміальна платформа для майстрів, викладачів, салонів і брендів.",
      intlRecognition: "Міжнародне визнання",
      judgingIntegrity: "Прозорість і цілісність суддівства",
      whyFeatures: [
        { title: "Міжнародне визнання", text: "Ваша робота отримує оцінку та визнання на міжнародному рівні — серед професіоналів індустрії краси по всьому світу." },
        { title: "Прозора оцінка", text: "Кожна заявка оцінюється офіційним журі IBPA Beauty Award 2026 за чіткими професійними критеріями — чесно та без упередженості." },
        { title: "Структурований відбір", text: "11 категорій і номінації всередині кожної — IBPA Beauty Award 2026 охоплює всі ключові спеціалізації індустрії краси." },
        { title: "Професійне журі", text: "До складу журі IBPA Beauty Award 2026 входять практикуючі спеціалісти з досвідом від 5 років — експерти, які розуміють індустрію зсередини." },
        { title: "Офіційний статус переможця", text: "Переможці та призери IBPA Beauty Award 2026 отримують сертифікати, підтверджуючі документи та публічне визнання на платформі премії." },
        { title: "Гран-прі для кращих", text: "Учасники 5 і більше номінацій автоматично стають номінантами на Гран-прі — найвищу нагороду IBPA Beauty Award 2026." },
      ],
    },
    pricing: {
      award: {
        eyebrow: "Учасники премії",
        title: "Вартість участі",
        ibpaMember: {
          label: "УЧАСНИКИ АСОЦІАЦІЇ IBPA",
          rows: [
            { label: "1 номінація", value: "$50" },
            { label: "3 номінації", value: "$130" },
            { label: "5 номінацій", value: "$200" },
          ],
          grandPrixLabel: "Гран-прі",
          grandPrixNote: "від 5 номінацій — автоматично",
        },
        nonMember: {
          label: "Стандарт",
          rows: [
            { label: "1 номінація", value: "$70" },
            { label: "3 номінації", value: "$190" },
            { label: "5 номінацій", value: "$300" },
          ],
          grandPrixLabel: "Гран-прі",
          grandPrixNote: "від 5 номінацій — автоматично",
        },
      },
      jury: {
        eyebrow: "Суддівський склад",
        title: "Реєстрація судді",
        standard: {
          label: "СТАНДАРТНИЙ ВНЕСОК",
          value: "$250",
          text: "Для спеціалістів з досвідом від 5 років. Внесок сплачується лише після схвалення кандидатури.",
        },
        ibpaTrainer: {
          label: "УЧАСНИКИ АСОЦІАЦІЇ IBPA — ТРЕНЕР І ВИЩЕ",
          value: "$100",
          text: "Спеціальний внесок для учасників асоціації IBPA категорії тренер і вище.",
          note: "Також сплачується після схвалення кандидатури.",
        },
      },
    },
    categoriesPreview: {
      label: "Категорії",
      title: "11 Категорій досконалості в індустрії краси",
      viewAll: "Усі категорії",
      items: [
        "Перукар / стиліст із волосся",
        "Нейл-майстер",
        "Бровіст",
        "Майстер з нарощування вій",
        "Косметолог / естетист",
        "Візажист",
        "Майстер перманентного макіяжу",
        "Фахівець із тіла та здоров'я",
        "Beauty-викладач / тренер",
        "Салон / студія",
        "Бренд",
      ],
    },
    process: {
      label: "Процес премії",
      title: "Як проходить премія IBPA",
      steps: [
        {
          number: "01",
          title: "Виберіть свою категорію",
          text: "Премія охоплює 11 професійних категорій — від майстерності до брендингу. Виберіть ту, яка найближча до вашої сфери діяльності.",
        },
        {
          number: "02",
          title: "Визначте номінацію",
          text: "Усередині кожної категорії – кілька номінацій. Виберіть ту, яка точніше описує вашу спеціалізацію і те, чим ви займаєтеся.",
        },
        {
          number: "03",
          title: "Підтвердьте ваш статус в IBPA",
          text: "Якщо ви акредитований спеціаліст IBPA — вкажіть ID сертифіката для підтвердження та отримання тарифу для учасників IBPA.",
        },
        {
          number: "04",
          title: "Заповніть заявку та завантажте матеріали",
          text: "Заповніть основну форму та прикріпіть матеріали, що відповідають вибраній категорії та номінації.",
        },
        {
          number: "05",
          title: "Надішліть заявку та сплатіть внесок",
          text: "Для учасників IBPA — від $50 за номінацію, для учасників без участі в асоціації — від $70. Участь у 5+ номінаціях автоматично включає вас до Гран-прі.",
        },
      ],
    },
    grandPrix: {
      label: "Гран-прі",
      title: "Гран-прі IBPA 2026",
      text1:
        "Найвища нагорода за видатний результат, яку отримують учасники з найкращим сумарним результатом у 5 або більше номінаціях.",
      text2:
        "Гран-прі визнає загальний результат у кількох номінаціях. Учасник стає номінантом, якщо бере участь у 5 або більше номінаціях - в одному або кількох категорій.",
      cta: "Докладніше про Гран-прі",
    },
    juryCta: {
      label: "Журі",
      title: "Подайте заявку, щоб стати офіційним суддею премії IBPA 2026",
      text1: "Кандидати до складу журі проходять професійний відбір.",
      text2:
        "Подайте заявку на посаду судді — її розгляне експертна комісія IBPA. У разі схвалення ви отримаєте запрошення та посилання для оплати реєстраційного внеску: $250 для всіх спеціалістів або $100 для акредитованих спеціалістів IBPA категорії тренер і вище.",
      text3:
        "Після оплати суддя отримує офіційне підтвердження, комплект документів і публічний профіль на сторінці журі.",
      button: "Подати заявку на посаду судді",
    },
    faq: {
      label: "Питання",
      title: "Поширені запитання",
      items: [
        {
          q: "Скільки коштує участь?",
          a: "Реєстраційний внесок становить $50 за кожну вибрану категорію.",
        },
        {
          q: "Хто може брати участь?",
          a: "Подати заявку на участь у премії можуть усі активні учасники асоціації IBPA.",
        },
        {
          q: "Чи можна подати заявку до журі?",
          a: "Так. Кандидати проходять відбір, а внесок $250 сплачується тільки після схвалення.",
        },
        {
          q: "Як працює Гран-прі?",
          a: "Участь формується автоматично, якщо учасник бере участь у 5 або більше номінаціях.",
        },
      ],
    },
    cta: {
      label: "Готові брати участь?",
      title: "Ваше місце серед найкращих",
      text: "Підготуйте портфоліо, виберіть номінацію та подайте заявку на офіційну оцінку журі IBPA. Визнання починається з одного кроку.",
      judge: "Стати суддею",
    },
    forum: {
      eyebrow: "IBPA BEAUTY AWARD 2026",
      title: "IBPA BEAUTY AWARD 2026",
      description: "Міжнародна зустріч лідерів б'юті-індустрії, що об'єднує нагородження, професійну освіту, ділові зв'язки та урочистий Гала-вечір — все в одній преміальній події.",
    },
    participation: {
      eyebrow: "Оберіть участь",
      description: "Відвідайте форум, поспілкуйтеся з експертами краси та приєднайтеся до основної бізнес-програми IBPA.",
      tickets: {
        label: "КВИТКИ НА ФОРУМ",
        mostPopular: "Найпопулярніше",
        features: "1 день · 2 дні · Гала-вечеря",
        cta: "Придбати квитки",
      },
      award: {
        label: "УЧАСТЬ У КОНКУРСІ",
        description: "Представте свою роботу для міжнародного визнання.",
        cta: "Подати заявку",
      },
      judge: {
        label: "РЕЄСТРАЦІЯ СУДДІ",
        description: "Приєднайтесь до офіційного складу журі.",
        cta: "Зареєструватися",
      },
    },
    pricingSection: {
      eyebrow: "Вартість участі",
      title: "Прозоре ціноутворення для кожного шляху",
      forumTickets: "Квитки на форум",
      awardParticipation: "Участь у конкурсі",
      judgeRegistration: "Реєстрація судді",
      standard: "Стандарт",
      ibpaMembers: "Учасники",
      nonMembers: "Не учасники",
      oneDayPass: "1 день",
      twoDayPass: "2 дні",
      galaDinner: "Гала-вечеря",
      oneNomination: "1 номінація",
      threeNominations: "3 номінації",
      fiveNominations: "5 номінацій",
      grandPrixNote: "5+ номінацій автоматично кваліфікують на Гран-прі.",
      judgePaidAfterApproval: "Оплачується після схвалення",
      mostPopular: "Найпопулярніше",
      startingFrom: "Від",
      from: "Від",
      perPerson: "/ особа",
      perNom: "/ ном.",
      fee: "Внесок",
      perJudge: "/ суддя",
    },
    grandPrixSpotlight: {
      eyebrow: "Гран-прі",
      title: "ГРАН-ПРІ",
      description: "Учасники, які подають 5 або більше номінацій, автоматично змагаються за Гран-прі — найвищу відзнаку IBPA BEAUTY AWARD 2026.",
      cta: "Подати заявку на участь",
      learnMore: "Докладніше",
      stats: [
        { value: "5+", label: "Номінацій" },
        { value: "Авто", label: "Кваліфікація" },
      ],
    },
    whyAttend: {
      eyebrow: "Чому варто брати участь",
      items: [
        {
          title: "Ділові зв'язки",
          description: "Знайомтеся з професіоналами, будуйте партнерства та розвивайте бізнес на міжнародному рівні.",
        },
        {
          title: "Освітні сесії",
          description: "Здобувайте знання від експертів індустрії та інноваційних лідерів, які формують майбутнє краси.",
        },
        {
          title: "Міжнародне визнання",
          description: "Продемонструйте свій талант і отримайте світове визнання на найвищому рівні.",
        },
        {
          title: "Церемонія нагородження",
          description: "Відсвяткуйте досконалість у незабутній вечір із кращими представниками б'юті-індустрії.",
        },
      ],
    },
    finalCta: {
      eyebrow: "Приєднуйтесь до IBPA BEAUTY AWARD 2026",
      title: "Готові приєднатися до IBPA BEAUTY AWARD 2026?",
      buyTicket: "Купити квиток",
      applyAward: "Подати заявку",
      registerJudge: "Реєстрація судді",
    },
  },
  categoriesPage: {
    hero: {
      eyebrow: "Категорії премії",
      title: "11 категорій переваги в промисловості краси",
      description: "Промисловість краси - це не одна професія, а ціла екосистема майстерності. Ми виділили 11 категорій, щоби кожна спеціалізація отримала чесну, професійну оцінку. Артистизм, освіта, догляд за шкірою, управління брендом - кожна категорія оцінюється окремим журі за чіткими критеріями. Виберіть свою категорію та подайте заявку.",
      entryRules: "Правила участі",
      feeLabel: "Реєстраційний внесок",
      feeValue: "$50 за категорію",
      eligibilityLabel: "Участь",
      eligibilityValue: "Для учасників IBPA Beauty Award 2026",
      cta: "Подати заявку за категорією",
    },
    participation: {
      eyebrow: "Як взяти участь",

      title:
        "Міжнародна премія для професіоналів, які формують майбутнє індустрії краси.",

      description:
        "Прозоре оцінювання, структурований відбір та міжнародне визнання для спеціалістів, викладачів, клінік, академій, салонів і beauty-бізнесу.",

      steps: [
        {
          number: "01",
          title: "Заповніть заявку",
        },
        {
          number: "02",
          title: "Оберіть свою категорію",
        },
        {
          number: "03",
          title: "Визначте номінацію",
        },
        {
          number: "04",
          title:
            "Вкажіть особисті дані, завантажте фото й відео та детально опишіть свої досягнення",
        },
        {
          number: "05",
          title: "Оплатіть участь",
        },
        {
          number: "06",
          title: "Подайте заявку до 10 серпня 2026 року",
        },
      ],

      doneTitle: "Готово!",

      doneDescription:
        "Вашу роботу оцінюватиме міжнародна колегія суддів.",
    },
    whyJoin: {
      eyebrow: "Чому варто долучитися",
      title: "Чому варто взяти участь в IBPA Beauty Awards",
      benefits: [
        "Міжнародне визнання ваших професійних досягнень.",
        "Оцінювання робіт міжнародною колегією експертів.",
        "Підвищення довіри клієнтів і зміцнення особистого бренду.",
        "Можливість отримати статус переможця або призера IBPA Beauty Awards 2026.",
        "Публікація та просування найкращих учасників у професійній спільноті.",
        "Немає потреби бути присутнім особисто — участь проходить онлайн.",
      ],
      grandPrixEyebrow: "Правило Гран-прі",
      grandPrixTitle: "5+ номінацій — і ви в Гран-прі",
      grandPrixDescription:
        "Подайте заявки у 5 або більше номінацій — і ви автоматично стаєте номінантом на Гран-прі IBPA. Без додаткових заявок.",
      grandPrixBadge: "Шанс виграти трофей Гран-прі",
    },
    cardText: "Професійні заявки розглядаються в межах офіційної премії IBPA Beauty Award 2026.",
    directions: [
      {
        slug: "hair",
        title: "Волосся",
        nominations: [
          "Премія за видатні досягнення у техніці фарбування волосся",
          "Премія за видатні досягнення у барберингу",
          "Премія за видатні досягнення у відновленні волосся",
          "Премія за видатні досягнення у сфері нарощування волосся"
        ],
      },
      {
        slug: "nail",
        title: "Нігті",
        nominations: [
          "Премія за видатні досягнення у манікюрі",
          "Премія за видатні досягнення у нарощуванні нігтів",
          "Премія за видатні досягнення у подології",
        ],
      },
      {
        slug: "brow",
        title: "Брови",
        nominations: [
          "Премія за видатні досягнення у ламінуванні брів",
          "Премія за видатні досягнення у стайлінгу та дизайні брів",
        ],
      },
      {
        slug: "lash",
        title: "Нарощування та Ламінування Вій",
        nominations: [
          "Премія за видатні досягнення в класичному нарощуванні вій",
          "Премія за видатні досягнення в об’ємному нарощуванні вій",
          "Премія за видатні досягнення в креативному дизайні нарощування вій",
          "Премія за видатні досягнення в ламінуванні вій",
        ],
      },
      {
        slug: "skin-cosmetology-facial",
        title: "Догляд за Шкірою, Косметологія та Обличчя",
        nominations: [
          "Премія за видатні досягнення в неінвазивному омолодженні",
          "Премія за видатні досягнення в антивіковому догляді за обличчям",
          "Премія за видатні досягнення в лікуванні акне",
        ],
      },
      {
        slug: "makeup-artistry",
        title: "Мистецтво Макіяжу",
        nominations: [
          "Премія за видатні досягнення у весільному макіяжі",
          "Премія за видатні досягнення у креативному макіяжі",
          "Премія за видатні досягнення у віковому макіяжі",
          "Премія за видатні досягнення у денному макіяжі",
        ],
      },
      {
        slug: "permanent-makeup",
        title: "Перманетний Макіяж",
        nominations: [
          "Премія за видатні досягнення у перманентному макіяжі брів",
          "Премія за видатні досягнення у техніці перманентної стрілки повік",
          "Премія за видатні досягнення у перманентному макіяжі губ",
          "Премія за видатні досягнення у камуфляжі та корекції",
        ],
      },
      {
        slug: "body-wellness-nutrition",
        title: "Тіло, Велнес і Нутріціологія",
        nominations: [
          "Премія за видатні досягнення у трансформації тіла",
          "Премія за видатні досягнення у скульптурному масажі",
          "Премія за видатні досягнення у нутриціології та корекції харчування",
          "Премія за видатні досягнення в антицелюлітному догляді",
        ],
      },
      {
        slug: "education",
        title: "Навчання",
        nominations: [
          "Премія за видатні досягнення у професійному навчанні в індустрії краси",
          "Премія за видатні досягнення в онлайн-навчанні в індустрії краси",
        ],
      },
      {
        slug: "salon",
        title: "Салон",
        nominations: [
          "Премія за видатні досягнення в інноваціях б’юті-салону",
          "Премія за видатні досягнення у розвитку б’юті-бізнесу",
        ],
      },
      {
        slug: "brand",
        title: "Бренд",
        nominations: [
          "Премія за видатні досягнення у розробці професійної б’юті-продукції",
          "Премія за видатні досягнення у розвитку б’юті-бренду",
          "Інноваційна премія в індустрії краси",
        ],
      },
    ],
    copy: {
        nominationSingular: "номінація",
        nominationPlural: "номінації",
        heroMediaTitle: "Глибина категорії та жива енергія події",
        association: "Асоціація",
        associationTitle: "IBPA — міжнародна спільнота професіоналів індустрії краси",
        associationText: "IBPA об’єднує сильних і перспективних фахівців індустрії краси з усього світу. Наша місія — підтримувати розвиток професійних стандартів та формувати культуру відповідальності, етики й професіоналізму у сфері краси.",
        associationQuote: "Асоціація співпрацює з майстрами, викладачами, салонами та брендами — усіма, хто прагне відповідати високим стандартам якості та професійної культури.",
        associationButton: "Перейти до асоціації IBPA",
        ctaEyebrow: "Подача за категорією",
        ctaTitle: "Готові продемонструвати свою професійну майстерність?",
        ctaText: "Виберіть свою номінацію та станьте частиною IBPA Beauty Awards 2026 — міжнародної премії, створеної для визнання видатних досягнень спеціалістів, викладачів, власників бізнесу та брендів індустрії краси.",
        ctaButton: "Реєстрація",
    },
    awardResults: {
      eyebrow: "Результати премії",
      title: "Результати премії",
      timeline: {
        applicationsOpen: {
          label: "Прийом заявок відкрито",
          date: "2 липня",
          sub: "2026",
        },
        registrationCloses: {
          label: "Реєстрація завершується",
          date: "10 серпня",
          sub: "2026",
        },
        awardCeremony: {
          label: "Церемонія нагородження",
          date: "26 вересня",
          sub: "Beauty Business Forum",
        },
      },
      jury: {
        title: "Міжнародне журі",
        note: "До складу журі входять міжнародні тренери та провідні експерти галузі.",
        points: [
          "Міжнародні експерти",
          "Незалежне оцінювання",
          "Професійна система оцінювання",
        ],
      },
      pricing: {
        eyebrow: "Вартість участі",
        headers: {
          nominations: "Номінації",
          members: "Учасники",
          nonMembers: "Стандарт",
        },
        oneNomination: {
          label: "1 номінація",
          member: "$50",
          nonMember: "$70",
        },
        threeNominations: {
          label: "3 номінації",
          member: "$130",
          nonMember: "$190",
        },
        fiveNominations: {
          label: "5 номінацій",
          member: "$200",
          nonMember: "$300",
        },
        grandPrixEligibility: "Участь у Гран-прі",
        nonRefundable:
          "Реєстраційний внесок не повертається після подання заявки.",
      },
    },
    faq: {
      eyebrow: "Питання",
      title: "Часті запитання",
      items: [
        {
          question: "Хто може взяти участь у IBPA Beauty Awards 2026?",
          answer:
            "До участі запрошуються спеціалісти, викладачі, власники бізнесу, академії, студії, салони та бренди індустрії краси.",
        },
        {
          question: "Чи обов'язково проживати у США для участі?",
          answer:
            "Ні. У премії можуть брати участь кандидати з будь-якої країни світу.",
        },
        {
          question: "Як проходить участь у премії?",
          answer:
            "Учасники подають заявку та конкурсні матеріали через онлайн-форму. Оцінювання робіт проводить міжнародна колегія суддів.",
        },
        {
          question: "Чи потрібно бути присутнім на церемонії нагородження?",
          answer:
            "Ні. Участь у премії та оцінювання робіт відбуваються незалежно від присутності на церемонії.",
        },
        {
          question: "Скільки робіт можна подати?",
          answer:
            "Учасник може подати кілька робіт і брати участь у кількох категоріях.",
        },
        {
          question: "Чи можна подати одну роботу в кілька категорій?",
          answer:
            "Так, якщо робота відповідає вимогам обраних категорій.",
        },
        {
          question: "Коли завершується прийом заявок?",
          answer:
            "Прийом заявок відкритий з 1 червня по 8 липня 2026 року включно.",
        },
        {
          question: "Коли будуть оголошені результати?",
          answer:
            "Результати будуть оголошені під час IBPA Beauty Awards 2026 та опубліковані на офіційних ресурсах премії.",
        },
        {
          question: "Що отримують переможці та призери?",
          answer:
            "Переможці та призери отримують офіційні нагороди, сертифікати та публікації в рамках премії.",
        },
        {
          question: "Чи можу я подати заявку, якщо працюю менше 5 років?",
          answer:
            "Так, якщо обрана категорія не передбачає вимог до мінімального стажу роботи.",
        },
        {
          question: "Чи повертається реєстраційний внесок?",
          answer:
            "Ні. Реєстраційний внесок є неповоротним після подачі заявки.",
        },
      ],
    },
  },
  juryPage: {
    hero: {
      eyebrow: "IBPA Beauty Award 2026",
      title: "Подайте заявку, щоб стати офіційним суддею премії IBPA 2026",
      description:
        "Кандидати до складу журі проходять професійний відбір. Спочатку подається заявка, після чого її розглядає експертна комісія. У разі схвалення кандидат отримує запрошення та посилання для оплати реєстраційного внеску $250.",
      requirements: "Переглянути вимоги",
      overview: "Огляд для журі",
      experience: "Досвід",
      experienceValue: "5+ років",
      review: "Розгляд",
      reviewValue: "До 14 робочих днів",
      fee: "Внесок",
      feeValue: "$250",
      feeNote: "Сплачується тільки після схвалення",
    },
    about: {
      eyebrow: "Про премію",
      title: "IBPA Beauty Awards 2026",
      description:
        "IBPA Beauty Awards 2026 — міжнародна премія у сфері краси, створена для визнання професіоналізму, таланту та видатних досягнень спеціалістів, викладачів, власників бізнесу та брендів.",
      recognition:
        "Премія відзначає сильні професійні результати, експертність, креативність і внесок у розвиток індустрії краси.",
      objectiveEvaluation:
        "Суддівська колегія відіграє ключову роль у забезпеченні об’єктивної, чесної та професійної оцінки конкурсних робіт.",
      trust:
        "Завдяки експертному суддівству журі формує довіру до премії та посилює її міжнародний статус.",
    },
    timeline: {
      eyebrow: "Період суддівства",
      title: "Важливі дати",
      formatLabel: "Формат суддівства",
      formatValue: "Онлайн",
      yearLabel: "Рік",
      year: "2026",
      items: [
        {
          label: "Подача заявок до суддівської колегії",
          title: "Прийом заявок",
          date: "1 червня – 8 липня ",
        },
        {
          label: "Період оцінювання конкурсних робіт",
          title: "Оцінювання робіт",
          date: "16 серпня – 5 вересня ",
        },
        {
          label: "Фінал і оголошення результатів",
          title: "Оголошення результатів",
          date: "26 вересня ",
        },
      ],
    },
    gallery: {
      eyebrow: "Моменти форуму",
      title: "Атмосфера спільноти IBPA",
      description:
        "Візуальний погляд на атмосферу, гостей, професіоналів і моменти, які роблять IBPA Beauty Business Forum особливим.",
      prevLabel: "Попереднє фото",
      nextLabel: "Наступне фото",
      goToLabel: "Перейти до фото",
      photoAlt: "Фото IBPA Forum",
    },
    requirements: {
      label: "Хто може стати суддею",
      title: "Вимоги до кандидатів",
      description:
        "Суддівська колегія формується з досвідчених професіоналів, здатних забезпечити чесну, об’єктивну та експертну оцінку конкурсних робіт.",
      items: [
        {
          label: "Досвід",
          text: "Досвід роботи в індустрії краси від 5 років.",
        },
        {
          label: "Експертиза",
          text: "Підтверджена професійна експертиза у своїй категорії.",
        },
        {
          label: "Документи",
          text: "Наявність сертифікатів, дипломів, ліцензій або інших підтверджувальних документів.",
        },
        {
          label: "Професійна діяльність",
          text: "Викладацька, конкурсна або експертна діяльність вітається.",
        },
        {
          label: "Досвід суддівства",
          text: "Досвід суддівства бажаний, але не є обов’язковим.",
        },
        {
          label: "Стандарти",
          text: "Готовність дотримуватися регламенту, конфіденційності та принципів об’єктивного оцінювання.",
        },
      ],
    },
    responsibilities: {
      eyebrow: "Роль судді в премії",
      title: "Що входить в обов'язки судді",
      items: [
        "Оцінювання конкурсних робіт відповідно до затверджених критеріїв премії.",
        "Розгляд робіт лише у своїй професійній категорії.",
        "Виставлення об'єктивних і незалежних оцінок на основі досвіду та експертизи.",
        "Дотримання конфіденційності конкурсних матеріалів, учасників і результатів.",
        "Робота у встановлені строки через онлайн-формат суддівства.",
        "Підтвердження підсумкових оцінок та участь у формуванні справедливих результатів премії.",
      ],
    },
    feeCard: {
      eyebrow: "Реєстраційний внесок",
      title: "Вартість участі у складі журі",
      standardLabel: "Стандарт",
      standardPrice: "$250",
      membersLabel: "Учасники",
      membersPrice: "$100",
      note: "Реєстраційний внесок сплачується лише після схвалення кандидатури та є неповоротним.",
    },
    process: {
      label: "Процес",
      title: "Як проходить заявка до журі",
      steps: [
        {
          number: "01",
          title: "Подайте заявку",
          text: "Заповніть форму заявки до журі та завантажте всі потрібні матеріали.",
        },
        {
          number: "02",
          title: "Розгляд IBPA Beauty Award 2026",
          text: "Ваш професійний досвід, кваліфікація та документи проходять перевірку.",
        },
        {
          number: "03",
          title: "Отримайте рішення",
          text: "Схвалені кандидати отримують офіційний лист із наступними кроками.",
        },
        {
          number: "04",
          title: "Сплатіть внесок",
          text: "Тільки схвалені кандидати отримують запрошення оплатити внесок журі $250.",
        },
        {
          number: "05",
          title: "Увійдіть до складу журі",
          text: "Після підтвердження оплати ви стаєте офіційним учасником журі.",
        },
      ],
    },
    faq: {
      label: "Поширені запитання",
      title: "FAQ",
      items: [
        {
          question: "Суддівство проходить онлайн?",
          answer:
            "Так, усі конкурсні роботи оцінюються дистанційно через особистий кабінет судді.",
        },
        {
          question:
            "Коли я дізнаюся результат розгляду моєї заявки до суддівської колегії?",
          answer:
            "Після перевірки професійного досвіду та документів кандидат отримує повідомлення з рішенням комісії.",
        },
        {
          question: "Чи потрібно бути присутнім на церемонії нагородження?",
          answer:
            "Ні, присутність на церемонії не є обов’язковою.",
        },
        {
          question: "Чи передбачена фінансова винагорода?",
          answer:
            "Ні, участь у суддівській колегії здійснюється на добровільній основі.",
        },
        {
          question: "Коли я отримаю доступ до робіт?",
          answer:
            "Після завершення прийому заявок і затвердження списку конкурсних робіт.",
        },
        {
          question: "Чи можу я бути суддею, якщо живу не в США?",
          answer:
            "Так, до складу журі можуть входити спеціалісти з різних країн.",
        },
        {
          question: "Чи обов’язково мати досвід суддівства?",
          answer:
            "Досвід суддівства вітається, але не є обов’язковою вимогою. За відсутності досвіду суддівства кандидат повинен мати значні професійні досягнення, викладацький, конкурсний або експертний досвід, що підтверджує високий рівень кваліфікації та розуміння процесу професійного оцінювання робіт.",
        },
        {
          question: "Скільки часу займає оцінювання робіт?",
          answer:
            "Кількість робіт залежить від категорії. Процес організований так, щоб суддівство можна було пройти комфортно у встановлені строки.",
        },
      ],
    },
    cta: {
      label: "Журі",
      title: "Подайте заявку, щоб стати офіційним суддею премії IBPA 2026",
      text: "Кандидати до складу журі проходять професійний відбір. Після схвалення судді отримують офіційне підтвердження, комплект документів і публічний профіль на сторінці журі.",
      button: "Подати заявку на посаду судді",
    },
    apply: {
      eyebrow: "Заявка до журі",
      title: "Подайте заявку, щоб стати суддею премії IBPA 2026",
      text: "Представте свій професійний профіль, досвід і категорії спеціалізації для відбору до складу журі.",
    },
    copy: {
      heroEyebrow: "Рада журі IBPA Beauty Award 2026",
      heroTitle: "Станьте офіційним суддею IBPA Beauty Award 2026",
      heroText: "Преміальний склад журі для чесного, експертного та міжнародно визнаного суддівства.",
      leadershipTitle: "Лідерство, довіра та незалежні стандарти",
      credibility: "Довіра",
      credibilityText: "Кожен суддя має підтвердити професійний досвід і експертизу за категоріями.",
      processLabel: "Процес відбору",
      processTitle: "Три кроки до статусу судді",
      processText: "Зрозумілий шлях від подання до офіційного включення до складу журі.",
      apply: "Подання заявки",
      approved: "Розгляд і схвалення",
      registration: "Оплата та підтвердження",
      applyText: "Надішліть професійний профіль, досвід роботи та необхідні матеріали для розгляду комісією IBPA Beauty Award 2026.",
      approvedText: "IBPA Beauty Award 2026 оцінює вашу експертизу та професійну відповідність. При схваленні ви отримуєте офіційне запрошення.",
      registrationText: "Схвалені кандидати сплачують реєстраційний внесок і отримують офіційний статус судді, сертифікат і публічний профіль на сайті премії.",
      benefitsEyebrow: "Переваги судді",
      benefitsTitle: "Чому експерти входять до ради журі IBPA Beauty Award 2026",
      benefitsText: "Серйозна професійна роль із помітним внеском і міжнародним визнанням.",
      b1Title: "Офіційне визнання",
      b1Text: "Публікуйтесь як підтверджений учасник журі IBPA Beauty Award 2026 і представляйте галузеві стандарти.",
      b2Title: "Надійна система",
      b2Text: "Оцінюйте заявки через прозорий і структурований процес суддівства.",
      b3Title: "Професійна спільнота",
      b3Text: "Долучайтеся до міжнародної спільноти лідерів і викладачів beauty-сфери.",
      b4Title: "Профільна репутація",
      b4Text: "Посилюйте професійний авторитет через офіційну роль у премії.",
      statementEyebrow: "Позиція довіри",
      statementTitle: "Кожен бал має відображати майстерність і професійну доброчесність",
      statementText: "Суддів IBPA Beauty Award 2026 відбирають за експертизою, нейтральністю та відданістю справедливому оцінюванню.",
      statementText2: "Кожен учасник журі діє незалежно та оцінює роботи виключно на основі затверджених критеріїв нагородження.",
      statementQuote: "Суддівство - це не лише результат. Це довіра до процесу.",
      approvedEyebrow: "Схвалене журі",
      approvedTitle: "Поточний склад журі IBPA Beauty Award 2026",
      approvedSectionText: "Актуальний список схвалених суддів, які беруть участь у премії.",
      ctaEyebrow: "Рада журі",
      ctaTitle: "Застосуйте свою експертизу на сцені IBPA Beauty Award 2026",
      ctaText: "Подайте заявку до журі та долучайтеся до справедливих професійних рішень за номінаціями.",
      ctaAside: "Оплата реєстрації доступна лише після схвалення.",
    },

    benefits: {
      eyebrow: "Привілеї офіційного судді",
      title: "Привілеї офіційного судді IBPA Beauty Awards 2026",
      description:
        "Після підтвердження участі судді отримують офіційний пакет документів, публікацій і професійних привілеїв, що підтверджують їхній статус у складі міжнародної суддівської колегії IBPA Beauty Awards 2026.",
      items: [
        "Офіційне запрошення до складу журі IBPA Beauty Awards 2026.",
        "Регламент і методичні матеріали для проведення суддівства.",
        "Доступ до особистого кабінету судді для оцінювання конкурсних робіт.",
        "Офіційну суддівську відомість для оцінювання учасників.",
        "Іменний сертифікат офіційного судді IBPA Beauty Awards 2026.",
        "Подячний лист за участь у роботі міжнародної суддівської колегії.",
        "Персональний банер судді для публікації в соціальних мережах і професійному портфоліо.",
        "Публічне розміщення профілю судді на офіційному сайті премії.",
        "Публікацію у складі міжнародної суддівської колегії IBPA Beauty Awards 2026.",
        "Згадку у фінальній статті та публікаціях, присвячених проведенню премії та її результатам.",
      ],
    },
    juryCta: {
      eyebrow: "Реєстрація судді",
      title: "Приєднуйтесь до міжнародного журі IBPA.",
      description: "Подайте заявку як учасник журі для оцінювання досконалості у сфері краси, підтримки професійних стандартів і участі у шанованій міжнародній премії.",
      registrationFee: "Реєстраційний внесок",
      registrationNote:
        "Реєстраційний внесок сплачується лише після схвалення кандидатури та не підлягає поверненню.",
    },
  },
  grandPrixPage: {
    hero: {
      eyebrow: "Гран-прі",
      title: "Гран-прі IBPA 2026",
      description:
        "Найвища нагорода за видатний результат, яку отримують учасники з найкращим сумарним результатом у 5 або більше номінаціях.",
      body:
        "Гран-прі визнає загальний результат у кількох номінаціях. Учасник стає номінантом, якщо бере участь у 5 або більше номінаціях - в одному або кількох категоріях.",
      snapshot: "Ключові умови",
      eligibility: "Критерії участі",
      eligibilityValue: "Мінімум 5 номінацій",
      evaluation: "Оцінювання",
      evaluationValue: "Сумарний бал за всіма номінаціями",
      decision: "Рішення",
      decisionValue: "Повний склад журі",
      cta: "Переглянути категорії",
      learnMore: "Дізнатися більше",
    },
    pillars: [
      {
        title: "Як стати номінантом на Гран-прі",
        text: "Учасник автоматично стає номінантом на Гран-прі, якщо бере участь мінімум у 5 номінаціях. Номінації можуть бути в одній категорії або в кількох категоріях.",
      },
      {
        title: "Приклад",
        text: "3 номінації в категорії «Брови» + 2 номінації в категорії «Вії» дають право на участь у Гран-прі.",
      },
      {
        title: "Як визначається переможець Гран-прі",
        text: "Кожна номінація оцінюється суддями окремо. Усі бали підсумовуються, і перемагає учасник із найвищою сумою балів серед усіх номінантів.",
      },
    ],
    criteria: {
      label: "Важливо",
      title: "5 номінацій для кваліфікації",
      text: "Кваліфікація на Гран-прі базується на участі щонайменше у 5 номінаціях. Ці номінації можуть бути в одній категорії або розподілені між кількома категоріями.",
      listLabel: "Ключові критерії",
      items: [
        "Критерії участі: мінімум 5 номінацій",
        "Оцінювання: сумарний бал за всіма номінаціями",
        "Рішення: повний склад журі",
      ],
    },
    flow: {
      label: "Логіка відбору",
      title: "Більше номінацій – більше шансів",
      steps: [
        {
          number: "01",
          title: "5+ номінацій - ви у Гран-прі",
          text: "Чим ширше ви представлені в премії, тим вищі ваші шанси. 5 і більше номінацій – і ви автоматично стаєте номінантом на Гран-прі IBPA.",
        },
        {
          number: "02",
          title: "Журі оцінює кожну номінацію",
          text: "Ваша робота отримує професійну оцінку журі IBPA Beauty Award 2026 - чесно, за єдиними критеріями.",
        },
        {
          number: "03",
          title: "Переможець Гран-прі",
          text: "Гран-прі дістається учаснику з найбільшим сумарним балом у всіх номінаціях. Найкращий результат – заслужена перемога.",
        },
      ],
    },
    faq: {
      label: "Питання",
      title: "FAQ Гран-прі",
      items: [
        {
          question: "Чи потрібно окремо подаватися на Гран-прі?",
          answer:
            "Ні. Участь активується автоматично після подання заявок у 5 і більше номінаціях.",
        },
        {
          question: "Чи є додатковий внесок за Гран-прі?",
          answer: "Ні. Окремий реєстраційний внесок не передбачено.",
        },
        {
          question: "Чи можна брати участь у Гран-прі лише з однією роботою?",
          answer:
            "Ні. Для участі необхідно подати заявки щонайменше у 5 номінаціях.",
        },
        {
          question: "Скільки переможців Гран-прі визначається щороку?",
          answer: "Один володар Гран-прі в межах премії.",
        },
      ],
    },
    copy: {
      apply: "Подати заявку на участь",
      reviewCategories: "Переглянути категорії",
      mediaTitle: "Змагайтеся у кількох категоріях",
      mediaDescription: "Номінація починається, коли ви виступаєте в кількох категоріях.",
      rule: "Правило Гран-прі",
      selectionTitle: "Номінація, суддівство та фінальне рішення премії",
      timelineEyebrow: "Ключові етапи",
      timelineTitle: "Зрозуміла логіка на кожному етапі премії",
      timelineDescription: "Акцент на номінації, оцінюванні та фінальній презентації премії.",
      appWindow: "Період подання заявок",
      appWindowText: "Подавайте номінації з 2 липня по 10 серпня 2026 року.",
      scorePeriod: "Період оцінювання",
      scorePeriodText: "Журі оцінює роботи з 16 серпня по 5 вересня 2026 року.",
      reveal: "Фінальне оголошення",
      revealText: "Переможців оголошують на церемонії IBPA Beauty Awards 2026 — 26 вересня 2026 року.",
      breakEyebrow: "Атмосфера Гран-прі",
      breakTitle: "Фінальна сцена для сильного результату в кількох категоріях",
      breakText: "Преміальне середовище, де сумарна майстерність отримує помітне визнання.",
      ctaEyebrow: "Участь у Гран-прі",
      ctaTitle: "Побудуйте шлях до найвищої відзнаки",
      ctaText: "Виступайте у кількох категоріях, посилюйте профіль і змагайтеся за головний титул IBPA Beauty Award 2026.",
      startEntry: "Почати подання",
      viewCategories: "Переглянути категорії",
      strategy: "Стратегія кількох категоріях має значення.",
      fiveCategories: "5+ номінацій - і ви в Гран-прі",
      qualificationRule: "Подайте заявки в 5 і більше номінацій - і ви автоматично стаєте номінантом на Гран-прі IBPA. Без додаткових заявок.",
      decision: "Рішення премії",
    },
    about: {
      whatEyebrow: "Про Гран-прі",
      whatTitle: "Що таке Гран-прі",
      whatText:
        "Гран-прі — це головна нагорода IBPA Beauty Awards 2026, яку присуджують учаснику з найвищим сумарним результатом серед претендентів.",
      whoEyebrow: "Хто претендує",
      whoTitle: "Хто стає претендентом на Гран-прі",
      whoHighlight: "5+ номінацій = автоматична участь",
      whoText:
        "Учасники, які подали роботи у п'яти та більше номінаціях, автоматично стають кандидатами на отримання Гран-прі.",
      whoNote: "Додаткова реєстрація не потрібна.",
    },
    whySpecial: {
      eyebrow: "Чому це важливо",
      title: "Чому Гран-прі вважається особливою нагородою",
      lead: "Гран-прі оцінює не окрему роботу, а загальний професійний рівень спеціаліста.",
      cards: [
        { title: "Майстерність", text: "Високі результати одразу в кількох категоріях." },
        { title: "Стабільність", text: "Підтвердження якості роботи в різних напрямах." },
        { title: "Універсальність", text: "Широка професійна експертиза." },
        { title: "Визнання", text: "Найвищий рівень нагороди в межах премії." },
      ],
    },
    decision: {
      eyebrow: "Відбір",
      title: "Як визначається переможець",
      steps: [
        {
          number: "01",
          title: "Автоматичний відбір",
          text: "5 і більше номінацій автоматично включають учасника до списку претендентів на Гран-прі.",
        },
        {
          number: "02",
          title: "Незалежне оцінювання",
          text: "Кожна робота оцінюється міжнародною колегією суддів за єдиними критеріями.",
        },
        {
          number: "03",
          title: "Підрахунок результатів",
          text: "Бали підсумовуються за всіма номінаціями учасника.",
        },
        {
          number: "04",
          title: "Визначення переможця",
          text: "Гран-прі отримує учасник із найвищим підсумковим результатом.",
        },
      ],
    },
    rewards: {
      eyebrow: "Нагороди",
      title: "Що отримує володар Гран-прі",
      items: [
        "Головний трофей Гран-прі",
        "Спеціальний диплом переможця",
        "Міжнародне визнання",
        "Публікація на ресурсах IBPA",
        "Висвітлення перемоги в соціальних мережах премії",
        "Статус володаря Гран-прі IBPA Beauty Awards 2026",
      ],
    },
    participationCta: {
      eyebrow: "Участь у премії",
      title: "Готові заявити про свій професійний рівень?",
      description: "Подайте роботи в обрані номінації та отримайте можливість стати претендентом на Гран-прі IBPA Beauty Awards 2026.",
      nominationFees: "Внески за номінації",
      members: "Учасники",
      perNomSubmission: "За одну номінацію",
      nominationsActivate: "Номінації активують право участі",
    },
  },
  associationPage: {
    hero: {
      eyebrow: "Асоціація IBPA",
      title: "International Beauty Professionals Association",
      subtitle: "Міжнародна асоціація професіоналів індустрії краси",
      description:
        "International Beauty Professionals Association (IBPA) об'єднує фахівців, викладачів, власників бізнесу, академії, студії, салони та бренди індустрії краси з різних країн світу.",
      applyButton: "Подати заявку",
      websiteButton: "Перейти на сайт IBPA",
    },
    whoCanJoin: {
      eyebrow: "Хто може приєднатися?",
      title: "IBPA відкрита для:",
      items: [
        "Фахівці індустрії краси",
        "Викладачі та тренери",
        "Власники студій, салонів та академій",
        "Beauty-бренди та компанії",
        "Початківці та студенти профільних напрямів",
      ],
    },
    advantages: {
      eyebrow: "Переваги участі",
      title: "Більше довіри, зв'язків і професійного розвитку.",
      description:
        "Участь в IBPA допомагає посилити особистий бренд, розширити професійні можливості та стати частиною міжнародної beauty-спільноти.",
      items: [
        "Освітні вебінари та професійні матеріали",
        "Знижки на заходи, премії та проєкти асоціації",
        "Доступ до закритої професійної спільноти",
        "Можливості для публікацій, виступів і просування",
        "Участь у міжнародних форумах, преміях і бізнес-заходах",
        "Профіль у каталозі асоціації",
        "Сертифікат учасника IBPA",
        "Партнерські програми, спеціальні пропозиції та багато інших привілеїв",
      ],
    },
    process: {
      eyebrow: "Як проходить вступ?",
      title: "Чіткий і зрозумілий процес вступу.",
      stepLabel: "Крок",
      steps: [
        {
          title: "Оберіть категорію",
          text: "Оберіть відповідну категорію участі в асоціації.",
        },
        {
          title: "Заповніть заявку",
          text: "Заповніть заявку на вступ через форму сайту.",
        },
        {
          title: "Дочекайтеся розгляду",
          text: "Команда IBPA розгляне заявку та підтвердить подальші кроки.",
        },
        {
          title: "Завершіть реєстрацію",
          text: "Після схвалення здійсніть оплату, завершіть реєстрацію та отримайте доступ до переваг обраної категорії.",
        },
      ],
    },
    cta: {
      eyebrow: "Дізнатися більше",
      title: "Готові приєднатися до міжнародної спільноти професіоналів?",
      description:
        "Детальна інформація про категорії участі, вартість, переваги та умови вступу доступна на офіційному сайті IBPA.",
      applyButton: "Подати заявку на вступ",
      websiteButton: "Перейти на сайт IBPA",
    },
  },
  applyPage: {
    intro: {
      eyebrow: "Заявка учасника",
      title: "Надішліть заявку на участь у премії.",
      text: "Заповніть форму нижче, вказавши професійні дані та матеріали для вибраної категорії та номінації.",
    },
    form: {
      blockA: "Блок A",
      blockATitle: "Професійний профіль і право на участь",
      blockADescription:
        "Заповніть загальний розділ заявки перед переходом до матеріалів для оцінювання за категорією.",
      blockB: "Блок B",
      blockBTitle: "Матеріали для вибраної категорії та номінації",
      blockBDescription: "Блок B змінюється залежно від вибраної категорії та номінації.",
      progress: "Прогрес заявки",
      requiredComplete: "обов'язкових пунктів заповнено",
      submit: "Надіслати заявку на премію",
      submitting: "Надсилання заявки...",
      validationError:
        "Будь ласка, перевірте виділені поля перед надсиланням заявки.",
      submitError: "Не вдалося надіслати заявку. Спробуйте ще раз.",
      submitException:
        "Під час надсилання щось пішло не так. Спробуйте ще раз за хвилину.",
      redirecting: "Перехід до захищеної оплати Stripe Checkout.",
    },
    introCards: {
      eligibility: "Право на участь і важливі примітки",
      feeHtml: "Внесок за участь: <strong>$50 за категорію</strong>.",
      separate: "Кожна категорія подається як окрема заявка.",
      juryNote: "Правила оплати для журі не застосовуються до цієї сторінки заявки учасника.",
      before: "Перед початком",
      items: [
        "Підготуйте файл ліцензії або сертифіката.",
        "Оберіть одну категорію та одну конкретну номінацію.",
        "Зберіть портфоліо та додаткові файли для Блока B.",
        "Перевірте файли портфоліо перед завантаженням.",
      ],
    },
  },
  admin: {
    common: {
      logout: "Вийти",
      review: "Відкрити",
      open: "Відкрити",
      total: "Усього",
      submitted: "Надіслано",
      approved: "Схвалено",
      paymentPending: "Очікує оплати",
      underReview: "На розгляді",
      rejected: "Відхилено",
      applicant: "Учасник",
      candidate: "Кандидат",
      category: "Категорія",
      award: "Номінація",
      status: "Статус",
      payment: "Оплата",
      created: "Створено",
      date: "Дата",
      title: "Звання",
      expertise: "Експертиза",
      application: "Заявка",
    },
    login: {
      eyebrow: "Доступ адміністратора",
      title: "Перевіряйте заявки учасників і журі в єдиному закритому просторі.",
      text:
        "Увійдіть, щоб отримати доступ до внутрішньої перевірки, перегляду файлів і відстеження рішень за обома потоками заявок.",
      cards: ["Закритий доступ", "Швидкий перегляд заявок", "Керування статусами"],
      signIn: "Вхід",
      loginTitle: "Вхід адміністратора",
      loginText: "Введіть пароль адміністратора для доступу до панелей заявок.",
      password: "Пароль адміністратора",
      placeholder: "Введіть пароль",
      opening: "Відкриваємо адмін-панель...",
      open: "Відкрити адмін-панель",
    },
    participants: {
      eyebrow: "Адміністрування учасників",
      title: "Заявки учасників премії",
      text:
        "Перевіряйте профілі учасників, категорії, файли та поточні статуси в одному закритому робочому просторі.",
      juryDashboard: "Журі",
      scoringDashboard: "Оцінки",
      appStatus: "Статус заявки",
      empty: "Немає заявок учасників, що відповідають цьому фільтру.",
    },
    jury: {
      eyebrow: "Адміністрування журі",
      title: "Панель заявок журі",
      text:
        "Перевіряйте заявки, надсилайте посилання на оплату після схвалення та відстежуйте активацію в одному місці.",
      participantDashboard: "Учасники",
      scoringDashboard: "Оцінки",
      paidJurors: "Оплачені судді",
      empty: "Заявки до журі ще не надсилалися.",
    },
  },
  juryDashboard: {
    dashboard: "Панель журі",
    accessText: "Доступ до перевірки обмежений категоріями, для яких вас схвалено.",
    approvedCategories: "Схвалені категорії",
    assigned: "Призначені заявки",
    scored: "Оцінено",
    remaining: "Залишилось",
    allCategories: "Усі категорії",
    applicant: "Учасник",
    category: "Категорія",
    award: "Номінація",
    status: "Статус",
    submitted: "Надіслано",
    open: "Відкрити",
    reviewScore: "Перевірити й оцінити",
    continueDraft: "Продовжити чернетку",
    viewSubmitted: "Переглянути надіслане",
    empty: "Немає заявок учасників для вашого доступу за категоріями.",
    signOut: "Вийти",
  },
  auth: {
    shellCards: [
      "Закритий доступ для учасників",
      "Преміальний стиль IBPA Beauty Award 2026",
      "Захищені сторінки премії",
    ],
    access: "Доступ",
    accessText:
      "Увійдіть, щоб отримати доступ до сайту IBPA Beauty Award 2026. Нові користувачі можуть зареєструватися за email і паролем, а потім перейти на основний сайт.",
    loginLink: "Увійти",
    registerLink: "Реєстрація",
    statement: "Кожна оцінка повинна відображати як майстерність, так і професійну чесність.",
    trustBadge: "Офіційний портал журі · IBPA Beauty Award 2026",
    forgotPage: {
      eyebrow: "Відновлення пароля",
      title: "Відновіть доступ до кабінету журі",
      description: "Введіть зареєстровану email-адресу, і ми надішлемо вам захищене посилання для скидання пароля.",
      cardEyebrow: "Посилання для скидання",
      cardTitle: "Введіть вашу email-адресу",
      cardText: "Якщо акаунт зареєстровано з цим email, ви отримаєте інструкції щодо скидання пароля.",
    },
    resetPage: {
      eyebrow: "Новий пароль",
      title: "Встановіть новий пароль для акаунта журі",
      description: "Створіть надійний новий пароль для відновлення доступу до кабінету журі IBPA Beauty Award 2026.",
      cardTitle: "Створіть новий пароль",
      cardText: "Введіть та підтвердіть новий пароль.",
    },
    loginPage: {
      eyebrow: "Вхід журі",
      title: "Доступ до робочого простору журі IBPA Beauty Award 2026",
      description:
        "Увійдіть з email і паролем, щоб перейти до панелі журі. Захищені сторінки спочатку направлять неавторизованих користувачів сюди.",
      cardEyebrow: "Вхід журі",
      cardTitle: "Вітаємо з поверненням",
      cardText: "Введіть дані для входу до робочого простору журі IBPA Beauty Award 2026.",
    },
    registerPage: {
      eyebrow: "Реєстрація журі",
      title: "Створіть закритий доступ журі IBPA Beauty Award 2026",
      description:
        "Створіть email і пароль для входу на сайт. Після реєстрації вхід виконується автоматично, і ви переходите на головну сторінку.",
      cardEyebrow: "Реєстрація журі",
      cardTitle: "Створіть акаунт",
      cardText: "Вкажіть email і створіть пароль, щоб почати.",
    },
    form: {
      email: "Email",
      emailPlaceholder: "Введіть email",
      password: "Пароль",
      passwordPlaceholder: "Введіть пароль",
      passwordRegisterPlaceholder: "Мінімум 8 символів",
      confirmPassword: "Підтвердьте пароль",
      confirmPasswordPlaceholder: "Повторіть пароль",
      openingSite: "Відкриваємо сайт...",
      creatingAccount: "Створюємо акаунт...",
      login: "Увійти",
      register: "Зареєструватися",
      noAccount: "Немає акаунта?",
      haveAccount: "Вже є акаунт?",
      backToLogin: "Повернутися до входу",
      noRegisteredAccount: "Акаунт із цим email не зареєстровано.",
      invalidCredentials: "Невірний email або пароль. Спробуйте ще раз.",
      forgotPassword: "Забули пароль?",
      sendResetLink: "Надіслати посилання",
      sendingLink: "Надсилання...",
      resetPassword: "Зберегти пароль",
      resettingPassword: "Оновлення пароля...",
      newPassword: "Новий пароль",
      newPasswordPlaceholder: "Щонайменше 8 символів",
      confirmNewPassword: "Підтвердіть новий пароль",
      confirmNewPasswordPlaceholder: "Повторіть новий пароль",
      checkYourEmail: "Перевірте пошту",
      checkYourEmailText: "Якщо цей email зареєстровано, ви отримаєте посилання для скидання пароля.",
      invalidResetToken: "Посилання для скидання пароля недійсне або вже використано.",
      expiredResetToken: "Термін дії посилання закінчився. Будь ласка, запросіть нове.",
      passwordResetSuccess: "Пароль успішно оновлено. Тепер ви можете увійти.",
    },
  },
  statuses: {
    DRAFT: "Чернетка",
    PAYMENT_PENDING: "Очікує оплати",
    SUBMITTED: "Надіслано",
    UNDER_REVIEW: "На розгляді",
    ADDITIONAL_INFO_REQUIRED: "Потребує уточнення",
    APPROVED: "Схвалено",
    REJECTED: "Відхилено",
    PAID: "Оплачено",
    PENDING: "Очікування",
    FAILED: "Помилка",
    EXPIRED: "Минуло",
    REFUNDED: "Повернено",
    NOT_STARTED: "Не розпочато",
    REOPENED: "Відкрито знову",
    IN_PROGRESS: "У процесі",
    COMPLETE: "Завершено",
  },
  filters: {
    search: "Пошук за іменем, email або номером IBPA",
    allStatuses: "Усі статуси",
    allCategories: "Усі категорії",
    allPayments: "Усі оплати",
    sortLabel: "Сортування",
    sortNewest: "Спочатку нові",
    sortOldest: "Спочатку старі",
    sortName: "Ім'я А–Я",
    toggle: "Фільтри",
    clearAll: "Очистити",
  },
  ticketFlow: {
    alreadyPurchased: "Ви вже придбали квиток, використовуючи цю електронну адресу.",
    success: {
      eyebrow: "IBPA BEAUTY AWARD 2026",
      title: "Оплату підтверджено",
      subtitle: "Ваш квиток на IBPA BEAUTY AWARD 2026 підтверджено.",
      emailed:
        "Ми надіслали ваш квиток із QR-кодом на вказану адресу. Будь ласка, покажіть його на стійці реєстрації форуму.",
      backHome: "На головну",
      refundNotice:
        "Будь ласка, зверніть увагу! Якщо ви вже придбали квиток на Beauty Business Forum, але ваші плани змінилися і ви не зможете бути присутніми, будь ласка, повідомте нас про це не пізніше ніж за один місяць до початку заходу. У такому разі ми зможемо оформити повернення коштів відповідно до правил заходу.",
    },
  },
  notFound: {
    title: "Сторінку не знайдено",
    description: "Сторінка, яку ви шукаєте, не існує або більше недоступна.",
    backHome: "Повернутися на головну",
    back: "Назад",
  },
};

export const translations: Record<Language, typeof en> = {
  en,
  ru,
  ua,
};

export type Translations = typeof en;

