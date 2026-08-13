import React from 'react';
import { 
  Camera, 
  Upload, 
  FileText, 
  AlertTriangle, 
  Check, 
  Edit2, 
  ShieldCheck, 
  RotateCw, 
  ZoomIn, 
  ZoomOut, 
  Sparkles, 
  ArrowRight,
  CheckCircle2,
  RefreshCw,
  HelpCircle
} from 'lucide-react';
import { Patient, DocumentType, ExtractedField, InvestigationResult } from '../types';

interface CaptureUploadProps {
  patients: Patient[];
  onSaveExtractedData: (
    patientId: string,
    docType: DocumentType,
    imageUri: string,
    extractedFields: ExtractedField[],
    extractedInvestigations: InvestigationResult[],
    fulfilledPendingItems?: string[]
  ) => void;
}

// Sample mock document images for testing/demo
const SAMPLE_DOCS = [
  {
    name: 'Renal Function Test (RFT) Report',
    type: 'RFT' as DocumentType,
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80',
    fields: [
      { key: 'patientName', label: 'Patient Name', value: 'Robert Vance', confidence: 0.98, isUnclear: false },
      { key: 'reportDate', label: 'Report Date', value: '2026-08-13', confidence: 0.96, isUnclear: false },
      { key: 'creatinine', label: 'Serum Creatinine', value: '2.1 mg/dL', confidence: 0.99, isUnclear: false },
      { key: 'urea', label: 'Blood Urea', value: '89 mg/dL', confidence: 0.94, isUnclear: false },
      { key: 'potassium', label: 'Serum Potassium', value: '5.4 mEq/L', confidence: 0.89, isUnclear: false }
    ],
    labs: [
      { id: 'sb-1', testName: 'Creatinine', category: 'RFT' as const, result: '2.1', numericValue: 2.1, unit: 'mg/dL', referenceRange: '0.6 - 1.2', date: '2026-08-13', time: '06:15', confidence: 'HIGH' as const, flag: 'CRITICAL' as const, doctorVerified: false },
      { id: 'sb-2', testName: 'Urea', category: 'RFT' as const, result: '89', numericValue: 89, unit: 'mg/dL', referenceRange: '15 - 45', date: '2026-08-13', time: '06:15', confidence: 'HIGH' as const, flag: 'CRITICAL' as const, doctorVerified: false },
      { id: 'sb-3', testName: 'Potassium', category: 'ELECTROLYTES' as const, result: '5.4', numericValue: 5.4, unit: 'mEq/L', referenceRange: '3.5 - 5.0', date: '2026-08-13', time: '06:15', confidence: 'HIGH' as const, flag: 'HIGH' as const, doctorVerified: false }
    ]
  },
  {
    name: 'Complete Blood Count (CBC) Sheet',
    type: 'CBC' as DocumentType,
    image: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=800&auto=format&fit=crop&q=80',
    fields: [
      { key: 'patientName', label: 'Patient Name', value: 'Maria Santos', confidence: 0.95, isUnclear: false },
      { key: 'reportDate', label: 'Report Date', value: '2026-08-13', confidence: 0.94, isUnclear: false },
      { key: 'hemoglobin', label: 'Hemoglobin', value: '7.6 g/dL', confidence: 0.98, isUnclear: false },
      { key: 'platelets', label: 'Platelet Count', value: '210,000 /µL', confidence: 0.91, isUnclear: false }
    ],
    labs: [
      { id: 'sb-4', testName: 'Hemoglobin', category: 'CBC' as const, result: '7.6', numericValue: 7.6, unit: 'g/dL', referenceRange: '12.0 - 15.5', date: '2026-08-13', time: '06:30', confidence: 'HIGH' as const, flag: 'CRITICAL' as const, doctorVerified: false },
      { id: 'sb-5', testName: 'Platelets', category: 'CBC' as const, result: '210', numericValue: 210, unit: 'x10³/µL', referenceRange: '150 - 450', date: '2026-08-13', time: '06:30', confidence: 'HIGH' as const, flag: 'NORMAL' as const, doctorVerified: false }
    ]
  },
  {
    name: 'Handwritten / Smudged Clinical Note (Low Confidence)',
    type: 'PROGRESS_NOTE' as DocumentType,
    image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop&q=80',
    fields: [
      { key: 'patientName', label: 'Patient Name', value: 'David Chen', confidence: 0.88, isUnclear: false },
      { key: 'fever', label: 'Peak Temp', value: '38.8°C', confidence: 0.92, isUnclear: false },
      { key: 'sputum', label: 'Sputum Gram Stain', value: 'Unclear — please verify', confidence: 0.45, isUnclear: true, notes: 'Handwriting smudged near Gram Stain result.' }
    ],
    labs: [
      { id: 'sb-6', testName: 'WBC', category: 'CBC' as const, result: '16.8', numericValue: 16.8, unit: 'x10³/µL', referenceRange: '4.0 - 11.0', date: '2026-08-13', time: '06:00', confidence: 'HIGH' as const, flag: 'HIGH' as const, doctorVerified: false }
    ]
  }
];

export const CaptureUpload: React.FC<CaptureUploadProps> = ({
  patients,
  onSaveExtractedData,
}) => {
  const [selectedPatientId, setSelectedPatientId] = React.useState<string>(patients[0]?.patientId || '');
  const [imageUri, setImageUri] = React.useState<string | null>(null);
  const [isProcessing, setIsProcessing] = React.useState(false);

  // Split-screen Extracted Data State
  const [docType, setDocType] = React.useState<DocumentType>('RFT');
  const [extractedFields, setExtractedFields] = React.useState<ExtractedField[]>([]);
  const [extractedLabs, setExtractedLabs] = React.useState<InvestigationResult[]>([]);
  const [isVerified, setIsVerified] = React.useState(false);

  // Zoom / Rotation states for Image Viewer
  const [zoomLevel, setZoomLevel] = React.useState(1);
  const [rotation, setRotation] = React.useState(0);

  // Pending Investigations Fulfillment selection state
  const [fulfilledPendingItems, setFulfilledPendingItems] = React.useState<string[]>([]);
  const selectedPatient = patients.find((p) => p.patientId === selectedPatientId);

  // Auto sync matching pending investigations when patient or extracted labs change
  React.useEffect(() => {
    if (selectedPatient?.pendingInvestigations && selectedPatient.pendingInvestigations.length > 0) {
      const currentPending = selectedPatient.pendingInvestigations;
      const extractedNames = extractedLabs.map((l) => l.testName.toLowerCase());
      const autoMatched = currentPending.filter((item) => {
        const lower = item.toLowerCase();
        return (
          (docType && lower.includes(docType.toLowerCase())) ||
          extractedNames.some((name) => lower.includes(name) || name.includes(lower))
        );
      });
      setFulfilledPendingItems(autoMatched.length > 0 ? autoMatched : currentPending);
    } else {
      setFulfilledPendingItems([]);
    }
  }, [selectedPatientId, docType, extractedLabs]);

  const toggleFulfilledItem = (item: string) => {
    setFulfilledPendingItems((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  // File upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        processDocumentImage(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  // Process Document Image via Server-Side Gemini API
  const processDocumentImage = async (base64Data: string) => {
    setImageUri(base64Data);
    setIsProcessing(true);
    setIsVerified(false);

    try {
      const targetPatient = patients.find(p => p.patientId === selectedPatientId);
      const response = await fetch('/api/ocr/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Data,
          patientContext: targetPatient ? { name: targetPatient.name, id: targetPatient.patientId } : undefined
        })
      });
      const result = await response.json();

      if (result.success && result.data) {
        setDocType(result.data.documentType || 'RFT');
        setExtractedFields(result.data.extractedFields || []);
        
        // Map extracted labs with doctorVerified = false
        const labs = (result.data.extractedInvestigations || []).map((inv: any, idx: number) => ({
          id: `ext-lab-${Date.now()}-${idx}`,
          testName: inv.testName,
          category: inv.category || 'RFT',
          result: inv.result,
          numericValue: parseFloat(inv.result) || undefined,
          unit: inv.unit || '',
          referenceRange: inv.referenceRange || '',
          date: inv.date || new Date().toISOString().split('T')[0],
          time: inv.time || '08:00',
          confidence: inv.confidence || 'HIGH',
          flag: inv.flag || 'NORMAL',
          doctorVerified: false
        }));
        setExtractedLabs(labs);
      }
    } catch (err) {
      console.error('OCR Processing error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Load sample document directly
  const loadSampleDoc = (sample: typeof SAMPLE_DOCS[0]) => {
    setImageUri(sample.image);
    setDocType(sample.type);
    setExtractedFields(sample.fields);
    setExtractedLabs(sample.labs);
    setIsProcessing(false);
    setIsVerified(false);
  };

  // Field change handler
  const handleFieldChange = (index: number, newValue: string) => {
    const updated = [...extractedFields];
    updated[index].value = newValue;
    updated[index].isUnclear = false; // Doctor manually corrected it
    setExtractedFields(updated);
  };

  // Lab field change handler
  const handleLabChange = (index: number, key: keyof InvestigationResult, value: string) => {
    const updated = [...extractedLabs];
    (updated[index] as any)[key] = value;
    setExtractedLabs(updated);
  };

  // Save to Patient Action
  const handleSaveToPatient = () => {
    if (!selectedPatientId || !imageUri) return;
    onSaveExtractedData(
      selectedPatientId,
      docType,
      imageUri,
      extractedFields,
      extractedLabs,
      fulfilledPendingItems
    );
    setIsVerified(true);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto text-slate-900">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-md text-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-teal-400" />
              AI Medical Document OCR Engine
            </span>
            <span className="text-xs text-slate-400">
              Extract → Validate → Doctor Review → Save
            </span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white mt-1">
            Photo Capture & OCR Extraction
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Photographed lab reports, admission notes, and prescriptions are structured into reviewable clinical data.
          </p>
        </div>

        {/* Target Patient Selector */}
        <div className="w-full md:w-auto space-y-1">
          <label className="text-xs font-bold text-slate-300 block">
            Target Patient for Record:
          </label>
          <select
            value={selectedPatientId}
            onChange={(e) => setSelectedPatientId(e.target.value)}
            className="w-full md:w-64 bg-slate-800 text-slate-100 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-teal-500"
          >
            {patients.map((p) => (
              <option key={p.patientId} value={p.patientId}>
                {p.bed} - {p.name} ({p.patientId})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Safety Mandatory Principle Box */}
      <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center justify-between gap-2 shadow-2xs">
        <div className="flex items-center gap-2 font-medium">
          <ShieldCheck className="w-5 h-5 text-teal-600 shrink-0" />
          <span>
            <strong className="text-teal-800">SAFETY MANDATE:</strong> “Extract accurately. Never guess. Always verify before saving.” Low confidence items are highlighted with ⚠️.
          </span>
        </div>
      </div>

      {/* Pending Investigations Fulfillment Banner */}
      {selectedPatient?.pendingInvestigations && selectedPatient.pendingInvestigations.length > 0 && (
        <div className="bg-amber-50 border border-amber-300 p-4 rounded-xl space-y-2 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
              <span>📋</span>
              <span>Pending Investigations for {selectedPatient.name} ({selectedPatient.pendingInvestigations.length}):</span>
            </span>
            <span className="text-[11px] text-amber-800 font-medium">Select items resolved by this report</span>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            {selectedPatient.pendingInvestigations.map((inv) => {
              const isChecked = fulfilledPendingItems.includes(inv);
              return (
                <button
                  key={inv}
                  type="button"
                  onClick={() => toggleFulfilledItem(inv)}
                  className={`cursor-pointer px-3 py-1.5 rounded-lg border text-xs font-bold transition-all flex items-center gap-2 select-none ${
                    isChecked
                      ? 'bg-amber-600 text-white border-amber-700 shadow-2xs'
                      : 'bg-white text-slate-700 border-amber-200 hover:bg-amber-100/50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {}}
                    className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                  />
                  <span>⏳ {inv}</span>
                  {isChecked && <span className="text-[10px] bg-amber-700 px-1.5 py-0.2 rounded text-white">Will Clear</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Sample Document Quick Buttons */}
      <div className="space-y-2">
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Quick Demo: Test with Sample Medical Records
        </div>
        <div className="flex flex-wrap gap-2">
          {SAMPLE_DOCS.map((sample, idx) => (
            <button
              key={idx}
              onClick={() => loadSampleDoc(sample)}
              className="bg-white hover:bg-slate-100 text-teal-800 border border-slate-300 text-xs px-3 py-2 rounded-xl font-medium transition-all text-left flex items-center gap-2 shadow-2xs"
            >
              <FileText className="w-4 h-4 text-teal-600" />
              <span>{sample.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Capture Options / Upload Dropzone if no image selected */}
      {!imageUri && (
        <div className="border-2 border-dashed border-slate-300 rounded-3xl p-10 bg-white text-center space-y-4 shadow-2xs">
          <div className="w-16 h-16 mx-auto bg-teal-50 text-teal-700 rounded-2xl border border-teal-200 flex items-center justify-center">
            <Camera className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Capture or Upload Medical Document</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Support CBC, LFT, RFT, Electrolytes, Imaging, Admission sheets, Prescriptions, and Handwritten Progress Notes.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <label className="cursor-pointer bg-teal-600 hover:bg-teal-700 text-white font-bold px-5 py-3 rounded-xl text-xs shadow-xs flex items-center gap-2">
              <Upload className="w-4 h-4" />
              <span>Upload Document Image</span>
              <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
        </div>
      )}

      {/* SPLIT SCREEN OCR REVIEW INTERFACE (When Image Loaded) */}
      {imageUri && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT PANEL: ORIGINAL UPLOADED DOCUMENT / IMAGE */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                <FileText className="w-4 h-4 text-teal-600" />
                <span>Original Document Source</span>
              </div>

              {/* Zoom & Rotation Controls */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setZoomLevel((z) => Math.max(z - 0.2, 0.6))}
                  className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 border border-slate-200"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-[11px] font-mono text-slate-600 px-1">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  onClick={() => setZoomLevel((z) => Math.min(z + 0.2, 2.5))}
                  className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 border border-slate-200"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setRotation((r) => (r + 90) % 360)}
                  className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 border border-slate-200 ml-1"
                  title="Rotate Image"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Document Image View Container */}
            <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden h-96 flex items-center justify-center p-2 relative">
              <img
                src={imageUri}
                alt="Document preview"
                className="max-h-full max-w-full object-contain transition-transform duration-200"
                style={{
                  transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                }}
              />
            </div>

            <div className="flex items-center justify-between text-xs pt-2 text-slate-500">
              <span>Classified as: <strong className="text-teal-800 font-mono">{docType}</strong></span>
              <label className="cursor-pointer text-teal-700 hover:underline font-bold">
                Replace Photo
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
          </div>

          {/* RIGHT PANEL: EXTRACTED STRUCTURED INFORMATION */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>AI Extracted Structured Fields</span>
                </div>

                <div className="text-xs">
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value as DocumentType)}
                    className="bg-white text-slate-900 border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-semibold focus:outline-none focus:border-teal-600 shadow-2xs"
                  >
                    {['CBC', 'LFT', 'RFT', 'ELECTROLYTES', 'IMAGING', 'ADMISSION_HISTORY', 'PROGRESS_NOTE', 'PRESCRIPTION', 'DISCHARGE_SUMMARY', 'OTHER'].map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>

              {isProcessing ? (
                <div className="p-12 text-center space-y-3">
                  <RefreshCw className="w-8 h-8 text-teal-600 animate-spin mx-auto" />
                  <p className="text-sm font-bold text-slate-900">Analyzing Medical Document with Gemini AI...</p>
                  <p className="text-xs text-slate-500">Parsing lab values, units, reference ranges, and patient details.</p>
                </div>
              ) : (
                <div className="space-y-4 pt-3">
                  {/* Extracted Key-Value Fields */}
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Extracted Identifiers & Demographics
                    </div>
                    <div className="space-y-2">
                      {extractedFields.map((field, index) => (
                        <div
                          key={index}
                          className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 text-xs ${
                            field.isUnclear
                              ? 'bg-amber-50 border-amber-300 text-amber-900'
                              : 'bg-slate-50 border-slate-200 text-slate-900'
                          }`}
                        >
                          <div className="w-1/3 text-slate-600 font-medium">
                            {field.label}:
                          </div>
                          <input
                            type="text"
                            value={field.value}
                            onChange={(e) => handleFieldChange(index, e.target.value)}
                            className="flex-1 bg-white border border-slate-300 rounded px-2 py-1 font-semibold text-slate-900 focus:outline-none focus:border-teal-600"
                          />
                          {field.isUnclear && (
                            <span className="text-[10px] bg-amber-200 border border-amber-300 text-amber-900 font-bold px-1.5 py-0.5 rounded shrink-0 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              Unclear
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Extracted Laboratory Results */}
                  {extractedLabs.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Extracted Laboratory Parameters
                      </div>
                      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                        {extractedLabs.map((lab, index) => (
                          <div
                            key={index}
                            className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <input
                                type="text"
                                value={lab.testName}
                                onChange={(e) => handleLabChange(index, 'testName', e.target.value)}
                                className="font-bold text-slate-900 bg-white border border-slate-300 rounded px-2 py-0.5 w-1/3"
                              />
                              <div className="flex items-center gap-1 w-2/3">
                                <input
                                  type="text"
                                  value={lab.result}
                                  onChange={(e) => handleLabChange(index, 'result', e.target.value)}
                                  className="font-mono font-bold text-teal-800 bg-white border border-slate-300 rounded px-2 py-0.5 w-1/2 text-right"
                                />
                                <input
                                  type="text"
                                  value={lab.unit}
                                  onChange={(e) => handleLabChange(index, 'unit', e.target.value)}
                                  className="text-slate-600 bg-white border border-slate-300 rounded px-1.5 py-0.5 w-1/2"
                                />
                              </div>
                            </div>
                            <div className="flex items-center justify-between text-[11px] text-slate-500">
                              <span>Ref: {lab.referenceRange}</span>
                              <span className={`font-bold ${
                                lab.flag === 'CRITICAL' ? 'text-red-700' : 'text-emerald-700'
                              }`}>
                                Flag: {lab.flag || 'NORMAL'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Doctor Verification & Save Button */}
            <div className="pt-4 border-t border-slate-200 space-y-2">
              {isVerified ? (
                <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Extracted Document Verified and Saved to Patient Profile!</span>
                </div>
              ) : (
                <button
                  onClick={handleSaveToPatient}
                  disabled={isProcessing}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white font-extrabold py-3 px-4 rounded-xl shadow-xs transition-all text-xs flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>VERIFY & SAVE TO PATIENT RECORD</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
