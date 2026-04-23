import { categories } from "@/data/home";
import { PageCard, PageSection } from "@/shared/components/layout/PageShell";

export default function CategoriesGrid() {
  return (
    <PageSection>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {categories.map((category, index) => (
          <PageCard
            key={category}
            className="group border-white/10 bg-white/5 transition hover:border-[#d8c27a]/45 hover:bg-white/[0.07]"
          >
            <p className="text-sm text-[#8b8578]">
              {String(index + 1).padStart(2, "0")}
            </p>
            <p className="mt-3 text-xl font-medium text-white group-hover:text-[#f0e0a6]">
              {category}
            </p>
            <p className="page-copy mt-3 text-sm">
              Professional submissions are reviewed within the official IBPA
              championship framework.
            </p>
          </PageCard>
        ))}
      </div>
    </PageSection>
  );
}
