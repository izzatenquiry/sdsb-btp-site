import React from "react";
import { OfficialFormHeader } from "./OfficialFormHeader";

export function NcrSheet({
  formData,
}: {
  formData: any;
  setFormData?: (val: any) => void;
}) {
  return (
    <div className="space-y-3 font-sans leading-tight">
      <OfficialFormHeader
        title="NON-CONFORMANCE REPORT (NCR) FORM"
        projectName={formData.projectName || "SDSB · BANTING TECHNOLOGY PARK (BTP)"}
        docNo="BTP-QAQC-FRM-NCR-001"
        revision="Rev 02"
        date="14.07.2026"
      />

      {/* Section A: NCR Details */}
      <div>
        <div className="bg-slate-200 border-2 border-black px-2 py-1 font-bold text-[11px] uppercase tracking-wide">
          A. NCR DETAILS
        </div>
        <table className="w-full border-2 border-t-0 border-black text-xs border-collapse">
          <tbody>
            <tr className="border-b border-black">
              <td className="w-1/4 bg-slate-50 p-1.5 font-bold border-r border-black">NCR No.:</td>
              <td className="w-1/4 p-1.5 border-r border-black font-semibold text-rose-900">{formData.refNo}</td>
              <td className="w-1/4 bg-slate-50 p-1.5 font-bold border-r border-black">Date Raised:</td>
              <td className="w-1/4 p-1.5">{formData.dateSubmitted}</td>
            </tr>
            <tr className="border-b border-black">
              <td className="bg-slate-50 p-1.5 font-bold border-r border-black">ACC Ref.:</td>
              <td className="p-1.5 border-r border-black font-semibold">{formData.accRef}</td>
              <td className="bg-slate-50 p-1.5 font-bold border-r border-black">Response Due Date:</td>
              <td className="p-1.5 font-semibold text-rose-700">{formData.targetDate}</td>
            </tr>
            <tr className="border-b border-black">
              <td className="bg-slate-50 p-1.5 font-bold border-r border-black">Package / Area:</td>
              <td className="p-1.5 border-r border-black">{formData.workPackage}</td>
              <td className="bg-slate-50 p-1.5 font-bold border-r border-black">Discipline / Trade:</td>
              <td className="p-1.5 font-semibold">{formData.discipline}</td>
            </tr>
            <tr className="border-b border-black">
              <td className="bg-slate-50 p-1.5 font-bold border-r border-black">Location / Level / Grid:</td>
              <td className="p-1.5 border-r border-black">{formData.location}</td>
              <td className="bg-slate-50 p-1.5 font-bold border-r border-black">Raised by / Company:</td>
              <td className="p-1.5">Supervising Consultant / PMC</td>
            </tr>
            <tr className="border-b border-black">
              <td className="bg-slate-50 p-1.5 font-bold border-r border-black">Related RFWI / ITP Ref.:</td>
              <td className="p-1.5 border-r border-black">{formData.relatedRef || "BTP-A/SDSB/MBW/C&S/RFWI/288"}</td>
              <td className="bg-slate-50 p-1.5 font-bold border-r border-black">Related MS / DWG Ref.:</td>
              <td className="p-1.5">{formData.dwgRef || "BTP-STR-DWG-1001 / MOS-STR-001"}</td>
            </tr>
            <tr>
              <td className="bg-slate-50 p-1.5 font-bold border-r border-black">Category & Priority:</td>
              <td className="p-1.5" colSpan={3}>
                <div className="flex flex-wrap items-center justify-between gap-2 text-[10.5px]">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-700">Category:</span>
                    <label className="flex items-center gap-1 font-semibold"><input type="checkbox" defaultChecked /> Workmanship</label>
                    <label className="flex items-center gap-1 font-semibold"><input type="checkbox" /> Material</label>
                    <label className="flex items-center gap-1 font-semibold"><input type="checkbox" /> Design/DWG</label>
                    <label className="flex items-center gap-1 font-semibold"><input type="checkbox" /> Testing</label>
                  </div>
                  <div className="flex items-center gap-2 border-l border-slate-300 pl-3">
                    <span className="font-bold text-slate-700">Priority:</span>
                    <label className="flex items-center gap-1 text-slate-700"><input type="checkbox" /> Low</label>
                    <label className="flex items-center gap-1 font-bold text-amber-700"><input type="checkbox" defaultChecked /> Medium</label>
                    <label className="flex items-center gap-1 font-bold text-rose-700"><input type="checkbox" /> High / Stop Work</label>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Section B: Non-Conformance & Requirement */}
      <div>
        <div className="bg-slate-200 border-2 border-black px-2 py-1 font-bold text-[11px] uppercase tracking-wide">
          B. NON-CONFORMANCE AND REQUIREMENT
        </div>
        <div className="border-2 border-t-0 border-black p-2 text-xs space-y-2">
          <div>
            <div className="font-bold text-[10.5px] text-slate-700">Description of Non-Conformance (Condition, extent, location & evidence):</div>
            <div className="bg-slate-50 p-2 border border-slate-300 rounded font-semibold text-rose-950">
              {formData.ncrDesc || "Honeycombing observed at shear wall SW-02 lower section after formwork striking."}
            </div>
          </div>
          <div>
            <div className="font-bold text-[10.5px] text-slate-700">Requirement / Reference (Specification, approved drawing, ITP, MS criterion):</div>
            <div className="bg-slate-50 p-2 border border-slate-300 rounded text-slate-800">
              {formData.ncrRequirement || "Project Specification Clause 4.2 - Concrete surface shall be free from honeycombing, voiding and cold joints."}
            </div>
          </div>
        </div>
      </div>

      {/* Section C: Immediate Correction / Containment */}
      <div>
        <div className="bg-slate-200 border-2 border-black px-2 py-1 font-bold text-[11px] uppercase tracking-wide">
          C. IMMEDIATE CORRECTION / CONTAINMENT
        </div>
        <div className="border-2 border-t-0 border-black p-2 text-xs">
          <div className="font-bold text-[10.5px] text-slate-700 mb-1">Action Taken (Stop-work, isolation, segregation, protection & notification):</div>
          <div className="bg-slate-50 p-2 border border-slate-300 rounded">
            {formData.ncrAction || "Area cordoned off immediately. Concrete placing halted in adjacent bay. Investigation conducted with R.E. and structural repair proposal drafted."}
          </div>
        </div>
      </div>

      {/* Section D: Root Cause and Corrective Action */}
      <div>
        <div className="bg-slate-200 border-2 border-black px-2 py-1 font-bold text-[11px] uppercase tracking-wide">
          D. ROOT CAUSE AND CORRECTIVE ACTION
        </div>
        <div className="border-2 border-t-0 border-black p-2 text-xs grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div>
            <div className="font-bold text-[10.5px] text-slate-700 mb-1">Root Cause (Direct and underlying cause):</div>
            <div className="bg-slate-50 p-2 border border-slate-300 rounded">
              {formData.ncrRootCause || "Insufficient poker vibrator penetration due to congested rebar junction and lack of formwork inspection window."}
            </div>
          </div>
          <div>
            <div className="font-bold text-[10.5px] text-slate-700 mb-1">Corrective / Preventive Action (Permanent mitigation):</div>
            <div className="bg-slate-50 p-2 border border-slate-300 rounded">
              {formData.ncrCorrective || "Provide dedicated high-frequency small-head vibrators, establish inspection windows for deep pours, and conduct operator refresher training."}
            </div>
          </div>
        </div>
      </div>

      {/* Section E: Responsibility, Completion and Evidence */}
      <div>
        <div className="bg-slate-200 border-2 border-black px-2 py-1 font-bold text-[11px] uppercase tracking-wide">
          E. RESPONSIBILITY, COMPLETION AND EVIDENCE
        </div>
        <table className="w-full border-2 border-t-0 border-black text-xs border-collapse">
          <tbody>
            <tr className="border-b border-black">
              <td className="w-1/4 bg-slate-50 p-1.5 font-bold border-r border-black">Target Date:</td>
              <td className="w-1/4 p-1.5 border-r border-black font-semibold text-rose-800">{formData.targetDate}</td>
              <td className="w-1/4 bg-slate-50 p-1.5 font-bold border-r border-black">Date Completed:</td>
              <td className="w-1/4 p-1.5 font-semibold text-emerald-800">{formData.targetDate}</td>
            </tr>
            <tr>
              <td className="bg-slate-50 p-1.5 font-bold border-r border-black">Disposition:</td>
              <td className="p-1.5" colSpan={3}>
                <div className="flex flex-wrap gap-4 text-[10.5px] font-semibold">
                  <label className="flex items-center gap-1"><input type="checkbox" defaultChecked /> Rework</label>
                  <label className="flex items-center gap-1"><input type="checkbox" /> Repair</label>
                  <label className="flex items-center gap-1"><input type="checkbox" /> Replace / Reject</label>
                  <label className="flex items-center gap-1"><input type="checkbox" /> Use-As-Is / Concession</label>
                  <label className="flex items-center gap-1"><input type="checkbox" /> Other</label>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Section F: GC Response Confirmation */}
      <div>
        <div className="bg-slate-200 border-2 border-black px-2 py-1 font-bold text-[11px] uppercase tracking-wide">
          F. GC RESPONSE CONFIRMATION
        </div>
        <table className="w-full border-2 border-t-0 border-black text-xs border-collapse">
          <tbody>
            <tr>
              <td className="w-1/2 border-r-2 border-black p-2 align-top">
                <div className="font-bold text-[10.5px] uppercase text-slate-600 border-b border-black pb-1 mb-1">
                  Prepared by – GC QA/QC Engineer
                </div>
                <div className="text-xs space-y-0.5">
                  <div>Name: DAMIA</div>
                  <div>Position: Document Controller / Site Engineer</div>
                  <div>Signature & Date: Signed · {formData.dateSubmitted}</div>
                </div>
              </td>
              <td className="w-1/2 p-2 align-top">
                <div className="font-bold text-[10.5px] uppercase text-slate-600 border-b border-black pb-1 mb-1">
                  Approved by – GC Project Manager
                </div>
                <div className="text-xs space-y-0.5">
                  <div>Name: Mr. Tan Wei Lun</div>
                  <div>Position: Project Manager</div>
                  <div>Signature & Date: Approved · {formData.dateSubmitted}</div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Section G: Verification and Closure */}
      <div>
        <div className="bg-slate-200 border-2 border-black px-2 py-1 font-bold text-[11px] uppercase tracking-wide">
          G. VERIFICATION AND FORMAL CLOSURE
        </div>
        <table className="w-full border-2 border-t-0 border-black text-xs border-collapse">
          <tbody>
            <tr className="border-b border-black">
              <td className="p-2" colSpan={4}>
                <div className="flex items-center gap-4 font-bold text-[11px]">
                  <span className="text-slate-700">Verification Result:</span>
                  <label className="flex items-center gap-1.5 text-emerald-800">
                    <input type="checkbox" defaultChecked /> Effective / Closed
                  </label>
                  <label className="flex items-center gap-1.5 text-amber-700">
                    <input type="checkbox" /> Partially Effective
                  </label>
                  <label className="flex items-center gap-1.5 text-rose-700">
                    <input type="checkbox" /> Not Effective – Further Action Required
                  </label>
                  <label className="flex items-center gap-1.5 text-slate-600">
                    <input type="checkbox" /> Re-Inspection Required
                  </label>
                </div>
              </td>
            </tr>
            <tr className="border-b border-black">
              <td className="p-2" colSpan={4}>
                <div className="font-bold text-[10.5px] text-slate-700 mb-0.5">Verification Comments / Closure Evidence:</div>
                <div className="text-xs italic bg-slate-50 p-1.5 border border-slate-300 rounded">
                  Repairs verified per approved method statement. Non-destructive hammer test and visual inspection confirmed sound concrete. Closed satisfactorily.
                </div>
              </td>
            </tr>
            <tr>
              <td className="w-1/2 border-r-2 border-black p-2 align-top" colSpan={2}>
                <div className="font-bold text-[10.5px] uppercase text-slate-600 border-b border-black pb-1 mb-1">
                  Consultant (RE / RA) Verified & Recommended for Closure
                </div>
                <div className="text-xs space-y-0.5">
                  <div>Name: Ir. Ahmad Faris</div>
                  <div>Signature & Date: Verified · {formData.targetDate}</div>
                </div>
              </td>
              <td className="w-1/2 p-2 align-top" colSpan={2}>
                <div className="font-bold text-[10.5px] uppercase text-slate-600 border-b border-black pb-1 mb-1">
                  PMC Reviewed, Acknowledged & Approved for Closure
                </div>
                <div className="text-xs space-y-0.5">
                  <div>Name: Ir. Ts. Mohd Khairul</div>
                  <div>Signature & Date: Closed in ACC · {formData.targetDate}</div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="p-1.5 bg-slate-100 border border-black text-[9.5px] text-slate-700 text-center font-medium">
        <strong>Note:</strong> The NCR remains open until corrective action is implemented, verified and formally closed by the authorised reviewers in Autodesk Construction Cloud (ACC).
      </div>
    </div>
  );
}
