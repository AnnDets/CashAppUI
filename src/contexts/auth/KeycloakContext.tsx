import React, {createContext, useCallback, useContext, useEffect, useRef, useState} from 'react';
import Keycloak from 'keycloak-js';
import {getKeycloakInstance, KeycloakInstance, setKeycloakInstance} from '../../service/KeycloakService';

interface AuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    token: string | null;
    login: () => void;
    logout: () => void;
    loginWithCredentials: (email: string, password: string) => Promise<void>;
    loginWithGoogle: () => void;
}

const AuthContext = createContext<AuthContextType>({
    isAuthenticated: false,
    isLoading: true,
    token: null,
    login: () => {
    },
    logout: () => {
    },
    loginWithCredentials: async () => {
    },
    loginWithGoogle: () => {
    },
});

export const useAuth = () => useContext(AuthContext);

const KEYCLOAK_CONFIG: Keycloak.KeycloakConfig = {
    url: 'https://auth.storksoft.by/auth',
    realm: 'cash-app',
    clientId: 'frontend',
};

interface KeycloakProviderProps {
    children: React.ReactNode;
}

export const KeycloakProvider: React.FC<KeycloakProviderProps> = ({children}) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [token, setToken] = useState<string | null>(null);
    const initRef = useRef(false);

    const saveTokens = useCallback((kc: KeycloakInstance) => {
        if (kc.token) {
            localStorage.setItem('accessToken', kc.token);
            setToken(kc.token);
        }
        if (kc.refreshToken) {
            localStorage.setItem('refreshToken', kc.refreshToken);
        }
    }, []);

    const clearTokens = useCallback(() => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setToken(null);
    }, []);

    useEffect(() => {
        if (initRef.current) return;
        initRef.current = true;

        const initKeycloak = async () => {
            const kc = Keycloak(KEYCLOAK_CONFIG);
            setKeycloakInstance(kc);

            // Handle OAuth callback
            const urlParams = new URLSearchParams(window.location.search);
            const code = urlParams.get('code');
            const sessionState = urlParams.get('session_state');

            if (code && sessionState) {
                try {
                    const tokenUrl = `${KEYCLOAK_CONFIG.url}/realms/${KEYCLOAK_CONFIG.realm}/protocol/openid-connect/token`;
                    const body = new URLSearchParams({
                        grant_type: 'authorization_code',
                        client_id: KEYCLOAK_CONFIG.clientId!,
                        code: code,
                        redirect_uri: window.location.origin + '/app/',
                    });
                    const resp = await fetch(tokenUrl, {
                        method: 'POST',
                        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                        body: body.toString(),
                    });
                    if (resp.ok) {
                        const tokenData = await resp.json();
                        localStorage.setItem('accessToken', tokenData.access_token);
                        localStorage.setItem('refreshToken', tokenData.refresh_token);
                        window.history.replaceState({}, '', window.location.pathname);
                    }
                } catch (err) {
                    console.error('Token exchange failed:', err);
                }
            }

            try {
                const storedToken = localStorage.getItem('accessToken');
                const storedRefreshToken = localStorage.getItem('refreshToken');

                const initOptions: Keycloak.KeycloakInitOptions = {
                    onLoad: 'check-sso',
                    pkceMethod: 'S256',
                    checkLoginIframe: false,
                };

                if (storedToken) {
                    (initOptions as any).token = storedToken;
                }
                if (storedRefreshToken) {
                    (initOptions as any).refreshToken = storedRefreshToken;
                }

                const authenticated = await kc.init(initOptions);

                if (authenticated) {
                    saveTokens(kc);
                    setIsAuthenticated(true);
                } else {
                    clearTokens();
                    setIsAuthenticated(false);
                }
            } catch (err) {
                console.error('Keycloak init failed:', err);
                clearTokens();
                setIsAuthenticated(false);
            }
            setIsLoading(false);
        };

        initKeycloak();
    }, [saveTokens, clearTokens]);

    const login = useCallback(() => {
        try {
            const kc = getKeycloakInstance();
            kc.login({redirectUri: window.location.origin + '/app/'});
        } catch (err) {
            console.error('Login failed:', err);
        }
    }, []);

    const logout = useCallback(() => {
        try {
            const kc = getKeycloakInstance();
            clearTokens();
            setIsAuthenticated(false);
            kc.logout({redirectUri: window.location.origin + '/app/login'});
        } catch (err) {
            console.error('Logout failed:', err);
        }
    }, [clearTokens]);

    const loginWithCredentials = useCallback(async (email: string, password: string) => {
        try {
            const tokenUrl = `${KEYCLOAK_CONFIG.url}/realms/${KEYCLOAK_CONFIG.realm}/protocol/openid-connect/token`;
            const body = new URLSearchParams({
                grant_type: 'password',
                client_id: KEYCLOAK_CONFIG.clientId!,
                username: email,
                password: password,
            });
            const resp = await fetch(tokenUrl, {
                method: 'POST',
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                body: body.toString(),
            });

            if (!resp.ok) {
                throw new Error('Invalid credentials');
            }

            const tokenData = await resp.json();
            localStorage.setItem('accessToken', tokenData.access_token);
            localStorage.setItem('refreshToken', tokenData.refresh_token);

            // Reinitialize keycloak with new tokens
            const kc = getKeycloakInstance();
            const initOptions: Keycloak.KeycloakInitOptions = {
                onLoad: 'check-sso',
                pkceMethod: 'S256',
                checkLoginIframe: false,
            };
            (initOptions as any).token = tokenData.access_token;
            (initOptions as any).refreshToken = tokenData.refresh_token;

            await kc.init(initOptions);

            setToken(tokenData.access_token);
            setIsAuthenticated(true);
        } catch (err) {
            console.error('Credentials login failed:', err);
            throw err;
        }
    }, []);

    const loginWithGoogle = useCallback(() => {
        try {
            const kc = getKeycloakInstance();
            kc.login({
                redirectUri: window.location.origin + '/app/',
                idpHint: 'google',
            });
        } catch (err) {
            console.error('Google login failed:', err);
        }
    }, []);

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated,
                isLoading,
                token,
                login,
                logout,
                loginWithCredentials,
                loginWithGoogle,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
