import React, { useState } from "react";
import { OfficialFormHeader } from "./OfficialFormHeader";

export function RfwiSheet({
  formData,
}: {
  formData: any;
  setFormData?: (val: any) => void;
}) {
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});

  function toggleCheck(idx: number) {
    setCheckedItems((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  }

  function checkAll() {
    const all: Record<number, boolean> = {};
    for (let i = 0; i < 8; i++) all[i] = true;
    setCheckedItems(all);
  }

  function clearAll() {
    setCheckedItems({});
  }

  return (
    <div className="w-full space-y-2 font-sans leading-tight">
      <OfficialFormHeader
        title="REQUEST FOR WORK INSPECTION (RFWI) FORM"
        projectName={formData.projectName || "SDSB · BANTING TECHNOLOGY PARK (BTP)"}
        docNo="BTP-QAQC-FRM-RFWI-001"
        revision="Rev 02"
        date="14.07.2026"
      />

      {/* Section A: Inspection Request Details */}
      <div>
        <div className="bg-slate-200 border-2 border-black px-2.5 py-1.5 font-bold text-[11px] uppercase tracking-wide">
          A. INSPECTION REQUEST DETAILS
        </div>
        <table className="w-full border-2 border-t-0 border-black text-[11px] border-collapse">
          <tbody>
            <tr className="border-b border-black">
              <td className="w-[15%] bg-slate-50 py-1.5 px-2.5 font-bold border-r border-black whitespace-nowrap">RFWI No.:</td>
              <td className="w-[52%] py-1.5 px-2.5 border-r border-black font-semibold text-blue-950 text-xs whitespace-nowrap overflow-hidden text-ellipsis">{formData.refNo}</td>
              <td className="w-[13%] bg-slate-50 py-1.5 px-2.5 font-bold border-r border-black whitespace-nowrap">Revision:</td>
              <td className="w-[20%] py-1.5 px-2.5 text-xs">{formData.revision}</td>
            </tr>
            <tr className="border-b border-black">
              <td className="w-[15%] bg-slate-50 py-1.5 px-2.5 font-bold border-r border-black whitespace-nowrap">ACC Ref.:</td>
              <td className="w-[52%] py-1.5 px-2.5 border-r border-black font-semibold text-blue-950 text-xs whitespace-nowrap overflow-hidden text-ellipsis">{formData.accRef}</td>
              <td className="w-[13%] bg-slate-50 py-1.5 px-2.5 font-bold border-r border-black whitespace-nowrap">Date Submitted:</td>
              <td className="w-[20%] py-1.5 px-2.5 whitespace-nowrap text-xs">{formData.dateSubmitted}</td>
            </tr>
            <tr className="border-b border-black">
              <td className="w-[15%] bg-slate-50 py-1.5 px-2.5 font-bold border-r border-black whitespace-nowrap">Work Package:</td>
              <td className="w-[52%] py-1.5 px-2.5 border-r border-black">{formData.workPackage}</td>
              <td className="w-[13%] bg-slate-50 py-1.5 px-2.5 font-bold border-r border-black whitespace-nowrap">Discipline:</td>
              <td className="w-[20%] py-1.5 px-2.5 font-semibold">{formData.discipline}</td>
            </tr>
            <tr className="border-b border-black">
              <td className="w-[15%] bg-slate-50 py-1.5 px-2.5 font-bold border-r border-black whitespace-nowrap">Inspection Activity:</td>
              <td className="py-1.5 px-2.5 border-r border-black font-semibold" colSpan={3}>{formData.activity}</td>
            </tr>
            <tr className="border-b border-black">
              <td className="w-[15%] bg-slate-50 py-1.5 px-2.5 font-bold border-r border-black whitespace-nowrap">Requested Inspection Date / Time:</td>
              <td className="py-1.5 px-2.5 font-bold text-slate-900" colSpan={3}>
                {formData.requestedInspectionDateTime || `${formData.dateSubmitted} / 10:00 AM`}
              </td>
            </tr>
            <tr className="border-b border-black">
              <td className="w-[15%] bg-slate-50 py-1.5 px-2.5 font-bold border-r border-black whitespace-nowrap">Location / Area / Level / Grid:</td>
              <td className="w-[52%] py-1.5 px-2.5 border-r border-black">{formData.location}</td>
              <td className="w-[13%] bg-slate-50 py-1.5 px-2.5 font-bold border-r border-black whitespace-nowrap">Drawing / ITP Ref.:</td>
              <td className="w-[20%] py-1.5 px-2.5 text-xs truncate">{formData.dwgRef}</td>
            </tr>
            <tr>
              <td className="w-[15%] bg-slate-50 py-1.5 px-2.5 font-bold border-r border-black whitespace-nowrap">Related MS / MAF / NCR Ref.:</td>
              <td className="py-1.5 px-2.5 text-xs" colSpan={3}>{formData.relatedRef}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Section B: Inspection Type / Purpose */}
      <div>
        <div className="bg-slate-200 border-2 border-black px-2.5 py-1.5 font-bold text-[11px] uppercase tracking-wide">
          B. INSPECTION TYPE / PURPOSE
        </div>
        <table className="w-full border-2 border-t-0 border-black text-[11px] border-collapse">
          <thead>
            <tr className="bg-slate-100 text-[10px] font-bold">
              <th className="w-[18%] border-r border-b border-black py-1.5 px-2.5 text-left">Item</th>
              <th className="w-[12%] border-r border-b border-black py-1.5 px-2 text-center">Requirement</th>
              <th className="w-[70%] border-b border-black py-1.5 px-2.5 text-left">Tick / Confirm as Applicable</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="w-[18%] bg-slate-50 py-1.5 px-2.5 font-bold border-r border-b border-black whitespace-nowrap">Inspection Type:</td>
              <td className="w-[12%] py-1.5 px-2 border-r border-b border-black text-[10px] text-slate-500 text-center">—</td>
              <td className="w-[70%] py-1 px-1.5 border-b border-black">
                <table className="w-full text-[9.5px] border-collapse table-fixed">
                  <tbody>
                    <tr>
                      <td className="w-[23%] py-0.5 px-0.5 align-middle">
                        <label className="inline-flex items-center gap-1 font-semibold whitespace-nowrap cursor-pointer">
                          <input type="checkbox" defaultChecked className="h-3 w-3 align-middle" /> <span>Check Inspection</span>
                        </label>
                      </td>
                      <td className="w-[29%] py-0.5 px-0.5 align-middle">
                        <label className="inline-flex items-center gap-1 font-semibold whitespace-nowrap cursor-pointer">
                          <input type="checkbox" className="h-3 w-3 align-middle" /> <span>Installation Inspection</span>
                        </label>
                      </td>
                      <td className="w-[24%] py-0.5 px-0.5 align-middle">
                        <label className="inline-flex items-center gap-1 font-semibold whitespace-nowrap cursor-pointer">
                          <input type="checkbox" className="h-3 w-3 align-middle" /> <span>Final Inspection</span>
                        </label>
                      </td>
                      <td className="w-[24%] py-0.5 px-0.5 align-middle">
                        <label className="inline-flex items-center gap-1 font-semibold whitespace-nowrap cursor-pointer">
                          <input type="checkbox" className="h-3 w-3 align-middle" /> <span>Mock-up Inspection</span>
                        </label>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
            <tr>
              <td className="w-[18%] bg-slate-50 py-1.5 px-2.5 font-bold border-r border-b border-black whitespace-nowrap">Inspection Criteria:</td>
              <td className="w-[12%] py-1.5 px-2 border-r border-b border-black text-[10px] text-slate-500 text-center">—</td>
              <td className="w-[70%] py-1 px-1.5 border-b border-black">
                <table className="w-full text-[9.5px] border-collapse table-fixed">
                  <tbody>
                    <tr>
                      <td className="w-[23%] py-0.5 px-0.5 align-middle">
                        <label className="inline-flex items-center gap-1 font-semibold whitespace-nowrap cursor-pointer">
                          <input type="checkbox" defaultChecked className="h-3 w-3 align-middle" /> <span>Hold Point</span>
                        </label>
                      </td>
                      <td className="w-[29%] py-0.5 px-0.5 align-middle">
                        <label className="inline-flex items-center gap-1 font-semibold whitespace-nowrap cursor-pointer">
                          <input type="checkbox" className="h-3 w-3 align-middle" /> <span>Witness Point</span>
                        </label>
                      </td>
                      <td className="w-[24%] py-0.5 px-0.5 align-middle">
                        <label className="inline-flex items-center gap-1 font-semibold whitespace-nowrap cursor-pointer">
                          <input type="checkbox" className="h-3 w-3 align-middle" /> <span>Surveillance / Gen.</span>
                        </label>
                      </td>
                      <td className="w-[24%] py-0.5 px-0.5 align-middle">
                        <label className="inline-flex items-center gap-1 font-semibold whitespace-nowrap cursor-pointer">
                          <input type="checkbox" className="h-3 w-3 align-middle" /> <span>Re-inspection</span>
                        </label>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
            <tr>
              <td className="bg-slate-50 py-1 px-2.5 font-bold border-r border-b border-black">Readiness:</td>
              <td className="py-1 px-2.5 text-[10px] leading-tight text-slate-700 border-b border-black" colSpan={2}>
                Work complete, accessible, safe and all approved documents / records available before inspection.
              </td>
            </tr>
            <tr>
              <td className="bg-slate-50 py-1 px-2.5 font-bold border-r border-black">ACC Traceability:</td>
              <td className="py-1 px-2.5 text-[10px] leading-tight text-slate-800 font-semibold" colSpan={2}>
                No backdating. Submit in ACC with correct reference number, location, trade and attachment evidence.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Section C: Inspection Readiness / Attachments */}
      <div>
        <div className="bg-slate-200 border-2 border-black px-2.5 py-1.5 font-bold text-[11px] uppercase tracking-wide flex items-center justify-between">
          <span>C. INSPECTION READINESS / ATTACHMENTS CHECKLIST</span>
          <div className="no-print flex items-center gap-1.5 text-[9px] font-semibold tracking-normal lowercase">
            <button
              type="button"
              onClick={checkAll}
              className="rounded bg-white/90 hover:bg-white text-emerald-800 border border-emerald-600/40 px-1.5 py-0.5 cursor-pointer transition shadow-2xs font-bold"
              title="Tick all attachments as YES"
            >
              ✓ Tick All YES
            </button>
            <button
              type="button"
              onClick={clearAll}
              className="rounded bg-white/90 hover:bg-white text-slate-700 border border-slate-300 px-1.5 py-0.5 cursor-pointer transition shadow-2xs"
              title="Clear all ticks"
            >
              Reset
            </button>
          </div>
        </div>
        <table className="w-full border-2 border-t-0 border-black text-[10px] border-collapse">
          <thead>
            <tr className="bg-slate-100 text-center font-bold">
              <th className="w-7 border-r border-b border-black py-1 px-1">No.</th>
              <th className="border-r border-b border-black py-1 px-2 text-left">Required Attachment / Readiness Evidence</th>
              <th className="w-16 border-r border-b border-black py-1 px-1 text-center">Included [Y/N]</th>
              <th className="border-r border-b border-black py-1 px-2 text-left">Consultant (RE / RA) Remarks</th>
              <th className="w-16 border-b border-black py-1 px-1">PMC</th>
            </tr>
          </thead>
          <tbody>
            {[
              "Approved ITP / Inspection Checklist / Check Sheet",
              "Approved Method Statement and Risk Assessment / JSA",
              "Approved Shop Drawings / Latest Coordinated Revision",
              "Approved Material Approval (MAF) / Certificates / Delivery Records",
              "Relevant Test Reports / Calibration Records / Survey Records",
              "Previous NCR / Observation Closure Evidence, if any",
              "Work Completion Evidence / Site Inspection Photographs",
              "Safety Access / Permit-to-Work / Area Readiness Confirmation",
            ].map((item, idx) => (
              <tr key={idx} className="hover:bg-slate-50/80 transition">
                <td className="border-r border-b border-black py-1 px-1 text-center font-bold text-slate-700">{idx + 1}</td>
                <td className="border-r border-b border-black py-1 px-2 leading-tight">{item}</td>
                <td className="border-r border-b border-black py-1 px-1 text-center align-middle">
                  <input
                    type="checkbox"
                    checked={!!checkedItems[idx]}
                    onChange={() => toggleCheck(idx)}
                    className="h-3.5 w-3.5 cursor-pointer rounded border-slate-400 align-middle"
                  />
                </td>
                <td className="border-r border-b border-black py-1 px-2 text-slate-400">&nbsp;</td>
                <td className="border-b border-black py-1 px-1 text-center text-slate-400">&nbsp;</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Section D: Requested By (General Contractor) */}
      <div>
        <div className="bg-slate-200 border-2 border-black px-2.5 py-1.5 font-bold text-[11px] uppercase tracking-wide">
          D. REQUESTED BY (GENERAL CONTRACTOR - GC)
        </div>
        <table className="w-full border-2 border-t-0 border-black text-xs border-collapse">
          <tbody>
            <tr>
              <td className="w-[15%] bg-slate-50 py-1.5 px-2.5 font-bold border-r border-b border-black whitespace-nowrap">Name:</td>
              <td className="w-[35%] py-1.5 px-2.5 border-r border-b border-black font-bold">{formData.requestedBy || "DAMIA"}</td>
              <td className="w-[18%] bg-slate-50 py-1.5 px-2.5 font-bold border-r border-b border-black whitespace-nowrap">Position:</td>
              <td className="w-[32%] py-1.5 px-2.5 border-b border-black">{formData.requestedRole || "Document Controller / Site Engineer"}</td>
            </tr>
            <tr>
              <td className="w-[15%] bg-slate-50 py-1.5 px-2.5 font-bold border-r border-black whitespace-nowrap">Company:</td>
              <td className="w-[35%] py-1.5 px-2.5 border-r border-black">{formData.requestedCompany || "SDSB (General Contractor)"}</td>
              <td className="w-[18%] bg-slate-50 py-1.5 px-2.5 font-bold border-r border-black whitespace-nowrap">Date & Signature:</td>
              <td className="w-[32%] py-1.5 px-2.5 text-xs text-slate-900 whitespace-nowrap">
                <span className="font-semibold">{formData.dateSubmitted || "____-____-____"}</span>
                <span className="text-slate-400 mx-2">|</span>
                <span className="text-slate-600">Sign: <span className="border-b border-black inline-block w-24 align-bottom"></span></span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Section E: Inspection Result and Approval Status */}
      <div>
        <div className="bg-slate-200 border-2 border-black px-2.5 py-1.5 font-bold text-[11px] uppercase tracking-wide">
          E. INSPECTION RESULT AND APPROVAL STATUS (FOR CONSULTANT & PMC USE ONLY)
        </div>
        <table className="w-full border-2 border-t-0 border-black text-xs border-collapse">
          <tbody>
            <tr>
              <td className="py-1.5 px-2.5 border-b border-black" colSpan={4}>
                <table className="w-full text-[10.5px] border-collapse font-bold">
                  <tbody>
                    <tr>
                      <td className="text-slate-700 whitespace-nowrap pr-2 w-auto">Inspection Outcome:</td>
                      <td className="whitespace-nowrap px-1 text-slate-800">
                        <label className="inline-flex items-center gap-1.5 cursor-pointer">
                          <input type="checkbox" className="h-3 w-3 align-middle" /> <span>Passed</span>
                        </label>
                      </td>
                      <td className="whitespace-nowrap px-1 text-slate-800">
                        <label className="inline-flex items-center gap-1.5 cursor-pointer">
                          <input type="checkbox" className="h-3 w-3 align-middle" /> <span>Passed with Comments</span>
                        </label>
                      </td>
                      <td className="whitespace-nowrap px-1 text-slate-800">
                        <label className="inline-flex items-center gap-1.5 cursor-pointer">
                          <input type="checkbox" className="h-3 w-3 align-middle" /> <span>Rejected / Re-inspection Required</span>
                        </label>
                      </td>
                      <td className="whitespace-nowrap px-1 text-slate-800">
                        <label className="inline-flex items-center gap-1.5 cursor-pointer">
                          <input type="checkbox" className="h-3 w-3 align-middle" /> <span>Cancelled / Not Ready</span>
                        </label>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
            <tr>
              <td className="py-1.5 px-2.5" colSpan={4}>
                <div className="font-bold text-[10px] text-slate-700 mb-1">Inspection Comments / Required Action:</div>
                <div className="h-12 border border-slate-300 p-1.5 text-xs bg-white rounded overflow-hidden" style={{ height: "48px" }}>
                  {formData.inspectionComments || ""}
                </div>
              </td>
            </tr>
            <tr>
              <td className="w-1/2 border-r-2 border-t border-black p-2 align-top" colSpan={2}>
                <div className="font-bold text-[10px] uppercase text-slate-600">
                  Consultant (RE / RA) — Inspected & Recommended
                </div>
                <div className="border-b border-black mt-1 mb-1.5" />
                <div className="space-y-0.5 text-xs">
                  <div><strong>Name:</strong> ___________________________________</div>
                  <div><strong>Position:</strong> Resident Engineer / Inspector (C&S)</div>
                  <div><strong>Company:</strong> Supervising Consultant</div>
                  <div className="mt-1 pt-1 border-t border-dashed border-slate-400">
                    <div className="h-9" style={{ height: "36px" }}>&nbsp;</div>
                    <div>
                      <strong>Signature & Date:</strong> ____________________________
                    </div>
                  </div>
                </div>
              </td>
              <td className="w-1/2 border-t border-black p-2 align-top" colSpan={2}>
                <div className="font-bold text-[10px] uppercase text-slate-600">
                  PMC / DayOne — Witnessed, Acknowledged & Approved
                </div>
                <div className="border-b border-black mt-1 mb-1.5" />
                <div className="space-y-0.5 text-xs">
                  <div><strong>Name:</strong> ___________________________________</div>
                  <div><strong>Position:</strong> PMC Quality Director / Lead</div>
                  <div><strong>Company:</strong> PMC / DayOne</div>
                  <div className="mt-1 pt-1 border-t border-dashed border-slate-400">
                    <div className="h-9" style={{ height: "36px" }}>&nbsp;</div>
                    <div>
                      <strong>Signature & Date:</strong> ____________________________
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="text-[9.5px] text-slate-500 text-center pt-1.5 pb-0.5">
        BTP Governance Control Standard · All records are controlled and synchronized into Autodesk Construction Cloud (ACC).
      </div>
    </div>
  );
}
