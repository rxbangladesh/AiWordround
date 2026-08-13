import { Patient } from '../types';

export function formatPatientWhatsAppSummary(patient: Patient): string {
  const plan = patient.todayPlan || patient.todayPriority || 'No specific plan documented.';
  
  return `🏥 *WARD ROUND PATIENT SUMMARY*

👤 *Name:* ${patient.name}
🎂 *Age:* ${patient.age} Y (${patient.sex})
📍 *Ward:* ${patient.ward}
🛏️ *Bed:* ${patient.bed}
🩺 *Diagnosis:* ${patient.primaryDiagnosis}
📋 *Plan:* ${plan}

_Generated via AI Ward Round Assistant_`;
}

export function shareToWhatsApp(patient: Patient): void {
  const text = formatPatientWhatsAppSummary(patient);
  const encodedText = encodeURIComponent(text);
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodedText}`;
  
  // Try opening WhatsApp in new window
  window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
}

export async function shareOrCopyPatient(patient: Patient): Promise<'shared' | 'copied' | 'opened_whatsapp'> {
  const text = formatPatientWhatsAppSummary(patient);
  
  if (navigator.share) {
    try {
      await navigator.share({
        title: `Patient Update: ${patient.name}`,
        text: text,
      });
      return 'shared';
    } catch (err) {
      // User cancelled or share failed, fallback to opening WhatsApp
      shareToWhatsApp(patient);
      return 'opened_whatsapp';
    }
  } else {
    shareToWhatsApp(patient);
    return 'opened_whatsapp';
  }
}
