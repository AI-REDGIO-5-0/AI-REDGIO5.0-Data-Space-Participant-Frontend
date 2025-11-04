import { getToken } from '#auth';
const {
    public: { API_BASE_URL },
    catalogName,
} = useRuntimeConfig();

export default defineEventHandler(async (event) => {
    const token = await getToken({ event });
    const query = getQuery(event);
    const fileName = query.file as string;

    // Get the MinIO signed URL
    const presignedUrl = await $fetch(`${API_BASE_URL}/api/consumer/download/${encodeURIComponent(fileName)}`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token?.access_token}`,
        },
        query: { ext: query.ext }, // ✅ Pass extension to backend
    },
    );

    // Extract file extension
    const extension = query.ext || '';

    const cleanedFileName = fileName.trim().replace(/\s+$/, ''); // Remove trailing spaces
    const fullFileName = extension ? `${cleanedFileName}.${extension}` : cleanedFileName;

    // Ensure no extra `_`
    const finalFileName = fullFileName.replace(/_+$/, ''); // Remove trailing "_"

    return { url: presignedUrl, fileName: finalFileName };

});
