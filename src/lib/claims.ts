export interface Claim {
  id: string;
  claimId: string;
  patient: string;
  patientAge: number;
  patientSex: string;
  mrn: string;
  provider: string;
  payer: string;
  procedure: string;
  cptCode: string;
  chargeAmount: number;
  dateOfService: string;
  denialDate: string;
  denialCode: string;
  denialReason: string;
  timelyFilingDeadline: string;
  daysRemaining: number;
  priority: 'critical' | 'high' | 'medium';
  clinicalNotes: string;
}

export const CLAIMS: Claim[] = [
  {
    id: "1",
    claimId: "CLM-2026-0847291",
    patient: "Margaret Chen",
    patientAge: 72,
    patientSex: "F",
    mrn: "MRN-4419827",
    provider: "UT Health San Antonio — Cardiology",
    payer: "Aetna Medicare Advantage",
    procedure: "Transcatheter Aortic Valve Replacement (TAVR)",
    cptCode: "33361",
    chargeAmount: 62400,
    dateOfService: "01/15/2026",
    denialDate: "02/03/2026",
    denialCode: "CO-50",
    denialReason: "Medical Necessity Not Established — Submitted documentation does not demonstrate that the requested procedure meets medical necessity criteria per plan guidelines. Insufficient evidence of failed conservative therapy.",
    timelyFilingDeadline: "04/03/2026",
    daysRemaining: 36,
    priority: "critical",
    clinicalNotes: `Patient: Margaret Chen, 72F. Diagnosis: Severe symptomatic aortic stenosis.

Cardiology Progress Note (11/02/2025): Documented severe aortic stenosis with valve area 0.7 cm², mean gradient 48 mmHg. Notes failure of 6-month medical management with beta-blockers and diuretics. Patient reports NYHA Class III symptoms with declining functional status.

STS Risk Assessment (12/18/2025): STS Predicted Risk of Mortality: 8.2% (high risk). Heart Team consensus documented recommending TAVR over SAVR given comorbidities including CKD Stage 3, COPD, and prior sternotomy.

Echocardiogram Report (01/08/2026): Transthoracic echo confirms severe AS: AVA 0.68 cm², peak velocity 4.6 m/s, EF 45%. Findings consistent with guideline criteria for intervention per ACC/AHA 2020 guidelines.

Heart Team Meeting (12/20/2025): Multidisciplinary Heart Team convened. Recommendation noted in cardiology note but formal standalone Heart Team letter not yet in structured format.`
  },
  {
    id: "2",
    claimId: "CLM-2026-0851437",
    patient: "Robert Williams",
    patientAge: 58,
    patientSex: "M",
    mrn: "MRN-5527103",
    provider: "UT Health San Antonio — Orthopedics",
    payer: "UnitedHealthcare Choice Plus",
    procedure: "Lumbar Spinal Fusion (L4-L5)",
    cptCode: "22612",
    chargeAmount: 45800,
    dateOfService: "01/22/2026",
    denialDate: "02/10/2026",
    denialCode: "CO-50",
    denialReason: "Prior Authorization Criteria Not Met — Documentation does not demonstrate failure of conservative treatment for minimum 6 months as required by plan policy. Physical therapy records incomplete.",
    timelyFilingDeadline: "05/10/2026",
    daysRemaining: 73,
    priority: "high",
    clinicalNotes: `Patient: Robert Williams, 58M. Diagnosis: Degenerative disc disease L4-L5 with radiculopathy.

Orthopedic Evaluation (06/15/2025): MRI shows Grade 3 disc degeneration at L4-L5 with moderate foraminal stenosis and left L5 nerve root compression. VAS pain score 8/10. ODI score 62%.

Physical Therapy Records (07/2025-12/2025): Completed 24 sessions over 6 months. Initial PT evaluation documented. Progress notes show 3 months of PT with minimal improvement. Patient reports worsening radiculopathy. However, some session notes are missing from months 4-5.

Pain Management (09/2025): Epidural steroid injection x2 with transient relief lasting <2 weeks each. Facet joint injections attempted with no benefit.

Neurosurgery Consult (12/28/2025): Recommends surgical intervention given failure of 6+ months conservative care. EMG confirms active L5 radiculopathy.`
  },
  {
    id: "3",
    claimId: "CLM-2026-0853219",
    patient: "Sarah Martinez",
    patientAge: 45,
    patientSex: "F",
    mrn: "MRN-6638291",
    provider: "UT Health San Antonio — Oncology",
    payer: "Blue Cross Blue Shield TX",
    procedure: "Pembrolizumab (Keytruda) Infusion — Cycle 4",
    cptCode: "96413",
    chargeAmount: 28900,
    dateOfService: "02/01/2026",
    denialDate: "02/15/2026",
    denialCode: "CO-236",
    denialReason: "Investigational/Experimental — This procedure/service is considered investigational or experimental for the indicated diagnosis. Off-label use of pembrolizumab for this tumor type not supported by plan formulary.",
    timelyFilingDeadline: "05/15/2026",
    daysRemaining: 78,
    priority: "high",
    clinicalNotes: `Patient: Sarah Martinez, 45F. Diagnosis: Metastatic endometrial carcinoma, MSI-high/dMMR.

Pathology Report (10/2025): Endometrial adenocarcinoma, FIGO Grade 3. Immunohistochemistry: MSI-high, dMMR (loss of MLH1/PMS2). PD-L1 CPS 15. Next-gen sequencing confirms TMB-high (28 mut/Mb).

Treatment History: First-line carboplatin/paclitaxel x6 cycles completed 09/2025. Disease progression on CT scan 11/2025 with new hepatic and peritoneal metastases.

Oncology Notes (12/2025): Initiated pembrolizumab 200mg q3w as second-line therapy per NCCN Category 1 recommendation for MSI-H/dMMR solid tumors. FDA-approved indication (KEYNOTE-158). Cycles 1-3 administered with partial response on interim imaging.

Current Status: Cycle 4 administered 02/01/2026. CT scan shows continued partial response with 40% reduction in target lesions per RECIST 1.1.`
  },
  {
    id: "4",
    claimId: "CLM-2026-0849876",
    patient: "James Thompson",
    patientAge: 67,
    patientSex: "M",
    mrn: "MRN-7741058",
    provider: "UT Health San Antonio — Pulmonology",
    payer: "Cigna HealthSpring",
    procedure: "Endobronchial Valve Placement (Zephyr)",
    cptCode: "31647",
    chargeAmount: 38500,
    dateOfService: "01/28/2026",
    denialDate: "02/12/2026",
    denialCode: "CO-50",
    denialReason: "Medical Necessity Not Established — Clinical documentation does not support that the patient meets all required criteria for endobronchial valve placement per plan guidelines.",
    timelyFilingDeadline: "04/12/2026",
    daysRemaining: 45,
    priority: "medium",
    clinicalNotes: `Patient: James Thompson, 67M. Diagnosis: Severe heterogeneous emphysema, GOLD Stage IV COPD.

Pulmonary Function Tests (11/2025): FEV1 28% predicted, RV/TLC 0.62, DLCO 32% predicted. 6-minute walk test: 210 meters.

CT Chest Quantitative Analysis (12/2025): Chartis assessment confirms intact interlobar fissure (>95%) in left upper lobe. Heterogeneity index >15% between target (LUL) and ipsilateral lobe. Target lobe volume 2.8L.

Pulmonary Rehabilitation (06/2025-11/2025): Completed full 12-week program. Documented continued severe functional limitation despite optimal medical therapy including triple inhaler therapy (ICS/LAMA/LABA).

Multidisciplinary Review (12/15/2025): Interventional pulmonology, thoracic surgery, and pulmonary rehab team reviewed case. Patient not a surgical candidate for LVRS due to comorbidities. EBV placement recommended per LIBERATE trial criteria.`
  }
];

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount);
}

export function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'critical': return 'text-red-500 bg-red-500/10 border-red-500/20';
    case 'high': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
    case 'medium': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
    default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
  }
}

export function getTotalAtRisk(): number {
  return CLAIMS.reduce((sum, c) => sum + c.chargeAmount, 0);
}
