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
        {/* Card 1: Total Leads */}
        <div className="rounded-2xl bg-white p-5 border border-[#E5E7EB] shadow-xs space-y-3 relative overflow-hidden transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5F6368] uppercase tracking-wider">
              Total Applications
            </span>
            <div className="h-9 w-9 rounded-xl bg-[#FFF1EC] text-[#F94001] flex items-center justify-center">
              <Inbox className="h-5 w-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-[#021526] font-display">
              {stats.total_leads}
            </span>
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-0.5">
              <TrendingUp className="h-3.5 w-3.5" /> +100%
            </span>
          </div>
          <p className="text-[11px] text-[#5F6368]">
            Partner lead requests submitted via website form
          </p>
        </div>

        {/* Card 2: Pending Review (SUBMITTED) */}
        <div className="rounded-2xl bg-white p-5 border border-amber-200 bg-gradient-to-br from-white to-amber-50/40 shadow-xs space-y-3 relative overflow-hidden transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
              Awaiting Review
            </span>
            <div className="h-9 w-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-amber-900 font-display">
              {stats.pending_review}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-full">
              Action Required
            </span>
          </div>
          <p className="text-[11px] text-amber-800/80">
            Requests in <code className="font-mono font-bold">SUBMITTED</code> status
          </p>
        </div>

        {/* Card 3: Approved Partners */}
        <div className="rounded-2xl bg-white p-5 border border-emerald-200 bg-gradient-to-br from-white to-emerald-50/40 shadow-xs space-y-3 relative overflow-hidden transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
              Approved Partners
            </span>
            <div className="h-9 w-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-emerald-900 font-display">
              {stats.approved_partners}
            </span>
            <span className="text-xs font-semibold text-emerald-700">
              Access link sent
            </span>
          </div>
          <p className="text-[11px] text-emerald-800/80">
            Onboarding invitation link generated & emailed
          </p>
        </div>

        {/* Card 4: Live Facilities */}
        <div className="rounded-2xl bg-white p-5 border border-[#E5E7EB] shadow-xs space-y-3 relative overflow-hidden transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5F6368] uppercase tracking-wider">
              Live Facilities
            </span>
            <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Building2 className="h-5 w-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-[#021526] font-display">
              {stats.active_venues}
            </span>
            <span className="text-xs font-semibold text-[#5F6368]">
              {stats.total_courts} courts
            </span>
          </div>
          <p className="text-[11px] text-[#5F6368]">
            Active booking venues in network
          </p>
        </div>
      </div>

      {/* TWO COLUMN GRID: RECENT APPLICATIONS & RECENT EMAIL DISPATCHES */}
      {/* Full Width: Recent Applications Table */}
      <div className="w-full rounded-2xl bg-white p-5 sm:p-6 border border-[#E5E7EB] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#021526] font-display flex items-center gap-2">
              <Inbox className="h-4 w-4 text-[#F94001]" />
              Recent Partner Applications
            </h2>
            <p className="text-xs text-[#5F6368]">
              Review, approve access, or request corrections with automated emails
            </p>
          </div>
          <Link
            href="/admin/requests"
            className="text-xs font-bold text-[#F94001] hover:underline flex items-center gap-1"
          >
            <span>View All</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto -mx-5 sm:mx-0 px-5 sm:px-0">
          <table className="w-full text-left text-xs min-w-[500px]">
            <thead>
              <tr className="border-b border-[#E5E7EB] text-[#5F6368] font-semibold">
                <th className="pb-3 pr-4">Request ID</th>
                <th className="pb-3 pr-4">Venue</th>
                <th className="pb-3 pr-4">Location</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F4F4]">
              {recentRequests.map((req) => (
                <tr
                  key={req.request_id}
                  className="hover:bg-[#FFF1EC]/20 transition-colors"
                >
                  <td className="py-3.5 pr-4 font-mono font-bold text-[#F94001]">
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
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                        <Clock className="h-3 w-3" /> SUBMITTED
                      </span>
                    )}
                    {req.request_status === 'APPROVED' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <CheckCircle2 className="h-3 w-3" /> APPROVED
                      </span>
                    )}
                    {req.request_status === 'REJECTED' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                        <XCircle className="h-3 w-3" /> REJECTED
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 text-right">
                    <Link
                      href="/admin/requests"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-[#021526] hover:text-[#F94001] bg-[#F3F4F4] hover:bg-[#FFF1EC] px-3 py-1 rounded-lg transition-colors"
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
