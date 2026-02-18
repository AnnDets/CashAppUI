import api from '../ApiClient';
import {Bank, Color, Currency, Icon} from '../../models/Config';

const BASE = '/api/v1/configuration';

export const getBanks = () =>
    api.get<Bank[]>(`${BASE}/banks`).then(r => r.data);

export const searchBanks = (search: string) =>
    api.get<Bank[]>(`${BASE}/banks/search`, {params: {search}}).then(r => r.data);

export const getColors = () =>
    api.get<Color[]>(`${BASE}/colors`).then(r => r.data);

export const getCurrencies = () =>
    api.get<Currency[]>(`${BASE}/currencies`).then(r => r.data);

export const searchCurrencies = (search: string) =>
    api.get<Currency[]>(`${BASE}/currencies/search`, {params: {search}}).then(r => r.data);

export const getIcons = () =>
    api.get<Icon[]>(`${BASE}/icons`).then(r => r.data);
