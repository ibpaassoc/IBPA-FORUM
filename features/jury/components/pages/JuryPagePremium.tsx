"use client";

import Link from "next/link";
import {
  Award,
  BadgeCheck,
  ClipboardCheck,
  CreditCard,
  FileText,
  Search,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import {
  EditorialHero,
  EditorialPhotoCard,
  FeaturedStorySection,
  IconBadge,
  PremiumCTA,
  ProcessTimeline,
  SectionHeading,
  StaggerContainer,
} from "@/shared/components/public";
import PublicJuryGrid from "./PublicJuryGrid";

type JuryMember = {
  id: string;
  fullName: string;
  professionalTitle?: string | null;
  city?: string | null;
  country?: string | null;
  bio?: string | null;
  expertise?: string[] | null;
  profilePhotoFileId?: string | null;
};

export default function JuryPagePremium({ juryMembers }: { juryMembers: JuryMember[] }) {
  const { language, t } = useLanguage();
  const copy = {
    en: {
      heroEyebrow: "IBPA Jury Council",
      heroTitle: "Become an Official IBPA Judge",
      heroText: "A premium judging council built for fairness, expertise, and global credibility.",
      leadershipTitle: "Leadership, trust, and independent standards",
      credibility: "Credibility",
      credibilityText:
        "Every judge must demonstrate proven professional experience and direction-level expertise.",
      processLabel: "Jury Process",
      processTitle: "A connected 3-step application journey",
      processText: "Clear progression from submission to official panel activation.",
      apply: "Apply",
      approved: "Get approved",
      registration: "Confirm registration",
      applyText: "Submit your profile, experience details, and required professional materials.",
      approvedText: "IBPA evaluates your expertise and confirms your fit for designated directions.",
      registrationText:
        "Approved candidates complete the official registration payment and join the panel.",
      benefitsEyebrow: "Judge Benefits",
      benefitsTitle: "Why experts join the IBPA judging council",
      benefitsText: "A serious professional role with visible impact and international recognition.",
      b1Title: "Official recognition",
      b1Text: "Be listed as a verified IBPA jury member and represent industry standards.",
      b2Title: "Trusted framework",
      b2Text: "Evaluate submissions through a transparent and structured judging process.",
      b3Title: "Professional network",
      b3Text: "Join an international community of beauty leaders and educators.",
      b4Title: "Profile credibility",
      b4Text: "Strengthen your professional authority through an official award role.",
      statementEyebrow: "Credibility Statement",
      statementTitle: "Every score should reflect both artistry and professional integrity.",
      statementText: "IBPA judges are selected for expertise, neutrality, and commitment to fair evaluation.",
      statementQuote: "Judging is not only about outcomes. It is about trust in the process.",
      approvedEyebrow: "Approved Jury",
      approvedTitle: "Current IBPA Jury Members",
      approvedSectionText: "A live roster of approved judges participating in the award.",
      ctaEyebrow: "Jury Council",
      ctaTitle: "Bring your expertise to the IBPA stage",
      ctaText: "Apply to become an official judge and contribute to fair, professional nomination decisions.",
      ctaPrimary: "Start Jury Application",
      ctaSecondary: "Jury Login",
      ctaAside: "Approval is required before registration payment.",
    },
    ru: {
      heroEyebrow: "Совет жюри IBPA",
      heroTitle: "Станьте официальным судьей IBPA",
      heroText: "Премиальный состав жюри для честного, экспертного и международно признанного судейства.",
      leadershipTitle: "Лидерство, доверие и независимые стандарты",
      credibility: "Доверие",
      credibilityText:
        "Каждый судья должен подтвердить профессиональный опыт и экспертизу по направлениям.",
      processLabel: "Процесс жюри",
      processTitle: "Связанная 3-этапная заявка",
      processText: "Понятный путь от подачи до официального включения в состав жюри.",
      apply: "Подача",
      approved: "Одобрение",
      registration: "Подтверждение регистрации",
      applyText: "Отправьте профиль, опыт и необходимые профессиональные материалы.",
      approvedText: "IBPA оценивает вашу экспертизу и подтверждает соответствие выбранным направлениям.",
      registrationText:
        "Одобренные кандидаты оплачивают официальный регистрационный взнос и входят в состав жюри.",
      benefitsEyebrow: "Преимущества судьи",
      benefitsTitle: "Почему эксперты входят в совет жюри IBPA",
      benefitsText: "Серьезная профессиональная роль с заметным вкладом и международным признанием.",
      b1Title: "Официальное признание",
      b1Text: "Публикуйтесь как подтвержденный член жюри IBPA и представляйте отраслевые стандарты.",
      b2Title: "Надежная система",
      b2Text: "Оценивайте заявки через прозрачный и структурированный процесс судейства.",
      b3Title: "Профессиональное сообщество",
      b3Text: "Присоединяйтесь к международному кругу лидеров и преподавателей beauty-сферы.",
      b4Title: "Профильная репутация",
      b4Text: "Укрепляйте профессиональный авторитет через официальную роль в премии.",
      statementEyebrow: "Позиция доверия",
      statementTitle: "Каждый балл должен отражать мастерство и профессиональную честность.",
      statementText: "Судьи IBPA отбираются по экспертизе, нейтральности и приверженности справедливой оценке.",
      statementQuote: "Судейство - это не только результат. Это доверие к процессу.",
      approvedEyebrow: "Одобренное жюри",
      approvedTitle: "Текущий состав жюри IBPA",
      approvedSectionText: "Актуальный список одобренных судей, участвующих в премии.",
      ctaEyebrow: "Совет жюри",
      ctaTitle: "Примените свою экспертизу на сцене IBPA",
      ctaText: "Подайте заявку в жюри и участвуйте в справедливых профессиональных решениях по номинациям.",
      ctaPrimary: "Начать заявку в жюри",
      ctaSecondary: "Вход для жюри",
      ctaAside: "Оплата регистрации доступна только после одобрения.",
    },
    ua: {
      heroEyebrow: "Рада журі IBPA",
      heroTitle: "Станьте офіційним суддею IBPA",
      heroText: "Преміальний склад журі для чесного, експертного та міжнародно визнаного суддівства.",
      leadershipTitle: "Лідерство, довіра та незалежні стандарти",
      credibility: "Довіра",
      credibilityText:
        "Кожен суддя має підтвердити професійний досвід і експертизу за напрямками.",
      processLabel: "Процес журі",
      processTitle: "Пов'язана 3-етапна заявка",
      processText: "Зрозумілий шлях від подання до офіційного включення до складу журі.",
      apply: "Подання",
      approved: "Схвалення",
      registration: "Підтвердження реєстрації",
      applyText: "Надішліть профіль, досвід і необхідні професійні матеріали.",
      approvedText: "IBPA оцінює вашу експертизу та підтверджує відповідність обраним напрямкам.",
      registrationText:
        "Схвалені кандидати сплачують офіційний реєстраційний внесок і входять до складу журі.",
      benefitsEyebrow: "Переваги судді",
      benefitsTitle: "Чому експерти входять до ради журі IBPA",
      benefitsText: "Серйозна професійна роль із помітним внеском і міжнародним визнанням.",
      b1Title: "Офіційне визнання",
      b1Text: "Публікуйтесь як підтверджений член журі IBPA і представляйте галузеві стандарти.",
      b2Title: "Надійна система",
      b2Text: "Оцінюйте заявки через прозорий і структурований процес суддівства.",
      b3Title: "Професійна спільнота",
      b3Text: "Долучайтеся до міжнародної спільноти лідерів і викладачів beauty-сфери.",
      b4Title: "Профільна репутація",
      b4Text: "Посилюйте професійний авторитет через офіційну роль у премії.",
      statementEyebrow: "Позиція довіри",
      statementTitle: "Кожен бал має відображати майстерність і професійну доброчесність.",
      statementText: "Суддів IBPA відбирають за експертизою, нейтральністю та відданістю справедливому оцінюванню.",
      statementQuote: "Суддівство - це не лише результат. Це довіра до процесу.",
      approvedEyebrow: "Схвалене журі",
      approvedTitle: "Поточний склад журі IBPA",
      approvedSectionText: "Актуальний список схвалених суддів, які беруть участь у премії.",
      ctaEyebrow: "Рада журі",
      ctaTitle: "Застосуйте свою експертизу на сцені IBPA",
      ctaText: "Подайте заявку до журі та долучайтеся до справедливих професійних рішень за номінаціями.",
      ctaPrimary: "Почати заявку до журі",
      ctaSecondary: "Вхід для журі",
      ctaAside: "Оплата реєстрації доступна лише після схвалення.",
    },
  }[language];

  return (
    <main className="page-shell">
      <EditorialHero
        eyebrow={copy.heroEyebrow}
        title={copy.heroTitle}
        description={copy.heroText}
        actions={
          <div className="flex flex-wrap gap-3">
            <Link href="/apply/jury" className="ibpa-button ibpa-button-primary">
              {t.common.applyAsJudge}
            </Link>
            <Link href="/jury/register" className="ibpa-button ibpa-button-ghost">
              {t.common.juryAccount}
            </Link>
          </div>
        }
        media={
          <div className="grid gap-[var(--space-md)]">
            <EditorialPhotoCard
              src="/images/curated/jury_editorial.jpg"
              alt="Jury hero leadership portrait"
              aspect="landscape"
              overlay="soft"
              title={copy.leadershipTitle}
              objectPosition="center 30%"
              mobileObjectPosition="center 24%"
              priority
            />
            <div className="grid gap-[var(--space-md)] md:grid-cols-2">
              <EditorialPhotoCard
                src="/images/events/DSC00452.jpg"
                alt="Jury collaboration close-up"
                aspect="square"
                overlay="soft"
                objectPosition="center 30%"
                mobileObjectPosition="center 24%"
              />
              <EditorialPhotoCard
                src="/images/events/DSC00947.jpg"
                alt="Judge reviewing application materials"
                aspect="square"
                overlay="soft"
                objectPosition="center 30%"
                mobileObjectPosition="center 24%"
              />
            </div>
          </div>
        }
        floatingCard={
          <article className="page-card rounded-[var(--radius)] p-[var(--space-md)]">
            <p className="text-[0.67rem] uppercase tracking-[0.2em] text-[var(--color-hover)]">{copy.credibility}</p>
            <p className="mt-1 font-[var(--font-title-family)] text-[clamp(1.6rem,2.1vw,2.2rem)] leading-[1.1] text-[var(--color-ink)]">
              {t.juryPage.hero.experienceValue}
            </p>
            <p className="mt-2 text-sm leading-[1.7] text-[var(--color-ink-soft)]">{copy.credibilityText}</p>
          </article>
        }
      />

      <ProcessTimeline
        eyebrow={copy.processLabel}
        title={copy.processTitle}
        description={copy.processText}
        steps={[
          {
            id: "1",
            icon: <IconBadge icon={FileText} />,
            title: copy.apply,
            text: copy.applyText,
          },
          {
            id: "2",
            icon: <IconBadge icon={Search} />,
            title: copy.approved,
            text: copy.approvedText,
          },
          {
            id: "3",
            icon: <IconBadge icon={CreditCard} />,
            title: copy.registration,
            text: copy.registrationText,
          },
        ]}
      />

      <section className="section-rhythm-tight">
        <div className="page-section">
          <SectionHeading
            eyebrow={copy.benefitsEyebrow}
            title={copy.benefitsTitle}
            description={copy.benefitsText}
          />
          <StaggerContainer className="mt-[var(--space-lg)] grid gap-[var(--space-md)] md:grid-cols-2">
            {[
              {
                title: copy.b1Title,
                text: copy.b1Text,
                icon: Award,
              },
              {
                title: copy.b2Title,
                text: copy.b2Text,
                icon: ShieldCheck,
              },
              {
                title: copy.b3Title,
                text: copy.b3Text,
                icon: Users,
              },
              {
                title: copy.b4Title,
                text: copy.b4Text,
                icon: BadgeCheck,
              },
            ].map((item) => (
              <article key={item.title} className="page-card rounded-[var(--radius)] p-[var(--space-lg)]">
                <IconBadge icon={item.icon} />
                <h3 className="mt-[var(--space-sm)] text-[clamp(1.2rem,2vw,1.6rem)] leading-[1.2] text-[var(--color-ink)]">
                  {item.title}
                </h3>
                <p className="mt-[var(--space-xs)] text-sm leading-[1.75] text-[var(--color-ink-soft)]">{item.text}</p>
              </article>
            ))}
          </StaggerContainer>
        </div>
      </section>

      <FeaturedStorySection
        eyebrow={copy.statementEyebrow}
        title={copy.statementTitle}
        description={copy.statementText}
        quote={copy.statementQuote}
        media={
          <EditorialPhotoCard
            src="/images/community/DSC00365.jpg"
            alt="Jury leadership and community photo"
            aspect="landscape"
            overlay="soft"
            objectPosition="center 30%"
            mobileObjectPosition="center 24%"
          />
        }
      />

      {juryMembers.length > 0 ? (
        <section className="section-rhythm-tight">
          <div className="page-section">
            <SectionHeading
              eyebrow={copy.approvedEyebrow}
              title={copy.approvedTitle}
              description={copy.approvedSectionText}
            />
            <div className="mt-[var(--space-lg)]">
              <PublicJuryGrid members={juryMembers} />
            </div>
          </div>
        </section>
      ) : null}

      <PremiumCTA
        eyebrow={copy.ctaEyebrow}
        title={copy.ctaTitle}
        description={copy.ctaText}
        primary={{ href: "/apply/jury", label: copy.ctaPrimary }}
        secondary={{ href: "/jury/login", label: copy.ctaSecondary }}
        aside={
          <div className="inline-flex items-center gap-2 text-sm text-[var(--color-ink-soft)]">
            <IconBadge icon={ClipboardCheck} size={20} />
            {copy.ctaAside}
          </div>
        }
      />
    </main>
  );
}
