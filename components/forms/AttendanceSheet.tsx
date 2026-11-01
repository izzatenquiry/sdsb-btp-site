import React from 'react';
import { OfficialFormHeader } from './OfficialFormHeader';

export function AttendanceSheet({
  formData,
}: {
  formData?: any;
  setFormData?: (val: any) => void;
}) {
  const attendanceList = [
    { no: '01', name: 'Ir. Dr. K. Nathan', org: 'C&S Consulting Engineers', role: 'Resident Engineer (Lead)', contact: '+60 12-389 4410', sig: 'K. Nathan' },
    { no: '02', name: 'Marcus Tan', org: 'Turner International', role: 'Senior QA/QC Manager (PMC)', contact: '+60 16-224 8901', sig: 'Marcus T.' },
    { no: '03', name: 'Derrick Wong', org: 'DayOne Data Center', role: 'Owner Quality Representative', contact: '+60 12-401 5532', sig: 'D. Wong' },
    { no: '04', name: 'Irfan Hazim', org: 'BTP GC Consortium', role: 'QA/QC Lead Manager', contact: '+60 19-338 1204', sig: 'Irfan H.' },
    { no: '05', name: 'Ahmad Faiz', org: 'BTP GC Consortium', role: 'Civil QA/QC Inspector', contact: '+60 17-640 9812', sig: 'A. Faiz' },
    { no: '06', name: 'Siti Aminah', org: 'Turner International', role: 'QA/QC Engineer (PMC)', contact: '+60 13-902 4478', sig: 'Siti A.' },
    { no: '07', name: 'Lee Chun Hou', org: 'Geotech Testing Labs', role: 'Independent Testing Engineer (ITA)', contact: '+60 12-555 7712', sig: 'Lee C.H.' },
    { no: '08', name: 'Rajesh Sharma', org: 'BTP GC Consortium', role: 'Site Agent - Substructure', contact: '+60 14-880 2311', sig: 'R. Sharma' },
    { no: '09', name: 'Muhamad Zaki', org: 'C&S Consulting Engineers', role: 'Inspector of Works (Civil)', contact: '+60 19-722 0041', sig: 'M. Zaki' },
    { no: '10', name: 'Nurul Huda', org: 'BTP GC Consortium', role: 'Document Controller', contact: '+60 11-209 8834', sig: 'N. Huda' },
    { no: '11', name: '', org: '', role: '', contact: '', sig: '' },
    { no: '12', name: '', org: '', role: '', contact: '', sig: '' },
    { no: '13', name: '', org: '', role: '', contact: '', sig: '' },
    { no: '14', name: '', org: '', role: '', contact: '', sig: '' },
    { no: '15', name: '', org: '', role: '', contact: '', sig: '' },
    { no: '16', name: '', org: '', role: '', contact: '', sig: '' },
  ];

  return (
    <div className="space-y-3 font-sans leading-tight">
      <OfficialFormHeader
        title="PROJECT ATTENDANCE FORM"
        projectName={formData?.projectName || "SDSB · BANTING TECHNOLOGY PARK (BTP)"}
        docNo="BTP-QAQC-REG-FRM-001"
        revision="Rev 02"
        date="14.07.2026"
      />

      {/* SECTION A. ATTENDANCE DETAILS */}
      <div className="mb-3 border border-slate-700">
        <div className="bg-slate-800 text-white px-2 py-1 font-bold text-[10px] tracking-wider">
          A. ATTENDANCE DETAILS
        </div>
        <table className="w-full border-collapse text-[9.5px]">
          <tbody>
            <tr className="border-b border-slate-300">
              <td className="w-[18%] bg-slate-100 p-1.5 font-bold border-r border-slate-300">Project Name:</td>
              <td className="w-[42%] p-1.5 font-semibold border-r border-slate-300">SDSB · BANTING TECHNOLOGY PARK (BTP)</td>
              <td className="w-[18%] bg-slate-100 p-1.5 font-bold border-r border-slate-300">Location / Venue:</td>
              <td className="w-[22%] p-1.5 font-medium">Site Meeting Room 1 / Hybrid Teams</td>
            </tr>
            <tr className="border-b border-slate-300">
              <td className="bg-slate-100 p-1.5 font-bold border-r border-slate-300">Date:</td>
              <td className="p-1.5 border-r border-slate-300">14 July 2026</td>
              <td className="bg-slate-100 p-1.5 font-bold border-r border-slate-300">Time:</td>
              <td className="p-1.5">09:30 AM - 11:30 AM (MYT)</td>
            </tr>
            <tr>
              <td className="bg-slate-100 p-1.5 font-bold border-r border-slate-300">Activity / Meeting / Training:</td>
              <td colSpan={3} className="p-1.5 font-medium">
                Bi-Weekly Quality Coordination Meeting #14 & Piling Integrity Quality Hold Point Alignment
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* SECTION B. ATTENDANCE REGISTER */}
      <div className="mb-3 border border-slate-700">
        <div className="bg-slate-800 text-white px-2 py-1 font-bold text-[10px] tracking-wider">
          B. ATTENDANCE REGISTER
        </div>
        <table className="w-full border-collapse text-[9px]">
          <thead>
            <tr className="bg-slate-200 border-b border-slate-700 text-center font-bold">
              <th className="p-1.5 border-r border-slate-400 w-[35px]">No.</th>
              <th className="p-1.5 border-r border-slate-400 w-[180px] text-left">Name</th>
              <th className="p-1.5 border-r border-slate-400 w-[160px] text-left">Organization</th>
              <th className="p-1.5 border-r border-slate-400 w-[170px] text-left">Designation</th>
              <th className="p-1.5 border-r border-slate-400 w-[110px] text-left">Contact No.</th>
              <th className="p-1.5 w-[90px] text-center">Signature</th>
            </tr>
          </thead>
          <tbody>
            {attendanceList.map((row, idx) => (
              <tr key={idx} className={`border-b border-slate-300 ${idx % 2 === 1 ? 'bg-slate-50' : ''}`}>
                <td className="p-1.5 text-center border-r border-slate-300">{row.no}</td>
                <td className="p-1.5 border-r border-slate-300 font-semibold">{row.name}</td>
                <td className="p-1.5 border-r border-slate-300 text-slate-700">{row.org}</td>
                <td className="p-1.5 border-r border-slate-300 text-slate-700">{row.role}</td>
                <td className="p-1.5 border-r border-slate-300 text-[8.5px]">{row.contact}</td>
                <td className="p-1.5 text-center italic text-blue-900 text-xs">
                  {row.sig}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* SECTION C. RECORDING & VERIFICATION */}
      <table className="w-full border-collapse border border-slate-700 text-[8.5px]">
        <thead>
          <tr className="bg-slate-200 font-bold border-b border-slate-700">
            <th className="p-1 border-r border-slate-400 w-1/2 text-left">RECORDED & COMPILED BY</th>
            <th className="p-1 w-1/2 text-left">VERIFIED BY PMC (TURNER)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="p-2 border-r border-slate-400">
              <div className="h-6 border-b border-dashed border-slate-300 mb-1 flex items-end italic text-blue-900 text-xs">Nurul Huda</div>
              <div className="font-bold">Name: Nurul Huda</div>
              <div>Designation: QA/QC Document Controller (GC)</div>
              <div>Date: 14.07.2026</div>
            </td>
            <td className="p-2">
              <div className="h-6 border-b border-dashed border-slate-300 mb-1 flex items-end italic text-slate-900 text-xs">Marcus Tan</div>
              <div className="font-bold">Name: Marcus Tan</div>
              <div>Designation: Senior QA/QC Manager (PMC)</div>
              <div>Date: 14.07.2026</div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
