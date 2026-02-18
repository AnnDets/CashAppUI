import {Bank, Currency, IdDTO} from './Config';

export enum AccountType {
    CASH = 'CASH',
    CARD = 'CARD',
    BANK_ACCOUNT = 'BANK_ACCOUNT',
    CREDIT = 'CREDIT',
    DEPOSIT = 'DEPOSIT',
}

export interface Account {
    id: string;
    name: string;
    type: AccountType;
    currency: Currency;
    creditLimit: number;
    currentBalance: number;
    includeInTotalBalance: boolean;
    defaultAccount: boolean;
    bank: Bank | null;
    cardNumber1: string | null;
    cardNumber2: string | null;
    cardNumber3: string | null;
    cardNumber4: string | null;
    savingsAccount: boolean;
    archiveAccount: boolean;
}

export interface AccountInput {
    name: string;
    type: AccountType;
    currency: IdDTO;
    creditLimit: number;
    currentBalance: number;
    includeInTotalBalance: boolean;
    defaultAccount: boolean;
    bank: IdDTO | null;
    cardNumber1: string | null;
    cardNumber2: string | null;
    cardNumber3: string | null;
    cardNumber4: string | null;
    savingsAccount: boolean;
    archiveAccount: boolean;
}

export interface ListAccount {
    id: string;
    name: string;
    type: AccountType;
    currency: Currency;
    creditLimit: number;
    currentBalance: number;
    bankIcon: string | null;
    savingsAccount: boolean;
    archiveAccount: boolean;
}

export interface SimpleAccount {
    id: string;
    name: string;
}
