"use client";

import { useRouter } from "next/navigation";
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

export default function QuestionBoard({ categoryId }: { categoryId: string }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [openDialogId, setOpenDialogId] = useState<number | null>(null);
  const { data, isLoading } = useGetQuestions(Number(categoryId));

  const questions = Array.isArray(data) ? data : [];

  const normalized = (value: string) => value.toLowerCase().trim();

  const filtered = questions.filter((q) =>
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
        return (
          <Badge variant="default" className="text-blue-600 bg-blue-100">
            Beginner
          </Badge>
        );
      case "intermediate":
        return (
          <Badge variant="default" className="text-green-600 bg-green-100">
            Intermediate
          </Badge>
        );
      case "advance":
        return (
          <Badge variant="default" className="text-red-600 bg-red-100">
            Advanced
          </Badge>
        );
      default:
        return (
          <Badge variant="default" className="text-gray-600 bg-gray-100">
            Unknown
          </Badge>
        );
    }
  };

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
          onClick={() =>
            router.push(`/dashboard/questionnaires/${categoryId}/create`)
          }
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
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Skeleton className="h-8 w-16" />
                      <Skeleton className="h-8 w-16" />
                      <Skeleton className="h-8 w-16" />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : filtered.length > 0 ? (
              filtered.map((q) => (
                <TableRow key={q.id}>
                  <TableCell className="font-medium">Q-{q.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <span>{q.questionText}</span>
                    </div>
                  </TableCell>
                  <TableCell className="capitalize">
                    {QUESTION_TYPE_LABELS[q.questionType] || q.questionType}
                  </TableCell>
                  <TableCell className="capitalize">
                    {getUserLevelBadge(q.userLevel)}
                  </TableCell>
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
                        Starting Question
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          router.push(`/dashboard/questionnaires/${q.id}/view`)
                        }
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          router.push(`/dashboard/questionnaires/${q.id}/edit`)
                        }
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
                          <Button size="sm" variant="destructive">
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
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
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={6}
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
