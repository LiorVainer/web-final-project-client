import { z } from 'zod';

export const PictureSchema = z.object({
    _id: z.string(),
    picture: z.any(),
});

export type Picture = z.infer<typeof PictureSchema>;