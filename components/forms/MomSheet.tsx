import React from "react";
import { OfficialFormHeader } from "./OfficialFormHeader";

export function MomSheet({
  formData,
}: {
  formData: any;
  setFormData?: (val: any) => void;
}) {
  const actionItems = [
    {
      item: "1.0",
      topic: "ACC Synchronization & 22 Master Registers Live Tracking",
      action: "DAMIA (Document Controller) to reconcile all pending RFWI inspections, cube test breaks and material submissions against ACC daily by 5:00 PM.",
      pic: "DAMIA (SDSB)",
      due: "Ongoing Daily",
      status: "In Progress",
    },
    {
      item: "2.0",
      topic: "Block A Data Hall Heavy Floor Slab Cube Test Verification",
      action: "Submit accredited third-party lab compression strength certificates (7-day and 28-day) for Level 1 concrete pours 14 to 18.",
      pic: "QA/QC Engineer (SDSB)",
      due: "05.11.2026",
      status: "Open",
    },
    {
      item: "3.0",
      topic: "Non-Conformance Closure — Shear Wall SW-02 Honeycombing",
      action: "Execute approved patch repair method with non-shrink structural grout and conduct joint re-inspection with R.E. for formal closure.",
      pic: "Site Agent / QAQC",
      due: "03.11.2026",
      status: "Open",
    },
    {
      item: "4.0",
      topic: "Material Submittal Approval (MAF) — Busway & Critical MEP Feeder Cables",
      action: "Provide updated SIRIM test certificates, factory audit reports and manufacturer warranty letters for 2000A busduct trunking.",
      pic: "MEP Subcon / SDSB",
      due: "08.11.2026",
      status: "Open",
    },
    {
      item: "5.0",
      topic: "Piling Set Records & Static Load Test Readiness for Substation Zone",
      action: "Complete pile cutting to cut-off level and prepare kentledge reaction frame for 250-ton ultimate static load test.",
      pic: "Piling Contractor",
      due: "10.11.2026",
      status: "Open",
    },
  ];

  return (
    <div className="space-y-3 font-sans leading-tight">
      <OfficialFormHeader
        title="MINUTES OF MEETING (MOM)"
        projectName={formData.projectName || "SDSB · BANTING TECHNOLOGY PARK (BTP)"}
        docNo="BTP-QAQC-TPL-MOM-001"
        revision="Rev 02"
        date="14.07.2026"
      />

      {/* Section A: Meeting Details */}
      <div>
        <div className="bg-slate-200 border-2 border-black px-2 py-1 font-bold text-[11px] uppercase tracking-wide">
          A. MEETING DETAILS
        </div>
        <table className="w-full border-2 border-t-0 border-black text-xs border-collapse">
          <tbody>
            <tr className="border-b border-black">
              <td className="w-1/4 bg-slate-50 p-1.5 font-bold border-r border-black">Meeting Title:</td>
              <td className="w-1/4 p-1.5 border-r border-black font-semibold">{formData.meetingTitle || "Weekly QA/QC & Technical Coordination Meeting"}</td>
              <td className="w-1/4 bg-slate-50 p-1.5 font-bold border-r border-black">Meeting No.:</td>
              <td className="w-1/4 p-1.5 font-bold text-blue-950">{formData.meetingNo || "BTP-QAQC-MOM-014"}</td>
            </tr>
            <tr className="border-b border-black">
              <td className="bg-slate-50 p-1.5 font-bold border-r border-black">Date & Time:</td>
              <td className="p-1.5 border-r border-black">{formData.dateSubmitted} · {formData.meetingTime || "10:00 AM - 12:00 PM"}</td>
              <td className="bg-slate-50 p-1.5 font-bold border-r border-black">Chairperson:</td>
              <td className="p-1.5 font-semibold">{formData.chairperson || "Ir. Ts. Mohd Khairul (PMC Quality Lead)"}</td>
            </tr>
            <tr>
              <td className="bg-slate-50 p-1.5 font-bold border-r border-black">Location / Platform:</td>
              <td className="p-1.5 border-r border-black">BTP Site Office Main Meeting Room & MS Teams</td>
              <td className="bg-slate-50 p-1.5 font-bold border-r border-black">Prepared by:</td>
              <td className="p-1.5">DAMIA (Document Controller)</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Section B: Attendance Summary */}
      <div>
        <div className="bg-slate-200 border-2 border-black px-2 py-1 font-bold text-[11px] uppercase tracking-wide">
          B. ATTENDANCE & APOLOGIES
        </div>
        <table className="w-full border-2 border-t-0 border-black text-[10.5px] border-collapse">
          <tbody>
            <tr className="border-b border-black">
              <td className="w-1/4 bg-slate-50 p-1 font-bold border-r border-black">PMC (Turner / DayOne):</td>
              <td className="p-1 border-r border-black" colSpan={3}>Ir. Ts. Mohd Khairul (Quality Director), En. Razak (Senior Auditor), Ms. Cheryl (EHS Lead)</td>
            </tr>
            <tr className="border-b border-black">
              <td className="bg-slate-50 p-1 font-bold border-r border-black">Supervising Consultant:</td>
              <td className="p-1 border-r border-black" colSpan={3}>Ir. Ahmad Faris (Resident Engineer C&S), En. Lukman (Resident Engineer MEP)</td>
            </tr>
            <tr className="border-b border-black">
              <td className="bg-slate-50 p-1 font-bold border-r border-black">General Contractor (SDSB):</td>
              <td className="p-1 border-r border-black" colSpan={3}>DAMIA (Document Controller), Mr. Tan Wei Lun (Project Manager), Mr. Kenneth (QA/QC Lead)</td>
            </tr>
            <tr>
              <td className="bg-slate-50 p-1 font-bold border-r border-black">Apologies / Absent:</td>
              <td className="p-1 text-slate-500 italic" colSpan={3}>Structural Design Consultant Representative (Leave)</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Section C: Discussion and Action Tracker */}
      <div>
        <div className="bg-slate-200 border-2 border-black px-2 py-1 font-bold text-[11px] uppercase tracking-wide">
          C. DISCUSSION AND ACTION TRACKER
        </div>
        <table className="w-full border-2 border-t-0 border-black text-[9.5px] border-collapse">
          <thead>
            <tr className="bg-slate-100 border-b border-black text-center font-bold">
              <th className="w-8 border-r border-black p-1">Item</th>
              <th className="w-48 border-r border-black p-1 text-left">Topic / Discussion / Previous Action Update</th>
              <th className="border-r border-black p-1 text-left">Action Required / Specific Deliverable</th>
              <th className="w-24 border-r border-black p-1">Owner</th>
              <th className="w-20 border-r border-black p-1">Target Date</th>
              <th className="w-16 p-1">Status</th>
            </tr>
          </thead>
          <tbody>
            {actionItems.map((item) => (
              <tr key={item.item} className="border-b border-black align-top">
                <td className="border-r border-black p-1 text-center font-bold">{item.item}</td>
                <td className="border-r border-black p-1 font-semibold">{item.topic}</td>
                <td className="border-r border-black p-1 text-slate-800 leading-snug">{item.action}</td>
                <td className="border-r border-black p-1 text-center font-medium">{item.pic}</td>
                <td className="border-r border-black p-1 text-center text-[9.5px]">{item.due}</td>
                <td className="p-1 text-center font-bold text-amber-700">{item.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Section D: Meeting Close-out */}
      <div>
        <div className="bg-slate-200 border-2 border-black px-2 py-1 font-bold text-[11px] uppercase tracking-wide">
          D. MEETING CLOSE-OUT
        </div>
        <table className="w-full border-2 border-t-0 border-black text-xs border-collapse">
          <tbody>
            <tr className="border-b border-black">
              <td className="w-1/4 bg-slate-50 p-1.5 font-bold border-r border-black">Key Decisions / Escalations:</td>
              <td className="p-1.5" colSpan={3}>
                All trades reminded that zero backdating policy is strictly enforced in ACC. RFWIs must be issued 24 hours prior to inspection.
              </td>
            </tr>
            <tr className="border-b border-black">
              <td className="bg-slate-50 p-1.5 font-bold border-r border-black">Next Meeting:</td>
              <td className="p-1.5" colSpan={3}>
                07.11.2026 (Saturday) at 10:00 AM · BTP Site Office Main Meeting Room
              </td>
            </tr>
            <tr>
              <td className="w-1/2 border-r-2 border-black p-2 align-top" colSpan={2}>
                <div className="font-bold text-[10px] uppercase text-slate-600 border-b border-black pb-0.5 mb-1">
                  Recorded by (GC Document Controller):
                </div>
                <div className="text-[11px] space-y-0.5">
                  <div>Name: DAMIA</div>
                  <div>Signature & Date: Signed · {formData.dateSubmitted}</div>
                </div>
              </td>
              <td className="w-1/2 p-2 align-top" colSpan={2}>
                <div className="font-bold text-[10px] uppercase text-slate-600 border-b border-black pb-0.5 mb-1">
                  Endorsed by (PMC Quality Director):
                </div>
                <div className="text-[11px] space-y-0.5">
                  <div>Name: Ir. Ts. Mohd Khairul</div>
                  <div>Signature & Date: Endorsed · {formData.dateSubmitted}</div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
