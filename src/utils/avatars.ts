export interface AvatarPreset {
  id: string;
  name: string;
  category: 'physician' | 'specialist' | 'nurse' | 'executive';
  url: string;
}

export const PRESET_AVATARS: AvatarPreset[] = [
  {
    id: 'doc-m-1',
    name: 'Dr. Male (Senior Consultant)',
    category: 'physician',
    url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'doc-f-1',
    name: 'Dr. Female (Attending Physician)',
    category: 'physician',
    url: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'doc-m-2',
    name: 'Dr. Male (Resident Physician)',
    category: 'physician',
    url: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'doc-f-2',
    name: 'Dr. Female (Clinical Specialist)',
    category: 'specialist',
    url: 'https://images.unsplash.com/photo-1594824813533-4506e33604f3?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'doc-m-3',
    name: 'Dr. Male (Surgeon / Critical Care)',
    category: 'specialist',
    url: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'doc-f-3',
    name: 'Dr. Female (Pediatric & Renal Lead)',
    category: 'specialist',
    url: 'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'nurse-f-1',
    name: 'Charge Nurse (Clinical Lead)',
    category: 'nurse',
    url: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'nurse-m-1',
    name: 'Staff Nurse (Ward Specialist)',
    category: 'nurse',
    url: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'admin-m-1',
    name: 'Chief Medical Officer (CMO)',
    category: 'executive',
    url: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=200&auto=format&fit=crop&q=80',
  }
];

export const AVATAR_COLOR_THEMES = [
  { id: 'teal', label: 'Teal & Emerald', bgClass: 'from-teal-600 to-emerald-600' },
  { id: 'blue', label: 'Blue & Indigo', bgClass: 'from-blue-600 to-indigo-600' },
  { id: 'cyan', label: 'Cyan & Sky', bgClass: 'from-cyan-600 to-blue-600' },
  { id: 'emerald', label: 'Emerald & Green', bgClass: 'from-emerald-600 to-teal-700' },
  { id: 'violet', label: 'Violet & Purple', bgClass: 'from-violet-600 to-purple-600' },
  { id: 'amber', label: 'Amber & Orange', bgClass: 'from-amber-600 to-orange-600' },
  { id: 'rose', label: 'Rose & Pink', bgClass: 'from-rose-600 to-red-600' },
  { id: 'slate', label: 'Executive Slate', bgClass: 'from-slate-700 to-slate-900' },
];
