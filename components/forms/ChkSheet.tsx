import React from "react";
import { OfficialFormHeader } from "./OfficialFormHeader";

export function ChkSheet({
  formData,
}: {
  formData: any;
  setFormData?: (val: any) => void;
}) {
  return (
    <div className="space-y-3 font-sans leading-tight">
      <OfficialFormHeader
        title="INSPECTION CHECKLIST TEMPLATE"
        projectName={formData.projectName || "SDSB · BANTING TECHNOLOGY PARK (BTP)"}
        docNo="BTP-QAQC-TPL-CHK-001"
        revision="Rev 02"
        date="14.07.2026"
      />

      {/* Section A: Checklist Identification */}
      <div>
        <div className="bg-slate-200 border-2 border-black px-2 py-1 font-bold text-[11px] uppercase tracking-wide">
          A. CHECKLIST IDENTIFICATION AND INSPECTION DETAILS
        </div>
        <table className="w-full border-2 border-t-0 border-black text-xs border-collapse">
          <tbody>
            <tr className="border-b border-black">
              <td className="w-1/4 bg-slate-50 p-1.5 font-bold border-r border-black">Project:</td>
              <td className="w-1/4 p-1.5 border-r border-black font-semibold">BTP Data Centre Project</td>
              <td className="w-1/4 bg-slate-50 p-1.5 font-bold border-r border-black">Checklist No.:</td>
              <td className="w-1/4 p-1.5 font-bold text-blue-950">{formData.refNo || "BTP-QAQC-CHK-001"}</td>
            </tr>
            <tr className="border-b border-black">
              <td className="bg-slate-50 p-1.5 font-bold border-r border-black">Checklist Title:</td>
              <td className="p-1.5 border-r border-black font-semibold" colSpan={3}>
                {formData.activity || "Comprehensive Site Inspection & Installation Verification"}
              </td>
            </tr>
            <tr className="border-b border-black">
              <td className="bg-slate-50 p-1.5 font-bold border-r border-black">Facility / Building:</td>
              <td className="p-1.5 border-r border-black">Block A Data Centre Facility</td>
              <td className="bg-slate-50 p-1.5 font-bold border-r border-black">Discipline:</td>
              <td className="p-1.5 font-semibold">{formData.discipline}</td>
            </tr>
            <tr className="border-b border-black">
              <td className="bg-slate-50 p-1.5 font-bold border-r border-black">Area / Level / Grid:</td>
              <td className="p-1.5 border-r border-black">{formData.location}</td>
              <td className="bg-slate-50 p-1.5 font-bold border-r border-black">Inspection Date:</td>
              <td className="p-1.5">{formData.dateSubmitted}</td>
            </tr>
            <tr>
              <td className="bg-slate-50 p-1.5 font-bold border-r border-black">ACC / RFWI Ref.:</td>
              <td className="p-1.5 border-r border-black">{formData.accRef}</td>
              <td className="bg-slate-50 p-1.5 font-bold border-r border-black">General Contractor (GC):</td>
              <td className="p-1.5 font-semibold">SDSB (General Contractor)</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Section B: Scope & Prerequisites */}
      <div>
        <div className="bg-slate-200 border-2 border-black px-2 py-1 font-bold text-[11px] uppercase tracking-wide">
          B. SCOPE, APPLICABLE DOCUMENTS AND PREREQUISITES
        </div>
        <table className="w-full border-2 border-t-0 border-black text-[10.5px] border-collapse">
          <tbody>
            <tr className="border-b border-black">
              <td className="w-1/4 bg-slate-50 p-1 font-bold border-r border-black">Scope Description:</td>
              <td className="p-1" colSpan={3}>Full verification of completed structural, architectural and MEP installations prior to covering/testing.</td>
            </tr>
            <tr className="border-b border-black">
              <td className="bg-slate-50 p-1 font-bold border-r border-black">Approved Drawing Refs:</td>
              <td className="p-1 border-r border-black">{formData.dwgRef}</td>
              <td className="bg-slate-50 p-1 font-bold border-r border-black">Approved MS & RA Refs:</td>
              <td className="p-1">{formData.relatedRef}</td>
            </tr>
            <tr>
              <td className="bg-slate-50 p-1 font-bold border-r border-black">Approved MAF Refs:</td>
              <td className="p-1 border-r border-black">BTP-QAQC-FRM-MAF-001 (Rev 02)</td>
              <td className="bg-slate-50 p-1 font-bold border-r border-black">Applicable ITP Reference:</td>
              <td className="p-1">BTP-QAQC-TPL-ITP-001</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Section C: Pre-Inspection Readiness */}
      <div>
        <div className="bg-slate-200 border-2 border-black px-2 py-1 font-bold text-[11px] uppercase tracking-wide">
          C. PRE-INSPECTION READINESS
        </div>
        <table className="w-full border-2 border-t-0 border-black text-[10px] border-collapse">
          <thead>
            <tr className="bg-slate-100 border-b border-black text-center font-bold">
              <th className="w-6 border-r border-black p-1">No</th>
              <th className="border-r border-black p-1 text-left">Inspection Requirement / Acceptance Criteria</th>
              <th className="w-6 border-r border-black p-1">C</th>
              <th className="w-6 border-r border-black p-1">NC</th>
              <th className="w-6 border-r border-black p-1">N/A</th>
              <th className="w-6 border-r border-black p-1">OBS</th>
              <th className="border-black p-1 text-left">Remarks / Evidence Ref.</th>
            </tr>
          </thead>
          <tbody>
            {[
              "Approved Method Statement, Risk Assessment (RA/JSA) and ITP available at inspection site.",
              "Latest approved shop drawings, coordinated BIM layouts and specifications available.",
              "Materials approved (MAF), inspected on delivery, undamaged, and verified against specs.",
              "Work completed, cleaned, safely accessible, illuminated and confirmed by GC supervisor.",
              "Prior Hold Points and prerequisite inspections formally accepted and signed off in ACC.",
            ].map((text, idx) => (
              <tr key={idx} className="border-b border-black">
                <td className="border-r border-black p-1 text-center font-bold">{idx + 1}</td>
                <td className="border-r border-black p-1">{text}</td>
                <td className="border-r border-black p-1 text-center font-bold text-emerald-800">✓</td>
                <td className="border-r border-black p-1 text-center">—</td>
                <td className="border-r border-black p-1 text-center">—</td>
                <td className="border-r border-black p-1 text-center">—</td>
                <td className="p-1 italic text-slate-600">Verified per BTP Standards</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Section D: General Installation & Workmanship */}
      <div>
        <div className="bg-slate-200 border-2 border-black px-2 py-1 font-bold text-[11px] uppercase tracking-wide">
          D. GENERAL INSTALLATION AND WORKMANSHIP VERIFICATION
        </div>
        <table className="w-full border-2 border-t-0 border-black text-[10px] border-collapse">
          <thead>
            <tr className="bg-slate-100 border-b border-black text-center font-bold">
              <th className="w-6 border-r border-black p-1">No</th>
              <th className="border-r border-black p-1 text-left">Inspection Requirement / Acceptance Criteria</th>
              <th className="w-6 border-r border-black p-1">C</th>
              <th className="w-6 border-r border-black p-1">NC</th>
              <th className="w-6 border-r border-black p-1">N/A</th>
              <th className="w-6 border-r border-black p-1">OBS</th>
              <th className="border-black p-1 text-left">Remarks / Evidence Ref.</th>
            </tr>
          </thead>
          <tbody>
            {[
              "Installation location, orientation, configuration and routing comply with approved drawings.",
              "Dimensions, levels, alignment, plumbness, slopes and tolerances within specified limits.",
              "Supports, brackets, anchors, fixings and seismic restraints installed at specified intervals.",
              "Fixings, fasteners, torque settings, welding and joint connections secure and certified.",
              "Clearances, maintenance zones, operational access and architectural interfaces preserved.",
              "Protection of finished work, waterproofing, fire barriers and building envelope maintained.",
              "System identification, labelling, pipe marking, direction arrows and tag references verified.",
              "Deviations, RFIs, NCRs, observations and previous comments resolved or formally controlled.",
            ].map((text, idx) => (
              <tr key={idx} className="border-b border-black">
                <td className="border-r border-black p-1 text-center font-bold">{idx + 1}</td>
                <td className="border-r border-black p-1">{text}</td>
                <td className="border-r border-black p-1 text-center font-bold text-emerald-800">✓</td>
                <td className="border-r border-black p-1 text-center">—</td>
                <td className="border-r border-black p-1 text-center">—</td>
                <td className="border-r border-black p-1 text-center">—</td>
                <td className="p-1 italic text-slate-600">Compliant with drawing specs</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Section E: Data Centre Critical System Requirements */}
      <div>
        <div className="bg-slate-200 border-2 border-black px-2 py-1 font-bold text-[11px] uppercase tracking-wide">
          E. DATA CENTRE CRITICAL SYSTEM AND FACILITY REQUIREMENTS
        </div>
        <table className="w-full border-2 border-t-0 border-black text-[10px] border-collapse">
          <thead>
            <tr className="bg-slate-100 border-b border-black text-center font-bold">
              <th className="w-6 border-r border-black p-1">No</th>
              <th className="border-r border-black p-1 text-left">Inspection Requirement / Acceptance Criteria</th>
              <th className="w-6 border-r border-black p-1">C</th>
              <th className="w-6 border-r border-black p-1">NC</th>
              <th className="w-6 border-r border-black p-1">N/A</th>
              <th className="w-6 border-r border-black p-1">OBS</th>
              <th className="border-black p-1 text-left">Remarks / Evidence Ref.</th>
            </tr>
          </thead>
          <tbody>
            {[
              "A and B power, cooling and controls pathways physically separated per resilience philosophy.",
              "Redundancy and maintainability preserved; no single installation defect compromises dual paths.",
              "Critical rooms weather-tight, dry, clean, dust-free and protected against water ingress.",
              "Leak detection, drainage, bunding, drip trays and water-containment measures confirmed.",
              "Fire barriers, smoke compartments, rated penetrations and firestopping certified & labelled.",
              "Earthing, bonding and equipotential connections support approved electrical functional design.",
            ].map((text, idx) => (
              <tr key={idx} className="border-b border-black">
                <td className="border-r border-black p-1 text-center font-bold">{idx + 1}</td>
                <td className="border-r border-black p-1">{text}</td>
                <td className="border-r border-black p-1 text-center font-bold text-emerald-800">✓</td>
                <td className="border-r border-black p-1 text-center">—</td>
                <td className="border-r border-black p-1 text-center">—</td>
                <td className="border-r border-black p-1 text-center">—</td>
                <td className="p-1 italic text-slate-600">Dual-path segregation checked</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Section G: Supporting Evidence & Attachments */}
      <div>
        <div className="bg-slate-200 border-2 border-black px-2 py-1 font-bold text-[11px] uppercase tracking-wide">
          G. SUPPORTING EVIDENCE AND ATTACHMENTS
        </div>
        <div className="border-2 border-t-0 border-black p-2 text-xs">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10.5px]">
            <label className="flex items-center gap-1 font-semibold"><input type="checkbox" defaultChecked /> Approved Drawings</label>
            <label className="flex items-center gap-1 font-semibold"><input type="checkbox" defaultChecked /> Inspection Photos</label>
            <label className="flex items-center gap-1 font-semibold"><input type="checkbox" defaultChecked /> Test Reports</label>
            <label className="flex items-center gap-1 font-semibold"><input type="checkbox" defaultChecked /> Material Delivery Records</label>
            <label className="flex items-center gap-1"><input type="checkbox" /> Calibration Certs</label>
            <label className="flex items-center gap-1"><input type="checkbox" /> Permit-to-Work</label>
            <label className="flex items-center gap-1"><input type="checkbox" /> NCR Closure Evidence</label>
            <label className="flex items-center gap-1"><input type="checkbox" /> As-Built Mark-ups</label>
          </div>
        </div>
      </div>

      {/* Section H & I: Outcome & Sign-Off */}
      <div>
        <div className="bg-slate-200 border-2 border-black px-2 py-1 font-bold text-[11px] uppercase tracking-wide">
          H. INSPECTION OUTCOME & I. VERIFICATION SIGN-OFF
        </div>
        <table className="w-full border-2 border-t-0 border-black text-xs border-collapse">
          <tbody>
            <tr className="border-b border-black">
              <td className="p-1.5" colSpan={2}>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold">Inspection Result:</span>
                  <label className="flex items-center gap-1 text-emerald-800 font-bold"><input type="checkbox" defaultChecked /> Accepted</label>
                  <label className="flex items-center gap-1 text-amber-800"><input type="checkbox" /> Accepted with Comments</label>
                  <label className="flex items-center gap-1 text-rose-800"><input type="checkbox" /> Reinspection Required</label>
                </div>
              </td>
            </tr>
            <tr>
              <td className="w-1/2 border-r-2 border-black p-2 align-top">
                <div className="font-bold text-[10.5px] uppercase text-slate-600 border-b border-black pb-1 mb-1">
                  Consultant (RE / RA) — Reviewed & Recommended
                </div>
                <div className="text-xs space-y-0.5">
                  <div>Name: Ir. Ahmad Faris</div>
                  <div>Position: Resident Engineer (C&S / MEP)</div>
                  <div>Signature & Date: Signed · {formData.dateSubmitted}</div>
                </div>
              </td>
              <td className="w-1/2 p-2 align-top">
                <div className="font-bold text-[10.5px] uppercase text-slate-600 border-b border-black pb-1 mb-1">
                  PMC — Reviewed, Acknowledged & Approved
                </div>
                <div className="text-xs space-y-0.5">
                  <div>Name: Ir. Ts. Mohd Khairul</div>
                  <div>Position: PMC Quality Director</div>
                  <div>Signature & Date: Approved · {formData.dateSubmitted}</div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
