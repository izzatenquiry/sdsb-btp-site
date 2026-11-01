import React from "react";
import { OfficialFormHeader } from "./OfficialFormHeader";

export function DlsSheet({
  formData,
}: {
  formData: any;
  setFormData?: (val: any) => void;
}) {
  const sampleDrawings = [
    { no: 1, ref: "BTP-STR-DWG-001", desc: "General Notes, Structural Specifications & Code Compliance", r0: "14/01/2026", r1: "15/03/2026", r2: "14/07/2026", r3: "", r4: "", remarks: "Code A - Approved" },
    { no: 2, ref: "BTP-STR-DWG-1001", desc: "Foundation & Piling Layout Plan - Block A Data Centre", r0: "20/01/2026", r1: "28/02/2026", r2: "14/07/2026", r3: "", r4: "", remarks: "Code A - Approved" },
    { no: 3, ref: "BTP-STR-DWG-1002", desc: "Ground Floor Slab & Core Wall Reinforcement Details", r0: "01/02/2026", r1: "14/04/2026", r2: "14/07/2026", r3: "", r4: "", remarks: "Code A - Approved" },
    { no: 4, ref: "BTP-STR-DWG-2001", desc: "Level 1 Suspended Heavy Load Data Hall Framing Plan", r0: "10/02/2026", r1: "05/05/2026", r2: "14/07/2026", r3: "", r4: "", remarks: "Code B - Approved w/ Comments" },
    { no: 5, ref: "BTP-ARC-DWG-101", desc: "Architectural Ground Floor Plan & Wall Schedule", r0: "15/01/2026", r1: "20/03/2026", r2: "14/07/2026", r3: "", r4: "", remarks: "Code A - Approved" },
    { no: 6, ref: "BTP-ARC-DWG-201", desc: "Data Centre Server Hall Raised Floor & Finishes Details", r0: "18/02/2026", r1: "12/04/2026", r2: "14/07/2026", r3: "", r4: "", remarks: "Code A - Approved" },
    { no: 7, ref: "BTP-MEP-DWG-301", desc: "Dual Power Pathway Routing & Busway Schematic (Path A & B)", r0: "25/02/2026", r1: "10/05/2026", r2: "14/07/2026", r3: "", r4: "", remarks: "Code A - Approved" },
    { no: 8, ref: "BTP-MEP-DWG-401", desc: "Chilled Water Primary & Secondary Piping Layout", r0: "02/03/2026", r1: "18/05/2026", r2: "14/07/2026", r3: "", r4: "", remarks: "Code A - Approved" },
    { no: 9, ref: "BTP-EHS-DWG-001", desc: "Fire Compartmentation, Life Safety & Egress Path Layout", r0: "10/01/2026", r1: "14/07/2026", r2: "", r3: "", r4: "", remarks: "Code A - Approved" },
    { no: 10, ref: "BTP-CIV-DWG-501", desc: "External Stormwater Drainage, Culverts & Retention Basin", r0: "12/01/2026", r1: "15/06/2026", r2: "14/07/2026", r3: "", r4: "", remarks: "Code A - Approved" },
  ];

  return (
    <div className="space-y-3 font-sans leading-tight">
      <OfficialFormHeader
        title="DRAWING LIST SUBMISSION (DLS)"
        projectName={formData.projectName || "SDSB · BANTING TECHNOLOGY PARK (BTP)"}
        docNo="BTP-QAQC-TPL-DLS-001"
        revision="Rev 02"
        date="14.07.2026"
      />

      {/* Submission Information Header */}
      <table className="w-full border-2 border-black text-xs border-collapse">
        <tbody>
          <tr className="border-b border-black">
            <td className="w-1/4 bg-slate-50 p-1.5 font-bold border-r border-black">General Contractor (GC):</td>
            <td className="w-1/4 p-1.5 border-r border-black font-semibold">SDSB (General Contractor)</td>
            <td className="w-1/4 bg-slate-50 p-1.5 font-bold border-r border-black">Submission No.:</td>
            <td className="w-1/4 p-1.5 font-bold text-blue-950">{formData.refNo || "BTP-DLS-001"}</td>
          </tr>
          <tr className="border-b border-black">
            <td className="bg-slate-50 p-1.5 font-bold border-r border-black">Package / Title:</td>
            <td className="p-1.5 border-r border-black font-semibold" colSpan={3}>
              Master Coordinated Shop Drawing List — Block A Data Centre Works
            </td>
          </tr>
          <tr>
            <td className="bg-slate-50 p-1.5 font-bold border-r border-black">Trade / Discipline:</td>
            <td className="p-1.5 border-r border-black font-semibold">{formData.discipline || "Civil & Structural / MEP"}</td>
            <td className="bg-slate-50 p-1.5 font-bold border-r border-black">Revision / Date:</td>
            <td className="p-1.5">Rev 02 · {formData.dateSubmitted}</td>
          </tr>
        </tbody>
      </table>

      {/* Guide Banner matching official template */}
      <div className="bg-amber-50 border-2 border-black p-1.5 text-center text-[10px] font-bold text-slate-800 tracking-wider">
        FILL IN THE DATE OF THE DRAWINGS REVISION ON THE RIGHT COLUMNS (ACC CDE CONTROLLED)
      </div>

      {/* Master Drawing Register Table */}
      <table className="w-full border-2 border-black text-[9.5px] border-collapse">
        <thead>
          <tr className="bg-slate-100 border-b border-black text-center font-bold">
            <th className="w-6 border-r border-black p-1">No</th>
            <th className="w-28 border-r border-black p-1 text-left">Drawing Reference Number</th>
            <th className="border-r border-black p-1 text-left">Drawing Description</th>
            <th className="w-14 border-r border-black p-1">Rev 0</th>
            <th className="w-14 border-r border-black p-1">Rev 1</th>
            <th className="w-14 border-r border-black p-1">Rev 2</th>
            <th className="w-14 border-r border-black p-1">Rev 3</th>
            <th className="w-14 border-r border-black p-1">Rev 4</th>
            <th className="w-32 p-1 text-left">Remarks / Review Status</th>
          </tr>
        </thead>
        <tbody>
          {sampleDrawings.map((dwg) => (
            <tr key={dwg.no} className="border-b border-black text-center h-6">
              <td className="border-r border-black p-1 font-bold">{dwg.no}</td>
              <td className="border-r border-black p-1 font-bold text-left text-blue-900">{dwg.ref}</td>
              <td className="border-r border-black p-1 text-left font-medium">{dwg.desc}</td>
              <td className="border-r border-black p-1 text-[9px]">{dwg.r0}</td>
              <td className="border-r border-black p-1 text-[9px]">{dwg.r1}</td>
              <td className="border-r border-black p-1 text-[9px]">{dwg.r2}</td>
              <td className="border-r border-black p-1 text-[9px] text-slate-400">—</td>
              <td className="border-r border-black p-1 text-[9px] text-slate-400">—</td>
              <td className="p-1 text-left font-semibold text-emerald-800">{dwg.remarks}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Review & Endorsement Sign-offs */}
      <table className="w-full border-2 border-black text-xs border-collapse">
        <tbody>
          <tr>
            <td className="w-1/3 border-r-2 border-black p-2 align-top">
              <div className="font-bold text-[10.5px] uppercase text-slate-600 border-b border-black pb-1 mb-1">
                Prepared by (GC Document Controller / BIM)
              </div>
              <div className="text-xs space-y-0.5">
                <div>Name: DAMIA</div>
                <div>Position: Document Controller</div>
                <div>Signature & Date: Signed · {formData.dateSubmitted}</div>
              </div>
            </td>
            <td className="w-1/3 border-r-2 border-black p-2 align-top">
              <div className="font-bold text-[10.5px] uppercase text-slate-600 border-b border-black pb-1 mb-1">
                Reviewed by (Supervising Consultant)
              </div>
              <div className="text-xs space-y-0.5">
                <div>Name: Ir. Ahmad Faris</div>
                <div>Position: Lead Structural & MEP Consultant</div>
                <div>Signature & Date: Recommended · {formData.dateSubmitted}</div>
              </div>
            </td>
            <td className="w-1/3 p-2 align-top">
              <div className="font-bold text-[10.5px] uppercase text-slate-600 border-b border-black pb-1 mb-1">
                Endorsed by (PMC / DayOne)
              </div>
              <div className="text-xs space-y-0.5">
                <div>Name: Ir. Ts. Mohd Khairul</div>
                <div>Position: PMC Quality Director</div>
                <div>Signature & Date: Endorsed in ACC · {formData.dateSubmitted}</div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div className="text-[9.5px] text-slate-500 text-center pt-1">
        BTP Governance Control Standard · All drawings must be uploaded to Autodesk Construction Cloud (ACC) with ISO 19650 compliant naming.
      </div>
    </div>
  );
}
