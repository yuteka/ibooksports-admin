'use client';

import React, { useState, useEffect, useCallback, useId } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import {
  Trophy,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  Check,
  RefreshCw,
  Building2,
  Phone,
  Layers,
  X,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import {
  adminApi,
  CourtRequestItem,
} from '@/lib/api';

const REJECTION_REASONS = [
  { value: 'INCOMPLETE_DETAILS', label: 'Incomplete or unclear court specifications' },
  { value: 'PRICING_OUT_OF_BOUNDS', label: 'Hourly pricing violates regional slot rate standards' },
  { value: 'SURFACE_VERIFICATION_NEEDED', label: 'Surface type or court dimensions require physical verification' },
  { value: 'DUPLICATE_LISTING', label: 'Duplicate court name or slot already listed for this venue' },
  { value: 'OTHER', label: 'Other specific reason (provide note below)' },
];

export default function CourtRequestsPage() {
  const [requests, setRequests] = useState<CourtRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedSport, setSelectedSport] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [mounted, setMounted] = useState(false);

  // Reject Modal State
  const [rejectingRequest, setRejectingRequest] = useState<CourtRequestItem | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('INCOMPLETE_DETAILS');
  const [rejectionNote, setRejectionNote] = useState<string>('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  // Approve Confirmation Modal State
  const [approvingRequest, setApprovingRequest] = useState<CourtRequestItem | null>(null);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<{
    type: 'success' | 'error';
    title: string;
    description: string;
  } | null>(null);

  const reasonSelectId = useId();
  const rejectionNoteId = useId();

  useEffect(() => {
    setMounted(true);
  }, []);

  const loadRequests = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.getCourtRequests(
        selectedStatus === 'ALL' ? undefined : selectedStatus
      );
      setRequests(data);
    } catch (e) {
      console.error('Failed to load court requests', e);
      setToastMessage({
        type: 'error',
        title: 'Connection Error',
        description: 'Failed to fetch court requests from server.',
      });
    } finally {
      setLoading(false);
    }
  }, [selectedStatus]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  // Handle Approve
  const handleApprove = async (courtReq: CourtRequestItem) => {
    setIsSubmittingReview(true);
    setReviewError(null);
    try {
      await adminApi.reviewCourtRequest(courtReq.id, {
        status: 'APPROVED',
        reviewer_name: 'Admin Superuser',
      });
      setToastMessage({
        type: 'success',
        title: 'Court Approved & Activated',
        description: `${courtReq.court_name} (${courtReq.id}) has been approved and activated in the vendor portal.`,
      });
      setApprovingRequest(null);
      await loadRequests();
    } catch (e: unknown) {
      const err = e as Error;
      setReviewError(err.message || 'Failed to approve court request.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Handle Reject
  const handleReject = async () => {
    if (!rejectingRequest) return;
    if (rejectionReason === 'OTHER' && !rejectionNote.trim()) {
      setReviewError('Please provide a specific rejection note explaining why this court cannot be approved.');
      return;
    }

    setIsSubmittingReview(true);
    setReviewError(null);
    try {
      const fullReason = rejectionNote.trim()
        ? `${REJECTION_REASONS.find((r) => r.value === rejectionReason)?.label || rejectionReason}: ${rejectionNote.trim()}`
        : REJECTION_REASONS.find((r) => r.value === rejectionReason)?.label || rejectionReason;

      await adminApi.reviewCourtRequest(rejectingRequest.id, {
        status: 'REJECTED',
        rejection_reason: fullReason,
        reviewer_name: 'Admin Superuser',
      });

      setToastMessage({
        type: 'success',
        title: 'Court Request Rejected',
        description: `${rejectingRequest.court_name} (${rejectingRequest.id}) marked rejected. The vendor can view the reason and resubmit.`,
      });
      setRejectingRequest(null);
      setRejectionNote('');
      await loadRequests();
    } catch (e: unknown) {
      const err = e as Error;
      setReviewError(err.message || 'Failed to reject court request.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Metrics Calculation
  const totalCount = requests.length;
  const pendingCount = requests.filter((r) => r.status === 'PENDING').length;
  const approvedCount = requests.filter((r) => r.status === 'APPROVED').length;
  const rejectedCount = requests.filter((r) => r.status === 'REJECTED').length;

  // Collect all unique sports from requests
  const uniqueSports = Array.from(
    new Set(requests.flatMap((r) => (Array.isArray(r.sports) ? r.sports : [])))
  ).filter(Boolean);

  // Filtered requests
  const filteredRequests = requests.filter((req) => {
    if (selectedStatus !== 'ALL' && req.status !== selectedStatus) return false;
    if (selectedSport !== 'ALL') {
      const hasSport = req.sports?.some(
        (s) => s.toLowerCase() === selectedSport.toLowerCase()
      );
      if (!hasSport) return false;
    }
    if (!searchQuery.trim()) return true;

    const q = searchQuery.toLowerCase();
    const sportsStr = (req.sports || []).join(' ').toLowerCase();
    return (
      req.id.toLowerCase().includes(q) ||
      req.court_name.toLowerCase().includes(q) ||
      (req.display_name && req.display_name.toLowerCase().includes(q)) ||
      sportsStr.includes(q) ||
      req.venue_name.toLowerCase().includes(q) ||
      (req.venue_city && req.venue_city.toLowerCase().includes(q)) ||
      (req.vendor_name && req.vendor_name.toLowerCase().includes(q)) ||
      (req.vendor_mobile && req.vendor_mobile.includes(q))
    );
  });

  return (
    <div className="space-y-6" suppressHydrationWarning>
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E7EB] pb-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black tracking-tight text-[#021526] font-display flex items-center gap-2.5">
              <Trophy className="h-6 w-6 text-[#F94001]" />
              Court Requests Review
            </h1>
            {pendingCount > 0 && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#F94001]/10 text-[#F94001] border border-[#F94001]/30 animate-pulse">
                {pendingCount} Pending Review
              </span>
            )}
          </div>
          <p className="text-xs text-[#5F6368] mt-1 max-w-3xl">
            Evaluate inbound new court addition requests from sports vendors. Review court dimensions, indoor/outdoor type, and pricing rules. Approved courts instantly activate on the vendor management dashboard.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadRequests}
            className="p-2 rounded-xl border border-[#E5E7EB] bg-white text-[#5F6368] hover:text-[#021526] transition-all shadow-xs cursor-pointer flex items-center gap-1.5 text-xs font-bold"
            title="Refresh List"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Requests */}
        <div className="bg-white rounded-2xl p-4 border border-[#E5E7EB] shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-[#5F6368] uppercase tracking-wider">Total Requests</p>
            <p className="text-2xl font-black text-[#021526] mt-1">{totalCount}</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-[#021526]">
            <Layers className="h-5 w-5" />
          </div>
        </div>

        {/* Pending Approval */}
        <div
          onClick={() => setSelectedStatus('PENDING')}
          className={`cursor-pointer bg-white rounded-2xl p-4 border transition-all ${
            selectedStatus === 'PENDING'
              ? 'border-[#F94001] ring-2 ring-[#F94001]/20 shadow-md'
              : 'border-[#E5E7EB] hover:border-amber-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">Pending Approval</p>
              <p className="text-2xl font-black text-amber-600 mt-1">{pendingCount}</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Approved Courts */}
        <div
          onClick={() => setSelectedStatus('APPROVED')}
          className={`cursor-pointer bg-white rounded-2xl p-4 border transition-all ${
            selectedStatus === 'APPROVED'
              ? 'border-emerald-600 ring-2 ring-emerald-600/20 shadow-md'
              : 'border-[#E5E7EB] hover:border-emerald-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Approved &amp; Active</p>
              <p className="text-2xl font-black text-emerald-600 mt-1">{approvedCount}</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Rejected */}
        <div
          onClick={() => setSelectedStatus('REJECTED')}
          className={`cursor-pointer bg-white rounded-2xl p-4 border transition-all ${
            selectedStatus === 'REJECTED'
              ? 'border-rose-600 ring-2 ring-rose-600/20 shadow-md'
              : 'border-[#E5E7EB] hover:border-rose-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-rose-600 uppercase tracking-wider">Rejected</p>
              <p className="text-2xl font-black text-rose-600 mt-1">{rejectedCount}</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <XCircle className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH CONTROLS */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Status Chips */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-white border border-[#E5E7EB] shadow-xs overflow-x-auto scrollbar-none">
            {[
              { id: 'ALL', label: 'All Requests', count: totalCount },
              { id: 'PENDING', label: 'Pending Review', count: pendingCount },
              { id: 'APPROVED', label: 'Approved', count: approvedCount },
              { id: 'REJECTED', label: 'Rejected', count: rejectedCount },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedStatus(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedStatus === tab.id
                    ? 'bg-[#021526] text-white shadow-xs'
                    : 'text-[#5F6368] hover:text-[#021526] hover:bg-[#F3F4F4]'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    selectedStatus === tab.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Sport Filter */}
          {uniqueSports.length > 0 && (
            <div className="flex items-center gap-1 p-1 rounded-xl bg-white border border-[#E5E7EB] shadow-xs overflow-x-auto scrollbar-none">
              <button
                type="button"
                onClick={() => setSelectedSport('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedSport === 'ALL'
                    ? 'bg-[#F94001] text-white shadow-xs'
                    : 'text-[#5F6368] hover:text-[#021526] hover:bg-[#F3F4F4]'
                }`}
              >
                All Sports
              </button>
              {uniqueSports.map((sport) => (
                <button
                  key={sport}
                  type="button"
                  onClick={() => setSelectedSport(sport)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    selectedSport.toLowerCase() === sport.toLowerCase()
                      ? 'bg-[#F94001] text-white shadow-xs'
                      : 'text-[#5F6368] hover:text-[#021526] hover:bg-[#F3F4F4]'
                  }`}
                >
                  {sport}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Search Bar */}
        <div className="relative w-full lg:w-80">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-[#5F6368]" />
          <input
            type="text"
            placeholder="Search court, ID, venue, partner..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl bg-white border border-[#E5E7EB] pl-10 pr-4 py-2 text-xs text-[#021526] placeholder-[#5F6368] focus:border-[#F94001] focus:outline-none focus:ring-1 focus:ring-[#F94001] transition-all shadow-xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-[#5F6368] hover:text-[#021526]"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* COURT REQUESTS CARDS LIST */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-12 text-center shadow-xs">
          <Loader2 className="h-8 w-8 text-[#F94001] animate-spin mx-auto mb-3" />
          <p className="text-sm font-bold text-[#021526]">Loading Court Requests...</p>
          <p className="text-xs text-[#5F6368] mt-1">Retrieving pending vendor court additions</p>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-12 text-center shadow-xs">
          <Trophy className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <p className="text-base font-bold text-[#021526]">No Court Requests Found</p>
          <p className="text-xs text-[#5F6368] mt-1 max-w-sm mx-auto">
            {searchQuery
              ? `No requests match "${searchQuery}". Try clearing filters.`
              : `There are currently no ${selectedStatus !== 'ALL' ? selectedStatus.toLowerCase() : ''} court requests.`}
          </p>
          {(searchQuery || selectedStatus !== 'ALL' || selectedSport !== 'ALL') && (
            <button
              type="button"
              onClick={() => {
                setSelectedStatus('ALL');
                setSelectedSport('ALL');
                setSearchQuery('');
              }}
              className="mt-4 px-4 py-2 bg-[#021526] text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((req) => {
            const isPending = req.status === 'PENDING';
            const isApproved = req.status === 'APPROVED';
            const isRejected = req.status === 'REJECTED';

            return (
              <div
                key={req.id}
                className={`bg-white rounded-2xl border transition-all p-5 shadow-xs hover:shadow-md ${
                  isPending
                    ? 'border-amber-300 ring-1 ring-amber-100'
                    : isApproved
                    ? 'border-emerald-200'
                    : 'border-rose-200'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  {/* Left Specs Column */}
                  <div className="flex-1 space-y-3">
                    {/* Header Row: ID, Status, Sport badge */}
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-[#021526] border border-slate-200">
                        {req.id}
                      </span>

                      {/* Status Badge */}
                      {isPending && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock className="h-3.5 w-3.5" />
                          Pending Review
                        </span>
                      )}
                      {isApproved && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Approved &amp; Active
                        </span>
                      )}
                      {isRejected && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          <XCircle className="h-3.5 w-3.5" />
                          Rejected
                        </span>
                      )}

                      {/* Sports Badges */}
                      {(req.sports || []).map((sport) => (
                        <span
                          key={sport}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#021526]/5 text-[#021526] border border-slate-200"
                        >
                          {sport}
                        </span>
                      ))}

                      {req.type && (
                        <span
                          className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${
                            req.type === 'Indoor'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : req.type === 'Outdoor'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-purple-50 text-purple-700 border-purple-200'
                          }`}
                        >
                          {req.type} Court
                        </span>
                      )}

                      <span className="text-[11px] text-[#5F6368] ml-auto">
                        Submitted: {new Date(req.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                      </span>
                    </div>

                    {/* Court Title & Venue Info */}
                    <div>
                      <h2 className="text-base font-black text-[#021526] leading-snug">
                        {req.court_name}
                      </h2>
                      {req.display_name && req.display_name !== req.court_name && (
                        <p className="text-xs text-slate-500 font-medium">
                          Customer Label: &quot;{req.display_name}&quot;
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#5F6368] mt-1">
                        <span className="flex items-center gap-1 font-semibold text-slate-700">
                          <Building2 className="h-3.5 w-3.5 text-[#F94001]" />
                          {req.venue_name}
                          {req.venue_city && ` (${req.venue_city})`}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3 text-slate-400" />
                          {req.vendor_name || 'Vendor'} ({req.vendor_mobile})
                        </span>
                      </div>
                    </div>

                    {/* Court Specs Badges */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-[#F8F9FA] rounded-xl p-3 border border-[#E5E7EB]">
                      <div>
                        <p className="text-[10px] font-bold uppercase text-[#5F6368] tracking-wider">Min Duration</p>
                        <p className="text-xs font-bold text-[#021526] mt-0.5">{req.min_booking_duration || '60 mins'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase text-[#5F6368] tracking-wider">Court Type</p>
                        <p className="text-xs font-bold text-[#021526] mt-0.5">{req.type || 'Standard'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase text-[#5F6368] tracking-wider">Free Cancellation</p>
                        <p className="text-xs font-bold text-[#021526] mt-0.5">
                          {req.cancellation_window_hours ? `Up to ${req.cancellation_window_hours}h` : 'Non-refundable'}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase text-[#5F6368] tracking-wider">Refund Rate</p>
                        <p className="text-xs font-bold text-[#021526] mt-0.5">{req.refund_percentage ?? 100}%</p>
                      </div>
                    </div>

                    {/* Pricing Matrix */}
                    <div className="flex flex-wrap items-center gap-3 text-xs">
                      <div className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-800 font-medium">
                        Standard Rate: <strong className="font-bold text-[#021526]">₹{req.price_per_hour}</strong>/hour
                      </div>
                      {req.peak_hours_price && (
                        <div className="px-3 py-1.5 rounded-lg bg-amber-50 text-amber-900 font-medium border border-amber-200">
                          Peak Rate: <strong className="font-bold">₹{req.peak_hours_price}</strong>/hour
                          {req.peak_hours_start && req.peak_hours_end && (
                            <span className="text-[11px] text-amber-700 ml-1">
                              ({req.peak_hours_start} - {req.peak_hours_end})
                            </span>
                          )}
                        </div>
                      )}
                      {req.weekend_price && (
                        <div className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-900 font-medium border border-blue-200">
                          Weekend Rate: <strong className="font-bold">₹{req.weekend_price}</strong>/hour
                        </div>
                      )}
                      {req.same_physical_sports && req.parent_court_name && (
                        <div className="px-3 py-1.5 rounded-lg bg-purple-50 text-purple-900 font-medium border border-purple-200">
                          Physical Multi-sport shared with: <strong>{req.parent_court_name}</strong>
                        </div>
                      )}
                    </div>

                    {/* Rejection Note Alert Banner */}
                    {isRejected && req.rejection_reason && (
                      <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5">
                        <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-rose-900">Rejection Feedback Sent to Vendor:</p>
                          <p className="mt-0.5 text-rose-700">{req.rejection_reason}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Actions Column */}
                  <div className="flex flex-col sm:flex-row lg:flex-col items-end justify-center gap-2 lg:min-w-[180px] shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-[#E5E7EB]">
                    {isPending ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setApprovingRequest(req)}
                          className="w-full px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                        >
                          <Check className="h-4 w-4" />
                          <span>Approve Court</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setRejectingRequest(req);
                            setRejectionReason('INCOMPLETE_DETAILS');
                            setRejectionNote('');
                            setReviewError(null);
                          }}
                          className="w-full px-4 py-2.5 rounded-xl border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <X className="h-4 w-4" />
                          <span>Reject with Reason</span>
                        </button>
                      </>
                    ) : isApproved ? (
                      <div className="w-full text-center space-y-2">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 w-full justify-center">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          <span>Court Active</span>
                        </div>
                        <Link
                          href="/admin/venues"
                          className="text-[11px] text-[#5F6368] hover:text-[#021526] font-semibold flex items-center justify-center gap-1 hover:underline"
                        >
                          <span>Manage in Venues</span>
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      </div>
                    ) : (
                      <div className="w-full space-y-2">
                        <button
                          type="button"
                          onClick={() => setApprovingRequest(req)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Check className="h-3.5 w-3.5" />
                          <span>Re-evaluate &amp; Approve</span>
                        </button>
                        <p className="text-[11px] text-center text-[#5F6368]">
                          Vendor can edit &amp; resubmit
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CONFIRM APPROVE MODAL */}
      {approvingRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#E5E7EB] space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#021526]">Approve Court Addition</h3>
                  <p className="text-xs text-[#5F6368]">Unique ID: {approvingRequest.id}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setApprovingRequest(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl text-xs space-y-1.5 border border-slate-200">
              <p className="font-bold text-[#021526]">{approvingRequest.court_name}</p>
              <p className="text-slate-600">Venue: <strong>{approvingRequest.venue_name}</strong></p>
              <p className="text-slate-600">Sports: <strong>{(approvingRequest.sports || []).join(', ')}</strong> | Type: <strong>{approvingRequest.type || 'Standard'}</strong></p>
              <p className="text-slate-600">Base Hourly Rate: <strong>₹{approvingRequest.price_per_hour}</strong></p>
            </div>

            <p className="text-xs text-[#5F6368]">
              Approving this request will immediately mark the court as <strong>Active &amp; Operational</strong> on the vendor dashboard and allow slot bookings.
            </p>

            {reviewError && (
              <p className="text-xs text-rose-600 font-semibold bg-rose-50 p-2 rounded-lg border border-rose-200">
                {reviewError}
              </p>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setApprovingRequest(null)}
                disabled={isSubmittingReview}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleApprove(approvingRequest)}
                disabled={isSubmittingReview}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                {isSubmittingReview ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                <span>Confirm &amp; Activate</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECT MODAL */}
      {rejectingRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#E5E7EB] space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#021526]">Reject Court Request</h3>
                  <p className="text-xs text-[#5F6368]">Unique ID: {rejectingRequest.id}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRejectingRequest(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl text-xs space-y-1 border border-slate-200">
              <p className="font-bold text-[#021526]">{rejectingRequest.court_name}</p>
              <p className="text-slate-600">Venue: {rejectingRequest.venue_name}</p>
            </div>

            {/* Select Reason */}
            <div>
              <label htmlFor={reasonSelectId} className="block text-xs font-bold text-[#021526] mb-1.5">
                Rejection Category
              </label>
              <select
                id={reasonSelectId}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full rounded-xl bg-white border border-[#E5E7EB] px-3.5 py-2 text-xs text-[#021526] focus:border-[#F94001] focus:ring-1 focus:ring-[#F94001] outline-none"
              >
                {REJECTION_REASONS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Rejection Note */}
            <div>
              <label htmlFor={rejectionNoteId} className="block text-xs font-bold text-[#021526] mb-1.5">
                Feedback / Resubmission Instructions for Vendor
              </label>
              <textarea
                id={rejectionNoteId}
                rows={3}
                placeholder="Specify required corrections so vendor can edit and resubmit..."
                value={rejectionNote}
                onChange={(e) => setRejectionNote(e.target.value)}
                className="w-full rounded-xl bg-white border border-[#E5E7EB] p-3 text-xs text-[#021526] focus:border-[#F94001] focus:ring-1 focus:ring-[#F94001] outline-none"
              />
              <p className="text-[11px] text-[#5F6368] mt-1">
                This explanation will be displayed to the vendor so they can make corrections and click <strong>&quot;Edit &amp; Resubmit&quot;</strong>.
              </p>
            </div>

            {reviewError && (
              <p className="text-xs text-rose-600 font-semibold bg-rose-50 p-2 rounded-lg border border-rose-200">
                {reviewError}
              </p>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setRejectingRequest(null)}
                disabled={isSubmittingReview}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReject}
                disabled={isSubmittingReview}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                {isSubmittingReview ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                <span>Reject &amp; Notify Vendor</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST PORTAL */}
      {mounted && toastMessage && typeof document !== 'undefined' && createPortal(
        <div className="fixed bottom-6 right-6 z-[100000] max-w-md p-4 rounded-2xl bg-[#021526] text-white border border-emerald-500/30 shadow-2xl flex items-start gap-3.5 animate-in slide-in-from-bottom duration-300 pointer-events-auto">
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <ShieldAlert className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
          )}
          <div className="flex-1 text-xs">
            <p className="font-bold text-sm leading-tight text-white mb-0.5">{toastMessage.title}</p>
            <p className="text-slate-300 leading-relaxed">{toastMessage.description}</p>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
            title="Close notification"
          >
            <X className="h-4 w-4" />
          </button>
        </div>,
        document.body
      )}
    </div>
  );
}
