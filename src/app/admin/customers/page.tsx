'use client';

import React, { useState } from 'react';
import {
  Users,
  Search,
  Eye,
  X,
  Phone,
  Mail,
  MapPin,
  CalendarCheck,
  CreditCard,
  Trophy,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Filter,
  Sparkles,
  Wallet,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';
import {
  INITIAL_CUSTOMERS,
  INITIAL_BOOKINGS,
  CustomerItem,
  BookingItem,
} from '@/lib/mockData';

export default function CustomerManagementPage() {
  const [customers, setCustomers] = useState<CustomerItem[]>(INITIAL_CUSTOMERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState('ALL');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerItem | null>(null);

  const filteredCustomers = customers.filter((c) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      c.name.toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.city.toLowerCase().includes(q);

    const matchesTier = tierFilter === 'ALL' || c.tier === tierFilter;

    return matchesSearch && matchesTier;
  });

  // Get all bookings for selected customer
  const customerBookings: BookingItem[] = selectedCustomer
    ? INITIAL_BOOKINGS.filter((b) => b.customer_id === selectedCustomer.id || b.customer_name === selectedCustomer.name)
    : [];

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E7EB] pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#F94001] bg-[#FFF1EC] px-3 py-1 rounded-full mb-2">
            <Users className="h-3.5 w-3.5" /> Player & Customer Directory
          </div>
          <h1 className="text-2xl font-black tracking-tight text-[#021526] font-display">
            Customer Management
          </h1>
          <p className="text-xs text-[#5F6368] mt-1">
            Track registered sports turf players, loyalty tiers, lifetime booking spend, and full reservation histories.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-2 rounded-xl bg-white border border-[#E5E7EB] shadow-xs flex items-center gap-2 text-xs font-bold text-slate-700">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{customers.length} Active Players</span>
          </div>
        </div>
      </div>

      {/* QUICK KPI CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs">
          <span className="text-[11px] font-bold uppercase text-[#5F6368]">Total Players</span>
          <p className="text-2xl font-black text-[#021526] font-display mt-1">{customers.length}</p>
          <span className="text-[10px] text-emerald-600 font-bold">100% Mobile Verified</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs">
          <span className="text-[11px] font-bold uppercase text-[#5F6368]">Total Player GMV</span>
          <p className="text-2xl font-black text-[#021526] font-display mt-1">
            ₹{customers.reduce((acc, c) => acc + c.total_spent, 0).toLocaleString()}
          </p>
          <span className="text-[10px] text-slate-500 font-medium">Across all partner venues</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs">
          <span className="text-[11px] font-bold uppercase text-[#5F6368]">Avg Lifetime Value</span>
          <p className="text-2xl font-black text-[#021526] font-display mt-1">₹25,466</p>
          <span className="text-[10px] text-emerald-600 font-bold">High turf loyalty</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs">
          <span className="text-[11px] font-bold uppercase text-[#5F6368]">Wallet Balance Held</span>
          <p className="text-2xl font-black text-[#F94001] font-display mt-1">₹5,250</p>
          <span className="text-[10px] text-slate-500 font-medium">Player wallet credits</span>
        </div>
      </div>

      {/* SEARCH AND FILTER BAR */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-[#E5E7EB]">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-[#5F6368]" />
          <input
            type="text"
            placeholder="Search customer name, phone, city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl bg-[#F8F9FA] border border-[#E5E7EB] pl-10 pr-4 py-2 text-xs text-[#021526] placeholder-[#5F6368] focus:border-[#F94001] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-3.5 w-3.5 text-slate-400" />
          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="rounded-xl bg-[#F8F9FA] border border-[#E5E7EB] px-3 py-2 text-xs text-[#021526] focus:border-[#F94001] focus:outline-none"
          >
            <option value="ALL">All Loyalty Tiers</option>
            <option value="PLATINUM">Platinum Tier</option>
            <option value="GOLD">Gold Tier</option>
            <option value="SILVER">Silver Tier</option>
            <option value="REGULAR">Regular Tier</option>
          </select>
        </div>
      </div>

      {/* CUSTOMER TABLE */}
      <div className="rounded-2xl bg-white border border-[#E5E7EB] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-[#F8F9FA] text-[#5F6368] font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Player Details</th>
                <th className="py-3 px-4">City</th>
                <th className="py-3 px-4">Loyalty Tier</th>
                <th className="py-3 px-4">Total Bookings</th>
                <th className="py-3 px-4">Lifetime Spend</th>
                <th className="py-3 px-4">Wallet Balance</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {filteredCustomers.map((cust) => (
                <tr key={cust.id} className="hover:bg-[#F8F9FA] transition-colors">
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-[#021526]">{cust.name}</p>
                    <p className="text-[11px] text-[#5F6368] font-mono mt-0.5">
                      {cust.phone} • {cust.email}
                    </p>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-slate-700">{cust.city}</span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-black tracking-wider ${
                        cust.tier === 'PLATINUM'
                          ? 'bg-purple-100 text-purple-800 border border-purple-200'
                          : cust.tier === 'GOLD'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : cust.tier === 'SILVER'
                          ? 'bg-slate-100 text-slate-700 border border-slate-200'
                          : 'bg-emerald-50 text-emerald-700'
                      }`}
                    >
                      {cust.tier}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-mono font-bold text-sm text-[#021526]">
                      {cust.total_bookings} slots
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-mono font-black text-sm text-emerald-600">
                      ₹{cust.total_spent.toLocaleString()}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-mono font-bold text-sm text-[#F94001]">
                      ₹{cust.wallet_balance}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedCustomer(cust)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#021526] hover:bg-[#F94001] text-white font-bold text-xs transition-colors cursor-pointer"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>View All Bookings</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CUSTOMER 360 & ALL BOOKINGS MODAL */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 bg-[#021526] text-white flex items-center justify-between border-b border-[#06243f]">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-[#F94001] to-[#D93600] text-white flex items-center justify-center font-black">
                  {selectedCustomer.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-black font-display text-white">
                      {selectedCustomer.name}
                    </h2>
                    <span className="px-2 py-0.2 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold">
                      {selectedCustomer.tier} MEMBER
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    ID: {selectedCustomer.id} • {selectedCustomer.phone} • {selectedCustomer.city}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Quick Profile Summary Bar */}
            <div className="p-5 bg-[#F8F9FA] border-b border-[#E5E7EB] grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold">Total Reservations</span>
                <p className="text-lg font-black text-[#021526] font-mono mt-0.5">{selectedCustomer.total_bookings} slots</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold">Lifetime Turf Spend</span>
                <p className="text-lg font-black text-emerald-600 font-mono mt-0.5">₹{selectedCustomer.total_spent.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold">Wallet Credit</span>
                <p className="text-lg font-black text-[#F94001] font-mono mt-0.5">₹{selectedCustomer.wallet_balance}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold">Preferred Sports</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedCustomer.preferred_sports.map((s, idx) => (
                    <span key={idx} className="px-1.5 py-0.2 rounded bg-white border border-slate-200 font-bold text-[10px]">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* ALL BOOKINGS TABLE FOR THIS CUSTOMER */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#021526] flex items-center gap-2">
                  <CalendarCheck className="h-4 w-4 text-[#F94001]" />
                  All Turf Bookings History ({customerBookings.length})
                </h3>
                <span className="text-[11px] text-slate-500">
                  Full reservation lifecycle & payment records
                </span>
              </div>

              {customerBookings.length === 0 ? (
                <div className="p-8 text-center bg-[#F8F9FA] rounded-2xl border border-dashed border-[#CBD5E1] text-xs text-slate-500">
                  No bookings found for this player.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-[#E5E7EB]">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F8F9FA] text-[#5F6368] font-bold uppercase">
                      <tr>
                        <th className="py-2.5 px-3">Booking ID</th>
                        <th className="py-2.5 px-3">Venue & Pitch</th>
                        <th className="py-2.5 px-3">Date & Slot</th>
                        <th className="py-2.5 px-3">Paid Amount</th>
                        <th className="py-2.5 px-3">Payment</th>
                        <th className="py-2.5 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E7EB]">
                      {customerBookings.map((b) => (
                        <tr key={b.id} className="hover:bg-[#F8F9FA]">
                          <td className="py-2.5 px-3 font-mono font-bold text-[#F94001]">
                            {b.booking_code}
                          </td>
                          <td className="py-2.5 px-3">
                            <p className="font-bold text-[#021526]">{b.venue_name}</p>
                            <p className="text-[10px] text-slate-500">{b.court_name}</p>
                          </td>
                          <td className="py-2.5 px-3">
                            <p className="font-semibold">{b.booking_date}</p>
                            <p className="text-[10px] text-slate-500 font-mono">{b.time_slot}</p>
                          </td>
                          <td className="py-2.5 px-3 font-mono font-bold">
                            ₹{b.total_amount}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="font-mono text-[10px] font-semibold text-slate-700">
                              {b.payment_method}
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                b.booking_status === 'COMPLETED'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : b.booking_status === 'IN_PLAY'
                                  ? 'bg-blue-100 text-blue-800 animate-pulse'
                                  : b.booking_status === 'CONFIRMED'
                                  ? 'bg-indigo-100 text-indigo-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {b.booking_status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-[#F8F9FA] border-t border-[#E5E7EB] flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                Registered on {selectedCustomer.registered_at}
              </span>
              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-white font-bold text-xs hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Close Customer 360
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
