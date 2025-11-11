import type { RouteComparison } from '../../core/domain/Comparison';

const API_BASE_URL = 'http://localhost:3000/api';

// GET /routes/comparison - Fetch route comparison data
export const getComparisonData = async (): Promise<RouteComparison[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/routes/comparison`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Failed to fetch comparison data: ${response.statusText}`);
        }

        const payload = await response.json();

        // Backend returns { success: boolean, data: RouteComparison[] }
        if (payload && Array.isArray(payload.data)) {
            return payload.data as RouteComparison[];
        }

        // Fallback if API returns raw array
        if (Array.isArray(payload)) {
            return payload as RouteComparison[];
        }

        // Unexpected shape
        throw new Error('Unexpected response shape from /routes/comparison API');
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('An unexpected error occurred while fetching comparison data');
    }
};
