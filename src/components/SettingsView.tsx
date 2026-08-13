import React from 'react';
import { Settings, Cpu, ShieldCheck, UserCheck, HardDrive, Key } from 'lucide-react';

export const SettingsView: React.FC = () => {
  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-4xl mx-auto text-slate-900">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-md text-slate-100 flex items-center gap-4">
        <div className="p-3 bg-teal-950 text-teal-400 rounded-2xl border border-teal-800">
          <Settings className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-black tracking-tight text-white">
            Clinical Applet Settings & AI Configuration
          </h2>
          <p className="text-xs text-slate-300">
            System configuration, Gemini AI engine status, and clinical safety policies.
          </p>
        </div>
      </div>

      {/* AI Engine Box */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
          <Cpu className="w-5 h-5 text-teal-600" />
          <span>Gemini AI Engine Status</span>
        </div>
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Primary AI Model:</span>
            <span className="font-mono font-bold text-teal-800">gemini-3.6-flash</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Structured Response Schema:</span>
            <span className="font-mono text-emerald-700 font-semibold">Enabled (JSON Schema)</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-600">API Key Storage:</span>
            <span className="text-slate-800 font-mono">Server-Side Environment Variable (`GEMINI_API_KEY`)</span>
          </div>
        </div>
      </div>

      {/* Doctor & Ward Profile */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
          <UserCheck className="w-5 h-5 text-amber-600" />
          <span>Doctor Ward Profile</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="text-slate-600 block mb-1 font-semibold">Attending Doctor Name:</label>
            <input
              type="text"
              readOnly
              value="Dr. Alex Rivera, MD"
              className="w-full bg-slate-50 text-slate-900 border border-slate-300 rounded-xl px-3 py-2 font-bold"
            />
          </div>
          <div>
            <label className="text-slate-600 block mb-1 font-semibold">Specialty & Department:</label>
            <input
              type="text"
              readOnly
              value="Internal Medicine & Acute Care Ward"
              className="w-full bg-slate-50 text-slate-900 border border-slate-300 rounded-xl px-3 py-2 font-bold"
            />
          </div>
        </div>
      </div>

      {/* Clinical Safety Protocol */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
          <ShieldCheck className="w-5 h-5 text-teal-600" />
          <span>Clinical Safety Mandates</span>
        </div>
        <ul className="space-y-2 text-xs text-slate-700 list-disc list-inside bg-slate-50 p-4 rounded-xl border border-slate-200 leading-relaxed">
          <li>All AI-generated summaries MUST be reviewed and verified by an attending physician prior to clinical decision-making.</li>
          <li>Extracted laboratory figures preserve exact decimal precision, units, and reference ranges. Low-confidence OCR items are explicitly flagged as "Unclear — please verify".</li>
          <li>Patient information is stored locally in transient state or secure server proxies without third-party key leaks.</li>
        </ul>
      </div>
    </div>
  );
};
