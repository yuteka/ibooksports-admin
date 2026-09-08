'use client';

import React, { useState, useEffect } from 'react';
import {
  Building2,
  Search,
  ExternalLink,
  ShieldCheck,
  Loader2,
} from 'lucide-react';
import { adminApi, VenueItem } from '@/lib/api';

export default function VenuesManagementPage() {
  const [venues, setVenues] = useState<VenueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function loadVenues() {
      try {
        const data = await adminApi.getVenues();
        if (data.length === 0) {
          setVenues([
            {
              id: 'ven_1001',
              venue_name: 'Sky Sports Arena',
              name: 'Karthik Rajan',
              mobile_number: 9876543210,
              venue_location_name:
                'https://www.google.com/maps?q=11.0283,77.0012',
              state: 'Tamil Nadu',
              district: 'Coimbatore',
              sports: 'FOOTBALL',
              courts: 4,
              status: 'ACTIVE',
            },
            {
              id: 'ven_1002',
              venue_name: 'Green Field Sports Park',
              name: 'Vignesh Sundaram',
              mobile_number: 9845123456,
              venue_location_name:
                'https://www.google.com/maps?q=13.0827,80.2707',
              state: 'Tamil Nadu',
              district: 'Chennai',
              sports: 'BADMINTON',
              courts: 6,
              status: 'ACTIVE',
            },
            {
              id: 'ven_1003',
              venue_name: 'Apex Arena & Sports Club',
              name: 'Ananya Sharma',
              mobile_number: 9711223344,
              venue_location_name:
                'https://www.google.com/maps?q=12.9716,77.5946',
              state: 'Karnataka',
              district: 'Bengaluru Urban',
              sports: 'CRICKET',
              courts: 3,
              status: 'ACTIVE',
            },
          ]);
        } else {
          setVenues(data);
        }
      } catch (e) {
        console.error('Failed to load venues', e);
      } finally {
        setLoading(false);
      }
    }
    loadVenues();
  }, []);

  const filteredVenues = venues.filter((v) => {
    const query = searchQuery.toLowerCase();
    return (
      v.venue_name?.toLowerCase().includes(query) ||
      v.name?.toLowerCase().includes(query) ||
      v.district?.toLowerCase().includes(query) ||
      v.state?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E7EB] pb-5">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-[#021526] font-display flex items-center gap-2.5">
            <Building2 className="h-6 w-6 text-[#F94001]" />
            Venue & Turf Management
          </h1>
          <p className="text-xs text-[#5F6368] mt-1">
            Registered sports grounds, arenas, turf locations, and court capacities.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-[#5F6368]" />
          <input
            type="text"
            placeholder="Search venue or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl bg-white border border-[#E5E7EB] pl-10 pr-4 py-2 text-xs text-[#021526] placeholder-[#5F6368] focus:border-[#F94001] focus:outline-none"
          />
        </div>
      </div>

      <div className="rounded-2xl bg-white border border-[#E5E7EB] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-[#F8F9FA] text-[#5F6368] font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Venue Name</th>
                <th className="py-3 px-4">Owner / Contact</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Primary Sport</th>
                <th className="py-3 px-4">Google Maps Link</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#5F6368]">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-[#F94001] mb-2" />
                    Loading registered venues...
                  </td>
                </tr>
              ) : (
                filteredVenues.map((v, i) => (
                  <tr key={v.id || i} className="hover:bg-[#F8F9FA] transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-[#021526]">{v.venue_name}</p>
                      <p className="text-[11px] text-[#5F6368]">
                        ID: <span className="font-mono">{v.id || `ven_${1000 + i}`}</span>
                      </p>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-[#021526]">{v.name}</p>
                      <p className="text-[11px] text-[#5F6368] font-mono">
                        +91 {v.mobile_number}
                      </p>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-[#021526]">{v.district}</p>
                      <p className="text-[11px] text-[#5F6368]">{v.state}</p>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FFF1EC] text-[#F94001] border border-[#F94001]/30">
                        {v.sports}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 max-w-xs truncate">
                      {v.venue_location_name ? (
                        <a
                          href={v.venue_location_name}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#F94001] hover:underline flex items-center gap-1 font-mono text-[11px] truncate"
                        >
                          <ExternalLink className="h-3 w-3 shrink-0" />
                          {v.venue_location_name}
                        </a>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <ShieldCheck className="h-3 w-3" /> ACTIVE
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
