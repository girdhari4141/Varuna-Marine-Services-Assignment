import type { AdjustedCB, PoolRequest, PoolResult } from '../../core/domain/Pooling';

const API_BASE_URL = 'http://localhost:3000/api';

// GET /compliance/adjusted-cb?year=YYYY - Fetch adjusted compliance balances
export const getAdjustedCB = async (year: number): Promise<AdjustedCB[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/compliance/adjusted-cb?year=${year}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Failed to fetch adjusted CB: ${response.statusText}`);
        }

        const payload = await response.json();

        // Backend returns { success: boolean, data: AdjustedCB[] }
        if (payload && Array.isArray(payload.data)) {
            return payload.data as AdjustedCB[];
        }

        // Fallback if API returns raw array
        if (Array.isArray(payload)) {
            return payload as AdjustedCB[];
        }

        // Unexpected shape
        throw new Error('Unexpected response shape from /compliance/adjusted-cb API');
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('An unexpected error occurred while fetching adjusted CB');
    }
};

// POST /pools - Create a pool with selected members
export const createPool = async (year: number, members: { shipId: string; cb_before: number }[]): Promise<PoolResult> => {
    try {
        const response = await fetch(`${API_BASE_URL}/pools`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ year, members } as PoolRequest),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Failed to create pool: ${response.statusText}`);
        }

        const payload = await response.json();

        // Backend returns { success: boolean, data: PoolResult }
        if (payload && payload.data) {
            return payload.data as PoolResult;
        }

        // Fallback if API returns raw result
        if (payload && typeof payload.poolId !== 'undefined') {
            return payload as PoolResult;
        }

        // Unexpected shape
        throw new Error('Unexpected response shape from /pools API');
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('An unexpected error occurred while creating pool');
    }
};
