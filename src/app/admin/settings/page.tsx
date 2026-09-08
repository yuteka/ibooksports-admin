'use client';

import React, { useState, useEffect, useCallback, useId } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import {
  Settings,
  Mail,
  LifeBuoy,
  Users,
  UserPlus,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Phone,
  Edit2,
  Trash2,
  RefreshCw,
  X,
  Check,
  Copy,
  ExternalLink,
  Shield,
  Briefcase,
  UserCheck,
  Headphones,
  DollarSign,
  Filter,
  Trophy,
  Sparkles,
  Zap,
  Target,
  Flame,
  Activity,
  Dribbble,
  Sun,
  Droplets,
  Car,
  HeartPulse,
  Coffee,
  Armchair,
  DoorOpen,
  SunMedium,
  Layers,
  Plus,
  Building2,
} from 'lucide-react';
import {
  staffApi,
  StaffItem,
  RoleMetadata,
  StaffStats,
  CreateStaffPayload,
  adminApi,
  SportItem,
  AmenityItem,
} from '@/lib/api';

const ICON_MAP: Record<string, React.ElementType> = {
  Trophy,
  Target,
  Flame,
  Zap,
  Activity,
  Dribbble,
  Sparkles,
  Sun,
  SunMedium,
  Car,
  DoorOpen,
  Droplets,
  HeartPulse,
  Coffee,
  ShieldCheck,
  Armchair,
  Building2,
};

const DEFAULT_ROLES: RoleMetadata[] = [
  {
    key: 'SUPER_ADMIN',
    title: 'Super Administrator',
    badge_color: 'bg-purple-100 text-purple-800 border-purple-200',
    description: 'Full access to all venues, users, financial payouts, and platform settings',
    permissions: ['All Modules Access', 'Staff Management', 'Financial Settlements', 'System Configurations'],
  },
  {
    key: 'OPERATIONS_MANAGER',
    title: 'Operations Manager',
    badge_color: 'bg-blue-100 text-blue-800 border-blue-200',
    description: 'Manages venue listings, slot configurations, and partner request triage',
    permissions: ['Venue Approval & Edits', 'Slot Schedule Management', 'Requests Review', 'Email Logs View'],
  },
  {
    key: 'VERIFICATION_OFFICER',
    title: 'Verification Officer',
    badge_color: 'bg-amber-100 text-amber-800 border-amber-200',
    description: 'Reviews partner KYC documents, GST certificates, and bank account proofs',
    permissions: ['KYC Document Review', 'Aadhaar / GST Verification', 'Onboarding Step Approvals', 'Audit Notes'],
  },
  {
    key: 'SUPPORT_AGENT',
    title: 'Support Agent',
    badge_color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    description: 'Handles partner helpdesk tickets, login issues, and phone inquiries',
    permissions: ['Support Ticket Triage', 'Partner Call Logs', 'OTP Resend Support', 'Inquiry Resolution'],
  },
  {
    key: 'FINANCE_ADMIN',
    title: 'Finance Admin',
    badge_color: 'bg-rose-100 text-rose-800 border-rose-200',
    description: 'Audits bank settlement accounts, payout processing, and tax invoices',
    permissions: ['Bank Account Audits', 'Payout Batch Review', 'GST Reconciliation', 'Revenue Reports'],
  },
];

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<'staff' | 'sports' | 'emails' | 'support' | 'system'>('staff');
  const [sportsSubTab, setSportsSubTab] = useState<'SPORTS' | 'AMENITIES'>('SPORTS');

  // Sports & Amenities State
  const [sportsList, setSportsList] = useState<SportItem[]>([]);
  const [amenitiesList, setAmenitiesList] = useState<AmenityItem[]>([]);

  // Staff State
  const [staffList, setStaffList] = useState<StaffItem[]>([]);
  const [roles, setRoles] = useState<RoleMetadata[]>(DEFAULT_ROLES);
  const [stats, setStats] = useState<StaffStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    async function loadSportsData() {
      try {
        const [sportsData, amenitiesData] = await Promise.all([
          adminApi.getSports().catch(() => []),
          adminApi.getAmenities().catch(() => []),
        ]);
        setSportsList(sportsData);
        setAmenitiesList(amenitiesData);
      } catch (e) {
        console.error('Failed to load sports data', e);
      }
    }
    loadSportsData();
  }, []);

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffItem | null>(null);
  const [deletingStaff, setDeletingStaff] = useState<StaffItem | null>(null);

  // Sports Management State (Add, Edit, Delete)
  const [isSportModalOpen, setIsSportModalOpen] = useState(false);
  const [editingSport, setEditingSport] = useState<SportItem | null>(null);
  const [deletingSport, setDeletingSport] = useState<SportItem | null>(null);
  const [sportName, setSportName] = useState('');
  const [sportId, setSportId] = useState('');
  const [sportFormats, setSportFormats] = useState<string[]>([]);
  const [newFormatInput, setNewFormatInput] = useState('');
  const [sportIsActive, setSportIsActive] = useState(true);
  const [sportFormErrors, setSportFormErrors] = useState<Record<string, string>>({});
  const [isSubmittingSport, setIsSubmittingSport] = useState(false);

  // Amenities Management State (Add, Edit, Delete)
  const [isAmenityModalOpen, setIsAmenityModalOpen] = useState(false);
  const [editingAmenity, setEditingAmenity] = useState<AmenityItem | null>(null);
  const [deletingAmenity, setDeletingAmenity] = useState<AmenityItem | null>(null);
  const [amenityName, setAmenityName] = useState('');
  const [amenityId, setAmenityId] = useState('');
  const [amenityCategory, setAmenityCategory] = useState('Facility');
  const [amenityFormErrors, setAmenityFormErrors] = useState<Record<string, string>>({});
  const [isSubmittingAmenity, setIsSubmittingAmenity] = useState(false);

  // Form State for Create Staff
  const [formData, setFormData] = useState<CreateStaffPayload>({
    name: '',
    email: '',
    phone_number: '',
    role: 'OPERATIONS_MANAGER',
    department: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Toast Banner State
  const [toastMessage, setToastMessage] = useState<{
    type: 'success' | 'error';
    title: string;
    description: string;
  } | null>(null);

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const nameInputId = useId();
  const emailInputId = useId();
  const phoneInputId = useId();
  const roleSelectId = useId();
  const departmentInputId = useId();

  // Load staff data
  const loadStaffData = useCallback(async () => {
    setLoading(true);
    try {
      const [staffData, rolesData, statsData] = await Promise.all([
        staffApi.getAllStaff(
          searchQuery.trim() ? searchQuery : undefined,
          selectedRoleFilter !== 'ALL' ? selectedRoleFilter : undefined,
          selectedStatusFilter !== 'ALL' ? selectedStatusFilter : undefined,
        ),
        staffApi.getRoles().catch(() => DEFAULT_ROLES),
        staffApi.getStats().catch(() => null),
      ]);

      setStaffList(staffData);
      if (rolesData && rolesData.length > 0) setRoles(rolesData);
      if (statsData) setStats(statsData);
    } catch (err: unknown) {
      console.error('Failed to load staff list', err);
      showToast('error', 'Failed to Load Staff', (err as Error)?.message || 'Could not connect to staff API');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedRoleFilter, selectedStatusFilter]);

  useEffect(() => {
    loadStaffData();
  }, [loadStaffData]);

  // Toast Helper
  const showToast = (type: 'success' | 'error', title: string, description: string) => {
    setToastMessage({ type, title, description });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Validate form
  const validateForm = (data: CreateStaffPayload): boolean => {
    const errors: Record<string, string> = {};

    if (!data.name.trim()) {
      errors.name = 'Full Name is required';
    } else if (data.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    if (!data.email.trim()) {
      errors.email = 'Email ID is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
      errors.email = 'Please enter a valid email address';
    }

    const cleanPhone = data.phone_number.replace(/\D/g, '');
    if (!data.phone_number.trim()) {
      errors.phone_number = 'Phone Number is required';
    } else if (cleanPhone.length !== 10) {
      errors.phone_number = 'Phone number must be a 10-digit mobile number';
    }

    if (!data.role) {
      errors.role = 'Please select a role from the dropdown';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle Create Staff Submit
  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm(formData)) return;

    setIsSubmitting(true);
    try {
      const cleanPhone = formData.phone_number.replace(/\D/g, '');
      const created = await staffApi.createStaff({
        ...formData,
        phone_number: cleanPhone,
      });

      showToast(
        'success',
        'Staff Member Created',
        `Successfully registered ${created.name} as ${created.role_title}. Invitation sent to ${created.email}`,
      );

      setIsCreateModalOpen(false);
      setFormData({
        name: '',
        email: '',
        phone_number: '',
        role: 'OPERATIONS_MANAGER',
        department: '',
      });
      setFormErrors({});
      loadStaffData();
    } catch (err: unknown) {
      showToast('error', 'Creation Failed', (err as Error)?.message || 'Failed to create staff member');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Edit Staff Submit
  const handleUpdateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaff) return;

    setIsSubmitting(true);
    try {
      const cleanPhone = editingStaff.phone_number.replace(/\D/g, '');
      const updated = await staffApi.updateStaff(editingStaff.id, {
        name: editingStaff.name,
        email: editingStaff.email,
        phone_number: cleanPhone,
        role: editingStaff.role,
        department: editingStaff.department,
        status: editingStaff.status,
      });

      showToast('success', 'Staff Member Updated', `Successfully updated profile for ${updated.name}`);
      setEditingStaff(null);
      loadStaffData();
    } catch (err: unknown) {
      showToast('error', 'Update Failed', (err as Error)?.message || 'Failed to update staff member');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Status Toggle
  const handleToggleStatus = async (staff: StaffItem) => {
    try {
      const updated = await staffApi.toggleStatus(staff.id);
      showToast(
        'success',
        'Status Changed',
        `${updated.name} is now ${updated.status === 'ACTIVE' ? 'Active' : 'Inactive'}`,
      );
      loadStaffData();
    } catch (err: unknown) {
      showToast('error', 'Status Toggle Failed', (err as Error)?.message || 'Could not update status');
    }
  };

  // Handle Delete Staff
  const handleDeleteStaff = async () => {
    if (!deletingStaff) return;
    setIsSubmitting(true);
    try {
      await staffApi.deleteStaff(deletingStaff.id);
      showToast('success', 'Staff Deleted', `${deletingStaff.name} was removed from the team.`);
      setDeletingStaff(null);
      loadStaffData();
    } catch (err: unknown) {
      showToast('error', 'Delete Failed', (err as Error)?.message || 'Failed to delete staff member');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Sports CRUD Handlers
  const handleOpenAddSport = () => {
    setEditingSport(null);
    setSportName('');
    setSportId('');
    setSportFormats(['Singles', 'Doubles']);
    setNewFormatInput('');
    setSportIsActive(true);
    setSportFormErrors({});
    setIsSportModalOpen(true);
  };

  const handleOpenEditSport = (sport: SportItem) => {
    setEditingSport(sport);
    setSportName(sport.name);
    setSportId(sport.sport_id);
    setSportFormats([...sport.supported_formats]);
    setNewFormatInput('');
    setSportIsActive(sport.is_active ?? true);
    setSportFormErrors({});
    setIsSportModalOpen(true);
  };

  const handleAddFormatTag = () => {
    const val = newFormatInput.trim();
    if (!val) return;
    if (sportFormats.includes(val)) {
      setNewFormatInput('');
      return;
    }
    setSportFormats([...sportFormats, val]);
    setNewFormatInput('');
  };

  const handleRemoveFormatTag = (fmt: string) => {
    setSportFormats(sportFormats.filter((f) => f !== fmt));
  };

  const handleSaveSport = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!sportName.trim()) errors.name = 'Sport name is required';
    if (!sportId.trim()) errors.sport_id = 'Sport ID is required';
    if (sportFormats.length === 0) errors.formats = 'Please add at least one match format';

    if (Object.keys(errors).length > 0) {
      setSportFormErrors(errors);
      return;
    }

    setIsSubmittingSport(true);
    try {
      if (editingSport) {
        const updated = await adminApi.updateSport(editingSport.sport_id, {
          name: sportName,
          sport_id: sportId,
          supported_formats: sportFormats,
          is_active: sportIsActive,
        });
        setSportsList((prev) =>
          prev.map((s) => (s.sport_id === editingSport.sport_id ? updated : s)),
        );
        showToast('success', 'Sport Updated', `Successfully updated ${updated.name} and its match formats.`);
      } else {
        const created = await adminApi.createSport({
          name: sportName,
          sport_id: sportId,
          supported_formats: sportFormats,
          is_active: sportIsActive,
        });
        setSportsList((prev) => [...prev, created]);
        showToast('success', 'Sport Created', `Successfully added ${created.name} (${created.sport_id}) to the directory.`);
      }
      setIsSportModalOpen(false);
    } catch (err: unknown) {
      showToast('error', 'Operation Failed', (err as Error)?.message || 'Failed to save sport');
    } finally {
      setIsSubmittingSport(false);
    }
  };

  const handleConfirmDeleteSport = async () => {
    if (!deletingSport) return;
    setIsSubmittingSport(true);
    try {
      await adminApi.deleteSport(deletingSport.sport_id);
      setSportsList((prev) => prev.filter((s) => s.sport_id !== deletingSport.sport_id));
      showToast('success', 'Sport Deleted', `Sport ${deletingSport.name} was removed from the directory.`);
      setDeletingSport(null);
    } catch (err: unknown) {
      showToast('error', 'Deletion Failed', (err as Error)?.message || 'Failed to delete sport');
    } finally {
      setIsSubmittingSport(false);
    }
  };

  // Amenities Handlers
  const handleOpenAddAmenity = () => {
    setEditingAmenity(null);
    setAmenityName('');
    setAmenityId('');
    setAmenityCategory('Facility');
    setAmenityFormErrors({});
    setIsAmenityModalOpen(true);
  };

  const handleOpenEditAmenity = (amenity: AmenityItem) => {
    setEditingAmenity(amenity);
    setAmenityName(amenity.name);
    setAmenityId(amenity.amenity_id);
    setAmenityCategory(amenity.category || 'Facility');
    setAmenityFormErrors({});
    setIsAmenityModalOpen(true);
  };

  const handleSaveAmenity = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!amenityName.trim()) errors.name = 'Amenity name is required';
    if (!amenityId.trim()) errors.amenity_id = 'Amenity code is required';

    if (Object.keys(errors).length > 0) {
      setAmenityFormErrors(errors);
      return;
    }

    setIsSubmittingAmenity(true);
    try {
      if (editingAmenity) {
        const updated = await adminApi.updateAmenity(editingAmenity.amenity_id, {
          name: amenityName,
          category: amenityCategory,
        });
        setAmenitiesList((prev) =>
          prev.map((a) => (a.amenity_id === editingAmenity.amenity_id ? updated : a)),
        );
        showToast('success', 'Amenity Updated', `Successfully updated ${updated.name}.`);
      } else {
        const created = await adminApi.createAmenity({
          name: amenityName,
          amenity_id: amenityId,
          category: amenityCategory,
        });
        setAmenitiesList((prev) => [...prev, created]);
        showToast('success', 'Amenity Created', `Successfully added ${created.name} (${created.amenity_id}).`);
      }
      setIsAmenityModalOpen(false);
    } catch (err: unknown) {
      showToast('error', 'Operation Failed', (err as Error)?.message || 'Failed to save amenity');
    } finally {
      setIsSubmittingAmenity(false);
    }
  };

  const handleConfirmDeleteAmenity = async () => {
    if (!deletingAmenity) return;
    setIsSubmittingAmenity(true);
    try {
      await adminApi.deleteAmenity(deletingAmenity.amenity_id);
      setAmenitiesList((prev) => prev.filter((a) => a.amenity_id !== deletingAmenity.amenity_id));
      showToast('success', 'Amenity Deleted', `Amenity ${deletingAmenity.name} was removed.`);
      setDeletingAmenity(null);
    } catch (err: unknown) {
      showToast('error', 'Delete Failed', (err as Error)?.message || 'Failed to delete amenity');
    } finally {
      setIsSubmittingAmenity(false);
    }
  };

  // Copy to clipboard
  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Helper for role badge
  const getRoleBadge = (roleKey: string) => {
    const roleMeta = roles.find((r) => r.key === roleKey);
    const color = roleMeta?.badge_color || 'bg-slate-100 text-slate-800 border-slate-200';
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${color}`}>
        {roleKey === 'SUPER_ADMIN' && <Shield className="h-3 w-3" />}
        {roleKey === 'OPERATIONS_MANAGER' && <Briefcase className="h-3 w-3" />}
        {roleKey === 'VERIFICATION_OFFICER' && <UserCheck className="h-3 w-3" />}
        {roleKey === 'SUPPORT_AGENT' && <Headphones className="h-3 w-3" />}
        {roleKey === 'FINANCE_ADMIN' && <DollarSign className="h-3 w-3" />}
        {roleMeta?.title || roleKey}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* TOAST BANNER */}
      {mounted && toastMessage && typeof document !== 'undefined' && createPortal(
        <div
          className={`fixed bottom-6 right-6 z-[100000] max-w-md p-4 rounded-2xl shadow-2xl border flex items-start gap-3.5 animate-in slide-in-from-bottom duration-300 pointer-events-auto ${
            toastMessage.type === 'success'
              ? 'bg-[#021526] text-white border-emerald-500/30'
              : 'bg-[#021526] text-white border-rose-500/30'
          }`}
        >
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
          >
            <X className="h-4 w-4" />
          </button>
        </div>,
        document.body
      )}

      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E5E7EB] pb-5">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-[#021526] font-display flex items-center gap-2.5">
            <Settings className="h-6 w-6 text-[#F94001]" />
            Settings & Support Portal
          </h1>
          <p className="text-xs text-[#5F6368] mt-1">
            Manage administrative staff members, team access roles, automated email notifications, and support helpdesk.
          </p>
        </div>

        {activeTab === 'staff' && (
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                setFormData({
                  name: '',
                  email: '',
                  phone_number: '',
                  role: 'OPERATIONS_MANAGER',
                  department: '',
                });
                setFormErrors({});
                setIsCreateModalOpen(true);
              }}
              className="inline-flex items-center gap-2 bg-[#F94001] hover:bg-[#d93600] text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm hover:shadow transition-all active:scale-[0.98]"
            >
              <UserPlus className="h-4 w-4" />
              <span>Create Staff Member</span>
            </button>
          </div>
        )}
      </div>

      {/* TABS NAVIGATION */}
      <div className="flex items-center gap-2 border-b border-[#E5E7EB] pb-px overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('staff')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'staff'
              ? 'border-[#F94001] text-[#F94001]'
              : 'border-transparent text-[#5F6368] hover:text-[#021526]'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Staff & Team Management</span>
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
              activeTab === 'staff' ? 'bg-[#FFF1EC] text-[#F94001]' : 'bg-[#E5E7EB] text-[#5F6368]'
            }`}
          >
            {staffList.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('sports')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'sports'
              ? 'border-[#F94001] text-[#F94001]'
              : 'border-transparent text-[#5F6368] hover:text-[#021526]'
          }`}
        >
          <Trophy className="h-4 w-4" />
          <span>Sports & Amenities</span>
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
              activeTab === 'sports' ? 'bg-[#FFF1EC] text-[#F94001]' : 'bg-[#E5E7EB] text-[#5F6368]'
            }`}
          >
            {sportsList.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('support')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'support'
              ? 'border-[#F94001] text-[#F94001]'
              : 'border-transparent text-[#5F6368] hover:text-[#021526]'
          }`}
        >
          <LifeBuoy className="h-4 w-4" />
          <span>Partner Support Channels</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('system')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'system'
              ? 'border-[#F94001] text-[#F94001]'
              : 'border-transparent text-[#5F6368] hover:text-[#021526]'
          }`}
        >
          <ShieldCheck className="h-4 w-4" />
          <span>System & Database Health</span>
        </button>
      </div>

      {/* TAB 1: STAFF MANAGEMENT */}
      {activeTab === 'staff' && (
        <div className="space-y-6">
          {/* STATS OVERVIEW */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-2xl bg-white p-4 border border-[#E5E7EB] shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#5F6368] uppercase tracking-wider">Total Staff</span>
                <Users className="h-4 w-4 text-[#F94001]" />
              </div>
              <p className="text-2xl font-black text-[#021526] mt-2 font-display">
                {stats?.total_staff ?? staffList.length}
              </p>
              <p className="text-[10px] text-[#5F6368] mt-0.5">Assigned to admin roles</p>
            </div>

            <div className="rounded-2xl bg-white p-4 border border-[#E5E7EB] shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Active Staff</span>
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <p className="text-2xl font-black text-[#021526] mt-2 font-display">
                {stats?.active_staff ?? staffList.filter((s) => s.status === 'ACTIVE').length}
              </p>
              <p className="text-[10px] text-emerald-700 mt-0.5">Live system access</p>
            </div>

            <div className="rounded-2xl bg-white p-4 border border-[#E5E7EB] shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">KYC Officers</span>
                <UserCheck className="h-4 w-4 text-amber-600" />
              </div>
              <p className="text-2xl font-black text-[#021526] mt-2 font-display">
                {stats?.verification_officers ?? staffList.filter((s) => s.role === 'VERIFICATION_OFFICER').length}
              </p>
              <p className="text-[10px] text-amber-700 mt-0.5">Aadhaar & GST reviewers</p>
            </div>

            <div className="rounded-2xl bg-white p-4 border border-[#E5E7EB] shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">Support Agents</span>
                <Headphones className="h-4 w-4 text-blue-600" />
              </div>
              <p className="text-2xl font-black text-[#021526] mt-2 font-display">
                {stats?.support_agents ?? staffList.filter((s) => s.role === 'SUPPORT_AGENT').length}
              </p>
              <p className="text-[10px] text-blue-700 mt-0.5">Helpdesk & phone triage</p>
            </div>
          </div>

          {/* SEARCH & FILTERS BAR */}
          <div className="rounded-2xl bg-white p-4 border border-[#E5E7EB] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-[#5F6368]" />
              <input
                type="text"
                placeholder="Search staff by Name, Email, Phone Number, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#F8F9FA] border border-[#E5E7EB] text-xs text-[#021526] focus:outline-none focus:border-[#F94001] focus:bg-white transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Role Dropdown Filter */}
              <div className="flex items-center gap-1.5 bg-[#F8F9FA] px-3 py-1.5 rounded-xl border border-[#E5E7EB]">
                <Filter className="h-3.5 w-3.5 text-[#5F6368]" />
                <span className="text-[11px] font-bold text-[#5F6368]">Role:</span>
                <select
                  value={selectedRoleFilter}
                  onChange={(e) => setSelectedRoleFilter(e.target.value)}
                  className="bg-transparent text-xs font-bold text-[#021526] focus:outline-none cursor-pointer"
                >
                  <option value="ALL">All Roles</option>
                  {roles.map((r) => (
                    <option key={r.key} value={r.key}>
                      {r.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1.5 bg-[#F8F9FA] px-3 py-1.5 rounded-xl border border-[#E5E7EB]">
                <span className="text-[11px] font-bold text-[#5F6368]">Status:</span>
                <select
                  value={selectedStatusFilter}
                  onChange={(e) => setSelectedStatusFilter(e.target.value)}
                  className="bg-transparent text-xs font-bold text-[#021526] focus:outline-none cursor-pointer"
                >
                  <option value="ALL">All Status</option>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>

              <button
                type="button"
                onClick={() => loadStaffData()}
                className="p-2 rounded-xl border border-[#E5E7EB] hover:bg-[#F8F9FA] text-[#5F6368] transition-colors"
                title="Refresh Staff List"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* STAFF LIST TABLE */}
          <div className="rounded-2xl bg-white border border-[#E5E7EB] shadow-xs overflow-hidden">
            {loading && staffList.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <Loader2 className="h-7 w-7 text-[#F94001] animate-spin mx-auto" />
                <p className="text-xs text-[#5F6368]">Loading staff directory...</p>
              </div>
            ) : staffList.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <Users className="h-10 w-10 text-slate-300 mx-auto" />
                <p className="text-sm font-bold text-[#021526]">No Staff Members Found</p>
                <p className="text-xs text-[#5F6368] max-w-sm mx-auto">
                  {searchQuery || selectedRoleFilter !== 'ALL' || selectedStatusFilter !== 'ALL'
                    ? 'No staff match the current search filters. Try clearing your filters or adding a new staff member.'
                    : 'No staff members are registered yet. Click below to add your first team member.'}
                </p>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(true)}
                  className="inline-flex items-center gap-1.5 bg-[#F94001] text-white px-3.5 py-2 rounded-xl text-xs font-bold"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  <span>Create Staff Member</span>
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F8F9FA] border-b border-[#E5E7EB] text-[11px] font-bold uppercase tracking-wider text-[#5F6368]">
                      <th className="py-3 px-4">Staff Member</th>
                      <th className="py-3 px-4">Contact Info (Email & Phone)</th>
                      <th className="py-3 px-4">Assigned Role (Dropdown)</th>
                      <th className="py-3 px-4">Department</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E7EB] text-xs">
                    {staffList.map((staff) => {
                      const initials = staff.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2);

                      return (
                        <tr key={staff.id} className="hover:bg-[#FFFDFB] transition-colors group">
                          {/* 1. Staff Name & Avatar */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div
                                className="h-9 w-9 rounded-xl flex items-center justify-center text-white text-xs font-black shrink-0 shadow-xs"
                                style={{ backgroundColor: staff.avatar_color || '#F94001' }}
                              >
                                {initials}
                              </div>
                              <div>
                                <p className="font-bold text-[#021526]">{staff.name}</p>
                                <span className="text-[10px] font-mono text-[#5F6368] font-bold">
                                  ID: {staff.id}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* 2. Email & Phone (ph no) */}
                          <td className="py-3.5 px-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5 text-[11px] text-[#021526] font-medium">
                                <Mail className="h-3 w-3 text-[#5F6368]" />
                                <span>{staff.email}</span>
                                <button
                                  type="button"
                                  onClick={() => handleCopyText(staff.email, `email-${staff.id}`)}
                                  className="text-slate-400 hover:text-[#F94001] transition-colors"
                                  title="Copy Email"
                                >
                                  {copiedId === `email-${staff.id}` ? (
                                    <Check className="h-3 w-3 text-emerald-600" />
                                  ) : (
                                    <Copy className="h-3 w-3" />
                                  )}
                                </button>
                              </div>

                              <div className="flex items-center gap-1.5 text-[11px] text-[#5F6368]">
                                <Phone className="h-3 w-3 text-emerald-600" />
                                <span className="font-mono font-semibold">+91 {staff.phone_number}</span>
                                <button
                                  type="button"
                                  onClick={() => handleCopyText(staff.phone_number, `phone-${staff.id}`)}
                                  className="text-slate-400 hover:text-[#F94001] transition-colors"
                                  title="Copy Phone Number"
                                >
                                  {copiedId === `phone-${staff.id}` ? (
                                    <Check className="h-3 w-3 text-emerald-600" />
                                  ) : (
                                    <Copy className="h-3 w-3" />
                                  )}
                                </button>
                              </div>
                            </div>
                          </td>

                          {/* 3. Role Dropdown Badge */}
                          <td className="py-3.5 px-4">
                            <div>{getRoleBadge(staff.role)}</div>
                          </td>

                          {/* 4. Department */}
                          <td className="py-3.5 px-4">
                            <span className="text-[11px] text-[#021526] font-medium bg-[#F8F9FA] px-2.5 py-1 rounded-lg border border-[#E5E7EB]">
                              {staff.department || 'Administration'}
                            </span>
                          </td>

                          {/* 5. Status Toggle */}
                          <td className="py-3.5 px-4">
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(staff)}
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${
                                staff.status === 'ACTIVE'
                                  ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                              title="Click to toggle status"
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${
                                  staff.status === 'ACTIVE' ? 'bg-emerald-600' : 'bg-slate-400'
                                }`}
                              />
                              {staff.status}
                            </button>
                          </td>

                          {/* 6. Actions */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => setEditingStaff(staff)}
                                className="p-1.5 rounded-lg border border-[#E5E7EB] hover:bg-[#F3F4F4] text-[#021526] transition-colors"
                                title="Edit Staff Member"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => setDeletingStaff(staff)}
                                className="p-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-600 transition-colors"
                                title="Delete Staff Member"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB: SPORTS, CATEGORIES & AMENITIES */}
      {activeTab === 'sports' && (
        <div className="space-y-6">
          {/* SUB-TABS NAVIGATION */}
          <div className="flex items-center gap-2 border-b border-[#E5E7EB] pb-2 overflow-x-auto">
            <button
              type="button"
              onClick={() => setSportsSubTab('SPORTS')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                sportsSubTab === 'SPORTS'
                  ? 'bg-[#021526] text-white shadow-xs'
                  : 'bg-white text-[#5F6368] hover:bg-slate-100 border border-[#E5E7EB]'
              }`}
            >
              <Trophy className="h-4 w-4 text-[#F94001]" />
              <span>Sports &amp; Formats</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  sportsSubTab === 'SPORTS' ? 'bg-[#F94001] text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                {sportsList.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSportsSubTab('AMENITIES')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                sportsSubTab === 'AMENITIES'
                  ? 'bg-[#021526] text-white shadow-xs'
                  : 'bg-white text-[#5F6368] hover:bg-slate-100 border border-[#E5E7EB]'
              }`}
            >
              <Building2 className="h-4 w-4 text-[#F94001]" />
              <span>Facility Amenities</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  sportsSubTab === 'AMENITIES' ? 'bg-[#F94001] text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                {amenitiesList.length}
              </span>
            </button>
          </div>

          {/* 1. SUB-TAB: SPORTS & FORMATS */}
          {sportsSubTab === 'SPORTS' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-[#F94001]" />
                    <h2 className="text-base font-black text-[#021526] font-display">
                      Sports &amp; Match Formats Directory
                    </h2>
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#FFF1EC] text-[#F94001] border border-[#F94001]/20">
                      {sportsList.length} Sports
                    </span>
                  </div>
                  <p className="text-xs text-[#5F6368] mt-0.5">
                    Supported sports and match formats for venue court configuration and player bookings.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleOpenAddSport}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#F94001] hover:bg-[#d83700] text-white px-4 py-2.5 text-xs font-bold shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer shrink-0"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add New Sport</span>
                </button>
              </div>

              {/* SPORTS GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sportsList.map((sport) => (
                  <div
                    key={sport.sport_id}
                    className="rounded-2xl bg-white p-5 border border-[#E5E7EB] shadow-xs space-y-3 hover:border-[#F94001]/50 hover:shadow-md transition-all group relative"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-sm text-[#021526]">
                          {sport.name}
                        </h3>
                        <p className="font-mono text-[10px] text-[#F94001] font-bold">
                          {sport.sport_id}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            sport.is_active !== false
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {sport.is_active !== false ? 'ACTIVE' : 'INACTIVE'}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleOpenEditSport(sport)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-[#021526] hover:bg-[#F3F4F4] transition-colors cursor-pointer"
                          title="Edit Sport & Formats"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeletingSport(sport)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete Sport"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs pt-2 border-t border-[#F3F4F4]">
                      <span className="text-[#5F6368] text-[11px] font-semibold">
                        Supported Match Formats:
                      </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {sport.supported_formats.map((fmt) => (
                          <span
                            key={fmt}
                            className="px-2 py-0.5 rounded bg-[#F8F9FA] text-[#021526] font-semibold text-[10px] border border-[#E5E7EB]"
                          >
                            {fmt}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. SUB-TAB: FACILITY AMENITIES (Category & Name) */}
          {sportsSubTab === 'AMENITIES' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-[#F94001]" />
                    <h2 className="text-base font-black text-[#021526] font-display">
                      Facility Amenities Directory
                    </h2>
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#FFF1EC] text-[#F94001] border border-[#F94001]/20">
                      {amenitiesList.length} Amenities
                    </span>
                  </div>
                  <p className="text-xs text-[#5F6368] mt-0.5">
                    Configured facility amenities with Category classifications and names for venue onboardings.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleOpenAddAmenity}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#F94001] hover:bg-[#d83700] text-white px-4 py-2.5 text-xs font-bold shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer shrink-0"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add New Amenity</span>
                </button>
              </div>

              {/* AMENITIES GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {amenitiesList.map((amenity) => {
                  const getCategoryBadgeClass = (cat: string) => {
                    switch (cat?.toLowerCase()) {
                      case 'lighting':
                        return 'bg-amber-100 text-amber-800 border-amber-200';
                      case 'facility':
                        return 'bg-blue-100 text-blue-800 border-blue-200';
                      case 'refreshment':
                        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
                      case 'safety':
                        return 'bg-rose-100 text-rose-800 border-rose-200';
                      case 'equipment':
                        return 'bg-purple-100 text-purple-800 border-purple-200';
                      default:
                        return 'bg-slate-100 text-slate-800 border-slate-200';
                    }
                  };

                  return (
                    <div
                      key={amenity.amenity_id}
                      className="rounded-2xl bg-white p-4 sm:p-5 border border-[#E5E7EB] shadow-xs space-y-3 hover:border-[#F94001]/50 hover:shadow-md transition-all group relative flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getCategoryBadgeClass(
                              amenity.category,
                            )}`}
                          >
                            {amenity.category || 'Facility'}
                          </span>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleOpenEditAmenity(amenity)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-[#021526] hover:bg-[#F3F4F4] transition-colors cursor-pointer"
                              title="Edit Amenity"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeletingAmenity(amenity)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Delete Amenity"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>

                        <div>
                          <h3 className="font-bold text-sm text-[#021526] leading-tight">
                            {amenity.name}
                          </h3>
                          <p className="font-mono text-[10px] text-[#F94001] font-bold mt-1">
                            {amenity.amenity_id}
                          </p>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-[#F3F4F4] flex items-center justify-between text-[11px] text-[#5F6368]">
                        <span>Category: <strong>{amenity.category || 'Facility'}</strong></span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: SUPPORT CHANNELS */}
      {activeTab === 'support' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-2xl bg-white p-6 border border-[#E5E7EB] shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-[#021526]">
              <LifeBuoy className="h-4 w-4 text-[#F94001]" />
              <span>Official Partner Help Desk</span>
            </div>

            <div className="space-y-3 text-xs text-[#021526]">
              <div className="p-3.5 rounded-xl bg-[#FFF1EC] border border-[#F94001]/20 space-y-1.5">
                <span className="font-bold text-[#F94001]">Dedicated Partner Support</span>
                <p className="text-[#5F6368] text-[11px]">
                  Support Email: <strong className="text-[#021526]">partners@ibooksports.com</strong>
                </p>
                <p className="text-[#5F6368] text-[11px]">
                  WhatsApp Support Line: <strong className="text-[#021526]">+91 98765 43210</strong>
                </p>
                <p className="text-[#5F6368] text-[11px]">
                  Operating Hours: <strong className="text-[#021526]">Mon - Sun: 06:00 AM - 11:00 PM IST</strong>
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F8F9FA] border border-[#E5E7EB] space-y-1">
                <span className="font-bold text-[#021526]">Escalation Level</span>
                <p className="text-[#5F6368] text-[11px]">
                  Priority Support Level: <strong className="text-[#F94001]">Tier 1 — Direct Response</strong>
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 border border-[#E5E7EB] shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-[#021526]">
              <Users className="h-4 w-4 text-[#F94001]" />
              <span>Support Ticket Assignments</span>
            </div>

            <p className="text-xs text-[#5F6368]">
              All partner helpdesk queries and phone support calls are routed to active staff members with the{' '}
              <strong className="text-[#021526]">SUPPORT_AGENT</strong> role.
            </p>

            <div className="p-3.5 rounded-xl bg-[#F8F9FA] border border-[#E5E7EB] space-y-2 text-xs">
              <span className="font-bold text-[#021526]">Active Support Staff On Duty:</span>
              <div className="space-y-1.5">
                {staffList
                  .filter((s) => s.role === 'SUPPORT_AGENT' && s.status === 'ACTIVE')
                  .map((s) => (
                    <div key={s.id} className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-[#021526]">{s.name}</span>
                      <span className="font-mono text-[#5F6368]">+91 {s.phone_number}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SYSTEM HEALTH */}
      {activeTab === 'system' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-2xl bg-white p-6 border border-[#E5E7EB] shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-[#021526]">
              <ShieldCheck className="h-4 w-4 text-[#F94001]" />
              <span>Backend & Database Status</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-[#F8F9FA] border border-[#E5E7EB] space-y-1">
                <span className="font-bold text-[#021526]">Target Database</span>
                <p className="text-[#5F6368] text-[11px]">
                  Database: <strong className="text-[#021526]">PostgreSQL (Port 5432)</strong>
                </p>
                <p className="text-[#5F6368] text-[11px]">
                  Connection Status: <strong className="text-emerald-700">Healthy & Online</strong>
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F8F9FA] border border-[#E5E7EB] space-y-1">
                <span className="font-bold text-[#021526]">API Documentation</span>
                <p className="text-[#5F6368] text-[11px]">
                  Swagger UI Docs: <a href="http://localhost:4000/api/v1/docs" target="_blank" rel="noreferrer" className="text-[#F94001] font-bold hover:underline">Open Swagger UI &rarr;</a>
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 border border-[#E5E7EB] shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-[#021526]">
              <Settings className="h-4 w-4 text-[#F94001]" />
              <span>Security & Roles Summary</span>
            </div>

            <div className="space-y-2 text-xs">
              {roles.map((r) => (
                <div key={r.key} className="p-2.5 rounded-xl bg-[#F8F9FA] border border-[#E5E7EB]">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#021526]">{r.title}</span>
                    <span className="text-[10px] font-mono text-[#5F6368]">{r.key}</span>
                  </div>
                  <p className="text-[#5F6368] text-[11px] mt-0.5">{r.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CREATE STAFF MODAL */}
      {mounted && isCreateModalOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] top-0 left-0 right-0 bottom-0 w-screen h-screen bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-[#E5E7EB] overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 bg-[#021526] text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-[#F94001] flex items-center justify-center text-white shadow-md">
                  <UserPlus className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-black tracking-tight font-display text-white">
                    Create New Staff Member
                  </h2>
                  <p className="text-xs text-slate-300">
                    Register a new user with Name, Email ID, Phone No, and Role dropdown
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateStaff} className="p-5 sm:p-6 space-y-4">
              {/* 1. Name */}
              <div>
                <label htmlFor={nameInputId} className="block text-xs font-bold text-[#021526] mb-1">
                  Staff Member Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  id={nameInputId}
                  type="text"
                  placeholder="e.g. Arun Kumar"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#F8F9FA] border ${
                    formErrors.name ? 'border-rose-500 bg-rose-50/50' : 'border-[#E5E7EB]'
                  } text-[#021526] focus:outline-none focus:border-[#F94001] focus:bg-white transition-all`}
                />
                {formErrors.name && (
                  <p className="text-[11px] text-rose-500 mt-1 font-medium">{formErrors.name}</p>
                )}
              </div>

              {/* 2. Email ID */}
              <div>
                <label htmlFor={emailInputId} className="block text-xs font-bold text-[#021526] mb-1">
                  Official Email ID <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 h-4 w-4 text-[#5F6368]" />
                  <input
                    id={emailInputId}
                    type="email"
                    placeholder="e.g. arun.kumar@ibooksports.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs bg-[#F8F9FA] border ${
                      formErrors.email ? 'border-rose-500 bg-rose-50/50' : 'border-[#E5E7EB]'
                    } text-[#021526] focus:outline-none focus:border-[#F94001] focus:bg-white transition-all`}
                  />
                </div>
                {formErrors.email && (
                  <p className="text-[11px] text-rose-500 mt-1 font-medium">{formErrors.email}</p>
                )}
              </div>

              {/* 3. Phone Number (ph no) */}
              <div>
                <label htmlFor={phoneInputId} className="block text-xs font-bold text-[#021526] mb-1">
                  Mobile Phone Number (ph no) <span className="text-rose-500">*</span>
                </label>
                <div className="flex gap-2">
                  <span className="px-3.5 py-2.5 rounded-xl bg-[#E5E7EB] text-xs font-bold text-[#021526] shrink-0">
                    🇮🇳 +91
                  </span>
                  <input
                    id={phoneInputId}
                    type="tel"
                    maxLength={10}
                    placeholder="10-digit number e.g. 9876543210"
                    value={formData.phone_number}
                    onChange={(e) =>
                      setFormData({ ...formData, phone_number: e.target.value.replace(/\D/g, '') })
                    }
                    className={`flex-1 px-3.5 py-2.5 rounded-xl text-xs bg-[#F8F9FA] border ${
                      formErrors.phone_number ? 'border-rose-500 bg-rose-50/50' : 'border-[#E5E7EB]'
                    } text-[#021526] focus:outline-none focus:border-[#F94001] focus:bg-white transition-all font-mono`}
                  />
                </div>
                {formErrors.phone_number && (
                  <p className="text-[11px] text-rose-500 mt-1 font-medium">
                    {formErrors.phone_number}
                  </p>
                )}
              </div>

              {/* 4. Role Dropdown */}
              <div>
                <label htmlFor={roleSelectId} className="block text-xs font-bold text-[#021526] mb-1">
                  Assigned Staff Role (Dropdown) <span className="text-rose-500">*</span>
                </label>
                <select
                  id={roleSelectId}
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#F8F9FA] border border-[#E5E7EB] text-[#021526] font-bold focus:outline-none focus:border-[#F94001] focus:bg-white transition-all cursor-pointer"
                >
                  {roles.map((role) => (
                    <option key={role.key} value={role.key}>
                      {role.title} ({role.key})
                    </option>
                  ))}
                </select>
                {/* Role Description Preview */}
                {roles.find((r) => r.key === formData.role) && (
                  <div className="mt-2 p-2.5 rounded-xl bg-[#F8F9FA] border border-[#E5E7EB] text-[11px] text-[#5F6368]">
                    <p className="font-semibold text-[#021526]">
                      {roles.find((r) => r.key === formData.role)?.description}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {roles
                        .find((r) => r.key === formData.role)
                        ?.permissions.map((perm) => (
                          <span
                            key={perm}
                            className="bg-white border border-[#E5E7EB] text-[10px] font-bold px-2 py-0.5 rounded text-[#021526]"
                          >
                            ✓ {perm}
                          </span>
                        ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 5. Department (Optional) */}
              <div>
                <label htmlFor={departmentInputId} className="block text-xs font-bold text-[#021526] mb-1">
                  Department / Unit (Optional)
                </label>
                <input
                  id={departmentInputId}
                  type="text"
                  placeholder="e.g. Operations & Venues, KYC Verification..."
                  value={formData.department || ''}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#F8F9FA] border border-[#E5E7EB] text-[#021526] focus:outline-none focus:border-[#F94001] focus:bg-white transition-all"
                />
              </div>

              {/* Footer Buttons */}
              <div className="pt-4 border-t border-[#E5E7EB] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#E5E7EB] text-xs font-bold text-[#5F6368] hover:bg-[#F8F9FA] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 bg-[#F94001] hover:bg-[#d93600] text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Creating Staff...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4" />
                      <span>Create Staff Member</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* EDIT STAFF MODAL */}
      {mounted && editingStaff && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] top-0 left-0 right-0 bottom-0 w-screen h-screen bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-[#E5E7EB] overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 sm:p-6 bg-[#021526] text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-md">
                  <Edit2 className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-black tracking-tight font-display text-white">
                    Edit Staff Profile
                  </h2>
                  <p className="text-xs text-slate-300">Update staff details, contact info, and role</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingStaff(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateStaff} className="p-5 sm:p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#021526] mb-1">Full Name</label>
                <input
                  type="text"
                  value={editingStaff.name}
                  onChange={(e) => setEditingStaff({ ...editingStaff, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#F8F9FA] border border-[#E5E7EB] text-[#021526] focus:outline-none focus:border-[#F94001]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#021526] mb-1">Email ID</label>
                <input
                  type="email"
                  value={editingStaff.email}
                  onChange={(e) => setEditingStaff({ ...editingStaff, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#F8F9FA] border border-[#E5E7EB] text-[#021526] focus:outline-none focus:border-[#F94001]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#021526] mb-1">Phone Number (ph no)</label>
                <div className="flex gap-2">
                  <span className="px-3.5 py-2.5 rounded-xl bg-[#E5E7EB] text-xs font-bold text-[#021526] shrink-0">
                    🇮🇳 +91
                  </span>
                  <input
                    type="tel"
                    maxLength={10}
                    value={editingStaff.phone_number}
                    onChange={(e) =>
                      setEditingStaff({
                        ...editingStaff,
                        phone_number: e.target.value.replace(/\D/g, ''),
                      })
                    }
                    className="flex-1 px-3.5 py-2.5 rounded-xl text-xs bg-[#F8F9FA] border border-[#E5E7EB] text-[#021526] font-mono focus:outline-none focus:border-[#F94001]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#021526] mb-1">Role Dropdown</label>
                <select
                  value={editingStaff.role}
                  onChange={(e) => setEditingStaff({ ...editingStaff, role: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#F8F9FA] border border-[#E5E7EB] text-[#021526] font-bold focus:outline-none focus:border-[#F94001] cursor-pointer"
                >
                  {roles.map((role) => (
                    <option key={role.key} value={role.key}>
                      {role.title} ({role.key})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#021526] mb-1">Department</label>
                <input
                  type="text"
                  value={editingStaff.department}
                  onChange={(e) => setEditingStaff({ ...editingStaff, department: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#F8F9FA] border border-[#E5E7EB] text-[#021526] focus:outline-none focus:border-[#F94001]"
                />
              </div>

              <div className="pt-4 border-t border-[#E5E7EB] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingStaff(null)}
                  className="px-4 py-2.5 rounded-xl border border-[#E5E7EB] text-xs font-bold text-[#5F6368] hover:bg-[#F8F9FA]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 bg-[#021526] hover:bg-[#06243f] text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 text-emerald-400" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {mounted && deletingStaff && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] top-0 left-0 right-0 bottom-0 w-screen h-screen bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-rose-200 overflow-hidden p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-[#021526] font-display">Delete Staff Member?</h3>
                <p className="text-xs text-[#5F6368]">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-[#5F6368] leading-relaxed">
              Are you sure you want to remove <strong className="text-[#021526]">{deletingStaff.name}</strong> (
              <span className="font-mono text-[#F94001]">{deletingStaff.id}</span>) from the platform? They will immediately lose system access.
            </p>

            <div className="pt-3 border-t border-[#E5E7EB] flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setDeletingStaff(null)}
                className="px-4 py-2 rounded-xl border border-[#E5E7EB] text-xs font-bold text-[#5F6368] hover:bg-[#F8F9FA]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteStaff}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md transition-all disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ADD / EDIT SPORT MODAL */}
      {mounted && isSportModalOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] top-0 left-0 right-0 bottom-0 w-screen h-screen bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-[#E5E7EB] overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-[#E5E7EB] flex items-center justify-between bg-gradient-to-r from-orange-50/50 to-white">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-[#FFF1EC] text-[#F94001] flex items-center justify-center shrink-0 shadow-xs">
                  <Trophy className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#021526] font-display">
                    {editingSport ? 'Edit Sport & Formats' : 'Add New Sport & Formats'}
                  </h3>
                  <p className="text-xs text-[#5F6368]">
                    Configure sport definition and supported playing/match formats.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSportModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSport} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#021526] mb-1">
                    Sport Name <span className="text-[#F94001]">*</span>
                  </label>
                  <input
                    type="text"
                    value={sportName}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSportName(val);
                      if (!editingSport) {
                        setSportId(val.toUpperCase().trim().replace(/[^A-Z0-9]+/g, '_'));
                      }
                    }}
                    placeholder="e.g. Padel Tennis"
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#F8F9FA] border border-[#E5E7EB] text-[#021526] focus:outline-none focus:border-[#F94001]"
                    required
                  />
                  {sportFormErrors.name && (
                    <p className="text-[11px] text-rose-600 mt-1">{sportFormErrors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#021526] mb-1">
                    Sport Code / ID <span className="text-[#F94001]">*</span>
                  </label>
                  <input
                    type="text"
                    value={sportId}
                    onChange={(e) => setSportId(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '_'))}
                    placeholder="e.g. PADEL"
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#F8F9FA] border border-[#E5E7EB] text-[#021526] font-mono font-bold focus:outline-none focus:border-[#F94001]"
                    required
                  />
                  {sportFormErrors.sport_id && (
                    <p className="text-[11px] text-rose-600 mt-1">{sportFormErrors.sport_id}</p>
                  )}
                </div>
              </div>

              {/* Match Formats Manager */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#021526]">
                  Supported Match Formats <span className="text-[#F94001]">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newFormatInput}
                    onChange={(e) => setNewFormatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddFormatTag();
                      }
                    }}
                    placeholder="Add a format (e.g. 5v5, Doubles, T20, 1v1) and press Enter"
                    className="flex-1 px-3.5 py-2 rounded-xl text-xs bg-[#F8F9FA] border border-[#E5E7EB] text-[#021526] focus:outline-none focus:border-[#F94001]"
                  />
                  <button
                    type="button"
                    onClick={handleAddFormatTag}
                    className="px-3.5 py-2 rounded-xl bg-[#021526] hover:bg-[#06243f] text-white text-xs font-bold transition-all cursor-pointer shrink-0"
                  >
                    + Add Format
                  </button>
                </div>

                {/* Tags List */}
                <div className="flex flex-wrap gap-1.5 p-3 rounded-2xl bg-[#F8F9FA] border border-[#E5E7EB] min-h-[50px] items-center">
                  {sportFormats.length === 0 ? (
                    <span className="text-xs text-[#5F6368] italic">No formats added yet. Type above and click "+ Add Format"</span>
                  ) : (
                    sportFormats.map((fmt) => (
                      <span
                        key={fmt}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-[#CBD5E1] text-[#021526] text-xs font-semibold shadow-2xs"
                      >
                        <span>{fmt}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveFormatTag(fmt)}
                          className="text-slate-400 hover:text-rose-600 font-bold cursor-pointer"
                          title={`Remove ${fmt}`}
                        >
                          ✕
                        </button>
                      </span>
                    ))
                  )}
                </div>
                {sportFormErrors.formats && (
                  <p className="text-[11px] text-rose-600">{sportFormErrors.formats}</p>
                )}
              </div>

              {/* Status Toggle */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-[#F8F9FA] border border-[#E5E7EB]">
                <div>
                  <span className="text-xs font-bold text-[#021526] block">Status</span>
                  <span className="text-[11px] text-[#5F6368]">Active sports will be available for venue listings</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSportIsActive(!sportIsActive)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    sportIsActive
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {sportIsActive ? 'ACTIVE' : 'INACTIVE'}
                </button>
              </div>

              <div className="pt-4 border-t border-[#E5E7EB] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsSportModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#E5E7EB] text-xs font-bold text-[#5F6368] hover:bg-[#F8F9FA] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingSport}
                  className="inline-flex items-center gap-2 bg-[#F94001] hover:bg-[#d83700] text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmittingSport ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      <span>{editingSport ? 'Update Sport & Formats' : 'Save New Sport'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* DELETE SPORT CONFIRMATION MODAL */}
      {mounted && deletingSport && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] top-0 left-0 right-0 bottom-0 w-screen h-screen bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-rose-200 overflow-hidden p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-[#021526] font-display">Delete Sport?</h3>
                <p className="text-xs text-[#5F6368]">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-[#5F6368] leading-relaxed">
              Are you sure you want to remove <strong className="text-[#021526]">{deletingSport.name}</strong> (
              <span className="font-mono text-[#F94001]">{deletingSport.sport_id}</span>) and all its match formats from the directory?
            </p>

            <div className="pt-3 border-t border-[#E5E7EB] flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setDeletingSport(null)}
                className="px-4 py-2 rounded-xl border border-[#E5E7EB] text-xs font-bold text-[#5F6368] hover:bg-[#F8F9FA] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteSport}
                disabled={isSubmittingSport}
                className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {isSubmittingSport ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* CREATE / EDIT AMENITY MODAL */}
      {mounted && isAmenityModalOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] top-0 left-0 right-0 bottom-0 w-screen h-screen bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-[#E5E7EB] overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 bg-[#021526] text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-[#F94001] flex items-center justify-center text-white shadow-xs">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white font-display">
                    {editingAmenity ? 'Edit Facility Amenity' : 'Add New Facility Amenity'}
                  </h3>
                  <p className="text-[11px] text-slate-300">Configure amenity name and classification category</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAmenityModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAmenity} className="p-5 sm:p-6 space-y-4">
              {/* 1. Category Classification First */}
              <div>
                <label className="block text-xs font-bold text-[#021526] mb-1">
                  Amenity Category (Classification) <span className="text-[#F94001]">*</span>
                </label>
                <select
                  value={amenityCategory}
                  onChange={(e) => setAmenityCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#F8F9FA] border border-[#E5E7EB] text-[#021526] font-bold focus:outline-none focus:border-[#F94001] cursor-pointer"
                >
                  <option value="Facility">Facility (Parking, Change Rooms, Seating)</option>
                  <option value="Lighting">Lighting (Floodlights, Natural Daylight)</option>
                  <option value="Refreshment">Refreshment (Drinking Water, Cafeteria)</option>
                  <option value="Safety">Safety (First Aid, Security, Fire Extinguisher)</option>
                  <option value="Equipment">Equipment (Rental Gear, Bats, Balls)</option>
                  <option value="General">General Amenity</option>
                </select>
              </div>

              {/* 2. Amenity Name Second */}
              <div>
                <label className="block text-xs font-bold text-[#021526] mb-1">
                  Amenity Name <span className="text-[#F94001]">*</span>
                </label>
                <input
                  type="text"
                  value={amenityName}
                  onChange={(e) => {
                    const val = e.target.value;
                    setAmenityName(val);
                    if (!editingAmenity) {
                      const clean = val.toUpperCase().trim().replace(/[^A-Z0-9]+/g, '_').replace(/^_+|_+$/g, '');
                      setAmenityId(clean ? `AMN_${clean}` : '');
                    }
                  }}
                  placeholder="e.g. Car & Bike Parking"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#F8F9FA] border border-[#E5E7EB] text-[#021526] focus:outline-none focus:border-[#F94001]"
                  required
                />
                {amenityFormErrors.name && (
                  <p className="text-[11px] text-rose-600 mt-1">{amenityFormErrors.name}</p>
                )}
              </div>

              {/* 3. Amenity Code / ID Auto-generated */}
              <div>
                <label className="block text-xs font-bold text-[#021526] mb-1">
                  Amenity Code / ID <span className="text-[#F94001]">*</span>
                </label>
                <input
                  type="text"
                  value={amenityId}
                  onChange={(e) => setAmenityId(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '_'))}
                  placeholder="e.g. AMN_PARKING"
                  disabled={!!editingAmenity}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#F8F9FA] border border-[#E5E7EB] text-[#021526] font-mono font-bold focus:outline-none focus:border-[#F94001] disabled:opacity-60"
                  required
                />
                {amenityFormErrors.amenity_id && (
                  <p className="text-[11px] text-rose-600 mt-1">{amenityFormErrors.amenity_id}</p>
                )}
              </div>

              <div className="pt-4 border-t border-[#E5E7EB] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAmenityModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#E5E7EB] text-xs font-bold text-[#5F6368] hover:bg-[#F8F9FA] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAmenity}
                  className="inline-flex items-center gap-2 bg-[#F94001] hover:bg-[#d83700] text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmittingAmenity ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      <span>{editingAmenity ? 'Update Amenity' : 'Save Amenity'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* DELETE AMENITY CONFIRMATION MODAL */}
      {mounted && deletingAmenity && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] top-0 left-0 right-0 bottom-0 w-screen h-screen bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-rose-200 overflow-hidden p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-[#021526] font-display">Delete Amenity?</h3>
                <p className="text-xs text-[#5F6368]">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-[#5F6368] leading-relaxed">
              Are you sure you want to remove <strong className="text-[#021526]">{deletingAmenity.name}</strong> (
              <span className="font-mono text-[#F94001]">{deletingAmenity.amenity_id}</span>)?
            </p>

            <div className="pt-3 border-t border-[#E5E7EB] flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setDeletingAmenity(null)}
                className="px-4 py-2 rounded-xl border border-[#E5E7EB] text-xs font-bold text-[#5F6368] hover:bg-[#F8F9FA] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteAmenity}
                disabled={isSubmittingAmenity}
                className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {isSubmittingAmenity ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
