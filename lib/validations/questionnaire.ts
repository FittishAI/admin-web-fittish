import * as z from 'zod';

const optionSchema = z.object({
  id: z.string(),
  value: z.string(),
  label: z.string(),
});

const questionSchema = z.object({
  id: z.string(),
  text: z.string().min(1, 'Question text is required'),
  type: z.enum(['multipleChoice', 'text', 'number', 'boolean', 'scale']),
  required: z.boolean(),
  options: z.array(optionSchema).optional(),
  order: z.number(),
  description: z.string().optional(),
});

export const questionnaireSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Title is required'),
  description: z.string(),
  status: z.enum(['draft', 'published']),
  createdAt: z.string(),
  updatedAt: z.string(),
  questions: z.array(questionSchema),
});

export const createQuestionnaireSchema = questionnaireSchema.omit({ 
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateQuestionnaireSchema = createQuestionnaireSchema.partial();

export type CreateQuestionnaireInput = z.infer<typeof createQuestionnaireSchema>;
export type UpdateQuestionnaireInput = z.infer<typeof updateQuestionnaireSchema>;