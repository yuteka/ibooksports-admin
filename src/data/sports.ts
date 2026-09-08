export interface SportOption {
  id: string;
  label: string;
  iconName: string;
  color: string;
  description: string;
}

export const SPORTS_OPTIONS: SportOption[] = [
  {
    id: 'FOOTBALL',
    label: 'Football',
    iconName: 'Goal',
    color: 'emerald',
    description: '5s, 7s, 11s Turf grounds',
  },
  {
    id: 'CRICKET',
    label: 'Cricket',
    iconName: 'CircleDot',
    color: 'amber',
    description: 'Open turf pitch & nets',
  },
  {
    id: 'BOX_CRICKET',
    label: 'Box Cricket',
    iconName: 'Shield',
    color: 'orange',
    description: 'Enclosed arena turf',
  },
  {
    id: 'BADMINTON',
    label: 'Badminton',
    iconName: 'Zap',
    color: 'blue',
    description: 'Synthetic & wooden indoor courts',
  },
  {
    id: 'TENNIS',
    label: 'Tennis',
    iconName: 'Flame',
    color: 'lime',
    description: 'Clay, hard & synthetic courts',
  },
  {
    id: 'BASKETBALL',
    label: 'Basketball',
    iconName: 'Target',
    color: 'red',
    description: 'Full & half courts',
  },
  {
    id: 'VOLLEYBALL',
    label: 'Volleyball',
    iconName: 'Activity',
    color: 'teal',
    description: 'Sand & indoor courts',
  },
  {
    id: 'PICKLEBALL',
    label: 'Pickleball',
    iconName: 'Sparkles',
    color: 'violet',
    description: 'Standard pickleball courts',
  },
  {
    id: 'OTHER',
    label: 'Other Sports',
    iconName: 'MoreHorizontal',
    color: 'slate',
    description: 'Skating, archery, table tennis, etc.',
  },
];
