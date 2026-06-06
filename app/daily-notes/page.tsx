import { redirect } from "next/navigation";

export default function DailyNotesRedirectPage() {
  const today = new Date().toISOString().split("T")[0];
  redirect(`/calendar/${today}`);
}
