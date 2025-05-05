"use client";

import { useParams, useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetQuestionById } from "@/hooks/useGetQuestionsById";
import { ArrowLeftCircle, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ViewQuestionnaire() {
  const router = useRouter();
  const { id } = useParams();
  const { data, isLoading } = useGetQuestionById(Number(id));

  const formatType = (type: string) =>
    type.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        {[...Array(2)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-64 mb-2" />
              <Skeleton className="h-4 w-40" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-sm">No question found.</p>
      </div>
    );
  }

  const {
    questionText,
    description,
    questionType,
    isRequired,
    options,
    isStartingQuestion,
    dependencyQuestion,
    userLevel,
    isActive,
  } = data;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.back()}
          className="h-8 w-8"
        >
          <ArrowLeftCircle className="h-5 w-5 text-slate-600" />
        </Button>
        <h1 className="text-2xl font-bold text-slate-900">{questionText}</h1>
        <Button
          size="sm"
          variant="outline"
          onClick={() =>
            router.push(`/dashboard/questionnaires/${id}/edit`)
          }
        >
          <Pencil className="w-4 h-4 mr-1" />
          Edit
        </Button>
      </div>

      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}

      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary">{formatType(questionType)}</Badge>
        {isRequired && <Badge variant="default">Required</Badge>}
        {isStartingQuestion && (
          <Badge className="bg-blue-100 text-blue-700">Starting</Badge>
        )}
        {dependencyQuestion && (
          <Badge className="bg-yellow-100 text-yellow-800">
            Has Dependency
          </Badge>
        )}
        <Badge variant="default" className="capitalize">
          {userLevel}
        </Badge>
        <Badge
          className={
            isActive
              ? "bg-green-100 text-green-700"
              : "bg-gray-200 text-gray-600"
          }
        >
          {isActive ? "Active" : "Inactive"}
        </Badge>
      </div>

      {(questionType === "text" || (options && options.length > 0)) && (
        <Card>
          <CardHeader>
            <CardTitle>Answer Options</CardTitle>
            <CardDescription>
              {questionType.includes("multi")
                ? "Select all that apply"
                : questionType === "text"
                  ? "User types their answer"
                  : "Select one option"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {questionType === "text" ? (
              <input
                type="text"
                placeholder="User response goes here..."
                className="w-full border border-gray-300 rounded-md p-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary"
                disabled
              />
            ) : (
              <div className="space-y-2">
                {options.map((opt: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-2 rounded-md border border-gray-200 hover:border-primary transition"
                  >
                    {questionType === "multiple_choice_single" && (
                      <div className="h-4 w-4 rounded-full border-2 border-primary" />
                    )}
                    {questionType === "multiple_choice_multi" && (
                      <div className="h-4 w-4 rounded-sm border-2 border-primary" />
                    )}
                    {questionType === "boolean" && (
                      <div className="h-4 w-4 bg-primary rounded-full" />
                    )}
                    <span className="text-sm text-slate-700">
                      {opt.optionText}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
