import { redirect } from "next/navigation";

export default async function JuryLoginPage() {
  redirect("/login?role=jury");
}
