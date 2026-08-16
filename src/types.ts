export type PriorityLevel = 'CRITICAL' | 'ACTION' | 'REVIEW' | 'STABLE';

export type DocumentType = 
  | 'CBC' 
  | 'LFT' 
  | 'RFT' 
  | 'ELECTROLYTES' 
  | 'IMAGING' 
  | 'ADMISSION_HISTORY' 
  | 'PROGRESS_NOTE' 
  | 'PRESCRIPTION' 
  | 'DISCHARGE_SUMMARY' 
  | 'OTHER';

export type TaskCategory = 
  | 'INVESTIGATION' 
  | 'REPORT_REVIEW' 
  | 'PROCEDURE' 
  | 'MEDICATION_REVIEW' 
  | 'SPECIALIST_OPINION' 
  | 'COUNSELLING' 
  | 'CONSENT' 
  | 'FOLLOW_UP' 
  | 'DISCHARGE_PLANNING';

export interface InvestigationResult {
  id: string;
  testName: string;
  category: 'CBC' | 'RFT' | 'LFT' | 'ELECTROLYTES' | 'COAGULATION' | 'CARDIAC' | 'INFLAMMATORY' | 'IMAGING' | 'OTHER';
  result: string; // e.g. "2.1"
  numericValue?: number;
  unit: string; // e.g. "mg/dL"
  referenceRange: string; // e.g. "0.6 - 1.2"
  date: string; // e.g. "2026-08-13"
  time?: string; // e.g. "08:30"
  sourceDocument?: string;
  confidence: 'HIGH' | 'LOW' | 'UNCLEAR';
  flag?: 'HIGH' | 'LOW' | 'NORMAL' | 'CRITICAL';
  doctorVerified: boolean;
}

export interface DailyVitals {
  bp: string;
  pulse: string;
  temperature: string;
  respiratoryRate: string;
  spo2: string;
  oxygenRequirement: string;
}

export interface Task {
  id: string;
  patientId: string;
  description: string;
  category: TaskCategory;
  status: 'PENDING' | 'COMPLETED';
  dueDate?: string;
}

export interface DailyRound {
  id: string;
  date: string;
  complaints: string;
  vitals: DailyVitals;
  examination: string;
  assessment: string;
  plan: string;
  tasks: Task[];
  newInvestigationsUploaded?: string[];
  author?: string;
}

export interface Medication {
  id: string;
  drugName: string;
  dose: string;
  route: string;
  frequency: string;
  status: 'ACTIVE' | 'DISCONTINUED';
  startDate: string;
}

export interface ExtractedField {
  key: string;
  label: string;
  value: string;
  confidence: number; // 0.0 to 1.0
  isUnclear: boolean;
  notes?: string;
}

export interface ExtractedDocument {
  id: string;
  patientId?: string;
  documentType: DocumentType;
  imageUri: string;
  uploadDate: string;
  extractedFields: ExtractedField[];
  extractedInvestigations: InvestigationResult[];
  rawText?: string;
  verificationStatus: 'PENDING' | 'VERIFIED';
}

export interface ClinicalNote {
  id: string;
  date: string; // e.g. "2026-08-13 10:45"
  content: string;
  author: string; // e.g. "Dr. Sarah Jenkins" or "Duty Doctor"
  category: 'Observation' | 'Handover' | 'Family Update' | 'Nursing Note' | 'General';
  isPinned?: boolean;
}

export interface DischargeData {
  dischargeDate: string;
  conditionOnDischarge: 'RECOVERED' | 'IMPROVED' | 'STABLE' | 'TRANSFERRED' | 'AGAINST_MEDICAL_ADVICE';
  dischargeSummary: string;
  followUpInstructions?: string;
  dischargedBy?: string;
  dischargedAt: string;
}

export interface Patient {
  patientId: string;
  name: string;
  age: number;
  sex: 'Male' | 'Female' | 'Other';
  bed: string;
  ward: string;
  admissionDate: string;
  consultant: string;
  primaryDiagnosis: string;
  activeProblems: string[];
  differentialDiagnoses?: string[];
  priority: PriorityLevel;
  lastUpdate: string; // e.g., "Creatinine: 1.4 → 1.8 → 2.1 mg/dL ↑ | Persistent oliguria"
  pendingInvestigations: string[];
  todayPriority: string;
  todayPlan: string;
  
  // Discharge Status & Stored Data
  status?: 'ACTIVE' | 'DISCHARGED';
  dischargeData?: DischargeData;
  assignedDoctorId?: string;

  // Clinical history fields
  chiefComplaints: string;
  hpi: string;
  pastMedicalHistory: string;
  drugHistory: string;
  allergies: string;
  familyPersonalHistory: string;
  examinationSummary: string;
  
  dailyRounds: DailyRound[];
  investigations: InvestigationResult[];
  medications: Medication[];
  documents: ExtractedDocument[];
  tasks: Task[];
  clinicalNotes?: ClinicalNote[];
}

export interface PreRoundBriefSummary {
  patientId: string;
  patientName: string;
  bed: string;
  priority: PriorityLevel;
  lastUpdate: string;
  currentProblems: string[];
  workingDiagnosis: string;
  investigationStatus: string;
  todayPriority: string;
  todayPlan: string;
  aiInsightAlert?: string;
}

export type UserRole = 'ATTENDING_PHYSICIAN' | 'RESIDENT_DOCTOR' | 'WARD_NURSE' | 'CLINICAL_ADMIN';

export type ApprovalStatus = 'APPROVED' | 'PENDING' | 'REJECTED';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  roleTitle: string; // e.g. "Attending Physician"
  department: string;
  specialty?: string;
  hospitalName?: string;
  licenseNumber?: string;
  pin?: string; // 4-digit quick lock PIN
  avatarColor?: string;
  avatarUrl?: string; // Doctor profile/avatar image URL or base64 data URI
  approvalStatus: ApprovalStatus;
  registeredAt?: string;
  approvedAt?: string;
  approvedBy?: string;
  rejectionReason?: string;
  assignedWard?: string;
  phone?: string;
}
