import { z } from 'zod';

export const usePublicationSchema = () => {
    const { t } = useI18n();

    const oneOffSaleSchema = z
        .object({
            type: z.null().isOptional(),
            // price: z.number({ invalid_type_error: t('val.validNumber') }),
            license: z.string().min(1, t('val.required')),
            // contractTerms: z.string().min(1, t('val.required')),
            startDate: z.string(),
            termDate: z.string(),
        });

    const publicationSchema = oneOffSaleSchema;

    return {
        publicationSchema,
    };
};
