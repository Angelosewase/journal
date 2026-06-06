import { redirect } from "next/navigation";

type Props = Readonly<{ params: Promise<{ id: string }> }>;

export default async function WeeklyEditPage({ params }: Props) {
  const { id } = await params;
  redirect(`/weekly/${id}`);
}
