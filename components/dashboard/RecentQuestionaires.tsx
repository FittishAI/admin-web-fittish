'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

const questionnaires = [
  {
    title: 'Fitness Goal Assessment',
    description: 'Questionnaire to assess fitness goals and preferences',
    status: 'Published',
    count: 5,
    updated: '9/20/2023',
  },
  {
    title: 'Nutrition Assessment',
    description: 'Questionnaire to understand dietary preferences and habits',
    status: 'Draft',
    count: 3,
    updated: '10/10/2023',
  },
  {
    title: 'Sleep and Recovery',
    description: 'Questionnaire about sleep patterns and recovery habits',
    status: 'Draft',
    count: 2,
    updated: '11/1/2023',
  },
];

export default function RecentQuestionnaires() {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-slate-700">Recent Questionnaires</h2>
        <Link href="/dashboard/questionnaires">
          <button className="text-sm px-3 py-1.5 bg-black text-white rounded-md">View All</button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {questionnaires.map((q) => (
          <Card key={q.title}>
            <CardContent className="p-4">
              <h3 className="font-semibold text-slate-800">{q.title}</h3>
              <p className="text-sm text-gray-500 mb-2">{q.description}</p>

              <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-2">
                  <span>Status:</span>
                  <Badge variant={q.status === 'Published' ? 'success' : 'secondary'}>
                    {q.status}
                  </Badge>
                </div>
                <span>Questions: {q.count}</span>
              </div>

              <p className="text-xs text-gray-400">Last Updated: {q.updated}</p>

              <div className="mt-4">
                <button className="w-full border text-sm py-1.5 rounded-md hover:bg-gray-50">
                  View Details
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
