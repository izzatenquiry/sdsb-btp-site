import React from "react";
import { OfficialFormHeader } from "./OfficialFormHeader";

export function MafSheet({
  formData,
}: {
  formData: any;
  setFormData?: (val: any) => void;
}) {
  return (
    <div className="space-y-3 font-sans leading-tight">
      <OfficialFormHeader
        title="MATERIAL APPROVAL FORM (MAF)"
        projectName={formData.projectName || "SDSB · BANTING TECHNOLOGY PARK (BTP)"}
        docNo="BTP-QAQC-FRM-MAF-001"
        revision="Rev 02"
        date="14.07.2026"
      />

      {/* Section A: Material Submission Details */}
      <div>
        <div className="bg-slate-200 border-2 border-black px-2 py-1 font-bold text-[11px] uppercase tracking-wide">
          A. MATERIAL SUBMISSION DETAILS
        </div>
        <table className="w-full border-2 border-t-0 border-black text-xs border-collapse">
          <tbody>
            <tr className="border-b border-black">
              <td className="w-1/4 bg-slate-50 p-1.5 font-bold border-r border-black">MAF No.:</td>
              <td className="w-1/4 p-1.5 border-r border-black font-semibold text-blue-950">{formData.refNo}</td>
              <td className="w-1/4 bg-slate-50 p-1.5 font-bold border-r border-black">Revision:</td>
              <td className="w-1/4 p-1.5">{formData.revision}</td>
            </tr>
            <tr className="border-b border-black">
              <td className="bg-slate-50 p-1.5 font-bold border-r border-black">ACC Ref.:</td>
              <td className="p-1.5 border-r border-black font-semibold text-blue-950">{formData.accRef}</td>
              <td className="bg-slate-50 p-1.5 font-bold border-r border-black">Date Submitted:</td>
              <td className="p-1.5">{formData.dateSubmitted}</td>
            </tr>
            <tr className="border-b border-black">
              <td className="bg-slate-50 p-1.5 font-bold border-r border-black">Work Package:</td>
              <td className="p-1.5 border-r border-black">{formData.workPackage}</td>
              <td className="bg-slate-50 p-1.5 font-bold border-r border-black">Discipline:</td>
              <td className="p-1.5 font-semibold">{formData.discipline}</td>
            </tr>
            <tr className="border-b border-black">
              <td className="bg-slate-50 p-1.5 font-bold border-r border-black">Material Description:</td>
              <td className="p-1.5 border-r border-black font-bold text-slate-900" colSpan={3}>
                {formData.materialDesc || formData.activity}
              </td>
            </tr>
            <tr className="border-b border-black">
              <td className="bg-slate-50 p-1.5 font-bold border-r border-black">Manufacturer / Brand:</td>
              <td className="p-1.5 border-r border-black">{formData.manufacturer || "Lafarge Banting Batching Plant"}</td>
              <td className="bg-slate-50 p-1.5 font-bold border-r border-black">Proposed Supplier:</td>
              <td className="p-1.5">{formData.supplier || "Lafarge Concrete Malaysia Sdn Bhd"}</td>
            </tr>
            <tr>
              <td className="bg-slate-50 p-1.5 font-bold border-r border-black">Country of Origin:</td>
              <td className="p-1.5 border-r border-black">{formData.origin || "Malaysia"}</td>
              <td className="bg-slate-50 p-1.5 font-bold border-r border-black">Specification / Drawing Ref.:</td>
              <td className="p-1.5">{formData.specRef || "Section 03300 - Cast-in-place Concrete"}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Section B: Submission / Revision Criteria */}
      <div>
        <div className="bg-slate-200 border-2 border-black px-2 py-1 font-bold text-[11px] uppercase tracking-wide">
          B. SUBMISSION / REVISION CRITERIA
        </div>
        <div className="border-2 border-t-0 border-black p-2 text-xs">
          <div className="font-bold text-[10.5px] text-slate-700 mb-1.5">Submission Criteria / Purpose:</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
            <label className="flex items-center gap-1.5 font-semibold">
              <input type="checkbox" defaultChecked /> 1. New Material Submittal
            </label>
            <label className="flex items-center gap-1.5 font-semibold">
              <input type="checkbox" /> 2. Resubmission / Revision following Comments
            </label>
            <label className="flex items-center gap-1.5 font-semibold">
              <input type="checkbox" /> 3. Proposed Alternative / Value Engineering / Deviation
            </label>
            <label className="flex items-center gap-1.5 font-semibold">
              <input type="checkbox" /> 4. Information / For Record Only
            </label>
          </div>
        </div>
      </div>

      {/* Section C: Attachment Checklist */}
      <div>
        <div className="bg-slate-200 border-2 border-black px-2 py-1 font-bold text-[11px] uppercase tracking-wide">
          C. ATTACHMENT CHECKLIST
        </div>
        <table className="w-full border-2 border-t-0 border-black text-[10.5px] border-collapse">
          <thead>
            <tr className="bg-slate-100 border-b border-black text-center font-bold">
              <th className="w-8 border-r border-black p-1">No.</th>
              <th className="border-r border-black p-1 text-left">Required Attachment / Evidence</th>
              <th className="w-24 border-r border-black p-1">Submitted [Y/N]</th>
              <th className="border-r border-black p-1 text-left">Reference / Filename</th>
              <th className="w-24 p-1">Remarks</th>
            </tr>
          </thead>
          <tbody>
            {[
              "Technical Data Sheet / Product Catalogue",
              "Compliance Statement against Project Specification",
              "Approved / Relevant Drawings and Installation Details",
              "Test Reports / Type Test Certificates / SIRIM / Authority Approval",
              "Manufacturer Certificates / ISO 9001 / Factory Audit",
              "Country of Origin / Manufacturer & Supplier Authorization",
              "Warranty / Spare Parts / Maintenance Requirements",
              "Physical Sample / Material Board / Mock-up Photos / SDS",
            ].map((item, idx) => (
              <tr key={idx} className="border-b border-black h-6">
                <td className="border-r border-black p-1 text-center font-bold text-slate-700">{idx + 1}</td>
                <td className="border-r border-black p-1">{item}</td>
                <td className="border-r border-black p-1 text-center text-slate-400">[ &nbsp; ]</td>
                <td className="border-r border-black p-1 text-slate-400">&nbsp;</td>
                <td className="p-1 text-center text-slate-400">&nbsp;</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Section D: Material Approval Package Preparation */}
      <div>
        <div className="bg-slate-200 border-2 border-black px-2 py-1 font-bold text-[11px] uppercase tracking-wide">
          D. MATERIAL APPROVAL PACKAGE PREPARATION (GENERAL CONTRACTOR - GC)
        </div>
        <table className="w-full border-2 border-t-0 border-black text-xs border-collapse">
          <tbody>
            <tr>
              <td className="w-1/2 border-r-2 border-black p-2 align-top">
                <div className="font-bold text-[10.5px] uppercase text-slate-600 border-b border-black pb-1 mb-1.5">
                  Prepared by (GC QA/QC / Procurement Lead)
                </div>
                <div className="text-xs space-y-1">
                  <div><strong>Name:</strong> {formData.requestedBy || "DAMIA"}</div>
                  <div><strong>Position:</strong> Document Controller & Materials Coordinator</div>
                  <div><strong>Company:</strong> SDSB (General Contractor)</div>
                  <div><strong>Signature & Date:</strong> {formData.dateSubmitted ? `${formData.dateSubmitted} · ____________________` : "____________________"}</div>
                </div>
              </td>
              <td className="w-1/2 p-2 align-top">
                <div className="font-bold text-[10.5px] uppercase text-slate-600 border-b border-black pb-1 mb-1.5">
                  Reviewed by (GC Project QA/QC Manager)
                </div>
                <div className="text-xs space-y-1">
                  <div><strong>Name:</strong> ___________________________________</div>
                  <div><strong>Position:</strong> Project QA/QC Manager</div>
                  <div><strong>Company:</strong> SDSB (General Contractor)</div>
                  <div><strong>Signature & Date:</strong> ____________________________</div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Section E: Review Status */}
      <div>
        <div className="bg-slate-200 border-2 border-black px-2 py-1 font-bold text-[11px] uppercase tracking-wide">
          E. REVIEW STATUS AND CONSULTANT / PMC APPROVAL (FOR CONSULTANT & PMC USE ONLY)
        </div>
        <table className="w-full border-2 border-t-0 border-black text-xs border-collapse">
          <tbody>
            <tr className="border-b border-black">
              <td className="p-2" colSpan={4}>
                <div className="flex flex-wrap items-center justify-between gap-2 font-bold text-[11px]">
                  <span className="text-slate-700">Approval Status:</span>
                  <label className="flex items-center gap-1.5 text-slate-800">
                    <input type="checkbox" /> Approved (Code A)
                  </label>
                  <label className="flex items-center gap-1.5 text-slate-800">
                    <input type="checkbox" /> Approved with Comments (Code B)
                  </label>
                  <label className="flex items-center gap-1.5 text-slate-800">
                    <input type="checkbox" /> Revise and Resubmit (Code C)
                  </label>
                  <label className="flex items-center gap-1.5 text-slate-800">
                    <input type="checkbox" /> Rejected (Code D)
                  </label>
                  <label className="flex items-center gap-1.5 text-slate-800">
                    <input type="checkbox" /> For Record / Information
                  </label>
                </div>
              </td>
            </tr>
            <tr className="border-b border-black">
              <td className="p-2" colSpan={4}>
                <div className="font-bold text-[10.5px] text-slate-700 mb-1">Consultant / PMC Comments:</div>
                <div className="min-h-12 border border-slate-300 p-2 text-xs bg-white rounded">
                  &nbsp;
                </div>
              </td>
            </tr>
            <tr>
              <td className="w-1/2 border-r-2 border-black p-2 align-top" colSpan={2}>
                <div className="font-bold text-[10.5px] uppercase text-slate-600 border-b border-black pb-1 mb-2">
                  Consultant (RE / RA) — Inspected & Recommended
                </div>
                <div className="text-xs space-y-1.5">
                  <div><strong>Name:</strong> ___________________________________</div>
                  <div><strong>Position:</strong> Resident Engineer / Inspector</div>
                  <div><strong>Company:</strong> Supervising Consultant</div>
                  <div className="mt-3 pt-1 border-t border-dashed border-slate-400">
                    <strong>Date & Signature:</strong> ____________________________
                  </div>
                </div>
              </td>
              <td className="w-1/2 p-2 align-top" colSpan={2}>
                <div className="font-bold text-[10.5px] uppercase text-slate-600 border-b border-black pb-1 mb-2">
                  PMC / DayOne — Witnessed, Acknowledged & Approved
                </div>
                <div className="text-xs space-y-1.5">
                  <div><strong>Name:</strong> ___________________________________</div>
                  <div><strong>Position:</strong> PMC Quality Director / Lead</div>
                  <div><strong>Company:</strong> PMC / DayOne</div>
                  <div className="mt-3 pt-1 border-t border-dashed border-slate-400">
                    <strong>Date & Signature:</strong> ____________________________
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="text-[9.5px] text-slate-500 text-center pt-1">
        BTP Governance Control Standard · All material approvals are submitted and tracked via Autodesk Construction Cloud (ACC).
      </div>
    </div>
  );
}
