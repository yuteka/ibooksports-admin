'use client';

import React, { useState } from 'react';
import {
  Landmark,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ArrowDownRight,
  Download,
  Building2,
  Check,
  X,
  AlertCircle,
  Eye,
  ShieldCheck,
  DollarSign,
  Send,
} from 'lucide-react';
import { INITIAL_SETTLEMENTS, SettlementBatchItem } from '@/lib/mockData';

export default function SettlementManagementPage() {
  const [settlements, setSettlements] = useState<SettlementBatchItem[]>(INITIAL_SETTLEMENTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedBatch, setSelectedBatch] = useState<SettlementBatchItem | null>(null);
  const [disburseModalOpen, setDisburseModalOpen] = useState(false);
  const [utrInput, setUtrInput] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  const filteredSettlements = settlements.filter((s) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      s.batch_number.toLowerCase().includes(q) ||
      s.venue_name.toLowerCase().includes(q) ||
      s.owner_name.toLowerCase().includes(q) ||
      (s.utr_number && s.utr_number.toLowerCase().includes(q));

    const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalSettled = settlements
    .filter((s) => s.status === 'SETTLED')
    .reduce((acc, s) => acc + s.net_payable, 0);

  const pendingDisbursal = settlements
    .filter((s) => s.status !== 'SETTLED')
    .reduce((acc, s) => acc + s.net_payable, 0);

  const handleDisburseBatch = (batchId: string) => {
    const generatedUtr = utrInput.trim() || `IMPS${Math.floor(100000000000 + Math.random() * 900000000000)}`;
    setSettlements((prev) =>
      prev.map((s) =>
        s.id === batchId
          ? {
              ...s,
              status: 'SETTLED',
              utr_number: generatedUtr,
              settled_at: new Date().toLocaleString(),
            }
          : s
      )
    );
    setDisburseModalOpen(false);
    setSelectedBatch(null);
    setUtrInput('');
    setToast(`Batch successfully settled with UTR: ${generatedUtr}`);
    setTimeout(() => setToast(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E7EB] pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#F94001] bg-[#FFF1EC] px-3 py-1 rounded-full mb-2">
            <Landmark className="h-3.5 w-3.5" /> Partner Disbursal Console
          </div>
          <h1 className="text-2xl font-black tracking-tight text-[#021526] font-display">
            Settlement Management
          </h1>
          <p className="text-xs text-[#5F6368] mt-1">
            Automated T+2 payout cycles, TDS compliance, bank account transfers, and UTR transaction references.
          </p>
        </div>

        {toast && (
          <div className="p-3 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{toast}</span>
          </div>
        )}
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs">
          <span className="text-[11px] font-bold uppercase text-[#5F6368]">Total Disbursed (MTD)</span>
          <p className="text-2xl font-black text-emerald-600 font-display mt-1">
            ₹{totalSettled.toLocaleString()}
          </p>
          <span className="text-[10px] text-emerald-600 font-bold">Transferred via IMPS / NEFT</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs">
          <span className="text-[11px] font-bold uppercase text-[#5F6368]">Pending Approvals</span>
          <p className="text-2xl font-black text-[#F94001] font-display mt-1">
            ₹{pendingDisbursal.toLocaleString()}
          </p>
          <span className="text-[10px] text-slate-500 font-medium">Ready for immediate disbursal</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs">
          <span className="text-[11px] font-bold uppercase text-[#5F6368]">Settlement Batches</span>
          <p className="text-2xl font-black text-[#021526] font-display mt-1">{settlements.length}</p>
          <span className="text-[10px] text-slate-500 font-medium">Weekly & bi-weekly cycles</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs">
          <span className="text-[11px] font-bold uppercase text-[#5F6368]">TDS Withheld (1%)</span>
          <p className="text-2xl font-black text-[#021526] font-display mt-1">₹3,424</p>
          <span className="text-[10px] text-slate-500 font-medium">Sec 194O compliance</span>
        </div>
      </div>

      {/* FILTER & SEARCH */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-[#E5E7EB]">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-[#5F6368]" />
          <input
            type="text"
            placeholder="Search batch number, venue, UTR..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl bg-[#F8F9FA] border border-[#E5E7EB] pl-10 pr-4 py-2 text-xs text-[#021526] placeholder-[#5F6368] focus:border-[#F94001] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-3.5 w-3.5 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl bg-[#F8F9FA] border border-[#E5E7EB] px-3 py-2 text-xs text-[#021526] focus:border-[#F94001] focus:outline-none"
          >
            <option value="ALL">All Batch Statuses</option>
            <option value="PENDING_APPROVAL">Pending Approval</option>
            <option value="PROCESSING">Processing</option>
            <option value="SETTLED">Settled</option>
          </select>
        </div>
      </div>

      {/* SETTLEMENTS BATCH TABLE */}
      <div className="rounded-2xl bg-white border border-[#E5E7EB] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-[#F8F9FA] text-[#5F6368] font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Batch Number</th>
                <th className="py-3 px-4">Venue & Owner</th>
                <th className="py-3 px-4">Cycle Period</th>
                <th className="py-3 px-4">Gross Slots</th>
                <th className="py-3 px-4">Platform Fee</th>
                <th className="py-3 px-4">TDS (1%)</th>
                <th className="py-3 px-4">Net Payout</th>
                <th className="py-3 px-4">UTR Number</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {filteredSettlements.map((s) => (
                <tr key={s.id} className="hover:bg-[#F8F9FA] transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-[#021526]">
                    {s.batch_number}
                  </td>

                  <td className="py-3.5 px-4">
                    <p className="font-bold text-[#021526]">{s.venue_name}</p>
                    <p className="text-[10px] text-slate-500 font-mono">
                      {s.bank_name} • {s.account_number_masked}
                    </p>
                  </td>

                  <td className="py-3.5 px-4 text-[11px] text-slate-600">
                    <p>{s.period_start} to</p>
                    <p>{s.period_end}</p>
                  </td>

                  <td className="py-3.5 px-4 font-mono">
                    <p className="font-bold">₹{s.gross_booking_amount.toLocaleString()}</p>
                    <p className="text-[10px] text-slate-500">{s.bookings_count} slots</p>
                  </td>

                  <td className="py-3.5 px-4 font-mono text-slate-500">
                    - ₹{s.platform_commission_deducted.toLocaleString()}
                  </td>

                  <td className="py-3.5 px-4 font-mono text-slate-500">
                    - ₹{s.tds_deducted.toLocaleString()}
                  </td>

                  <td className="py-3.5 px-4 font-mono font-black text-sm text-emerald-600">
                    ₹{s.net_payable.toLocaleString()}
                  </td>

                  <td className="py-3.5 px-4 font-mono text-[10px] text-slate-600">
                    {s.utr_number || (
                      <span className="text-slate-400 italic">Pending Transfer</span>
                    )}
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        s.status === 'SETTLED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : s.status === 'PROCESSING'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {s.status.replace('_', ' ')}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    {s.status !== 'SETTLED' ? (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedBatch(s);
                          setDisburseModalOpen(true);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F94001] hover:bg-[#D93600] text-white font-bold text-xs transition-colors cursor-pointer"
                      >
                        <Send className="h-3.5 w-3.5" />
                        <span>Disburse</span>
                      </button>
                    ) : (
                      <span className="text-[10px] text-emerald-600 font-bold flex items-center justify-end gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Paid
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* DISBURSE CONFIRMATION MODAL */}
      {disburseModalOpen && selectedBatch && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Landmark className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#021526]">Authorize Partner Payout</h3>
                  <p className="text-xs text-slate-500 font-mono">{selectedBatch.batch_number}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDisburseModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">Beneficiary:</span>
                <span className="font-bold text-slate-800">{selectedBatch.owner_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Bank & IFSC:</span>
                <span className="font-bold text-slate-800">{selectedBatch.bank_name} ({selectedBatch.ifsc_code})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Account:</span>
                <span className="font-bold text-slate-800">{selectedBatch.account_number_masked}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200 text-emerald-600 font-black text-base">
                <span>Net Transfer Amount:</span>
                <span>₹{selectedBatch.net_payable.toLocaleString()}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                Bank UTR / Transaction Reference (Optional)
              </label>
              <input
                type="text"
                value={utrInput}
                onChange={(e) => setUtrInput(e.target.value)}
                placeholder="Leave blank to auto-generate IMPS reference"
                className="w-full bg-[#F8F9FA] border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-[#F94001]"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDisburseModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDisburseBatch(selectedBatch.id)}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Confirm Disbursal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
