"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Eye, Pencil, Trash2, Search, ArrowLeftCircle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetQuestions } from "@/hooks/useGetQuestions";
import { useDeleteQuestion } from "@/hooks/deleteQuestion";

const QUESTION_TYPE_LABELS: Record<string, string> = {
  multiple_choice_single: "Multiple Choice (Single)",
  multiple_choice_multi: "Multiple Choice (Multi)",
  text: "Text",
  numeric: "Numeric",
  boolean: "Yes / No",
};

export default function QuestionBoard() {
  const { id } = useParams();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [openDialogId, setOpenDialogId] = useState<number | null>(null);
  const { data, isLoading } = useGetQuestions(Number(id));

  const questions = Array.isArray(data) ? data : [];

  const normalized = (value: string) => value.toLowerCase().trim();

  const filteredRaw = questions.filter((q) =>
    [
      q.id,
      q.categoryId,
      q.questionText,
      q.questionType,
      q.userLevel,
      q.isActive ? "Active" : "Inactive",
    ]
      .join(" ")
      .toLowerCase()
      .includes(normalized(search))
  );

  const { mutate: deleteQuestion, isPending } = useDeleteQuestion();

  const handleDelete = (id: number) => {
    const deletedQuestion = questions.find((q) => q.id === id);
    deleteQuestion(id, {
      onSuccess: () => {
        toast.success("Question deleted", {
          description: deletedQuestion?.questionText ?? "Deleted successfully",
        });
      },
      onError: (err: any) => {
        toast.error("Failed to delete", {
          description: err.message || "Unexpected error",
        });
      },
    });
  };

  const getUserLevelBadge = (userLevel: string) => {
    switch (userLevel) {
      case "beginer":
        return <Badge className="text-blue-600 bg-blue-100">Beginner</Badge>;
      case "intermediate":
        return (
          <Badge className="text-green-600 bg-green-100">Intermediate</Badge>
        );
      case "advance":
        return <Badge className="text-red-600 bg-red-100">Advanced</Badge>;
      default:
        return <Badge className="text-gray-600 bg-gray-100">Unknown</Badge>;
    }
  };

  const getPrefixedId = (index: number, categoryId: string) => {
    const prefixMap: Record<string, string> = {
      BASIC: "B",
      MEAL: "M",
      WORKOUT: "W",
    };
    const prefix = prefixMap[categoryId] || "Q";
    return `${prefix}-${index + 1}`;
  };

  const childToParentMap = new Map<number, number>();
  questions.forEach((q) => {
    if (q.nextQuestion?.id) {
      childToParentMap.set(q.nextQuestion.id, q.id);
    }
  });

  const added = new Set<number>();
  const sortedQuestions: typeof questions = [];

  filteredRaw.forEach((parent) => {
    if (parent.nextQuestion?.id && !added.has(parent.id)) {
      sortedQuestions.push(parent);
      added.add(parent.id);

      const child = questions.find((q) => q.id === parent.nextQuestion?.id);
      if (child && !added.has(child.id)) {
        sortedQuestions.push(child);
        added.add(child.id);
      }
    }
  });

  filteredRaw.forEach((q) => {
    if (!added.has(q.id)) {
      sortedQuestions.push(q);
      added.add(q.id);
    }
  });

  const nextQuestionMap = new Map<number, number>();
  questions.forEach((q) => {
    if (q.nextQuestion?.id) {
      nextQuestionMap.set(q.nextQuestion.id, q.id);
    }
  });

  return (
    <section className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.back()}
            className="h-8 w-8"
          >
            <ArrowLeftCircle className="h-5 w-5 text-slate-600" />
          </Button>
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Questions</h2>
            <p className="text-sm text-muted-foreground">
              View and manage all questions in this questionnaire.
            </p>
          </div>
        </div>
        <Button
          onClick={() => router.push(`/dashboard/questionnaires/${id}/create`)}
        >
          + Add Question
        </Button>
      </div>

      <div className="relative max-w-md bg-white dark:bg-slate-800 border border-gray-200 rounded-md shadow-sm">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by anything..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="rounded-md border border-gray-200 shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted">
              <TableHead className="w-[90px]">ID</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Level</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Relation</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(3)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-48" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Skeleton className="h-8 w-16" />
                      <Skeleton className="h-8 w-16" />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : sortedQuestions.length > 0 ? (
              sortedQuestions.map((q, index) => (
                <TableRow
                  key={q.id}
                  onClick={() =>
                    router.push(`/dashboard/questionnaires/${q.id}/view`)
                  }
                  className="cursor-pointer hover:bg-blue-50 transition-colors"
                >
                  <TableCell className="font-medium">
                    {getPrefixedId(index, q.categoryId)}
                  </TableCell>
                  <TableCell>
                    <span>{q.questionText}</span>
                  </TableCell>
                  <TableCell className="capitalize">
                    {QUESTION_TYPE_LABELS[q.questionType]}
                  </TableCell>
                  <TableCell>{getUserLevelBadge(q.userLevel)}</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        q.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-200 text-gray-600"
                      }
                    >
                      {q.isActive ? "Active" : "Inactive"}
                    </Badge>
                    {q.isStartingQuestion && (
                      <Badge variant="secondary" className="ml-2 text-xs">
                        Starting
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2 flex-wrap">
                      {/* {q.nextQuestion?.id && (
                        <Badge className="bg-orange-100 text-orange-700 text-xs">Parent</Badge>
                      )} */}
                      {nextQuestionMap.has(q.id) && (
                        <Badge className="bg-indigo-100 text-indigo-700 text-xs">
                          Child of{" "}
                          {getPrefixedId(
                            sortedQuestions.findIndex(
                              (x) => x.id === nextQuestionMap.get(q.id)
                            ),
                            q.categoryId
                          )}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/dashboard/questionnaires/${q.id}/view`);
                        }}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/dashboard/questionnaires/${q.id}/edit`);
                        }}
                      >
                        <Pencil className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Dialog
                        open={openDialogId === q.id}
                        onOpenChange={(open) =>
                          setOpenDialogId(open ? q.id : null)
                        }
                      >
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </Button>
                        </DialogTrigger>
                        <DialogContent onClick={(e) => e.stopPropagation()}>
                          <DialogHeader>
                            <DialogTitle>Confirm Deletion</DialogTitle>
                          </DialogHeader>
                          <p className="text-sm text-muted-foreground">
                            Are you sure you want to delete{" "}
                            <strong>{q.questionText}</strong>? This action
                            cannot be undone.
                          </p>
                          <DialogFooter className="pt-4">
                            <Button
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenDialogId(null);
                              }}
                            >
                              Cancel
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(q.id);
                              }}
                            >
                              Confirm Delete
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-muted-foreground"
                >
                  No questions found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
