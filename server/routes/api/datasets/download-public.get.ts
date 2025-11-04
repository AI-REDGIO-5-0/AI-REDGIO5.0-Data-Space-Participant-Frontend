// import { getToken } from '#auth';

const {
    public: { API_BASE_URL },
    catalogName,
} = useRuntimeConfig();

export default defineEventHandler(async (event) => {
    // const token = await getToken({ event });
    const query = getQuery(event);

    // Fetch the file as a stream/blob from your backend
    const response = await $fetch.raw(`${API_BASE_URL}/api/consumer/download-file/${query.id}`, {
        method: 'GET',
        // headers: {
        //     Authorization: `Bearer ${token?.access_token}`,
        // },
        responseType: 'stream', // or 'blob' depending on your setup
    });

    // Get headers from the backend response
    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    const contentDisposition = response.headers.get('content-disposition');

    // Set headers on the Nitro response
    setResponseHeaders(event, {
        'Content-Type': contentType,
        'Content-Disposition': contentDisposition, // This is the key - forward the exact header
    });

    // Return the file data
    return response._data;
});