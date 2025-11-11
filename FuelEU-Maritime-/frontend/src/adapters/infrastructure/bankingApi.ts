import type { ComplianceBalance, BankingResult, BankRequest } from '../../core/domain/Banking';

const API_BASE_URL = 'http://localhost:3000/api';

// GET /compliance/adjusted-cb?year=YYYY - Fetch compliance balances for a given year
export const getComplianceCB = async (year: number): Promise<ComplianceBalance[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/compliance/adjusted-cb?year=${year}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Failed to fetch compliance balances: ${response.statusText}`);
        }

        const payload = await response.json();

        // Backend returns { success: boolean, data: ComplianceBalance[] }
        if (payload && Array.isArray(payload.data)) {
            return payload.data as ComplianceBalance[];
        }

        // Fallback if API returns raw array
        if (Array.isArray(payload)) {
            return payload as ComplianceBalance[];
        }

        // Unexpected shape
        throw new Error('Unexpected response shape from /compliance/adjusted-cb API');
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('An unexpected error occurred while fetching compliance balances');
    }
};

// POST /banking/bank - Bank positive CB
export const bankSurplus = async (shipId: string, year: number, amount: number): Promise<void> => {
    try {
        const response = await fetch(`${API_BASE_URL}/banking/bank`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ shipId, year, amount } as BankRequest),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Failed to bank surplus: ${response.statusText}`);
        }
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('An unexpected error occurred while banking surplus');
    }
};

// POST /banking/apply - Apply banked CB to deficit ships
export const applyBanked = async (shipId: string, year: number, applyAmount: number): Promise<BankingResult> => {
    try {
        const response = await fetch(`${API_BASE_URL}/banking/apply`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ shipId, year, applyAmount }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Failed to apply banked CB: ${response.statusText}`);
        }

        const payload = await response.json();

        // Backend returns { success: boolean, ...BankingResult } (spread into response)
        if (payload && typeof payload.cb_before !== 'undefined') {
            return {
                cb_before: payload.cb_before,
                applied: payload.applied,
                cb_after: payload.cb_after,
            } as BankingResult;
        }

        // Unexpected shape
        throw new Error('Unexpected response shape from /banking/apply API');
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('An unexpected error occurred while applying banked CB');
    }
};
