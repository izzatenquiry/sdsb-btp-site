import React from "react";
import { OfficialFormHeader } from "./OfficialFormHeader";

export function RaSheet({
  formData,
}: {
  formData: any;
  setFormData?: (val: any) => void;
}) {
  const hazardRows = [
    {
      seq: "1.0",
      activity: "Survey setting out & site access verification",
      hazard: "Trips, uneven ground, slips into trenches, moving construction traffic",
      existing: "Demarcated walkway, high-visibility vest, banksman escort, trench edge barricading",
      initS: 3, initL: 3, initR: 9, // Medium
      controls: "Maintain illuminated safe access, enforce reverse parking, implement daily briefing",
      resS: 3, resL: 1, resR: 3, // Low
      pic: "GC Site Engineer",
    },
    {
      seq: "2.0",
      activity: "Heavy lifting of rebar bundles & formwork by crane",
      hazard: "Falling loads, rigging failure, crane overturn, contact with overhead hazards",
      existing: "Certified crane (PMA), certified rigger & signalman, lifting gear tagged and inspected",
      initS: 5, initL: 3, initR: 15, // High
      controls: "Exclude personnel from lifting radius, enforce taglines, verify ground outrigger bearing pads",
      resS: 4, resL: 1, resR: 4, // Low
      pic: "GC Lifting Supervisor",
    },
    {
      seq: "3.0",
      activity: "Work at height on falsework, shoring & formwork erection",
      hazard: "Falls from height, falling objects, structural collapse of unbraced falsework",
      existing: "Full body harness 100% tied off, perimeter safety mesh, PE approved falsework design",
      initS: 4, initL: 4, initR: 16, // High
      controls: "Green scaftag inspection before each shift, toe boards, secure tool lanyards",
      resS: 4, resL: 1, resR: 4, // Low
      pic: "GC Scaffolding Supervisor",
    },
    {
      seq: "4.0",
      activity: "Concrete pumping, placing & vibrator compaction",
      hazard: "High-pressure hose whip, chemical burn from wet cement, electrical shock from vibrator",
      existing: "Safety whip-checks on pipe couplings, rubber safety boots, nitrile gloves, 110V/ELCB vibrator",
      initS: 3, initL: 3, initR: 9, // Medium
      controls: "Daily pipeline pressure test, certified pump operator, eyewash station ready on site",
      resS: 2, resL: 1, resR: 2, // Low
      pic: "GC Concreting Foreman",
    },
  ];

  return (
    <div className="space-y-3 font-sans leading-tight">
      <OfficialFormHeader
        title="EHS RISK ASSESSMENT (RA) FORM"
        projectName={formData.projectName || "SDSB · BANTING TECHNOLOGY PARK (BTP)"}
        docNo="BTP-EHS-TPL-RA-001"
        revision="Rev 02"
        date="14.07.2026"
      />

      {/* RA Identification Details */}
      <table className="w-full border-2 border-black text-xs border-collapse">
        <tbody>
          <tr className="border-b border-black">
            <td className="w-1/4 bg-slate-50 p-1.5 font-bold border-r border-black">PROJECT NAME:</td>
            <td className="w-1/4 p-1.5 border-r border-black font-semibold">Banting Technology Park (BTP)</td>
            <td className="w-1/4 bg-slate-50 p-1.5 font-bold border-r border-black">RA NO.:</td>
            <td className="w-1/4 p-1.5 font-bold text-blue-950">{formData.refNo || "BTP-EHS-RA-0001"}</td>
          </tr>
          <tr className="border-b border-black">
            <td className="bg-slate-50 p-1.5 font-bold border-r border-black">TASK / ACTIVITY:</td>
            <td className="p-1.5 border-r border-black font-semibold" colSpan={3}>
              {formData.activity || "Risk Assessment for Structural Concrete, Falsework, Rebar & High Elevation Pours"}
            </td>
          </tr>
          <tr>
            <td className="bg-slate-50 p-1.5 font-bold border-r border-black">LOCATION:</td>
            <td className="p-1.5 border-r border-black">{formData.location || "Block A Data Centre Facility"}</td>
            <td className="bg-slate-50 p-1.5 font-bold border-r border-black">DATE & REV:</td>
            <td className="p-1.5">{formData.dateSubmitted} · Rev 02</td>
          </tr>
        </tbody>
      </table>

      {/* Risk Rating Matrices Guide matching official template */}
      <div className="border-2 border-black bg-slate-50 p-2 text-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-300 pb-1 mb-1.5 text-[10px] font-bold">
          <span>RISK MATRIX: SEVERITY (1-5) × LIKELIHOOD (1-5) = RISK SCORE (1-25)</span>
          <div className="flex items-center gap-2">
            <span className="bg-rose-100 text-rose-800 border border-rose-300 px-2 py-0.2 rounded font-bold">15-25: HIGH (Stop Work)</span>
            <span className="bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.2 rounded font-bold">5-12: MEDIUM (Specific Controls)</span>
            <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.2 rounded font-bold">1-4: LOW (Routine Controls)</span>
          </div>
        </div>
      </div>

      {/* Job Hazard Analysis (JHA) Table */}
      <table className="w-full border-2 border-black text-[9px] border-collapse">
        <thead>
          <tr className="bg-slate-100 border-b border-black text-center font-bold">
            <th className="w-6 border-r border-black p-1">No</th>
            <th className="w-24 border-r border-black p-1 text-left">Job Sequence / Step</th>
            <th className="w-40 border-r border-black p-1 text-left">Potential Hazard & Harm</th>
            <th className="border-r border-black p-1 text-left">Existing Risk Controls</th>
            <th className="w-14 border-r border-black p-1">Initial (S×L=R)</th>
            <th className="border-r border-black p-1 text-left">Additional Controls (Hierarchy)</th>
            <th className="w-14 border-r border-black p-1">Residual (S×L=R)</th>
            <th className="w-20 p-1 text-left">Action PIC</th>
          </tr>
        </thead>
        <tbody>
          {hazardRows.map((h, i) => (
            <tr key={i} className="border-b border-black align-top">
              <td className="border-r border-black p-1 text-center font-bold">{h.seq}</td>
              <td className="border-r border-black p-1 font-semibold">{h.activity}</td>
              <td className="border-r border-black p-1 text-rose-900">{h.hazard}</td>
              <td className="border-r border-black p-1 text-slate-700">{h.existing}</td>
              <td className="border-r border-black p-1 text-center font-bold">
                <span className={h.initR >= 15 ? "text-rose-700 font-extrabold" : "text-amber-700"}>
                  {h.initS}×{h.initL}={h.initR}
                </span>
              </td>
              <td className="border-r border-black p-1 text-slate-800">{h.controls}</td>
              <td className="border-r border-black p-1 text-center font-bold text-emerald-800">
                {h.resS}×{h.resL}={h.resR}
              </td>
              <td className="p-1 font-medium">{h.pic}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Review & Endorsement Signatures */}
      <table className="w-full border-2 border-black text-xs border-collapse">
        <tbody>
          <tr>
            <td className="w-1/4 border-r-2 border-black p-1.5 align-top">
              <div className="font-bold text-[10px] uppercase text-slate-600 border-b border-black pb-0.5 mb-1">
                PREPARED BY (GC PIC):
              </div>
              <div className="text-[11px] space-y-0.5">
                <div>Name: DAMIA</div>
                <div>Position: Site Engineer / DC</div>
                <div>Signed: {formData.dateSubmitted}</div>
              </div>
            </td>
            <td className="w-1/4 border-r-2 border-black p-1.5 align-top">
              <div className="font-bold text-[10px] uppercase text-slate-600 border-b border-black pb-0.5 mb-1">
                REVIEWED BY (GC EHS MGR):
              </div>
              <div className="text-[11px] space-y-0.5">
                <div>Name: En. Harun</div>
                <div>Position: EHS Manager</div>
                <div>Signed: {formData.dateSubmitted}</div>
              </div>
            </td>
            <td className="w-1/4 border-r-2 border-black p-1.5 align-top">
              <div className="font-bold text-[10px] uppercase text-slate-600 border-b border-black pb-0.5 mb-1">
                VERIFIED BY (CONSULTANT):
              </div>
              <div className="text-[11px] space-y-0.5">
                <div>Name: Ir. Ahmad Faris</div>
                <div>Position: Resident Engineer</div>
                <div>Signed: {formData.dateSubmitted}</div>
              </div>
            </td>
            <td className="w-1/4 p-1.5 align-top">
              <div className="font-bold text-[10px] uppercase text-slate-600 border-b border-black pb-0.5 mb-1">
                APPROVED BY (PMC / TURNER):
              </div>
              <div className="text-[11px] space-y-0.5">
                <div>Name: Ir. Ts. Mohd Khairul</div>
                <div>Position: Quality & EHS Lead</div>
                <div>Approved in ACC: {formData.dateSubmitted}</div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div className="text-[9.5px] text-slate-500 text-center pt-1">
        BTP Governance Control Standard · Turner & DayOne Zero Harm Protocol. All controls are mandatory on site.
      </div>
    </div>
  );
}
