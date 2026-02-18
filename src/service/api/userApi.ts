import api, {publicApi} from '../ApiClient';
import {PatchUser, User, UserRegistration} from '../../models/User';

const BASE = '/api/v1/users';

export const getUserProfile = () =>
    api.get<User>(`${BASE}/profile`).then(r => r.data);

export const updateUserProfile = (data: PatchUser) =>
    api.patch<User>(`${BASE}/profile`, data).then(r => r.data);

export const deleteUserProfile = () =>
    api.delete(`${BASE}/profile`);

export const registerUser = (data: UserRegistration) =>
    publicApi.post<User>(`${BASE}/register`, data).then(r => r.data);
