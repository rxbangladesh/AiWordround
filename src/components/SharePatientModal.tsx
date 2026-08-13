import React from 'react';
import { X, Share2, Copy, Check, MessageSquare } from 'lucide-react';
import { Patient } from '../types';
import { formatPatientWhatsAppSummary, shareToWhatsApp } from '../utils/whatsappShare';

interface SharePatientModalProps {
  patient: Patient;
  isOpen: boolean;
  onClose: () => void;
}

export const SharePatientModal: React.FC<SharePatientModalProps> = ({
  patient,
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const summaryText = formatPatientWhatsAppSummary(patient);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(summaryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text', err);
    }
  };

  const handleWhatsAppShare = () => {
    shareToWhatsApp(patient);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-xl shrink-0">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 bg-emerald-400/20 px-2 py-0.5 rounded border border-emerald-400/30">
                WhatsApp Patient Handover
              </span>
              <h3 className="text-base sm:text-lg font-black text-white mt-0.5">
                Share Patient Summary
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 space-y-4 text-xs text-slate-900">
          <p className="text-slate-600">
            Share this clinical update directly via <strong>WhatsApp</strong> or copy to clipboard for medical team messaging:
          </p>

          {/* Formatted Key Values Summary Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 font-mono text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 font-sans font-bold text-slate-800 text-xs">
              <span>Preview Summary Payload:</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-mono">WhatsApp Ready</span>
            </div>

            <div className="space-y-1.5 text-slate-800">
              <p>👤 <strong>Name:</strong> {patient.name}</p>
              <p>🎂 <strong>Age:</strong> {patient.age} Y ({patient.sex})</p>
              <p>📍 <strong>Ward:</strong> {patient.ward}</p>
              <p>🛏️ <strong>Bed:</strong> {patient.bed}</p>
              <p>🩺 <strong>Diagnosis:</strong> {patient.primaryDiagnosis}</p>
              <p className="pt-1 border-t border-slate-200 font-sans text-xs">
                📋 <strong>Plan:</strong> {patient.todayPlan || patient.todayPriority || 'No specific plan documented.'}
              </p>
            </div>
          </div>

          {/* WhatsApp & Copy Action Buttons */}
          <div className="space-y-2 pt-1">
            <button
              onClick={handleWhatsAppShare}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-5 h-5 fill-emerald-200 text-emerald-100" />
              <span>Share to WhatsApp App</span>
            </button>

            <button
              onClick={handleCopy}
              className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-2"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700">Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-600" />
                  <span>Copy Summary Text</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
