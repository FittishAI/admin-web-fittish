'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  PlusCircle,
  ArrowLeftCircle,
  Save,
} from "lucide-react";
import { QuestionForm } from "./QuestionForm";
import { Questionnaire, Question } from "@/lib/types";

const mockData: Questionnaire[] = [
  {
    id: "1",
    title: "Fitness Goal Assessment",
    description: "Questionnaire to assess fitness goals and preferences",
    status: "published",
    createdAt: "2023-09-15",
    updatedAt: "2023-09-20",
    questions: [
      {
        id: "q1",
        text: "What are your fitness goals?",
        description: "",
        type: "text",
        required: true,
        order: 1,
      },
    ],
  },
];

export default function EditQuestionnaire({ id }: { id: string }) {
  const router = useRouter();
  const existingQuestionnaire = mockData.find((q) => q.id === id);

  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(
    existingQuestionnaire ?? null
  );

  if (!questionnaire) {
    // Delay navigation until after render to avoid React warning
    if (typeof window !== "undefined") {
      router.replace("/dashboard/questionnaires");
    }
    return null;
  }

  const handleAddQuestion = () => {
    const newQuestion: Question = {
      id: `q-${Date.now()}`,
      text: "New Question",
      description: "",
      type: "text",
      required: false,
      order: questionnaire.questions.length + 1,
    };

    setQuestionnaire({
      ...questionnaire,
      questions: [...questionnaire.questions, newQuestion],
    });
  };

  const handleQuestionChange = (updated: Question, index: number) => {
    const updatedQuestions = [...questionnaire.questions];
    updatedQuestions[index] = updated;

    setQuestionnaire({
      ...questionnaire,
      questions: updatedQuestions,
    });
  };

  const handleQuestionDelete = (index: number) => {
    const newQuestions = [...questionnaire.questions];
    newQuestions.splice(index, 1);

    setQuestionnaire({
      ...questionnaire,
      questions: newQuestions,
    });
  };

  const handleSave = () => {
    console.log("Saved:", questionnaire);
    router.push(`/dashboard/questionnaires/${questionnaire.id}`);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeftCircle className="h-5 w-5 text-slate-600" />
        </Button>
        <h1 className="text-3xl font-semibold text-slate-800">
          Edit Questionnaire
        </h1>
      </div>

      {/* Details Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Questionnaire Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={questionnaire.title}
                onChange={(e) =>
                  setQuestionnaire({
                    ...questionnaire,
                    title: e.target.value,
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={questionnaire.status}
                onValueChange={(value: string) =>
                  setQuestionnaire({
                    ...questionnaire,
                    status: value as "draft" | "published",
                  })
                }
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={questionnaire.description}
              onChange={(e) =>
                setQuestionnaire({
                  ...questionnaire,
                  description: e.target.value,
                })
              }
              rows={3}
              placeholder="Add questionnaire summary or instructions"
            />
          </div>
        </CardContent>
      </Card>

      {/* Questions List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-800">
            Questions ({questionnaire.questions.length})
          </h2>
          <Button onClick={handleAddQuestion} className="flex items-center gap-2 text-sm">
            <PlusCircle className="h-4 w-4 text-blue-600" />
            Add Question
          </Button>
        </div>

        {questionnaire.questions.length > 0 ? (
          questionnaire.questions.map((q, index) => (
            <QuestionForm
              key={q.id}
              question={q}
              questionIndex={index}
              onQuestionChange={handleQuestionChange}
              onQuestionDelete={handleQuestionDelete}
            />
          ))
        ) : (
          <div className="border border-dashed rounded-md text-center p-8 text-muted-foreground">
            No questions yet. Use “Add Question” to get started.
          </div>
        )}
      </div>

      {/* Footer Buttons */}
      <div className="flex items-center justify-end gap-3">
        <Button variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          className="bg-blue-600 text-white hover:bg-blue-700"
        >
          <Save className="mr-2 h-4 w-4" />
          Save Questionnaire
        </Button>
      </div>
    </div>
  );
}
