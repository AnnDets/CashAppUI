import {Color, Icon, IdDTO, NameDTO} from './Config';

export interface Category {
    id: string;
    name: string;
    forIncome: boolean;
    forOutcome: boolean;
    mandatoryOutcome: boolean;
    icon: Icon | null;
    color: Color | null;
}

export interface CategoryInput {
    name: string;
    forIncome: boolean;
    forOutcome: boolean;
    mandatoryOutcome: boolean;
    icon: IdDTO | null;
    color: NameDTO | null;
}

export interface ListCategory {
    id: string;
    name: string;
    icon: Icon | null;
    color: Color | null;
    forIncome: boolean;
    forOutcome: boolean;
}

export interface SimpleCategory {
    id: string;
    name: string;
    color: Color | null;
    icon: Icon | null;
}
