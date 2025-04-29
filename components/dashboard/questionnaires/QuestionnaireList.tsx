"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, Pencil, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const questionnaires = [
  {
    id: 1,
    title: "Fitness Goal Assessment",
    description: "Questionnaire to assess fitness goals and preferences",
    questions: 5,
    created: "9/15/2023",
    updated: "9/20/2023",
    status: "Published",
  },
  {
    id: 2,
    title: "Nutrition Assessment",
    description: "Questionnaire to understand dietary preferences and habits",
    questions: 3,
    created: "10/5/2023",
    updated: "10/10/2023",
    status: "Draft",
  },
  {
    id: 3,
    title: "Sleep and Recovery",
    description: "Questionnaire about sleep patterns and recovery habits",
    questions: 2,
    created: "11/1/2023",
    updated: "11/1/2023",
    status: "Draft",
  },
];

export default function QuestionnaireList() {
  const [openDialogId, setOpenDialogId] = useState<number | null>(null);

  const handleDelete = (id: number) => {
    console.log("Deleted questionnaire with ID:", id);
    setOpenDialogId(null);
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">
            Questionnaires
          </h2>
          <p className="text-sm text-muted-foreground">
            Manage all questionnaires for the Fittish app
          </p>
        </div>
        <Link href="/dashboard/questionnaires/create">
  <Button variant="default">+ New Questionnaire</Button>
</Link>      </div>

      {questionnaires.map((q) => (
        <Card
          key={q.id}
          className="border border-muted bg-background p-4 rounded-xl shadow-sm hover:shadow transition"
        >
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div className="flex-1">
              <h3 className="font-medium text-lg text-slate-900">{q.title}</h3>
              <p className="text-sm text-muted-foreground">{q.description}</p>
              <p className="text-xs text-gray-400 mt-1">
                Questions: <strong>{q.questions}</strong> · Created: {q.created}{" "}
                · Updated: {q.updated}
              </p>
            </div>

            <div className="flex flex-col md:items-end gap-2 shrink-0">
              <Badge
                className={
                  q.status === "Published"
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }
              >
                {q.status}
              </Badge>

              <div className="flex gap-2 flex-wrap">
                <Link href={`/dashboard/questionnaires/${q.id}/view`}>
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                </Link>

                <Link href={`/dashboard/questionnaires/${q.id}/edit`}>
                  <Button variant="outline" size="sm">
                    <Pencil className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                </Link>

                <Dialog
                  open={openDialogId === q.id}
                  onOpenChange={(open) => setOpenDialogId(open ? q.id : null)}
                >
                  <DialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Confirm Deletion</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-muted-foreground">
                      Are you sure you want to delete <strong>{q.title}</strong>
                      ? This action cannot be undone.
                    </p>
                    <DialogFooter className="pt-4">
                      <Button
                        variant="ghost"
                        onClick={() => setOpenDialogId(null)}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleDelete(q.id)}
                      >
                        Confirm Delete
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </section>
  );
}
