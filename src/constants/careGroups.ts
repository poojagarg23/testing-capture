export const careGroups = {
  respiratory: {
    title: 'Respiratory',
    items: [
      { name: 'Ventilator', description: ' ' },
      {
        name: 'Tracheostomy / Trach Care',
        description:
          'Trach type/size; Caregiver training; Supplies needed; Oxygen/vent support; Airway status',
      },
      { name: 'Noninvasive ventilation', description: '' },
      { name: 'High-flow oxygen', description: '' },
    ],
  },
  surgicalWound: {
    title: 'Surgical / Wound',
    items: [
      { name: 'Postop / Surgical care', description: '' },
      { name: 'Further Planned Surgery', description: '' },
      { name: 'Significant wound care', description: '' },
    ],
  },
  ivMedications: {
    title: 'IV Medications / Infusions',
    items: [
      { name: 'IV Antibiotics', description: '' },
      { name: 'Anticoagulant infusion', description: '' },
      { name: 'Cardiac infusions', description: '' },
      { name: 'IV Medications', description: '' },
      { name: 'Vasopressor infusion', description: '' },
      { name: 'Sedation infusions', description: '' },
      { name: 'IV/Epidural pain', description: '' },
      { name: 'Venous access', description: '' },
      { name: 'IVIG/Plasma Exchange', description: '' },
    ],
  },
  nutrition: {
    title: 'Nutrition',
    items: [
      {
        name: 'Enteral Nutrition',
        description:
          'Tolerating feeds; Tube site stable; Feeding regimen documented; Medication compatibility; Site care instructions; Supply/formula availability; Tube type accepted, Troubleshoot common complications',
      },
      { name: 'Total Parenteral Nutrition', description: '' },
    ],
  },
  oncology: {
    title: 'Oncology',
    items: [
      { name: 'IV Chemotherapy / Immunotherapy', description: '' },
      { name: 'PO Chemotherapy / Immunotherapy', description: '' },
      { name: 'Radiation therapy', description: '' },
      { name: 'Frequent Transfusions', description: '' },
    ],
  },
  urologicalGI: {
    title: 'Urological / GI',
    items: [
      {
        name: 'Indwelling urinary catheter',
        description:
          'Ongoing need; Infection/complications; Site care guidance; Catheter details; Supply coordination',
      },
      { name: 'Rectal tube / FMS', description: '' },
    ],
  },
  behavioralNeuro: {
    title: 'Behavioral & Neuro',
    items: [
      { name: 'Intensive psychiatric / behavioral', description: '' },
      {
        name: 'Cognitive impairment',
        description:
          'Capacity assessment; Safety risks;Supervision needs; Behavior strategies; Communication barriers; Med adherence support; Rehab/discharge limitations',
      },
      { name: '1:1 Sitter', description: '' },
      {
        name: 'Seizures',
        description:
          'Seizure type/frequency; Medication plan; Stability/triggers; Safety needs; Emergency protocol',
      },
    ],
  },
  other: {
    title: 'Other',
    items: [
      { name: 'Hospice', description: '' },
      {
        name: 'Obesity Class 3',
        description:
          'Mobility support; Transfer safety; Skin integrity; Comorbidity risks; Environment fit',
      },
      { name: 'Telemetry', description: '' },
      { name: 'Transplant', description: '' },
      { name: 'LVAD', description: '' },
      { name: 'Dialysis', description: '' },
    ],
  },
};
