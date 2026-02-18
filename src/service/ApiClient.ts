import axios from 'axios';
import {getKeycloakInstance} from './KeycloakService';

const api = axios.create({
    baseURL: process.env.REACT_APP_BASE_URL,
});

api.interceptors.request.use(
    async (config) => {
        const keycloak = getKeycloakInstance();
        try {
            await keycloak.updateToken(30);
            if (keycloak.token) {
                config.headers.Authorization = `Bearer ${keycloak.token}`;
                localStorage.setItem('accessToken', keycloak.token);
            }
            if (keycloak.refreshToken) {
                localStorage.setItem('refreshToken', keycloak.refreshToken);
            }
        } catch (error) {
            console.error('Failed to refresh token:', error);
            keycloak.login();
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Separate instance for unauthenticated requests (registration)
export const publicApi = axios.create({
    baseURL: process.env.REACT_APP_BASE_URL,
});

export default api;
