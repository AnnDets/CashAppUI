import api from '../ApiClient';
import {ListOperation, OperationFilterDTO, OperationInput, SimpleOperation} from '../../models/Operation';

const BASE = '/api/v1/operations';

export const getOperations = () =>
    api.get<ListOperation[]>(BASE).then(r => r.data);

export const filterOperations = (filter: OperationFilterDTO) =>
    api.post<ListOperation[]>(`${BASE}/filter`, filter).then(r => r.data);

export const createOperation = (data: OperationInput) =>
    api.post<SimpleOperation>(BASE, data).then(r => r.data);

export const updateOperation = (id: string, data: OperationInput) =>
    api.patch<SimpleOperation>(`${BASE}/${id}`, data).then(r => r.data);

export const deleteOperation = (id: string) =>
    api.delete(`${BASE}/${id}`);
