import React, { useState, useEffect, useMemo } from 'react';
import { getRoutes, setBaseline } from '../infrastructure/routesApi';
import type { Route, RouteFilters } from '../../core/domain/Route';

interface RoutesTabProps {
    isActive: boolean;
}

export const RoutesTab: React.FC<RoutesTabProps> = ({ isActive: _isActive }) => {
    const [routes, setRoutes] = useState<Route[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [settingBaseline, setSettingBaseline] = useState<string | null>(null);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const [filters, setFilters] = useState<RouteFilters>({
        vesselType: 'All',
        fuelType: 'All',
        year: 'All',
    });

    // Fetch routes on component mount
    useEffect(() => {
        fetchRoutes();
    }, []);

    // Auto-hide toast after 3 seconds
    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    const fetchRoutes = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getRoutes();
            setRoutes(data);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to fetch routes';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    const handleSetBaseline = async (routeId: string) => {
        // Prevent full page reloads by performing an optimistic in-memory update
        const previousRoutes = routes;

        try {
            setSettingBaseline(routeId);

            // Optimistically mark the selected route as baseline and clear others
            setRoutes((prev) =>
                prev.map((r) => ({
                    ...r,
                    isBaseline: r.routeId === routeId,
                }))
            );

            await setBaseline(routeId);


            try {
                const fresh = await getRoutes();
                setRoutes(fresh);
            } catch (err) {
                console.warn('Failed to revalidate routes after setting baseline', err);
            }

            setToast({ message: `Route ${routeId} set as baseline successfully!`, type: 'success' });
        } catch (err) {
            // Revert optimistic update on failure
            setRoutes(previousRoutes);
            const message = err instanceof Error ? err.message : 'Failed to set baseline';
            setToast({ message, type: 'error' });
        } finally {
            setSettingBaseline(null);
        }
    };

    // Extract unique filter options
    const vesselTypes = useMemo(() => ['All', ...new Set(routes.map((r) => r.vesselType))], [routes]);
    const fuelTypes = useMemo(() => ['All', ...new Set(routes.map((r) => r.fuelType))], [routes]);
    const years = useMemo(() => ['All', ...new Set(routes.map((r) => r.year.toString()))], [routes]);

    // Filter routes based on selected filters
    const filteredRoutes = useMemo(() => {
        return routes.filter((route) => {
            if (filters.vesselType !== 'All' && route.vesselType !== filters.vesselType) return false;
            if (filters.fuelType !== 'All' && route.fuelType !== filters.fuelType) return false;
            if (filters.year !== 'All' && route.year.toString() !== filters.year) return false;
            return true;
        });
    }, [routes, filters]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center space-y-4">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-600 font-medium">Loading routes...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
                    <div className="flex items-center space-x-3">
                        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                            <h3 className="text-red-800 font-semibold">Error</h3>
                            <p className="text-red-600">{error}</p>
                        </div>
                    </div>
                    <button
                        onClick={fetchRoutes}
                        className="mt-4 w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6">
            {/* Toast Notification */}
            {toast && (
                <div
                    className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3 ${
                        toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                    }`}
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {toast.type === 'success' ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        )}
                    </svg>
                    <span className="font-medium">{toast.message}</span>
                </div>
            )}

            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-800">Routes</h2>
                <p className="text-gray-600 mt-1">Manage and view all maritime routes</p>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Filters</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Vessel Type</label>
                        <select
                            value={filters.vesselType}
                            onChange={(e) => setFilters({ ...filters, vesselType: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            {vesselTypes.map((type) => (
                                <option key={type} value={type}>
                                    {type}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Fuel Type</label>
                        <select
                            value={filters.fuelType}
                            onChange={(e) => setFilters({ ...filters, fuelType: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            {fuelTypes.map((type) => (
                                <option key={type} value={type}>
                                    {type}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                        <select
                            value={filters.year}
                            onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            {years.map((year) => (
                                <option key={year} value={year}>
                                    {year}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Routes Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Route ID
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Vessel Type
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Fuel Type
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Year
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    GHG Intensity
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Fuel Consumption
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Distance
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Total Emissions
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredRoutes.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                                        No routes found matching the filters.
                                    </td>
                                </tr>
                            ) : (
                                filteredRoutes.map((route) => (
                                    <tr
                                        key={route.id}
                                        className={`hover:bg-gray-50 transition-colors ${
                                            route.isBaseline ? 'bg-green-50 border-l-4 border-green-500' : ''
                                        }`}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <span className="text-sm font-medium text-gray-900">{route.routeId}</span>
                                                {route.isBaseline && (
                                                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        Baseline
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{route.vesselType}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{route.fuelType}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{route.year}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                            {route.ghgIntensity.toFixed(2)} gCO₂e/MJ
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                            {route.fuelConsumption.toFixed(2)} t
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                            {route.distance.toFixed(2)} nm
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                            {route.totalEmissions.toFixed(2)} tCO₂e
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <button
                                                type="button"
                                                onClick={() => handleSetBaseline(route.routeId)}
                                                disabled={route.isBaseline || settingBaseline === route.routeId}
                                                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                                                    route.isBaseline
                                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                        : settingBaseline === route.routeId
                                                        ? 'bg-blue-400 text-white cursor-wait'
                                                        : 'bg-blue-600 text-white hover:bg-blue-700'
                                                }`}
                                            >
                                                {settingBaseline === route.routeId ? (
                                                    <span className="flex items-center space-x-2">
                                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                        <span>Setting...</span>
                                                    </span>
                                                ) : route.isBaseline ? (
                                                    'Current Baseline'
                                                ) : (
                                                    'Set Baseline'
                                                )}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Footer Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                        <p className="text-sm text-blue-800">
                            <strong>Total Routes:</strong> {routes.length} | <strong>Filtered:</strong> {filteredRoutes.length}
                        </p>
                        <p className="text-xs text-blue-600 mt-1">
                            The baseline route is used for comparison calculations. Only one route can be set as baseline at a time.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
