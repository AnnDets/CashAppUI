export interface IdDTO {
    id: string;
}

export interface Bank {
    id: string;
    country: string;
    displayName: string;
    icon: string | null;
}

export interface SimpleBank {
    id: string;
    displayName: string;
}

export interface Color {
    id: string;
    red: number;
    green: number;
    blue: number;
}

export interface Currency {
    id: string;
    displayName: string;
    symbol: string;
}

export interface Icon {
    id: string;
    data: string;
}

export function colorToHex(color: Color): string {
    const r = color.red.toString(16).padStart(2, '0');
    const g = color.green.toString(16).padStart(2, '0');
    const b = color.blue.toString(16).padStart(2, '0');
    return `#${r}${g}${b}`;
}
