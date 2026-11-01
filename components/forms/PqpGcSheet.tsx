import React from 'react';
import { OfficialFormHeader } from './OfficialFormHeader';

export function PqpGcSheet({
  formData,
}: {
  formData?: any;
  setFormData?: (val: any) => void;
}) {
  return (
    <div className="space-y-3 font-sans leading-tight">
      <OfficialFormHeader
        title="PROJECT QUALITY PLAN (GC) - GOVERNANCE BASELINE"
        projectName={formData?.projectName || "SDSB · BANTING TECHNOLOGY PARK (BTP)"}
        docNo="BTP-QAQC-TPL-PQP-GC-001"
        revision="Rev 02"
        date="14.07.2026"
      />

      {/* SECTION A & B: SUBMISSION DETAILS & REVISION CRITERIA */}
      <table className="w-full border-collapse border border-slate-700 mb-3 text-[9.5px]">
        <tbody>
          <tr className="bg-slate-800 text-white font-bold">
            <td colSpan={4} className="p-1 text-[10px] tracking-wider uppercase">A. SUBMISSION DETAILS</td>
          </tr>
          <tr className="border-b border-slate-300">
            <td className="w-[18%] bg-slate-100 p-1.5 font-bold border-r border-slate-300">PQP No.:</td>
            <td className="w-[42%] p-1.5 font-bold text-blue-900 border-r border-slate-300">BTP-PQP-GC-001</td>
            <td className="w-[18%] bg-slate-100 p-1.5 font-bold border-r border-slate-300">Revision:</td>
            <td className="w-[22%] p-1.5">Rev 02</td>
          </tr>
          <tr className="border-b border-slate-300">
            <td className="bg-slate-100 p-1.5 font-bold border-r border-slate-300">ACC Reference:</td>
            <td className="p-1.5 text-[9px] text-slate-700 border-r border-slate-300">ACC-BTP-PQP-2026-0001</td>
            <td className="bg-slate-100 p-1.5 font-bold border-r border-slate-300">Date Submitted:</td>
            <td className="p-1.5">14 July 2026</td>
          </tr>
          <tr>
            <td className="bg-slate-100 p-1.5 font-bold border-r border-slate-300">Contractor / Trade:</td>
            <td colSpan={3} className="p-1.5 font-medium">BTP Lead Main Contractor Consortium (Civil, Structural, Architectural & MEP Packages)</td>
          </tr>
        </tbody>
      </table>

      {/* SECTION B: REVISION HISTORY TABLE */}
      <div className="mb-3 border border-slate-700">
        <div className="bg-slate-800 text-white px-2 py-1 font-bold text-[10px] tracking-wider">
          B. SUBMISSION / REVISION CRITERIA
        </div>
        <table className="w-full border-collapse text-[9px]">
          <thead>
            <tr className="bg-slate-200 border-b border-slate-700 font-bold text-center">
              <th className="p-1 border-r border-slate-400 w-[45px]">Rev.</th>
              <th className="p-1 border-r border-slate-400 w-[80px]">Date</th>
              <th className="p-1 border-r border-slate-400 w-[240px] text-left">Submission Criteria / Purpose</th>
              <th className="p-1 text-left">Status / Comments</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-slate-300">
              <td className="p-1 text-center font-bold border-r border-slate-300">00</td>
              <td className="p-1 text-center border-r border-slate-300">01.06.2026</td>
              <td className="p-1 border-r border-slate-300">Initial Project Quality Plan submission for approval</td>
              <td className="p-1 text-slate-600">Revise & Resubmit (Incorporating ACC workflow comments)</td>
            </tr>
            <tr className="border-b border-slate-300">
              <td className="p-1 text-center font-bold border-r border-slate-300">01</td>
              <td className="p-1 text-center border-r border-slate-300">22.06.2026</td>
              <td className="p-1 border-r border-slate-300">Incorporation of Turner PMC review comments & ITA matrix</td>
              <td className="p-1 text-slate-600">Approved with comments (Minor updates on testing labs)</td>
            </tr>
            <tr>
              <td className="p-1 text-center font-bold border-r border-slate-300 bg-emerald-50 text-emerald-800">02</td>
              <td className="p-1 text-center border-r border-slate-300">14.07.2026</td>
              <td className="p-1 border-r border-slate-300 font-semibold">Final Baseline Construction Project Quality Plan</td>
              <td className="p-1 font-bold text-emerald-700">Approved for Full Construction Phase Execution</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* SECTION C: 9 QUALITY MANAGEMENT SECTIONS */}
      <div className="mb-3 border border-slate-700">
        <div className="bg-slate-800 text-white px-2 py-1 font-bold text-[10px] tracking-wider">
          C. PQP MANDATORY QUALITY MANAGEMENT SECTIONS
        </div>
        <div className="grid grid-cols-3 gap-2 p-2 bg-slate-50 text-[8.5px]">
          <div className="p-2 bg-white border border-slate-300 rounded shadow-xs">
            <div className="font-bold text-blue-900 border-b border-slate-200 pb-1 mb-1">1.0 Policy & Objectives</div>
            <p className="text-slate-600">Zero-defect culture, First-Time-Right philosophy, mission-critical data park reliability benchmarks, and monthly quality KPIs.</p>
          </div>
          <div className="p-2 bg-white border border-slate-300 rounded shadow-xs">
            <div className="font-bold text-blue-900 border-b border-slate-200 pb-1 mb-1">2.0 Organization & Team</div>
            <p className="text-slate-600">Dedicated QA/QC Manager, certified QC inspectors per trade, independent reporting line to executive management away from site production pressures.</p>
          </div>
          <div className="p-2 bg-white border border-slate-300 rounded shadow-xs">
            <div className="font-bold text-blue-900 border-b border-slate-200 pb-1 mb-1">3.0 ACC Document Control</div>
            <p className="text-slate-600">Autodesk Construction Cloud 3-tier submittal workflows, digital drawing distribution, RFWI tracking, and revision versioning protocols.</p>
          </div>
          <div className="p-2 bg-white border border-slate-300 rounded shadow-xs">
            <div className="font-bold text-blue-900 border-b border-slate-200 pb-1 mb-1">4.0 Material & Batching Control</div>
            <p className="text-slate-600">MAF technical submittals, mill certificate validation, batching plant surveillance, on-site storage protection, and delivery quarantine.</p>
          </div>
          <div className="p-2 bg-white border border-slate-300 rounded shadow-xs">
            <div className="font-bold text-blue-900 border-b border-slate-200 pb-1 mb-1">5.0 ITP & Inspection Checklists</div>
            <p className="text-slate-600">Standardized 6-stage Inspection and Test Plans, mandatory Hold Points (H), pre-pour inspection walkdowns, and concealed work sign-offs.</p>
          </div>
          <div className="p-2 bg-white border border-slate-300 rounded shadow-xs">
            <div className="font-bold text-blue-900 border-b border-slate-200 pb-1 mb-1">6.0 NCR & Corrective Action</div>
            <p className="text-slate-600">Root-cause investigation (Fishbone/5-Why), systemic corrective actions, 14-day resolution SLA, and prevention of defect recurrence.</p>
          </div>
          <div className="p-2 bg-white border border-slate-300 rounded shadow-xs">
            <div className="font-bold text-blue-900 border-b border-slate-200 pb-1 mb-1">7.0 Testing & Laboratory Control</div>
            <p className="text-slate-600">Independent Testing Agency (ITA) governance, SAMM-accredited laboratories, concrete cube crushing, PIT/PDA pile testing, soil compaction.</p>
          </div>
          <div className="p-2 bg-white border border-slate-300 rounded shadow-xs">
            <div className="font-bold text-blue-900 border-b border-slate-200 pb-1 mb-1">8.0 Pre-Commissioning & Handover</div>
            <p className="text-slate-600">Level 1-5 commissioning integration, as-built drawing redlines, O&M documentation, and complete digital quality dossiers.</p>
          </div>
          <div className="p-2 bg-white border border-slate-300 rounded shadow-xs">
            <div className="font-bold text-blue-900 border-b border-slate-200 pb-1 mb-1">9.0 Quality Audits & Surveillance</div>
            <p className="text-slate-600">Internal monthly QA/QC audits, joint weekly PMC walkthroughs, surveillance reporting, and management review board meetings.</p>
          </div>
        </div>
      </div>

      {/* SECTION D: DOCUMENT DEVELOPMENT & ENDORSEMENTS */}
      <table className="w-full border-collapse border border-slate-700 text-[8.5px]">
        <thead>
          <tr className="bg-slate-200 font-bold border-b border-slate-700">
            <th className="p-1 border-r border-slate-400 w-1/3 text-left">GENERAL CONTRACTOR (GC) ENDORSEMENT</th>
            <th className="p-1 border-r border-slate-400 w-1/3 text-left">CONSULTANT (RE / RA) REVIEW</th>
            <th className="p-1 w-1/3 text-left">PMC (TURNER) ACCEPTANCE</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="p-2 border-r border-slate-400 align-top">
              <div className="text-[8px] text-slate-500 mb-1">GC Project Director:</div>
              <div className="h-6 border-b border-dashed border-slate-300 mb-1 flex items-end italic text-blue-900 text-xs">Tan Sri Dr. Jeffrey Lim</div>
              <div className="font-bold">Name: Tan Sri Dr. Jeffrey Lim</div>
              <div>Designation: Project Director</div>
              <div>Date: 14.07.2026</div>
            </td>
            <td className="p-2 border-r border-slate-400 align-top">
              <div className="text-[8px] text-slate-500 mb-1">Status: [ <span className="font-bold text-emerald-700">Reviewed & Recommended</span> ]</div>
              <div className="h-6 border-b border-dashed border-slate-300 mb-1 flex items-end italic text-slate-900 text-xs">Ir. Dr. K. Nathan</div>
              <div className="font-bold">Name: Ir. Dr. K. Nathan, PE</div>
              <div>Designation: Lead Resident Engineer</div>
              <div>Date: 15.07.2026</div>
            </td>
            <td className="p-2 align-top">
              <div className="text-[8px] text-slate-500 mb-1">Status: [ <span className="font-bold text-emerald-700">Accepted & Baselined</span> ]</div>
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
