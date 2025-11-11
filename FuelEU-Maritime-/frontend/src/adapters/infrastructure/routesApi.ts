import type { Route } from '../../core/domain/Route';

const API_BASE_URL = 'http://localhost:3000/api';

// GET /routes -  Fetch all routes from the backend
export const getRoutes = async (): Promise<Route[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/routes`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Failed to fetch routes: ${response.statusText}`);
        }

        const payload = await response.json();

        // Backend returns { success: boolean, data: Route[], count: number }
        if (payload && Array.isArray(payload.data)) {
            return payload.data as Route[];
        }

        // Fallback if API returns raw array
        if (Array.isArray(payload)) {
            return payload as Route[];
        }

        // Unexpected shape
        throw new Error('Unexpected response shape from /routes API');
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('An unexpected error occurred while fetching routes');
    }
};

// POST /routes/:routeId/baseline - Set a route as the baseline
export const setBaseline = async (routeId: string): Promise<void> => {
    try {
        const response = await fetch(`${API_BASE_URL}/routes/${routeId}/baseline`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Failed to set baseline: ${response.statusText}`);
        }
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('An unexpected error occurred while setting baseline');
    }
};
