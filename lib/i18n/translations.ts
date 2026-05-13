export const languages = ["en", "ru", "ua"] as const;

export type Language = (typeof languages)[number];

export const languageLabels: Record<Language, { short: string; label: string }> = {
  en: { short: "EN", label: "English" },
  ru: { short: "RU", label: "Русский" },
  ua: { short: "UA", label: "Українська" },
};

const en = {
  common: {
    applyNow: "Apply Now",
    applyAsJudge: "Apply as a Judge",
    applyAsJury: "Apply as Jury",
    juryAccount: "Jury Account",
    jury: "Jury",
    categories: "Directions",
    grandPrix: "Grand Prix",
    home: "Home",
  },
  header: {
    navigation: {
      home: "Home",
      categories: "Directions",
      jury: "Jury",
      grandPrix: "Grand Prix",
    },
    openMenu: "Open menu",
    closeMenu: "Close menu",
    language: "Language",
  },
  home: {
    hero: {
      eyebrow: "IBPA Beauty Award 2026",
      title:
        "Recognition of outstanding achievements in beauty, beauty education, health, and innovation in branding",
      description:
        "A premium award experience for licensed professionals, educators, salons, and brands. Apply in your direction, submit your portfolio, and be reviewed by the official IBPA jury panel.",
      categoriesCta: "Explore Directions",
    },
    stats: [
      {
        title: "Registration Fee",
        value: "$50 per direction",
        text: "The participation fee is calculated for each selected direction separately. It is possible to select multiple directions and pay for them in a single payment.",
      },
      {
        title: "Judge Registration",
        value: "$250",
        text: "The registration fee is paid only after the candidate is approved. Payment is required only upon confirmation of participation as a judge.",
      },
      {
        title: "Participation",
        value: "For IBPA Members",
        text: "All active members of the IBPA association may apply to participate in the award.",
      },
      {
        title: "Grand Prix",
        value: "5+ nominations",
        text: "Participants who submit applications in 5 or more nominations are automatically entered into the Grand Prix. The winner is determined by the highest total score received from judges across all submitted nominations.",
      },
    ],
    categoriesPreview: {
      label: "Directions",
      title: "11 Directions of Excellence in the Beauty Industry",
      viewAll: "View all directions",
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
      title: "How the Award Process Works",
      steps: [
        {
          number: "01",
          title: "Choose a Direction",
          text: "Select one of the 11 professional directions and a specific nomination within that direction.",
        },
        {
          number: "02",
          title: "Confirm Membership",
          text: "Confirm your membership by entering your IBPA membership number.",
        },
        {
          number: "03",
          title: "Complete Submission",
          text: "Fill out the main application and upload materials relevant to the selected direction and nomination.",
        },
        {
          number: "04",
          title: "Submit and Pay",
          text: "Submit your application and complete payment via Checkout service in USD.",
        },
        {
          number: "05",
          title: "Jury Evaluation",
          text: "Applications proceed to the official evaluation stage conducted by the jury, prior to the nominations ceremony.",
        },
      ],
    },
    grandPrix: {
      label: "Grand Prix",
      title: "IBPA Grand Prix 2026",
      text1:
        "The highest award for outstanding performance, granted to participants with the best combined results across 5 or more nominations.",
      text2:
        "The Grand Prix recognizes overall performance across multiple nominations. A participant becomes a nominee by competing in 5 or more nominations, within one or across multiple directions.",
      cta: "Learn About Grand Prix",
    },
    juryCta: {
      label: "Jury",
      title: "Apply to Become an Official Judge of the IBPA 2026 Award",
      text1: "Candidates for the judging panel go through a professional selection process.",
      text2:
        "First, an application is submitted and reviewed by the expert panel. If approved, the candidate receives an invitation and a payment link for the $250 registration fee.",
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
          a: "Participant applications cost $50 per selected direction.",
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
      title: "Start your IBPA Beauty Award application today.",
      text: "Build your professional case, upload your portfolio, and compete for one of the industry's premier recognitions.",
      judge: "Become a Judge",
    },
  },
  categoriesPage: {
    hero: {
      eyebrow: "Award Directions",
      title: "11 Directions of Excellence in the Beauty Industry",
      description:
        "Each direction is built for a different beauty profession, from artistry and skin to salon leadership, education, and brand excellence. Applicants choose the direction that best matches their work and submit a dedicated entry.",
      entryRules: "Entry Rules",
      feeLabel: "Registration Fee",
      feeValue: "$50 per direction",
      eligibilityLabel: "Participation",
      eligibilityValue: "For IBPA Members",
      cta: "Apply In A Direction",
    },
    cardText:
      "Professional submissions are reviewed within the official IBPA award framework.",
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
    requirements: {
      label: "Requirements",
      title: "Who can apply for the jury panel",
      items: [
        {
          label: "Minimum Experience",
          value: "5+ Years",
          text: "Applicants must have at least five years of professional industry experience.",
        },
        {
          label: "Expertise",
          value: "11 Directions",
          text: "Judges are selected based on their expertise in relevant award areas.",
        },
        {
          label: "Documents",
          value: "Required",
          text: "Professional certifications, bio, and profile materials must be submitted.",
        },
        {
          label: "Payment Rule",
          value: "After Approval",
          text: "The jury fee is never charged at the application stage.",
        },
      ],
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
          title: "IBPA Review",
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
      label: "Questions",
      title: "Frequently asked questions",
      items: [
        {
          question: "Do I pay when I submit the application?",
          answer:
            "No. Jury applications are submitted free of charge. The $250 fee is charged only after approval.",
        },
        {
          question: "How long does the review take?",
          answer:
            "Applications are reviewed individually and may take up to 14 business days.",
        },
        {
          question: "Will every applicant be accepted?",
          answer:
            "No. Approval depends on professional background, qualifications, and jury fit.",
        },
        {
          question: "What happens after approval?",
          answer:
            "Approved candidates receive payment instructions. After payment confirmation, they officially join the jury panel.",
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
  },
  grandPrixPage: {
    hero: {
      eyebrow: "Grand Prix",
      title: "IBPA Grand Prix 2026",
      description:
        "The highest award for outstanding performance, granted to participants with the best combined results across 5 or more nominations.",
      body:
        "The Grand Prix recognizes overall performance across multiple nominations. A participant becomes a nominee by competing in 5 or more nominations, within one or across multiple directions.",
      snapshot: "Selection Snapshot",
      eligibility: "Eligibility",
      eligibilityValue: "Minimum 5 nominations",
      evaluation: "Evaluation",
      evaluationValue: "Total combined score",
      decision: "Decision",
      decisionValue: "Full judging panel",
      cta: "Review Directions",
    },
    pillars: [
      {
        title: "How to Become a Grand Prix Nominee",
        text: "A participant automatically becomes a Grand Prix nominee by competing in at least 5 nominations. Nominations can be within one direction or across multiple directions.",
      },
      {
        title: "Example",
        text: "3 nominations in Brows + 2 nominations in Lashes qualifies a participant for Grand Prix consideration.",
      },
      {
        title: "How the Grand Prix Winner is Determined",
        text: "Each direction is judged separately. All scores are combined into a total result, and the participant with the highest total score among all nominees wins.",
      },
    ],
    criteria: {
      label: "Important",
      title: "5 nominations for qualification",
      text: "Grand Prix qualification is based on participation in at least 5 nominations. Those nominations may be inside one direction or spread across several directions.",
      listLabel: "Core Criteria",
      items: [
        "Eligibility: minimum 5 nominations",
        "Evaluation: total combined score across all nominations",
        "Decision: full judging panel",
      ],
    },
    flow: {
      label: "Selection Flow",
      title: "How the Grand Prix decision is made",
      steps: [
        {
          number: "01",
          title: "Participation",
          text: "Participants compete in multiple nominations within one or across multiple directions.",
        },
        {
          number: "02",
          title: "Nomination",
          text: "Competing in 5 or more nominations automatically qualifies a participant for the Grand Prix.",
        },
        {
          number: "03",
          title: "Judging",
          text: "Each nomination is evaluated independently by the judges.",
        },
        {
          number: "04",
          title: "Final Score",
          text: "All scores are combined to determine the highest-ranking participant.",
        },
      ],
    },
    faq: {
      label: "Questions",
      title: "Grand Prix FAQ",
      items: [
        {
          question: "Can I apply for the Grand Prix separately?",
          answer: "No. Qualification happens automatically through participation.",
        },
        {
          question: "Do I need to compete in different directions or nominations?",
          answer: "No. Nominations can be within one direction or across multiple directions.",
        },
        {
          question: "How is the winner selected?",
          answer: "Based on the total combined score across all nominations.",
        },
      ],
    },
  },
  applyPage: {
    intro: {
      eyebrow: "Candidate Application",
      title: "Submit your award entry.",
      text: "Complete the form below with your professional details and direction materials.",
    },
    form: {
      blockA: "Block A",
      blockATitle: "Professional Profile & Eligibility",
      blockADescription:
        "Complete the shared award application section before moving into the direction-specific evaluation materials.",
      blockB: "Block B",
      blockBTitle: "Direction-Specific Nomination Materials",
      blockBDescription: "Block B changes based on the direction you select.",
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
      feeHtml: "Participation fee: <strong>$50 per direction</strong>.",
      separate: "Each direction is submitted as a separate application.",
      juryNote: "Jury fee rules do not apply to this participant application page.",
      before: "Before You Start",
      items: [
        "Prepare your license or certification file.",
        "Choose one direction and one specific nomination.",
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
      category: "Direction",
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
        "Review applicant profiles, direction entries, supporting files, and current review status in one private workspace.",
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
    accessText: "Review access is limited to the directions you were approved to judge.",
    approvedCategories: "Approved Directions",
    assigned: "Assigned Applications",
    scored: "Scored",
    remaining: "Remaining",
    allCategories: "All Directions",
    applicant: "Applicant",
    category: "Direction",
    award: "Nomination",
    status: "Status",
    submitted: "Submitted",
    open: "Open",
    reviewScore: "Review & Score",
    continueDraft: "Continue Draft",
    viewSubmitted: "View Submitted",
    empty: "No participant applications matched your direction access.",
    signOut: "Log Out",
  },
  auth: {
    shellCards: [
      "Private member access",
      "Luxury IBPA styling",
      "Protected award pages",
    ],
    access: "Access",
    accessText:
      "Sign in to access the IBPA site experience. New visitors can register with email and password, then continue directly to the main site.",
    loginLink: "Login",
    registerLink: "Register",
    loginPage: {
      eyebrow: "Jury Login",
      title: "Access the IBPA jury member experience",
      description:
        "Sign in with your email and password to continue to the jury dashboard. Protected pages will send unauthenticated visitors here first.",
      cardEyebrow: "Jury Login",
      cardTitle: "Welcome back",
      cardText: "Enter your credentials to continue to the IBPA jury workspace.",
    },
    registerPage: {
      eyebrow: "Jury Register",
      title: "Create your private IBPA jury access",
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
    },
  },
  statuses: {
    DRAFT: "Draft",
    PAYMENT_PENDING: "Payment Pending",
    SUBMITTED: "Submitted",
    UNDER_REVIEW: "Under Review",
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
};

const ru: typeof en = {
  common: {
    applyNow: "Подать заявку",
    applyAsJudge: "Подать заявку на должность судьи",
    applyAsJury: "Подать заявку в жюри",
    juryAccount: "Кабинет жюри",
    jury: "Жюри",
    categories: "Направления",
    grandPrix: "Гран-при",
    home: "Главная",
  },
  header: {
    navigation: {
      home: "Главная",
      categories: "Направления",
      jury: "Жюри",
      grandPrix: "Гран-при",
    },
    openMenu: "Открыть меню",
    closeMenu: "Закрыть меню",
    language: "Язык",
  },
  home: {
    hero: {
      eyebrow: "IBPA Beauty Award 2026",
      title:
        "Признание выдающихся достижений в сфере красоты, обучения в бьюти-индустрии, здоровья и инноваций в брендинге.",
      description:
        "Премиальная платформа для лицензированных специалистов, преподавателей, салонов и брендов. Выберите направление, отправьте портфолио и пройдите оценку официального жюри IBPA.",
      categoriesCta: "Смотреть направления",
    },
    stats: [
      {
        title: "Регистрационный взнос",
        value: "$50 за направление",
        text: "Стоимость участия рассчитывается за каждое выбранное направление отдельно. Можно выбрать несколько направлений и оплатить их одним платежом.",
      },
      {
        title: "Регистрация судьи",
        value: "$250",
        text: "Регистрационный взнос оплачивается только после одобрения кандидатуры. Оплата требуется только в случае подтверждения участия в качестве судьи.",
      },
      {
        title: "Участие",
        value: "Для членов IBPA",
        text: "Подать заявку на участие в премии могут все действующие члены ассоциации IBPA.",
      },
      {
        title: "Гран-при",
        value: "5+ номинаций",
        text: "Участники, подавшие заявки в 5 и более номинациях, автоматически участвуют в Гран-при. Победитель определяется по наибольшей сумме баллов, полученных от судей по всем заявленным номинациям.",
      },
    ],
    categoriesPreview: {
      label: "Направления",
      title: "11 направлений превосходства в индустрии красоты",
      viewAll: "Все направления",
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
      title: "Как проходит премия",
      steps: [
        {
          number: "01",
          title: "Выберите направление",
          text: "Выберите одно из 11 профессиональных направлений и конкретную номинацию внутри него.",
        },
        {
          number: "02",
          title: "Подтвердите членство",
          text: "Подтвердите своё членство, указав членский номер IBPA.",
        },
        {
          number: "03",
          title: "Завершите подачу",
          text: "Заполните основную заявку и загрузите материалы, соответствующие выбранным направлению и номинации.",
        },
        {
          number: "04",
          title: "Отправьте и оплатите",
          text: "Отправьте заявку и произведите оплату через сервис Checkout в долларах США.",
        },
        {
          number: "05",
          title: "Оценка жюри",
          text: "Заявки переходят в официальный этап оценки, проводимый жюри, который предшествует церемонии награждения.",
        },
      ],
    },
    grandPrix: {
      label: "Гран-при",
      title: "Гран-при IBPA 2026",
      text1:
        "Высшая награда за выдающийся результат, присуждаемая участникам, показавшим лучший суммарный результат в 5 и более номинациях.",
      text2:
        "Гран-при - это абсолютная победа, основанная на суммарных результатах участия в нескольких номинациях. Участник становится номинантом при участии в 5 и более номинациях - в одном или нескольких направлениях.",
      cta: "Подробнее о Гран-при",
    },
    juryCta: {
      label: "Жюри",
      title: "Подайте заявку, чтобы стать официальным судьёй премии IBPA 2026",
      text1: "Кандидаты на роль судей проходят профессиональный отбор.",
      text2:
        "Сначала подаётся заявка, после чего она рассматривается экспертной комиссией. В случае одобрения кандидат получает приглашение и ссылку для оплаты регистрационного взноса в размере 250 долларов США.",
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
          a: "Регистрационный взнос составляет $50 за каждое выбранное направление.",
        },
        {
          q: "Кто может участвовать?",
          a: "Подать заявку на участие в премии могут все действующие члены ассоциации IBPA.",
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
      title: "Начните заявку на IBPA Beauty Award уже сегодня.",
      text: "Подготовьте профессиональное портфолио, загрузите материалы и поборитесь за одно из ведущих признаний индустрии.",
      judge: "Стать судьёй",
    },
  },
  categoriesPage: {
    hero: {
      eyebrow: "Направления премии",
      title: "11 направлений превосходства в индустрии красоты",
      description:
        "Каждое направление представляет отдельную профессиональную сферу: от артистизма и ухода за кожей до управления салоном, образования и брендов. Участники выбирают направление, которое лучше всего соответствует их работе, и отправляют отдельную заявку.",
      entryRules: "Правила участия",
      feeLabel: "Регистрационный взнос",
      feeValue: "$50 за направление",
      eligibilityLabel: "Участие",
      eligibilityValue: "Для членов IBPA",
      cta: "Подать заявку по направлению",
    },
    cardText:
      "Профессиональные заявки рассматриваются в рамках официальной премии IBPA.",
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
    requirements: {
      label: "Требования",
      title: "Кто может подать заявку в жюри",
      items: [
        {
          label: "Минимальный опыт",
          value: "5+ лет",
          text: "Кандидат должен иметь не менее пяти лет профессионального опыта в индустрии.",
        },
        {
          label: "Экспертиза",
          value: "11 направлений",
          text: "Судьи отбираются с учетом экспертизы в соответствующих направлениях премии.",
        },
        {
          label: "Документы",
          value: "Обязательны",
          text: "Необходимо предоставить сертификаты, биографию и профильные материалы.",
        },
        {
          label: "Правило оплаты",
          value: "После одобрения",
          text: "Взнос жюри не взимается на этапе подачи заявки.",
        },
      ],
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
          title: "Рассмотрение IBPA",
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
          text: "После подтверждения оплаты вы становитесь официальным членом жюри.",
        },
      ],
    },
    faq: {
      label: "Вопросы",
      title: "Часто задаваемые вопросы",
      items: [
        {
          question: "Нужно ли платить при подаче заявки?",
          answer:
            "Нет. Заявка в жюри подаётся бесплатно. Взнос $250 оплачивается только после одобрения.",
        },
        {
          question: "Сколько длится рассмотрение?",
          answer:
            "Заявки рассматриваются индивидуально, процесс может занимать до 14 рабочих дней.",
        },
        {
          question: "Все ли кандидаты будут приняты?",
          answer:
            "Нет. Одобрение зависит от профессионального опыта, квалификации и соответствия составу жюри.",
        },
        {
          question: "Что происходит после одобрения?",
          answer:
            "Одобренные кандидаты получают инструкции по оплате. После подтверждения оплаты они официально входят в состав жюри.",
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
  },
  grandPrixPage: {
    hero: {
      eyebrow: "Гран-при",
      title: "Гран-при IBPA 2026",
      description:
        "Высшая награда за выдающийся результат, присуждаемая участникам, показавшим лучший суммарный результат в 5 и более номинациях.",
      body:
        "Гран-при - это абсолютная победа, основанная на суммарных результатах участия в нескольких номинациях. Участник становится номинантом при участии в 5 и более номинациях - в одном или нескольких направлениях.",
      snapshot: "Ключевые условия",
      eligibility: "Критерии участия",
      eligibilityValue: "Минимум 5 номинаций",
      evaluation: "Оценка",
      evaluationValue: "Суммарный балл по всем номинациям",
      decision: "Решение",
      decisionValue: "Полный состав жюри",
      cta: "Смотреть направления",
    },
    pillars: [
      {
        title: "Как стать номинантом на Гран-при",
        text: "Участник автоматически становится номинантом на Гран-при, если принимает участие минимум в 5 номинациях. Номинации могут быть в одном направлении или в нескольких направлениях.",
      },
      {
        title: "Пример",
        text: "3 номинации в направлении «Брови» + 2 номинации в направлении «Ресницы» дают право на участие в Гран-при.",
      },
      {
        title: "Как определяется победитель Гран-при",
        text: "Каждая номинация оценивается судьями отдельно. Все баллы суммируются в общий результат, и побеждает участник с наибольшей суммой баллов среди всех номинантов.",
      },
    ],
    criteria: {
      label: "Важно",
      title: "5 номинаций для квалификации",
      text: "Квалификация на Гран-при основана на участии минимум в 5 номинациях. Эти номинации могут быть внутри одного направления или распределены по нескольким направлениям.",
      listLabel: "Ключевые критерии",
      items: [
        "Критерии участия: минимум 5 номинаций",
        "Оценка: суммарный балл по всем номинациям",
        "Решение: полный состав жюри",
      ],
    },
    flow: {
      label: "Логика отбора",
      title: "Как принимается решение по Гран-при",
      steps: [
        {
          number: "01",
          title: "Участие",
          text: "Участник выбирает и участвует в нескольких номинациях в рамках одного или разных направлений.",
        },
        {
          number: "02",
          title: "Формирование номинации",
          text: "При участии в 5 и более номинациях участник автоматически становится номинантом на Гран-при.",
        },
        {
          number: "03",
          title: "Оценка судьями",
          text: "Каждая номинация оценивается судьями независимо.",
        },
        {
          number: "04",
          title: "Итоговый результат",
          text: "Все баллы суммируются, и определяется победитель с наивысшим результатом.",
        },
      ],
    },
    faq: {
      label: "Вопросы",
      title: "FAQ Гран-при",
      items: [
        {
          question: "Можно ли подать заявку на Гран-при отдельно?",
          answer:
            "Нет. Участие формируется автоматически при участии в 5 и более номинациях.",
        },
        {
          question: "Обязательно ли участвовать в разных направлениях?",
          answer:
            "Нет. Номинации могут быть как в одном направлении, так и в разных.",
        },
        {
          question: "Как выбирается победитель?",
          answer:
            "По сумме всех баллов, полученных за каждую номинацию.",
        },
      ],
    },
  },
  applyPage: {
    intro: {
      eyebrow: "Заявка участника",
      title: "Отправьте заявку на участие в премии.",
      text: "Заполните форму ниже, указав профессиональные данные и материалы по выбранному направлению и номинации.",
    },
    form: {
      blockA: "Блок A",
      blockATitle: "Профессиональный профиль и право на участие",
      blockADescription:
        "Заполните общий раздел заявки перед переходом к материалам для оценки по направлению.",
      blockB: "Блок B",
      blockBTitle: "Материалы по выбранному направлению и номинации",
      blockBDescription: "Блок B меняется в зависимости от выбранного направления и номинации.",
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
      feeHtml: "Взнос за участие: <strong>$50 за направление</strong>.",
      separate: "Каждое направление подаётся как отдельная заявка.",
      juryNote: "Правила оплаты для жюри не относятся к этой странице заявки участника.",
      before: "Перед началом",
      items: [
        "Подготовьте файл лицензии или сертификата.",
        "Выберите одно направление и одну конкретную номинацию.",
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
      category: "Направление",
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
        "Проверяйте профили участников, направления, файлы и текущие статусы в одном закрытом рабочем пространстве.",
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
    accessText: "Доступ к проверке ограничен направлениями, для которых вы одобрены.",
    approvedCategories: "Одобренные направления",
    assigned: "Назначенные заявки",
    scored: "Оценено",
    remaining: "Осталось",
    allCategories: "Все направления",
    applicant: "Участник",
    category: "Направление",
    award: "Номинация",
    status: "Статус",
    submitted: "Отправлено",
    open: "Открыть",
    reviewScore: "Проверить и оценить",
    continueDraft: "Продолжить черновик",
    viewSubmitted: "Смотреть отправленное",
    empty: "Нет заявок участников для вашего доступа по направлениям.",
    signOut: "Выйти",
  },
  auth: {
    shellCards: [
      "Закрытый доступ для участников",
      "Премиальный стиль IBPA",
      "Защищённые страницы премии",
    ],
    access: "Доступ",
    accessText:
      "Войдите, чтобы получить доступ к сайту IBPA. Новые пользователи могут зарегистрироваться по email и паролю, а затем перейти на основной сайт.",
    loginLink: "Войти",
    registerLink: "Регистрация",
    loginPage: {
      eyebrow: "Вход жюри",
      title: "Доступ к рабочему пространству жюри IBPA",
      description:
        "Войдите с email и паролем, чтобы перейти в панель жюри. Защищённые страницы сначала направят неавторизованных пользователей сюда.",
      cardEyebrow: "Вход жюри",
      cardTitle: "Добро пожаловать",
      cardText: "Введите данные для входа в рабочее пространство жюри IBPA.",
    },
    registerPage: {
      eyebrow: "Регистрация жюри",
      title: "Создайте закрытый доступ жюри IBPA",
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
    },
  },
  statuses: {
    DRAFT: "Черновик",
    PAYMENT_PENDING: "Ожидает оплаты",
    SUBMITTED: "Отправлено",
    UNDER_REVIEW: "На рассмотрении",
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
};

const ua: typeof en = {
  common: {
    applyNow: "Подати заявку",
    applyAsJudge: "Подати заявку на посаду судді",
    applyAsJury: "Подати заявку до журі",
    juryAccount: "Кабінет журі",
    jury: "Журі",
    categories: "Напрямки",
    grandPrix: "Гран-прі",
    home: "Головна",
  },
  header: {
    navigation: {
      home: "Головна",
      categories: "Напрямки",
      jury: "Журі",
      grandPrix: "Гран-прі",
    },
    openMenu: "Відкрити меню",
    closeMenu: "Закрити меню",
    language: "Мова",
  },
  home: {
    hero: {
      eyebrow: "IBPA Beauty Award 2026",
      title:
        "Визнання видатних досягнень у сфері краси, beauty-освіти, здоров'я та інновацій у брендингу.",
      description:
        "Преміальна платформа для ліцензованих фахівців, викладачів, салонів і брендів. Оберіть напрямок, надішліть портфоліо та пройдіть оцінювання офіційного журі IBPA.",
      categoriesCta: "Переглянути напрямки",
    },
    stats: [
      {
        title: "Реєстраційний внесок",
        value: "$50 за напрямок",
        text: "Вартість участі розраховується окремо для кожного вибраного напрямку. Можна вибрати кілька напрямків і оплатити їх одним платежем.",
      },
      {
        title: "Реєстрація судді",
        value: "$250",
        text: "Реєстраційний внесок сплачується тільки після схвалення кандидатури. Оплата потрібна лише після підтвердження участі як судді.",
      },
      {
        title: "Участь",
        value: "Для членів IBPA",
        text: "Подати заявку на участь у премії можуть усі активні члени асоціації IBPA.",
      },
      {
        title: "Гран-прі",
        value: "5+ номінацій",
        text: "Учасники, які подають заявки у 5 або більше номінаціях, автоматично беруть участь у Гран-прі. Переможець визначається за найбільшою сумою балів від суддів за всіма заявленими номінаціями.",
      },
    ],
    categoriesPreview: {
      label: "Напрямки",
      title: "11 напрямків досконалості в індустрії краси",
      viewAll: "Усі напрямки",
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
      title: "Як проходить премія",
      steps: [
        {
          number: "01",
          title: "Оберіть напрямок",
          text: "Оберіть один з 11 професійних напрямків і конкретну номінацію в ньому.",
        },
        {
          number: "02",
          title: "Підтвердьте членство",
          text: "Підтвердьте своє членство, вказавши номер члена IBPA.",
        },
        {
          number: "03",
          title: "Завершіть подання",
          text: "Заповніть основну заявку та завантажте матеріали, що відповідають вибраним напрямку й номінації.",
        },
        {
          number: "04",
          title: "Надішліть і оплатіть",
          text: "Надішліть заявку та здійсніть оплату через Checkout у доларах США.",
        },
        {
          number: "05",
          title: "Оцінювання журі",
          text: "Заявки переходять до офіційного етапу оцінювання журі, що передує церемонії нагородження.",
        },
      ],
    },
    grandPrix: {
      label: "Гран-прі",
      title: "Гран-прі IBPA 2026",
      text1:
        "Найвища нагорода за видатний результат, яку отримують учасники з найкращим сумарним результатом у 5 або більше номінаціях.",
      text2:
        "Гран-прі визнає загальний результат у кількох номінаціях. Учасник стає номінантом, якщо бере участь у 5 або більше номінаціях - в одному або кількох напрямках.",
      cta: "Докладніше про Гран-прі",
    },
    juryCta: {
      label: "Журі",
      title: "Подайте заявку, щоб стати офіційним суддею премії IBPA 2026",
      text1: "Кандидати до складу журі проходять професійний відбір.",
      text2:
        "Спочатку подається заявка, після чого її розглядає експертна комісія. У разі схвалення кандидат отримує запрошення та посилання для оплати реєстраційного внеску $250.",
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
          a: "Реєстраційний внесок становить $50 за кожен вибраний напрямок.",
        },
        {
          q: "Хто може брати участь?",
          a: "Подати заявку на участь у премії можуть усі активні члени асоціації IBPA.",
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
      title: "Почніть заявку на IBPA Beauty Award уже сьогодні.",
      text: "Підготуйте професійне портфоліо, завантажте матеріали та змагайтеся за одне з провідних визнань індустрії.",
      judge: "Стати суддею",
    },
  },
  categoriesPage: {
    hero: {
      eyebrow: "Напрямки премії",
      title: "11 напрямків досконалості в індустрії краси",
      description:
        "Кожен напрямок створений для окремої професійної сфери: від артистизму та догляду за шкірою до керування салоном, освіти й брендів. Учасники обирають напрямок, що найкраще відповідає їхній роботі, і подають окрему заявку.",
      entryRules: "Правила участі",
      feeLabel: "Реєстраційний внесок",
      feeValue: "$50 за напрямок",
      eligibilityLabel: "Участь",
      eligibilityValue: "Для членів IBPA",
      cta: "Подати заявку за напрямком",
    },
    cardText:
      "Професійні заявки розглядаються в межах офіційної премії IBPA.",
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
    requirements: {
      label: "Вимоги",
      title: "Хто може подати заявку до журі",
      items: [
        {
          label: "Мінімальний досвід",
          value: "5+ років",
          text: "Кандидат повинен мати щонайменше п'ять років професійного досвіду в індустрії.",
        },
        {
          label: "Експертиза",
          value: "11 напрямків",
          text: "Суддів відбирають з урахуванням експертизи у відповідних напрямах премії.",
        },
        {
          label: "Документи",
          value: "Обов'язкові",
          text: "Потрібно надати сертифікати, біографію та профільні матеріали.",
        },
        {
          label: "Правило оплати",
          value: "Після схвалення",
          text: "Внесок журі не стягується на етапі подання заявки.",
        },
      ],
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
          title: "Розгляд IBPA",
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
          text: "Після підтвердження оплати ви стаєте офіційним членом журі.",
        },
      ],
    },
    faq: {
      label: "Питання",
      title: "Поширені запитання",
      items: [
        {
          question: "Чи потрібно платити під час подання заявки?",
          answer:
            "Ні. Заявка до журі подається безкоштовно. Внесок $250 сплачується тільки після схвалення.",
        },
        {
          question: "Скільки триває розгляд?",
          answer:
            "Заявки розглядаються індивідуально, процес може тривати до 14 робочих днів.",
        },
        {
          question: "Чи всіх кандидатів буде прийнято?",
          answer:
            "Ні. Схвалення залежить від професійного досвіду, кваліфікації та відповідності складу журі.",
        },
        {
          question: "Що відбувається після схвалення?",
          answer:
            "Схвалені кандидати отримують інструкції з оплати. Після підтвердження оплати вони офіційно входять до складу журі.",
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
      text: "Представте свій професійний профіль, досвід і напрями спеціалізації для відбору до складу журі.",
    },
  },
  grandPrixPage: {
    hero: {
      eyebrow: "Гран-прі",
      title: "Гран-прі IBPA 2026",
      description:
        "Найвища нагорода за видатний результат, яку отримують учасники з найкращим сумарним результатом у 5 або більше номінаціях.",
      body:
        "Гран-прі визнає загальний результат у кількох номінаціях. Учасник стає номінантом, якщо бере участь у 5 або більше номінаціях - в одному або кількох напрямках.",
      snapshot: "Ключові умови",
      eligibility: "Критерії участі",
      eligibilityValue: "Мінімум 5 номінацій",
      evaluation: "Оцінювання",
      evaluationValue: "Сумарний бал за всіма номінаціями",
      decision: "Рішення",
      decisionValue: "Повний склад журі",
      cta: "Переглянути напрямки",
    },
    pillars: [
      {
        title: "Як стати номінантом на Гран-прі",
        text: "Учасник автоматично стає номінантом на Гран-прі, якщо бере участь мінімум у 5 номінаціях. Номінації можуть бути в одному напрямку або в кількох напрямках.",
      },
      {
        title: "Приклад",
        text: "3 номінації в напрямку «Брови» + 2 номінації в напрямку «Вії» дають право на участь у Гран-прі.",
      },
      {
        title: "Як визначається переможець Гран-прі",
        text: "Кожна номінація оцінюється суддями окремо. Усі бали підсумовуються, і перемагає учасник із найвищою сумою балів серед усіх номінантів.",
      },
    ],
    criteria: {
      label: "Важливо",
      title: "5 номінацій для кваліфікації",
      text: "Кваліфікація на Гран-прі базується на участі щонайменше у 5 номінаціях. Ці номінації можуть бути в одному напрямку або розподілені між кількома напрямками.",
      listLabel: "Ключові критерії",
      items: [
        "Критерії участі: мінімум 5 номінацій",
        "Оцінювання: сумарний бал за всіма номінаціями",
        "Рішення: повний склад журі",
      ],
    },
    flow: {
      label: "Логіка відбору",
      title: "Як ухвалюється рішення щодо Гран-прі",
      steps: [
        {
          number: "01",
          title: "Участь",
          text: "Учасник обирає та бере участь у кількох номінаціях у межах одного або різних напрямків.",
        },
        {
          number: "02",
          title: "Формування номінації",
          text: "Участь у 5 або більше номінаціях автоматично кваліфікує учасника на Гран-прі.",
        },
        {
          number: "03",
          title: "Оцінювання суддями",
          text: "Кожна номінація оцінюється суддями незалежно.",
        },
        {
          number: "04",
          title: "Підсумковий результат",
          text: "Усі бали підсумовуються, і визначається переможець із найвищим результатом.",
        },
      ],
    },
    faq: {
      label: "Питання",
      title: "FAQ Гран-прі",
      items: [
        {
          question: "Чи можна подати заявку на Гран-прі окремо?",
          answer:
            "Ні. Участь формується автоматично за участі у 5 або більше номінаціях.",
        },
        {
          question: "Чи обов'язково брати участь у різних напрямках?",
          answer:
            "Ні. Номінації можуть бути як в одному напрямку, так і в різних.",
        },
        {
          question: "Як обирається переможець?",
          answer:
            "За сумою всіх балів, отриманих за кожну номінацію.",
        },
      ],
    },
  },
  applyPage: {
    intro: {
      eyebrow: "Заявка учасника",
      title: "Надішліть заявку на участь у премії.",
      text: "Заповніть форму нижче, вказавши професійні дані та матеріали для вибраного напрямку та номінації.",
    },
    form: {
      blockA: "Блок A",
      blockATitle: "Професійний профіль і право на участь",
      blockADescription:
        "Заповніть загальний розділ заявки перед переходом до матеріалів для оцінювання за напрямком.",
      blockB: "Блок B",
      blockBTitle: "Матеріали для вибраного напрямку та номінації",
      blockBDescription: "Блок B змінюється залежно від вибраного напрямку та номінації.",
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
      feeHtml: "Внесок за участь: <strong>$50 за напрямок</strong>.",
      separate: "Кожен напрямок подається як окрема заявка.",
      juryNote: "Правила оплати для журі не застосовуються до цієї сторінки заявки учасника.",
      before: "Перед початком",
      items: [
        "Підготуйте файл ліцензії або сертифіката.",
        "Оберіть один напрямок та одну конкретну номінацію.",
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
      category: "Напрямок",
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
        "Перевіряйте профілі учасників, напрямки, файли та поточні статуси в одному закритому робочому просторі.",
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
    accessText: "Доступ до перевірки обмежений напрямками, для яких вас схвалено.",
    approvedCategories: "Схвалені напрямки",
    assigned: "Призначені заявки",
    scored: "Оцінено",
    remaining: "Залишилось",
    allCategories: "Усі напрямки",
    applicant: "Учасник",
    category: "Напрямок",
    award: "Номінація",
    status: "Статус",
    submitted: "Надіслано",
    open: "Відкрити",
    reviewScore: "Перевірити й оцінити",
    continueDraft: "Продовжити чернетку",
    viewSubmitted: "Переглянути надіслане",
    empty: "Немає заявок учасників для вашого доступу за напрямками.",
    signOut: "Вийти",
  },
  auth: {
    shellCards: [
      "Закритий доступ для учасників",
      "Преміальний стиль IBPA",
      "Захищені сторінки премії",
    ],
    access: "Доступ",
    accessText:
      "Увійдіть, щоб отримати доступ до сайту IBPA. Нові користувачі можуть зареєструватися за email і паролем, а потім перейти на основний сайт.",
    loginLink: "Увійти",
    registerLink: "Реєстрація",
    loginPage: {
      eyebrow: "Вхід журі",
      title: "Доступ до робочого простору журі IBPA",
      description:
        "Увійдіть з email і паролем, щоб перейти до панелі журі. Захищені сторінки спочатку направлять неавторизованих користувачів сюди.",
      cardEyebrow: "Вхід журі",
      cardTitle: "Вітаємо з поверненням",
      cardText: "Введіть дані для входу до робочого простору журі IBPA.",
    },
    registerPage: {
      eyebrow: "Реєстрація журі",
      title: "Створіть закритий доступ журі IBPA",
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
    },
  },
  statuses: {
    DRAFT: "Чернетка",
    PAYMENT_PENDING: "Очікує оплати",
    SUBMITTED: "Надіслано",
    UNDER_REVIEW: "На розгляді",
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
};

export const translations: Record<Language, typeof en> = {
  en,
  ru,
  ua,
};

export type Translations = typeof en;

