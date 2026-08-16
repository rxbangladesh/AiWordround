import React from 'react';
import { INITIAL_PATIENTS } from './data/mockPatients';
import { Patient, PriorityLevel, DailyRound, DocumentType, ExtractedField, InvestigationResult, TaskCategory, DischargeData, UserAccount } from './types';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { PreRoundBrief } from './components/PreRoundBrief';
import { RoundMode } from './components/RoundMode';
import { PatientProfile } from './components/PatientProfile';
import { InvestigationTrends } from './components/InvestigationTrends';
import { CaptureUpload } from './components/CaptureUpload';
import { TaskManagement } from './components/TaskManagement';
import { SettingsView } from './components/SettingsView';
import { DailyRoundModal } from './components/DailyRoundModal';
import { NewPatientModal } from './components/NewPatientModal';
import { DischargeModal } from './components/DischargeModal';
import { DischargeListView } from './components/DischargeListView';
import { PatientListView } from './components/PatientListView';
import { LoginScreen } from './components/LoginScreen';
import { ScreenLockModal } from './components/ScreenLockModal';
import { AdminConsole } from './components/AdminConsole';
import { getStoredCurrentUser, saveStoredCurrentUser, DEFAULT_USERS } from './utils/auth';

const LOCAL_STORAGE_KEY = 'ward_round_patients_v3';

const sanitizePatient = (p: any): Patient => ({
  ...p,
  activeProblems: Array.isArray(p.activeProblems) ? p.activeProblems : [],
  differentialDiagnoses: Array.isArray(p.differentialDiagnoses) ? p.differentialDiagnoses : [],
  pendingInvestigations: Array.isArray(p.pendingInvestigations) ? p.pendingInvestigations : [],
  dailyRounds: Array.isArray(p.dailyRounds) ? p.dailyRounds : [],
  investigations: Array.isArray(p.investigations) ? p.investigations : [],
  medications: Array.isArray(p.medications) ? p.medications : [],
  documents: Array.isArray(p.documents) ? p.documents : [],
  clinicalNotes: Array.isArray(p.clinicalNotes) ? p.clinicalNotes : [],
  tasks: Array.isArray(p.tasks) ? p.tasks : [],
});

export const App: React.FC = () => {
  // Authentication & Session State
  const [currentUser, setCurrentUser] = React.useState<UserAccount | null>(() => {
    return getStoredCurrentUser() || DEFAULT_USERS[0];
  });
  const [isSessionLocked, setIsSessionLocked] = React.useState(false);

  const [patients, setPatients] = React.useState<Patient[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(sanitizePatient);
        }
      }
    } catch (err) {
      console.warn('Failed to parse saved patients from localStorage', err);
    }
    return INITIAL_PATIENTS.map(sanitizePatient);
  });

  const [activeView, setActiveView] = React.useState<'dashboard' | 'brief' | 'profile' | 'trends' | 'capture' | 'tasks' | 'admin' | 'discharged' | 'settings'>('dashboard');
  const [selectedPatient, setSelectedPatient] = React.useState<Patient | null>(patients[0] || null);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedWard, setSelectedWard] = React.useState('ALL');

  // Overlays
  const [roundModeOpen, setRoundModeOpen] = React.useState(false);
  const [dailyRoundModalPatient, setDailyRoundModalPatient] = React.useState<Patient | null>(null);
  const [newPatientModalOpen, setNewPatientModalOpen] = React.useState(false);
  const [dischargeModalPatient, setDischargeModalPatient] = React.useState<Patient | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  // Handle Login & Logout
  const handleLoginSuccess = (user: UserAccount) => {
    setCurrentUser(user);
    saveStoredCurrentUser(user);
    setIsSessionLocked(false);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    saveStoredCurrentUser(null);
    setIsSessionLocked(false);
  };

  // Sync state to localStorage whenever patients update
  React.useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(patients));
    } catch (err) {
      console.warn('Failed to save patients to localStorage', err);
    }
  }, [patients]);

  // Handle Patient Discharge
  const handleConfirmDischarge = (patientId: string, dischargeData: DischargeData) => {
    if (currentUser?.role === 'ADMIN') {
      console.warn('ADMIN is restricted from discharging patients.');
      return;
    }
    setPatients((prev) =>
      prev.map((p) => {
        if (p.patientId === patientId) {
          const dischargeNote = {
            id: `cn-${Date.now()}`,
            date: `${dischargeData.dischargeDate} ${dischargeData.dischargedAt}`,
            content: `DISCHARGE SUMMARY: Patient discharged in ${dischargeData.conditionOnDischarge} condition. Summary: ${dischargeData.dischargeSummary}. Follow-up: ${dischargeData.followUpInstructions || 'None'}`,
            author: dischargeData.dischargedBy,
            category: 'DISCHARGE' as const,
            isPinned: true,
          };

          const updated: Patient = {
            ...p,
            status: 'DISCHARGED',
            dischargeData,
            bed: `Discharged (${p.bed})`,
            priority: 'STABLE',
            lastUpdate: `Discharged on ${dischargeData.dischargeDate}. Condition: ${dischargeData.conditionOnDischarge}.`,
            clinicalNotes: [dischargeNote, ...(p.clinicalNotes || [])],
          };

          if (selectedPatient?.patientId === patientId) {
            setSelectedPatient(updated);
          }
          return updated;
        }
        return p;
      })
    );
    setDischargeModalPatient(null);
  };

  // Handle Patient Re-Admission
  const handleReadmitPatient = (patientId: string) => {
    if (currentUser?.role === 'ADMIN') {
      console.warn('ADMIN is restricted from re-admitting patients.');
      return;
    }
    setPatients((prev) =>
      prev.map((p) => {
        if (p.patientId === patientId) {
          const updated: Patient = {
            ...p,
            status: 'ACTIVE',
            bed: 'Bed TBD',
            priority: 'REVIEW',
            lastUpdate: `Re-admitted to ward on ${new Date().toISOString().split('T')[0]}.`,
          };

          if (selectedPatient?.patientId === patientId) {
            setSelectedPatient(updated);
          }
          return updated;
        }
        return p;
      })
    );
  };

  // Navigation handlers
  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setActiveView('profile');
  };

  const handleOpenAddRoundNote = (patient: Patient) => {
    if (currentUser?.role === 'ADMIN') return;
    setDailyRoundModalPatient(patient);
  };

  const handleOpenCapture = (patient?: Patient) => {
    if (patient) {
      setSelectedPatient(patient);
    }
    setRoundModeOpen(false);
    setActiveView('capture');
  };

  // Add Daily Round Note
  const handleSaveRound = (patientId: string, roundNote: Omit<DailyRound, 'id'>) => {
    if (currentUser?.role === 'ADMIN') {
      console.warn('ADMIN is restricted from saving round notes.');
      return;
    }
    setPatients((prev) =>
      prev.map((p) => {
        if (p.patientId === patientId) {
          const newRound: DailyRound = {
            ...roundNote,
            id: `rd-${Date.now()}`,
          };
          const updatedPt: Patient = {
            ...p,
            lastUpdate: `[New Round Note ${newRound.date}] Assessment: ${newRound.assessment}`,
            todayPlan: newRound.plan,
            dailyRounds: [newRound, ...p.dailyRounds],
          };
          if (selectedPatient?.patientId === patientId) {
            setSelectedPatient(updatedPt);
          }
          return updatedPt;
        }
        return p;
      })
    );
  };

  // Save Extracted Document OCR Data
  const handleSaveExtractedData = (
    patientId: string,
    docType: DocumentType,
    imageUri: string,
    extractedFields: ExtractedField[],
    extractedInvestigations: InvestigationResult[],
    fulfilledPendingItems: string[] = []
  ) => {
    if (currentUser?.role === 'ADMIN') {
      console.warn('ADMIN is restricted from attaching OCR extraction data.');
      return;
    }
    setPatients((prev) =>
      prev.map((p) => {
        if (p.patientId === patientId) {
          const newDoc = {
            id: `doc-${Date.now()}`,
            uploadDate: new Date().toISOString().split('T')[0],
            documentType: docType,
            imageUri,
            verificationStatus: 'DOCTOR_VERIFIED' as const,
            extractedFields,
          };

          const currentPending = p.pendingInvestigations || [];
          const extractedNames = extractedInvestigations.map((i) => i.testName.toLowerCase());

          // Filter out fulfilled items
          const remainingPending = currentPending.filter((pendingItem) => {
            if (fulfilledPendingItems.includes(pendingItem)) return false;
            const lowerPending = pendingItem.toLowerCase();
            if (docType && lowerPending.includes(docType.toLowerCase())) return false;
            if (extractedNames.some((name) => lowerPending.includes(name) || name.includes(lowerPending))) return false;
            return true;
          });

          const fulfilledCount = currentPending.length - remainingPending.length;
          const updated = {
            ...p,
            documents: [newDoc, ...p.documents],
            investigations: [...extractedInvestigations, ...p.investigations],
            pendingInvestigations: remainingPending,
            lastUpdate: `New ${docType} document attached. ${fulfilledCount > 0 ? `${fulfilledCount} pending investigation(s) fulfilled.` : ''}`,
          };

          if (selectedPatient?.patientId === patientId) {
            setSelectedPatient(updated);
          }
          return updated;
        }
        return p;
      })
    );
  };

  // Add Pending Investigation
  const handleAddPendingInvestigation = (patientId: string, testName: string) => {
    if (currentUser?.role === 'ADMIN') return;
    const trimmed = testName.trim();
    if (!trimmed) return;

    setPatients((prev) =>
      prev.map((p) => {
        if (p.patientId === patientId) {
          const current = p.pendingInvestigations || [];
          if (current.includes(trimmed)) return p;
          const updated = {
            ...p,
            pendingInvestigations: [...current, trimmed],
          };
          if (selectedPatient?.patientId === patientId) {
            setSelectedPatient(updated);
          }
          return updated;
        }
        return p;
      })
    );
  };

  // Remove Pending Investigation
  const handleRemovePendingInvestigation = (patientId: string, testName: string) => {
    if (currentUser?.role === 'ADMIN') return;
    setPatients((prev) =>
      prev.map((p) => {
        if (p.patientId === patientId) {
          const updated = {
            ...p,
            pendingInvestigations: (p.pendingInvestigations || []).filter((inv) => inv !== testName),
          };
          if (selectedPatient?.patientId === patientId) {
            setSelectedPatient(updated);
          }
          return updated;
        }
        return p;
      })
    );
  };

  // Fulfill Pending Investigation Manually with Report
  const handleFulfillPendingInvestigation = (
    patientId: string,
    pendingTestName: string,
    resultData: Omit<InvestigationResult, 'id'>
  ) => {
    if (currentUser?.role === 'ADMIN') return;
    const newInvResult: InvestigationResult = {
      id: `inv-${Date.now()}`,
      ...resultData,
    };

    setPatients((prev) =>
      prev.map((p) => {
        if (p.patientId === patientId) {
          const remainingPending = (p.pendingInvestigations || []).filter((inv) => {
            if (inv === pendingTestName) return false;
            if (pendingTestName && inv.toLowerCase().includes(pendingTestName.toLowerCase())) return false;
            if (resultData.testName && inv.toLowerCase().includes(resultData.testName.toLowerCase())) return false;
            return true;
          });

          const updated = {
            ...p,
            investigations: [newInvResult, ...p.investigations],
            pendingInvestigations: remainingPending,
            lastUpdate: `Report recorded for ${resultData.testName}: ${resultData.result} ${resultData.unit || ''}.`,
          };

          if (selectedPatient?.patientId === patientId) {
            setSelectedPatient(updated);
          }
          return updated;
        }
        return p;
      })
    );
  };

  // Toggle Task Status
  const handleToggleTask = (patientId: string, taskId: string) => {
    if (currentUser?.role === 'ADMIN') return;
    setPatients((prev) =>
      prev.map((p) => {
        if (p.patientId === patientId) {
          return {
            ...p,
            tasks: p.tasks.map((t) =>
              t.id === taskId
                ? { ...t, status: t.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED' }
                : t
            ),
          };
        }
        return p;
      })
    );
  };

  // Add Task
  const handleAddTask = (patientId: string, description: string, category: TaskCategory) => {
    if (currentUser?.role === 'ADMIN') return;
    setPatients((prev) =>
      prev.map((p) => {
        if (p.patientId === patientId) {
          return {
            ...p,
            tasks: [
              ...p.tasks,
              {
                id: `t-${Date.now()}`,
                patientId,
                description,
                category,
                status: 'PENDING',
              },
            ],
          };
        }
        return p;
      })
    );
  };

  // Add Clinical Note
  const handleAddClinicalNote = (patientId: string, noteData: { content: string; author: string; category: any; isPinned?: boolean }) => {
    if (currentUser?.role === 'ADMIN') return;
    const newNote = {
      id: `cn-${Date.now()}`,
      date: new Date().toISOString().replace('T', ' ').slice(0, 16),
      ...noteData,
    };

    setPatients((prev) =>
      prev.map((p) => {
        if (p.patientId === patientId) {
          const updatedNotes = [newNote, ...(p.clinicalNotes || [])];
          const updatedPt = { ...p, clinicalNotes: updatedNotes };
          if (selectedPatient?.patientId === patientId) {
            setSelectedPatient(updatedPt);
          }
          return updatedPt;
        }
        return p;
      })
    );
  };

  // Delete Clinical Note
  const handleDeleteClinicalNote = (patientId: string, noteId: string) => {
    if (currentUser?.role === 'ADMIN') return;
    setPatients((prev) =>
      prev.map((p) => {
        if (p.patientId === patientId) {
          const updatedNotes = (p.clinicalNotes || []).filter((n) => n.id !== noteId);
          const updatedPt = { ...p, clinicalNotes: updatedNotes };
          if (selectedPatient?.patientId === patientId) {
            setSelectedPatient(updatedPt);
          }
          return updatedPt;
        }
        return p;
      })
    );
  };

  // Toggle Pin Clinical Note
  const handleTogglePinClinicalNote = (patientId: string, noteId: string) => {
    if (currentUser?.role === 'ADMIN') return;
    setPatients((prev) =>
      prev.map((p) => {
        if (p.patientId === patientId) {
          const updatedNotes = (p.clinicalNotes || []).map((n) =>
            n.id === noteId ? { ...n, isPinned: !n.isPinned } : n
          );
          const updatedPt = { ...p, clinicalNotes: updatedNotes };
          if (selectedPatient?.patientId === patientId) {
            setSelectedPatient(updatedPt);
          }
          return updatedPt;
        }
        return p;
      })
    );
  };

  // Admit New Patient
  const handleAddPatient = (newPatient: Patient) => {
    if (currentUser?.role === 'ADMIN') {
      console.warn('ADMIN is restricted from admitting new patients.');
      return;
    }
    setPatients((prev) => [newPatient, ...prev]);
    setSelectedPatient(newPatient);
    setActiveView('profile');
  };

  // Update Primary Diagnosis
  const handleUpdatePrimaryDiagnosis = (patientId: string, newDiagnosis: string) => {
    if (currentUser?.role === 'ADMIN') return;
    setPatients((prev) =>
      prev.map((p) => {
        if (p.patientId === patientId) {
          const updatedPt = { ...p, primaryDiagnosis: newDiagnosis };
          if (selectedPatient?.patientId === patientId) {
            setSelectedPatient(updatedPt);
          }
          return updatedPt;
        }
        return p;
      })
    );
  };

  // If not authenticated, display full-screen clinical login
  if (!currentUser) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="h-screen w-full bg-slate-950 flex items-center justify-center overflow-hidden font-sans">
      <div className="w-full max-w-[1600px] h-full lg:max-h-[900px] lg:aspect-[16/9] bg-slate-50 text-slate-900 flex flex-col overflow-hidden shadow-2xl relative lg:rounded-2xl lg:border lg:border-slate-800">
        {/* Top Navbar (Sticky on all screens) */}
        <Navbar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedWard={selectedWard}
          onWardChange={setSelectedWard}
          patients={patients}
          onSelectPatient={handleSelectPatient}
          onOpenNewPatient={() => setNewPatientModalOpen(true)}
          onOpenRoundMode={() => setRoundModeOpen(true)}
          onOpenCapture={() => setActiveView('capture')}
          currentUser={currentUser}
          onLockSession={() => setIsSessionLocked(true)}
          onLogout={handleLogout}
          onOpenSettings={() => setActiveView('settings')}
          mobileMenuOpen={mobileMenuOpen}
          onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
        />

      {/* Main Layout Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          activeView={activeView}
          onViewChange={(v) => setActiveView(v as any)}
          patientsCount={patients.filter((p) => p.status !== 'DISCHARGED').length}
          dischargedCount={patients.filter((p) => p.status === 'DISCHARGED').length}
          criticalCount={patients.filter((p) => p.status !== 'DISCHARGED' && p.priority === 'CRITICAL').length}
          pendingTasksCount={patients.filter((p) => p.status !== 'DISCHARGED').reduce((acc, p) => acc + (p.tasks ? p.tasks.filter((t) => t.status === 'PENDING').length : 0), 0)}
          onOpenRoundMode={() => setRoundModeOpen(true)}
          mobileMenuOpen={mobileMenuOpen}
          onCloseMobileMenu={() => setMobileMenuOpen(false)}
          currentUser={currentUser}
          onLockSession={() => setIsSessionLocked(true)}
          onLogout={handleLogout}
          onOpenSettings={() => setActiveView('settings')}
          patients={patients}
          selectedPatientId={selectedPatient?.patientId}
          onSelectPatient={handleSelectPatient}
        />

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto pb-24 md:pb-6">
          {activeView === 'dashboard' && (
            <Dashboard
              currentUser={currentUser}
              patients={patients}
              onSelectPatient={handleSelectPatient}
              onOpenPreRoundBrief={() => setActiveView('brief')}
              onOpenRoundMode={() => setRoundModeOpen(true)}
              onOpenCapture={handleOpenCapture}
              onOpenAddRoundNote={handleOpenAddRoundNote}
              onOpenDischargeList={() => setActiveView('discharged')}
            />
          )}

          {activeView === 'patients' && (
            <PatientListView
              patients={patients}
              onSelectPatient={handleSelectPatient}
              onOpenAddRoundNote={handleOpenAddRoundNote}
              onOpenCapture={handleOpenCapture}
              onOpenRoundMode={() => setRoundModeOpen(true)}
            />
          )}

          {activeView === 'brief' && (
            <PreRoundBrief
              patients={patients}
              onSelectPatient={handleSelectPatient}
              onOpenRoundMode={() => setRoundModeOpen(true)}
            />
          )}

          {activeView === 'profile' && selectedPatient && (
            <PatientProfile
              patient={patients.find((p) => p.patientId === selectedPatient.patientId) || selectedPatient}
              currentUser={currentUser}
              isReadOnly={currentUser?.role === 'ADMIN'}
              onBack={() => setActiveView('dashboard')}
              onOpenAddRoundNote={handleOpenAddRoundNote}
              onOpenCapture={handleOpenCapture}
              onOpenDischargeModal={(p) => setDischargeModalPatient(p)}
              onReadmitPatient={handleReadmitPatient}
              onAddClinicalNote={handleAddClinicalNote}
              onDeleteClinicalNote={handleDeleteClinicalNote}
              onTogglePinClinicalNote={handleTogglePinClinicalNote}
              onAddPendingInvestigation={handleAddPendingInvestigation}
              onRemovePendingInvestigation={handleRemovePendingInvestigation}
              onFulfillPendingInvestigation={handleFulfillPendingInvestigation}
              onUpdatePrimaryDiagnosis={handleUpdatePrimaryDiagnosis}
            />
          )}

          {activeView === 'discharged' && (
            <DischargeListView
              patients={patients}
              currentUser={currentUser}
              onSelectPatient={handleSelectPatient}
              onReadmitPatient={handleReadmitPatient}
              onNavigateToDashboard={() => setActiveView('dashboard')}
            />
          )}

          {activeView === 'trends' && (
            <InvestigationTrends
              patients={patients}
              onSelectPatient={handleSelectPatient}
              onUpdatePrimaryDiagnosis={handleUpdatePrimaryDiagnosis}
            />
          )}

          {activeView === 'capture' && (
            <CaptureUpload
              patients={patients}
              initialPatientId={selectedPatient?.patientId}
              onBackToProfile={() => setActiveView('profile')}
              onSaveExtractedData={handleSaveExtractedData}
            />
          )}

          {activeView === 'tasks' && (
            <TaskManagement
              patients={patients}
              onToggleTask={handleToggleTask}
              onAddTask={handleAddTask}
              onSelectPatient={handleSelectPatient}
            />
          )}

          {activeView === 'admin' && (
            <AdminConsole
              currentUser={currentUser || undefined}
              patients={patients}
              onSwitchUser={(user) => {
                handleLoginSuccess(user);
              }}
              onNavigateToDashboard={() => setActiveView('dashboard')}
              onSelectDoctor={(doc) => {
                handleLoginSuccess(doc);
                setActiveView('dashboard');
              }}
              onSelectPatient={handleSelectPatient}
            />
          )}

          {activeView === 'settings' && (
            <SettingsView
              currentUser={currentUser}
              onLogout={handleLogout}
              onUpdateUser={(updated) => {
                setCurrentUser(updated);
              }}
            />
          )}
        </main>
      </div>

      {/* BED-SIDE SCREEN LOCK OVERLAY */}
      {isSessionLocked && (
        <ScreenLockModal
          currentUser={currentUser}
          onUnlock={() => setIsSessionLocked(false)}
          onLogout={handleLogout}
        />
      )}

      {/* OVERLAYS & MODALS */}
      {roundModeOpen && (
        <RoundMode
          patients={patients}
          onClose={() => setRoundModeOpen(false)}
          onOpenAddRoundNote={handleOpenAddRoundNote}
          onOpenCapture={handleOpenCapture}
          onSelectPatient={(p) => {
            setRoundModeOpen(false);
            handleSelectPatient(p);
          }}
        />
      )}

      {dailyRoundModalPatient && (
        <DailyRoundModal
          patient={dailyRoundModalPatient}
          onClose={() => setDailyRoundModalPatient(null)}
          onSaveRound={handleSaveRound}
        />
      )}

      {newPatientModalOpen && (
        <NewPatientModal
          currentUser={currentUser}
          onClose={() => setNewPatientModalOpen(false)}
          onAddPatient={handleAddPatient}
        />
      )}

      {dischargeModalPatient && (
        <DischargeModal
          patient={dischargeModalPatient}
          onClose={() => setDischargeModalPatient(null)}
          onConfirmDischarge={handleConfirmDischarge}
        />
      )}
      </div>
    </div>
  );
};

export default App;
