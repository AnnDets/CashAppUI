export interface User {
    id: string;
    email: string;
    username: string;
    firstName: string | null;
    lastName: string | null;
    picture: string | null;
}

export interface PatchUser {
    username?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    picture?: string;
}

export interface UserRegistration {
    email: string;
    username: string;
    password: string;
}
