import React from 'react';
import { OfficialFormHeader } from './OfficialFormHeader';

export function PqpPmcSheet({
  formData,
}: {
  formData?: any;
  setFormData?: (val: any) => void;
}) {
  return (
    <div className="space-y-3 font-sans leading-tight">
      <OfficialFormHeader
        title="PROJECT QUALITY PLAN (PMC) - GOVERNANCE & RESILIENCE MANDATE"
        projectName={formData?.projectName || "SDSB · BANTING TECHNOLOGY PARK (BTP)"}
        docNo="BTP-QAQC-TPL-PQP-PMC-001"
        revision="Rev 02"
        date="14.07.2026"
      />

      {/* SECTION A & B: SUBMISSION DETAILS & REVISION CRITERIA */}
      <table className="w-full border-collapse border border-slate-700 mb-3 text-[9.5px]">
        <tbody>
          <tr className="bg-slate-800 text-white font-bold">
            <td colSpan={4} className="p-1 text-[10px] tracking-wider uppercase">A. GOVERNANCE MANDATE DETAILS</td>
          </tr>
          <tr className="border-b border-slate-300">
            <td className="w-[18%] bg-slate-100 p-1.5 font-bold border-r border-slate-300">PQP (PMC) No.:</td>
            <td className="w-[42%] p-1.5 font-bold text-blue-900 border-r border-slate-300">BTP-PQP-PMC-001</td>
            <td className="w-[18%] bg-slate-100 p-1.5 font-bold border-r border-slate-300">Revision:</td>
            <td className="w-[22%] p-1.5">Rev 02</td>
          </tr>
          <tr className="border-b border-slate-300">
            <td className="bg-slate-100 p-1.5 font-bold border-r border-slate-300">ACC Reference:</td>
            <td className="p-1.5 text-[9px] text-slate-700 border-r border-slate-300">ACC-BTP-PMC-PQP-2026-0001</td>
            <td className="bg-slate-100 p-1.5 font-bold border-r border-slate-300">Date Issued:</td>
            <td className="p-1.5">14 July 2026</td>
          </tr>
          <tr>
            <td className="bg-slate-100 p-1.5 font-bold border-r border-slate-300">Project Management Consultant:</td>
            <td colSpan={3} className="p-1.5 font-medium">Turner International (Malaysia) Sdn Bhd in association with DayOne Data Park Advisory</td>
          </tr>
        </tbody>
      </table>

      {/* SECTION B: REVISION HISTORY TABLE */}
      <div className="mb-3 border border-slate-700">
        <div className="bg-slate-800 text-white px-2 py-1 font-bold text-[10px] tracking-wider">
          B. REVISION & GOVERNANCE MANDATE TRACKING
        </div>
        <table className="w-full border-collapse text-[9px]">
          <thead>
            <tr className="bg-slate-200 border-b border-slate-700 font-bold text-center">
              <th className="p-1 border-r border-slate-400 w-[45px]">Rev.</th>
              <th className="p-1 border-r border-slate-400 w-[80px]">Date</th>
              <th className="p-1 border-r border-slate-400 w-[240px] text-left">Mandate / Scope of Revision</th>
              <th className="p-1 text-left">Sign-off Status</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-slate-300">
              <td className="p-1 text-center font-bold border-r border-slate-300">00</td>
              <td className="p-1 text-center border-r border-slate-300">01.06.2026</td>
              <td className="p-1 border-r border-slate-300">Draft PMC Quality Governance Charter & ACC Framework</td>
              <td className="p-1 text-slate-600">Issued for Stakeholder Review</td>
            </tr>
            <tr className="border-b border-slate-300">
              <td className="p-1 text-center font-bold border-r border-slate-300">01</td>
              <td className="p-1 text-center border-r border-slate-300">25.06.2026</td>
              <td className="p-1 border-r border-slate-300">Incorporation of DayOne mission-critical Uptime Tier III standards</td>
              <td className="p-1 text-slate-600">Client Endorsed</td>
            </tr>
            <tr>
              <td className="p-1 text-center font-bold border-r border-slate-300 bg-emerald-50 text-emerald-800">02</td>
              <td className="p-1 text-center border-r border-slate-300">14.07.2026</td>
              <td className="p-1 border-r border-slate-300 font-semibold">Final Multi-Package Quality Governance Baseline (Construction Phase)</td>
              <td className="p-1 font-bold text-emerald-700">Adopted as Master Project Governance Standard</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* SECTION C: 8 PMC GOVERNANCE PILLARS */}
      <div className="mb-3 border border-slate-700">
        <div className="bg-slate-800 text-white px-2 py-1 font-bold text-[10px] tracking-wider">
          C. PMC QUALITY GOVERNANCE CORE PILLARS
        </div>
        <div className="grid grid-cols-2 gap-2 p-2 bg-slate-50 text-[8.5px]">
          <div className="p-2 bg-white border border-slate-300 rounded shadow-xs">
            <div className="font-bold text-blue-900 border-b border-slate-200 pb-1 mb-1">1.0 Mission-Critical Quality Resilience</div>
            <p className="text-slate-600">Enforcing stringent data center Tier III / Tier IV physical and technical redundancy parameters across civil, structural, envelope, power, and cooling packages.</p>
          </div>
          <div className="p-2 bg-white border border-slate-300 rounded shadow-xs">
            <div className="font-bold text-blue-900 border-b border-slate-200 pb-1 mb-1">2.0 Multi-Package Synchronization</div>
            <p className="text-slate-600">Ensuring seamless interface control between General Contractor, Piling Specialist, Substation Utility, Precast Supplier, and MEP Package Contractors.</p>
          </div>
          <div className="p-2 bg-white border border-slate-300 rounded shadow-xs">
            <div className="font-bold text-blue-900 border-b border-slate-200 pb-1 mb-1">3.0 ACC 3-Tier Review & Gatekeeper Architecture</div>
            <p className="text-slate-600">Operating the single source of truth in Autodesk Construction Cloud: Tier 1 GC Submission → Tier 2 Consultant Technical Review → Tier 3 PMC Quality Acceptance.</p>
          </div>
          <div className="p-2 bg-white border border-slate-300 rounded shadow-xs">
            <div className="font-bold text-blue-900 border-b border-slate-200 pb-1 mb-1">4.0 Quality Risk Early-Warning Protocols</div>
            <p className="text-slate-600">Real-time surveillance dashboards tracking overdue RFWIs, repeating NCR patterns, concrete cube failures, and unauthorized material substitutions.</p>
          </div>
          <div className="p-2 bg-white border border-slate-300 rounded shadow-xs">
            <div className="font-bold text-blue-900 border-b border-slate-200 pb-1 mb-1">5.0 Independent Testing Agency (ITA) Governance</div>
            <p className="text-slate-600">Direct PMC supervision over SAMM-accredited independent third-party laboratories for pile dynamic load testing (PDA), integrity testing (PIT), and soil geotechnics.</p>
          </div>
          <div className="p-2 bg-white border border-slate-300 rounded shadow-xs">
            <div className="font-bold text-blue-900 border-b border-slate-200 pb-1 mb-1">6.0 Commissioning & Handover Assurance (Level 1-5)</div>
            <p className="text-slate-600">Structured quality gates from Factory Acceptance Testing (FAT Level 1), Site Component Verification (Level 2), Pre-Functional (Level 3), Functional (Level 4), to Integrated Systems Testing (IST Level 5).</p>
          </div>
        </div>
      </div>

      {/* SECTION D: ENDORSEMENTS & GOVERNANCE SIGN-OFF */}
      <table className="w-full border-collapse border border-slate-700 text-[8.5px]">
        <thead>
          <tr className="bg-slate-200 font-bold border-b border-slate-700">
            <th className="p-1 border-r border-slate-400 w-1/3 text-left">PMC (TURNER) QUALITY DIRECTOR</th>
            <th className="p-1 border-r border-slate-400 w-1/3 text-left">CONSULTANT LEAD (C&S / MEP)</th>
            <th className="p-1 w-1/3 text-left">CLIENT / OWNER (DAYONE)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="p-2 border-r border-slate-400 align-top">
              <div className="text-[8px] text-slate-500 mb-1">PMC Project Governance Lead:</div>
              <div className="h-6 border-b border-dashed border-slate-300 mb-1 flex items-end italic text-blue-900 text-xs">Marcus Tan</div>
              <div className="font-bold">Name: Marcus Tan</div>
              <div>Designation: Senior QA/QC Director (Turner)</div>
              <div>Date: 14.07.2026</div>
            </td>
            <td className="p-2 border-r border-slate-400 align-top">
              <div className="text-[8px] text-slate-500 mb-1">Lead Consultant Endorsement:</div>
              <div className="h-6 border-b border-dashed border-slate-300 mb-1 flex items-end italic text-slate-900 text-xs">Ir. Dr. K. Nathan</div>
              <div className="font-bold">Name: Ir. Dr. K. Nathan, PE</div>
              <div>Designation: Principal Consultant Engineer</div>
              <div>Date: 15.07.2026</div>
            </td>
            <td className="p-2 align-top">
              <div className="text-[8px] text-slate-500 mb-1">Owner Representative Endorsement:</div>
              <div className="h-6 border-b border-dashed border-slate-300 mb-1 flex items-end italic text-slate-900 text-xs">Derrick Wong</div>
              <div className="font-bold">Name: Derrick Wong</div>
              <div>Designation: Project Director (DayOne BTP)</div>
              <div>Date: 16.07.2026</div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
