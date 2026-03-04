import { jwtDecode } from 'jwt-decode';
import { JWT } from 'next-auth/jwt';
import KeycloakProvider from 'next-auth/providers/keycloak';

import { NuxtAuthHandler } from '#auth';

declare module 'next-auth/jwt' {
    interface JWT {
        id_token?: string;
        provider?: string;
        refresh_token?: string;
        access_token?: string;
        expires_at?: number;
    }
}

declare module 'next-auth' {
    interface Session {
        roles?: string[];
        orgId?: string;
    }
}

const { authSecret, keycloak } = useRuntimeConfig();


const getUserAttribute = (profile: any, attribute: string) => {
    return profile[`${attribute}`] || '';
};


async function refreshAccessToken(token: JWT) {
    try {
        if (!token.refresh_token) {
            throw new Error('No refresh token available');
        }

        const response = await $fetch<{
            access_token: string;
            expires_in: number;
            refresh_token: string;
            id_token?: string;
        }>(`${keycloak.issuer}/protocol/openid-connect/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                client_id: keycloak.clientId,
                grant_type: 'refresh_token',
                refresh_token: token.refresh_token,
            }),
        });

        return {
            ...token,
            access_token: response.access_token,
            refresh_token: response.refresh_token,
            id_token: response.id_token || token.id_token,
            expires_at: Date.now() + (response.expires_in - 15) * 1000,
            error: undefined,
        };
    } catch (err) {
        console.error('Error refreshing access token:', err);
        return {
            ...token,
            error: 'RefreshAccessTokenError',
        };
    }
}

export const authOptions = {
    secret: authSecret,
    providers: [
        // @ts-expect-error You need to use .default here for it to work during SSR. May be fixed via Vite at some point
        KeycloakProvider.default({
            issuer: keycloak.issuer,
            clientId: keycloak.clientId,
            clientSecret: '', // Empty string for public clients
            authorization: {
                params: {
                    scope: 'openid email profile',
                },
            },
            // This is the key setting for public clients
            client: {
                token_endpoint_auth_method: 'none',
            },
        }),
    ],
    callbacks: {
        jwt: async ({ token, account, user }: any) => {
            
            if (account && user) {
                token.id_token = account.id_token;
                token.provider = account.provider;
                token.access_token = account.access_token;
                token.refresh_token = account.refresh_token;
                const decodedJWT = jwtDecode(account.access_token);
                token.size = getUserAttribute(decodedJWT, 'organisationSize');
                token.country = getUserAttribute(decodedJWT, 'organisationCountry');
                token.domain = getUserAttribute(decodedJWT, 'organisationDomain');
                token.firstName = getUserAttribute(decodedJWT, 'given_name');
                token.lastName = getUserAttribute(decodedJWT, 'family_name');
                token.hash = getUserAttribute(decodedJWT, 'organisationHash');
                token.operations = getUserAttribute(decodedJWT, 'organisationOperations');
                token.street = getUserAttribute(decodedJWT, 'organisationStreet');
                token.number = getUserAttribute(decodedJWT, 'organisationStreetNumber');
                token.postCode = getUserAttribute(decodedJWT, 'organizationPostCode');
                token.geoScope = getUserAttribute(decodedJWT, 'organisationGeoScope');
                token.ownerControl = getUserAttribute(decodedJWT, 'organisationControl');
                token.address = getUserAttribute(decodedJWT, 'organisationAddress');
                token.city = getUserAttribute(decodedJWT, 'organizationCity');
                token.orgName = getUserAttribute(decodedJWT, 'organisationName');
                token.orgId = getUserAttribute(decodedJWT, 'organisationId');
                if (account.expires_at) {
                    token.expires_at = (account.expires_at - 15) * 1000;
                }

                return Promise.resolve(token);
            }

            if (token.expires_at && Date.now() > token.expires_at) {
                return await refreshAccessToken(token);
            }

            return Promise.resolve(token);
        },
        session: async ({ session, token }: any) => {
            // If token contains error, return clear session to force the browser to go through the authentication process again
            if (token?.error === 'RefreshAccessTokenError') return Promise.resolve(null);
            session.roles = token.roles;
            session.orgId = token.orgId;
            session.orgName = token.orgName;
            session.size = token.size 
            session.country = token.country 
            session.domain = token.domain 
            session.firstName = token.firstName
            session.lastName = token.lastName
            session.hash = token.hash
            session.user = {
                ...session.user,
                ...token,
            };
            return Promise.resolve(session);
        },
    },
    events: {
        async signOut({ token }: any) {
            if (token.provider === 'keycloak') {
                const logOutUrl = new URL(`${keycloak.issuer}/protocol/openid-connect/logout`);
                logOutUrl.searchParams.append('id_token_hint', token.id_token!);
                await fetch(logOutUrl);
            }
        },
    },
};

export default NuxtAuthHandler(authOptions);
