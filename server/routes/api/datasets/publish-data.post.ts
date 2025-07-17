import { getToken } from '#auth';

const {
    public: { API_BASE_URL },
} = useRuntimeConfig();

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const token = await getToken({ event });

    try {
        return await $fetch(`${API_BASE_URL}/api/provider/publish/${body.originalAssetId}`, {
            method: 'POST',
            body: JSON.stringify(body), // Ensure body is properly serialized
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token?.access_token}`,
            },
        });
    } catch (error) {
        console.log(error)
    }

});
