'use client';

import React, { useState, useMemo } from 'react';
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
  CheckCircle2,
  Filter,
  Wallet,
  ArrowUpDown,
  Copy,
  Check,
  ExternalLink,
  DollarSign,
  AlertCircle,
  RefreshCw,
  Clock,
  Layers,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Ban,
} from 'lucide-react';
import {
  INITIAL_CUSTOMERS,
  INITIAL_BOOKINGS,
  INITIAL_PAYMENTS,
  CustomerItem,
  BookingItem,
  PaymentTransactionItem,
} from '@/lib/mockData';

type SlideBarTab = 'bookings' | 'payments' | 'cancellations';

export default function CustomerManagementPage() {
  const [customers, setCustomers] = useState<CustomerItem[]>(INITIAL_CUSTOMERS);
  const [allBookings, setAllBookings] = useState<BookingItem[]>(INITIAL_BOOKINGS);
  const [allPayments, setAllPayments] = useState<PaymentTransactionItem[]>(INITIAL_PAYMENTS);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState('ALL');
  const [tierFilter, setTierFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState<'spend' | 'bookings' | 'recent' | 'name' | 'id'>('spend');

  // Slide Bar (Drawer) State
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerItem | null>(null);
  const [activeTab, setActiveTab] = useState<SlideBarTab>('bookings');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Copy helper
  const handleCopy = (text: string, id: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  // Helper for customer ID formatting
  const formatCustomerId = (id: string) => {
    if (id.startsWith('cust_')) {
      return `CUST-${id.replace('cust_', '')}`;
    }
    return id.toUpperCase();
  };

  // Extract unique states with customer counts
  const stateCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    customers.forEach((c) => {
      const st = c.state || 'Other';
      counts[st] = (counts[st] || 0) + 1;
    });
    return counts;
  }, [customers]);

  const uniqueStates = useMemo(() => {
    return Object.keys(stateCounts).sort();
  }, [stateCounts]);

  // Filtered and Sorted Customers
  const filteredCustomers = useMemo(() => {
    return customers
      .filter((c) => {
        const q = searchQuery.toLowerCase().trim();
        const formattedId = formatCustomerId(c.id).toLowerCase();

        const matchesSearch =
          !q ||
          c.name.toLowerCase().includes(q) ||
          c.phone.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.city.toLowerCase().includes(q) ||
          (c.district && c.district.toLowerCase().includes(q)) ||
          (c.state && c.state.toLowerCase().includes(q)) ||
          formattedId.includes(q) ||
          c.id.toLowerCase().includes(q) ||
          (c.recent_booking && c.recent_booking.booking_code.toLowerCase().includes(q));

        const matchesState = selectedState === 'ALL' || (c.state && c.state.toLowerCase() === selectedState.toLowerCase());
        const matchesTier = tierFilter === 'ALL' || c.tier === tierFilter;

        return matchesSearch && matchesState && matchesTier;
      })
      .sort((a, b) => {
        if (sortBy === 'spend') return b.total_spent - a.total_spent;
        if (sortBy === 'bookings') return b.total_bookings - a.total_bookings;
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'id') return a.id.localeCompare(b.id);
        if (sortBy === 'recent') {
          const dateA = a.recent_booking ? new Date(a.recent_booking.booking_date).getTime() : 0;
          const dateB = b.recent_booking ? new Date(b.recent_booking.booking_date).getTime() : 0;
          return dateB - dateA;
        }
        return 0;
      });
  }, [customers, searchQuery, selectedState, tierFilter, sortBy]);

  // Overall KPIs
  const totalPlayers = customers.length;
  const totalPlayerGMV = customers.reduce((acc, c) => acc + c.total_spent, 0);
  const totalReservations = customers.reduce((acc, c) => acc + c.total_bookings, 0);
  const totalWalletCredits = customers.reduce((acc, c) => acc + c.wallet_balance, 0);
  const totalCancellations = customers.reduce((acc, c) => acc + c.cancellation_count, 0);

  // Customer specific items for Slide Bar
  const customerBookings = useMemo(() => {
    if (!selectedCustomer) return [];
    return allBookings.filter(
      (b) => b.customer_id === selectedCustomer.id || b.customer_name.toLowerCase() === selectedCustomer.name.toLowerCase()
    );
  }, [selectedCustomer, allBookings]);

  const customerPayments = useMemo(() => {
    if (!selectedCustomer) return [];
    return allPayments.filter(
      (p) => p.customer_name.toLowerCase() === selectedCustomer.name.toLowerCase() || p.customer_phone === selectedCustomer.phone
    );
  }, [selectedCustomer, allPayments]);

  const customerCancelledBookings = useMemo(() => {
    return customerBookings.filter((b) => b.booking_status === 'CANCELLED' || b.payment_status === 'REFUNDED');
  }, [customerBookings]);

  // Cancel & Refund Action Handler inside Slide Bar
  const handleCancelAndRefundBooking = (bookingId: string) => {
    const targetBooking = allBookings.find((b) => b.id === bookingId);
    if (!targetBooking || !selectedCustomer) return;

    const refundAmount = targetBooking.total_amount;

    // 1. Update Bookings state
    setAllBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? {
              ...b,
              booking_status: 'CANCELLED' as const,
              payment_status: 'REFUNDED' as const,
              cancellation_reason: 'Admin requested instant cancellation & refund',
              cancelled_at: new Date().toISOString().replace('T', ' ').slice(0, 19),
              refund_amount: refundAmount,
              refund_status: 'WALLET_CREDITED' as const,
              refund_utr: `WLT-REF-${Date.now().toString().slice(-6)}`,
            }
          : b
      )
    );

    // 2. Update Customer record (increment cancellation, credit wallet)
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === selectedCustomer.id
          ? {
              ...c,
              wallet_balance: c.wallet_balance + refundAmount,
              cancellation_count: c.cancellation_count + 1,
            }
          : c
      )
    );

    // Update selectedCustomer copy in state
    setSelectedCustomer((prev) =>
      prev
        ? {
            ...prev,
            wallet_balance: prev.wallet_balance + refundAmount,
            cancellation_count: prev.cancellation_count + 1,
          }
        : null
    );

    setActionSuccessMsg(`Booking ${targetBooking.booking_code} cancelled. ₹${refundAmount} credited to customer's wallet!`);
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  // State regional badge style
  const getStateBadgeStyle = (state?: string) => {
    switch (state) {
      case 'Tamil Nadu':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Karnataka':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Kerala':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Telangana':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Maharashtra':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Delhi NCR':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="animate-in fade-in duration-300 space-y-6">
      {/* 1. PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E5E7EB] pb-5">
        <div>
          <div className="inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-wider text-[#F94001] bg-[#FFF1EC] border border-[#F94001]/20 px-3 py-1 rounded-full mb-2">
            <Users className="h-3.5 w-3.5 text-[#F94001]" />
            <span>Player & Customer Directory &bull; Multi-State Network</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#021526] font-display">
            Customer Management
          </h1>
          <p className="text-xs sm:text-sm text-[#5F6368] mt-1 font-medium">
            Registered customer IDs, contact information, state and district directories, total booking pay, and real-time reservation slide-over inspections.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 rounded-xl bg-white border border-[#E5E7EB] shadow-xs flex items-center gap-2 text-xs font-bold text-slate-700">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{customers.length} Verified Players</span>
          </div>
        </div>
      </div>

      {/* 2. OPERATIONAL KPI METRICS ROW */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Total Players */}
        <div className="bg-white rounded-2xl p-4 border border-[#E5E7EB] shadow-xs hover:border-[#F94001]/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#5F6368] uppercase tracking-wider">Total Players</span>
            <div className="h-8 w-8 rounded-xl bg-[#FFF1EC] text-[#F94001] flex items-center justify-center">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#021526] font-mono">{totalPlayers}</span>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              {uniqueStates.length} States
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1 font-medium">100% phone verified players</p>
        </div>

        {/* Total Player GMV (Spend) */}
        <div className="bg-white rounded-2xl p-4 border border-[#E5E7EB] shadow-xs hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#5F6368] uppercase tracking-wider">Total Player Spend</span>
            <div className="h-8 w-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-emerald-700 font-mono">₹{totalPlayerGMV.toLocaleString('en-IN')}</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1 font-medium">Gross player booking payments</p>
        </div>

        {/* Total Reservations */}
        <div className="bg-white rounded-2xl p-4 border border-[#E5E7EB] shadow-xs hover:border-blue-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#5F6368] uppercase tracking-wider">Total Bookings</span>
            <div className="h-8 w-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <CalendarCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-[#021526] font-mono">{totalReservations}</span>
            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
              Slots Reserved
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1 font-medium">Turf and pitch court bookings</p>
        </div>

        {/* Wallet Balance Held */}
        <div className="bg-white rounded-2xl p-4 border border-[#E5E7EB] shadow-xs hover:border-purple-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#5F6368] uppercase tracking-wider">Wallet Credits</span>
            <div className="h-8 w-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Wallet className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-purple-700 font-mono">₹{totalWalletCredits.toLocaleString('en-IN')}</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1 font-medium">Held player wallet balances</p>
        </div>

        {/* Cancellations & Refunds */}
        <div className="bg-white rounded-2xl p-4 border border-[#E5E7EB] shadow-xs hover:border-rose-300 transition-all col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#5F6368] uppercase tracking-wider">Cancellations</span>
            <div className="h-8 w-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Ban className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-rose-700 font-mono">{totalCancellations}</span>
            <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full">
              Refunds Logged
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1 font-medium">Handled via UPI & wallet refund</p>
        </div>
      </div>

      {/* 3. MULTI-STATE FINDER TABS */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-3 shadow-xs space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-[#F94001]" />
            <span className="text-xs font-black uppercase tracking-wider text-[#021526]">
              Filter by State:
            </span>
          </div>
          <span className="text-[11px] font-semibold text-slate-500">
            {selectedState === 'ALL' ? `All ${uniqueStates.length} states` : `Active State: ${selectedState}`}
          </span>
        </div>

        {/* State Pills Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          <button
            type="button"
            onClick={() => setSelectedState('ALL')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              selectedState === 'ALL'
                ? 'bg-[#021526] text-white shadow-sm'
                : 'bg-[#F8F9FA] text-[#5F6368] hover:bg-slate-200 border border-[#E5E7EB]'
            }`}
          >
            <span>All States</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
              selectedState === 'ALL' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {customers.length}
            </span>
          </button>

          {uniqueStates.map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setSelectedState(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                selectedState === st
                  ? 'bg-[#F94001] text-white shadow-sm shadow-[#F94001]/30'
                  : 'bg-[#F8F9FA] text-[#5F6368] hover:bg-slate-200 border border-[#E5E7EB]'
              }`}
            >
              <span>{st}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                selectedState === st ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {stateCounts[st]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 4. SEARCH, TIER AND SORT CONTROLS */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-[#E5E7EB] shadow-xs">
        {/* Live Search Input */}
        <div className="relative flex-1 min-w-[280px]">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-[#5F6368]" />
          <input
            type="text"
            placeholder="Search customer ID, name, phone, email, district, state, booking code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl bg-slate-50 border border-[#E5E7EB] pl-10 pr-9 py-2 text-xs text-[#021526] placeholder-[#5F6368] focus:bg-white focus:border-[#F94001] focus:ring-2 focus:ring-[#F94001]/10 transition-all outline-none font-medium"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Dropdown Filters & Sorters */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
          {/* Tier Selector */}
          <div className="relative min-w-[140px] flex-1 sm:flex-none">
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="w-full appearance-none pl-8 pr-8 py-2 rounded-xl border border-[#E5E7EB] bg-slate-50 text-xs font-bold text-[#021526] focus:outline-none focus:border-[#F94001] focus:ring-1 focus:ring-[#F94001] transition-colors cursor-pointer"
            >
              <option value="ALL">All Loyalty Tiers</option>
              <option value="PLATINUM">Platinum Tier</option>
              <option value="GOLD">Gold Tier</option>
              <option value="SILVER">Silver Tier</option>
              <option value="REGULAR">Regular Tier</option>
            </select>
            <Trophy className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-amber-500 pointer-events-none" />
          </div>

          {/* Sort Selector */}
          <div className="relative min-w-[170px] flex-1 sm:flex-none">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full appearance-none pl-8 pr-8 py-2 rounded-xl border border-[#E5E7EB] bg-slate-50 text-xs font-bold text-[#021526] focus:outline-none focus:border-[#F94001] focus:ring-1 focus:ring-[#F94001] transition-colors cursor-pointer"
            >
              <option value="spend">Sort: Highest Total Pay</option>
              <option value="bookings">Sort: Most Bookings</option>
              <option value="recent">Sort: Most Recent Booking</option>
              <option value="name">Sort: Player Name (A-Z)</option>
              <option value="id">Sort: Customer ID</option>
            </select>
            <ArrowUpDown className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-slate-500 pointer-events-none" />
          </div>

          {/* Reset Filters */}
          {(searchQuery || selectedState !== 'ALL' || tierFilter !== 'ALL') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedState('ALL');
                setTierFilter('ALL');
              }}
              className="px-3 py-2 rounded-xl border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 shrink-0"
              title="Reset all filters"
            >
              <X className="h-3.5 w-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* 5. PERFECT MINIMAL CUSTOMER DATA TABLE */}
      <div className="rounded-xl bg-white border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200/90 bg-slate-50/75 text-slate-500 font-semibold tracking-wider text-[11px] uppercase select-none">
                <th className="py-2.5 px-4 w-[110px]">Customer ID</th>
                <th className="py-2.5 px-4 min-w-[200px]">Player Details</th>
                <th className="py-2.5 px-4 min-w-[170px]">District & State</th>
                <th className="py-2.5 px-4 min-w-[130px]">Total Bookings</th>
                <th className="py-2.5 px-4 min-w-[130px]">Total Pay</th>
                <th className="py-2.5 px-4 min-w-[220px]">Recent Booking</th>
                <th className="py-2.5 px-4 text-center w-[100px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <p className="font-semibold text-xs text-slate-700">No matching players found</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Try adjusting your search query or state filter</p>
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => {
                  const displayId = formatCustomerId(cust.id);
                  const isCopied = copiedId === cust.id;
                  const recent = cust.recent_booking;

                  return (
                    <tr key={cust.id} className="hover:bg-slate-50/70 transition-colors group">
                      {/* 1. CUSTOMER ID */}
                      <td className="py-3 px-4 align-middle whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="inline-flex items-center gap-1.5">
                            <span className="font-mono text-[11px] font-bold text-slate-800 bg-slate-100/90 px-1.5 py-0.5 rounded border border-slate-200/80">
                              {displayId}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopy(displayId, cust.id)}
                              className="text-slate-400 hover:text-slate-700 transition-colors p-0.5"
                              title="Copy ID"
                            >
                              {isCopied ? <Check className="h-2.5 w-2.5 text-emerald-600" /> : <Copy className="h-2.5 w-2.5" />}
                            </button>
                          </div>
                          <div>
                            <span
                              className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider ${
                                cust.tier === 'PLATINUM'
                                  ? 'bg-purple-50 text-purple-700 border border-purple-200/60'
                                  : cust.tier === 'GOLD'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                                  : cust.tier === 'SILVER'
                                  ? 'bg-slate-100 text-slate-600 border border-slate-200/60'
                                  : 'bg-emerald-50 text-emerald-700'
                              }`}
                            >
                              {cust.tier}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* 2. CUSTOMER NAME & CONTACT */}
                      <td className="py-3 px-4 align-middle">
                        <div className="space-y-0.5">
                          <p className="font-bold text-slate-900 text-xs tracking-tight group-hover:text-[#F94001] transition-colors">
                            {cust.name}
                          </p>
                          <p className="font-mono text-[11px] text-slate-500">
                            <a href={`tel:${cust.phone.replace(/\s+/g, '')}`} className="hover:text-[#F94001] transition-colors flex items-center gap-1">
                              <Phone className="h-2.5 w-2.5 text-emerald-600 shrink-0" />
                              {cust.phone}
                            </a>
                          </p>
                        </div>
                      </td>

                      {/* 3. STATE & DISTRICT */}
                      <td className="py-3 px-4 align-middle">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1 text-slate-800 font-semibold text-xs">
                            <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                            <span>{cust.district || cust.city}</span>
                          </div>
                          <span className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-semibold border ${getStateBadgeStyle(cust.state)}`}>
                            {cust.state || 'Tamil Nadu'}
                          </span>
                        </div>
                      </td>

                      {/* 4. TOTAL BOOKINGS */}
                      <td className="py-3 px-4 align-middle">
                        <div className="space-y-0.5">
                          <span className="font-mono font-bold text-xs text-slate-900">
                            {cust.total_bookings} slots
                          </span>
                          {cust.cancellation_count > 0 && (
                            <p className="text-[10px] text-rose-600 font-medium">
                              {cust.cancellation_count} cancelled
                            </p>
                          )}
                        </div>
                      </td>

                      {/* 5. TOTAL PAY (LIFETIME SPEND) */}
                      <td className="py-3 px-4 align-middle">
                        <div className="space-y-0.5">
                          <p className="font-mono font-bold text-xs text-emerald-700">
                            ₹{cust.total_spent.toLocaleString('en-IN')}
                          </p>
                          {cust.wallet_balance > 0 && (
                            <p className="text-[10px] font-mono text-slate-400">
                              +₹{cust.wallet_balance} wallet
                            </p>
                          )}
                        </div>
                      </td>

                      {/* 6. RECENT BOOKING */}
                      <td className="py-3 px-4 align-middle">
                        {recent ? (
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-bold text-[11px] text-[#F94001]">
                                {recent.booking_code}
                              </span>
                              <span
                                className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                                  recent.booking_status === 'COMPLETED'
                                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/60'
                                    : recent.booking_status === 'IN_PLAY'
                                    ? 'bg-blue-50 text-blue-800 border border-blue-200/60 animate-pulse'
                                    : recent.booking_status === 'CONFIRMED'
                                    ? 'bg-indigo-50 text-indigo-800 border border-indigo-200/60'
                                    : 'bg-rose-50 text-rose-800 border border-rose-200/60'
                                }`}
                              >
                                {recent.booking_status}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600 truncate max-w-[200px]">
                              {recent.venue_name} &bull; {recent.booking_date}
                            </p>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">No bookings logged</span>
                        )}
                      </td>

                      {/* 7. ACTIONS (SLIDE BAR TRIGGER) */}
                      <td className="py-3 px-4 align-middle text-center">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCustomer(cust);
                            setActiveTab('bookings');
                          }}
                          className="h-7 px-2.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:text-[#F94001] hover:border-[#F94001]/30 hover:bg-[#FFF1EC] text-xs font-semibold inline-flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                          title="Open Slide Bar"
                        >
                          <Eye className="h-3 w-3" />
                          <span>Inspect</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. SLIDE BAR (SLIDE-OVER DRAWER FROM RIGHT) */}
      {/* When action clicked: shows passed booking, payment, cancellation & refund with booking numbers and action triggers */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-white shadow-2xl h-full flex flex-col overflow-hidden animate-in slide-in-from-right duration-300 border-l border-[#E5E7EB]">
            {/* Slide Bar Header Card */}
            <div className="p-5 bg-gradient-to-r from-slate-900 via-[#021526] to-slate-900 text-white flex items-start justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3.5">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#F94001] to-[#E03800] text-white flex items-center justify-center font-black text-lg shadow-lg shrink-0">
                  {selectedCustomer.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg font-black font-display text-white">
                      {selectedCustomer.name}
                    </h2>
                    <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold">
                      {selectedCustomer.tier} MEMBER
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      Active
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-300 mt-1 flex-wrap font-mono">
                    <div className="flex items-center gap-1">
                      <span className="bg-white/10 px-2 py-0.5 rounded text-[11px] font-bold">
                        {formatCustomerId(selectedCustomer.id)}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(formatCustomerId(selectedCustomer.id), selectedCustomer.id)}
                        className="text-slate-400 hover:text-white"
                        title="Copy Customer ID"
                      >
                        {copiedId === selectedCustomer.id ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                      </button>
                    </div>
                    <span>&bull;</span>
                    <a href={`tel:${selectedCustomer.phone}`} className="hover:text-[#F94001] flex items-center gap-1">
                      <Phone className="h-3 w-3 text-emerald-400" />
                      {selectedCustomer.phone}
                    </a>
                  </div>

                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-slate-400" />
                    <span>{selectedCustomer.district || selectedCustomer.city}, {selectedCustomer.state || 'Tamil Nadu'}</span>
                  </p>
                </div>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="h-8 w-8 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
                title="Close Slide Bar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Notification alert banner if action performed */}
            {actionSuccessMsg && (
              <div className="bg-emerald-50 border-b border-emerald-200 px-5 py-2.5 text-xs font-bold text-emerald-800 flex items-center justify-between animate-in fade-in">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>{actionSuccessMsg}</span>
                </div>
                <button type="button" onClick={() => setActionSuccessMsg(null)}>
                  <X className="h-3.5 w-3.5 text-emerald-600" />
                </button>
              </div>
            )}

            {/* Quick Profile Metric Pills */}
            <div className="p-4 bg-[#F8F9FA] border-b border-[#E5E7EB] grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs shrink-0">
              <div className="p-2.5 rounded-xl bg-white border border-[#E5E7EB]">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Total Pay (Spend)</span>
                <p className="text-base font-black text-emerald-600 font-mono mt-0.5">
                  ₹{selectedCustomer.total_spent.toLocaleString('en-IN')}
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-[#E5E7EB]">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Total Bookings</span>
                <p className="text-base font-black text-[#021526] font-mono mt-0.5">
                  {selectedCustomer.total_bookings} slots
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-[#E5E7EB]">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Wallet Balance</span>
                <p className="text-base font-black text-[#F94001] font-mono mt-0.5">
                  ₹{selectedCustomer.wallet_balance}
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-[#E5E7EB]">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Cancellations</span>
                <p className="text-base font-black text-rose-600 font-mono mt-0.5">
                  {selectedCustomer.cancellation_count} cancelled
                </p>
              </div>
            </div>

            {/* SLIDE BAR NAVIGATION TABS */}
            <div className="px-5 border-b border-[#E5E7EB] bg-white flex items-center gap-4 sm:gap-6 overflow-x-auto no-scrollbar shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab('bookings')}
                className={`py-3 text-xs font-black border-b-2 whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'bookings'
                    ? 'border-[#F94001] text-[#F94001]'
                    : 'border-transparent text-[#5F6368] hover:text-[#021526]'
                }`}
              >
                <CalendarCheck className="h-4 w-4" />
                <span>All Bookings ({customerBookings.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('payments')}
                className={`py-3 text-xs font-black border-b-2 whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'payments'
                    ? 'border-[#F94001] text-[#F94001]'
                    : 'border-transparent text-[#5F6368] hover:text-[#021526]'
                }`}
              >
                <CreditCard className="h-4 w-4" />
                <span>Payments & Receipts ({customerPayments.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('cancellations')}
                className={`py-3 text-xs font-black border-b-2 whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'cancellations'
                    ? 'border-[#F94001] text-[#F94001]'
                    : 'border-transparent text-[#5F6368] hover:text-[#021526]'
                }`}
              >
                <Ban className="h-4 w-4" />
                <span>Refunds & Cancellations ({customerCancelledBookings.length})</span>
              </button>
            </div>

            {/* SLIDE BAR CONTENT AREA - SCROLLABLE */}
            <div className="p-5 overflow-y-auto flex-1 space-y-4">
              {/* 1. ALL BOOKINGS TAB */}
              {activeTab === 'bookings' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-1">
                    <span className="text-xs font-bold text-slate-600">
                      Showing all passed, active and confirmed reservations
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      {customerBookings.length} total entries
                    </span>
                  </div>

                  {customerBookings.length === 0 ? (
                    <div className="p-8 text-center bg-[#F8F9FA] rounded-2xl border border-dashed border-[#CBD5E1] text-xs text-slate-500">
                      No bookings recorded for this player.
                    </div>
                  ) : (
                    customerBookings.map((b) => {
                      const isLive = b.booking_status === 'IN_PLAY' || b.booking_status === 'CONFIRMED';
                      const isCancelled = b.booking_status === 'CANCELLED';

                      return (
                        <div
                          key={b.id}
                          className={`p-4 rounded-2xl border transition-all shadow-xs space-y-3 ${
                            isCancelled
                              ? 'bg-rose-50/40 border-rose-200'
                              : isLive
                              ? 'bg-blue-50/30 border-blue-200'
                              : 'bg-white border-[#E5E7EB] hover:border-slate-300'
                          }`}
                        >
                          {/* Booking Card Header */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-black text-xs text-[#F94001] bg-[#FFF1EC] border border-[#F94001]/20 px-2.5 py-0.5 rounded-lg">
                                {b.booking_code}
                              </span>
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                                {b.sport}
                              </span>
                            </div>

                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
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
                          </div>

                          {/* Venue & Court Details */}
                          <div className="space-y-0.5 text-xs">
                            <p className="font-extrabold text-[#021526]">{b.venue_name}</p>
                            <p className="text-slate-600 font-medium">{b.court_name}</p>
                          </div>

                          {/* Slot & Payment Summary */}
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-200/60 text-xs">
                            <div>
                              <span className="text-[10px] text-slate-400 uppercase font-semibold">Date & Slot</span>
                              <p className="font-semibold text-slate-800 text-[11px] mt-0.5">
                                {b.booking_date}
                              </p>
                              <p className="font-mono text-slate-500 text-[10px]">
                                {b.time_slot}
                              </p>
                            </div>

                            <div>
                              <span className="text-[10px] text-slate-400 uppercase font-semibold">Amount Paid</span>
                              <p className="font-mono font-black text-sm text-[#021526] mt-0.5">
                                ₹{b.total_amount}
                              </p>
                              <span className="text-[10px] font-semibold text-slate-500">
                                via {b.payment_method}
                              </span>
                            </div>

                            <div className="col-span-2 sm:col-span-1">
                              <span className="text-[10px] text-slate-400 uppercase font-semibold">Payment Ref</span>
                              <p className="font-mono text-[10px] text-slate-600 truncate mt-0.5">
                                {b.transaction_id}
                              </p>
                              <span className={`text-[10px] font-bold ${
                                b.payment_status === 'PAID' ? 'text-emerald-600' : 'text-rose-600'
                              }`}>
                                {b.payment_status}
                              </span>
                            </div>
                          </div>

                          {/* ACTION: Cancel & Trigger Refund if booking is live/confirmed */}
                          {isLive && (
                            <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                              <span className="text-[11px] text-slate-500 font-medium">
                                Eligible for instant cancellation & wallet refund
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCancelAndRefundBooking(b.id)}
                                className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
                              >
                                <Ban className="h-3.5 w-3.5" />
                                <span>Cancel & Refund ₹{b.total_amount}</span>
                              </button>
                            </div>
                          )}

                          {/* If cancelled, show refund status preview */}
                          {isCancelled && b.refund_status && (
                            <div className="p-2.5 rounded-xl bg-rose-100/50 border border-rose-200 text-xs flex items-center justify-between">
                              <div>
                                <span className="text-[10px] font-bold uppercase text-rose-800">Refund Processed</span>
                                <p className="font-mono font-bold text-rose-900 mt-0.5">₹{b.refund_amount || b.total_amount} &bull; {b.refund_status}</p>
                              </div>
                              <span className="text-[10px] font-mono text-slate-600">{b.refund_utr}</span>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* 2. PAYMENTS TAB */}
              {activeTab === 'payments' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-1">
                    <span className="text-xs font-bold text-slate-600">
                      Payment transactions & gateway receipts
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      {customerPayments.length} transactions
                    </span>
                  </div>

                  {customerPayments.length === 0 ? (
                    <div className="p-8 text-center bg-[#F8F9FA] rounded-2xl border border-dashed border-[#CBD5E1] text-xs text-slate-500">
                      No direct gateway payments logged for this customer.
                    </div>
                  ) : (
                    customerPayments.map((p) => (
                      <div
                        key={p.id}
                        className="p-4 rounded-2xl bg-white border border-[#E5E7EB] hover:border-slate-300 transition-all shadow-xs space-y-2.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-black text-xs text-[#021526]">
                                {p.txn_id}
                              </span>
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                                {p.gateway}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400 font-mono mt-0.5">{p.gateway_payment_id}</p>
                          </div>

                          <div className="text-right">
                            <span className="font-mono font-black text-base text-[#021526]">
                              ₹{p.gross_amount}
                            </span>
                            <div className="flex items-center justify-end gap-1 mt-0.5">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                              <span className="text-[10px] font-bold text-emerald-600">{p.status}</span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-xs">
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase">Booking Code</span>
                            <p className="font-mono font-bold text-[#F94001] text-[11px] mt-0.5">{p.booking_code}</p>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase">Payment Mode</span>
                            <p className="font-medium text-slate-800 text-[11px] mt-0.5">{p.payment_method}</p>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase">Timestamp</span>
                            <p className="text-slate-500 font-mono text-[10px] mt-0.5">{p.timestamp}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* 3. REFUNDS & CANCELLATIONS TAB */}
              {activeTab === 'cancellations' && (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-2xl bg-gradient-to-r from-rose-50 to-orange-50 border border-rose-200 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase text-rose-700 tracking-wider">Total Cancellations</span>
                      <p className="text-xl font-black text-rose-800 font-mono mt-0.5">
                        {selectedCustomer.cancellation_count} Reservations Cancelled
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-xl bg-rose-600 text-white font-bold text-xs shadow-xs">
                      {customerCancelledBookings.length} Refund Logs
                    </span>
                  </div>

                  {customerCancelledBookings.length === 0 ? (
                    <div className="p-8 text-center bg-[#F8F9FA] rounded-2xl border border-dashed border-[#CBD5E1] text-xs text-slate-500">
                      No cancellations or refunds logged for this customer.
                    </div>
                  ) : (
                    customerCancelledBookings.map((cb) => (
                      <div
                        key={cb.id}
                        className="p-4 rounded-2xl bg-white border border-rose-200 shadow-xs space-y-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-black text-xs text-[#F94001] bg-[#FFF1EC] px-2 py-0.5 rounded-lg">
                                {cb.booking_code}
                              </span>
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                                CANCELLED
                              </span>
                            </div>
                            <p className="font-extrabold text-xs text-[#021526] mt-1">{cb.venue_name}</p>
                            <p className="text-[11px] text-slate-500">{cb.court_name} &bull; {cb.booking_date}</p>
                          </div>

                          <div className="text-right">
                            <span className="font-mono font-black text-base text-rose-600">
                              ₹{cb.refund_amount || cb.total_amount}
                            </span>
                            <p className="text-[10px] font-bold text-slate-500">Refund Amount</p>
                          </div>
                        </div>

                        {/* Cancellation Reason and Timestamp */}
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
                          <span className="text-[10px] font-bold uppercase text-slate-400">Cancellation Reason</span>
                          <p className="text-slate-700 font-medium">
                            {cb.cancellation_reason || 'Player requested cancellation prior to slot commencement'}
                          </p>
                          {cb.cancelled_at && (
                            <p className="text-[10px] text-slate-400 font-mono pt-0.5">
                              Cancelled at: {cb.cancelled_at}
                            </p>
                          )}
                        </div>

                        {/* Refund Processing Status */}
                        <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-100">
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-semibold">Refund Status</span>
                            <p className="font-bold text-emerald-700 mt-0.5 flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                              <span>{cb.refund_status || 'REFUNDED'}</span>
                            </p>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-semibold">Refund UTR / Reference</span>
                            <p className="font-mono text-[11px] font-bold text-slate-700 mt-0.5 truncate">
                              {cb.refund_utr || 'UTR-RZP-992140182'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Slide Bar Footer */}
            <div className="p-4 bg-slate-50 border-t border-[#E5E7EB] flex items-center justify-between shrink-0">
              <span className="text-xs text-slate-500 font-medium">
                Customer ID: {formatCustomerId(selectedCustomer.id)} &bull; Registered {selectedCustomer.registered_at}
              </span>
              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="px-4 py-2 rounded-xl bg-[#021526] hover:bg-[#F94001] text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Close Slide Bar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
