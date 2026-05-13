"use client";

import { ClipboardCheck, CreditCard, FileText, Search } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import {
  EditorialPhotoCard,
  FeatureCard,
  IconBadge,
  SectionHeading,
  StaggerContainer,
} from "@/shared/components/public";

export default function ApplyPageIntro() {
  const { language, t } = useLanguage();
  const copy = {
    en: {
      cardTitle: "Enter with confidence",
      cardDescription: "A guided form designed for high-quality professional submissions.",
      chooseDirection: "Choose direction",
      chooseDirectionText: "Select your direction and nomination before uploading materials.",
      preparePortfolio: "Prepare portfolio",
      preparePortfolioText: "Upload direction-relevant media and supporting documents.",
      reviewDetails: "Review details",
      reviewDetailsText: "Confirm all fields and files before final submission.",
      completeFee: "Complete fee",
      completeFeeText: "Finalize participation through secure Stripe checkout.",
    },
    ru: {
      cardTitle: "Подавайте уверенно",
      cardDescription: "Пошаговая форма для качественной профессиональной заявки.",
      chooseDirection: "Выберите направление",
      chooseDirectionText: "Выберите направление и номинацию до загрузки материалов.",
      preparePortfolio: "Подготовьте портфолио",
      preparePortfolioText: "Загрузите релевантные медиафайлы и подтверждающие документы.",
      reviewDetails: "Проверьте детали",
      reviewDetailsText: "Проверьте все поля и файлы перед финальной отправкой.",
      completeFee: "Оплатите взнос",
      completeFeeText: "Завершите участие через защищенный Stripe checkout.",
    },
    ua: {
      cardTitle: "Подавайте впевнено",
      cardDescription: "Покрокова форма для якісної професійної заявки.",
      chooseDirection: "Оберіть напрямок",
      chooseDirectionText: "Оберіть напрямок і номінацію перед завантаженням матеріалів.",
      preparePortfolio: "Підготуйте портфоліо",
      preparePortfolioText: "Завантажте релевантні медіафайли та підтвердні документи.",
      reviewDetails: "Перевірте деталі",
      reviewDetailsText: "Перевірте всі поля й файли перед фінальним надсиланням.",
      completeFee: "Сплатіть внесок",
      completeFeeText: "Завершіть участь через захищений Stripe checkout.",
    },
  }[language];

  return (
    <div className="space-y-(--space-lg)">
      <SectionHeading
        eyebrow={t.applyPage.intro.eyebrow}
        title={t.applyPage.intro.title}
        description={t.applyPage.intro.text}
      />

      <div className="grid gap-(--space-md) xl:grid-cols-[0.95fr_1.05fr]">
        <EditorialPhotoCard
          src="/images/curated/apply_editorial.jpg"
          alt="Apply page onboarding editorial photo"
          aspect="portrait"
          overlay="soft"
          title={copy.cardTitle}
          description={copy.cardDescription}
          priority
        />
        <StaggerContainer className="grid gap-(--space-md) md:grid-cols-2" stagger={0.1}>
          <FeatureCard
            icon={<IconBadge icon={FileText} />}
            title={copy.chooseDirection}
            description={copy.chooseDirectionText}
          />
          <FeatureCard
            icon={<IconBadge icon={Search} />}
            title={copy.preparePortfolio}
            description={copy.preparePortfolioText}
          />
          <FeatureCard
            icon={<IconBadge icon={ClipboardCheck} />}
            title={copy.reviewDetails}
            description={copy.reviewDetailsText}
          />
          <FeatureCard
            icon={<IconBadge icon={CreditCard} />}
            title={copy.completeFee}
            description={copy.completeFeeText}
          />
        </StaggerContainer>
      </div>
    </div>
  );
}
