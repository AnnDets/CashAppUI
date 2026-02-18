import {IdDTO} from './Config';
import {SimpleAccount} from './Account';
import {SimpleCategory} from './Category';
import {SimplePlace} from './Place';

export enum OperationType {
    INCOME = 'INCOME',
    OUTCOME = 'OUTCOME',
    TRANSFER = 'TRANSFER',
    OWN = 'OWN',
}

export interface OperationInput {
    category: IdDTO;
    accountOutcome: IdDTO | null;
    accountIncome: IdDTO | null;
    operationType: OperationType;
    operationDate: string;
    description: string;
    place: IdDTO | null;
    income: string | null;
    outcome: string | null;
}

export interface ListOperation {
    id: string;
    category: SimpleCategory | null;
    accountOutcome: SimpleAccount | null;
    accountIncome: SimpleAccount | null;
    operationDate: string;
    description: string;
    place: SimplePlace | null;
    income: number;
    outcome: number;
    created: string;
    updated: string;
}

export interface SimpleOperation {
    id: string;
    category: SimpleCategory | null;
    accountOutcome: SimpleAccount | null;
    accountIncome: SimpleAccount | null;
    operationDate: string;
    description: string;
    place: SimplePlace | null;
    income: number;
    outcome: number;
    created: string;
    updated: string;
}

export interface DateRangeFilter {
    from: string | null;
    to: string | null;
}

export interface CategoryFilter {
    categoryIds: string[];
    include: boolean;
}

export interface OperationFilterDTO {
    dateRange: DateRangeFilter | null;
    accountIds: string[] | null;
    categoryFilter: CategoryFilter | null;
    notProcessed: boolean | null;
    operationTypes: OperationType[] | null;
}
