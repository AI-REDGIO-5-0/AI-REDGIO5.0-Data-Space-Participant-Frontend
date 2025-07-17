import { getToken } from '#auth';

const {
    public: { API_BASE_URL },
} = useRuntimeConfig();

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const assetId = getQuery(event).id;
    const contentType =  await getHeader(event, 'content-type')
    const token = await getToken({ event });

    try{
        const headers: Record<string, string> = {
            Authorization: `Bearer ${token?.access_token}`,
        };

        if (contentType) {
            headers['Content-Type'] = contentType;
        }
        const file = await $fetch(`${API_BASE_URL}/api/provider/${assetId}`, {
            method: 'PUT',
            body,
            headers
        });
        return file
    }catch (error) {
        console.log(error)
    }
    
});
