import React, { useState, useEffect, useMemo } from 'react';
import { getComplianceCB, bankSurplus, applyBanked } from '../infrastructure/bankingApi';
import type { ComplianceBalance, BankingResult } from '../../core/domain/Banking';

interface BankingTabProps {
    isActive: boolean;
}

export const BankingTab: React.FC<BankingTabProps> = ({ isActive }) => {
    const [balances, setBalances] = useState<ComplianceBalance[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
    const [bankingResult, setBankingResult] = useState<BankingResult | null>(null);
    
    // Modal states
    const [showBankModal, setShowBankModal] = useState<boolean>(false);
    const [showApplyModal, setShowApplyModal] = useState<boolean>(false);
    const [selectedBalance, setSelectedBalance] = useState<ComplianceBalance | null>(null);
    const [modalAmount, setModalAmount] = useState<string>('');
    const [modalLoading, setModalLoading] = useState<boolean>(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    // Generate year options (current year and previous 5 years)
    const yearOptions = useMemo(() => {
        const currentYear = new Date().getFullYear();
        return Array.from({ length: 6 }, (_, i) => currentYear - i);
    }, []);

    // Fetch compliance balances when year changes
    useEffect(() => {
        fetchBalances();
    }, [selectedYear]);

    // Refetch data when tab becomes active
    useEffect(() => {
        if (isActive && balances.length > 0) {
            // Only refetch if we already have data (not on initial mount)
            fetchBalances();
        }
    }, [isActive]);

    // Auto-hide toast after 3 seconds
    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    const fetchBalances = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getComplianceCB(selectedYear);
            setBalances(data);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to fetch compliance balances';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    const handleBankSurplus = (balance: ComplianceBalance) => {
        setSelectedBalance(balance);
        setModalAmount(balance.cb_before.toString());
        setShowBankModal(true);
    };

    const handleApplySurplus = (balance: ComplianceBalance) => {
        setSelectedBalance(balance);
        setModalAmount(Math.abs(balance.cb_before).toString());
        setShowApplyModal(true);
    };

    const confirmBank = async () => {
        if (!selectedBalance) return;

        try {
            setModalLoading(true);
            const amount = parseFloat(modalAmount);
            
            if (isNaN(amount) || amount <= 0) {
                setToast({ message: 'Please enter a valid positive amount', type: 'error' });
                return;
            }

            if (amount > selectedBalance.cb_before) {
                setToast({ message: 'Amount cannot exceed available CB', type: 'error' });
                return;
            }

            await bankSurplus(selectedBalance.shipId, selectedYear, amount);
            setToast({ message: `Successfully banked ${amount.toLocaleString()} gCO₂eq`, type: 'success' });
            setShowBankModal(false);
            setModalAmount('');
            setSelectedBalance(null);
            await fetchBalances(); // Refresh data
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to bank surplus';
            setToast({ message, type: 'error' });
        } finally {
            setModalLoading(false);
        }
    };

    const confirmApply = async () => {
        if (!selectedBalance) return;

        try {
            setModalLoading(true);
            const amount = parseFloat(modalAmount);
            
            if (isNaN(amount) || amount <= 0) {
                setToast({ message: 'Please enter a valid positive amount', type: 'error' });
                return;
            }

            const result = await applyBanked(selectedBalance.shipId, selectedYear, amount);
            setBankingResult(result);
            setToast({ message: 'Successfully applied banked CB', type: 'success' });
            setShowApplyModal(false);
            setModalAmount('');
            setSelectedBalance(null);
            await fetchBalances(); // Refresh data
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to apply banked CB';
            setToast({ message, type: 'error' });
        } finally {
            setModalLoading(false);
        }
    };

    const closeModal = () => {
        setShowBankModal(false);
        setShowApplyModal(false);
        setModalAmount('');
        setSelectedBalance(null);
    };

    // Calculate summary statistics
    const totalSurplus = useMemo(() => 
        balances.filter(b => b.cb_before > 0).reduce((sum, b) => sum + b.cb_before, 0),
        [balances]
    );

    const totalDeficit = useMemo(() => 
        balances.filter(b => b.cb_before < 0).reduce((sum, b) => sum + Math.abs(b.cb_before), 0),
        [balances]
    );

    const netBalance = useMemo(() => 
        balances.reduce((sum, b) => sum + b.cb_before, 0),
        [balances]
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center space-y-4">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-600 font-medium">Loading compliance balances...</p>
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
                        onClick={fetchBalances}
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
                        <h2 className="text-2xl font-bold text-gray-800">Banking & Compliance</h2>
                        <p className="text-gray-600 mt-1">Manage compliance balances and banking operations</p>
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

            {/* Summary KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                    <div className="flex items-center space-x-3">
                        <div className="p-3 bg-green-100 rounded-lg">
                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Total Surplus</p>
                            <p className="text-2xl font-bold text-green-600">
                                {totalSurplus.toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-500">gCO₂eq</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                    <div className="flex items-center space-x-3">
                        <div className="p-3 bg-red-100 rounded-lg">
                            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Total Deficit</p>
                            <p className="text-2xl font-bold text-red-600">
                                {totalDeficit.toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-500">gCO₂eq</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                    <div className="flex items-center space-x-3">
                        <div className={`p-3 rounded-lg ${netBalance >= 0 ? 'bg-blue-100' : 'bg-orange-100'}`}>
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Net Balance</p>
                            <p className={`text-2xl font-bold ${netBalance >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                                {netBalance >= 0 ? '+' : ''}{netBalance.toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-500">gCO₂eq</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Banking Result KPIs (shown after apply action) */}
            {bankingResult && (
                <div className="bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Latest Banking Operation
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white rounded-lg p-4 shadow-sm">
                            <p className="text-sm text-gray-600 mb-1">CB Before</p>
                            <p className="text-xl font-bold text-gray-800">{bankingResult.cb_before.toLocaleString()}</p>
                            <p className="text-xs text-gray-500">gCO₂eq</p>
                        </div>
                        <div className="bg-white rounded-lg p-4 shadow-sm">
                            <p className="text-sm text-gray-600 mb-1">Applied Amount</p>
                            <p className="text-xl font-bold text-green-600">{bankingResult.applied.toLocaleString()}</p>
                            <p className="text-xs text-gray-500">gCO₂eq</p>
                        </div>
                        <div className="bg-white rounded-lg p-4 shadow-sm">
                            <p className="text-sm text-gray-600 mb-1">CB After</p>
                            <p className="text-xl font-bold text-blue-600">{bankingResult.cb_after.toLocaleString()}</p>
                            <p className="text-xs text-gray-500">gCO₂eq</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Compliance Balances Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800">Compliance Balances</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
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
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {balances.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        No compliance balances found for year {selectedYear}.
                                    </td>
                                </tr>
                            ) : (
                                balances.map((balance) => (
                                    <tr
                                        key={balance.shipId}
                                        className={`hover:bg-gray-50 transition-colors ${
                                            balance.cb_before > 0 ? 'bg-green-50' : balance.cb_before < 0 ? 'bg-red-50' : ''
                                        }`}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm font-medium text-gray-900">{balance.shipId}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                            {balance.vesselType}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`text-sm font-bold ${
                                                balance.cb_before > 0 
                                                    ? 'text-green-600' 
                                                    : balance.cb_before < 0 
                                                    ? 'text-red-600' 
                                                    : 'text-gray-600'
                                            }`}>
                                                {balance.cb_before >= 0 ? '+' : ''}{balance.cb_before.toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {balance.cb_before > 0 ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    Surplus
                                                </span>
                                            ) : balance.cb_before < 0 ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                    Deficit
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                    Neutral
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                                            <button
                                                type="button"
                                                onClick={() => handleBankSurplus(balance)}
                                                disabled={balance.cb_before <= 0}
                                                className={`px-3 py-1 rounded-md font-medium transition-colors ${
                                                    balance.cb_before > 0
                                                        ? 'bg-green-600 text-white hover:bg-green-700'
                                                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                }`}
                                            >
                                                Bank Surplus
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleApplySurplus(balance)}
                                                disabled={balance.cb_before >= 0}
                                                className={`px-3 py-1 rounded-md font-medium transition-colors ${
                                                    balance.cb_before < 0
                                                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                                                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                }`}
                                            >
                                                Apply Banked
                                            </button>
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
                            Banking allows you to save surplus CB for future use or apply banked CB to deficit ships.
                        </p>
                        <p className="text-xs text-blue-600 mt-1">
                            Surplus CB (positive) can be banked. Deficit CB (negative) can have banked CB applied to reduce the deficit.
                        </p>
                    </div>
                </div>
            </div>

            {/* Bank Surplus Modal */}
            {showBankModal && selectedBalance && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-800">Bank Surplus CB</h3>
                        </div>
                        <div className="px-6 py-4 space-y-4">
                            <div>
                                <p className="text-sm text-gray-600">Ship ID: <span className="font-medium text-gray-800">{selectedBalance.shipId}</span></p>
                                <p className="text-sm text-gray-600">Available CB: <span className="font-medium text-green-600">{selectedBalance.cb_before.toLocaleString()} gCO₂eq</span></p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Amount to Bank (gCO₂eq)
                                </label>
                                <input
                                    type="number"
                                    value={modalAmount}
                                    onChange={(e) => setModalAmount(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Enter amount"
                                    min="0"
                                    max={selectedBalance.cb_before}
                                />
                            </div>
                        </div>
                        <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={closeModal}
                                disabled={modalLoading}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={confirmBank}
                                disabled={modalLoading}
                                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                            >
                                {modalLoading && (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                )}
                                <span>{modalLoading ? 'Banking...' : 'Confirm Bank'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Apply Banked Modal */}
            {showApplyModal && selectedBalance && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-800">Apply Banked CB</h3>
                        </div>
                        <div className="px-6 py-4 space-y-4">
                            <div>
                                <p className="text-sm text-gray-600">Ship ID: <span className="font-medium text-gray-800">{selectedBalance.shipId}</span></p>
                                <p className="text-sm text-gray-600">Current Deficit: <span className="font-medium text-red-600">{selectedBalance.cb_before.toLocaleString()} gCO₂eq</span></p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Amount to Apply (gCO₂eq)
                                </label>
                                <input
                                    type="number"
                                    value={modalAmount}
                                    onChange={(e) => setModalAmount(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Enter amount"
                                    min="0"
                                />
                            </div>
                            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                                <p className="text-xs text-yellow-800">
                                    <strong>Note:</strong> This will use banked CB to reduce the deficit for this route.
                                </p>
                            </div>
                        </div>
                        <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={closeModal}
                                disabled={modalLoading}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={confirmApply}
                                disabled={modalLoading}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                            >
                                {modalLoading && (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                )}
                                <span>{modalLoading ? 'Applying...' : 'Confirm Apply'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
