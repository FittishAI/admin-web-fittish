"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetQuestionsSummary } from "@/hooks/useGetQuestionsSummary";

const questionnaires = [
  {
    id: 1,
    title: "Basic Questionnaire",
    description: "Questionnaire to assess fitness goals and preferences",
    category: "BASIC" as const,
  },
  {
    id: 2,
    title: "Meal Questionnaire",
    description: "Questionnaire to understand dietary preferences and habits",
    category: "MEAL" as const,
  },
  {
    id: 3,
    title: "Workout Questionnaire",
    description: "Questionnaire about workout preferences and experience",
    category: "WORKOUT" as const,
  },
];

const categoryBadge = (category: string) =>
  category === "BASIC"
    ? "bg-blue-100 text-blue-700 text-xs"
    : category === "MEAL"
      ? "bg-yellow-100 text-yellow-700 text-xs"
      : "bg-green-100 text-green-700 text-xs";

export default function QuestionnaireList() {
  const { data: summary, isLoading } = useGetQuestionsSummary();

  const countFor = (category: string) =>
    summary?.find((s) => s.category === category);

  return (
    <section className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">
            Questionnaires
          </h2>
          <p className="text-sm text-muted-foreground">
            Manage all questionnaires for the Fittish app
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {questionnaires.map((q) => {
          const counts = countFor(q.category);

          return (
            <Link
              key={q.id}
              href={`/dashboard/questionnaires/${q.id}/questions`}
              className="transition-transform hover:scale-[1.02]"
            >
              <Card className="p-6 rounded-xl border border-muted bg-background shadow-sm hover:shadow-md transition-all h-full">
                <div className="flex flex-col h-full justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      {q.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {q.description}
                    </p>
                  </div>

                  <div className="flex justify-between items-center">
                    {isLoading ? (
                      <Skeleton className="h-4 w-24" />
                    ) : counts ? (
                      <span className="text-sm text-slate-700">
                        <span className="font-semibold">
                          {counts.questionCount}
                        </span>{" "}
                        question{counts.questionCount === 1 ? "" : "s"}
                        {counts.activeCount !== counts.questionCount && (
                          <span className="text-muted-foreground">
                            {" "}
                            · {counts.activeCount} active
                          </span>
                        )}
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                    <Badge className={categoryBadge(q.category)}>
                      {q.category}
                    </Badge>
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
