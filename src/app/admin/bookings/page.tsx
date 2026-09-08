'use client';

import React, { useState } from 'react';
import {
  CalendarCheck,
  Search,
  Filter,
  Eye,
  X,
  MapPin,
  Clock,
  CreditCard,
  QrCode,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Sparkles,
  Phone,
  User,
  Building2,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { INITIAL_BOOKINGS, BookingItem } from '@/lib/mockData';

export default function BookingManagementPage() {
  const [bookings, setBookings] = useState<BookingItem[]>(INITIAL_BOOKINGS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sportFilter, setSportFilter] = useState('ALL');
  const [selectedBooking, setSelectedBooking] = useState<BookingItem | null>(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const filteredBookings = bookings.filter((b) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      b.booking_code.toLowerCase().includes(q) ||
      b.customer_name.toLowerCase().includes(q) ||
      b.venue_name.toLowerCase().includes(q) ||
      b.court_name.toLowerCase().includes(q);

    const matchesStatus = statusFilter === 'ALL' || b.booking_status === statusFilter;
    const matchesSport = sportFilter === 'ALL' || b.sport.toLowerCase() === sportFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesSport;
  });

  const handleCancelBooking = (bookingId: string) => {
    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? { ...b, booking_status: 'CANCELLED', payment_status: 'REFUNDED' }
          : b
      )
    );
    if (selectedBooking && selectedBooking.id === bookingId) {
      setSelectedBooking({
        ...selectedBooking,
        booking_status: 'CANCELLED',
        payment_status: 'REFUNDED',
      });
    }
    setCancelModalOpen(false);
    setActionSuccess(`Booking ${selectedBooking?.booking_code} cancelled and ₹${selectedBooking?.total_amount} refund initiated.`);
    setTimeout(() => setActionSuccess(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E7EB] pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#F94001] bg-[#FFF1EC] px-3 py-1 rounded-full mb-2">
            <CalendarCheck className="h-3.5 w-3.5" /> Turf Booking Registry
          </div>
          <h1 className="text-2xl font-black tracking-tight text-[#021526] font-display">
            Booking Management
          </h1>
          <p className="text-xs text-[#5F6368] mt-1">
            Real-time court reservations, player check-in codes, slot rescheduling, and cancellation management.
          </p>
        </div>

        {actionSuccess && (
          <div className="p-3 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}
      </div>

      {/* KPI METRICS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs">
          <span className="text-[11px] font-bold uppercase text-[#5F6368]">Total Bookings</span>
          <p className="text-2xl font-black text-[#021526] font-display mt-1">{bookings.length}</p>
          <span className="text-[10px] text-emerald-600 font-bold">7 Total Slots Booked</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs">
          <span className="text-[11px] font-bold uppercase text-[#5F6368]">In-Play Right Now</span>
          <p className="text-2xl font-black text-blue-600 font-display mt-1">
            {bookings.filter((b) => b.booking_status === 'IN_PLAY').length}
          </p>
          <span className="text-[10px] text-blue-500 font-medium animate-pulse">Live on turf</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs">
          <span className="text-[11px] font-bold uppercase text-[#5F6368]">Confirmed Upcoming</span>
          <p className="text-2xl font-black text-[#021526] font-display mt-1">
            {bookings.filter((b) => b.booking_status === 'CONFIRMED').length}
          </p>
          <span className="text-[10px] text-slate-500 font-medium">Slots locked & paid</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs">
          <span className="text-[11px] font-bold uppercase text-[#5F6368]">Total Volume Booked</span>
          <p className="text-2xl font-black text-[#F94001] font-display mt-1">
            ₹{bookings.reduce((acc, b) => acc + b.total_amount, 0).toLocaleString()}
          </p>
          <span className="text-[10px] text-slate-500 font-medium">Gross booking revenue</span>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-[#E5E7EB]">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-[#5F6368]" />
          <input
            type="text"
            placeholder="Search booking code, turf, player..."
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
            <option value="ALL">All Statuses</option>
            <option value="IN_PLAY">In Play (Live)</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          <select
            value={sportFilter}
            onChange={(e) => setSportFilter(e.target.value)}
            className="rounded-xl bg-[#F8F9FA] border border-[#E5E7EB] px-3 py-2 text-xs text-[#021526] focus:border-[#F94001] focus:outline-none"
          >
            <option value="ALL">All Sports</option>
            <option value="Football">Football</option>
            <option value="Box Cricket">Box Cricket</option>
            <option value="Badminton">Badminton</option>
            <option value="Pickleball">Pickleball</option>
          </select>
        </div>
      </div>

      {/* BOOKINGS TABLE */}
      <div className="rounded-2xl bg-white border border-[#E5E7EB] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-[#F8F9FA] text-[#5F6368] font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Booking Code</th>
                <th className="py-3 px-4">Player</th>
                <th className="py-3 px-4">Turf & Court</th>
                <th className="py-3 px-4">Slot Time</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {filteredBookings.map((b) => (
                <tr key={b.id} className="hover:bg-[#F8F9FA] transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-[#F94001]">
                    {b.booking_code}
                  </td>

                  <td className="py-3.5 px-4">
                    <p className="font-bold text-[#021526]">{b.customer_name}</p>
                    <p className="text-[11px] text-[#5F6368] font-mono">{b.customer_phone}</p>
                  </td>

                  <td className="py-3.5 px-4">
                    <p className="font-bold text-[#021526]">{b.venue_name}</p>
                    <p className="text-[11px] text-[#5F6368]">
                      {b.court_name} • <span className="text-[#F94001] font-semibold">{b.sport}</span>
                    </p>
                  </td>

                  <td className="py-3.5 px-4">
                    <p className="font-semibold text-[#021526]">{b.booking_date}</p>
                    <p className="text-[11px] text-[#5F6368] font-mono">{b.time_slot}</p>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-mono font-black text-sm text-[#021526]">
                      ₹{b.total_amount}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-mono text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                      {b.payment_method}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
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

                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedBooking(b)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#021526] hover:bg-[#F94001] text-white font-bold text-xs transition-colors cursor-pointer"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>Details</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* BOOKING SLIP / DETAIL MODAL */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-lg max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="p-5 bg-[#021526] text-white flex items-center justify-between border-b border-[#06243f]">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-[#F94001] text-white flex items-center justify-center">
                  <CalendarCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-black text-base font-display">Booking Slip</h3>
                  <p className="text-xs text-slate-400 font-mono">{selectedBooking.booking_code}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Slip Content */}
            <div className="p-6 space-y-5 text-xs text-[#021526] overflow-y-auto">
              {/* Status Badge */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-[#F8F9FA] border border-[#E5E7EB]">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Booking Status</span>
                  <p className="font-bold text-sm mt-0.5">{selectedBooking.booking_status}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Total Paid</span>
                  <p className="font-mono font-black text-lg text-[#F94001]">₹{selectedBooking.total_amount}</p>
                </div>
              </div>

              {/* Venue & Court Details */}
              <div className="space-y-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#5F6368]">Venue Details</h4>
                <div className="p-3.5 rounded-2xl border border-slate-200 space-y-1 bg-slate-50/50">
                  <p className="font-bold text-sm text-[#021526]">{selectedBooking.venue_name}</p>
                  <p className="text-[11px] text-slate-600">{selectedBooking.court_name} ({selectedBooking.sport})</p>
                  <div className="pt-2 flex items-center gap-2 text-slate-500 font-mono text-[11px]">
                    <Clock className="h-3.5 w-3.5 text-[#F94001]" />
                    <span>{selectedBooking.booking_date} • {selectedBooking.time_slot} ({selectedBooking.duration_minutes} mins)</span>
                  </div>
                </div>
              </div>

              {/* Customer Details */}
              <div className="space-y-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#5F6368]">Player Information</h4>
                <div className="p-3.5 rounded-2xl border border-slate-200 space-y-1">
                  <p className="font-bold text-[#021526]">{selectedBooking.customer_name}</p>
                  <p className="text-[11px] text-slate-600 font-mono">{selectedBooking.customer_phone}</p>
                </div>
              </div>

              {/* Financial Split Breakdown */}
              <div className="space-y-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#5F6368]">Payment Split & Commission</h4>
                <div className="p-3.5 rounded-2xl border border-slate-200 space-y-1.5 font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Gross Paid by Player</span>
                    <span className="font-bold">₹{selectedBooking.total_amount}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Platform Commission (10%)</span>
                    <span>- ₹{selectedBooking.platform_fee}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-slate-200 text-emerald-600 font-bold">
                    <span>Net Payable to Venue Partner</span>
                    <span>₹{selectedBooking.venue_share}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {selectedBooking.booking_status !== 'CANCELLED' && (
                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setCancelModalOpen(true)}
                    className="flex-1 py-2.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition-colors cursor-pointer"
                  >
                    Cancel & Refund Slot
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActionSuccess(`Slot reschedule request opened for ${selectedBooking.booking_code}`);
                      setTimeout(() => setActionSuccess(null), 3000);
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-[#021526] hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
                  >
                    Reschedule Slot
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CANCEL CONFIRMATION MODAL */}
      {cancelModalOpen && selectedBooking && (
        <div className="fixed inset-0 z-60 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl">
            <div className="h-12 w-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-base font-black text-[#021526]">Cancel Booking?</h4>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to cancel reservation <span className="font-mono font-bold text-slate-800">{selectedBooking.booking_code}</span>? An instant refund of ₹{selectedBooking.total_amount} will be dispatched.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCancelModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
              >
                No, Keep
              </button>
              <button
                type="button"
                onClick={() => handleCancelBooking(selectedBooking.id)}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 cursor-pointer"
              >
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
