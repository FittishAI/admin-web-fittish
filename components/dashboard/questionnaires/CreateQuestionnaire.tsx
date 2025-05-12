"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation"; // Updated to use useParams
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeftCircle, Save, Trash2, PlusCircle } from "lucide-react";
import { toast } from "sonner";
import { useCreateQuestion } from "@/hooks/useCreateQuestion";
import { SuggestiveQuestionSearch } from "@/components/ui/combobox";
import SuggestiveSearch from "../resusable/SuggestiveSearch/SuggestiveSearch";
import { fetchQuestions } from "@/lib/api/questions";

const emptyQuestion = () => ({
  questionText: "",
  questionType: "text",
  required: true,
  isStartingQuestion: false,
  status: "draft",
  description: "",
  options: [],
});

const categoryMap: Record<string, number> = {
  BASIC: 1,
  MEAL: 2,
  WORKOUT: 3,
};

export default function CreateQuestion() {
  const router = useRouter();
  const { id } = useParams();
  const { mutate: createQuestion, isPending } = useCreateQuestion();

  const [questionData, setQuestionData] = useState<any>(null);
  const [options, setOptions] = useState<any[]>([]);
  const [nextQuestion, setNextQuestion] = useState<any | null>(null);
  const [nextOptions, setNextOptions] = useState<any[]>([]);

  useEffect(() => {
    const categoryMapping: { [key: string]: string } = {
      "1": "BASIC",
      "2": "MEAL",
      "3": "WORKOUT",
    };

    setQuestionData({
      questionText: "",
      questionType: "text",
      required: false,
      status: "draft",
      description: "",
      categoryId: categoryMapping[Number(id)] || "BASIC",
      isStartingQuestion: true,
      dependencyQuestion: false,
    });
  }, [id]);

  const updateQuestionField = (field: string, value: any) => {
    setQuestionData({ ...questionData, [field]: value });
  };

  const updateNextQuestionField = (field: string, value: any) => {
    if (!nextQuestion) return;
    setNextQuestion({ ...nextQuestion, [field]: value });
  };

  const updateOptions = (opts: any[]) => setOptions(opts);
  const updateNextOptions = (opts: any[]) => setNextOptions(opts);

  const handleOptionChange = (index: number, value: string, isNext = false) => {
    const target = isNext ? [...nextOptions] : [...options];
    target[index].optionText = value;
    isNext ? updateNextOptions(target) : updateOptions(target);
  };

  const addOption = (isNext = false) => {
    const newOpt = { id: Date.now(), optionText: "" };
    isNext
      ? updateNextOptions([...nextOptions, newOpt])
      : updateOptions([...options, newOpt]);
  };

  const deleteOption = (index: number, isNext = false) => {
    const target = isNext ? [...nextOptions] : [...options];
    target.splice(index, 1);
    isNext ? updateNextOptions(target) : updateOptions(target);
  };

  const handleTypeChange = (value: string, isNext = false) => {
    let updatedOptions: any[] = [];

    if (value === "boolean") {
      updatedOptions = [
        { id: 1, optionText: "Yes" },
        { id: 2, optionText: "No" },
      ];
    }

    if (isNext) {
      setNextQuestion({ ...nextQuestion, questionType: value });
      updateNextOptions(updatedOptions);
    } else {
      setQuestionData({ ...questionData, questionType: value });
      updateOptions(updatedOptions);
    }
  };

  const validateQuestion = (q: any, opts: any[], label = "Question") => {
    if (!q?.questionText?.trim()) {
      toast.error(`${label} text is required`);
      return false;
    }
    if (
      ["multiple_choice_single", "multiple_choice_multi", "boolean"].includes(
        q.questionType
      ) &&
      opts.length === 0
    ) {
      toast.error(`${label} requires at least one option`);
      return false;
    }
    return true;
  };

  const handleSave = () => {
    if (!questionData) return;

    if (!validateQuestion(questionData, options, "Main Question")) return;
    if (
      nextQuestion &&
      !validateQuestion(nextQuestion, nextOptions, "Next Question")
    )
      return;

    const payload = {
      questionText: questionData.questionText,
      questionType: questionData.questionType,
      userLevel: "beginer",
      isRequired: questionData.required,
      isActive: questionData.status === "published",
      isStartingQuestion: questionData.isStartingQuestion ?? true,
      dependencyQuestion: questionData.dependencyQuestion ?? false,
      categoryId: questionData.categoryId ?? "BASIC", // Make sure categoryId is from state
      description: questionData.description ?? "",
      options,
      nextQuestion: nextQuestion
        ? {
            questionText: nextQuestion.questionText,
            questionType: nextQuestion.questionType,
            required: nextQuestion.required,
            status: nextQuestion.status,
            description: nextQuestion.description ?? "",
            options: nextOptions,
          }
        : undefined,
    };

    createQuestion(payload, {
      onSuccess: () => {
        toast.success("Question created successfully");
        setTimeout(() => {
          router.back();
        }, 1500);
      },

      onError: (err: any) => {
        toast.error("Failed to create question", {
          description: err.message || "Unexpected error",
        });
      },
    });
  };

  if (!questionData) return null;

  const renderQuestionBlock = (
    q: any,
    setField: any,
    opts: any[],
    isNext = false
  ) => (
    <>
      <div className="space-y-2">
        <Label>{isNext ? "Next Question Text" : "Question Text"}</Label>
        <SuggestiveSearch
          categoryId={categoryMap[questionData.categoryId] || 1}
          value={q.questionText}
          onChange={(val) => setField("questionText", val)}
          onSelect={(selected) => setField("questionText", selected.questionText)}
          fetchFn={fetchQuestions}
          isNext={isNext}
        />
      </div>

      <div className="space-y-2">
        <Label>Question Type</Label>
        <Select
          value={q.questionType}
          onValueChange={(val) => handleTypeChange(val, isNext)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="text">Text</SelectItem>
            <SelectItem value="multiple_choice_single">
              Multiple Choice (Single)
            </SelectItem>
            <SelectItem value="multiple_choice_multi">
              Multiple Choice (Multi)
            </SelectItem>
            <SelectItem value="boolean">Yes / No</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {["multiple_choice_single", "multiple_choice_multi", "boolean"].includes(
        q.questionType
      ) && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Options</Label>
            {q.questionType !== "boolean" && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => addOption(isNext)}
              >
                <PlusCircle className="h-4 w-4 mr-1" />
                Add Option
              </Button>
            )}
          </div>
          {opts.map((opt, i) => (
            <div key={opt.id || i} className="flex items-center gap-2">
              <Input
                value={opt.optionText}
                onChange={(e) => handleOptionChange(i, e.target.value, isNext)}
              />
              {q.questionType !== "boolean" && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-red-500"
                  onClick={() => deleteOption(i, isNext)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea
          value={q.description || ""}
          onChange={(e) => setField("description", e.target.value)}
          rows={3}
        />
      </div>
      <div className="flex flex-col gap-4 pt-6">
      <div className="flex items-center space-x-2">
        <Switch
          checked={q.required}
          onCheckedChange={(val) => setField("required", val)}
          className="bg-muted data-[state=checked]:bg-slate-800"
        />
        <Label>Required</Label>
      </div>

      {!isNext && (
        <>
          <div className="flex items-center space-x-2">
            <Switch
              checked={q.isStartingQuestion}
              onCheckedChange={(val) => setField("isStartingQuestion", val)}
              className="bg-muted data-[state=checked]:bg-slate-800"
            />
            <Label>Is Starting Question</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              checked={q.dependencyQuestion}
              onCheckedChange={(val) => setField("dependencyQuestion", val)}
              className="bg-muted data-[state=checked]:bg-slate-800"
            />
            <Label>Dependency Question</Label>
          </div>
        </>
      )}
    </div>

      <div className="space-y-2">
        <Label>Status</Label>
        <Select
          value={q.status}
          onValueChange={(val) => setField("status", val)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="published">Published</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeftCircle className="h-5 w-5 text-slate-600" />
        </Button>
        <h1 className="text-3xl font-semibold text-slate-800">
          Create Question
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Main Question</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {renderQuestionBlock(questionData, updateQuestionField, options)}
        </CardContent>
      </Card>
      {questionData?.dependencyQuestion && (

      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle className="text-lg">Next Question (Optional)</CardTitle>
          {nextQuestion ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setNextQuestion(null);
                toast.success("Next question removed");
              }}
              className="text-red-500"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setNextQuestion(emptyQuestion());
                toast.success("Next question added");
              }}
            >
              <PlusCircle className="mr-1 h-4 w-4" />
              Add Next Question
            </Button>
          )}
        </CardHeader>

        {nextQuestion && (
          <CardContent className="space-y-4">
            {renderQuestionBlock(
              nextQuestion,
              updateNextQuestionField,
              nextOptions,
              true
            )}
          </CardContent>
        )}
      </Card>
      )}
      <div className="flex items-center justify-end gap-3">
        <Button variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={isPending}
          className="bg-blue-600 text-white hover:bg-blue-700"
        >
          <Save className="mr-2 h-4 w-4" />
          Save Question
        </Button>
      </div>
    </div>
  );
}
