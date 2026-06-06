"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Pencil, Plus } from "lucide-react";
import { PageShell, SectionHeading, StatInline } from "@/components/ui/page-shell";
import { ContentCard } from "@/components/ui/content-card";
import { ContextBlock } from "@/components/ContextBlock";
import { NarrativeBlock } from "@/components/ui/narrative-block";
import { TradeCard } from "@/components/TradeCard";
import { computeDayReviewStats, deriveDayReviewFields } from "@/lib/review-stats";

export default function DayTimelinePage() {
  const params = useParams();
  const dateStr = params.date as string;

  const trades = useQuery(api.trades.list);
  const dailyBias = useQuery(api.dailyBias.getByDate, { date: dateStr });
  const weekStart = getWeekStart(dateStr);

  const dayTrades = trades?.filter(
    (t) => new Date(t.createdAt).toISOString().split("T")[0] === dateStr,
  );
  const stats = computeDayReviewStats(trades, dateStr);
  const derived = deriveDayReviewFields(stats);

  const dateObj = new Date(dateStr + "T12:00:00");
  const prev = new Date(dateObj);
  prev.setDate(prev.getDate() - 1);
  const next = new Date(dateObj);
  next.setDate(next.getDate() + 1);

  const title = dateObj.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <PageShell
      title={title}
      subtitle="Day timeline — plan, trades, review"
      maxWidth="xl"
      actions={
        <div className="flex gap-2">
          <Link href={`/calendar/${prev.toISOString().split("T")[0]}`}>
            <Button variant="ghost" size="icon"><ChevronLeft className="h-4 w-4" /></Button>
          </Link>
          <Link href={`/calendar/${next.toISOString().split("T")[0]}`}>
            <Button variant="ghost" size="icon"><ChevronRight className="h-4 w-4" /></Button>
          </Link>
          <Link href="/trades/new">
            <Button size="sm" className="rounded-md"><Plus className="h-4 w-4" /> Log trade</Button>
          </Link>
        </div>
      }
    >
      <ContentCard>
        <div className="flex flex-wrap gap-6">
          <StatInline label="P&L" value={`${stats.totalPnl >= 0 ? "+" : ""}$${stats.totalPnl.toFixed(2)}`} valueClassName={stats.totalPnl >= 0 ? "text-emerald-600" : "text-red-500"} />
          <StatInline label="Trades" value={stats.totalTrades} />
          <StatInline label="Win rate" value={`${stats.winRate}%`} />
        </div>
      </ContentCard>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <SectionHeading>Morning pre-gameplan</SectionHeading>
          <Link href="/daily-bias/morning">
            <Button variant="ghost" size="sm"><Pencil className="h-3.5 w-3.5" /> Edit</Button>
          </Link>
        </div>
        {dailyBias ? (
          <>
            <ContentCard>
              <div className="flex flex-wrap gap-2 text-sm">
                <span className="font-medium">{dailyBias.currentDailyBias}</span>
                <span className="text-muted-foreground">· {dailyBias.sessionToTrade}</span>
                {dailyBias.bestInstrument && <span className="text-muted-foreground">· {dailyBias.bestInstrument}</span>}
              </div>
              <NarrativeBlock content={dailyBias.biasReason} className="mt-2" />
            </ContentCard>
            <ContextBlock
              mode="read"
              title="Morning context"
              notes={dailyBias.morningContextNotes ?? ""}
              screenshots={dailyBias.morningScreenshots ?? []}
            />
          </>
        ) : (
          <ContentCard>
            <p className="text-sm text-muted-foreground">No pre-gameplan yet.</p>
            <Link href="/daily-bias/morning"><Button size="sm" className="mt-2 rounded-md">Set pre-gameplan</Button></Link>
          </ContentCard>
        )}
      </section>

      <section className="space-y-3">
        <SectionHeading>Trades</SectionHeading>
        {dayTrades && dayTrades.length > 0 ? (
          <div className="space-y-2">{dayTrades.map((t) => <TradeCard key={t._id} trade={t} />)}</div>
        ) : (
          <ContentCard><p className="text-sm text-muted-foreground">No trades this day.</p></ContentCard>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <SectionHeading>Daily review</SectionHeading>
          <Link href="/daily-bias/evening">
            <Button variant="ghost" size="sm"><Pencil className="h-3.5 w-3.5" /> Edit</Button>
          </Link>
        </div>
        <ContentCard>
          <div className="flex flex-wrap gap-4 text-sm">
            <StatInline label="Taken" value={derived.tradesTaken} />
            <StatInline label="Worked" value={derived.tradesWorked} />
            <StatInline label="Failed" value={derived.tradesFailed} />
            <StatInline label="Discipline" value={`${derived.overallDiscipline}/10`} />
          </div>
          {dailyBias?.actualMovement && (
            <p className="mt-3 text-sm text-muted-foreground">
              Actual: {dailyBias.actualMovement}
              {dailyBias.wasCorrect && ` · Bias ${dailyBias.wasCorrect}`}
            </p>
          )}
        </ContentCard>
        {dailyBias && (
          <ContextBlock
            mode="read"
            title="Evening context"
            notes={dailyBias.eveningContextNotes ?? ""}
            screenshots={dailyBias.eveningScreenshots ?? []}
          />
        )}
      </section>

      <Link href={`/weekly/${weekStart}`} className="text-sm text-muted-foreground underline hover:text-foreground">
        View week context →
      </Link>
    </PageShell>
  );
}

function getWeekStart(dateStr: string): string {
  const d = new Date(dateStr);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d);
  monday.setDate(diff);
  return monday.toISOString().split("T")[0];
}
