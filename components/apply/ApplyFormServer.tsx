import ApplyForm from "@/components/apply/ApplyForm";
import { getApplicationCategories } from "@/lib/apply/server";

export default async function ApplyFormServer() {
  const categories = await getApplicationCategories();

  return <ApplyForm categories={categories} />;
}
