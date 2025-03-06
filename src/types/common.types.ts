import { z } from "zod";

export type ValueOf<T> = T[keyof T];

export const zodDate = z.string().transform((str) => new Date(str));