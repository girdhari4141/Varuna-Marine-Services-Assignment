import React, { useState, useEffect, useMemo } from 'react';
import { getAdjustedCB, createPool } from '../infrastructure/poolingApi';
import type { AdjustedCB, PoolResult } from '../../core/domain/Pooling';

interface PoolingTabProps {
    isActive: boolean;
}

export const PoolingTab: React.FC<PoolingTabProps> = ({ isActive }) => {
    const [ships, setShips] = useState<AdjustedCB[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
    const [selectedShips, setSelectedShips] = useState<Set<string>>(new Set());
    const [poolResult, setPoolResult] = useState<PoolResult | null>(null);
    const [creating, setCreating] = useState<boolean>(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    // Generate year options (current year and previous 5 years)
    const yearOptions = useMemo(() => {
        const currentYear = new Date().getFullYear();
        return Array.from({ length: 6 }, (_, i) => currentYear - i);
    }, []);

    // Fetch adjusted CBs when year changes
    useEffect(() => {
        fetchShips();
    }, [selectedYear]);

    // Refetch data when tab becomes active
    useEffect(() => {
        if (isActive && ships.length > 0) {
            // Only refetch if we already have data (not on initial mount)
            fetchShips();
        }
    }, [isActive]);

    // Auto-hide toast after 3 seconds
    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    const fetchShips = async () => {
        try {
            setLoading(true);
            setError(null);
            setSelectedShips(new Set()); // Clear selection on year change
            setPoolResult(null); // Clear previous pool result
            const data = await getAdjustedCB(selectedYear);
            setShips(data);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to fetch adjusted CB data';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    const toggleShipSelection = (shipId: string) => {
        setSelectedShips((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(shipId)) {
                newSet.delete(shipId);
            } else {
                newSet.add(shipId);
            }
            return newSet;
        });
    };

    const handleSelectAll = () => {
        if (selectedShips.size === ships.length) {
            setSelectedShips(new Set());
        } else {
            setSelectedShips(new Set(ships.map(s => s.shipId)));
        }
    };

    // Calculate pool sum from selected ships
    const poolSum = useMemo(() => {
        return ships
            .filter(ship => selectedShips.has(ship.shipId))
            .reduce((sum, ship) => sum + ship.cb_before, 0);
    }, [ships, selectedShips]);

    const selectedShipsList = useMemo(() => {
        return ships.filter(ship => selectedShips.has(ship.shipId));
    }, [ships, selectedShips]);

    const handleCreatePool = async () => {
        if (selectedShips.size < 2) {
            setToast({ message: 'Please select at least 2 ships to create a pool', type: 'error' });
            return;
        }

        try {
            setCreating(true);
            const members = selectedShipsList.map(ship => ({
                shipId: ship.shipId,
                cb_before: ship.cb_before,
            }));

            const result = await createPool(selectedYear, members);
            setPoolResult(result);
            setToast({ message: `Pool ${result.poolId} created successfully!`, type: 'success' });
            setSelectedShips(new Set()); // Clear selection after creating pool
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to create pool';
            setToast({ message, type: 'error' });
        } finally {
            setCreating(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center space-y-4">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-600 font-medium">Loading pooling data...</p>
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
                        onClick={fetchShips}
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

            {/* Header with Year Selector */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Pooling</h2>
                        <p className="text-gray-600 mt-1">Create pools to share compliance balances across ships</p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <label className="text-sm font-medium text-gray-700">Year:</label>
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            {yearOptions.map((year) => (
                                <option key={year} value={year}>
                                    {year}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Pool Summary Card */}
            {selectedShips.size > 0 && (
                <div className={`rounded-lg shadow-sm p-6 border-2 ${
                    poolSum >= 0 ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'
                }`}>
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">Selected Pool Summary</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600">Ships Selected</p>
                                    <p className="text-2xl font-bold text-gray-800">{selectedShips.size}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Pool Sum (CB)</p>
                                    <p className={`text-2xl font-bold ${poolSum >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {poolSum >= 0 ? '+' : ''}{poolSum.toLocaleString()}
                                    </p>
                                    <p className="text-xs text-gray-500">gCO₂eq</p>
                                </div>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={handleCreatePool}
                            disabled={selectedShips.size < 2 || creating}
                            className={`px-6 py-3 rounded-md font-medium transition-colors ${
                                selectedShips.size >= 2 && !creating
                                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                        >
                            {creating ? (
                                <span className="flex items-center space-x-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Creating...</span>
                                </span>
                            ) : (
                                'Create Pool'
                            )}
                        </button>
                    </div>
                    {selectedShips.size < 2 && (
                        <p className="text-sm text-gray-600 mt-3">
                            ⚠️ Select at least 2 ships to create a pool
                        </p>
                    )}
                </div>
            )}

            {/* Pool Result Card */}
            {poolResult && (
                <div className="bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Pool #{poolResult.poolId} Created Successfully
                    </h3>
                    <div className="bg-white rounded-lg p-4 mb-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-600">Pool ID</p>
                                <p className="text-xl font-bold text-gray-800">{poolResult.poolId}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total Pool CB</p>
                                <p className={`text-xl font-bold ${poolResult.totalCB >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {poolResult.totalCB >= 0 ? '+' : ''}{poolResult.totalCB.toLocaleString()}
                                </p>
                                <p className="text-xs text-gray-500">gCO₂eq</p>
                            </div>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white rounded-lg overflow-hidden">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Ship ID</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">CB Before</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">CB After</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Change</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {poolResult.members.map((member) => (
                                    <tr key={member.shipId} className="hover:bg-gray-50">
                                        <td className="px-4 py-2 text-sm font-medium text-gray-900">{member.shipId}</td>
                                        <td className="px-4 py-2 text-sm text-gray-700">
                                            {member.cb_before >= 0 ? '+' : ''}{member.cb_before.toLocaleString()}
                                        </td>
                                        <td className="px-4 py-2 text-sm text-gray-700">
                                            {member.cb_after !== undefined 
                                                ? `${member.cb_after >= 0 ? '+' : ''}${member.cb_after.toLocaleString()}`
                                                : 'N/A'}
                                        </td>
                                        <td className="px-4 py-2 text-sm">
                                            {member.cb_after !== undefined ? (
                                                <span className={`font-medium ${
                                                    member.cb_after - member.cb_before >= 0 ? 'text-green-600' : 'text-red-600'
                                                }`}>
                                                    {member.cb_after - member.cb_before >= 0 ? '+' : ''}
                                                    {(member.cb_after - member.cb_before).toLocaleString()}
                                                </span>
                                            ) : 'N/A'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Ships Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-800">Available Ships</h3>
                    <button
                        type="button"
                        onClick={handleSelectAll}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                        {selectedShips.size === ships.length ? 'Deselect All' : 'Select All'}
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Select
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Ship ID
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Vessel Type
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Compliance Balance (gCO₂eq)
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {ships.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        No ships found for year {selectedYear}.
                                    </td>
                                </tr>
                            ) : (
                                ships.map((ship) => (
                                    <tr
                                        key={ship.shipId}
                                        className={`hover:bg-gray-50 transition-colors cursor-pointer ${
                                            selectedShips.has(ship.shipId) ? 'bg-blue-50' : ''
                                        }`}
                                        onClick={() => toggleShipSelection(ship.shipId)}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <input
                                                type="checkbox"
                                                checked={selectedShips.has(ship.shipId)}
                                                onChange={() => toggleShipSelection(ship.shipId)}
                                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm font-medium text-gray-900">{ship.shipId}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                            {ship.vesselType}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`text-sm font-bold ${
                                                ship.cb_before > 0 
                                                    ? 'text-green-600' 
                                                    : ship.cb_before < 0 
                                                    ? 'text-red-600' 
                                                    : 'text-gray-600'
                                            }`}>
                                                {ship.cb_before >= 0 ? '+' : ''}{ship.cb_before.toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {ship.cb_before > 0 ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    Surplus
                                                </span>
                                            ) : ship.cb_before < 0 ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                    Deficit
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                    Neutral
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Info Footer */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                        <p className="text-sm text-blue-800 font-medium">
                            Pooling allows ships to share compliance balances. Select multiple ships to form a pool.
                        </p>
                        <p className="text-xs text-blue-600 mt-1">
                            A pool with a positive sum (green) means overall compliance is achieved. Ships with deficits benefit from ships with surplus.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
