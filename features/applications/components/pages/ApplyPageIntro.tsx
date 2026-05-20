"use client";

import {
  ClipboardCheck,
  CreditCard,
  FileText,
  Search,
} from "lucide-react";

import { useLanguage } from "@/lib/i18n/LanguageProvider";

import {
  FeatureCard,
  IconBadge,
  SectionHeading,
  StaggerContainer,
} from "@/shared/components/public";

export default function ApplyPageIntro() {
  const { language, t } = useLanguage();

  const copy = {
    en: {
      chooseDirection: "Choose direction",
      chooseDirectionText:
        "Select your direction and nomination before uploading materials.",

      preparePortfolio: "Prepare portfolio",
      preparePortfolioText:
        "Upload direction-relevant media and supporting documents.",

      reviewDetails: "Review details",
      reviewDetailsText:
        "Confirm all fields and files before final submission.",

      completeFee: "Complete fee",
      completeFeeText:
        "Finalize participation through secure Stripe checkout.",
    },

    ru: {
      chooseDirection: "Выберите направление",
      chooseDirectionText:
        "Выберите направление и номинацию до загрузки материалов.",

      preparePortfolio: "Подготовьте портфолио",
      preparePortfolioText:
        "Загрузите релевантные медиафайлы и подтверждающие документы.",

      reviewDetails: "Проверьте детали",
      reviewDetailsText:
        "Проверьте все поля и файлы перед финальной отправкой.",

      completeFee: "Оплатите взнос",
      completeFeeText:
        "Завершите участие через защищенный Stripe checkout.",
    },

    ua: {
      chooseDirection: "Оберіть напрямок",
      chooseDirectionText:
        "Оберіть напрямок і номінацію перед завантаженням матеріалів.",

      preparePortfolio: "Підготуйте портфоліо",
      preparePortfolioText:
        "Завантажте релевантні медіафайли та підтвердні документи.",

      reviewDetails: "Перевірте деталі",
      reviewDetailsText:
        "Перевірте всі поля й файли перед фінальним надсиланням.",

      completeFee: "Сплатіть внесок",
      completeFeeText:
        "Завершіть участь через захищений Stripe checkout.",
    },
  }[language];

  return (
    <section className="space-y-(--space-lg)">
      <SectionHeading
        eyebrow={t.applyPage.intro.eyebrow}
        title={t.applyPage.intro.title}
        description={t.applyPage.intro.text}
      />

      <StaggerContainer
        className="grid gap-(--space-md) sm:grid-cols-2 xl:grid-cols-4"
        stagger={0.1}
      >
        <FeatureCard
          icon={<IconBadge icon={FileText} />}
          title={copy.chooseDirection}
          description={copy.chooseDirectionText}
          className="h-full min-h-[250px]"
        />

        <FeatureCard
          icon={<IconBadge icon={Search} />}
          title={copy.preparePortfolio}
          description={copy.preparePortfolioText}
          className="h-full min-h-[250px]"
        />

        <FeatureCard
          icon={<IconBadge icon={ClipboardCheck} />}
          title={copy.reviewDetails}
          description={copy.reviewDetailsText}
          className="h-full min-h-[250px]"
        />

        <FeatureCard
          icon={<IconBadge icon={CreditCard} />}
          title={copy.completeFee}
          description={copy.completeFeeText}
          className="h-full min-h-[250px]"
        />
      </StaggerContainer>
    </section>
  );
}
