import { getToken } from '#auth';

const {
    public: { API_BASE_URL },
} = useRuntimeConfig();

export default defineEventHandler(async (event) => {
    const token = await getToken({ event });
    const query = getRouterParams(event);

    const result: Record<string, any> = await $fetch(`${API_BASE_URL}/api/provider/policy/${query.id}`, {
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${token?.access_token}`,
        },
    });

    return result;
})
