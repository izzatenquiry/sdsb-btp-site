import React from "react";

export function OfficialFormHeader({
  title,
  projectName = "SDSB · BANTING TECHNOLOGY PARK (BTP)",
  docNo,
  revision = "Rev 02",
  date = "14.07.2026",
}: {
  title: string;
  projectName?: string;
  docNo: string;
  revision?: string;
  date?: string;
}) {
  return (
    <table className="w-full border-2 border-black border-collapse table-fixed bg-white text-black mb-2 font-sans">
      <tbody>
        <tr>
          {/* Left Cell: SDSB Logo */}
          <td className="w-[18%] border-r-2 border-black p-1.5 text-center align-middle bg-white">
            <div className="flex items-center justify-center">
              <img
                src="/logo/SDSB.png"
                alt="SDSB"
                className="max-h-11 w-auto max-w-[90px] object-contain"
              />
            </div>
          </td>

          {/* Center Cell: Form Title & Project Details */}
          <td className="w-[58%] border-r-2 border-black px-2.5 py-1 text-center align-middle bg-white">
            <h1 className="font-extrabold text-sm sm:text-base uppercase tracking-wide leading-tight text-slate-950 m-0">
              {title}
            </h1>
            <div className="font-bold text-xs text-slate-800 mt-0.5 tracking-wider">
              {projectName}
            </div>
            <div className="text-[9.5px] text-slate-600 mt-0.5">
              Doc No.: {docNo} | Rev: {revision} | Date: {date}
            </div>
          </td>

          {/* Right Cell: Turner then DAYONE Logos */}
          <td className="w-[24%] p-1.5 text-center align-middle bg-white">
            <div className="flex items-center justify-center gap-2">
              <img
                src="/logo/TURNER.png"
                alt="Turner"
                className="max-h-6 max-w-[70px] w-auto object-contain shrink-0"
              />
              <img
                src="/logo/DAYONE.png"
                alt="DayOne"
                className="max-h-7 max-w-[85px] w-auto object-contain shrink-0"
              />
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  );
}
