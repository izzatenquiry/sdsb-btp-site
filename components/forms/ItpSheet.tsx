import React from 'react';
import { OfficialFormHeader } from './OfficialFormHeader';

export function ItpSheet({
  formData,
}: {
  formData?: any;
  setFormData?: (val: any) => void;
}) {
  return (
    <div className="space-y-3 font-sans leading-tight">
      <OfficialFormHeader
        title="INSPECTION & TEST PLAN (ITP) SUBMISSION & REVIEW FORM"
        projectName={formData?.projectName || "SDSB · BANTING TECHNOLOGY PARK (BTP)"}
        docNo="BTP-QAQC-TPL-ITP-001"
        revision="Rev 02"
        date="14.07.2026"
      />

      {/* Submittal Metadata Grid */}
      <table className="w-full border-collapse border border-slate-700 mb-3 text-[9.5px]">
        <tbody>
          <tr className="border-b border-slate-400">
            <td className="w-[18%] bg-slate-100 p-1.5 font-bold border-r border-slate-400">Project Name:</td>
            <td className="w-[42%] p-1.5 font-semibold border-r border-slate-400">SDSB · BANTING TECHNOLOGY PARK (BTP)</td>
            <td className="w-[18%] bg-slate-100 p-1.5 font-bold border-r border-slate-400">ITP No.:</td>
            <td className="w-[22%] p-1.5 font-bold text-blue-900">BTP-ITP-C&S-001</td>
          </tr>
          <tr className="border-b border-slate-400">
            <td className="bg-slate-100 p-1.5 font-bold border-r border-slate-400">Package / Trade:</td>
            <td className="p-1.5 border-r border-slate-400">Civil & Structural Works - Substructure & Piling</td>
            <td className="bg-slate-100 p-1.5 font-bold border-r border-slate-400">Revision:</td>
            <td className="p-1.5">Rev 02</td>
          </tr>
          <tr className="border-b border-slate-400">
            <td className="bg-slate-100 p-1.5 font-bold border-r border-slate-400">General Contractor (GC):</td>
            <td className="p-1.5 border-r border-slate-400">BTP Lead Infrastructure & Building Consortium</td>
            <td className="bg-slate-100 p-1.5 font-bold border-r border-slate-400">ACC Reference:</td>
            <td className="p-1.5 text-[9px] text-slate-700">ACC-BTP-ITP-2026-0042</td>
          </tr>
          <tr>
            <td className="bg-slate-100 p-1.5 font-bold border-r border-slate-400">Main Scope of Works:</td>
            <td colSpan={3} className="p-1.5">
              Comprehensive inspection, testing verification, Hold Points (H), Witness Points (W), and Record Reviews (R) governing boredom, reinforcement fabrication, slump test, concrete casting, and integrity testing (PIT/PDA).
            </td>
          </tr>
        </tbody>
      </table>

      {/* Main ITP Matrix */}
      <div className="mb-2">
        <div className="bg-slate-800 text-white px-2 py-1 font-bold text-[10px] tracking-wider uppercase">
          INSPECTION & TEST PLAN MATRIX
        </div>
        <table className="w-full border-collapse border border-slate-700 text-[8.5px]">
          <thead>
            <tr className="bg-slate-200 text-center font-bold border-b border-slate-700">
              <th rowSpan={2} className="border-r border-slate-400 p-1 w-[35px]">Item</th>
              <th rowSpan={2} className="border-r border-slate-400 p-1 w-[160px] text-left">Activity Description</th>
              <th colSpan={2} className="border-r border-slate-400 p-1">Acceptance Requirements</th>
              <th rowSpan={2} className="border-r border-slate-400 p-1 w-[70px]">Stage / Frequency</th>
              <th rowSpan={2} className="border-r border-slate-400 p-1 w-[60px]">Method</th>
              <th colSpan={4} className="border-r border-slate-400 p-1">Responsibilities</th>
              <th rowSpan={2} className="p-1 w-[85px]">Record Form</th>
            </tr>
            <tr className="bg-slate-100 text-center font-bold border-b border-slate-700 text-[8px]">
              <th className="border-r border-slate-400 p-0.5 w-[75px]">Document Ref</th>
              <th className="border-r border-slate-400 p-0.5 w-[110px]">Criteria Statement</th>
              <th className="border-r border-slate-400 p-0.5 w-[24px]">GC</th>
              <th className="border-r border-slate-400 p-0.5 w-[28px]">RE/RA</th>
              <th className="border-r border-slate-400 p-0.5 w-[24px]">PMC</th>
              <th className="border-r border-slate-400 p-0.5 w-[24px]">ITA</th>
            </tr>
          </thead>
          <tbody>
            {/* Stage 1.0 */}
            <tr className="bg-blue-50 font-bold border-b border-slate-400">
              <td className="p-1 text-center border-r border-slate-400">1.0</td>
              <td colSpan={10} className="p-1 text-blue-950 uppercase tracking-wide">Stage 1.0: Submission of Documents</td>
            </tr>
            <tr className="border-b border-slate-300">
              <td className="p-1 text-center border-r border-slate-300">1.1</td>
              <td className="p-1 border-r border-slate-300">Method Statement / Procedure Submission</td>
              <td className="p-1 border-r border-slate-300">Project Spec Cl. 3.2</td>
              <td className="p-1 border-r border-slate-300">Prior to site mobilization & works</td>
              <td className="p-1 border-r border-slate-300">Prior to works</td>
              <td className="p-1 border-r border-slate-300 text-center">Doc Review</td>
              <td className="p-1 text-center font-bold border-r border-slate-300 bg-slate-50">S</td>
              <td className="p-1 text-center font-bold border-r border-slate-300 bg-slate-50">R/A</td>
              <td className="p-1 text-center font-bold border-r border-slate-300 bg-slate-50">R</td>
              <td className="p-1 text-center font-bold border-r border-slate-300 bg-slate-50">-</td>
              <td className="p-1 border-slate-300 text-[7.5px]">MOS Reg</td>
            </tr>
            <tr className="border-b border-slate-300">
              <td className="p-1 text-center border-r border-slate-300">1.2</td>
              <td className="p-1 border-r border-slate-300">ITP, Checklist and Test Form Submission</td>
              <td className="p-1 border-r border-slate-300">QA/QC Plan & Spec</td>
              <td className="p-1 border-r border-slate-300">Conforming to BTP QAQC standard format</td>
              <td className="p-1 border-r border-slate-300">Prior to works</td>
              <td className="p-1 border-r border-slate-300 text-center">Doc Review</td>
              <td className="p-1 text-center font-bold border-r border-slate-300 bg-slate-50">S</td>
              <td className="p-1 text-center font-bold border-r border-slate-300 bg-slate-50">R/A</td>
              <td className="p-1 text-center font-bold border-r border-slate-300 bg-slate-50">R</td>
              <td className="p-1 text-center font-bold border-r border-slate-300 bg-slate-50">-</td>
              <td className="p-1 border-slate-300 text-[7.5px]">ITP Template</td>
            </tr>
            <tr className="border-b border-slate-400">
              <td className="p-1 text-center border-r border-slate-300">1.3</td>
              <td className="p-1 border-r border-slate-300">Material Submittals & Mill Certificates</td>
              <td className="p-1 border-r border-slate-300">Approved Spec / BS/MS</td>
              <td className="p-1 border-r border-slate-300">Valid test reports, compliance certs</td>
              <td className="p-1 border-r border-slate-300">Before delivery</td>
              <td className="p-1 border-r border-slate-300 text-center">Doc Review</td>
              <td className="p-1 text-center font-bold border-r border-slate-300 bg-slate-50">S</td>
              <td className="p-1 text-center font-bold border-r border-slate-300 bg-slate-50">A</td>
              <td className="p-1 text-center font-bold border-r border-slate-300 bg-slate-50">R</td>
              <td className="p-1 text-center font-bold border-r border-slate-300 bg-slate-50">-</td>
              <td className="p-1 border-slate-300 text-[7.5px]">MAF-001</td>
            </tr>

            {/* Stage 2.0 */}
            <tr className="bg-blue-50 font-bold border-b border-slate-400">
              <td className="p-1 text-center border-r border-slate-400">2.0</td>
              <td colSpan={10} className="p-1 text-blue-950 uppercase tracking-wide">Stage 2.0: Material Inspection</td>
            </tr>
            <tr className="border-b border-slate-300">
              <td className="p-1 text-center border-r border-slate-300">2.1</td>
              <td className="p-1 border-r border-slate-300">Incoming Delivery Verification (Rebar / Cement)</td>
              <td className="p-1 border-r border-slate-300">Approved MAF & DO</td>
              <td className="p-1 border-r border-slate-300">No damage, correct batch, valid DO</td>
              <td className="p-1 border-r border-slate-300">Each delivery</td>
              <td className="p-1 border-r border-slate-300 text-center">Visual / Verify</td>
              <td className="p-1 text-center font-bold border-r border-slate-300 bg-slate-50">I</td>
              <td className="p-1 text-center font-bold border-r border-slate-300 bg-slate-50">W</td>
              <td className="p-1 text-center font-bold border-r border-slate-300 bg-slate-50">S</td>
              <td className="p-1 text-center font-bold border-r border-slate-300 bg-slate-50">-</td>
              <td className="p-1 border-slate-300 text-[7.5px]">RFWI Material</td>
            </tr>
            <tr className="border-b border-slate-400">
              <td className="p-1 text-center border-r border-slate-300">2.2</td>
              <td className="p-1 border-r border-slate-300">Material Storage, Sheltering & Protection</td>
              <td className="p-1 border-r border-slate-300">Manufacturer Guide</td>
              <td className="p-1 border-r border-slate-300">Adequate dunnage, tarp, dry storage</td>
              <td className="p-1 border-r border-slate-300">Weekly audit</td>
              <td className="p-1 border-r border-slate-300 text-center">Visual Audit</td>
              <td className="p-1 text-center font-bold border-r border-slate-300 bg-slate-50">I</td>
              <td className="p-1 text-center font-bold border-r border-slate-300 bg-slate-50">S</td>
              <td className="p-1 text-center font-bold border-r border-slate-300 bg-slate-50">S</td>
              <td className="p-1 text-center font-bold border-r border-slate-300 bg-slate-50">-</td>
              <td className="p-1 border-slate-300 text-[7.5px]">Storage Log</td>
            </tr>

            {/* Stage 3.0 */}
            <tr className="bg-blue-50 font-bold border-b border-slate-400">
              <td className="p-1 text-center border-r border-slate-400">3.0</td>
              <td colSpan={10} className="p-1 text-blue-950 uppercase tracking-wide">Stage 3.0: In-Process Work Inspection</td>
            </tr>
            <tr className="border-b border-slate-300">
              <td className="p-1 text-center border-r border-slate-300">3.1</td>
              <td className="p-1 border-r border-slate-300">Setting Out & Survey Coordinate Verification</td>
              <td className="p-1 border-r border-slate-300">Approved Drawings</td>
              <td className="p-1 border-r border-slate-300">Pile coordinates within ±25mm tolerance</td>
              <td className="p-1 border-r border-slate-300">Each pile grid</td>
              <td className="p-1 border-r border-slate-300 text-center">Total Station</td>
              <td className="p-1 text-center font-bold border-r border-slate-300 bg-slate-50">H</td>
              <td className="p-1 text-center font-bold border-r border-slate-300 bg-slate-50">H</td>
              <td className="p-1 text-center font-bold border-r border-slate-300 bg-slate-50">W</td>
              <td className="p-1 text-center font-bold border-r border-slate-300 bg-slate-50">-</td>
              <td className="p-1 border-slate-300 text-[7.5px]">Survey Sheet</td>
            </tr>
            <tr className="border-b border-slate-300">
              <td className="p-1 text-center border-r border-slate-300">3.2</td>
              <td className="p-1 border-r border-slate-300">Pre-Pour Reinforcement & Formwork Inspection</td>
              <td className="p-1 border-r border-slate-300">Structural Dwg</td>
              <td className="p-1 border-r border-slate-300">Bar spacing, cover, cleanliness, tie wire</td>
              <td className="p-1 border-r border-slate-300">Before casting</td>
              <td className="p-1 border-r border-slate-300 text-center">Visual/Measure</td>
              <td className="p-1 text-center font-bold border-r border-slate-300 bg-slate-50">H</td>
              <td className="p-1 text-center font-bold border-r border-slate-300 bg-slate-50">H</td>
              <td className="p-1 text-center font-bold border-r border-slate-300 bg-slate-50">W</td>
              <td className="p-1 text-center font-bold border-r border-slate-300 bg-slate-50">-</td>
              <td className="p-1 border-slate-300 text-[7.5px]">CHK-001 Sec C</td>
            </tr>
            <tr className="border-b border-slate-400">
              <td className="p-1 text-center border-r border-slate-300">3.3</td>
              <td className="p-1 border-r border-slate-300">Concrete Pour Witness & Slump / Cube Sampling</td>
              <td className="p-1 border-r border-slate-300">MS 523 / BS 8500</td>
              <td className="p-1 border-r border-slate-300">Slump 175±25mm, 1 set cube / 50m³</td>
              <td className="p-1 border-r border-slate-300">During pour</td>
              <td className="p-1 border-r border-slate-300 text-center">Slump Test</td>
              <td className="p-1 text-center font-bold border-r border-slate-300 bg-slate-50">H</td>
              <td className="p-1 text-center font-bold border-r border-slate-300 bg-slate-50">H</td>
              <td className="p-1 text-center font-bold border-r border-slate-300 bg-slate-50">W</td>
              <td className="p-1 text-center font-bold border-r border-slate-300 bg-slate-50">T</td>
              <td className="p-1 border-slate-300 text-[7.5px]">Pour Record</td>
            </tr>

            {/* Stage 4.0 */}
            <tr className="bg-blue-50 font-bold border-b border-slate-400">
              <td className="p-1 text-center border-r border-slate-400">4.0</td>
              <td colSpan={10} className="p-1 text-blue-950 uppercase tracking-wide">Stage 4.0: System Walkdown & Testing</td>
            </tr>
            <tr className="border-b border-slate-300">
              <td className="p-1 text-center border-r border-slate-300">4.1</td>
              <td className="p-1 border-r border-slate-300">Pile Integrity Testing (Low Strain PIT)</td>
              <td className="p-1 border-r border-slate-300">ASTM D5882</td>
              <td className="p-1 border-r border-slate-300">100% piles tested, no toe defects or necking</td>
              <td className="p-1 border-r border-slate-300">Post 7d cure</td>
              <td className="p-1 border-r border-slate-300 text-center">Sonic Echo</td>
              <td className="p-1 text-center font-bold border-r border-slate-300 bg-slate-50">I</td>
              <td className="p-1 text-center font-bold border-r border-slate-300 bg-slate-50">W</td>
              <td className="p-1 text-center font-bold border-r border-slate-300 bg-slate-50">W</td>
              <td className="p-1 text-center font-bold border-r border-slate-300 bg-slate-50">T/A</td>
              <td className="p-1 border-slate-300 text-[7.5px]">PIT Report</td>
            </tr>
            <tr className="border-b border-slate-400">
              <td className="p-1 text-center border-r border-slate-300">4.2</td>
              <td className="p-1 border-r border-slate-300">High Strain Dynamic Load Testing (PDA)</td>
              <td className="p-1 border-r border-slate-300">ASTM D4945</td>
              <td className="p-1 border-r border-slate-300">Selected working piles, capacity ≥ 2.0x SWL</td>
              <td className="p-1 border-r border-slate-300">As scheduled</td>
              <td className="p-1 border-r border-slate-300 text-center">CAPWAP Anal</td>
              <td className="p-1 text-center font-bold border-r border-slate-300 bg-slate-50">H</td>
              <td className="p-1 text-center font-bold border-r border-slate-300 bg-slate-50">H</td>
              <td className="p-1 text-center font-bold border-r border-slate-300 bg-slate-50">W</td>
              <td className="p-1 text-center font-bold border-r border-slate-300 bg-slate-50">T/A</td>
              <td className="p-1 border-slate-300 text-[7.5px]">PDA Report</td>
            </tr>

            {/* Stage 5.0 */}
            <tr className="bg-blue-50 font-bold border-b border-slate-400">
              <td className="p-1 text-center border-r border-slate-400">5.0</td>
              <td colSpan={10} className="p-1 text-blue-950 uppercase tracking-wide">Stage 5.0: Final Acceptance & Handover</td>
            </tr>
            <tr className="border-b border-slate-300">
              <td className="p-1 text-center border-r border-slate-300">5.1</td>
              <td className="p-1 border-r border-slate-300">Pile Head Cut-off & Rebar Projection Check</td>
              <td className="p-1 border-r border-slate-300">Design Cut Level</td>
              <td className="p-1 border-r border-slate-300">Sound concrete at COL, rebar bond length ok</td>
              <td className="p-1 border-r border-slate-300">Post cutting</td>
              <td className="p-1 border-r border-slate-300 text-center">Visual/Measure</td>
              <td className="p-1 text-center font-bold border-r border-slate-300 bg-slate-50">I</td>
              <td className="p-1 text-center font-bold border-r border-slate-300 bg-slate-50">H</td>
              <td className="p-1 text-center font-bold border-r border-slate-300 bg-slate-50">W</td>
              <td className="p-1 text-center font-bold border-r border-slate-300 bg-slate-50">-</td>
              <td className="p-1 border-slate-300 text-[7.5px]">COL Checksheet</td>
            </tr>
            <tr>
              <td className="p-1 text-center border-r border-slate-300">5.2</td>
              <td className="p-1 border-r border-slate-300">Final Handover Dossier & As-Built Verification</td>
              <td className="p-1 border-r border-slate-300">BTP QAQC Standard</td>
              <td className="p-1 border-r border-slate-300">All cubes passed, PIT/PDA closed, no open NCR</td>
              <td className="p-1 border-r border-slate-300">Stage closeout</td>
              <td className="p-1 border-r border-slate-300 text-center">Record Audit</td>
              <td className="p-1 text-center font-bold border-r border-slate-300 bg-slate-50">S</td>
              <td className="p-1 text-center font-bold border-r border-slate-300 bg-slate-50">A</td>
              <td className="p-1 text-center font-bold border-r border-slate-300 bg-slate-50">A</td>
              <td className="p-1 text-center font-bold border-r border-slate-300 bg-slate-50">-</td>
              <td className="p-1 border-slate-300 text-[7.5px]">Dossier Cert</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Legend & Codes */}
      <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-50 border border-slate-300 rounded mb-3 text-[8px]">
        <div>
          <span className="font-bold text-slate-800">Responsibility Legend: </span>
          <span className="font-semibold text-blue-900">S</span> = Prepare / Submit |{' '}
          <span className="font-semibold text-blue-900">R</span> = Review |{' '}
          <span className="font-semibold text-rose-700">H</span> = Hold Point (Do not proceed without witness) |{' '}
          <span className="font-semibold text-emerald-700">W</span> = Witness Point |{' '}
          <span className="font-semibold text-slate-700">S</span> = Surveillance |{' '}
          <span className="font-semibold text-blue-900">A</span> = Approve / Accept |{' '}
          <span className="font-semibold text-purple-900">T</span> = Testing
        </div>
        <div>
          <span className="font-bold text-slate-800">Stakeholder Roles: </span>
          <span><b>GC:</b> General Contractor | <b>RE/RA:</b> Resident Engineer / Resident Architect (Consultant) | <b>PMC:</b> Project Management Consultant (Turner) | <b>ITA:</b> Independent Testing Agency</span>
        </div>
      </div>

      {/* Review Status & Endorsement */}
      <table className="w-full border-collapse border border-slate-700 text-[8.5px]">
        <thead>
          <tr className="bg-slate-200 font-bold border-b border-slate-700">
            <th className="p-1 border-r border-slate-400 w-1/3 text-left">GENERAL CONTRACTOR (GC) SUBMISSION</th>
            <th className="p-1 border-r border-slate-400 w-1/3 text-left">CONSULTANT (RE / RA) REVIEW</th>
            <th className="p-1 w-1/3 text-left">PMC (TURNER) ACKNOWLEDGEMENT</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="p-2 border-r border-slate-400 align-top">
              <div className="text-[8px] text-slate-500 mb-1">Prepared by Quality Lead:</div>
              <div className="h-7 border-b border-dashed border-slate-300 mb-1 flex items-end italic text-blue-900 text-xs">Irfan Hazim</div>
              <div className="font-bold">Name: Irfan Hazim</div>
              <div>Designation: QA/QC Manager</div>
              <div>Date: 14.07.2026</div>
            </td>
            <td className="p-2 border-r border-slate-400 align-top">
              <div className="text-[8px] text-slate-500 mb-1">Status: [ <span className="font-bold text-emerald-700">A - Approved</span> ]</div>
              <div className="h-7 border-b border-dashed border-slate-300 mb-1 flex items-end italic text-slate-900 text-xs">Ir. Dr. K. Nathan</div>
              <div className="font-bold">Name: Ir. Dr. K. Nathan, PE</div>
              <div>Designation: Lead Civil & Structural RE</div>
              <div>Date: 16.07.2026</div>
            </td>
            <td className="p-2 align-top">
              <div className="text-[8px] text-slate-500 mb-1">Status: [ <span className="font-bold text-emerald-700">Acknowledged</span> ]</div>
              <div className="h-7 border-b border-dashed border-slate-300 mb-1 flex items-end italic text-slate-900 text-xs">Marcus Tan</div>
              <div className="font-bold">Name: Marcus Tan</div>
              <div>Designation: Senior QA/QC Manager (PMC)</div>
              <div>Date: 17.07.2026</div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
