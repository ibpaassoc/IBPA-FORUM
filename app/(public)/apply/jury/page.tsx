import { notFound } from "next/navigation";

// Public jury applications are closed. This route intentionally renders the
// global 404 (via notFound()) so the old application form is no longer reachable
// and search engines drop the URL. Existing jury accounts, dashboards, scoring,
// and admin review are unaffected.
export default function JuryApplyPage() {
  notFound();
}
