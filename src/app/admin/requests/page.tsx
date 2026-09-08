'use client';

import React, { useState, useEffect, useCallback, useId } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import {
  Inbox,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  AlertCircle,
  Loader2,
  Mail,
  Check,
  Eye,
  Copy,
  RefreshCw,
  ShieldAlert,
  Calendar,
  MapPin,
  Phone,
  Layers,
  Link2,
  X,
  Trophy,
  ArrowUpRight,
  Building2,
} from 'lucide-react';
import {
  adminApi,
  PartnerRequestItem,
} from '@/lib/api';

const REJECTION_REASON_OPTIONS = [
  { value: 'SUSPICIOUS', label: 'Suspicious activity' },
  { value: 'FAKE', label: 'Fake / duplicate listing' },
  { value: 'INCOMPLETE', label: 'Incomplete information' },
  { value: 'NOT_ELIGIBLE', label: 'Does not meet requirements' },
  { value: 'OTHER', label: 'Other' },
];

export default function PartnerRequestsPage() {
  const [requests, setRequests] = useState<PartnerRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 1. Right Slide-out Drawer State
  const [activeRequest, setActiveRequest] = useState<PartnerRequestItem | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isResendingLink, setIsResendingLink] = useState(false);

  // 2. Approve Pop-up Modal State
  const [approvingRequest, setApprovingRequest] = useState<PartnerRequestItem | null>(null);
  const [customOnboardingLink, setCustomOnboardingLink] = useState('');
  const [isSubmittingApproval, setIsSubmittingApproval] = useState(false);
  const [approveError, setApproveError] = useState<string | null>(null);

  // 3. Reject Pop-up Modal State
  const [rejectingRequest, setRejectingRequest] = useState<PartnerRequestItem | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('INCOMPLETE');
  const [rejectionNote, setRejectionNote] = useState<string>('');
  const [isSubmittingRejection, setIsSubmittingRejection] = useState(false);
  const [rejectionError, setRejectionError] = useState<string | null>(null);

  // Toast Banner State
  const [toastMessage, setToastMessage] = useState<{
    type: 'success' | 'error';
    title: string;
    description: string;
  } | null>(null);

  const onboardingLinkId = useId();
  const reasonSelectId = useId();
  const rejectionNoteId = useId();

  // Fetch Requests
  const loadRequests = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.getRequests(
        selectedStatus === 'ALL' ? undefined : selectedStatus,
      );
      setRequests(data);
    } catch (e) {
      console.error('Failed to load requests', e);
    } finally {
      setLoading(false);
    }
  }, [selectedStatus]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  // Close modals or drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (approvingRequest) setApprovingRequest(null);
        else if (rejectingRequest) setRejectingRequest(null);
        else if (activeRequest) setActiveRequest(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeRequest, approvingRequest, rejectingRequest]);

  // Open Details Slide-Out Drawer
  const handleOpenDetails = (req: PartnerRequestItem) => {
    setActiveRequest(req);
    setCopiedLink(false);
  };

  // Copy Onboarding Link Action
  const handleCopyOnboardingLink = (link: string) => {
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Resend Onboarding Link from Details Drawer
  const handleResendLinkFromDetails = async (req: PartnerRequestItem) => {
    setIsResendingLink(true);
    try {
      const res = await adminApi.resendOnboardingLink(req.request_id);
      setToastMessage({
        type: 'success',
        title: 'Onboarding link resent.',
        description: `A fresh invitation link was generated and emailed to ${req.requester_email}.`,
      });
      // Update local active request state
      if (activeRequest && activeRequest.request_id === req.request_id) {
        setActiveRequest({
          ...activeRequest,
          approval_access_link: res.onboarding_link,
          onboarding_token_expiry: res.expires_at,
          onboarding_link_sent_at: res.link_sent_at,
          raw_onboarding_token: res.raw_token,
        });
      }
      await loadRequests();
    } catch (e: unknown) {
      const err = e as Error;
      setToastMessage({
        type: 'error',
        title: 'Failed to resend onboarding link.',
        description: err.message || 'Network error occurred.',
      });
    } finally {
      setIsResendingLink(false);
    }
  };

  // Helper to generate 64-char hex SHA-256 cryptographic token
  const generateSecureHexToken = () => {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
      const arr = new Uint8Array(32);
      window.crypto.getRandomValues(arr);
      return Array.from(arr, (b) => b.toString(16).padStart(2, '0')).join('');
    }
    return Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  };

  // Open Approve Pop-up Modal
  const handleOpenApprove = (req: PartnerRequestItem) => {
    setApprovingRequest(req);
    const existingToken =
      req.raw_onboarding_token ||
      (req.approval_access_link && req.approval_access_link.includes('/onboarding/')
        ? req.approval_access_link.split('/onboarding/')[1]?.trim()
        : null);

    const token =
      existingToken && existingToken.length >= 32
        ? existingToken
        : generateSecureHexToken();

    const baseUrl =
      typeof window !== 'undefined' && window.location.origin
        ? window.location.origin
        : 'http://localhost:3000';

    setCustomOnboardingLink(`${baseUrl}/onboarding/${token}`);
    setApproveError(null);
  };

  // Submit Approval from Pop-up Modal
  const handleConfirmApprove = async () => {
    if (!approvingRequest) return;
    setIsSubmittingApproval(true);
    setApproveError(null);
    try {
      await adminApi.updateRequestStatus(approvingRequest.request_id, {
        request_status: 'APPROVED',
        approval_access_link: customOnboardingLink.trim() || undefined,
      });

      setToastMessage({
        type: 'success',
        title: 'Approved — onboarding link sent.',
        description: `Onboarding invite with 7-day token hash was dispatched to ${approvingRequest.requester_email}. Outbox log recorded.`,
      });

      // Update active request in drawer if open
      if (activeRequest && activeRequest.request_id === approvingRequest.request_id) {
        setActiveRequest({
          ...activeRequest,
          request_status: 'APPROVED',
          approval_access_link: customOnboardingLink.trim() || undefined,
          onboarding_token_expiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          onboarding_link_sent_at: new Date().toISOString(),
        });
      }

      setApprovingRequest(null);
      await loadRequests();
    } catch (e: unknown) {
      const err = e as Error;
      setApproveError(err.message || 'Server action failed to complete approval.');
    } finally {
      setIsSubmittingApproval(false);
    }
  };

  // Open Reject Pop-up Modal
  const handleOpenReject = (req: PartnerRequestItem) => {
    setRejectingRequest(req);
    setRejectionReason('INCOMPLETE');
    setRejectionNote('');
    setRejectionError(null);
  };

  // Submit Rejection from Pop-up Modal
  const handleConfirmReject = async () => {
    if (!rejectingRequest) return;
    setRejectionError(null);

    // Validation: if "OTHER" selected, description note is required
    if (rejectionReason === 'OTHER' && !rejectionNote.trim()) {
      setRejectionError('Please provide a description note when selecting "Other" as the rejection reason.');
      return;
    }

    setIsSubmittingRejection(true);
    try {
      await adminApi.updateRequestStatus(rejectingRequest.request_id, {
        request_status: 'REJECTED',
        rejection_reason: rejectionReason,
        rejection_note: rejectionNote.trim() || undefined,
        admin_id: 'admin_super_01',
      });

      setToastMessage({
        type: 'success',
        title: 'Partner request rejected & email sent.',
        description: `Request ${rejectingRequest.request_id} was marked as REJECTED. Automated notification email with the rejection reason was dispatched to ${rejectingRequest.requester_email}.`,
      });

      // Update active request in drawer if open
      if (activeRequest && activeRequest.request_id === rejectingRequest.request_id) {
        setActiveRequest({
          ...activeRequest,
          request_status: 'REJECTED',
          rejection_reason: rejectionReason as PartnerRequestItem['rejection_reason'],
          rejection_note: rejectionNote.trim() || undefined,
          rejected_at: new Date().toISOString(),
          rejected_by_admin_id: 'admin_super_01',
        });
      }

      setRejectingRequest(null);
      await loadRequests();
    } catch (e: unknown) {
      const err = e as Error;
      setRejectionError(err.message || 'Failed to submit rejection.');
    } finally {
      setIsSubmittingRejection(false);
    }
  };

  // Filtered Requests
  const filteredRequests = requests.filter((r) => {
    if (selectedType !== 'ALL') {
      const type = r.request_type || 'ONBOARDING';
      if (type !== selectedType) return false;
    }
    const query = searchQuery.toLowerCase();
    return (
      r.request_id.toLowerCase().includes(query) ||
      r.venue_name.toLowerCase().includes(query) ||
      r.requester_name.toLowerCase().includes(query) ||
      (r.district && r.district.toLowerCase().includes(query)) ||
      (r.state && r.state.toLowerCase().includes(query)) ||
      (r.mobile_number && r.mobile_number.includes(query)) ||
      (r.bank_details?.bank_name && r.bank_details.bank_name.toLowerCase().includes(query)) ||
      (r.court_details?.court_name && r.court_details.court_name.toLowerCase().includes(query))
    );
  });

  return (
    <div className="space-y-6" suppressHydrationWarning>
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E7EB] pb-5">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-[#021526] font-display flex items-center gap-2.5">
            <Inbox className="h-6 w-6 text-[#F94001]" />
            Partner Requests Review Queue
          </h1>
          <p className="text-xs text-[#5F6368] mt-1">
            Evaluate inbound turf partnerships, bank account changes &amp; new court listing requests. Click View to inspect and approve or reject.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadRequests}
            className="p-2 rounded-xl border border-[#E5E7EB] bg-white text-[#5F6368] hover:text-[#021526] transition-all shadow-xs cursor-pointer"
            title="Refresh Table"
            suppressHydrationWarning
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* TOAST NOTIFICATION POPUP */}
      {mounted && toastMessage && typeof document !== 'undefined' && createPortal(
        <div className="fixed bottom-6 right-6 z-[100000] max-w-md p-4 rounded-2xl bg-[#021526] text-white border border-emerald-500/30 shadow-2xl flex items-start gap-3.5 animate-in slide-in-from-bottom duration-300 pointer-events-auto">
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
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

      {/* FILTER & SEARCH BAR */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4" suppressHydrationWarning>
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Request Type Chips */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-white border border-[#E5E7EB] shadow-xs overflow-x-auto scrollbar-none" suppressHydrationWarning>
            {[
              { id: 'ALL', label: 'All Types' },
              { id: 'ONBOARDING', label: 'Onboarding' },
              { id: 'BANK_CHANGE', label: 'Bank Changes' },
              { id: 'COURT_CHANGE', label: 'Court Requests' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedType(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedType === tab.id
                    ? 'bg-[#021526] text-white shadow-xs'
                    : 'text-[#5F6368] hover:text-[#021526] hover:bg-[#F3F4F4]'
                }`}
                suppressHydrationWarning
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-white border border-[#E5E7EB] shadow-xs overflow-x-auto scrollbar-none" suppressHydrationWarning>
            {[
              { id: 'ALL', label: 'All Status' },
              { id: 'SUBMITTED', label: 'Pending Review' },
              { id: 'APPROVED', label: 'Approved' },
              { id: 'REJECTED', label: 'Rejected' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedStatus(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedStatus === tab.id
                    ? 'bg-[#F94001] text-white shadow-xs'
                    : 'text-[#5F6368] hover:text-[#021526] hover:bg-[#F3F4F4]'
                }`}
                suppressHydrationWarning
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search Input */}
        <div className="relative w-full lg:w-72">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-[#5F6368]" />
          <input
            type="text"
            placeholder="Search venue, ID, bank, court..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl bg-white border border-[#E5E7EB] pl-10 pr-4 py-2 text-xs text-[#021526] placeholder-[#5F6368] focus:border-[#F94001] focus:outline-none focus:ring-1 focus:ring-[#F94001] transition-all shadow-xs"
            suppressHydrationWarning
          />
        </div>
      </div>

      {/* DATA TABLE */}
      <div id="partner-requests-table" className="rounded-2xl bg-white border border-[#CBD5E1] shadow-xs overflow-hidden scroll-mt-24 transition-all duration-300">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[1100px]" suppressHydrationWarning>
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-[#F8F9FA] text-[#5F6368] font-bold text-[11px] uppercase tracking-wider">
                <th className="py-3.5 px-4 w-[120px]">ID</th>
                <th className="py-3.5 px-4 w-[210px]">Venue</th>
                <th className="py-3.5 px-4 w-[200px]">Owner</th>
                <th className="py-3.5 px-4 w-[140px]">Location</th>
                <th className="py-3.5 px-4 w-[170px]">Sports</th>
                <th className="py-3.5 px-4 w-[160px]">Date</th>
                <th className="py-3.5 px-4 w-[130px]">Status</th>
                <th className="py-3.5 px-4 w-[80px] text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#5F6368]">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-[#F94001] mb-2" />
                    <p className="font-semibold text-xs text-[#021526]">Loading partner requests...</p>
                  </td>
                </tr>
              ) : filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#5F6368]">
                    <Inbox className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-bold text-xs text-[#021526]">No partner requests found</p>
                    <p className="text-[11px] text-[#5F6368] mt-0.5">Try selecting a different filter or clearing search.</p>
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => {
                  const reqDate = req.created_at ? new Date(req.created_at) : new Date();
                  const formattedDate = !isNaN(reqDate.getTime())
                    ? reqDate.toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })
                    : '—';
                  const formattedTime = !isNaN(reqDate.getTime())
                    ? reqDate.toLocaleTimeString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true,
                      })
                    : '—';

                  return (
                    <tr
                      key={req.request_id}
                      className="hover:bg-[#FFF8F5]/60 transition-colors"
                    >
                      {/* ID */}
                      <td className="py-3.5 px-4 align-middle">
                        <div className="space-y-1">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-orange-50 text-[#F94001] font-mono font-bold text-xs border border-orange-200/60">
                            {req.request_id}
                          </span>
                          {req.request_type === 'BANK_CHANGE' && (
                            <span className="block text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded w-fit">
                              Bank Change
                            </span>
                          )}
                          {req.request_type === 'COURT_CHANGE' && (
                            <span className="block text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded w-fit">
                              Court Request
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Venue */}
                      <td className="py-3.5 px-4 align-middle">
                        <p className="font-bold text-[#021526] text-xs leading-snug">{req.venue_name}</p>
                        {req.request_type === 'BANK_CHANGE' && req.bank_details ? (
                          <p className="text-[11px] text-blue-700 font-medium flex items-center gap-1 mt-0.5">
                            <Building2 className="h-3 w-3 shrink-0" />
                            <span>{req.bank_details.bank_name} •••• {req.bank_details.account_number.slice(-4)}</span>
                          </p>
                        ) : req.request_type === 'COURT_CHANGE' && req.court_details ? (
                          <p className="text-[11px] text-amber-800 font-medium flex items-center gap-1 mt-0.5">
                            <Trophy className="h-3 w-3 shrink-0" />
                            <span>{req.court_details.court_name} (₹{req.court_details.hourly_rate}/hr)</span>
                          </p>
                        ) : (
                          <p className="text-[11px] text-[#5F6368] flex items-center gap-1 mt-0.5">
                            <Layers className="h-3 w-3 text-slate-400 shrink-0" />
                            <span>{req.number_of_courts} Courts Facility</span>
                          </p>
                        )}
                      </td>

                      {/* Contact */}
                      <td className="py-3.5 px-4 align-middle">
                        <p className="font-bold text-[#021526] text-xs">{req.requester_name}</p>
                        <p className="text-[11px] text-[#5F6368] font-mono flex items-center gap-1 mt-0.5">
                          <Phone className="h-3 w-3 text-slate-400 shrink-0" />
                          <span>+91 {req.mobile_number}</span>
                        </p>
                        <p className="text-[10px] text-slate-400 truncate max-w-[180px] mt-0.5">{req.requester_email}</p>
                      </td>

                      {/* Location */}
                      <td className="py-3.5 px-4 align-middle">
                        <p className="font-semibold text-[#021526] text-xs flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                          <span>{req.district || 'Coimbatore'}</span>
                        </p>
                        <p className="text-[11px] text-[#5F6368] ml-4">{req.state || 'Tamil Nadu'}</p>
                      </td>

                      {/* Sports Badges */}
                      <td className="py-3.5 px-4 align-middle">
                        {req.request_type === 'BANK_CHANGE' ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                            Bank Account Audit
                          </span>
                        ) : req.request_type === 'COURT_CHANGE' ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200">
                            {req.court_details?.sport_type || 'Court Spec'}
                          </span>
                        ) : (
                          <div className="flex flex-wrap gap-1 max-w-[180px]">
                            {req.sports?.map((sp) => (
                              <span
                                key={sp}
                                className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#F3F4F4] text-[#021526] border border-[#E5E7EB]"
                              >
                                {sp}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>

                      {/* Date & Time */}
                      <td className="py-3.5 px-4 align-middle whitespace-nowrap" suppressHydrationWarning>
                        <p className="font-bold text-[#021526] text-xs flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-[#F94001] shrink-0" />
                          <span>{formattedDate}</span>
                        </p>
                        <p className="text-[11px] text-[#5F6368] font-mono flex items-center gap-1.5 mt-0.5">
                          <Clock className="h-3 w-3 text-slate-400 shrink-0" />
                          <span>{formattedTime}</span>
                        </p>
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-4 align-middle">
                        {req.request_status === 'SUBMITTED' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-200">
                            <Clock className="h-3 w-3 text-amber-700" /> SUBMITTED
                          </span>
                        )}
                        {req.request_status === 'APPROVED' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-900 border border-emerald-200">
                            <CheckCircle2 className="h-3 w-3 text-emerald-700" /> APPROVED
                          </span>
                        )}
                        {req.request_status === 'REJECTED' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-900 border border-rose-200">
                            <XCircle className="h-3 w-3 text-rose-700" /> REJECTED
                          </span>
                        )}
                      </td>

                      {/* Action Column: ONLY Eye Icon */}
                      <td className="py-3.5 px-4 align-middle text-center">
                        <button
                          type="button"
                          onClick={() => handleOpenDetails(req)}
                          title="View Full Dossier"
                          className="p-2 rounded-xl border border-[#CBD5E1] bg-white hover:bg-[#FFF1EC] hover:border-[#F94001] text-[#5F6368] hover:text-[#F94001] transition-all shadow-xs inline-flex items-center justify-center group cursor-pointer active:scale-95"
                        >
                          <Eye className="h-4 w-4 group-hover:scale-110 transition-all" />
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

      {/* ========================================================================= */}
      {/* 1. SLIDE-OUT DRAWER FROM RIGHT SIDE (OPENED BY EYE ICON) */}
      {/* ========================================================================= */}
      {mounted && activeRequest && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] top-0 left-0 right-0 bottom-0 w-screen h-screen overflow-hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-950/75 backdrop-blur-sm transition-opacity animate-in fade-in"
            onClick={() => setActiveRequest(null)}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-xl bg-white shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
              {/* Drawer Top Header */}
              <div className="p-6 border-b border-[#E5E7EB] bg-white sticky top-0 z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-[#5F6368] uppercase tracking-wider font-mono">
                      Partner Request Dossier
                    </span>
                    <h3 className="text-lg font-black text-[#021526] font-display flex items-center gap-2 mt-0.5">
                      <span className="font-mono text-[#F94001]">{activeRequest.request_id}</span>
                      <span>&bull;</span>
                      <span className="truncate max-w-[280px]">{activeRequest.venue_name}</span>
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveRequest(null)}
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-[#F3F4F4] transition-all"
                    title="Close Drawer"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Drawer Scrollable Body Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
                {/* Facility & Location Summary Card */}
                <div className="p-4 rounded-2xl bg-[#F8F9FA] border border-[#E5E7EB] space-y-3 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-base text-[#021526]">
                      {activeRequest.venue_name}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-[11px] font-bold border ${
                        activeRequest.request_status === 'APPROVED'
                          ? 'bg-emerald-100 text-emerald-900 border-emerald-200'
                          : activeRequest.request_status === 'REJECTED'
                          ? 'bg-rose-100 text-rose-900 border-rose-200'
                          : 'bg-amber-100 text-amber-900 border-amber-200'
                      }`}
                    >
                      {activeRequest.request_status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[#5F6368] pt-1">
                    <div className="flex items-center gap-1.5">
                      <Layers className="h-3.5 w-3.5 text-[#F94001] shrink-0" />
                      <span>Type: <strong className="text-[#021526]">{activeRequest.request_type === 'BANK_CHANGE' ? 'Bank Change' : activeRequest.request_type === 'COURT_CHANGE' ? 'Court Addition' : `${activeRequest.number_of_courts || 1} Grounds Onboarding`}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-[#F94001] shrink-0" />
                      <span>Submitted: <strong className="text-[#021526]">{new Date(activeRequest.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</strong></span>
                    </div>
                    <div className="col-span-2 flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-[#F94001] shrink-0" />
                      <span>Location: <strong className="text-[#021526]">{activeRequest.district || 'Coimbatore'}, {activeRequest.state || 'Tamil Nadu'}</strong></span>
                    </div>
                  </div>
                </div>

                {/* BANK DETAILS CHANGE AUDIT DOSSIER */}
                {activeRequest.request_type === 'BANK_CHANGE' && activeRequest.bank_details && (
                  <div className="p-4 sm:p-5 rounded-2xl border border-blue-200 bg-blue-50/50 space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between border-b border-blue-200 pb-2.5">
                      <div className="flex items-center gap-2 text-blue-950 font-bold">
                        <Building2 className="h-4 w-4 text-blue-700" />
                        <span className="text-sm font-extrabold">Proposed Bank Account Specifications</span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-900 border border-blue-200 font-mono">
                        {activeRequest.bank_details.account_type || 'Current Account'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-500 block">Bank Name</span>
                        <span className="font-bold text-[#021526] text-[13px]">{activeRequest.bank_details.bank_name}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-500 block">Beneficiary Name</span>
                        <span className="font-bold text-[#021526] text-[13px]">{activeRequest.bank_details.account_holder_name}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-500 block">Account Number</span>
                        <span className="font-mono font-bold text-[#021526] text-xs">
                          {activeRequest.bank_details.account_number}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-500 block">IFSC Code</span>
                        <span className="font-mono font-bold text-[#021526]">{activeRequest.bank_details.ifsc_code}</span>
                      </div>
                      {activeRequest.bank_details.branch_name && (
                        <div className="col-span-2">
                          <span className="text-[10px] font-bold uppercase text-slate-500 block">Branch</span>
                          <span className="font-medium text-[#021526]">{activeRequest.bank_details.branch_name}</span>
                        </div>
                      )}
                      <div className="col-span-2 p-3 rounded-xl bg-white border border-blue-200 text-xs space-y-1">
                        <span className="text-[10px] font-bold uppercase text-slate-500 block">Reason for Update</span>
                        <span className="text-slate-700 font-medium leading-relaxed block">{activeRequest.bank_details.reason_for_change}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* COURT ADDITION AUDIT DOSSIER */}
                {activeRequest.request_type === 'COURT_CHANGE' && activeRequest.court_details && (
                  <div className="p-4 sm:p-5 rounded-2xl border border-amber-200 bg-amber-50/50 space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between border-b border-amber-200 pb-2.5">
                      <div className="flex items-center gap-2 text-amber-950 font-bold">
                        <Trophy className="h-4 w-4 text-amber-700" />
                        <span className="text-sm font-extrabold">Proposed Court / Pitch Specifications</span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200">
                        {activeRequest.court_details.sport_type}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-500 block">Court Name</span>
                        <span className="font-bold text-[#021526] text-[13px]">{activeRequest.court_details.court_name}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-500 block">Base Hourly Rate</span>
                        <span className="font-bold text-[#021526] text-[13px]">₹{activeRequest.court_details.hourly_rate} / hr</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-500 block">Surface Material</span>
                        <span className="font-medium text-[#021526]">{activeRequest.court_details.surface_type}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-500 block">Dimensions</span>
                        <span className="font-medium text-[#021526]">{activeRequest.court_details.court_dimensions || 'Standard Arena'}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-[10px] font-bold uppercase text-slate-500 block">Environment &amp; Floodlighting</span>
                        <span className="font-medium text-[#021526]">
                          {activeRequest.court_details.indoor_outdoor === 'INDOOR' ? 'Indoor Arena' : 'Outdoor Pitch'} · {activeRequest.court_details.lighting_available ? 'Floodlights Enabled' : 'Daylight Only'}
                        </span>
                      </div>
                      {activeRequest.court_details.remarks && (
                        <div className="col-span-2 p-3 rounded-xl bg-white border border-amber-200 text-xs space-y-1">
                          <span className="text-[10px] font-bold uppercase text-slate-500 block">Operational Remarks</span>
                          <span className="text-slate-700 font-medium leading-relaxed block">{activeRequest.court_details.remarks}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Owner & Contact Information */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Left Card: Owner & Authorized Person */}
                  <div className="p-4 sm:p-5 rounded-2xl border border-[#E5E7EB] bg-white space-y-3 shadow-2xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-2.5">
                        <span className="text-[10px] font-bold text-[#5F6368] uppercase tracking-wider font-mono">
                          Owner &amp; Authorized Person
                        </span>
                        <span className="shrink-0 whitespace-nowrap text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-md">
                          Primary Contact
                        </span>
                      </div>

                      <div className="flex items-center gap-3 pt-3">
                        <div className="h-10 w-10 rounded-2xl bg-[#021526] text-white flex items-center justify-center font-black text-sm uppercase shrink-0 shadow-2xs">
                          {(activeRequest.requester_name || 'Y')[0]}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-black text-sm text-[#021526] leading-tight truncate">
                            {activeRequest.requester_name || 'yuteka'}
                          </p>
                          <p className="text-[11px] text-[#5F6368] font-medium">Authorized Turf Owner</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 pt-1 text-xs">
                      {/* Direct Clickable Phone */}
                      <a
                        href={`tel:+91${activeRequest.mobile_number || '6369591821'}`}
                        className="p-2.5 rounded-xl bg-[#F8F9FA] hover:bg-slate-100/80 border border-[#E5E7EB] hover:border-slate-300 flex items-center justify-between gap-2 transition-all group cursor-pointer"
                        title="Click to Call / WhatsApp"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Phone className="h-3.5 w-3.5 text-slate-500 group-hover:text-[#F94001] transition-colors shrink-0" />
                          <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold">Phone:</span>
                          <span className="font-mono font-bold text-xs text-[#021526] group-hover:text-[#F94001] transition-colors">
                            +91 {activeRequest.mobile_number || '6369591821'}
                          </span>
                        </div>
                        <ArrowUpRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-[#F94001] transition-colors shrink-0" />
                      </a>

                      {/* Direct Clickable Email */}
                      <a
                        href={`mailto:${activeRequest.requester_email || 'yutekahema003@gmail.com'}`}
                        className="p-2.5 rounded-xl bg-[#F8F9FA] hover:bg-slate-100/80 border border-[#E5E7EB] hover:border-slate-300 flex items-center justify-between gap-2 transition-all group cursor-pointer truncate"
                        title="Click to send Email"
                      >
                        <div className="flex items-center gap-2 min-w-0 truncate">
                          <Mail className="h-3.5 w-3.5 text-slate-500 group-hover:text-[#F94001] transition-colors shrink-0" />
                          <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold shrink-0">Email:</span>
                          <span className="text-xs text-slate-700 group-hover:text-[#F94001] font-medium transition-colors truncate">
                            {activeRequest.requester_email || 'yutekahema003@gmail.com'}
                          </span>
                        </div>
                        <ArrowUpRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-[#F94001] transition-colors shrink-0 ml-1" />
                      </a>
                    </div>
                  </div>

                  {/* Right Card: Sports Setup or Request Context */}
                  <div className="p-4 sm:p-5 rounded-2xl border border-[#E5E7EB] bg-white space-y-3 shadow-2xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-2.5">
                        <span className="text-[10px] font-bold text-[#5F6368] uppercase tracking-wider font-mono">
                          {activeRequest.request_type === 'BANK_CHANGE'
                            ? 'Request Audit Classification'
                            : activeRequest.request_type === 'COURT_CHANGE'
                            ? 'Proposed Sport Details'
                            : 'Sports & Facility Setup'}
                        </span>
                        <span className="shrink-0 whitespace-nowrap text-[10px] font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-md">
                          {activeRequest.request_type === 'BANK_CHANGE'
                            ? 'Finance Update'
                            : activeRequest.request_type === 'COURT_CHANGE'
                            ? (activeRequest.court_details?.sport_type || 'Court Addition')
                            : `${activeRequest.sports?.length || 1} ${activeRequest.sports?.length === 1 ? 'Sport' : 'Sports'}`}
                        </span>
                      </div>

                      {activeRequest.request_type === 'BANK_CHANGE' ? (
                        <div className="pt-3 space-y-2 text-xs">
                          <p className="text-slate-600 leading-relaxed">
                            Financial payout destination change submitted for venue <strong>{activeRequest.venue_name}</strong>.
                          </p>
                          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] font-mono space-y-1">
                            <div>Entity: <span className="font-bold text-[#021526]">{activeRequest.bank_details?.account_holder_name}</span></div>
                            <div>Bank: <span className="font-bold text-[#021526]">{activeRequest.bank_details?.bank_name}</span></div>
                          </div>
                        </div>
                      ) : activeRequest.request_type === 'COURT_CHANGE' ? (
                        <div className="pt-3 space-y-2 text-xs">
                          <p className="text-slate-600 leading-relaxed">
                            New court addition requested for <strong>{activeRequest.court_details?.court_name}</strong>.
                          </p>
                          <div className="flex items-center gap-2 pt-1">
                            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#F8F9FA] text-[#021526] border border-[#CBD5E1]">
                              {activeRequest.court_details?.sport_type}
                            </span>
                            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200">
                              ₹{activeRequest.court_details?.hourly_rate}/hr
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="pt-3 space-y-2">
                          <span className="text-[10px] uppercase font-mono font-semibold text-slate-400 block">
                            Offered Sports
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {(activeRequest.sports || []).map((sp) => (
                              <span
                                key={sp}
                                className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold bg-[#F8F9FA] text-[#021526] border border-[#CBD5E1] shadow-2xs"
                              >
                                {sp}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Location Google Maps Link */}
                {activeRequest.venue_location && (
                  <div className="p-4 rounded-2xl border border-[#E5E7EB] bg-white space-y-1.5 shadow-2xs">
                    <span className="text-[10px] font-bold text-[#5F6368] uppercase tracking-wider">
                      Google Maps Facility Location
                    </span>
                    <a
                      href={activeRequest.venue_location}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-[#F94001] font-mono hover:underline flex items-center gap-1.5 truncate"
                    >
                      <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                      {activeRequest.venue_location}
                    </a>
                  </div>
                )}

                {/* CONDITIONAL: ONBOARDING LINK STATUS IF APPROVED */}
                {activeRequest.request_status === 'APPROVED' && (!activeRequest.request_type || activeRequest.request_type === 'ONBOARDING') && (
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-emerald-900 font-bold">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        <span>Onboarding Link &amp; Invite Status</span>
                      </div>
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-200/70 text-emerald-900">
                        {activeRequest.onboarding_token_used_at ? 'Used' : 'Active (Single-Use)'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] text-emerald-900">
                      <div>
                        Sent Date:{' '}
                        <strong>
                          {activeRequest.onboarding_link_sent_at
                            ? new Date(activeRequest.onboarding_link_sent_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                            : 'On Approval'}
                        </strong>
                      </div>
                      <div>
                        Token Expiry:{' '}
                        <strong>
                          {activeRequest.onboarding_token_expiry
                            ? new Date(activeRequest.onboarding_token_expiry).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                            : '7 Days'}
                        </strong>
                      </div>
                    </div>

                    {activeRequest.approval_access_link && (
                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            readOnly
                            value={activeRequest.approval_access_link}
                            className="flex-1 rounded-xl border border-emerald-300 bg-white px-3 py-2 text-[11px] font-mono text-[#021526] select-all shadow-xs"
                          />
                          <button
                            type="button"
                            onClick={() => handleCopyOnboardingLink(activeRequest.approval_access_link!)}
                            className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition-all flex items-center gap-1 shrink-0 shadow-xs active:scale-95"
                          >
                            {copiedLink ? (
                              <>
                                <Check className="h-3.5 w-3.5" /> Copied
                              </>
                            ) : (
                              <>
                                <Copy className="h-3.5 w-3.5" /> Copy Link
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-emerald-200/60">
                      <span className="text-[10px] text-emerald-800">
                        Generate fresh token &amp; re-send:
                      </span>
                      <button
                        type="button"
                        disabled={isResendingLink}
                        onClick={() => handleResendLinkFromDetails(activeRequest)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 hover:text-emerald-950 underline disabled:opacity-50"
                      >
                        {isResendingLink ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Resending...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="h-3.5 w-3.5" /> Resend Onboarding Link
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* CONDITIONAL: APPROVED STATUS FOR BANK & COURT REQUESTS */}
                {activeRequest.request_status === 'APPROVED' && activeRequest.request_type && activeRequest.request_type !== 'ONBOARDING' && (
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
                    <div className="flex items-center gap-2 text-emerald-900 font-bold">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>
                        {activeRequest.request_type === 'BANK_CHANGE'
                          ? 'Bank Account Update Approved'
                          : 'Court Addition Request Approved'}
                      </span>
                    </div>
                    <p className="text-xs text-emerald-800 leading-relaxed">
                      The proposed specifications have been verified and approved by administration. An automated confirmation email was dispatched to <strong>{activeRequest.requester_email}</strong> and the status is synchronized on the vendor portal.
                    </p>
                  </div>
                )}

                {/* CONDITIONAL: REJECTION REASON DISPLAY */}
                {activeRequest.request_status === 'REJECTED' && (
                  <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-2.5">
                    <div className="flex items-center gap-2 text-rose-900 font-bold">
                      <ShieldAlert className="h-4 w-4 text-rose-600 shrink-0" />
                      <span>
                        {activeRequest.request_type === 'BANK_CHANGE'
                          ? 'Bank Details Reject Reason'
                          : activeRequest.request_type === 'COURT_CHANGE'
                          ? 'Court Details Reject Reason'
                          : 'Rejection Reason Audit Record'}
                      </span>
                    </div>
                    <p className="text-[11px] text-rose-800">
                      This exact rejection reason was dispatched via automated HTML email to <strong>{activeRequest.requester_email}</strong> and is displayed on the vendor support portal.
                    </p>
                    <div className="p-3.5 rounded-xl bg-white border border-rose-200 text-xs space-y-1.5 shadow-2xs">
                      <p>
                        <strong>Reason Category:</strong>{' '}
                        <span className="font-mono text-rose-700 font-bold">
                          {activeRequest.rejection_reason || 'INCOMPLETE'}
                        </span>
                      </p>
                      {activeRequest.rejection_note && (
                        <p>
                          <strong>
                            {activeRequest.request_type === 'BANK_CHANGE'
                              ? 'Bank Details Reject Note:'
                              : activeRequest.request_type === 'COURT_CHANGE'
                              ? 'Court Details Reject Note:'
                              : 'Rejection Note:'}
                          </strong>{' '}
                          <span className="text-[#021526] font-medium">{activeRequest.rejection_note}</span>
                        </p>
                      )}
                      {activeRequest.rejected_by_admin_id && (
                        <p className="text-[10px] text-slate-400 pt-1">
                          Rejected by: {activeRequest.rejected_by_admin_id} &bull; {activeRequest.rejected_at ? new Date(activeRequest.rejected_at).toLocaleString() : 'Recorded'}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Drawer Bottom Footer with APPROVE and REJECT Buttons with Strict Status Logic */}
              <div className="p-4 sm:p-6 border-t border-[#E5E7EB] bg-[#F8F9FA] flex items-center justify-between gap-3 sticky bottom-0 z-10">
                {/* 1. REJECT BUTTON LOGIC */}
                {activeRequest.request_status === 'APPROVED' ? (
                  <button
                    type="button"
                    disabled
                    title="Approved requests cannot be rejected as an onboarding invite has already been issued"
                    className="px-5 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-400 font-bold text-xs flex items-center gap-1.5 cursor-not-allowed opacity-60"
                  >
                    <XCircle className="h-4 w-4 text-slate-300" />
                    <span>Reject</span>
                  </button>
                ) : activeRequest.request_status === 'REJECTED' ? (
                  <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold">
                    <XCircle className="h-4 w-4 text-rose-600" />
                    <span>Request Rejected</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleOpenReject(activeRequest)}
                    className="px-5 py-2.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer"
                  >
                    <XCircle className="h-4 w-4" /> Reject
                  </button>
                )}

                {/* 2. APPROVE BUTTON LOGIC */}
                {activeRequest.request_status === 'APPROVED' ? (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span>Approved</span>
                    </div>
                    <button
                      type="button"
                      disabled={isResendingLink}
                      onClick={() => handleResendLinkFromDetails(activeRequest)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer disabled:opacity-50 transition-all"
                    >
                      {isResendingLink ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Resending...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-3.5 w-3.5" /> Resend Link
                        </>
                      )}
                    </button>
                  </div>
                ) : activeRequest.request_status === 'REJECTED' ? (
                  <button
                    type="button"
                    disabled
                    title="Rejected requests cannot be directly approved without partner re-application"
                    className="px-6 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-400 font-bold text-xs flex items-center gap-2 cursor-not-allowed opacity-60"
                  >
                    <Check className="h-4 w-4 text-slate-300" />
                    <span>Approve &amp; Send Link</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleOpenApprove(activeRequest)}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
                  >
                    <Check className="h-4 w-4" /> Approve &amp; Send Link
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ========================================================================= */}
      {/* 2. APPROVE POP-UP MODAL (TOP-LEVEL OVERLAY z-[10000]) */}
      {/* ========================================================================= */}
      {mounted && approvingRequest && typeof document !== 'undefined' && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="approve-modal-title"
          className="fixed inset-0 z-[10000] top-0 left-0 right-0 bottom-0 w-screen h-screen bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 border border-[#E5E7EB]">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
              <div className="flex items-center gap-2 text-emerald-700 font-bold text-base">
                <CheckCircle2 className="h-5 w-5" />
                <span id="approve-modal-title">
                  {approvingRequest.request_type === 'BANK_CHANGE'
                    ? 'Approve Bank Details Change'
                    : approvingRequest.request_type === 'COURT_CHANGE'
                    ? 'Approve Court Addition Request'
                    : 'Approve Partner Onboarding Request'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setApprovingRequest(null)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 rounded-lg hover:bg-[#F3F4F4]"
                aria-label="Cancel approval"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs text-[#021526]">
              {/* Clean Confirmation Copy */}
              <p className="text-sm font-semibold text-[#021526] leading-relaxed">
                {approvingRequest.request_type === 'BANK_CHANGE'
                  ? `Approve updated bank account specifications for ${approvingRequest.venue_name}? Automated approval confirmation email will be dispatched to `
                  : approvingRequest.request_type === 'COURT_CHANGE'
                  ? `Approve court listing request for ${approvingRequest.venue_name}? Automated approval confirmation email will be dispatched to `
                  : `Approve ${approvingRequest.venue_name}? An onboarding invite will be emailed to `}
                <strong className="text-[#F94001]">{approvingRequest.requester_email}</strong>.
              </p>

              {/* Onboarding Link Input Box ONLY for Onboarding requests */}
              {(!approvingRequest.request_type || approvingRequest.request_type === 'ONBOARDING') && (
                <div className="space-y-1.5">
                  <label
                    htmlFor={onboardingLinkId}
                    className="font-bold text-[#021526] flex items-center gap-1.5 text-xs"
                  >
                    <Link2 className="h-3.5 w-3.5 text-[#F94001]" />
                    Onboarding Access Link (Single-use &bull; 7-day validity)
                  </label>
                  <input
                    id={onboardingLinkId}
                    type="text"
                    value={customOnboardingLink}
                    onChange={(e) => setCustomOnboardingLink(e.target.value)}
                    placeholder="http://localhost:3000/onboarding/752bca5f7e68c4c3540d0dec4df796ae13b907c0a12ff68ec9684afbc0bdd416"
                    className="w-full rounded-xl border border-[#E5E7EB] bg-[#F8F9FA] px-3.5 py-2.5 text-xs font-mono text-[#021526] focus:border-[#F94001] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#F94001] transition-all shadow-xs"
                  />
                  <p className="text-[11px] text-[#5F6368]">
                    A cryptographically hashed SHA-256 token will be generated and dispatched automatically via HTML email.
                  </p>
                </div>
              )}

              {/* Email Notification Alert for Bank / Court */}
              {(approvingRequest.request_type === 'BANK_CHANGE' || approvingRequest.request_type === 'COURT_CHANGE') && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-1 text-xs">
                  <div className="font-bold flex items-center gap-1.5 text-emerald-900">
                    <Mail className="h-4 w-4 text-emerald-700" />
                    <span>Instant Email Dispatch &amp; Vendor Sync</span>
                  </div>
                  <p className="text-emerald-800 text-[11.5px] leading-relaxed">
                    TurfTown dispatch system will immediately send the official approval email with the Request ID pill (<strong>{approvingRequest.request_id}</strong>) and update the live status on the vendor portal.
                  </p>
                </div>
              )}

              {approveError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{approveError}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E5E7EB]">
              <button
                type="button"
                onClick={() => setApprovingRequest(null)}
                className="rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-xs font-bold text-[#5F6368] hover:bg-[#F3F4F4] transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmittingApproval}
                onClick={handleConfirmApprove}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 text-xs font-bold shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {isSubmittingApproval ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Approving &amp; Sending...
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4" /> Confirm Approval &amp; Send Email
                  </>
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ========================================================================= */}
      {/* 3. REJECT POP-UP MODAL (TOP-LEVEL OVERLAY z-[10000]) */}
      {/* ========================================================================= */}
      {mounted && rejectingRequest && typeof document !== 'undefined' && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="reject-modal-title"
          className="fixed inset-0 z-[10000] top-0 left-0 right-0 bottom-0 w-screen h-screen bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 border border-[#E5E7EB]">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
              <div className="flex items-center gap-2 text-rose-700 font-bold text-base">
                <XCircle className="h-5 w-5" />
                <span id="reject-modal-title">
                  {rejectingRequest.request_type === 'BANK_CHANGE'
                    ? 'Reject Bank Details Change & Send Email'
                    : rejectingRequest.request_type === 'COURT_CHANGE'
                    ? 'Reject Court Addition Request & Send Email'
                    : 'Reject Partner Request & Send Notification'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setRejectingRequest(null)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 rounded-lg hover:bg-[#F3F4F4]"
                aria-label="Cancel rejection"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#021526]">
              <p>
                Rejecting request <strong className="font-mono text-[#F94001]">{rejectingRequest.request_id}</strong> for{' '}
                <strong>{rejectingRequest.venue_name}</strong>.
              </p>

              {/* Rejection Reason Dropdown */}
              <div>
                <label htmlFor={reasonSelectId} className="font-bold text-[#021526] block mb-1">
                  Rejection Reason Category <span className="text-rose-600">*</span>
                </label>
                <select
                  id={reasonSelectId}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full rounded-xl border border-[#E5E7EB] bg-[#F8F9FA] px-3.5 py-2 text-xs text-[#021526] focus:border-[#F94001] focus:outline-none shadow-xs"
                >
                  {REJECTION_REASON_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description / Note Textarea (Mandatory) */}
              <div>
                <label htmlFor={rejectionNoteId} className="font-bold text-[#021526] block mb-1">
                  {rejectingRequest.request_type === 'BANK_CHANGE'
                    ? 'Bank Details Reject Reason & Correction Note'
                    : rejectingRequest.request_type === 'COURT_CHANGE'
                    ? 'Court Details Reject Reason & Correction Note'
                    : 'Rejection Reason Details & Correction Note'}{' '}
                  <span className="text-rose-600 font-bold">* (Required)</span>
                </label>
                <textarea
                  id={rejectionNoteId}
                  rows={3}
                  value={rejectionNote}
                  onChange={(e) => setRejectionNote(e.target.value)}
                  placeholder={
                    rejectingRequest.request_type === 'BANK_CHANGE'
                      ? 'Specify why this bank account change was rejected (e.g. Account holder name does not match legal entity, invalid IFSC, unverified cheque copy)...'
                      : rejectingRequest.request_type === 'COURT_CHANGE'
                      ? 'Specify why this court addition was rejected (e.g. Rate does not meet zone pricing guidelines, physical safety inspection required, invalid boundary dimensions)...'
                      : 'Explain why this request is rejected and what the applicant needs to correct...'
                  }
                  className="w-full rounded-xl border border-[#E5E7EB] bg-[#F8F9FA] px-3.5 py-2 text-xs text-[#021526] focus:border-[#F94001] focus:bg-white focus:outline-none shadow-xs"
                />
                {!rejectionNote.trim() && (
                  <span className="text-[10px] text-rose-600 font-semibold block mt-1">
                    * Please enter a correction reason to enable rejection.
                  </span>
                )}
              </div>

              {/* Email Notification Alert */}
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-950 space-y-1 text-[11px]">
                <p className="font-bold flex items-center gap-1 text-blue-900">
                  <Mail className="h-3.5 w-3.5 text-blue-700" />
                  Automated Email Notification
                </p>
                <p className="opacity-90 text-blue-800">
                  The exact rejection reason entered above will be sent directly to <strong>{rejectingRequest.requester_email}</strong> and displayed as the {rejectingRequest.request_type === 'BANK_CHANGE' ? 'Bank Details Reject Reason' : rejectingRequest.request_type === 'COURT_CHANGE' ? 'Court Details Reject Reason' : 'Rejection Reason'} on the vendor portal.
                </p>
              </div>

              {rejectionError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{rejectionError}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E5E7EB]">
              <button
                type="button"
                onClick={() => setRejectingRequest(null)}
                className="rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-xs font-bold text-[#5F6368] hover:bg-[#F3F4F4] transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmittingRejection || !rejectionNote.trim()}
                onClick={handleConfirmReject}
                className="inline-flex items-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white px-5 py-2.5 text-xs font-bold shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmittingRejection ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Dispatching Rejection Email...
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4" /> Reject &amp; Send Email Notification
                  </>
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
