'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Building2,
  Search,
  ExternalLink,
  ShieldCheck,
  Eye,
  X,
  User,
  CreditCard,
  Trophy,
  Clock,
  CalendarCheck,
  Landmark,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Phone,
  Mail,
  FileText,
  Percent,
  Sparkles,
  DollarSign,
  ChevronRight,
  Filter,
} from 'lucide-react';
import {
  INITIAL_VENUES,
  INITIAL_BOOKINGS,
  INITIAL_PAYMENTS,
  INITIAL_SETTLEMENTS,
  VenueDetail,
} from '@/lib/mockData';

type VenueInspectionTab =
  | 'information'
  | 'bookings'
  | 'payments'
  | 'settlements';

export default function VenuesManagementPage() {
  const [venues, setVenues] = useState<VenueDetail[]>(INITIAL_VENUES);
  const [searchQuery, setSearchQuery] = useState('');
  const [sportFilter, setSportFilter] = useState('ALL');
  const [selectedVenue, setSelectedVenue] = useState<VenueDetail | null>(null);
  const [activeTab, setActiveTab] = useState<VenueInspectionTab>('information');

  // Load converted live venues from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('ibooksports_live_venues');
        if (stored) {
          const parsed: VenueDetail[] = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const existingIds = new Set(parsed.map((p) => p.id));
            setVenues([...parsed, ...INITIAL_VENUES.filter((v) => !existingIds.has(v.id))]);
          }
        }
      } catch (err) {
        console.error('Failed to load live venues from local storage', err);
      }
    }
  }, []);

  const filteredVenues = venues.filter((v) => {
    const query = searchQuery.toLowerCase();
    const matchesQuery =
      v.venue_name.toLowerCase().includes(query) ||
      v.name.toLowerCase().includes(query) ||
      v.district.toLowerCase().includes(query) ||
      v.state.toLowerCase().includes(query);

    const matchesSport =
      sportFilter === 'ALL' ||
      v.sports.toLowerCase().includes(sportFilter.toLowerCase());

    return matchesQuery && matchesSport;
  });

  const venueBookings = selectedVenue
    ? INITIAL_BOOKINGS.filter((b) => b.venue_id === selectedVenue.id)
    : [];

  const venuePayments = selectedVenue
    ? INITIAL_PAYMENTS.filter((p) => p.venue_name.includes(selectedVenue.venue_name.split(' ')[0]))
    : [];

  const venueSettlements = selectedVenue
    ? INITIAL_SETTLEMENTS.filter((s) => s.venue_id === selectedVenue.id)
    : [];

  return (
    <div className="animate-in fade-in duration-300">
      <div className={`space-y-6 ${selectedVenue ? 'hidden' : 'block'}`}>
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E7EB] pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#F94001] bg-[#FFF1EC] px-3 py-1 rounded-full mb-2">
            <Building2 className="h-3.5 w-3.5" /> Turf & Arena Directory
          </div>
          <h1 className="text-2xl font-black tracking-tight text-[#021526] font-display">
            Venue Management
          </h1>
          <p className="text-xs text-[#5F6368] mt-1">
            Registered sports arenas, box turfs, owners KYC, bank credentials, live bookings, and settlements.
          </p>
        </div>

        {/* Action button */}
        <div className="flex items-center gap-3">
          <Link
            href="/admin/onboarding"
            className="inline-flex items-center gap-2 rounded-xl bg-[#F94001] hover:bg-[#D93600] text-white px-4 py-2.5 text-xs font-bold shadow-sm transition-all"
          >
            <span>+ Onboard New Partner Turf</span>
          </Link>
        </div>
      </div>

      {/* FILTER & MINIMAL KPI BAR */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-white p-3 rounded-2xl border border-[#E5E7EB] shadow-2xs">
        {/* KPI Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar max-w-full">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F8F9FA] border border-[#E5E7EB] whitespace-nowrap">
            <span className="text-[10px] text-[#5F6368] font-bold uppercase tracking-wide">Live Turfs</span>
            <span className="text-xs font-black font-mono text-[#021526]">{venues.length}</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F8F9FA] border border-[#E5E7EB] whitespace-nowrap">
            <span className="text-[10px] text-[#5F6368] font-bold uppercase tracking-wide">Total Courts</span>
            <span className="text-xs font-black font-mono text-[#021526]">{venues.reduce((acc, v) => acc + v.courts, 0)}</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 whitespace-nowrap">
            <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wide">Monthly GMV</span>
            <span className="text-xs font-black font-mono text-emerald-800">₹14.1L</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FFF1EC] border border-[#F94001]/20 whitespace-nowrap">
            <span className="text-[10px] text-[#F94001] font-bold uppercase tracking-wide">Pending Disbursal</span>
            <span className="text-xs font-black font-mono text-[#F94001]">₹1.5L</span>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#5F6368]" />
            <input
              type="text"
              placeholder="Search venues..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl bg-slate-50 border border-[#E5E7EB] pl-9 pr-3 py-1.5 text-xs text-[#021526] placeholder-[#5F6368] focus:bg-white focus:border-[#F94001] focus:ring-1 focus:ring-[#F94001] transition-all outline-none"
            />
          </div>
          <div className="relative">
            <select
              value={sportFilter}
              onChange={(e) => setSportFilter(e.target.value)}
              className="appearance-none pl-8 pr-8 py-1.5 rounded-xl border border-[#E5E7EB] bg-slate-50 text-xs font-semibold focus:outline-none focus:border-[#F94001] focus:ring-1 focus:ring-[#F94001] transition-colors cursor-pointer"
            >
              <option value="ALL">All Sports</option>
              <option value="FOOTBALL">Football</option>
              <option value="CRICKET">Cricket</option>
              <option value="BADMINTON">Badminton</option>
              <option value="PICKLEBALL">Pickleball</option>
              <option value="TENNIS">Tennis</option>
            </select>
            <Trophy className="h-3.5 w-3.5 absolute left-2.5 top-2 text-[#5F6368] pointer-events-none" />
          </div>
        </div>
      </div>

      {/* VENUES DATA TABLE */}
      <div className="rounded-2xl bg-white border border-[#E5E7EB] shadow-xs overflow-hidden mt-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-[#F8F9FA] text-[#5F6368] font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Venue & City</th>
                <th className="py-3 px-4">Owner Contact</th>
                <th className="py-3 px-4">Sports & Courts</th>
                <th className="py-3 px-4">Bank Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {filteredVenues.map((v) => (
                <tr key={v.id} className="hover:bg-[#F8F9FA] transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-[#021526]">{v.venue_name}</p>
                      {v.id.startsWith('VEN-') && !INITIAL_VENUES.some((iv) => iv.id === v.id) && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-300">
                          <CheckCircle2 className="h-2.5 w-2.5" /> Live Converted
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#5F6368] flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3 w-3 text-slate-400" />
                      {v.district}, {v.state}
                    </p>
                  </td>

                  <td className="py-3.5 px-4">
                    <p className="font-semibold text-[#021526]">{v.name}</p>
                    <p className="text-[11px] text-[#5F6368] font-mono">
                      +91 {v.mobile_number}
                    </p>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex flex-wrap gap-1 mb-1">
                      {v.sports_list.map((sp, idx) => (
                        <span
                          key={idx}
                          className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#FFF1EC] text-[#F94001]"
                        >
                          {sp}
                        </span>
                      ))}
                    </div>
                    <span className="text-[11px] text-[#5F6368] font-medium">
                      {v.courts} Pitches / Courts
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Penny Drop Verified
                    </span>
                    <p className="text-[10px] text-[#5F6368] font-mono mt-0.5">
                      {v.bank.bank_name}
                    </p>
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedVenue(v);
                        setActiveTab('information');
                      }}
                      className="p-2 rounded-xl border border-[#CBD5E1] bg-white text-[#5F6368] hover:bg-[#FFF1EC] hover:text-[#F94001] hover:border-[#F94001] transition-all cursor-pointer shadow-xs inline-flex items-center justify-center group active:scale-95"
                      title="Inspect Dossier"
                    >
                      <Eye className="h-4 w-4 group-hover:scale-110 transition-transform" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      </div>

      {/* VENUE DOSSIER TOP-HEADER VIEW */}
      {selectedVenue && (
        <div className="space-y-6 mt-2">
          {/* Header Card */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs overflow-hidden">
            <div className="p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-[#6366F1] text-white flex items-center justify-center text-2xl font-black shadow-inner">
                  {selectedVenue.venue_name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-black text-[#021526] font-display flex items-center gap-2">
                    {selectedVenue.venue_name}
                  </h2>
                  <p className="text-xs text-slate-500 font-mono mt-1 font-semibold">
                    {selectedVenue.id} • {selectedVenue.district}, {selectedVenue.state}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold flex items-center gap-1.5">
                   <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Active
                </span>
                <button className="px-4 py-2 rounded-xl bg-[#021526] hover:bg-[#F94001] text-white text-xs font-bold shadow-sm transition-colors flex items-center gap-2 cursor-pointer">
                  <User className="h-3.5 w-3.5" /> Edit Venue
                </button>
                <button className="px-4 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold bg-white transition-colors flex items-center gap-2 cursor-pointer">
                  <AlertCircle className="h-3.5 w-3.5" /> Suspend
                </button>
                <button onClick={() => setSelectedVenue(null)} className="px-4 py-2 rounded-xl border border-[#CBD5E1] text-[#5F6368] hover:bg-slate-50 text-xs font-bold bg-white transition-colors flex items-center gap-2 cursor-pointer">
                  &larr; Back
                </button>
              </div>
            </div>

            {/* Horizontal Tabs */}
            <div className="px-6 md:px-8 border-t border-[#E5E7EB] flex items-center gap-8 overflow-x-auto scrollbar-none">
              {[
                { key: 'information', label: 'Venue Information' },
                { key: 'bookings', label: 'Bookings' },
                { key: 'payments', label: 'Booking Payments' },
                { key: 'settlements', label: 'Settlements' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key as VenueInspectionTab)}
                  className={`py-4 text-xs font-bold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                    activeTab === tab.key
                      ? 'border-[#021526] text-[#021526]'
                      : 'border-transparent text-[#5F6368] hover:text-[#021526]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* MAIN CONTENT AREA */}
          <div className="w-full">
              {/* COMBINED ONBOARDING INFORMATION TAB */}
              {activeTab === 'information' && (
                <div className="space-y-6">
                  {/* VENUE PROFILE & TIMINGS */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="p-4 rounded-2xl bg-[#F8F9FA] border border-[#E5E7EB] space-y-3">
                      <h4 className="font-bold text-sm text-[#021526] flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-[#F94001]" /> Venue Profile
                      </h4>
                      <div className="space-y-2">
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase font-semibold">Tagline</span>
                          <p className="font-semibold">{selectedVenue.tagline}</p>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase font-semibold">Street Address</span>
                          <p className="font-semibold">{selectedVenue.address}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="text-[10px] text-slate-500 uppercase font-semibold">District</span>
                            <p className="font-semibold">{selectedVenue.district}</p>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-500 uppercase font-semibold">Postal Pincode</span>
                            <p className="font-semibold">{selectedVenue.pincode}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#F8F9FA] border border-[#E5E7EB] space-y-3">
                      <h4 className="font-bold text-sm text-[#021526] flex items-center gap-2">
                        <Clock className="h-4 w-4 text-[#F94001]" /> Operating Timings & Maps
                      </h4>
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="text-[10px] text-slate-500 uppercase font-semibold">Opening Time</span>
                            <p className="font-bold text-emerald-600">{selectedVenue.opening_time}</p>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-500 uppercase font-semibold">Closing Time</span>
                            <p className="font-bold text-slate-700">{selectedVenue.closing_time}</p>
                          </div>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase font-semibold">Google Maps GPS Link</span>
                          <a
                            href={selectedVenue.venue_location_name}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[#F94001] hover:underline flex items-center gap-1 font-mono mt-0.5 truncate block"
                          >
                            <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                            {selectedVenue.venue_location_name}
                          </a>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase font-semibold">Approved Sports</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {selectedVenue.sports_list.map((sp, i) => (
                              <span key={i} className="px-2 py-0.5 rounded bg-white border border-slate-200 font-semibold">
                                {sp}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* OWNER & KYC */}
                  <div className="p-4 rounded-2xl bg-[#F8F9FA] border border-[#E5E7EB] space-y-4">
                    <h4 className="font-bold text-sm text-[#021526] flex items-center gap-2">
                      <User className="h-4 w-4 text-[#F94001]" /> Verified Owner / Managing Partner
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-semibold">Full Legal Name</span>
                        <p className="font-bold text-sm">{selectedVenue.owner.full_name}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-semibold">Contact Phone</span>
                        <p className="font-mono font-bold">{selectedVenue.owner.phone}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-semibold">Email Address</span>
                        <p className="font-mono">{selectedVenue.owner.email}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-semibold">PAN Card</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="font-mono font-bold">{selectedVenue.owner.pan_number}</span>
                          <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            VERIFIED
                          </span>
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-semibold">Aadhaar (Masked)</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="font-mono font-bold">{selectedVenue.owner.aadhaar_masked}</span>
                          <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            VERIFIED
                          </span>
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-semibold">GSTIN Registration</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="font-mono font-bold">{selectedVenue.owner.gstin}</span>
                          <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            ACTIVE
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200">
                      <span className="text-[10px] text-slate-500 uppercase font-semibold">Registered Entity Address</span>
                      <p className="font-semibold text-slate-700 mt-0.5">{selectedVenue.owner.registered_address}</p>
                    </div>
                  </div>

                  {/* BANK DETAILS */}
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-[#021526] text-white space-y-4 shadow-md">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Landmark className="h-5 w-5 text-[#F94001]" />
                        <span className="font-bold text-sm tracking-wide">Payout Disbursement Account</span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Penny Drop Verified
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-mono">Account Beneficiary</span>
                        <p className="font-bold text-sm text-slate-100">{selectedVenue.bank.account_holder_name}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-mono">Bank Name</span>
                        <p className="font-bold text-slate-100">{selectedVenue.bank.bank_name}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-mono">Masked Account Number</span>
                        <p className="font-mono font-bold text-slate-100">{selectedVenue.bank.account_number_masked}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-mono">IFSC Code</span>
                        <p className="font-mono font-bold text-slate-100">{selectedVenue.bank.ifsc_code}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-mono">Branch Location</span>
                        <p className="font-bold text-slate-100">{selectedVenue.bank.branch_name}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-mono">Instant UPI VPA</span>
                        <p className="font-mono font-bold text-[#F94001]">{selectedVenue.bank.upi_id}</p>
                      </div>
                    </div>
                  </div>

                  {/* COURTS & PITCHES */}
                  <div>
                    <h4 className="font-bold text-sm text-[#021526] flex items-center gap-2 mb-3 px-1">
                      <Trophy className="h-4 w-4 text-[#F94001]" /> Configured Courts & Pitches
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {selectedVenue.court_list.map((court) => (
                        <div
                          key={court.id}
                          className="p-4 rounded-2xl bg-[#F8F9FA] border border-[#E5E7EB] space-y-2 hover:border-[#F94001] transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <h5 className="font-bold text-sm text-[#021526]">{court.name}</h5>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FFF1EC] text-[#F94001]">
                              {court.sport}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#5F6368]">{court.surface}</p>
                          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 text-[11px]">
                            <div>
                              <span className="text-[10px] text-slate-400 uppercase font-semibold">Dimensions</span>
                              <p className="font-semibold">{court.dimensions}</p>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 uppercase font-semibold">Lighting</span>
                              <p className="font-semibold">{court.lighting}</p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between pt-1">
                            <span className="text-[11px] font-bold text-slate-700">
                              Base Rate: <span className="text-[#F94001] font-mono">₹{court.base_hourly_rate} / hr</span>
                            </span>
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                              {court.court_type}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* SLOTS & PRICING */}
                  <div>
                    <h4 className="font-bold text-sm text-[#021526] flex items-center gap-2 mb-3 px-1">
                      <Clock className="h-4 w-4 text-[#F94001]" /> Slot Pricing Rules
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-1">
                        <span className="text-[10px] font-bold text-amber-800 uppercase">Peak Morning Slot</span>
                        <p className="font-bold text-sm text-amber-950">{selectedVenue.slot_rules.peak_morning_hours}</p>
                        <p className="text-lg font-black text-amber-900 font-mono">₹{selectedVenue.slot_rules.peak_morning_price} / hr</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 space-y-1">
                        <span className="text-[10px] font-bold text-blue-800 uppercase">Regular Day Slot</span>
                        <p className="font-bold text-sm text-blue-950">{selectedVenue.slot_rules.regular_day_hours}</p>
                        <p className="text-lg font-black text-blue-900 font-mono">₹{selectedVenue.slot_rules.regular_day_price} / hr</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 space-y-1">
                        <span className="text-[10px] font-bold text-purple-800 uppercase">Prime Night Slot</span>
                        <p className="font-bold text-sm text-purple-950">{selectedVenue.slot_rules.prime_night_hours}</p>
                        <p className="text-lg font-black text-purple-900 font-mono">₹{selectedVenue.slot_rules.prime_night_price} / hr</p>
                      </div>
                    </div>

                    <div className="mt-4 p-4 rounded-2xl bg-[#F8F9FA] border border-[#E5E7EB] flex items-center justify-between">
                      <div>
                        <h5 className="font-bold text-xs text-[#021526]">Weekend Surge Pricing</h5>
                        <p className="text-[11px] text-[#5F6368]">Automatic rate adjustment applied on Saturdays and Sundays.</p>
                      </div>
                      <span className="text-sm font-black font-mono text-[#F94001]">
                        +{selectedVenue.slot_rules.weekend_surge_percent}% Surge
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: BOOKINGS */}
              {activeTab === 'bookings' && (
                <div className="space-y-4">
                  {venueBookings.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">No recent bookings recorded for this venue.</div>
                  ) : (
                    <div className="overflow-x-auto rounded-2xl border border-[#E5E7EB]">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#F8F9FA] text-[#5F6368] font-bold uppercase">
                          <tr>
                            <th className="py-2.5 px-3">Booking Code</th>
                            <th className="py-2.5 px-3">Customer</th>
                            <th className="py-2.5 px-3">Court & Slot</th>
                            <th className="py-2.5 px-3">Amount</th>
                            <th className="py-2.5 px-3">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E5E7EB]">
                          {venueBookings.map((b) => (
                            <tr key={b.id} className="hover:bg-[#F8F9FA]">
                              <td className="py-2.5 px-3 font-mono font-bold text-[#F94001]">{b.booking_code}</td>
                              <td className="py-2.5 px-3">
                                <p className="font-bold">{b.customer_name}</p>
                                <p className="text-[10px] text-slate-500 font-mono">{b.customer_phone}</p>
                              </td>
                              <td className="py-2.5 px-3">
                                <p className="font-semibold">{b.court_name}</p>
                                <p className="text-[10px] text-slate-500">{b.booking_date} • {b.time_slot}</p>
                              </td>
                              <td className="py-2.5 px-3 font-mono font-bold">₹{b.total_amount}</td>
                              <td className="py-2.5 px-3">
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
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
              )}

              {/* TAB 7: BOOKING PAYMENTS */}
              {activeTab === 'payments' && (
                <div className="space-y-4">
                  <div className="overflow-x-auto rounded-2xl border border-[#E5E7EB]">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#F8F9FA] text-[#5F6368] font-bold uppercase">
                        <tr>
                          <th className="py-2.5 px-3">Txn ID / Ref</th>
                          <th className="py-2.5 px-3">Customer</th>
                          <th className="py-2.5 px-3">Gross Paid</th>
                          <th className="py-2.5 px-3">Platform Fee (10%)</th>
                          <th className="py-2.5 px-3">Net Venue Payout</th>
                          <th className="py-2.5 px-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E5E7EB]">
                        {venuePayments.map((p) => (
                          <tr key={p.id} className="hover:bg-[#F8F9FA]">
                            <td className="py-2.5 px-3 font-mono">
                              <p className="font-bold text-[#021526]">{p.txn_id}</p>
                              <p className="text-[10px] text-slate-500">{p.gateway_payment_id}</p>
                            </td>
                            <td className="py-2.5 px-3 font-medium">{p.customer_name}</td>
                            <td className="py-2.5 px-3 font-mono font-bold">₹{p.gross_amount}</td>
                            <td className="py-2.5 px-3 font-mono text-slate-500">₹{p.platform_commission}</td>
                            <td className="py-2.5 px-3 font-mono font-bold text-emerald-600">₹{p.net_venue_payout}</td>
                            <td className="py-2.5 px-3">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                {p.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 8: SETTLEMENTS */}
              {activeTab === 'settlements' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-[#FFF1EC] border border-[#F94001]/20">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-[#F94001]">Current Unsettled Balance</span>
                      <p className="text-xl font-black text-[#021526] font-mono">
                        ₹{selectedVenue.financials.unsettled_balance.toLocaleString()}
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-xl bg-[#F94001] text-white text-xs font-bold shadow-xs">
                      Next Auto-Disbursal in 2 Days
                    </span>
                  </div>

                  <div className="overflow-x-auto rounded-2xl border border-[#E5E7EB]">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#F8F9FA] text-[#5F6368] font-bold uppercase">
                        <tr>
                          <th className="py-2.5 px-3">Batch Number</th>
                          <th className="py-2.5 px-3">Cycle Period</th>
                          <th className="py-2.5 px-3">Bookings</th>
                          <th className="py-2.5 px-3">Net Disbursed</th>
                          <th className="py-2.5 px-3">UTR Reference</th>
                          <th className="py-2.5 px-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E5E7EB]">
                        {venueSettlements.map((s) => (
                          <tr key={s.id} className="hover:bg-[#F8F9FA]">
                            <td className="py-2.5 px-3 font-mono font-bold text-[#021526]">{s.batch_number}</td>
                            <td className="py-2.5 px-3 text-[11px] text-slate-600">
                              {s.period_start} to {s.period_end}
                            </td>
                            <td className="py-2.5 px-3 font-mono">{s.bookings_count} slots</td>
                            <td className="py-2.5 px-3 font-mono font-bold text-emerald-600">
                              ₹{s.net_payable.toLocaleString()}
                            </td>
                            <td className="py-2.5 px-3 font-mono text-[10px] text-slate-500">
                              {s.utr_number || 'Pending Generation'}
                            </td>
                            <td className="py-2.5 px-3">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  s.status === 'SETTLED'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {s.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
}
