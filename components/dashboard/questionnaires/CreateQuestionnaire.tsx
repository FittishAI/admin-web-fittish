'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, ArrowLeftCircle, Save } from 'lucide-react';
import type { Question, Questionnaire } from '@/lib/types';
import { QuestionForm } from './QuestionForm';

export default function CreateQuestionnaire() {
  const router = useRouter();

  const [questionnaire, setQuestionnaire] = useState<Questionnaire>({
    id: `q-${Date.now()}`,
    title: '',
    description: '',
    status: 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    questions: [],
  });

  const handleAddQuestion = () => {
    const newQuestion: Question = {
      id: `q-${Date.now()}`,
      text: 'New Question',
      type: 'text',
      required: false,
      order: questionnaire.questions.length + 1,
    };
    setQuestionnaire({
      ...questionnaire,
      questions: [...questionnaire.questions, newQuestion],
    });
  };

  const handleQuestionChange = (updated: Question, index: number) => {
    const newQuestions = [...questionnaire.questions];
    newQuestions[index] = updated;
    setQuestionnaire({ ...questionnaire, questions: newQuestions });
  };

  const handleQuestionDelete = (index: number) => {
    const newQuestions = questionnaire.questions.filter((_, i) => i !== index);
    const reordered = newQuestions.map((q, i) => ({ ...q, order: i + 1 }));
    setQuestionnaire({ ...questionnaire, questions: reordered });
  };

  const handleSave = () => {
    if (!questionnaire.title.trim()) {
      alert('Please enter a title for the questionnaire');
      return;
    }

    console.log('Created:', questionnaire);
    router.push('/dashboard/questionnaires');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeftCircle className="h-5 w-5 text-slate-600" />
        </Button>
        <h1 className="text-3xl font-semibold text-slate-800">Create Questionnaire</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Questionnaire Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={questionnaire.title}
                onChange={(e) => setQuestionnaire({ ...questionnaire, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={questionnaire.status}
                onValueChange={(value) =>
                  setQuestionnaire({ ...questionnaire, status: value as 'draft' | 'published' })
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
              onChange={(e) => setQuestionnaire({ ...questionnaire, description: e.target.value })}
              rows={3}
              placeholder="Add a short description or note"
            />
          </div>
        </CardContent>
      </Card>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-slate-800">
            Questions ({questionnaire.questions.length})
          </h2>
          <Button onClick={handleAddQuestion} className="flex items-center text-sm">
            <PlusCircle className="mr-2 h-4 w-4 text-blue-600" />
            Add Question
          </Button>
        </div>

        <div className="space-y-4">
          {questionnaire.questions.length > 0 ? (
            questionnaire.questions.map((question, index) => (
              <QuestionForm
                key={question.id}
                question={question}
                questionIndex={index}
                onQuestionChange={handleQuestionChange}
                onQuestionDelete={handleQuestionDelete}
              />
            ))
          ) : (
            <div className="text-center p-8 border border-dashed rounded-lg text-muted-foreground">
              <p>No questions added yet. Click "Add Question" to create your first one.</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-end gap-4">
        <Button variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button onClick={handleSave} className="bg-blue-600 text-white hover:bg-blue-700">
          <Save className="mr-2 h-4 w-4" />
          Create Questionnaire
        </Button>
      </div>
    </div>
  );
}
