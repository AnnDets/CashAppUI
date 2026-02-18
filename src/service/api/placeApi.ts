import api from '../ApiClient';
import {SimplePlace} from '../../models/Place';

const BASE = '/api/v1/places';

export const searchPlaces = (search: string) =>
    api.get<SimplePlace[]>(`${BASE}/search`, {params: {search}}).then(r => r.data);

export const createPlace = (data: SimplePlace) =>
    api.post<SimplePlace>(BASE, data).then(r => r.data);

export const updatePlace = (id: string, data: SimplePlace) =>
    api.patch<SimplePlace>(`${BASE}/${id}`, data).then(r => r.data);

export const deletePlace = (id: string) =>
    api.delete(`${BASE}/${id}`);
