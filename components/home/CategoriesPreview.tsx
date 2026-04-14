import SectionTitle from "@/components/ui/SectionTitle";
import { categories } from "@/data/home";

export default function CategoriesPreview() {
  return (
    <section className="border-y border-white/10 bg-[#141415]">
      <div className="mx-auto max-w-7xl px-6 py-20 md:px-10 lg:px-12">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionTitle
            label="Categories"
            title="12 championship paths for today’s beauty industry."
            className="max-w-2xl"
          />

          <a
            href="/categories"
            className="text-sm uppercase tracking-[0.16em] text-[#d8c27a] transition hover:text-white"
          >
            View all categories →
          </a>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {categories.map((category, index) => (
            <a
              key={category}
              href="/categories"
              className="group rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:border-[#d8c27a]/45 hover:bg-white/[0.07]"
            >
              <div className="text-sm text-[#8b8578]">
                {String(index + 1).padStart(2, "0")}
              </div>
              <div className="mt-3 text-lg font-medium text-white group-hover:text-[#f0e0a6]">
                {category}
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
