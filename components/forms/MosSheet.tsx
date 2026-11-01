import React from "react";
import { OfficialFormHeader } from "./OfficialFormHeader";

export function MosSheet({
  formData,
}: {
  formData: any;
  setFormData?: (val: any) => void;
}) {
  return (
    <div className="space-y-3 font-sans leading-tight">
      <OfficialFormHeader
        title="METHOD OF STATEMENT (MOS) TEMPLATE"
        projectName={formData.projectName || "SDSB · BANTING TECHNOLOGY PARK (BTP)"}
        docNo="BTP-QAQC-TPL-MOS-001"
        revision="Rev 02"
        date="14.07.2026"
      />

      {/* Section A: Submission Details */}
      <div>
        <div className="bg-slate-200 border-2 border-black px-2 py-1 font-bold text-[11px] uppercase tracking-wide">
          A. SUBMISSION DETAILS
        </div>
        <table className="w-full border-2 border-t-0 border-black text-xs border-collapse">
          <tbody>
            <tr className="border-b border-black">
              <td className="w-1/4 bg-slate-50 p-1.5 font-bold border-r border-black">MS No.:</td>
              <td className="w-1/4 p-1.5 border-r border-black font-semibold text-blue-950">{formData.refNo || "BTP-MOS-001"}</td>
              <td className="w-1/4 bg-slate-50 p-1.5 font-bold border-r border-black">Revision:</td>
              <td className="w-1/4 p-1.5">{formData.revision || "Rev 00"}</td>
            </tr>
            <tr className="border-b border-black">
              <td className="bg-slate-50 p-1.5 font-bold border-r border-black">ACC Ref.:</td>
              <td className="p-1.5 border-r border-black font-semibold">{formData.accRef}</td>
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
              <td className="bg-slate-50 p-1.5 font-bold border-r border-black">Risk Assessment Ref.:</td>
              <td className="p-1.5 border-r border-black">{formData.relatedRiskAssessment || "BTP-EHS-TPL-RA-001"}</td>
              <td className="bg-slate-50 p-1.5 font-bold border-r border-black">Related ITP No.:</td>
              <td className="p-1.5">{formData.relatedItpNo || "BTP-QAQC-TPL-ITP-001"}</td>
            </tr>
            <tr>
              <td className="bg-slate-50 p-1.5 font-bold border-r border-black">Method Statement Title:</td>
              <td className="p-1.5 font-bold text-slate-900" colSpan={3}>
                {formData.activity || "Method Statement for Cast-in-Place Concrete Substructure & Superstructure"}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Table of Contents & Structure Overview */}
      <div className="border-2 border-black bg-slate-50 p-2 text-xs">
        <div className="font-bold text-[10.5px] uppercase text-slate-700 border-b border-slate-300 pb-1 mb-1.5">
          Standard Method Statement Structure (Per BTP Governance Guidelines)
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10px]">
          <div>
            <strong>1. Introduction</strong>
            <p className="text-slate-600">1.1 Purpose & Objectives</p>
            <p className="text-slate-600">1.2 Scope & Work Area Boundaries</p>
            <strong className="block mt-1">2. References</strong>
            <p className="text-slate-600">Contract Specs, Codes & BIM DWGs</p>
          </div>
          <div>
            <strong>3. Roles & Responsibilities</strong>
            <p className="text-slate-600">GC PM, Site Engineers, QA/QC, Safety</p>
            <strong className="block mt-1">4. Resources & Tooling</strong>
            <p className="text-slate-600">4.1 Plant, Cranes & Heavy Machinery</p>
            <p className="text-slate-600">4.2 Skilled Manpower & Competencies</p>
            <p className="text-slate-600">4.3 Approved Materials (MAF)</p>
          </div>
          <div>
            <strong>5. EHS & Risk Controls</strong>
            <p className="text-slate-600">Permit-to-work, PPE & Emergency Plan</p>
            <strong className="block mt-1">6. Methodology & Execution</strong>
            <p className="text-slate-600">Pre-task briefing, Step-by-step procedure</p>
            <strong className="block mt-1">7. QA/QC & ITP Verification</strong>
            <p className="text-slate-600">Hold points, Checklists & Sign-offs</p>
          </div>
        </div>
      </div>

      {/* Plant, Machinery and Resources Matrix */}
      <div>
        <div className="bg-slate-200 border-2 border-black px-2 py-1 font-bold text-[11px] uppercase tracking-wide">
          4.1 PLANT, MACHINERY AND EQUIPMENT REGISTER
        </div>
        <table className="w-full border-2 border-t-0 border-black text-[10px] border-collapse">
          <thead>
            <tr className="bg-slate-100 border-b border-black text-center font-bold">
              <th className="w-8 border-r border-black p-1">No</th>
              <th className="border-r border-black p-1 text-left">Plant / Machinery / Tool Description</th>
              <th className="w-32 border-r border-black p-1 text-left">Capacity / Spec</th>
              <th className="w-28 border-r border-black p-1 text-left">PMA / Cert No.</th>
              <th className="w-24 p-1">Status</th>
            </tr>
          </thead>
          <tbody>
            {[
              { no: 1, desc: "Mobile Crane / Crawler Crane for Rebar & Formwork Lifting", cap: "50-Ton Capacity", cert: "PMA-KL-2026-441", status: "Certified / Valid" },
              { no: 2, desc: "Concrete Boom Pump & Placing Pipeline", cap: "42-Meter Reach", cert: "PMA-SL-2026-102", status: "Certified / Valid" },
              { no: 3, desc: "High-Frequency Concrete Poker Vibrators (Dual Set)", cap: "50mm & 38mm Head", cert: "In-house Inspection", status: "Inspected" },
              { no: 4, desc: "Digital Total Station & Precise Optical Level", cap: "Leica TS16 (1-sec)", cert: "Cal-2026-088", status: "Calibrated" },
              { no: 5, desc: "Heavy Duty Shoring & Steel Formwork System", cap: "Load rating per PE calcs", cert: "PE Endorsement", status: "Approved" },
            ].map((p) => (
              <tr key={p.no} className="border-b border-black">
                <td className="border-r border-black p-1 text-center font-bold">{p.no}</td>
                <td className="border-r border-black p-1 font-medium">{p.desc}</td>
                <td className="border-r border-black p-1">{p.cap}</td>
                <td className="border-r border-black p-1">{p.cert}</td>
                <td className="p-1 text-center font-bold text-emerald-800">{p.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Execution Methodology Summary */}
      <div>
        <div className="bg-slate-200 border-2 border-black px-2 py-1 font-bold text-[11px] uppercase tracking-wide">
          7. CONSTRUCTION METHODOLOGY & QUALITY MILESTONES
        </div>
        <div className="border-2 border-t-0 border-black p-2 text-xs space-y-1.5">
          <p className="text-[11px] leading-relaxed">
            <strong>1. Pre-Task Preparation:</strong> Verify survey control points, establish grid offsets, and conduct mandatory safety toolbox meeting prior to work commencement.
          </p>
          <p className="text-[11px] leading-relaxed">
            <strong>2. Installation & Verification:</strong> Fabricate and fix reinforcement according to approved bar bending schedules and coordinated BIM layouts. Verify cover blocks and chair spacing.
          </p>
          <p className="text-[11px] leading-relaxed">
            <strong>3. Concealment Check (Hold Point):</strong> Submit RFWI to Supervising Consultant at least 24 hours prior to pour. Hold Point released upon R.E. and PMC endorsement.
          </p>
          <p className="text-[11px] leading-relaxed">
            <strong>4. Concrete Placement & Curing:</strong> Maintain continuous pour rate, verify slump and temperature on delivery, sample compressive cubes (1 set per 20m³), and apply wet burlap curing for 7 days minimum.
          </p>
        </div>
      </div>

      {/* Review & Approval Sign-offs */}
      <table className="w-full border-2 border-black text-xs border-collapse">
        <tbody>
          <tr>
            <td className="w-1/3 border-r-2 border-black p-2 align-top">
              <div className="font-bold text-[10.5px] uppercase text-slate-600 border-b border-black pb-1 mb-1">
                Prepared by (General Contractor - GC)
              </div>
              <div className="text-xs space-y-0.5">
                <div>Name: DAMIA</div>
                <div>Position: Site Quality Engineer / DC</div>
                <div>Signature & Date: Signed · {formData.dateSubmitted}</div>
              </div>
            </td>
            <td className="w-1/3 border-r-2 border-black p-2 align-top">
              <div className="font-bold text-[10.5px] uppercase text-slate-600 border-b border-black pb-1 mb-1">
                Reviewed by (Supervising Consultant)
              </div>
              <div className="text-xs space-y-0.5">
                <div>Name: Ir. Ahmad Faris</div>
                <div>Position: Resident Engineer (C&S)</div>
                <div>Signature & Date: Recommended · {formData.dateSubmitted}</div>
              </div>
            </td>
            <td className="w-1/3 p-2 align-top">
              <div className="font-bold text-[10.5px] uppercase text-slate-600 border-b border-black pb-1 mb-1">
                Approved by (PMC / DayOne)
              </div>
              <div className="text-xs space-y-0.5">
                <div>Name: Ir. Ts. Mohd Khairul</div>
                <div>Position: PMC Quality Director</div>
                <div>Signature & Date: Approved in ACC · {formData.dateSubmitted}</div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div className="text-[9.5px] text-slate-500 text-center pt-1">
        BTP Governance Control Standard · Work shall strictly adhere to this approved Method Statement. Any deviation requires formal revision in ACC.
      </div>
    </div>
  );
}
