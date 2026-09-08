// Comprehensive Realistic Mock Data for iBookSports Super Admin Suite

export interface VenueDetail {
  id: string;
  venue_name: string;
  tagline: string;
  name: string; // Owner Name
  mobile_number: number;
  email: string;
  venue_location_name: string; // Maps URL
  address: string;
  state: string;
  district: string;
  pincode: string;
  sports: string;
  sports_list: string[];
  courts: number;
  status: 'ACTIVE' | 'PENDING' | 'MAINTENANCE';
  rating: number;
  total_reviews: number;
  opening_time: string;
  closing_time: string;
  created_at: string;
  
  // Owner & KYC Details
  owner: {
    full_name: string;
    phone: string;
    email: string;
    pan_number: string;
    pan_status: 'VERIFIED' | 'PENDING';
    aadhaar_masked: string;
    aadhaar_status: 'VERIFIED' | 'PENDING';
    gstin: string;
    gstin_status: 'ACTIVE' | 'UNREGISTERED';
    registered_address: string;
    kyc_verified_date: string;
  };

  // Bank & Payout Details
  bank: {
    account_holder_name: string;
    bank_name: string;
    account_number_masked: string;
    ifsc_code: string;
    branch_name: string;
    upi_id: string;
    verification_status: 'VERIFIED' | 'PENDING';
    penny_drop_status: 'SUCCESS' | 'FAILED';
    last_payout_date: string;
  };

  // Courts
  court_list: {
    id: string;
    name: string;
    sport: string;
    surface: string; // e.g. 'FIFA Pro 50mm Astroturf', 'BWF Synthetic Mat'
    court_type: 'OUTDOOR' | 'INDOOR' | 'COVERED ROOF';
    dimensions: string;
    lighting: string; // e.g. '400 Lux Commercial LED'
    base_hourly_rate: number;
    status: 'ACTIVE' | 'MAINTENANCE';
  }[];

  // Slots
  slot_rules: {
    slot_duration_minutes: number;
    peak_morning_hours: string;
    peak_morning_price: number;
    regular_day_hours: string;
    regular_day_price: number;
    prime_night_hours: string;
    prime_night_price: number;
    weekend_surge_percent: number;
    instant_booking_enabled: boolean;
  };

  // Financial Stats
  financials: {
    gross_volume: number;
    platform_commission: number;
    unsettled_balance: number;
    total_settled: number;
  };
}

export interface CustomerItem {
  id: string;
  name: string;
  phone: string;
  email: string;
  city: string;
  registered_at: string;
  tier: 'PLATINUM' | 'GOLD' | 'SILVER' | 'REGULAR';
  status: 'ACTIVE' | 'SUSPENDED';
  total_bookings: number;
  total_spent: number;
  wallet_balance: number;
  preferred_sports: string[];
  favorite_venues: string[];
  cancellation_count: number;
}

export interface BookingItem {
  id: string;
  booking_code: string;
  customer_id: string;
  customer_name: string;
  customer_phone: string;
  venue_id: string;
  venue_name: string;
  court_id: string;
  court_name: string;
  sport: string;
  booking_date: string;
  time_slot: string;
  duration_minutes: number;
  total_amount: number;
  platform_fee: number;
  venue_share: number;
  payment_status: 'PAID' | 'REFUNDED' | 'FAILED';
  booking_status: 'CONFIRMED' | 'IN_PLAY' | 'COMPLETED' | 'CANCELLED';
  payment_method: 'UPI' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'NET_BANKING' | 'WALLET';
  transaction_id: string;
  created_at: string;
}

export interface PaymentTransactionItem {
  id: string;
  txn_id: string;
  gateway_order_id: string;
  gateway_payment_id: string;
  booking_code: string;
  venue_name: string;
  customer_name: string;
  customer_phone: string;
  gross_amount: number;
  gateway_fee: number;
  platform_commission: number;
  tax_gst: number;
  net_venue_payout: number;
  payment_method: string;
  gateway: 'RAZORPAY' | 'PHONEPE' | 'CASHFREE';
  status: 'SUCCESS' | 'REFUNDED' | 'FAILED' | 'PROCESSING';
  timestamp: string;
}

export interface SettlementBatchItem {
  id: string;
  batch_number: string;
  venue_id: string;
  venue_name: string;
  owner_name: string;
  bank_name: string;
  account_number_masked: string;
  ifsc_code: string;
  period_start: string;
  period_end: string;
  bookings_count: number;
  gross_booking_amount: number;
  platform_commission_deducted: number;
  tds_deducted: number;
  net_payable: number;
  status: 'SETTLED' | 'PROCESSING' | 'PENDING_APPROVAL';
  utr_number?: string;
  settled_at?: string;
}

export interface SupportTicketItem {
  id: string;
  ticket_number: string; // Support ID, e.g. SUP-2026-101
  category: 'PAYMENT' | 'BOOKING' | 'TECHNICAL' | 'SETTLEMENTS' | 'GENERAL' | 'OTHERS';
  priority: 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';
  subject: string;
  description: string;
  related_booking_code?: string; // Optional booking ID
  attachment_url?: string; // Optional attachment link / file
  attachment_name?: string; // Optional attachment file name
  venue_id: string; // Venue ID
  venue_name: string; // Venue Name
  created_person_name: string; // Created person name
  contact_number: string; // Contact phone number
  created_at: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  resolution_notes?: string; // Resolution notes entered when resolving
  resolved_at?: string;
  resolved_by?: string;
  source?: 'VENUE_APP' | 'CUSTOMER_APP' | 'ADMIN_PORTAL';
  conversation: {
    sender: 'VENUE' | 'CUSTOMER' | 'ADMIN';
    sender_name: string;
    message: string;
    timestamp: string;
  }[];
}

// --------------------------------------------------------------------------
// MOCK DATA INSTANCES
// --------------------------------------------------------------------------

export const INITIAL_VENUES: VenueDetail[] = [
  {
    id: 'ven_1001',
    venue_name: 'Sky Sports Arena & Box Turf',
    tagline: 'Coimbatore Premier 7v7 Astroturf & Floodlit Cricket Arena',
    name: 'Karthik Rajan',
    mobile_number: 9876543210,
    email: 'karthik@skysportsarena.com',
    venue_location_name: 'https://www.google.com/maps?q=11.0283,77.0012',
    address: 'Survey 142, Avinashi Road, Near CIT College, Peelamedu',
    district: 'Coimbatore',
    state: 'Tamil Nadu',
    pincode: '641014',
    sports: 'FOOTBALL, CRICKET, BADMINTON',
    sports_list: ['Football', 'Box Cricket', 'Badminton'],
    courts: 4,
    status: 'ACTIVE',
    rating: 4.8,
    total_reviews: 342,
    opening_time: '05:00 AM',
    closing_time: '11:30 PM',
    created_at: '2025-01-15T10:00:00Z',
    owner: {
      full_name: 'Karthik Rajan',
      phone: '+91 98765 43210',
      email: 'karthik@skysportsarena.com',
      pan_number: 'ABCDE1234F',
      pan_status: 'VERIFIED',
      aadhaar_masked: 'XXXX-XXXX-4891',
      aadhaar_status: 'VERIFIED',
      gstin: '33AABCS1429L1Z5',
      gstin_status: 'ACTIVE',
      registered_address: '14/B, Avinashi Road, Peelamedu, Coimbatore 641014',
      kyc_verified_date: '2025-01-18',
    },
    bank: {
      account_holder_name: 'Sky Sports Arena Ventures LLP',
      bank_name: 'HDFC Bank Ltd',
      account_number_masked: '•••• •••• 9012',
      ifsc_code: 'HDFC0001248',
      branch_name: 'Peelamedu Branch, Coimbatore',
      upi_id: 'skysportsarena@okhdfcbank',
      verification_status: 'VERIFIED',
      penny_drop_status: 'SUCCESS',
      last_payout_date: '2026-03-05',
    },
    court_list: [
      {
        id: 'crt_101',
        name: 'Turf A (Camp Nou 7v7)',
        sport: 'Football',
        surface: 'FIFA Quality Pro 50mm Monofilament Astroturf',
        court_type: 'OUTDOOR',
        dimensions: '110ft x 65ft',
        lighting: '450 Lux Philips Arena Floodlights',
        base_hourly_rate: 1400,
        status: 'ACTIVE',
      },
      {
        id: 'crt_102',
        name: 'Turf B (Bernabeu 5v5)',
        sport: 'Football',
        surface: '40mm High-Density Rubber Infill Turf',
        court_type: 'OUTDOOR',
        dimensions: '85ft x 50ft',
        lighting: '350 Lux Floodlights',
        base_hourly_rate: 1000,
        status: 'ACTIVE',
      },
      {
        id: 'crt_103',
        name: 'Pitch C (Thunder Box Cricket)',
        sport: 'Box Cricket',
        surface: 'Enclosed Nylon Turf with Full Top Netting',
        court_type: 'COVERED ROOF',
        dimensions: '90ft x 45ft',
        lighting: '400 Lux Shadowless LED',
        base_hourly_rate: 1200,
        status: 'ACTIVE',
      },
      {
        id: 'crt_104',
        name: 'Court 1 (Indoor Badminton)',
        sport: 'Badminton',
        surface: 'BWF Grade 1 Synthetic Vinyl Mat over Teakwood',
        court_type: 'INDOOR',
        dimensions: '44ft x 20ft',
        lighting: '500 Lux Anti-Glare LED',
        base_hourly_rate: 450,
        status: 'ACTIVE',
      },
    ],
    slot_rules: {
      slot_duration_minutes: 60,
      peak_morning_hours: '06:00 AM - 09:00 AM',
      peak_morning_price: 1300,
      regular_day_hours: '09:00 AM - 05:00 PM',
      regular_day_price: 1000,
      prime_night_hours: '05:00 PM - 11:30 PM',
      prime_night_price: 1600,
      weekend_surge_percent: 15,
      instant_booking_enabled: true,
    },
    financials: {
      gross_volume: 384000,
      platform_commission: 38400,
      unsettled_balance: 42500,
      total_settled: 303100,
    },
  },
  {
    id: 'ven_1002',
    venue_name: 'Green Field Sports Park',
    tagline: 'Chennai Largest Multi-Sport Complex & Badminton Hub',
    name: 'Vignesh Sundaram',
    mobile_number: 9845123456,
    email: 'vignesh@greenfieldsportspark.in',
    venue_location_name: 'https://www.google.com/maps?q=13.0827,80.2707',
    address: 'Plot 88, 200 Feet Radial Road, Thoraipakkam, OMR',
    district: 'Chennai',
    state: 'Tamil Nadu',
    pincode: '600097',
    sports: 'BADMINTON, FOOTBALL, PICKLEBALL',
    sports_list: ['Badminton', 'Football', 'Pickleball'],
    courts: 6,
    status: 'ACTIVE',
    rating: 4.9,
    total_reviews: 512,
    opening_time: '05:30 AM',
    closing_time: '12:00 AM',
    created_at: '2025-02-01T08:30:00Z',
    owner: {
      full_name: 'Vignesh Sundaram',
      phone: '+91 98451 23456',
      email: 'vignesh@greenfieldsportspark.in',
      pan_number: 'FGHIJ5678K',
      pan_status: 'VERIFIED',
      aadhaar_masked: 'XXXX-XXXX-9124',
      aadhaar_status: 'VERIFIED',
      gstin: '33AACCB8942Q1Z9',
      gstin_status: 'ACTIVE',
      registered_address: 'Plot 88, 200 Feet Radial Road, Thoraipakkam, Chennai 600097',
      kyc_verified_date: '2025-02-04',
    },
    bank: {
      account_holder_name: 'Green Field Sports Enterprises',
      bank_name: 'ICICI Bank',
      account_number_masked: '•••• •••• 4421',
      ifsc_code: 'ICIC0000412',
      branch_name: 'OMR Thoraipakkam Branch, Chennai',
      upi_id: 'greenfieldomr@icici',
      verification_status: 'VERIFIED',
      penny_drop_status: 'SUCCESS',
      last_payout_date: '2026-03-06',
    },
    court_list: [
      {
        id: 'crt_201',
        name: 'Badminton Court 1',
        sport: 'Badminton',
        surface: 'BWF Certified 5mm Mat',
        court_type: 'INDOOR',
        dimensions: '44ft x 20ft',
        lighting: '450 Lux LED',
        base_hourly_rate: 500,
        status: 'ACTIVE',
      },
      {
        id: 'crt_202',
        name: 'Badminton Court 2',
        sport: 'Badminton',
        surface: 'BWF Certified 5mm Mat',
        court_type: 'INDOOR',
        dimensions: '44ft x 20ft',
        lighting: '450 Lux LED',
        base_hourly_rate: 500,
        status: 'ACTIVE',
      },
      {
        id: 'crt_203',
        name: 'Badminton Court 3',
        sport: 'Badminton',
        surface: 'BWF Certified 5mm Mat',
        court_type: 'INDOOR',
        dimensions: '44ft x 20ft',
        lighting: '450 Lux LED',
        base_hourly_rate: 500,
        status: 'ACTIVE',
      },
      {
        id: 'crt_204',
        name: 'Pickleball Pro Court A',
        sport: 'Pickleball',
        surface: 'Cushioned Acrylic Surface USAPA Spec',
        court_type: 'COVERED ROOF',
        dimensions: '44ft x 20ft',
        lighting: '400 Lux LED',
        base_hourly_rate: 650,
        status: 'ACTIVE',
      },
      {
        id: 'crt_205',
        name: 'OMR Grand Turf 7v7',
        sport: 'Football',
        surface: 'FIFA Pro 55mm Turf with Coconut Fibre Infill',
        court_type: 'OUTDOOR',
        dimensions: '120ft x 70ft',
        lighting: '500 Lux Arena Floodlights',
        base_hourly_rate: 1800,
        status: 'ACTIVE',
      },
      {
        id: 'crt_206',
        name: 'OMR Mini Turf 5v5',
        sport: 'Football',
        surface: '40mm Monofilament',
        court_type: 'OUTDOOR',
        dimensions: '80ft x 45ft',
        lighting: '350 Lux Floodlights',
        base_hourly_rate: 1100,
        status: 'ACTIVE',
      },
    ],
    slot_rules: {
      slot_duration_minutes: 60,
      peak_morning_hours: '06:00 AM - 09:30 AM',
      peak_morning_price: 1500,
      regular_day_hours: '09:30 AM - 04:30 PM',
      regular_day_price: 1100,
      prime_night_hours: '04:30 PM - 12:00 AM',
      prime_night_price: 1900,
      weekend_surge_percent: 20,
      instant_booking_enabled: true,
    },
    financials: {
      gross_volume: 612000,
      platform_commission: 61200,
      unsettled_balance: 78200,
      total_settled: 472600,
    },
  },
  {
    id: 'ven_1003',
    venue_name: 'Apex Arena & Sports Club',
    tagline: 'Bengaluru Premier Rooftop Turf & Floodlit Cricket Arena',
    name: 'Ananya Sharma',
    mobile_number: 9711223344,
    email: 'ananya@apexarena.com',
    venue_location_name: 'https://www.google.com/maps?q=12.9716,77.5946',
    address: '7th Floor, Phoenix Mall Terrace, Whitefield',
    district: 'Bengaluru Urban',
    state: 'Karnataka',
    pincode: '560066',
    sports: 'CRICKET, FOOTBALL, TENNIS',
    sports_list: ['Box Cricket', 'Football', 'Tennis'],
    courts: 3,
    status: 'ACTIVE',
    rating: 4.7,
    total_reviews: 289,
    opening_time: '06:00 AM',
    closing_time: '11:00 PM',
    created_at: '2025-02-10T11:15:00Z',
    owner: {
      full_name: 'Ananya Sharma',
      phone: '+91 97112 23344',
      email: 'ananya@apexarena.com',
      pan_number: 'KLMNO9012P',
      pan_status: 'VERIFIED',
      aadhaar_masked: 'XXXX-XXXX-3341',
      aadhaar_status: 'VERIFIED',
      gstin: '29AAAPL4412R1Z3',
      gstin_status: 'ACTIVE',
      registered_address: 'Flat 402, Prestige Palms, Whitefield, Bengaluru 560066',
      kyc_verified_date: '2025-02-14',
    },
    bank: {
      account_holder_name: 'Apex Arena Sports Private Limited',
      bank_name: 'Axis Bank',
      account_number_masked: '•••• •••• 6789',
      ifsc_code: 'UTIB0000843',
      branch_name: 'Whitefield Main Road, Bengaluru',
      upi_id: 'apexarena@axisbank',
      verification_status: 'VERIFIED',
      penny_drop_status: 'SUCCESS',
      last_payout_date: '2026-03-04',
    },
    court_list: [
      {
        id: 'crt_301',
        name: 'Pitch 1 (Rooftop Box Cricket Arena)',
        sport: 'Box Cricket',
        surface: 'Professional Green ShockPad Turf with Net Enclosure',
        court_type: 'COVERED ROOF',
        dimensions: '95ft x 50ft',
        lighting: '450 Lux LED',
        base_hourly_rate: 1300,
        status: 'ACTIVE',
      },
      {
        id: 'crt_302',
        name: 'Turf 2 (Skyline 5v5 Football)',
        sport: 'Football',
        surface: 'FIFA Quality 45mm Turf',
        court_type: 'OUTDOOR',
        dimensions: '85ft x 45ft',
        lighting: '400 Lux Floodlights',
        base_hourly_rate: 1200,
        status: 'ACTIVE',
      },
      {
        id: 'crt_303',
        name: 'Court 3 (Synthetic Lawn Tennis)',
        sport: 'Tennis',
        surface: 'ITF Level 3 Hardcourt Cushion',
        court_type: 'OUTDOOR',
        dimensions: '78ft x 36ft',
        lighting: '500 Lux Championship Grade',
        base_hourly_rate: 800,
        status: 'ACTIVE',
      },
    ],
    slot_rules: {
      slot_duration_minutes: 60,
      peak_morning_hours: '06:00 AM - 09:00 AM',
      peak_morning_price: 1200,
      regular_day_hours: '09:00 AM - 05:00 PM',
      regular_day_price: 900,
      prime_night_hours: '05:00 PM - 11:00 PM',
      prime_night_price: 1500,
      weekend_surge_percent: 25,
      instant_booking_enabled: true,
    },
    financials: {
      gross_volume: 420000,
      platform_commission: 42000,
      unsettled_balance: 31000,
      total_settled: 347000,
    },
  },
];

export const INITIAL_CUSTOMERS: CustomerItem[] = [
  {
    id: 'cust_501',
    name: 'Rahul Krishnan',
    phone: '+91 98401 23456',
    email: 'rahul.krishnan@gmail.com',
    city: 'Chennai',
    registered_at: '2025-03-12',
    tier: 'PLATINUM',
    status: 'ACTIVE',
    total_bookings: 28,
    total_spent: 42500,
    wallet_balance: 1450,
    preferred_sports: ['Football', 'Badminton'],
    favorite_venues: ['Green Field Sports Park', 'Sky Sports Arena'],
    cancellation_count: 1,
  },
  {
    id: 'cust_502',
    name: 'Dinesh Karthik',
    phone: '+91 97910 87654',
    email: 'dk.sportsfan@yahoo.com',
    city: 'Coimbatore',
    registered_at: '2025-04-05',
    tier: 'GOLD',
    status: 'ACTIVE',
    total_bookings: 19,
    total_spent: 26800,
    wallet_balance: 500,
    preferred_sports: ['Box Cricket', 'Football'],
    favorite_venues: ['Sky Sports Arena & Box Turf'],
    cancellation_count: 0,
  },
  {
    id: 'cust_503',
    name: 'Pooja Sundaram',
    phone: '+91 98845 11223',
    email: 'pooja.sundaram@techcorp.in',
    city: 'Bengaluru',
    registered_at: '2025-05-19',
    tier: 'GOLD',
    status: 'ACTIVE',
    total_bookings: 14,
    total_spent: 18900,
    wallet_balance: 800,
    preferred_sports: ['Badminton', 'Pickleball'],
    favorite_venues: ['Apex Arena & Sports Club'],
    cancellation_count: 2,
  },
  {
    id: 'cust_504',
    name: 'Senthil Kumar',
    phone: '+91 94432 99881',
    email: 'senthil.k@autotech.co',
    city: 'Coimbatore',
    registered_at: '2025-06-01',
    tier: 'SILVER',
    status: 'ACTIVE',
    total_bookings: 8,
    total_spent: 9800,
    wallet_balance: 0,
    preferred_sports: ['Football'],
    favorite_venues: ['Sky Sports Arena & Box Turf'],
    cancellation_count: 0,
  },
  {
    id: 'cust_505',
    name: 'Arjun Nambiar',
    phone: '+91 99001 54321',
    email: 'arjun.nambiar@startup.io',
    city: 'Bengaluru',
    registered_at: '2025-07-22',
    tier: 'PLATINUM',
    status: 'ACTIVE',
    total_bookings: 34,
    total_spent: 51200,
    wallet_balance: 2300,
    preferred_sports: ['Tennis', 'Box Cricket'],
    favorite_venues: ['Apex Arena & Sports Club'],
    cancellation_count: 1,
  },
  {
    id: 'cust_506',
    name: 'Kavitha Ramachandran',
    phone: '+91 98411 77665',
    email: 'kavitha.r@outlook.com',
    city: 'Chennai',
    registered_at: '2025-08-14',
    tier: 'REGULAR',
    status: 'ACTIVE',
    total_bookings: 4,
    total_spent: 3600,
    wallet_balance: 200,
    preferred_sports: ['Badminton'],
    favorite_venues: ['Green Field Sports Park'],
    cancellation_count: 0,
  },
];

export const INITIAL_BOOKINGS: BookingItem[] = [
  {
    id: 'bkg_9001',
    booking_code: 'IBS-2603-9001',
    customer_id: 'cust_501',
    customer_name: 'Rahul Krishnan',
    customer_phone: '+91 98401 23456',
    venue_id: 'ven_1001',
    venue_name: 'Sky Sports Arena & Box Turf',
    court_id: 'crt_101',
    court_name: 'Turf A (Camp Nou 7v7)',
    sport: 'Football',
    booking_date: '2026-03-08',
    time_slot: '07:00 PM - 08:00 PM',
    duration_minutes: 60,
    total_amount: 1600,
    platform_fee: 160,
    venue_share: 1440,
    payment_status: 'PAID',
    booking_status: 'IN_PLAY',
    payment_method: 'UPI',
    transaction_id: 'pay_rzp_981240981',
    created_at: '2026-03-07T14:20:00Z',
  },
  {
    id: 'bkg_9002',
    booking_code: 'IBS-2603-9002',
    customer_id: 'cust_502',
    customer_name: 'Dinesh Karthik',
    customer_phone: '+91 97910 87654',
    venue_id: 'ven_1001',
    venue_name: 'Sky Sports Arena & Box Turf',
    court_id: 'crt_103',
    court_name: 'Pitch C (Thunder Box Cricket)',
    sport: 'Box Cricket',
    booking_date: '2026-03-08',
    time_slot: '08:00 PM - 10:00 PM',
    duration_minutes: 120,
    total_amount: 2800,
    platform_fee: 280,
    venue_share: 2520,
    payment_status: 'PAID',
    booking_status: 'CONFIRMED',
    payment_method: 'CREDIT_CARD',
    transaction_id: 'pay_rzp_981240994',
    created_at: '2026-03-08T09:12:00Z',
  },
  {
    id: 'bkg_9003',
    booking_code: 'IBS-2603-9003',
    customer_id: 'cust_503',
    customer_name: 'Pooja Sundaram',
    customer_phone: '+91 98845 11223',
    venue_id: 'ven_1002',
    venue_name: 'Green Field Sports Park',
    court_id: 'crt_201',
    court_name: 'Badminton Court 1',
    sport: 'Badminton',
    booking_date: '2026-03-08',
    time_slot: '06:00 PM - 07:00 PM',
    duration_minutes: 60,
    total_amount: 500,
    platform_fee: 50,
    venue_share: 450,
    payment_status: 'PAID',
    booking_status: 'COMPLETED',
    payment_method: 'UPI',
    transaction_id: 'pay_rzp_981241011',
    created_at: '2026-03-06T19:00:00Z',
  },
  {
    id: 'bkg_9004',
    booking_code: 'IBS-2603-9004',
    customer_id: 'cust_505',
    customer_name: 'Arjun Nambiar',
    customer_phone: '+91 99001 54321',
    venue_id: 'ven_1003',
    venue_name: 'Apex Arena & Sports Club',
    court_id: 'crt_301',
    court_name: 'Pitch 1 (Rooftop Box Cricket Arena)',
    sport: 'Box Cricket',
    booking_date: '2026-03-09',
    time_slot: '06:00 AM - 08:00 AM',
    duration_minutes: 120,
    total_amount: 2400,
    platform_fee: 240,
    venue_share: 2160,
    payment_status: 'PAID',
    booking_status: 'CONFIRMED',
    payment_method: 'UPI',
    transaction_id: 'pay_rzp_981241045',
    created_at: '2026-03-08T07:45:00Z',
  },
  {
    id: 'bkg_9005',
    booking_code: 'IBS-2603-9005',
    customer_id: 'cust_504',
    customer_name: 'Senthil Kumar',
    customer_phone: '+91 94432 99881',
    venue_id: 'ven_1001',
    venue_name: 'Sky Sports Arena & Box Turf',
    court_id: 'crt_102',
    court_name: 'Turf B (Bernabeu 5v5)',
    sport: 'Football',
    booking_date: '2026-03-07',
    time_slot: '07:00 PM - 08:00 PM',
    duration_minutes: 60,
    total_amount: 1100,
    platform_fee: 110,
    venue_share: 990,
    payment_status: 'PAID',
    booking_status: 'COMPLETED',
    payment_method: 'DEBIT_CARD',
    transaction_id: 'pay_rzp_981240801',
    created_at: '2026-03-06T11:10:00Z',
  },
  {
    id: 'bkg_9006',
    booking_code: 'IBS-2603-9006',
    customer_id: 'cust_501',
    customer_name: 'Rahul Krishnan',
    customer_phone: '+91 98401 23456',
    venue_id: 'ven_1002',
    venue_name: 'Green Field Sports Park',
    court_id: 'crt_205',
    court_name: 'OMR Grand Turf 7v7',
    sport: 'Football',
    booking_date: '2026-03-06',
    time_slot: '08:00 PM - 09:00 PM',
    duration_minutes: 60,
    total_amount: 1900,
    platform_fee: 190,
    venue_share: 1710,
    payment_status: 'REFUNDED',
    booking_status: 'CANCELLED',
    payment_method: 'UPI',
    transaction_id: 'pay_rzp_981240672',
    created_at: '2026-03-05T16:30:00Z',
  },
  {
    id: 'bkg_9007',
    booking_code: 'IBS-2603-9007',
    customer_id: 'cust_506',
    customer_name: 'Kavitha Ramachandran',
    customer_phone: '+91 98411 77665',
    venue_id: 'ven_1002',
    venue_name: 'Green Field Sports Park',
    court_id: 'crt_204',
    court_name: 'Pickleball Pro Court A',
    sport: 'Pickleball',
    booking_date: '2026-03-08',
    time_slot: '05:00 PM - 06:00 PM',
    duration_minutes: 60,
    total_amount: 650,
    platform_fee: 65,
    venue_share: 585,
    payment_status: 'PAID',
    booking_status: 'COMPLETED',
    payment_method: 'WALLET',
    transaction_id: 'pay_wlt_981241088',
    created_at: '2026-03-08T12:00:00Z',
  },
];

export const INITIAL_PAYMENTS: PaymentTransactionItem[] = [
  {
    id: 'txn_7001',
    txn_id: 'TXN-20260308-01',
    gateway_order_id: 'order_rZP_9918231',
    gateway_payment_id: 'pay_rzp_981240981',
    booking_code: 'IBS-2603-9001',
    venue_name: 'Sky Sports Arena & Box Turf',
    customer_name: 'Rahul Krishnan',
    customer_phone: '+91 98401 23456',
    gross_amount: 1600,
    gateway_fee: 32,
    platform_commission: 160,
    tax_gst: 28.8,
    net_venue_payout: 1379.2,
    payment_method: 'UPI (GooglePay)',
    gateway: 'RAZORPAY',
    status: 'SUCCESS',
    timestamp: '2026-03-07 14:21:05',
  },
  {
    id: 'txn_7002',
    txn_id: 'TXN-20260308-02',
    gateway_order_id: 'order_rZP_9918244',
    gateway_payment_id: 'pay_rzp_981240994',
    booking_code: 'IBS-2603-9002',
    venue_name: 'Sky Sports Arena & Box Turf',
    customer_name: 'Dinesh Karthik',
    customer_phone: '+91 97910 87654',
    gross_amount: 2800,
    gateway_fee: 56,
    platform_commission: 280,
    tax_gst: 50.4,
    net_venue_payout: 2413.6,
    payment_method: 'HDFC Credit Card',
    gateway: 'RAZORPAY',
    status: 'SUCCESS',
    timestamp: '2026-03-08 09:12:44',
  },
  {
    id: 'txn_7003',
    txn_id: 'TXN-20260308-03',
    gateway_order_id: 'order_rZP_9918289',
    gateway_payment_id: 'pay_rzp_981241011',
    booking_code: 'IBS-2603-9003',
    venue_name: 'Green Field Sports Park',
    customer_name: 'Pooja Sundaram',
    customer_phone: '+91 98845 11223',
    gross_amount: 500,
    gateway_fee: 10,
    platform_commission: 50,
    tax_gst: 9.0,
    net_venue_payout: 431.0,
    payment_method: 'UPI (PhonePe)',
    gateway: 'PHONEPE',
    status: 'SUCCESS',
    timestamp: '2026-03-06 19:01:12',
  },
  {
    id: 'txn_7004',
    txn_id: 'TXN-20260308-04',
    gateway_order_id: 'order_rZP_9918301',
    gateway_payment_id: 'pay_rzp_981241045',
    booking_code: 'IBS-2603-9004',
    venue_name: 'Apex Arena & Sports Club',
    customer_name: 'Arjun Nambiar',
    customer_phone: '+91 99001 54321',
    gross_amount: 2400,
    gateway_fee: 48,
    platform_commission: 240,
    tax_gst: 43.2,
    net_venue_payout: 2068.8,
    payment_method: 'UPI (Paytm)',
    gateway: 'RAZORPAY',
    status: 'SUCCESS',
    timestamp: '2026-03-08 07:46:20',
  },
  {
    id: 'txn_7005',
    txn_id: 'TXN-20260308-05',
    gateway_order_id: 'order_rZP_9918112',
    gateway_payment_id: 'pay_rzp_981240672',
    booking_code: 'IBS-2603-9006',
    venue_name: 'Green Field Sports Park',
    customer_name: 'Rahul Krishnan',
    customer_phone: '+91 98401 23456',
    gross_amount: 1900,
    gateway_fee: 38,
    platform_commission: 190,
    tax_gst: 34.2,
    net_venue_payout: 0,
    payment_method: 'UPI (GooglePay)',
    gateway: 'RAZORPAY',
    status: 'REFUNDED',
    timestamp: '2026-03-05 16:32:00',
  },
];

export const INITIAL_SETTLEMENTS: SettlementBatchItem[] = [
  {
    id: 'stl_401',
    batch_number: 'STL-202603-001',
    venue_id: 'ven_1001',
    venue_name: 'Sky Sports Arena & Box Turf',
    owner_name: 'Karthik Rajan',
    bank_name: 'HDFC Bank Ltd',
    account_number_masked: '•••• •••• 9012',
    ifsc_code: 'HDFC0001248',
    period_start: '2026-02-24',
    period_end: '2026-03-02',
    bookings_count: 48,
    gross_booking_amount: 76800,
    platform_commission_deducted: 7680,
    tds_deducted: 768,
    net_payable: 68352,
    status: 'SETTLED',
    utr_number: 'HDFCR20260303912048',
    settled_at: '2026-03-03 11:30 AM',
  },
  {
    id: 'stl_402',
    batch_number: 'STL-202603-002',
    venue_id: 'ven_1002',
    venue_name: 'Green Field Sports Park',
    owner_name: 'Vignesh Sundaram',
    bank_name: 'ICICI Bank',
    account_number_masked: '•••• •••• 4421',
    ifsc_code: 'ICIC0000412',
    period_start: '2026-02-24',
    period_end: '2026-03-02',
    bookings_count: 72,
    gross_booking_amount: 115200,
    platform_commission_deducted: 11520,
    tds_deducted: 1152,
    net_payable: 102528,
    status: 'SETTLED',
    utr_number: 'ICICR20260303884102',
    settled_at: '2026-03-03 11:45 AM',
  },
  {
    id: 'stl_403',
    batch_number: 'STL-202603-003',
    venue_id: 'ven_1003',
    venue_name: 'Apex Arena & Sports Club',
    owner_name: 'Ananya Sharma',
    bank_name: 'Axis Bank',
    account_number_masked: '•••• •••• 6789',
    ifsc_code: 'UTIB0000843',
    period_start: '2026-02-24',
    period_end: '2026-03-02',
    bookings_count: 38,
    gross_booking_amount: 54000,
    platform_commission_deducted: 5400,
    tds_deducted: 540,
    net_payable: 48060,
    status: 'SETTLED',
    utr_number: 'AXISR20260303774910',
    settled_at: '2026-03-03 12:10 PM',
  },
  {
    id: 'stl_404',
    batch_number: 'STL-202603-004',
    venue_id: 'ven_1001',
    venue_name: 'Sky Sports Arena & Box Turf',
    owner_name: 'Karthik Rajan',
    bank_name: 'HDFC Bank Ltd',
    account_number_masked: '•••• •••• 9012',
    ifsc_code: 'HDFC0001248',
    period_start: '2026-03-03',
    period_end: '2026-03-07',
    bookings_count: 32,
    gross_booking_amount: 47200,
    platform_commission_deducted: 4720,
    tds_deducted: 472,
    net_payable: 42008,
    status: 'PENDING_APPROVAL',
  },
  {
    id: 'stl_405',
    batch_number: 'STL-202603-005',
    venue_id: 'ven_1002',
    venue_name: 'Green Field Sports Park',
    owner_name: 'Vignesh Sundaram',
    bank_name: 'ICICI Bank',
    account_number_masked: '•••• •••• 4421',
    ifsc_code: 'ICIC0000412',
    period_start: '2026-03-03',
    period_end: '2026-03-07',
    bookings_count: 51,
    gross_booking_amount: 82400,
    platform_commission_deducted: 8240,
    tds_deducted: 824,
    net_payable: 73336,
    status: 'PROCESSING',
  },
];

export const INITIAL_SUPPORT_TICKETS: SupportTicketItem[] = [
  {
    id: 'tkt_801',
    ticket_number: 'SUP-2026-101',
    venue_id: 'ven_1001',
    venue_name: 'Sky Sports Arena & Box Turf',
    created_person_name: 'Karthik Rajan',
    contact_number: '+91 98765 43210',
    category: 'PAYMENT',
    priority: 'URGENT',
    subject: 'Double deduction on Razorpay UPI checkout for customer slot booking',
    description: 'Customer Rahul Verma was charged twice (₹1,400 x 2) for Turf A slot at 7 PM. Slot was locked once, but amount was debited twice from his bank. Please reverse the duplicate payment.',
    related_booking_code: 'BK-2026-8901',
    attachment_name: 'razorpay_duplicate_txn.png',
    attachment_url: '#',
    status: 'OPEN',
    source: 'VENUE_APP',
    created_at: '2026-03-08 09:15',
    conversation: [
      {
        sender: 'VENUE',
        sender_name: 'Karthik Rajan (Turf Owner)',
        message: 'Customer is waiting at the counter. The payment gateway debited him twice for booking BK-2026-8901. Requesting immediate refund reversal.',
        timestamp: '09:15 AM',
      },
    ],
  },
  {
    id: 'tkt_802',
    ticket_number: 'SUP-2026-102',
    venue_id: 'ven_1002',
    venue_name: 'Green Field Sports Park',
    created_person_name: 'Vignesh Sundaram',
    contact_number: '+91 98401 23456',
    category: 'BOOKING',
    priority: 'HIGH',
    subject: 'Rain cancellation refund processing needed for 4 consecutive evening slots',
    description: 'Heavy rain flooded our 7v7 outdoor football ground between 6:00 PM and 10:00 PM. We marked cancellations in our venue app. Please disburse platform refunds to affected customer wallets.',
    related_booking_code: 'BK-2026-8904',
    attachment_name: 'rain_waterlogged_pitch.jpg',
    attachment_url: '#',
    status: 'IN_PROGRESS',
    source: 'VENUE_APP',
    created_at: '2026-03-07 19:40',
    conversation: [
      {
        sender: 'VENUE',
        sender_name: 'Vignesh Sundaram (Manager)',
        message: 'Unseasonal storm waterlogged Pitch 1. 4 bookings could not proceed. We coordinated with teams to cancel.',
        timestamp: '07:40 PM',
      },
      {
        sender: 'ADMIN',
        sender_name: 'Super Admin',
        message: 'Weather logs verified against venue geo-tag. Processing batch wallet credits for all 4 impacted teams now.',
        timestamp: '08:10 PM',
      },
    ],
  },
  {
    id: 'tkt_803',
    ticket_number: 'SUP-2026-103',
    venue_id: 'ven_1003',
    venue_name: 'Apex Arena & Sports Club',
    created_person_name: 'Ananya Sharma',
    contact_number: '+91 99001 54321',
    category: 'SETTLEMENTS',
    priority: 'HIGH',
    subject: 'Weekly payout mismatch for Batch STL-202603-004 (TDS clarification)',
    description: 'Our account team noticed a ₹472 difference between our ERP ledger and Batch STL-202603-004 net disbursal. Need formal breakdown of whether this is 1% Sec 194-O TDS or gateway surcharge.',
    related_booking_code: undefined,
    attachment_name: 'settlement_ledger_audit.pdf',
    attachment_url: '#',
    status: 'OPEN',
    source: 'VENUE_APP',
    created_at: '2026-03-08 10:30',
    conversation: [
      {
        sender: 'VENUE',
        sender_name: 'Ananya Sharma (Finance Lead)',
        message: 'Need GST invoice & TDS breakdown statement for batch STL-202603-004 for our CA audit submission.',
        timestamp: '10:30 AM',
      },
    ],
  },
  {
    id: 'tkt_804',
    ticket_number: 'SUP-2026-104',
    venue_id: 'ven_1004',
    venue_name: 'Decathlon United Turf Complex',
    created_person_name: 'Sneha Hegde',
    contact_number: '+91 98801 32910',
    category: 'TECHNICAL',
    priority: 'HIGH',
    subject: 'Vendor App slot scheduler calendar freeze on Android 14 devices',
    description: 'When tapping on Court 3 slot schedule grid after 9:00 PM, the vendor management app crashes back to home screen on staff OnePlus devices. App build v2.4.1.',
    related_booking_code: undefined,
    attachment_name: 'crash_log_logcat.txt',
    attachment_url: '#',
    status: 'IN_PROGRESS',
    source: 'VENUE_APP',
    created_at: '2026-03-06 14:20',
    conversation: [
      {
        sender: 'VENUE',
        sender_name: 'Sneha Hegde (Operations)',
        message: 'Our ground staff cannot lock offline walk-in slots on Android 14 because the calendar picker crashes.',
        timestamp: '02:20 PM',
      },
      {
        sender: 'ADMIN',
        sender_name: 'Super Admin',
        message: 'Our mobile team identified the timezone parsing exception on Android 14. Patch v2.4.2 is pushed to Play Console internal track.',
        timestamp: '03:45 PM',
      },
    ],
  },
  {
    id: 'tkt_805',
    ticket_number: 'SUP-2026-105',
    venue_id: 'ven_1005',
    venue_name: 'SmashZone Badminton Hub',
    created_person_name: 'S. Karthik',
    contact_number: '+91 94440 18233',
    category: 'GENERAL',
    priority: 'LOW',
    subject: 'Requesting high-resolution iBookSports QR acrylic counter stands for reception',
    description: 'We recently added Court 7 and 8 and require 2 extra branded acrylic QR stands for walk-in players to scan and pay with app booking discounts.',
    related_booking_code: undefined,
    attachment_name: 'reception_counter_photo.jpg',
    attachment_url: '#',
    status: 'RESOLVED',
    resolution_notes: 'Branded QR counter standees (Pack of 2) with NFC tap enabled dispatched via BlueDart courier AWB #78192033. Delivered and installed at reception desk.',
    resolved_at: '2026-03-07 16:30',
    resolved_by: 'Super Admin',
    source: 'VENUE_APP',
    created_at: '2026-03-05 11:00',
    conversation: [
      {
        sender: 'VENUE',
        sender_name: 'S. Karthik (Owner)',
        message: 'Need additional official counter QR standees for our new reception annex.',
        timestamp: '11:00 AM',
      },
      {
        sender: 'ADMIN',
        sender_name: 'Super Admin',
        message: 'Dispatched 2 acrylic QR stands with your venue slug pre-encoded. Tracking AWB #78192033.',
        timestamp: '04:30 PM',
      },
    ],
  },
  {
    id: 'tkt_806',
    ticket_number: 'SUP-2026-106',
    venue_id: 'ven_1006',
    venue_name: 'Strike Velocity Padel & Turf',
    created_person_name: 'Vikram Reddy',
    contact_number: '+91 99081 44520',
    category: 'OTHERS',
    priority: 'MEDIUM',
    subject: 'GST registration certificate update and commercial name amendment',
    description: 'We converted our business entity from Sole Proprietorship to LLP. Uploading fresh GSTIN registration certificate and PAN for platform billing update.',
    related_booking_code: undefined,
    attachment_name: 'gst_certificate_llp.pdf',
    attachment_url: '#',
    status: 'RESOLVED',
    resolution_notes: 'Verified legal documents against MCA and GSTIN portal. Legal entity updated to Strike Velocity Sports Ventures LLP. Tax invoice profile synchronized.',
    resolved_at: '2026-03-08 10:15',
    resolved_by: 'Super Admin',
    source: 'VENUE_APP',
    created_at: '2026-03-06 09:30',
    conversation: [
      {
        sender: 'VENUE',
        sender_name: 'Vikram Reddy (Partner)',
        message: 'Please update our business entity name on invoices from sole proprietorship to LLP.',
        timestamp: '09:30 AM',
      },
      {
        sender: 'ADMIN',
        sender_name: 'Super Admin',
        message: 'GSTIN verification completed. Payouts and commission invoices are now registered under Strike Velocity Sports Ventures LLP.',
        timestamp: '10:15 AM',
      },
    ],
  },
];

export const INITIAL_AUDIT_LOGS = [
  {
    id: 'aud_1',
    timestamp: '2026-03-08 11:42:15',
    admin_user: 'Super Admin (admin@ibooksports.com)',
    action: 'DISBURSED_SETTLEMENT',
    module: 'Settlement Management',
    ip_address: '103.212.144.18',
    details: 'Triggered IMPS batch payout of ₹68,352 to Sky Sports Arena Ventures LLP',
    status: 'SUCCESS',
  },
  {
    id: 'aud_2',
    timestamp: '2026-03-08 10:15:30',
    admin_user: 'Operations Lead (ops@ibooksports.com)',
    action: 'APPROVED_COURT_REQUEST',
    module: 'Court Requests',
    ip_address: '103.212.144.20',
    details: 'Approved additional Pickleball Pro Court A addition for Green Field Sports Park',
    status: 'SUCCESS',
  },
  {
    id: 'aud_3',
    timestamp: '2026-03-07 16:22:04',
    admin_user: 'Super Admin (admin@ibooksports.com)',
    action: 'SYSTEM_SETTINGS_UPDATE',
    module: 'Settings (Module Config)',
    ip_address: '103.212.144.18',
    details: 'Updated maximum advance booking horizon from 14 days to 30 days',
    status: 'SUCCESS',
  },
  {
    id: 'aud_4',
    timestamp: '2026-03-07 11:05:49',
    admin_user: 'Finance Admin (finance@ibooksports.com)',
    action: 'REFUND_APPROVED',
    module: 'Payment Management',
    ip_address: '49.207.199.52',
    details: 'Processed weather refund for Booking IBS-2603-9006 (₹1,900)',
    status: 'SUCCESS',
  },
  {
    id: 'aud_5',
    timestamp: '2026-03-06 09:30:11',
    admin_user: 'Super Admin (admin@ibooksports.com)',
    action: 'ADMIN_OTP_LOGIN',
    module: 'Authentication',
    ip_address: '103.212.144.18',
    details: 'Admin session authorized via 6-digit email OTP verification',
    status: 'SUCCESS',
  },
];
