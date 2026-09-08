'use client';

import React, { useState } from 'react';
import {
  CreditCard,
  Search,
  Filter,
  Eye,
  X,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowDownLeft,
  ArrowUpRight,
  DollarSign,
  Download,
  Building2,
  FileText,
  ShieldCheck,
} from 'lucide-react';
import { INITIAL_PAYMENTS, PaymentTransactionItem } from '@/lib/mockData';

export default function PaymentManagementPage() {
  const [payments, setPayments] = useState<PaymentTransactionItem[]>(INITIAL_PAYMENTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [gatewayFilter, setGatewayFilter] = useState('ALL');
  const [selectedTxn, setSelectedTxn] = useState<PaymentTransactionItem | null>(null);

  const filteredPayments = payments.filter((p) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      p.txn_id.toLowerCase().includes(q) ||
      p.gateway_payment_id.toLowerCase().includes(q) ||
      p.booking_code.toLowerCase().includes(q) ||
      p.customer_name.toLowerCase().includes(q) ||
      p.venue_name.toLowerCase().includes(q);

    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    const matchesGateway = gatewayFilter === 'ALL' || p.gateway === gatewayFilter;

    return matchesSearch && matchesStatus && matchesGateway;
  });

  const totalGross = payments.reduce((acc, p) => (p.status === 'SUCCESS' ? acc + p.gross_amount : acc), 0);
  const totalCommission = payments.reduce((acc, p) => (p.status === 'SUCCESS' ? acc + p.platform_commission : acc), 0);
  const totalRefunded = payments.reduce((acc, p) => (p.status === 'REFUNDED' ? acc + p.gross_amount : acc), 0);

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E7EB] pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#F94001] bg-[#FFF1EC] px-3 py-1 rounded-full mb-2">
            <CreditCard className="h-3.5 w-3.5" /> Gateway & Transaction Ledger
          </div>
          <h1 className="text-2xl font-black tracking-tight text-[#021526] font-display">
            Payment Management
          </h1>
          <p className="text-xs text-[#5F6368] mt-1">
            Real-time customer payment gateway transactions, commission splits, platform fee revenues, and refund logs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl bg-white border border-[#CBD5E1] text-[#021526] hover:bg-slate-50 px-3.5 py-2 text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <Download className="h-3.5 w-3.5 text-slate-500" />
            <span>Export CSV Ledger</span>
          </button>
        </div>
      </div>

      {/* FINANCIAL OVERVIEW CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs">
          <span className="text-[11px] font-bold uppercase text-[#5F6368]">Total Volume Collected</span>
          <p className="text-2xl font-black text-[#021526] font-display mt-1">₹{totalGross.toLocaleString()}</p>
          <span className="text-[10px] text-emerald-600 font-bold">Processed via UPI / Cards</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs">
          <span className="text-[11px] font-bold uppercase text-[#5F6368]">Platform Commission (10%)</span>
          <p className="text-2xl font-black text-emerald-600 font-display mt-1">₹{totalCommission.toLocaleString()}</p>
          <span className="text-[10px] text-emerald-600 font-bold">iBookSports Net Revenue</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs">
          <span className="text-[11px] font-bold uppercase text-[#5F6368]">Net Venue Disbursable</span>
          <p className="text-2xl font-black text-[#021526] font-display mt-1">
            ₹{(totalGross - totalCommission).toLocaleString()}
          </p>
          <span className="text-[10px] text-slate-500 font-medium">Payable to partner arenas</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs">
          <span className="text-[11px] font-bold uppercase text-[#5F6368]">Total Refunded</span>
          <p className="text-2xl font-black text-rose-600 font-display mt-1">₹{totalRefunded.toLocaleString()}</p>
          <span className="text-[10px] text-rose-500 font-medium">Weather / player cancellations</span>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-[#E5E7EB]">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-[#5F6368]" />
          <input
            type="text"
            placeholder="Search txn ID, gateway ref, booking..."
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
            <option value="ALL">All Payment Statuses</option>
            <option value="SUCCESS">Success</option>
            <option value="REFUNDED">Refunded</option>
            <option value="FAILED">Failed</option>
          </select>

          <select
            value={gatewayFilter}
            onChange={(e) => setGatewayFilter(e.target.value)}
            className="rounded-xl bg-[#F8F9FA] border border-[#E5E7EB] px-3 py-2 text-xs text-[#021526] focus:border-[#F94001] focus:outline-none"
          >
            <option value="ALL">All Gateways</option>
            <option value="RAZORPAY">Razorpay</option>
            <option value="PHONEPE">PhonePe</option>
            <option value="CASHFREE">Cashfree</option>
          </select>
        </div>
      </div>

      {/* TRANSACTIONS TABLE */}
      <div className="rounded-2xl bg-white border border-[#E5E7EB] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-[#F8F9FA] text-[#5F6368] font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Transaction / Gateway ID</th>
                <th className="py-3 px-4">Booking Ref</th>
                <th className="py-3 px-4">Player Details</th>
                <th className="py-3 px-4">Venue</th>
                <th className="py-3 px-4">Gross Paid</th>
                <th className="py-3 px-4">Platform Fee</th>
                <th className="py-3 px-4">Net Venue Share</th>
                <th className="py-3 px-4">Method & Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {filteredPayments.map((p) => (
                <tr key={p.id} className="hover:bg-[#F8F9FA] transition-colors">
                  <td className="py-3.5 px-4 font-mono">
                    <p className="font-bold text-[#021526]">{p.txn_id}</p>
                    <p className="text-[10px] text-[#5F6368]">{p.gateway_payment_id}</p>
                  </td>

                  <td className="py-3.5 px-4 font-mono font-bold text-[#F94001]">
                    {p.booking_code}
                  </td>

                  <td className="py-3.5 px-4">
                    <p className="font-bold text-[#021526]">{p.customer_name}</p>
                    <p className="text-[10px] text-slate-500 font-mono">{p.customer_phone}</p>
                  </td>

                  <td className="py-3.5 px-4 max-w-xs truncate">
                    <span className="font-semibold text-[#021526]">{p.venue_name}</span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-mono font-black text-sm text-[#021526]">
                      ₹{p.gross_amount}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-mono text-emerald-600 font-bold">
                    ₹{p.platform_commission}
                  </td>

                  <td className="py-3.5 px-4 font-mono font-semibold">
                    ₹{p.net_venue_payout}
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-mono text-[10px] font-bold text-slate-700 block">
                      {p.payment_method}
                    </span>
                    <span
                      className={`inline-block mt-0.5 px-2 py-0.2 rounded text-[9px] font-bold ${
                        p.status === 'SUCCESS'
                          ? 'bg-emerald-100 text-emerald-800'
                          : p.status === 'REFUNDED'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedTxn(p)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-[#021526] hover:text-white font-bold text-xs transition-colors cursor-pointer"
                    >
                      <Eye className="h-3 w-3" />
                      <span>Audit</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* TRANSACTION AUDIT MODAL */}
      {selectedTxn && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 bg-[#021526] text-white flex items-center justify-between border-b border-[#06243f]">
              <div>
                <h3 className="font-black text-base font-display">Transaction Audit</h3>
                <p className="text-xs text-slate-400 font-mono">{selectedTxn.txn_id}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTxn(null)}
                className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs text-[#021526]">
              <div className="p-4 rounded-2xl bg-[#F8F9FA] border border-[#E5E7EB] space-y-2 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500">Gross Amount</span>
                  <span className="font-bold text-sm">₹{selectedTxn.gross_amount}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Gateway MDR Fee (2%)</span>
                  <span>- ₹{selectedTxn.gateway_fee}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>GST on Fee (18%)</span>
                  <span>- ₹{selectedTxn.tax_gst}</span>
                </div>
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Platform Commission (10%)</span>
                  <span>+ ₹{selectedTxn.platform_commission}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200 text-slate-900 font-black text-sm">
                  <span>Net Disbursable to Venue</span>
                  <span>₹{selectedTxn.net_venue_payout}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Gateway Order ID</span>
                  <span className="font-mono font-semibold">{selectedTxn.gateway_order_id}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Gateway Payment Ref</span>
                  <span className="font-mono font-semibold">{selectedTxn.gateway_payment_id}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Timestamp</span>
                  <span className="font-mono">{selectedTxn.timestamp}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Payment Channel</span>
                  <span className="font-semibold">{selectedTxn.gateway} ({selectedTxn.payment_method})</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-[#F8F9FA] border-t border-[#E5E7EB] flex items-center justify-end">
              <button
                type="button"
                onClick={() => setSelectedTxn(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-white font-bold text-xs hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Close Audit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
