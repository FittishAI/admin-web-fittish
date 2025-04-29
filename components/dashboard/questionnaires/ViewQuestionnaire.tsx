'use client';

import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const questionnaire = {
  id: '1',
  title: 'Fitness Goal Assessment',
  description: 'A questionnaire to evaluate fitness goals and lifestyle habits.',
  status: 'published',
  createdAt: '2023-09-15T10:00:00Z',
  updatedAt: '2023-09-20T14:30:00Z',
  questions: [
    {
      id: 'q1',
      text: 'What are your primary fitness goals?',
      description: 'Choose what best describes your current goal',
      type: 'multipleChoice',
      required: true,
      order: 1,
      options: [
        { id: 'o1', label: 'Lose weight' },
        { id: 'o2', label: 'Build muscle' },
        { id: 'o3', label: 'Improve endurance' },
      ],
    },
    {
      id: 'q2',
      text: 'How many days a week do you exercise?',
      type: 'number',
      required: false,
      order: 2,
    },
    {
      id: 'q3',
      text: 'Do you have any injuries?',
      type: 'boolean',
      required: false,
      order: 3,
    },
  ],
};

export default function ViewQuestionnaire() {
  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
      case 'multipleChoice':
        return 'Multiple Choice';
      case 'text':
        return 'Text';
      case 'number':
        return 'Number';
      case 'boolean':
        return 'Yes/No';
      case 'scale':
        return 'Scale';
      default:
        return type;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <h1 className="text-3xl font-bold text-slate-800">{questionnaire.title}</h1>
        <Badge variant={questionnaire.status === 'published' ? 'default' : 'secondary'}>
          {questionnaire.status === 'published' ? 'Published' : 'Draft'}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 text-sm">
            <div className="grid grid-cols-[120px_1fr]">
              <span className="text-muted-foreground font-medium">Title:</span>
              <span>{questionnaire.title}</span>
            </div>
            <div className="grid grid-cols-[120px_1fr]">
              <span className="text-muted-foreground font-medium">Description:</span>
              <span>{questionnaire.description}</span>
            </div>
            <div className="grid grid-cols-[120px_1fr]">
              <span className="text-muted-foreground font-medium">Status:</span>
              <span>{questionnaire.status}</span>
            </div>
            <div className="grid grid-cols-[120px_1fr]">
              <span className="text-muted-foreground font-medium">Created:</span>
              <span>{new Date(questionnaire.createdAt).toLocaleString()}</span>
            </div>
            <div className="grid grid-cols-[120px_1fr]">
              <span className="text-muted-foreground font-medium">Updated:</span>
              <span>{new Date(questionnaire.updatedAt).toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-xl font-semibold mb-4 text-slate-800">
          Questions ({questionnaire.questions.length})
        </h2>
        <div className="space-y-4">
          {questionnaire.questions.map((q) => (
            <Card key={q.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-base font-medium">
                      {q.order}. {q.text}
                    </CardTitle>
                    {q.description && (
                      <CardDescription>{q.description}</CardDescription>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="secondary">{getQuestionTypeLabel(q.type)}</Badge>
                    {q.required && <Badge>Required</Badge>}
                  </div>
                </div>
              </CardHeader>
              {q.options && q.options.length > 0 && (
                <CardContent>
                  <ul className="space-y-1 text-sm">
                    {q.options.map((opt) => (
                      <li key={opt.id} className="flex items-center gap-2">
                        <span className="h-2 w-2 bg-primary rounded-full" />
                        <span>{opt.label}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
