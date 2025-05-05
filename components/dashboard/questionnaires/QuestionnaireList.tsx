"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

const questionnaires = [
  {
    id: 1,
    title: "Basic Questionnaire",
    description: "Questionnaire to assess fitness goals and preferences",
    category: "BASIC",
  },
  {
    id: 2,
    title: "Meal Questionnaire",
    description: "Questionnaire to understand dietary preferences and habits",
    category: "MEAL",
  },
  {
    id: 3,
    title: "Workout Questionnaire",
    description: "Questionnaire about sleep patterns and recovery habits",

    category: "WORKOUT",
  },
];

export default function QuestionnaireList() {
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
        {/* New button can be added here if needed */}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {questionnaires.map((q) => (
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
                  {/* <Badge
                    className={
                      q.status === "Published"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }
                  >
                    {q.status}
                  </Badge> */}
                  <Badge
                    className={
                      q.category === "BASIC"
                        ? "bg-blue-100 text-blue-700 text-xs"
                        : q.category === "MEAL"
                        ? "bg-yellow-100 text-yellow-700 text-xs"
                        : "bg-green-100 text-green-700 text-xs"
                    }
                  >
                    {q.category}
                  </Badge>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
