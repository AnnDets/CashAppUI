import api from '../ApiClient';
import {Category, CategoryInput, ListCategory, SimpleCategory} from '../../models/Category';

const BASE = '/api/v1/categories';

export const getCategories = () =>
    api.get<ListCategory[]>(BASE).then(r => r.data);

export const getCategory = (id: string) =>
    api.get<Category>(`${BASE}/${id}`).then(r => r.data);

export const createCategory = (data: CategoryInput) =>
    api.post<SimpleCategory>(BASE, data).then(r => r.data);

export const updateCategory = (id: string, data: CategoryInput) =>
    api.patch<SimpleCategory>(`${BASE}/${id}`, data).then(r => r.data);

export const deleteCategory = (id: string) =>
    api.delete(`${BASE}/${id}`);
