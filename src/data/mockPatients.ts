import { Patient } from '../types';

export const INITIAL_PATIENTS: Patient[] = [
  {
    patientId: 'PT-88219',
    name: 'Robert Vance',
    age: 62,
    sex: 'Male',
    bed: 'Bed 04',
    ward: 'Ward 3B - Nephrology/Internal Med',
    admissionDate: '2026-08-08',
    consultant: 'Dr. Alex Rivera, MD',
    assignedDoctorId: 'usr-1',
    primaryDiagnosis: 'Acute Kidney Injury on Chronic Kidney Disease',
    activeProblems: [
      'Worsening Serum Creatinine (2.1 mg/dL ↑)',
      'Type 2 Diabetes Mellitus with Nephropathy',
      'Hypertension - poorly controlled',
      'Mild hyperkalemia (5.4 mEq/L)'
    ],
    differentialDiagnoses: [
      'Prerenal Azotemia secondary to diuretic overuse',
      'Contrast-Induced Nephropathy (post-CT scan 4 days ago)',
      'Acute Tubular Necrosis'
    ],
    priority: 'CRITICAL',
    lastUpdate: 'Creatinine: 1.1 → 1.4 → 1.8 → 2.1 mg/dL ↑ | Urine output decreased to 25 mL/hr over last 6 hrs',
    pendingInvestigations: ['USG Kidneys & Bladder (Urgent)', 'Urine Electrolytes & Osmolality', 'Renal Doppler'],
    todayPriority: 'Evaluate AKI etiology, withhold Nephrotoxic agents, urgent Renal USG review',
    todayPlan: '1. Hold ACE inhibitor and diuretics\n2. Order urgent Bedside Renal USG\n3. Fluid challenge 500ml Normal Saline over 2 hrs if no fluid overload\n4. Nephrology consult',
    chiefComplaints: 'Decreased urine output, nausea, bilateral pedal edema x 3 days',
    hpi: '62-year-old male with long-standing T2DM and CKD Stage III admitted 5 days ago with fluid overload. Creatinine on admission was 1.4 mg/dL but has steadily risen over 72 hours despite diuretic adjustment.',
    pastMedicalHistory: 'T2DM x 14 yrs, HTN x 10 yrs, CKD Baseline Cr ~1.2-1.4 mg/dL',
    drugHistory: 'Ramipril 5mg OD (Held), Furosemide 40mg BD, Metformin 500mg BD (Held), Amlodipine 5mg OD',
    allergies: 'Penicillin (Skin Rash)',
    familyPersonalHistory: 'Non-smoker, no alcohol use. Family history of ESRD in father.',
    examinationSummary: 'BP 152/92 mmHg, HR 84 bpm, SpO2 96% on room air. JVP 3cm above sternal angle. Bilateral 2+ pitting pedal edema. Chest clear.',
    medications: [
      { id: 'm1', drugName: 'Amlodipine', dose: '5 mg', route: 'Oral', frequency: 'OD', status: 'ACTIVE', startDate: '2026-08-08' },
      { id: 'm2', drugName: 'Furosemide', dose: '40 mg', route: 'IV', frequency: 'BD', status: 'ACTIVE', startDate: '2026-08-09' },
      { id: 'm3', drugName: 'Ramipril', dose: '5 mg', route: 'Oral', frequency: 'OD', status: 'DISCONTINUED', startDate: '2026-08-08' }
    ],
    investigations: [
      { id: 'inv-1', testName: 'Creatinine', category: 'RFT', result: '1.1', numericValue: 1.1, unit: 'mg/dL', referenceRange: '0.6 - 1.2', date: '2026-08-06', time: '08:00', confidence: 'HIGH', flag: 'NORMAL', doctorVerified: true },
      { id: 'inv-2', testName: 'Creatinine', category: 'RFT', result: '1.4', numericValue: 1.4, unit: 'mg/dL', referenceRange: '0.6 - 1.2', date: '2026-08-08', time: '07:30', confidence: 'HIGH', flag: 'HIGH', doctorVerified: true },
      { id: 'inv-3', testName: 'Creatinine', category: 'RFT', result: '1.8', numericValue: 1.8, unit: 'mg/dL', referenceRange: '0.6 - 1.2', date: '2026-08-10', time: '07:00', confidence: 'HIGH', flag: 'HIGH', doctorVerified: true },
      { id: 'inv-4', testName: 'Creatinine', category: 'RFT', result: '2.1', numericValue: 2.1, unit: 'mg/dL', referenceRange: '0.6 - 1.2', date: '2026-08-13', time: '06:15', confidence: 'HIGH', flag: 'CRITICAL', doctorVerified: true },
      
      { id: 'inv-5', testName: 'Urea', category: 'RFT', result: '42', numericValue: 42, unit: 'mg/dL', referenceRange: '15 - 45', date: '2026-08-08', time: '07:30', confidence: 'HIGH', flag: 'NORMAL', doctorVerified: true },
      { id: 'inv-6', testName: 'Urea', category: 'RFT', result: '68', numericValue: 68, unit: 'mg/dL', referenceRange: '15 - 45', date: '2026-08-10', time: '07:00', confidence: 'HIGH', flag: 'HIGH', doctorVerified: true },
      { id: 'inv-7', testName: 'Urea', category: 'RFT', result: '89', numericValue: 89, unit: 'mg/dL', referenceRange: '15 - 45', date: '2026-08-13', time: '06:15', confidence: 'HIGH', flag: 'CRITICAL', doctorVerified: true },

      { id: 'inv-8', testName: 'Potassium', category: 'ELECTROLYTES', result: '4.2', numericValue: 4.2, unit: 'mEq/L', referenceRange: '3.5 - 5.0', date: '2026-08-08', time: '07:30', confidence: 'HIGH', flag: 'NORMAL', doctorVerified: true },
      { id: 'inv-9', testName: 'Potassium', category: 'ELECTROLYTES', result: '4.8', numericValue: 4.8, unit: 'mEq/L', referenceRange: '3.5 - 5.0', date: '2026-08-10', time: '07:00', confidence: 'HIGH', flag: 'NORMAL', doctorVerified: true },
      { id: 'inv-10', testName: 'Potassium', category: 'ELECTROLYTES', result: '5.4', numericValue: 5.4, unit: 'mEq/L', referenceRange: '3.5 - 5.0', date: '2026-08-13', time: '06:15', confidence: 'HIGH', flag: 'HIGH', doctorVerified: true },

      { id: 'inv-11', testName: 'Hemoglobin', category: 'CBC', result: '11.8', numericValue: 11.8, unit: 'g/dL', referenceRange: '13.0 - 17.0', date: '2026-08-13', time: '06:15', confidence: 'HIGH', flag: 'LOW', doctorVerified: true }
    ],
    dailyRounds: [
      {
        id: 'rd-1',
        date: '2026-08-13',
        complaints: 'Feels sluggish, reduced urine output noted overnight (approx 200mL in 8 hrs)',
        vitals: { bp: '152/92', pulse: '84', temperature: '36.8°C', respiratoryRate: '18', spo2: '96%', oxygenRequirement: 'Room air' },
        examination: 'Alert, mild lethargy. Mild facial puffiness. Chest clear bilateral basilar breath sounds. S1 S2 normal. Abdomen soft, non-tender.',
        assessment: 'AKI Stage 2 on CKD - worsening azotemia and potassium rise.',
        plan: '1. Renal ultrasound today\n2. Stop ACEi\n3. Repeat RFT/Electrolytes in evening\n4. Monitor I/O chart strictly',
        tasks: [
          { id: 't1', patientId: 'PT-88219', description: 'Check USG Renal Doppler report', category: 'REPORT_REVIEW', status: 'PENDING' },
          { id: 't2', patientId: 'PT-88219', description: 'Nephrology review call', category: 'SPECIALIST_OPINION', status: 'PENDING' }
        ]
      },
      {
        id: 'rd-2',
        date: '2026-08-12',
        complaints: 'Mild nausea after breakfast, pedal edema present',
        vitals: { bp: '148/88', pulse: '80', temperature: '36.7°C', respiratoryRate: '16', spo2: '97%', oxygenRequirement: 'Room air' },
        examination: 'Well oriented. Pedal edema 2+. Lungs clear.',
        assessment: 'CKD with fluid retention. Adjusting diuretics.',
        plan: 'Increase IV Furosemide to BD. Recheck Creatinine tomorrow morning.',
        tasks: [
          { id: 't3', patientId: 'PT-88219', description: 'Order morning RFT + Electrolytes', category: 'INVESTIGATION', status: 'COMPLETED' }
        ]
      }
    ],
    documents: [
      {
        id: 'doc-101',
        patientId: 'PT-88219',
        documentType: 'RFT',
        imageUri: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80',
        uploadDate: '2026-08-13 06:45',
        verificationStatus: 'VERIFIED',
        extractedFields: [
          { key: 'patientName', label: 'Patient Name', value: 'Robert Vance', confidence: 0.98, isUnclear: false },
          { key: 'testDate', label: 'Report Date', value: '13-Aug-2026', confidence: 0.96, isUnclear: false },
          { key: 'creatinine', label: 'Serum Creatinine', value: '2.1 mg/dL', confidence: 0.99, isUnclear: false },
          { key: 'urea', label: 'Blood Urea', value: '89 mg/dL', confidence: 0.95, isUnclear: false },
          { key: 'potassium', label: 'Serum Potassium', value: '5.4 mEq/L', confidence: 0.94, isUnclear: false }
        ],
        extractedInvestigations: [
          { id: 'inv-4', testName: 'Creatinine', category: 'RFT', result: '2.1', numericValue: 2.1, unit: 'mg/dL', referenceRange: '0.6 - 1.2', date: '2026-08-13', time: '06:15', confidence: 'HIGH', flag: 'CRITICAL', doctorVerified: true }
        ]
      }
    ],
    tasks: [
      { id: 't1', patientId: 'PT-88219', description: 'Check Bedside USG Kidney report', category: 'REPORT_REVIEW', status: 'PENDING' },
      { id: 't2', patientId: 'PT-88219', description: 'Request urgent Nephrology consultation', category: 'SPECIALIST_OPINION', status: 'PENDING' },
      { id: 't-e1', patientId: 'PT-88219', description: 'Repeat evening serum potassium', category: 'INVESTIGATION', status: 'PENDING' }
    ],
    clinicalNotes: [
      {
        id: 'cn-101',
        date: '2026-08-13 10:30',
        author: 'Dr. Sarah Jenkins',
        category: 'Family Update',
        content: 'Spoke with patient’s son (David Vance). Informed regarding worsening kidney parameters and planned renal ultrasound. Son requested copy of latest lab reports.',
        isPinned: true
      },
      {
        id: 'cn-102',
        date: '2026-08-13 08:45',
        author: 'Duty Doctor',
        category: 'Observation',
        content: 'Bilateral pedal edema appears slightly increased (2+). Patient states mild nausea after morning oral fluids. Restricting oral intake to 1L/24hr.',
        isPinned: false
      },
      {
        id: 'cn-103',
        date: '2026-08-12 16:20',
        author: 'Staff Nurse Clara',
        category: 'Nursing Note',
        content: 'Urine output monitored: 180mL over last 6 hours (approx 30 mL/hr). Strict fluid chart maintained.',
        isPinned: false
      }
    ]
  },

  {
    patientId: 'PT-94102',
    name: 'Maria Santos',
    age: 48,
    sex: 'Female',
    bed: 'Bed 09',
    ward: 'Ward 2A - Gastroenterology',
    admissionDate: '2026-08-10',
    consultant: 'Dr. Alex Rivera, MD',
    assignedDoctorId: 'usr-1',
    primaryDiagnosis: 'Lower Gastrointestinal Bleed / Suspected Colonic Diverticulosis',
    activeProblems: [
      'Significant Hemoglobin drop (10.4 → 8.8 → 7.6 g/dL ↓)',
      'Intermittent dark red rectal bleeding (Hematochezia)',
      'Symptomatic Anemia (tachycardia, dizziness on standing)'
    ],
    differentialDiagnoses: [
      'Diverticular Bleeding',
      'Arteriovenous Malformation (AVM)',
      'Ischemic Colitis',
      'Internal Hemorrhoids'
    ],
    priority: 'CRITICAL',
    lastUpdate: 'Hb: 10.4 → 8.8 → 7.6 g/dL ↓ | HR 110 bpm | Crossmatch 2 units PRBC submitted',
    pendingInvestigations: ['Urgent Colonoscopy report', 'Crossmatch 2 units PRBC', 'Repeat Hb in 4 hours'],
    todayPriority: 'Blood transfusion authorization, urgent Colonoscopy preparation/review, hemodynamic stabilization',
    todayPlan: '1. Transfuse 2 units Packed Red Blood Cells (PRBC)\n2. Maintain two large-bore IV access lines\n3. NPO for urgent morning Colonoscopy\n4. Hemodynamic monitoring q2h',
    chiefComplaints: 'Passing bloody bowel movements x 2 days, feeling faint when standing up',
    hpi: '48-year-old female presented with sudden painless hematochezia. Had 3 episodes of large dark red stools yesterday. Hemoglobin dropped 1.2 g/dL overnight.',
    pastMedicalHistory: 'Diverticulosis diagnosed 3 years ago on screening colonoscopy. Hypertension.',
    drugHistory: 'Telmisartan 40mg OD, Aspirin 75mg OD (Discontinued on admission)',
    allergies: 'None known',
    familyPersonalHistory: 'No family history of GI malignancy.',
    examinationSummary: 'Pallor positive. BP 106/68 mmHg, HR 110 bpm (tachycardic), SpO2 98% on RA. Abdomen soft, non-tender, active bowel sounds. Digital rectal exam shows maroon stool.',
    medications: [
      { id: 'm4', drugName: 'Pantoprazole', dose: '40 mg', route: 'IV', frequency: 'BD', status: 'ACTIVE', startDate: '2026-08-10' },
      { id: 'm5', drugName: 'Tranexamic Acid', dose: '500 mg', route: 'IV', frequency: 'TDS', status: 'ACTIVE', startDate: '2026-08-11' }
    ],
    investigations: [
      { id: 'inv-20', testName: 'Hemoglobin', category: 'CBC', result: '10.4', numericValue: 10.4, unit: 'g/dL', referenceRange: '12.0 - 15.5', date: '2026-08-10', time: '14:00', confidence: 'HIGH', flag: 'LOW', doctorVerified: true },
      { id: 'inv-21', testName: 'Hemoglobin', category: 'CBC', result: '8.8', numericValue: 8.8, unit: 'g/dL', referenceRange: '12.0 - 15.5', date: '2026-08-12', time: '06:00', confidence: 'HIGH', flag: 'LOW', doctorVerified: true },
      { id: 'inv-22', testName: 'Hemoglobin', category: 'CBC', result: '7.6', numericValue: 7.6, unit: 'g/dL', referenceRange: '12.0 - 15.5', date: '2026-08-13', time: '06:30', confidence: 'HIGH', flag: 'CRITICAL', doctorVerified: true },
      
      { id: 'inv-23', testName: 'Platelets', category: 'CBC', result: '210', numericValue: 210, unit: 'x10³/µL', referenceRange: '150 - 450', date: '2026-08-13', time: '06:30', confidence: 'HIGH', flag: 'NORMAL', doctorVerified: true },
      { id: 'inv-24', testName: 'INR', category: 'COAGULATION', result: '1.1', numericValue: 1.1, unit: '', referenceRange: '0.8 - 1.2', date: '2026-08-13', time: '06:30', confidence: 'HIGH', flag: 'NORMAL', doctorVerified: true }
    ],
    dailyRounds: [
      {
        id: 'rd-3',
        date: '2026-08-13',
        complaints: 'Lightheaded when changing positions, 1 episode of hematochezia at 04:00',
        vitals: { bp: '106/68', pulse: '110', temperature: '36.9°C', respiratoryRate: '20', spo2: '98%', oxygenRequirement: 'Room air' },
        examination: 'Pale conjunctiva. Tachycardic but regular rhythm. Abdomen soft, no rebound tenderness.',
        assessment: 'Ongoing acute GI bleed with symptomatic anemia (Hb 7.6 g/dL). Indication for blood transfusion.',
        plan: 'Transfuse 2 PRBCs, inform Endoscopy suite for urgent colonoscopy.',
        tasks: [
          { id: 't4', patientId: 'PT-94102', description: 'Obtain informed consent for Blood Transfusion & Colonoscopy', category: 'CONSENT', status: 'PENDING' },
          { id: 't5', patientId: 'PT-94102', description: 'Confirm Blood Bank PRBC issue', category: 'PROCEDURE', status: 'PENDING' }
        ]
      }
    ],
    documents: [],
    tasks: [
      { id: 't4', patientId: 'PT-94102', description: 'Obtain informed consent for Blood Transfusion & Colonoscopy', category: 'CONSENT', status: 'PENDING' },
      { id: 't5', patientId: 'PT-94102', description: 'Confirm Blood Bank PRBC release of 2 units PRBC', category: 'PROCEDURE', status: 'PENDING' },
      { id: 't6', patientId: 'PT-94102', description: 'Recheck Hb 2 hours post-transfusion', category: 'INVESTIGATION', status: 'PENDING' }
    ]
  },

  {
    patientId: 'PT-71108',
    name: 'David Chen',
    age: 55,
    sex: 'Male',
    bed: 'Bed 02',
    ward: 'Ward 1B - Respiratory Med',
    admissionDate: '2026-08-11',
    consultant: 'Dr. Sarah Jenkins, MD',
    assignedDoctorId: 'usr-2',
    primaryDiagnosis: 'Right Middle Lobe Community-Acquired Pneumonia',
    activeProblems: [
      'Persistent fever spikes (38.8°C)',
      'Increasing Oxygen requirement (2L → 4L nasal cannula to maintain SpO2 >94%)',
      'Leukocytosis (WBC 16.8 x10³/µL)',
      'Productive cough with rust-colored sputum'
    ],
    priority: 'ACTION',
    lastUpdate: 'Temp: 38.8°C persistent | O2 req: 2L → 4L NC | Sputum Culture: Pending',
    pendingInvestigations: ['Sputum Culture & Sensitivity report', 'Repeat HRCT / Chest X-Ray', 'Procalcitonin level'],
    todayPriority: 'Review sputum culture results, consider stepping up antibiotic coverage if non-responsive',
    todayPlan: '1. Continue IV Ceftriaxone + Azithromycin\n2. Escalate oxygen if SpO2 drops <93%\n3. Send Procalcitonin and follow up Sputum Gram stain/culture\n4. Chest physiotherapy',
    chiefComplaints: 'High grade fever with chills, right-sided chest pain on deep breathing, coughing rust-colored sputum',
    hpi: '55-year-old male admitted 2 days ago with severe CAP. Right basilar crackles. Antibiotics started on admission but continues to spike fevers up to 38.9°C with climbing O2 need.',
    pastMedicalHistory: 'Asthma in childhood, Ex-smoker (10 pack-years, quit 5 yrs ago).',
    drugHistory: 'Salbutamol inhaler PRN',
    allergies: 'None',
    familyPersonalHistory: 'No family history of chronic lung disease.',
    examinationSummary: 'BP 128/82 mmHg, HR 96 bpm, Temp 38.8°C, RR 22/min, SpO2 95% on 4L NC. Bronchial breath sounds and coarse crackles over right middle and lower lung zones.',
    medications: [
      { id: 'm6', drugName: 'Ceftriaxone', dose: '2 g', route: 'IV', frequency: 'OD', status: 'ACTIVE', startDate: '2026-08-11' },
      { id: 'm7', drugName: 'Azithromycin', dose: '500 mg', route: 'IV', frequency: 'OD', status: 'ACTIVE', startDate: '2026-08-11' },
      { id: 'm8', drugName: 'Paracetamol', dose: '1 g', route: 'IV', frequency: 'QDS PRN', status: 'ACTIVE', startDate: '2026-08-11' }
    ],
    investigations: [
      { id: 'inv-30', testName: 'WBC', category: 'CBC', result: '14.2', numericValue: 14.2, unit: 'x10³/µL', referenceRange: '4.0 - 11.0', date: '2026-08-11', time: '10:00', confidence: 'HIGH', flag: 'HIGH', doctorVerified: true },
      { id: 'inv-31', testName: 'WBC', category: 'CBC', result: '16.8', numericValue: 16.8, unit: 'x10³/µL', referenceRange: '4.0 - 11.0', date: '2026-08-13', time: '06:00', confidence: 'HIGH', flag: 'HIGH', doctorVerified: true },
      { id: 'inv-32', testName: 'CRP', category: 'INFLAMMATORY', result: '142', numericValue: 142, unit: 'mg/L', referenceRange: '0 - 5', date: '2026-08-11', time: '10:00', confidence: 'HIGH', flag: 'HIGH', doctorVerified: true }
    ],
    dailyRounds: [
      {
        id: 'rd-4',
        date: '2026-08-13',
        complaints: 'Chills overnight, persistent right pleuritic chest pain',
        vitals: { bp: '128/82', pulse: '96', temperature: '38.8°C', respiratoryRate: '22', spo2: '95%', oxygenRequirement: '4L NC' },
        examination: 'Right lower zone crackles. Decreased breath sounds at right base.',
        assessment: 'Pneumonia with persistent fever spike and mild respiratory escalation.',
        plan: 'Follow up blood/sputum culture. If no improvement in 24h, consider Pip-Tazo or levofloxacin addition.',
        tasks: [
          { id: 't7', patientId: 'PT-71108', description: 'Follow up Microbiology Sputum Culture', category: 'REPORT_REVIEW', status: 'PENDING' }
        ]
      }
    ],
    documents: [],
    tasks: [
      { id: 't7', patientId: 'PT-71108', description: 'Follow up Microbiology Sputum & Blood Culture results', category: 'REPORT_REVIEW', status: 'PENDING' },
      { id: 't8', patientId: 'PT-71108', description: 'Review Chest X-Ray for pleural effusion development', category: 'REPORT_REVIEW', status: 'PENDING' }
    ]
  },

  {
    patientId: 'PT-50291',
    name: 'Eleanor Vance',
    age: 71,
    sex: 'Female',
    bed: 'Bed 11',
    ward: 'Ward 2A - Gastroenterology',
    admissionDate: '2026-08-07',
    consultant: 'Dr. Alex Rivera, MD',
    assignedDoctorId: 'usr-1',
    primaryDiagnosis: 'Decompensated Chronic Liver Disease (NASH Cirrhosis) with Ascites',
    activeProblems: [
      'Deranged Coagulation Profile (INR 2.1 ↑)',
      'Hypoalbuminemia (Serum Albumin 2.4 g/dL ↓)',
      'Grade 1 Hepatic Encephalopathy (asterixis trace)',
      'Moderate Ascites'
    ],
    priority: 'ACTION',
    lastUpdate: 'INR: 1.6 → 1.9 → 2.1 ↑ | Albumin 2.4 g/dL | Diagnostic paracentesis report pending',
    pendingInvestigations: ['Ascitic Fluid PMN count & culture', 'Repeat LFT & Coagulation profile', 'Serum AFP'],
    todayPriority: 'Rule out Spontaneous Bacterial Peritonitis (SBP), Lactulose titration for encephalopathy',
    todayPlan: '1. Review diagnostic paracentesis cell count (rule out SBP)\n2. Lactulose syrup 30ml TDS to ensure 2-3 soft stools/day\n3. IV Human Albumin 20% infusion\n4. Low sodium diet',
    chiefComplaints: 'Abdominal distension, pedal swelling, mild confusion noted by family',
    hpi: '71-year-old female with NASH cirrhosis admitted with worsening abdominal girth. Underwent diagnostic paracentesis yesterday. INR gradually prolonging.',
    pastMedicalHistory: 'NASH Cirrhosis diagnosed 2023, Type 2 DM, Dyslipidemia',
    drugHistory: 'Spironolactone 100mg OD, Furosemide 40mg OD, Lactulose 15ml TDS',
    allergies: 'Sulfa drugs',
    familyPersonalHistory: 'No alcohol consumption. Type 2 DM in mother.',
    examinationSummary: 'Mild icterus. Flapping tremor positive (asterixis). Abdomen distended with shifting dullness. No abdominal rigidity or fluid wave tenderness.',
    medications: [
      { id: 'm9', drugName: 'Lactulose', dose: '30 mL', route: 'Oral', frequency: 'TDS', status: 'ACTIVE', startDate: '2026-08-07' },
      { id: 'm10', drugName: 'Rifaximin', dose: '550 mg', route: 'Oral', frequency: 'BD', status: 'ACTIVE', startDate: '2026-08-08' },
      { id: 'm11', drugName: 'Human Albumin 20%', dose: '100 mL', route: 'IV', frequency: 'OD', status: 'ACTIVE', startDate: '2026-08-12' }
    ],
    investigations: [
      { id: 'inv-40', testName: 'INR', category: 'COAGULATION', result: '1.6', numericValue: 1.6, unit: '', referenceRange: '0.8 - 1.2', date: '2026-08-07', time: '08:00', confidence: 'HIGH', flag: 'HIGH', doctorVerified: true },
      { id: 'inv-41', testName: 'INR', category: 'COAGULATION', result: '1.9', numericValue: 1.9, unit: '', referenceRange: '0.8 - 1.2', date: '2026-08-10', time: '08:00', confidence: 'HIGH', flag: 'HIGH', doctorVerified: true },
      { id: 'inv-42', testName: 'INR', category: 'COAGULATION', result: '2.1', numericValue: 2.1, unit: '', referenceRange: '0.8 - 1.2', date: '2026-08-13', time: '07:00', confidence: 'HIGH', flag: 'CRITICAL', doctorVerified: true },

      { id: 'inv-43', testName: 'Albumin', category: 'LFT', result: '2.4', numericValue: 2.4, unit: 'g/dL', referenceRange: '3.5 - 5.0', date: '2026-08-13', time: '07:00', confidence: 'HIGH', flag: 'LOW', doctorVerified: true },
      { id: 'inv-44', testName: 'Total Bilirubin', category: 'LFT', result: '3.2', numericValue: 3.2, unit: 'mg/dL', referenceRange: '0.2 - 1.2', date: '2026-08-13', time: '07:00', confidence: 'HIGH', flag: 'HIGH', doctorVerified: true }
    ],
    dailyRounds: [
      {
        id: 'rd-5',
        date: '2026-08-13',
        complaints: 'Abdominal fullness, 2 bowel movements yesterday',
        vitals: { bp: '118/74', pulse: '76', temperature: '36.6°C', respiratoryRate: '16', spo2: '97%', oxygenRequirement: 'Room air' },
        examination: 'Mild asterixis. Distended abdomen, non-tender. Fluid tap done yesterday without immediate complications.',
        assessment: 'Decompensated Cirrhosis, Child-Pugh C (10 pts). Monitor for SBP.',
        plan: 'Check peritoneal fluid neutrophil count (>250 cells/mm3 indicates SBP). Continue encephalopathy regimen.',
        tasks: [
          { id: 't9', patientId: 'PT-50291', description: 'Review Ascitic Fluid PMN count for SBP', category: 'REPORT_REVIEW', status: 'PENDING' }
        ]
      }
    ],
    documents: [],
    tasks: [
      { id: 't9', patientId: 'PT-50291', description: 'Review Ascitic Fluid PMN count & differential for SBP', category: 'REPORT_REVIEW', status: 'PENDING' },
      { id: 't10', patientId: 'PT-50291', description: 'Administer IV Albumin 20% 100mL', category: 'PROCEDURE', status: 'PENDING' }
    ]
  },

  {
    patientId: 'PT-63094',
    name: 'Sarah Jenkins',
    age: 29,
    sex: 'Female',
    bed: 'Bed 15',
    ward: 'Ward 3B - Internal Med',
    admissionDate: '2026-08-11',
    consultant: 'Dr. Sarah Jenkins, MD',
    primaryDiagnosis: 'Acute Right Pyelonephritis',
    activeProblems: [
      'Improving Leukocytosis (WBC 18.2 → 12.1 → 8.5 x10³/µL ↓)',
      'Resolving right flank tenderness',
      'Afebrile x 24 hours'
    ],
    priority: 'REVIEW',
    lastUpdate: 'WBC: 18.2 → 12.1 → 8.5 x10³/µL ↓ | Afebrile 24h | Urine culture: E. coli sensitive to Ciprofloxacin',
    pendingInvestigations: ['Oral step-down planning', 'Repeat urinalysis before discharge'],
    todayPriority: 'Switch IV antibiotics to oral Ciprofloxacin, discharge planning tomorrow',
    todayPlan: '1. Switch IV Ceftriaxone to Oral Ciprofloxacin 500mg BD\n2. Encourage oral hydration > 2.5L/day\n3. Discharge planning for tomorrow if stable on oral meds',
    chiefComplaints: 'High fever, severe right flank pain, dysuria x 3 days',
    hpi: '29-year-old female admitted with acute pyelonephritis. Rapid clinical response to IV Ceftriaxone. WBC normalized today.',
    pastMedicalHistory: 'Recurrent UTI x 2 in past year',
    drugHistory: 'None',
    allergies: 'None',
    familyPersonalHistory: 'Non-smoker',
    examinationSummary: 'BP 116/72 mmHg, HR 72 bpm, Temp 36.6°C, RR 14/min, SpO2 99% RA. Right renal angle tenderness vastly reduced.',
    medications: [
      { id: 'm12', drugName: 'Ceftriaxone', dose: '1 g', route: 'IV', frequency: 'OD', status: 'DISCONTINUED', startDate: '2026-08-11' },
      { id: 'm13', drugName: 'Ciprofloxacin', dose: '500 mg', route: 'Oral', frequency: 'BD', status: 'ACTIVE', startDate: '2026-08-13' }
    ],
    investigations: [
      { id: 'inv-50', testName: 'WBC', category: 'CBC', result: '18.2', numericValue: 18.2, unit: 'x10³/µL', referenceRange: '4.0 - 11.0', date: '2026-08-11', time: '09:00', confidence: 'HIGH', flag: 'HIGH', doctorVerified: true },
      { id: 'inv-51', testName: 'WBC', category: 'CBC', result: '12.1', numericValue: 12.1, unit: 'x10³/µL', referenceRange: '4.0 - 11.0', date: '2026-08-12', time: '07:00', confidence: 'HIGH', flag: 'HIGH', doctorVerified: true },
      { id: 'inv-52', testName: 'WBC', category: 'CBC', result: '8.5', numericValue: 8.5, unit: 'x10³/µL', referenceRange: '4.0 - 11.0', date: '2026-08-13', time: '06:30', confidence: 'HIGH', flag: 'NORMAL', doctorVerified: true }
    ],
    dailyRounds: [
      {
        id: 'rd-6',
        date: '2026-08-13',
        complaints: 'No pain, feels energetic, eating well',
        vitals: { bp: '116/72', pulse: '72', temperature: '36.6°C', respiratoryRate: '14', spo2: '99%', oxygenRequirement: 'Room air' },
        examination: 'Right flank minimal tenderness on deep palpation. Well hydrated.',
        assessment: 'Acute Pyelonephritis - marked improvement.',
        plan: 'Step down to oral Ciprofloxacin today. Discharge tomorrow.',
        tasks: [
          { id: 't11', patientId: 'PT-63094', description: 'Prepare Discharge Summary draft', category: 'DISCHARGE_PLANNING', status: 'PENDING' }
        ]
      }
    ],
    documents: [],
    tasks: [
      { id: 't11', patientId: 'PT-63094', description: 'Prepare Discharge Summary draft & oral prescription', category: 'DISCHARGE_PLANNING', status: 'PENDING' }
    ]
  },

  {
    patientId: 'PT-18340',
    name: 'James Miller',
    age: 39,
    sex: 'Male',
    bed: 'Bed 07',
    ward: 'Ward 1A - Surgical Ward',
    admissionDate: '2026-08-12',
    consultant: 'Dr. Robert Thorne, MS',
    primaryDiagnosis: 'Acute Appendicitis - Laparoscopic Appendectomy Post-Op Day 1',
    activeProblems: [
      'Post-operative surgical site discomfort (controlled with analgesia)',
      'Tolerating oral clear fluids'
    ],
    priority: 'STABLE',
    lastUpdate: 'POD 1 Lap Appendectomy | Vitals stable | Tolerating fluids | Port sites clean',
    pendingInvestigations: ['Routine POD 1 Hemoglobin check'],
    todayPriority: 'Advance diet to soft solids, ambulation, drain removal if <20ml',
    todayPlan: '1. Advance diet to regular soft food\n2. Encourage ambulation\n3. Oral analgesics (Paracetamol + Tramadol PRN)\n4. Discharge planning for POD 2',
    chiefComplaints: 'Right lower quadrant abdominal pain x 24h prior to surgery',
    hpi: '39-year-old male underwent uneventful laparoscopic appendectomy yesterday. Histopathology confirmed acute suppurative appendicitis.',
    pastMedicalHistory: 'Nil relevant',
    drugHistory: 'None',
    allergies: 'NKDA',
    familyPersonalHistory: 'Non-smoker',
    examinationSummary: 'BP 122/78 mmHg, HR 74 bpm, Temp 36.8°C, RR 16/min, SpO2 99% RA. Surgical port dressings dry and intact. Abdomen soft, mild focal port site tenderness.',
    medications: [
      { id: 'm14', drugName: 'Paracetamol', dose: '1 g', route: 'Oral', frequency: 'QDS', status: 'ACTIVE', startDate: '2026-08-12' },
      { id: 'm15', drugName: 'Tramadol', dose: '50 mg', route: 'Oral', frequency: 'TDS PRN', status: 'ACTIVE', startDate: '2026-08-12' }
    ],
    investigations: [
      { id: 'inv-60', testName: 'WBC', category: 'CBC', result: '11.4', numericValue: 11.4, unit: 'x10³/µL', referenceRange: '4.0 - 11.0', date: '2026-08-12', time: '08:00', confidence: 'HIGH', flag: 'NORMAL', doctorVerified: true }
    ],
    dailyRounds: [
      {
        id: 'rd-7',
        date: '2026-08-13',
        complaints: 'Mild surgical pain when coughing, passed flatus',
        vitals: { bp: '122/78', pulse: '74', temperature: '36.8°C', respiratoryRate: '16', spo2: '99%', oxygenRequirement: 'Room air' },
        examination: 'Abdomen soft, port sites clean/dry. Bowel sounds present.',
        assessment: 'Post-Op Day 1 Lap Appendectomy - progressing well.',
        plan: 'Start soft diet, ambulate, discharge planned for tomorrow.',
        tasks: []
      }
    ],
    documents: [],
    tasks: [
      { id: 't12', patientId: 'PT-18340', description: 'Review histopathology report on appendectomy specimen', category: 'REPORT_REVIEW', status: 'PENDING' }
    ]
  },
  {
    patientId: 'PT-72941',
    name: 'Eleanor Davis',
    age: 58,
    sex: 'Female',
    bed: 'Discharged (Bed 07)',
    ward: 'Ward 1B - Respiratory Med',
    admissionDate: '2026-08-04',
    consultant: 'Dr. Sarah Jenkins, MD',
    assignedDoctorId: 'usr-2',
    status: 'DISCHARGED',
    dischargeData: {
      dischargeDate: '2026-08-12',
      conditionOnDischarge: 'RECOVERED',
      dischargeSummary: '58-year-old female admitted with acute exacerbation of Bronchial Asthma triggered by viral URI. Successfully treated with nebulized bronchodilators, short course IV Hydrocortisone transitioned to oral Prednisolone, and chest physiotherapy. Peak expiratory flow rate normalized to >85% predicted. Discharged in stable, asymptomatic condition.',
      followUpInstructions: 'Continue Inhaler Budesonide/Formoterol 200/6mcg 2 puffs BD. Complete Prednisolone taper over next 3 days. Follow up in Pulmonology Clinic in 2 weeks.',
      dischargedBy: 'Dr. Sarah Jenkins, MD',
      dischargedAt: '11:30 AM',
    },
    primaryDiagnosis: 'Acute Exacerbation of Bronchial Asthma (Resolved)',
    activeProblems: [
      'Resolved Bronchospasm',
      'Hypertension (Controlled)'
    ],
    differentialDiagnoses: ['Acute Viral Bronchitis', 'Atypical Pneumonia'],
    priority: 'STABLE',
    lastUpdate: 'Discharged on 2026-08-12. Condition: RECOVERED. Fully ambulatory with normal PEFR.',
    pendingInvestigations: [],
    todayPriority: 'Discharged - Completed Outpatient Transition',
    todayPlan: 'Continue outpatient inhalers, follow up in 2 weeks.',
    chiefComplaints: 'Severe breathlessness and wheezing on admission',
    hpi: '58yo female with past history of moderate persistent asthma presenting with worsening dyspnea and productive cough for 3 days.',
    pastMedicalHistory: 'Asthma x 20 yrs, HTN x 8 yrs',
    drugHistory: 'Budesonide/Formoterol 200/6mcg, Amlodipine 5mg OD',
    allergies: 'Aspirin (Bronchospasm)',
    familyPersonalHistory: 'Non-smoker',
    examinationSummary: 'Discharge Vitals: BP 124/80, HR 72, SpO2 99% on room air. Chest clear on auscultation, no wheeze or crepitations.',
    medications: [
      { id: 'm20', drugName: 'Budesonide/Formoterol Turbuhaler', dose: '200/6 mcg', route: 'Inhaled', frequency: 'BD', status: 'ACTIVE', startDate: '2026-08-04' },
      { id: 'm21', drugName: 'Prednisolone', dose: '10 mg', route: 'Oral', frequency: 'OD (Tapering)', status: 'ACTIVE', startDate: '2026-08-08' },
      { id: 'm22', drugName: 'Amlodipine', dose: '5 mg', route: 'Oral', frequency: 'OD', status: 'ACTIVE', startDate: '2026-08-04' }
    ],
    investigations: [
      { id: 'inv-80', testName: 'Peak Expiratory Flow (PEFR)', category: 'OTHER', result: '420', numericValue: 420, unit: 'L/min', referenceRange: '380 - 450', date: '2026-08-12', time: '09:00', confidence: 'HIGH', flag: 'NORMAL', doctorVerified: true },
      { id: 'inv-81', testName: 'CBC - WBC', category: 'CBC', result: '7.2', numericValue: 7.2, unit: 'x10³/µL', referenceRange: '4.0 - 11.0', date: '2026-08-11', time: '08:00', confidence: 'HIGH', flag: 'NORMAL', doctorVerified: true }
    ],
    dailyRounds: [
      {
        id: 'rd-10',
        date: '2026-08-12',
        complaints: 'No breathlessness, slept well without waking up',
        vitals: { bp: '124/80', pulse: '72', temperature: '36.6°C', respiratoryRate: '14', spo2: '99%', oxygenRequirement: 'Room air' },
        examination: 'Chest clear, good air entry bilaterally, no rhonchi.',
        assessment: 'Asthma exacerbation resolved. Fit for discharge.',
        plan: 'Discharge with inhalers and steroid taper. Pulmonology OPD follow up in 2 weeks.',
        tasks: []
      }
    ],
    documents: [],
    tasks: []
  }
];
