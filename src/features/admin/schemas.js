import { z } from 'zod';

export const questionSchema = z.object({
  subject: z.string().min(1, 'Subject is required'),
  stem: z.string().trim().min(1, 'Question text (stem) is required').max(2000),
  options: z
    .array(z.string().trim().min(1, 'Option cannot be empty'))
    .min(2, 'At least 2 options are required')
    .max(6, 'At most 6 options are allowed'),
  correctIndex: z.coerce.number().min(0),
  explanation: z.string().trim().max(2000).optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
  isActive: z.boolean().default(true),
  isShareable: z.boolean().default(false),
  shareTitle: z.string().trim().max(200).optional(),
});

export const subjectSchema = z
  .object({
    code: z.string().trim().max(10, 'Code is too long').toUpperCase().optional(),
    title: z.string().trim().min(2, 'Title is required').max(160),
    description: z.string().trim().max(500).optional(),
    level: z.enum(['post-utme', '100', '200', '300', '400', '500'], {
      errorMap: () => ({ message: 'Please select a valid level' }),
    }),
    department: z.string().trim().max(100).optional(),
    isActive: z.boolean().default(true),
  })
  .superRefine((data, ctx) => {
    if (data.level !== 'post-utme' && (!data.code || data.code.trim().length < 2)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Code is required for university levels',
        path: ['code'],
      });
    }
  });
