import { z } from 'zod';


export const useModelSchema = (withFile = false) => {
    const { t } = useI18n();

    const dataModelSchema = z.object({
        title: z.string().min(3, 'Title is required'),
        domain: z.number({
            required_error: "Domain is required",
            invalid_type_error: "Domain is required",
          }),
        language: z.number({
            required_error: "Language is required",
            invalid_type_error: "Language is required",
          }),
        description: z.string().min(10,`Must be at least 10 characters`),
        keywords: z.array(z.string().min(1, 'Must be at least 1 keyword')),
        data: withFile ? z.instanceof(File, { message: 'Please upload a valid file' }) : z.optional(z.instanceof(File)),
    });

    return {
        dataModelSchema,
    };
};
