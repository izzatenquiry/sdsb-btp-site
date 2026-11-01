import React from 'react';
import { OfficialFormHeader } from './OfficialFormHeader';

export function RegistersPackSheet({
  formData,
}: {
  formData?: any;
  setFormData?: (val: any) => void;
}) {
  const registerSuites = [
    {
      title: 'SUITE 1: ENGINEERING & SUBMITTAL REGISTERS',
      registers: [
        { code: 'REG-01', name: 'Master Drawing List Register (DLS)', count: '142 Dwgs', status: 'Active (Rev 04)', accRef: 'ACC-REG-DLS' },
        { code: 'REG-02', name: 'Method Statement Register (MOS)', count: '18 Submittals', status: '16 Approved, 2 In Review', accRef: 'ACC-REG-MOS' },
        { code: 'REG-03', name: 'Inspection & Test Plan Register (ITP)', count: '12 Packages', status: '11 Approved, 1 In Review', accRef: 'ACC-REG-ITP' },
        { code: 'REG-04', name: 'Material Approval Register (MAF)', count: '48 Submittals', status: '44 Approved, 4 In Review', accRef: 'ACC-REG-MAF' },
        { code: 'REG-05', name: 'Request for Information Register (RFI)', count: '29 RFIs', status: '27 Closed, 2 Open', accRef: 'ACC-REG-RFI' },
        { code: 'REG-06', name: 'Sample & Mock-Up Register', count: '8 Mock-ups', status: 'All Approved', accRef: 'ACC-REG-MCK' },
        { code: 'REG-07', name: 'Technical Submittal Register (TSR)', count: '24 Submissions', status: '22 Approved, 2 In Review', accRef: 'ACC-REG-TSR' },
      ],
    },
    {
      title: 'SUITE 2: FIELD QUALITY & SITE INSPECTIONS REGISTERS',
      registers: [
        { code: 'REG-08', name: 'Request for Work Inspection (RFWI)', count: '215 Inspections', status: '198 Approved, 17 In Progress', accRef: 'ACC-REG-RFWI' },
        { code: 'REG-09', name: 'Site Observation / Walkthrough (SOR)', count: '38 Observations', status: '35 Closed, 3 Open', accRef: 'ACC-REG-SOR' },
        { code: 'REG-10', name: 'Concrete Pouring & Batching Register', count: '1,420 m³ Cast', status: 'All Slump & Cubes Logged', accRef: 'ACC-REG-CONC' },
        { code: 'REG-11', name: 'Piling Records & Driving Register (PIL)', count: '8 Piles Tracked', status: '4 Installed, 4 Planned', accRef: 'ACC-REG-PIL' },
        { code: 'REG-12', name: 'Precast Element Quality Register', count: '64 Elements', status: 'Inspected at Yard & Site', accRef: 'ACC-REG-PCST' },
        { code: 'REG-13', name: 'Rebar Mill Cert & Tensile Test Register', count: '32 Batches', status: '100% SAMM Lab Tested', accRef: 'ACC-REG-RBAR' },
        { code: 'REG-14', name: 'Soil Compaction & Density Test Register', count: '42 Layers', status: '98.5% Relative Compaction', accRef: 'ACC-REG-SOIL' },
        { code: 'REG-15', name: 'Waterproofing & Envelope Test Register', count: '6 Flood Tests', status: 'All Passed 48h Test', accRef: 'ACC-REG-WPRF' },
      ],
    },
    {
      title: 'SUITE 3: NON-CONFORMANCE, ASSURANCE & HANDOVER REGISTERS',
      registers: [
        { code: 'REG-16', name: 'Non-Conformance Report Register (NCR)', count: '14 NCRs Total', status: '12 Closed, 2 Under Action', accRef: 'ACC-REG-NCR' },
        { code: 'REG-17', name: 'Corrective Action Request Register (CAR)', count: '5 CARs Issued', status: '4 Closed, 1 Monitoring', accRef: 'ACC-REG-CAR' },
        { code: 'REG-18', name: 'Inspection Checklist Register (CHK)', count: '168 Checksheets', status: 'Field Verified & Filed', accRef: 'ACC-REG-CHK' },
        { code: 'REG-19', name: 'Survey & Calibration Equipment Register', count: '16 Instruments', status: 'All Valid SIRIM / SAMM', accRef: 'ACC-REG-CAL' },
        { code: 'REG-20', name: 'Snagging & Punchlist Tracking Register', count: '52 Items', status: '48 Rectified, 4 In Progress', accRef: 'ACC-REG-SNAG' },
        { code: 'REG-21', name: 'Quality Audit & Surveillance Register', count: '6 Formal Audits', status: 'Zero Category 1 Finding', accRef: 'ACC-REG-AUD' },
        { code: 'REG-22', name: 'Digital Handover Quality Dossier Index', count: '18 Dossier Vols', status: 'Compiling for T&C Gate', accRef: 'ACC-REG-DOS' },
      ],
    },
  ];

  return (
    <div className="space-y-3 font-sans leading-tight">
      <OfficialFormHeader
        title="22 REGISTERS & DASHBOARD MASTER GOVERNANCE PACK"
        projectName={formData?.projectName || "SDSB · BANTING TECHNOLOGY PARK (BTP)"}
        docNo="BTP-QAQC-REG-001"
        revision="Rev 02"
        date="14.07.2026"
      />

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-4 gap-2 mb-3">
        <div className="p-2 border border-slate-300 bg-slate-50 rounded">
          <div className="text-[8px] font-bold uppercase tracking-wider text-slate-600">Total Registers</div>
          <div className="text-xl font-bold text-slate-900 mt-0.5">22 <span className="text-[9px] font-normal text-slate-500">Live</span></div>
          <div className="text-[8px] text-slate-500 mt-0.5">100% ACC Synchronized</div>
        </div>
        <div className="p-2 border border-emerald-200 bg-emerald-50 rounded">
          <div className="text-[8px] font-bold uppercase tracking-wider text-emerald-800">Compliance Rate</div>
          <div className="text-xl font-bold text-emerald-950 mt-0.5">97.8%</div>
          <div className="text-[8px] text-emerald-700 mt-0.5">Exceeds 95% Benchmark</div>
        </div>
        <div className="p-2 border border-blue-200 bg-blue-50 rounded">
          <div className="text-[8px] font-bold uppercase tracking-wider text-blue-800">Total Logged Items</div>
          <div className="text-xl font-bold text-blue-950 mt-0.5">624 <span className="text-[9px] font-normal text-blue-700">Records</span></div>
          <div className="text-[8px] text-slate-600 mt-0.5">Active Quality Submittals</div>
        </div>
        <div className="p-2 border border-amber-200 bg-amber-50 rounded">
          <div className="text-[8px] font-bold uppercase tracking-wider text-amber-800">Open Action Items</div>
          <div className="text-xl font-bold text-amber-950 mt-0.5">11 <span className="text-[9px] font-normal text-amber-700">Tracked</span></div>
          <div className="text-[8px] text-slate-600 mt-0.5">All within SLA window</div>
        </div>
      </div>

      {/* 3 Master Register Suites */}
      <div className="space-y-3 mb-3">
        {registerSuites.map((suite, sIdx) => (
          <div key={sIdx} className="border border-slate-700">
            <div className="bg-slate-800 text-white px-2 py-1 font-bold text-[9.5px] tracking-wider">
              {suite.title}
            </div>
            <table className="w-full border-collapse text-[8.5px]">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-400 font-bold text-slate-700">
                  <th className="p-1 border-r border-slate-300 w-[55px] text-center">Reg ID</th>
                  <th className="p-1 border-r border-slate-300 text-left">Register Description</th>
                  <th className="p-1 border-r border-slate-300 w-[100px] text-center">Volume / Records</th>
                  <th className="p-1 border-r border-slate-300 w-[160px] text-left">Current Status / Health</th>
                  <th className="p-1 w-[90px] text-center">ACC Hub Link</th>
                </tr>
              </thead>
              <tbody>
                {suite.registers.map((reg, rIdx) => (
                  <tr key={rIdx} className={`border-b border-slate-200 ${rIdx % 2 === 1 ? 'bg-slate-50' : ''}`}>
                    <td className="p-1 text-center font-bold text-blue-900 border-r border-slate-200">{reg.code}</td>
                    <td className="p-1 font-semibold border-r border-slate-200">{reg.name}</td>
                    <td className="p-1 text-center border-r border-slate-200">{reg.count}</td>
                    <td className="p-1 border-r border-slate-200 text-slate-700">{reg.status}</td>
                    <td className="p-1 text-center text-[7.5px] text-slate-500">{reg.accRef}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>

      {/* Document Custodian & Governance Endorsement */}
      <table className="w-full border-collapse border border-slate-700 text-[8.5px]">
        <thead>
          <tr className="bg-slate-200 font-bold border-b border-slate-700">
            <th className="p-1 border-r border-slate-400 w-1/3 text-left">DOCUMENT CONTROLLER (GC)</th>
            <th className="p-1 border-r border-slate-400 w-1/3 text-left">CONSULTANT QA/QC RE</th>
            <th className="p-1 w-1/3 text-left">PMC (TURNER) QUALITY LEAD</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="p-2 border-r border-slate-400 align-top">
              <div className="h-6 border-b border-dashed border-slate-300 mb-1 flex items-end italic text-blue-900 text-xs">Nurul Huda</div>
              <div className="font-bold">Name: Nurul Huda</div>
              <div>Designation: Master Document Controller</div>
              <div>Date: 14.07.2026</div>
            </td>
            <td className="p-2 border-r border-slate-400 align-top">
              <div className="h-6 border-b border-dashed border-slate-300 mb-1 flex items-end italic text-slate-900 text-xs">Ir. Dr. K. Nathan</div>
              <div className="font-bold">Name: Ir. Dr. K. Nathan, PE</div>
              <div>Designation: Lead Resident Engineer</div>
              <div>Date: 15.07.2026</div>
            </td>
            <td className="p-2 align-top">
              <div className="h-6 border-b border-dashed border-slate-300 mb-1 flex items-end italic text-slate-900 text-xs">Marcus Tan</div>
              <div className="font-bold">Name: Marcus Tan</div>
              <div>Designation: Senior QA/QC Director (PMC)</div>
              <div>Date: 16.07.2026</div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
