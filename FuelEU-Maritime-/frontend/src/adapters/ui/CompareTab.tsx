import React, { useState, useEffect } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Cell,
} from 'recharts';
import { getComparisonData } from '../infrastructure/compareApi';
import type { RouteComparison } from '../../core/domain/Comparison';

interface CompareTabProps {
    isActive: boolean;
}

export const CompareTab: React.FC<CompareTabProps> = ({ isActive }) => {
    const [comparisons, setComparisons] = useState<RouteComparison[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState<boolean>(false);

    // Fetch comparison data on component mount
    useEffect(() => {
        fetchComparisonData();
    }, []);

    // Refetch data when tab becomes active
    useEffect(() => {
        if (isActive && comparisons.length > 0) {
            // Only refetch if we already have data (not on initial mount)
            handleRefresh();
        }
    }, [isActive]);

    const fetchComparisonData = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getComparisonData();
            setComparisons(data);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to fetch comparison data';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        try {
            setRefreshing(true);
            setError(null);
            const data = await getComparisonData();
            setComparisons(data);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to refresh comparison data';
            setError(message);
        } finally {
            setRefreshing(false);
        }
    };

    // Prepare data for recharts
    const chartData = comparisons.map((item) => ({
        routeId: item.routeId,
        baseline: item.baselineIntensity,
        comparison: item.comparisonIntensity,
        compliant: item.compliant,
    }));

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center space-y-4">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-600 font-medium">Loading comparison data...</p>
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
                        onClick={fetchComparisonData}
                        className="mt-4 w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    if (comparisons.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md">
                    <div className="flex items-center space-x-3">
                        <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <div>
                            <h3 className="text-yellow-800 font-semibold">No Data</h3>
                            <p className="text-yellow-600">No baseline route set. Please set a baseline in the Routes tab first.</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Route Comparison</h2>
                        <p className="text-gray-600 mt-1">Compare GHG intensities against baseline route</p>
                    </div>
                    <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-colors ${refreshing
                                ? 'bg-blue-400 text-white cursor-wait'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                    >
                        {refreshing ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Refreshing...</span>
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                <span>Refresh Data</span>
                            </>
                        )}
                    </button>
                </div>
            </div>



            {/* Comparison Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Route ID
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Baseline Intensity
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Comparison Intensity
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    % Difference
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Compliant
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {comparisons.map((comparison) => (
                                <tr
                                    key={comparison.routeId}
                                    className={`hover:bg-gray-50 transition-colors ${comparison.compliant ? 'bg-green-50' : 'bg-red-50'
                                        }`}
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm font-medium text-gray-900">{comparison.routeId}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        {comparison.baselineIntensity.toFixed(2)} gCO₂e/MJ
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        {comparison.comparisonIntensity.toFixed(2)} gCO₂e/MJ
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span
                                            className={`text-sm font-medium ${comparison.percentDiff > 0 ? 'text-red-600' : 'text-green-600'
                                                }`}
                                        >
                                            {comparison.percentDiff > 0 ? '+' : ''}
                                            {comparison.percentDiff.toFixed(2)}%
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        {comparison.compliant ? (
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                                Compliant
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                                                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                </svg>
                                                Non-Compliant
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                    <div className="flex items-center space-x-3">
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Total Routes</p>
                            <p className="text-2xl font-bold text-gray-800">{comparisons.length}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                    <div className="flex items-center space-x-3">
                        <div className="p-3 bg-green-100 rounded-lg">
                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Compliant Routes</p>
                            <p className="text-2xl font-bold text-green-600">
                                {comparisons.filter((c) => c.compliant).length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                    <div className="flex items-center space-x-3">
                        <div className="p-3 bg-red-100 rounded-lg">
                            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Non-Compliant Routes</p>
                            <p className="text-2xl font-bold text-red-600">
                                {comparisons.filter((c) => !c.compliant).length}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            {/* Chart */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">GHG Intensity Comparison</h3>
                <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="routeId" />
                        <YAxis label={{ value: 'GHG Intensity (gCO₂e/MJ)', angle: -90, position: 'insideLeft' }} />
                        <Tooltip
                            formatter={(value: number) => `${value.toFixed(2)} gCO₂e/MJ`}
                            contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid #ccc' }}
                        />
                        <Legend />
                        <Bar dataKey="baseline" name="Baseline Intensity" fill="#3b82f6" />
                        <Bar dataKey="comparison" name="Route Intensity">
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.compliant ? '#10b981' : '#ef4444'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
            {/* Info Footer */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                        <p className="text-sm text-blue-800 font-medium">
                            Routes are compared against the baseline route's GHG intensity.
                        </p>
                        <p className="text-xs text-blue-600 mt-1">
                            Green indicates compliant (lower or equal intensity), red indicates non-compliant (higher intensity).
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
