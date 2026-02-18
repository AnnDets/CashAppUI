import api from '../ApiClient';
import {Account, AccountInput, ListAccount, SimpleAccount} from '../../models/Account';

const BASE = '/api/v1/accounts';

export const getAccounts = () =>
    api.get<ListAccount[]>(BASE).then(r => r.data);

export const getAccount = (id: string) =>
    api.get<Account>(`${BASE}/${id}`).then(r => r.data);

export const createAccount = (data: AccountInput) =>
    api.post<SimpleAccount>(BASE, data).then(r => r.data);

export const updateAccount = (id: string, data: AccountInput) =>
    api.patch<SimpleAccount>(`${BASE}/${id}`, data).then(r => r.data);

export const deleteAccount = (id: string) =>
    api.delete(`${BASE}/${id}`);
