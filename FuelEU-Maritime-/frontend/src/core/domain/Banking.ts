// Banking domain types for Fuel EU Maritime frontend

export interface ComplianceBalance {
    shipId: string;
    vesselType: string;
    cb_before: number;
}

export interface BankingResult {
    cb_before: number;
    applied: number;
    cb_after: number;
}

export interface BankRequest {
    shipId: string;
    year: number;
    amount: number;
}

export interface ApplyRequest {
    shipId: string;
    year: number;
    amount: number;
}
