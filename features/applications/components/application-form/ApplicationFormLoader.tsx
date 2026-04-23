import ApplicationForm from "@/features/applications/components/application-form/ApplicationForm";
import { getApplicationCategories } from "@/features/applications/server/queries";

export default async function ApplyFormServer() {
  const categories = await getApplicationCategories();

  return <ApplicationForm categories={categories} />;
}
