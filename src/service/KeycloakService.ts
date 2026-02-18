import Keycloak from 'keycloak-js';

type KeycloakInstance = Keycloak.KeycloakInstance;

let keycloakInstance: KeycloakInstance | null = null;

export const setKeycloakInstance = (kc: KeycloakInstance) => {
    keycloakInstance = kc;
};

export const getKeycloakInstance = (): KeycloakInstance => {
    if (!keycloakInstance) {
        throw new Error('Keycloak instance not initialized');
    }
    return keycloakInstance;
};

export type {KeycloakInstance};
