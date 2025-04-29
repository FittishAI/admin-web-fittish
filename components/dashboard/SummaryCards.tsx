'use client';

import { Card, CardContent } from '@/components/ui/card';

const summaries = [
  {
    title: 'Total Questionnaires',
    value: '3',
    subtext: '1 published, 2 drafts',
  },
  {
    title: 'Total Questions',
    value: '10',
    subtext: 'Across all questionnaires',
  },
  {
    title: 'Users',
    value: '3',
    subtext: '1 admins',
  },
  {
    title: 'Latest Activity',
    value: 'Today',
    subtext: 'Last edit: 2 hours ago',
  },
];

export default function SummaryCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {summaries.map((item) => (
        <Card key={item.title} className="h-full">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-1">{item.title}</p>
            <div className="text-2xl font-bold">{item.value}</div>
            <p className="text-xs text-gray-500 mt-1">{item.subtext}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
