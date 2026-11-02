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
          {/* Left Cell: SDSB (Shengding) Logo - Centered in box */}
          <td className="w-[18%] border-r-2 border-black p-1.5 text-center align-middle bg-white">
            <div className="flex items-center justify-center w-full h-full min-h-[50px]">
              <img
                src="/logo/SDSB.png"
                alt="SDSB"
                className="max-h-14 w-auto max-w-[105px] object-contain mx-auto block"
              />
            </div>
          </td>

          {/* Center Cell: Form Title & Project Details */}
          <td className="w-[53%] border-r-2 border-black px-2.5 py-1.5 text-center align-middle bg-white">
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

          {/* Right Cell: Turner & DAYONE Logos - Strictly Side-by-Side (Kiri & Kanan, Sebaris) */}
          <td className="w-[30%] px-1.5 py-1 text-center align-middle bg-white">
            <table className="w-full border-collapse border-0 m-0 p-0 table-fixed">
              <tbody>
                <tr className="border-0">
                  <td className="w-1/2 p-0.5 text-center align-middle border-0">
                    <img
                      src="/logo/TURNER.png"
                      alt="Turner"
                      className="h-5 sm:h-5.5 max-w-[80px] w-auto object-contain mx-auto block"
                    />
                  </td>
                  <td className="w-1/2 p-0.5 text-center align-middle border-0">
                    <img
                      src="/logo/DAYONE.png"
                      alt="DayOne"
                      className="h-6 sm:h-6.5 max-w-[85px] w-auto object-contain mx-auto block"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  );
}
