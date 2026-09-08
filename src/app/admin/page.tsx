'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Inbox,
  Building2,
  Mail,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronRight,
  TrendingUp,
  ShieldCheck,
} from 'lucide-react';
import {
  adminApi,
  DashboardStats,
  PartnerRequestItem,
  EmailLogItem,
} from '@/lib/api';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    total_leads: 4,
    pending_review: 2,
    approved_partners: 1,
    rejected_leads: 1,
    active_venues: 13,
    total_courts: 48,
    monthly_booking_volume: '₹14,80,000',
  });
  const [recentRequests, setRecentRequests] = useState<PartnerRequestItem[]>([]);
  const [recentEmails, setRecentEmails] = useState<EmailLogItem[]>([]);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [statsData, requestsData, emailsData] = await Promise.allSettled([
          adminApi.getDashboardStats(),
          adminApi.getRequests(),
          adminApi.getEmailLogs(),
        ]);

        if (statsData.status === 'fulfilled') setStats(statsData.value);
        if (requestsData.status === 'fulfilled')
          setRecentRequests(requestsData.value.slice(0, 5));
        if (emailsData.status === 'fulfilled')
          setRecentEmails(emailsData.value.slice(0, 5));
      } catch (e) {
        console.error('Error loading dashboard data', e);
      }
    }
    loadDashboardData();
  }, []);

  return (
    <div className="space-y-6 sm:space-y-8 w-full">
      {/* PAGE TITLE & ACTION BANNER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E7EB] pb-5 sm:pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#F94001] bg-[#FFF1EC] px-3 py-1 rounded-full mb-2">
            <ShieldCheck className="h-3.5 w-3.5" /> iBookSports Operating System
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#021526] font-display">
            Executive Admin Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-[#5F6368] mt-1">
            Real-time partner applications, automated email dispatch statuses, and venue operations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/requests"
            className="inline-flex items-center gap-2 rounded-xl bg-[#F94001] hover:bg-[#D93600] text-white px-4 py-2.5 text-xs font-bold shadow-md shadow-[#F94001]/20 transition-all active:scale-95 shrink-0"
          >
            <Inbox className="h-4 w-4" />
            <span>Process Partner Requests</span>
          </Link>
        </div>
      </div>

      {/* 4 PRIMARY METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 xl:gap-5">
        {/* Card 1: Total Applications */}
        <Link
          href="/admin/requests"
          className="rounded-2xl bg-white p-5 border border-[#E5E7EB] hover:border-slate-300 shadow-xs space-y-3 relative overflow-hidden transition-all group block"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#5F6368]">
              Total Applications
            </span>
            <div className="h-8 w-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Inbox className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-[#021526] font-display tabular-nums">
              {stats.total_leads}
            </span>
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-0.5">
              <TrendingUp className="h-3.5 w-3.5" /> +100%
            </span>
          </div>
          <p className="text-[11px] text-[#5F6368]">
            Partner lead requests submitted via website form
          </p>
        </Link>

        {/* Card 2: Awaiting Review */}
        <Link
          href="/admin/requests"
          className="rounded-2xl bg-white p-5 border border-[#E5E7EB] hover:border-slate-300 shadow-xs space-y-3 relative overflow-hidden transition-all group block"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
              Awaiting Review
            </span>
            <div className="h-8 w-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-[#021526] font-display tabular-nums">
              {stats.pending_review}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200/80 px-2 py-0.5 rounded-full">
              Action Required
            </span>
          </div>
          <p className="text-[11px] text-[#5F6368]">
            Requests in <code className="font-mono font-bold text-amber-700">SUBMITTED</code> status
          </p>
        </Link>

        {/* Card 3: Approved Partners */}
        <Link
          href="/admin/onboarding"
          className="rounded-2xl bg-white p-5 border border-[#E5E7EB] hover:border-slate-300 shadow-xs space-y-3 relative overflow-hidden transition-all group block"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
              Approved Partners
            </span>
            <div className="h-8 w-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-[#021526] font-display tabular-nums">
              {stats.approved_partners}
            </span>
            <span className="text-xs font-semibold text-emerald-600">
              Access link sent
            </span>
          </div>
          <p className="text-[11px] text-[#5F6368]">
            Onboarding invitation link generated & emailed
          </p>
        </Link>

        {/* Card 4: Live Facilities */}
        <Link
          href="/admin/venues"
          className="rounded-2xl bg-white p-5 border border-[#E5E7EB] hover:border-slate-300 shadow-xs space-y-3 relative overflow-hidden transition-all group block"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#5F6368]">
              Live Facilities
            </span>
            <div className="h-8 w-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Building2 className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-[#021526] font-display tabular-nums">
              {stats.active_venues}
            </span>
            <span className="text-xs font-semibold text-[#5F6368]">
              {stats.total_courts} courts
            </span>
          </div>
          <p className="text-[11px] text-[#5F6368]">
            Active booking venues in network
          </p>
        </Link>
      </div>

      {/* RECENT APPLICATIONS TABLE */}
      <div className="w-full rounded-2xl bg-white p-5 sm:p-6 border border-[#E5E7EB] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#021526] font-display flex items-center gap-2">
              <Inbox className="h-4 w-4 text-[#F94001]" />
              Recent Partner Applications
            </h2>
            <p className="text-xs text-[#5F6368] mt-0.5">
              Review, approve access, or request corrections with automated emails
            </p>
          </div>
          <Link
            href="/admin/requests"
            className="text-xs font-bold text-[#021526] hover:text-[#F94001] flex items-center gap-1 transition-colors"
          >
            <span>View All</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto -mx-5 sm:mx-0 px-5 sm:px-0">
          <table className="w-full text-left text-xs min-w-[500px]">
            <thead>
              <tr className="border-b border-[#E5E7EB] text-[#5F6368] text-[11px] font-bold uppercase tracking-wider">
                <th className="pb-3 pr-4">Request ID</th>
                <th className="pb-3 pr-4">Venue & Contact</th>
                <th className="pb-3 pr-4">Location</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F4F4]">
              {recentRequests.map((req) => (
                <tr
                  key={req.request_id}
                  className="hover:bg-slate-50/70 transition-colors"
                >
                  <td className="py-3.5 pr-4 font-mono font-bold text-[#021526]">
                    {req.request_id}
                  </td>
                  <td className="py-3.5 pr-4">
                    <p className="font-bold text-[#021526]">
                      {req.venue_name}
                    </p>
                    <p className="text-[11px] text-[#5F6368]">
                      {req.requester_name}
                    </p>
                  </td>
                  <td className="py-3.5 pr-4 text-[#5F6368]">
                    {req.district}, {req.state}
                  </td>
                  <td className="py-3.5 pr-4">
                    {req.request_status === 'SUBMITTED' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        <Clock className="h-3 w-3 text-amber-600" /> SUBMITTED
                      </span>
                    )}
                    {req.request_status === 'APPROVED' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <CheckCircle2 className="h-3 w-3 text-emerald-600" /> APPROVED
                      </span>
                    )}
                    {req.request_status === 'REJECTED' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
                        <XCircle className="h-3 w-3 text-rose-600" /> REJECTED
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 text-right">
                    <Link
                      href="/admin/requests"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-[#021526] hover:text-white bg-slate-100 hover:bg-[#021526] px-3 py-1.5 rounded-lg transition-all"
                    >
                      <span>Review</span>
                      <ChevronRight className="h-3 w-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
