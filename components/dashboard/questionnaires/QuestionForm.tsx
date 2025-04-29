"use client";

import { useState } from "react";
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
import {
  GripVertical,
  PlusCircle,
  Trash2,
} from "lucide-react";
import { Question, QuestionType, Option } from "@/lib/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface Props {
  question: Question;
  questionIndex: number;
  onQuestionChange: (updated: Question, index: number) => void;
  onQuestionDelete: (index: number) => void;
}

export function QuestionForm({
  question,
  questionIndex,
  onQuestionChange,
  onQuestionDelete,
}: Props) {
  const [options, setOptions] = useState<Option[]>(question.options || []);

  const updateOptions = (opts: Option[]) => {
    setOptions(opts);
    onQuestionChange({ ...question, options: opts }, questionIndex);
  };

  const handleAddOption = () => {
    const newOption: Option = {
      id: `opt-${Date.now()}`,
      label: `Option ${options.length + 1}`,
      value: `option_${options.length + 1}`,
    };
    updateOptions([...options, newOption]);
  };

  const handleOptionChange = (id: string, field: keyof Option, value: string) => {
    const updated = options.map((o) =>
      o.id === id ? { ...o, [field]: value } : o
    );
    updateOptions(updated);
  };

  const handleDeleteOption = (id: string) => {
    updateOptions(options.filter((o) => o.id !== id));
  };

  const handleTypeChange = (type: QuestionType) => {
    const isMCQ = type === "multipleChoice";
    onQuestionChange(
      {
        ...question,
        type,
        options: isMCQ ? options : undefined,
      },
      questionIndex
    );
  };

  return (
    <Card className="group relative animate-in fade-in border border-slate-200 shadow-sm">
      <CardHeader className="pb-4 flex items-start gap-3">
        <GripVertical className="w-5 h-5 mt-1 text-muted-foreground" />

        <div className="flex-1 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label className="m-2">Question Text</Label>
              <Input
                value={question.text}
                onChange={(e) =>
                  onQuestionChange(
                    { ...question, text: e.target.value },
                    questionIndex
                  )
                }
                placeholder="Enter your question"
              />
            </div>

            <div>
              <Label className="m-2">Question Type</Label>
              <Select
                value={question.type}
                onValueChange={(v) => handleTypeChange(v as QuestionType)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="boolean">Yes/No</SelectItem>
                  <SelectItem value="scale">Scale</SelectItem>
                  <SelectItem value="multipleChoice">Multiple Choice</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="m-2">Description (optional)</Label>
            <Textarea
              value={question.description || ""}
              onChange={(e) =>
                onQuestionChange(
                  { ...question, description: e.target.value },
                  questionIndex
                )
              }
              placeholder="Add more details about this question"
              rows={2}
            />
          </div>

          <div className="flex items-center gap-2">
            <Switch
              id={`required-${questionIndex}`}
              checked={question.required}
              onCheckedChange={(checked) =>
                onQuestionChange({ ...question, required: checked }, questionIndex)
              }
            />
            <Label htmlFor={`required-${questionIndex}`}>Required</Label>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="text-red-600 hover:bg-red-50"
          onClick={() => onQuestionDelete(questionIndex)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </CardHeader>

      {question.type === "multipleChoice" && (
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Options</Label>
            <Button variant="outline" size="sm" onClick={handleAddOption}>
              <PlusCircle className="h-4 w-4 mr-1" />
              Add Option
            </Button>
          </div>

          {options.length > 0 ? (
            <div className="space-y-2">
              {options.map((option) => (
                <div key={option.id} className="flex items-center gap-2">
                  <Input
                    value={option.label}
                    onChange={(e) =>
                      handleOptionChange(option.id, "label", e.target.value)
                    }
                    placeholder="Option text"
                    className="flex-1"
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-red-500"
                    onClick={() => handleDeleteOption(option.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground py-3 border rounded-md text-center">
              No options yet. Click “Add Option” to get started.
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
