import React from 'react';
import { OfficialFormHeader } from './OfficialFormHeader';

export function PilSheet({
  formData,
}: {
  formData?: any;
  setFormData?: (val: any) => void;
}) {
  const pilingRows = [
    {
      no: '1', id: 'BP-A-001', block: 'Block A', grid: 'Grid A1', type: 'Bored Pile', size: '600 mm dia',
      desDepth: '32.0 m', actDepth: '32.4 m', date: '01.07.2026', slump: '180 mm',
      actVol: '9.8 m³', overbreak: '+8.2%', cube28: '42.5 MPa', pit: 'Category A', pda: '3,850 kN', status: 'Accepted', accRef: 'ACC-PIL-001'
    },
    {
      no: '2', id: 'BP-A-002', block: 'Block A', grid: 'Grid A2', type: 'Bored Pile', size: '600 mm dia',
      desDepth: '32.0 m', actDepth: '32.2 m', date: '02.07.2026', slump: '175 mm',
      actVol: '9.6 m³', overbreak: '+6.1%', cube28: '43.1 MPa', pit: 'Category A', pda: '-', status: 'Accepted', accRef: 'ACC-PIL-002'
    },
    {
      no: '3', id: 'BP-A-003', block: 'Block A', grid: 'Grid A3', type: 'Bored Pile', size: '600 mm dia',
      desDepth: '30.0 m', actDepth: '30.5 m', date: '03.07.2026', slump: '185 mm',
      actVol: '9.1 m³', overbreak: '+7.3%', cube28: 'Pending 28d', pit: 'Category A', pda: '-', status: 'In Progress', accRef: 'ACC-PIL-003'
    },
    {
      no: '4', id: 'BP-A-004', block: 'Block A', grid: 'Grid A4', type: 'Bored Pile', size: '600 mm dia',
      desDepth: '30.0 m', actDepth: '30.1 m', date: '05.07.2026', slump: '170 mm',
      actVol: '8.9 m³', overbreak: '+4.8%', cube28: 'Pending 28d', pit: 'Scheduled', pda: '4,100 kN', status: 'Tested', accRef: 'ACC-PIL-004'
    },
    {
      no: '5', id: 'BP-B-001', block: 'Block B', grid: 'Grid B1', type: 'Bored Pile', size: '800 mm dia',
      desDepth: '36.0 m', actDepth: '-', date: '-', slump: '-',
      actVol: '-', overbreak: '-', cube28: '-', pit: '-', pda: '-', status: 'Planned', accRef: 'ACC-PIL-005'
    },
    {
      no: '6', id: 'BP-B-002', block: 'Block B', grid: 'Grid B2', type: 'Bored Pile', size: '800 mm dia',
      desDepth: '36.0 m', actDepth: '-', date: '-', slump: '-',
      actVol: '-', overbreak: '-', cube28: '-', pit: '-', pda: '-', status: 'Planned', accRef: 'ACC-PIL-006'
    },
    {
      no: '7', id: 'BP-B-003', block: 'Block B', grid: 'Grid B3', type: 'Bored Pile', size: '800 mm dia',
      desDepth: '36.0 m', actDepth: '-', date: '-', slump: '-',
      actVol: '-', overbreak: '-', cube28: '-', pit: '-', pda: '-', status: 'Planned', accRef: 'ACC-PIL-007'
    },
    {
      no: '8', id: 'BP-B-004', block: 'Block B', grid: 'Grid B4', type: 'Bored Pile', size: '800 mm dia',
      desDepth: '36.0 m', actDepth: '-', date: '-', slump: '-',
      actVol: '-', overbreak: '-', cube28: '-', pit: '-', pda: '-', status: 'Planned', accRef: 'ACC-PIL-008'
    },
  ];

  return (
    <div className="space-y-3 font-sans leading-tight">
      <OfficialFormHeader
        title="PILING RECORDS DASHBOARD & QUALITY TRACKER"
        projectName={formData?.projectName || "SDSB · BANTING TECHNOLOGY PARK (BTP)"}
        docNo="BTP-QAQC-DASH-PIL-001"
        revision="Rev 01"
        date="08.07.2026"
      />

      {/* KPI Cards Section */}
      <div className="grid grid-cols-4 gap-2 mb-3">
        <div className="p-2 border border-blue-200 bg-blue-50 rounded">
          <div className="text-[8px] font-bold uppercase tracking-wider text-blue-800">Planned Piles</div>
          <div className="text-xl font-bold text-blue-950 mt-0.5">8 <span className="text-[9px] font-normal text-slate-600">Total</span></div>
          <div className="text-[8px] text-slate-600 mt-0.5">Baseline Scope Total</div>
        </div>
        <div className="p-2 border border-emerald-200 bg-emerald-50 rounded">
          <div className="text-[8px] font-bold uppercase tracking-wider text-emerald-800">Installed / Tested</div>
          <div className="text-xl font-bold text-emerald-950 mt-0.5">4 <span className="text-[9px] font-normal text-emerald-700">(50.0%)</span></div>
          <div className="text-[8px] text-slate-600 mt-0.5">Bored & Cast to Date</div>
        </div>
        <div className="p-2 border border-indigo-200 bg-indigo-50 rounded">
          <div className="text-[8px] font-bold uppercase tracking-wider text-indigo-800">Accepted / Closed</div>
          <div className="text-xl font-bold text-indigo-950 mt-0.5">4 <span className="text-[9px] font-normal text-indigo-700">Verified</span></div>
          <div className="text-[8px] text-slate-600 mt-0.5">Consultant Signed-off</div>
        </div>
        <div className="p-2 border border-amber-200 bg-amber-50 rounded">
          <div className="text-[8px] font-bold uppercase tracking-wider text-amber-800">Pending Cutting / Pile Cap</div>
          <div className="text-xl font-bold text-amber-950 mt-0.5">4 <span className="text-[9px] font-normal text-amber-700">Piles</span></div>
          <div className="text-[8px] text-slate-600 mt-0.5">Head Treatment Stage</div>
        </div>
      </div>

      {/* Main Piling Register Table */}
      <div className="mb-3 border border-slate-700">
        <div className="bg-slate-800 text-white px-2 py-1 font-bold text-[10px] tracking-wider flex justify-between items-center">
          <span>PILING MASTER RECORD REGISTER - BORED PILES</span>
          <span className="text-[8px] text-slate-300">Live ACC Synced: 31.10.2026</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[8px]">
            <thead>
              <tr className="bg-slate-200 border-b border-slate-700 text-center font-bold">
                <th className="p-1 border-r border-slate-400 w-[24px]">No.</th>
                <th className="p-1 border-r border-slate-400 w-[60px]">Pile ID</th>
                <th className="p-1 border-r border-slate-400 w-[55px]">Location</th>
                <th className="p-1 border-r border-slate-400 w-[55px]">Dia</th>
                <th className="p-1 border-r border-slate-400 w-[50px]">Installed</th>
                <th className="p-1 border-r border-slate-400 w-[55px]">Date Cast</th>
                <th className="p-1 border-r border-slate-400 w-[45px]">Slump</th>
                <th className="p-1 border-r border-slate-400 w-[50px]">Overbreak</th>
                <th className="p-1 border-r border-slate-400 w-[60px]">Cube (28d)</th>
                <th className="p-1 border-r border-slate-400 w-[60px]">PIT Test</th>
                <th className="p-1 border-r border-slate-400 w-[55px]">PDA Test</th>
                <th className="p-1 border-r border-slate-400 w-[60px]">Status</th>
                <th className="p-1 w-[70px]">ACC Ref</th>
              </tr>
            </thead>
            <tbody>
              {pilingRows.map((row, idx) => (
                <tr key={idx} className={`border-b border-slate-300 text-center ${idx % 2 === 1 ? 'bg-slate-50' : ''}`}>
                  <td className="p-1 border-r border-slate-300">{row.no}</td>
                  <td className="p-1 border-r border-slate-300 font-bold text-blue-900">{row.id}</td>
                  <td className="p-1 border-r border-slate-300">{row.grid}</td>
                  <td className="p-1 border-r border-slate-300">{row.size}</td>
                  <td className="p-1 border-r border-slate-300">{row.actDepth}</td>
                  <td className="p-1 border-r border-slate-300">{row.date}</td>
                  <td className="p-1 border-r border-slate-300">{row.slump}</td>
                  <td className="p-1 border-r border-slate-300">{row.overbreak}</td>
                  <td className="p-1 border-r border-slate-300">{row.cube28}</td>
                  <td className="p-1 border-r border-slate-300 font-semibold">{row.pit}</td>
                  <td className="p-1 border-r border-slate-300">{row.pda}</td>
                  <td className="p-1 border-r border-slate-300">
                    <span className={`px-1 py-0.5 rounded text-[7.5px] font-bold ${
                      row.status === 'Accepted' ? 'bg-emerald-100 text-emerald-800' :
                      row.status === 'In Progress' ? 'bg-amber-100 text-amber-800' :
                      row.status === 'Tested' ? 'bg-blue-100 text-blue-800' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="p-1 text-[7.5px] text-slate-600">{row.accRef}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pile Head Cut-off & Integrity Status */}
      <div className="grid grid-cols-2 gap-2 mb-3 text-[8.5px]">
        <div className="p-2 border border-slate-300 rounded bg-slate-50">
          <div className="font-bold text-slate-800 border-b border-slate-300 pb-1 mb-1">
            Pile Head Cutting & Rebar Projection Status
          </div>
          <div className="space-y-1 text-slate-700">
            <div className="flex justify-between"><span>Design Cut-off Level:</span><span className="font-bold">+18.450 mRL</span></div>
            <div className="flex justify-between"><span>Cutting Method:</span><span>Hydraulic Pile Breaker / Mechanical Chipping</span></div>
            <div className="flex justify-between"><span>Rebar Starter Bar Length:</span><span className="font-bold">1,200 mm (40d Lap length)</span></div>
            <div className="flex justify-between"><span>Debonding Tube Length:</span><span>750 mm (Polyfoam sleeve)</span></div>
            <div className="flex justify-between"><span>Sound Concrete Verified:</span><span className="text-emerald-700 font-bold">Passed Visual & Chipping Audit</span></div>
          </div>
        </div>

        <div className="p-2 border border-slate-300 rounded bg-slate-50">
          <div className="font-bold text-slate-800 border-b border-slate-300 pb-1 mb-1">
            Integrity & Load Test Summary (ITA Governance)
          </div>
          <div className="space-y-1 text-slate-700">
            <div className="flex justify-between"><span>Low Strain PIT Scope:</span><span className="font-bold">100% of Cast Piles (ASTM D5882)</span></div>
            <div className="flex justify-between"><span>PIT Results:</span><span className="text-emerald-700 font-bold">4 of 4 Category A (Sound)</span></div>
            <div className="flex justify-between"><span>PDA High Strain Testing:</span><span className="font-bold">2 Piles Selected (ASTM D4945)</span></div>
            <div className="flex justify-between"><span>Ultimate Capacity Verified:</span><span className="font-bold">&gt; 3,850 kN (Factor of Safety &gt; 2.2)</span></div>
            <div className="flex justify-between"><span>Independent Lab:</span><span>Geotechnical Testing Laboratory (SAMM Accr.)</span></div>
          </div>
        </div>
      </div>

      {/* Endorsements */}
      <table className="w-full border-collapse border border-slate-700 text-[8.5px]">
        <thead>
          <tr className="bg-slate-200 font-bold border-b border-slate-700">
            <th className="p-1 border-r border-slate-400 w-1/3 text-left">PILING SPECIALIST / GC</th>
            <th className="p-1 border-r border-slate-400 w-1/3 text-left">CONSULTANT (GEOTECH RE)</th>
            <th className="p-1 w-1/3 text-left">PMC (TURNER) QUALITY LEAD</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="p-2 border-r border-slate-400 align-top">
              <div className="h-6 border-b border-dashed border-slate-300 mb-1 flex items-end italic text-blue-900 text-xs">Ahmad Faiz</div>
              <div className="font-bold">Name: Ahmad Faiz</div>
              <div>Designation: QA/QC Site Inspector</div>
              <div>Date: 08.07.2026</div>
            </td>
            <td className="p-2 border-r border-slate-400 align-top">
              <div className="h-6 border-b border-dashed border-slate-300 mb-1 flex items-end italic text-slate-900 text-xs">Ir. Dr. K. Nathan</div>
              <div className="font-bold">Name: Ir. Dr. K. Nathan, PE</div>
              <div>Designation: Lead Geotechnical RE</div>
              <div>Date: 09.07.2026</div>
            </td>
            <td className="p-2 align-top">
              <div className="h-6 border-b border-dashed border-slate-300 mb-1 flex items-end italic text-slate-900 text-xs">Marcus Tan</div>
              <div className="font-bold">Name: Marcus Tan</div>
              <div>Designation: Senior QA/QC Manager (PMC)</div>
              <div>Date: 10.07.2026</div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
