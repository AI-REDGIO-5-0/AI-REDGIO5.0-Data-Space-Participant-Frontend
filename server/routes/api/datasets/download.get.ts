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
    });

    // Fetch metadata to get the file extension (assuming MinIO metadata contains it)
    const metadata: any = await $fetch(`${API_BASE_URL}/api/consumer/metadata/${encodeURIComponent(fileName)}`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token?.access_token}`,
        },
    });

    // Extract file extension
    const extension = metadata.metaData['file-extension'] || '';
    const cleanedFileName = fileName.trim().replace(/\s+$/, ''); // Remove trailing spaces
    const fullFileName = extension ? `${cleanedFileName}.${extension}` : cleanedFileName;

    // Ensure no extra `_`
    const finalFileName = fullFileName.replace(/_+$/, ''); // Remove trailing "_"
    return { url: presignedUrl, fileName: finalFileName };

});
