import type { Language } from "@/lib/i18n/translations";

type LegalSection = {
  heading: string;
  body: string;
};

type LegalCopy = {
  modalTitle: string;
  sections: LegalSection[];
};

export const legalContent: Record<
  Language,
  {
    terms: LegalCopy;
    privacy: LegalCopy;
  }
> = {
  en: {
    terms: {
      modalTitle: "Terms & Conditions",
      sections: [
        {
          heading: "Website Use",
          body: "This website provides general information about the IBPA Beauty Award and related programs. By using the site, users agree to use it lawfully and respectfully.",
        },
        {
          heading: "Applications",
          body: "Application forms and submitted materials must be accurate and belong to the submitting person or organization. IBPA may review submissions for eligibility and policy compliance.",
        },
        {
          heading: "Payments",
          body: "Participation and jury fees are processed through secure payment providers. Fees, eligibility requirements, and timelines are shown in relevant application flows.",
        },
        {
          heading: "User Responsibility",
          body: "Users are responsible for maintaining accurate profile data, safeguarding account access, and ensuring uploaded materials do not violate rights of third parties.",
        },
        {
          heading: "Contact",
          body: "For legal or policy questions, please contact forum-support@ibpassociations.org.",
        },
      ],
    },
    privacy: {
      modalTitle: "Privacy Policy",
      sections: [
        {
          heading: "Collected Information",
          body: "We may collect contact information, account details, and application-related information required to evaluate participation in award programs.",
        },
        {
          heading: "Uploaded Files",
          body: "Files uploaded for applications are stored to support review processes and operational records associated with your submission.",
        },
        {
          heading: "Payment Data",
          body: "Payment processing is handled by third-party payment services. Sensitive payment card data is processed by those providers under their own compliance standards.",
        },
        {
          heading: "Cookies & Analytics",
          body: "The website may use cookies and analytics tools to improve user experience, site reliability, and performance insights.",
        },
        {
          heading: "Data Protection",
          body: "We apply reasonable technical and organizational safeguards to protect personal information against unauthorized access, disclosure, or misuse.",
        },
        {
          heading: "Contact",
          body: "For privacy requests or concerns, contact forum-support@ibpassociations.org.",
        },
      ],
    },
  },
  ru: {
    terms: {
      modalTitle: "Условия использования",
      sections: [
        {
          heading: "Использование сайта",
          body: "Сайт предоставляет общую информацию о премии IBPA Beauty Award и связанных программах. Используя сайт, пользователь соглашается использовать его законно и добросовестно.",
        },
        {
          heading: "Заявки",
          body: "Данные в заявках и загружаемые материалы должны быть достоверными и принадлежать заявителю или организации. IBPA может проверять материалы на соответствие требованиям.",
        },
        {
          heading: "Оплата",
          body: "Оплата участия и регистрационных взносов жюри проводится через защищенных платежных провайдеров. Условия и сроки оплаты указываются в соответствующих формах.",
        },
        {
          heading: "Ответственность пользователя",
          body: "Пользователь несет ответственность за актуальность данных профиля, безопасность доступа к аккаунту и соблюдение прав третьих лиц при загрузке материалов.",
        },
        {
          heading: "Контакт",
          body: "По юридическим вопросам свяжитесь с нами: forum-support@ibpassociations.org.",
        },
      ],
    },
    privacy: {
      modalTitle: "Политика конфиденциальности",
      sections: [
        {
          heading: "Собираемая информация",
          body: "Мы можем собирать контактные данные, данные аккаунта и информацию по заявкам, необходимую для участия в программах премии.",
        },
        {
          heading: "Загружаемые файлы",
          body: "Файлы, загруженные в рамках заявок, хранятся для процедуры рассмотрения и ведения операционных записей по вашей заявке.",
        },
        {
          heading: "Платежные данные",
          body: "Обработка платежей выполняется сторонними платежными сервисами. Конфиденциальные данные карты обрабатываются этими сервисами в соответствии с их стандартами.",
        },
        {
          heading: "Cookies и аналитика",
          body: "Сайт может использовать cookies и инструменты аналитики для улучшения пользовательского опыта, надежности и производительности.",
        },
        {
          heading: "Защита данных",
          body: "Мы применяем разумные технические и организационные меры для защиты персональных данных от несанкционированного доступа и неправомерного использования.",
        },
        {
          heading: "Контакт",
          body: "По вопросам конфиденциальности свяжитесь с нами: forum-support@ibpassociations.org.",
        },
      ],
    },
  },
  ua: {
    terms: {
      modalTitle: "Умови використання",
      sections: [
        {
          heading: "Використання сайту",
          body: "Сайт надає загальну інформацію про IBPA Beauty Award та пов’язані програми. Користуючись сайтом, користувач погоджується використовувати його законно та відповідально.",
        },
        {
          heading: "Заявки",
          body: "Дані у заявках і завантажені матеріали мають бути достовірними та належати заявнику або організації. IBPA може перевіряти подані матеріали на відповідність вимогам.",
        },
        {
          heading: "Оплати",
          body: "Оплати за участь і реєстраційні внески журі обробляються через захищених платіжних провайдерів. Умови та строки оплат вказуються у відповідних формах.",
        },
        {
          heading: "Відповідальність користувача",
          body: "Користувач відповідає за актуальність даних профілю, безпеку доступу до акаунта та дотримання прав третіх осіб при завантаженні матеріалів.",
        },
        {
          heading: "Контакт",
          body: "З юридичних питань звертайтесь: forum-support@ibpassociations.org.",
        },
      ],
    },
    privacy: {
      modalTitle: "Політика конфіденційності",
      sections: [
        {
          heading: "Зібрана інформація",
          body: "Ми можемо збирати контактні дані, дані акаунта та інформацію із заявок, необхідну для участі у програмах премії.",
        },
        {
          heading: "Завантажені файли",
          body: "Файли, завантажені в межах заявок, зберігаються для процесу розгляду та ведення операційних записів за вашою заявкою.",
        },
        {
          heading: "Платіжні дані",
          body: "Оплати обробляються сторонніми платіжними сервісами. Чутливі дані картки обробляються цими сервісами відповідно до їхніх стандартів.",
        },
        {
          heading: "Cookies та аналітика",
          body: "Сайт може використовувати cookies і аналітичні інструменти для покращення користувацького досвіду, надійності та продуктивності.",
        },
        {
          heading: "Захист даних",
          body: "Ми застосовуємо розумні технічні та організаційні заходи для захисту персональних даних від несанкціонованого доступу та неправомірного використання.",
        },
        {
          heading: "Контакт",
          body: "З питань конфіденційності звертайтесь: forum-support@ibpassociations.org.",
        },
      ],
    },
  },
};
