export interface FilterOption {
  value: string;
  label: string;
  shortLabel?: string;
}

export const WARD_OPTIONS: FilterOption[] = [
  { value: 'ALL', label: 'All Wards / Units', shortLabel: 'All Wards' },
  { value: 'Ward 3B', label: 'Ward 3B - Nephrology & Internal Med', shortLabel: 'Ward 3B (Nephro/IM)' },
  { value: 'Ward 2A', label: 'Ward 2A - Gastroenterology', shortLabel: 'Ward 2A (Gastro)' },
  { value: 'Ward 1B', label: 'Ward 1B - Respiratory Med', shortLabel: 'Ward 1B (Resp)' },
  { value: 'Ward 1A', label: 'Ward 1A - Surgical Ward', shortLabel: 'Ward 1A (Surg)' },
];

export const CATEGORY_OPTIONS: FilterOption[] = [
  { value: 'ALL', label: 'All Clinical Categories / Specialties', shortLabel: 'All Categories' },
  { value: 'Nephrology', label: 'Nephrology (Renal)', shortLabel: 'Nephrology' },
  { value: 'Gastroenterology', label: 'Gastroenterology (GI)', shortLabel: 'Gastro' },
  { value: 'Respiratory', label: 'Respiratory Medicine', shortLabel: 'Respiratory' },
  { value: 'Surgical', label: 'General Surgery / Post-Op', shortLabel: 'Surgical' },
  { value: 'Internal Med', label: 'Internal Medicine', shortLabel: 'Internal Med' },
];

export const matchPatientWard = (patientWard: string | undefined, selectedWard: string): boolean => {
  if (!selectedWard || selectedWard === 'ALL') return true;
  if (!patientWard) return false;
  return patientWard.toLowerCase().includes(selectedWard.toLowerCase());
};

export const matchPatientCategory = (patient: any, selectedCategory: string): boolean => {
  if (!selectedCategory || selectedCategory === 'ALL') return true;
  const catTarget = selectedCategory.toLowerCase();
  const wardStr = (patient.ward || '').toLowerCase();
  const diag = (patient.primaryDiagnosis || '').toLowerCase();
  const problems = Array.isArray(patient.activeProblems) ? patient.activeProblems.join(' ').toLowerCase() : '';
  const consultant = (patient.consultant || '').toLowerCase();
  return (
    wardStr.includes(catTarget) ||
    diag.includes(catTarget) ||
    problems.includes(catTarget) ||
    consultant.includes(catTarget)
  );
};
