import React from 'react';
import { StationId } from '../../shared/types';

interface ScratchBlockVisualProps {
  stationNo: StationId;
  selectedOption?: 'A' | 'B' | null;
}

export const ScratchBlockVisual: React.FC<ScratchBlockVisualProps> = ({ stationNo }) => {
  // Scratch 3.0 Control color: #FFAB19 (amber/orange), Operators: #59C059 (green), Looks: #9966FF (purple), Motion/Events: #4C97FF (blue)
  return (
    <div className="w-full max-w-xl mx-auto my-3 p-3 bg-slate-900/90 rounded-xl border border-slate-700/80 shadow-inner font-mono text-xs sm:text-sm">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-slate-400 text-xs">
        <span className="flex items-center gap-1.5 font-sans font-semibold text-amber-400">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
          Mô hình khối lệnh Scratch (Bài 14)
        </span>
        <span className="text-[11px] text-slate-400">Điều khiển rẽ nhánh</span>
      </div>

      {stationNo === 1 && (
        <div className="space-y-1">
          {/* if pin >= 50 then */}
          <div className="inline-flex items-center bg-[#FFAB19] text-white px-3 py-1.5 rounded-t-md font-bold text-xs sm:text-sm shadow">
            <span>nếu</span>
            <div className="mx-1.5 px-2 py-0.5 bg-[#59C059] text-white rounded text-[11px] sm:text-xs font-semibold flex items-center gap-1">
              <span>pin</span>
              <span className="font-extrabold">≥</span>
              <span>50 %</span>
            </div>
            <span>thì</span>
          </div>

          <div className="pl-6 border-l-8 border-[#FFAB19] py-1 my-0.5 ml-2">
            <div className="inline-block bg-[#4C97FF] text-white px-3 py-1 rounded text-xs font-medium shadow-sm">
              bật nguồn robot
            </div>
          </div>

          <div className="bg-[#FFAB19] text-white px-3 py-1 rounded-b-md w-24 text-[11px] font-bold text-center">
            {/* cap */}
          </div>
        </div>
      )}

      {stationNo === 2 && (
        <div className="space-y-1">
          <div className="inline-flex items-center bg-[#FFAB19] text-white px-3 py-1.5 rounded-t-md font-bold text-xs sm:text-sm shadow">
            <span>nếu</span>
            <div className="mx-1.5 px-2 py-0.5 bg-[#59C059] text-white rounded text-[11px] sm:text-xs font-semibold">
              thẻ từ hợp lệ?
            </div>
            <span>thì</span>
          </div>

          <div className="pl-6 border-l-8 border-[#FFAB19] py-1 my-0.5 ml-2">
            <div className="inline-block bg-[#4C97FF] text-white px-3 py-1 rounded text-xs font-medium shadow-sm">
              mở cửa phòng thí nghiệm
            </div>
          </div>

          <div className="bg-[#FFAB19] text-white px-3 py-1 rounded-b-md w-24 text-[11px] font-bold text-center">
            {/* cap */}
          </div>
        </div>
      )}

      {stationNo === 3 && (
        <div className="space-y-0.5">
          <div className="inline-flex items-center bg-[#FFAB19] text-white px-3 py-1.5 rounded-t-md font-bold text-xs sm:text-sm shadow">
            <span>nếu</span>
            <div className="mx-1.5 px-2 py-0.5 bg-[#59C059] text-white rounded text-[11px] sm:text-xs font-semibold">
              mã bảo mật đúng?
            </div>
            <span>thì</span>
          </div>

          <div className="pl-6 border-l-8 border-[#FFAB19] py-1 ml-2">
            <div className="inline-block bg-[#9966FF] text-white px-3 py-1 rounded text-xs font-medium shadow-sm">
              đổi đèn sang <span className="text-emerald-300 font-bold">Xanh</span> (Vượt qua)
            </div>
          </div>

          <div className="bg-[#FFAB19] text-white px-3 py-1 font-bold text-xs sm:text-sm shadow-sm inline-block">
            nếu không thì
          </div>

          <div className="pl-6 border-l-8 border-[#FFAB19] py-1 ml-2">
            <div className="inline-block bg-[#9966FF] text-white px-3 py-1 rounded text-xs font-medium shadow-sm">
              đổi đèn sang <span className="text-rose-300 font-bold">Đỏ</span> (Báo động)
            </div>
          </div>

          <div className="bg-[#FFAB19] text-white px-3 py-1 rounded-b-md w-24 text-[11px] font-bold text-center">
            {/* cap */}
          </div>
        </div>
      )}

      {stationNo === 4 && (
        <div className="space-y-0.5">
          <div className="inline-flex items-center bg-[#FFAB19] text-white px-3 py-1.5 rounded-t-md font-bold text-xs sm:text-sm shadow">
            <span>nếu</span>
            <div className="mx-1.5 px-2 py-0.5 bg-[#59C059] text-white rounded text-[11px] sm:text-xs font-semibold flex items-center gap-1">
              <span>nhiệt độ</span>
              <span className="font-extrabold">&gt;</span>
              <span>80 °C</span>
            </div>
            <span>thì</span>
          </div>

          <div className="pl-6 border-l-8 border-[#FFAB19] py-1 ml-2">
            <div className="inline-block bg-[#9966FF] text-white px-3 py-1 rounded text-xs font-medium shadow-sm">
              nói <span className="text-rose-300 font-bold">"Quá nóng!"</span> trong 2 giây
            </div>
          </div>

          <div className="bg-[#FFAB19] text-white px-3 py-1 font-bold text-xs sm:text-sm shadow-sm inline-block">
            nếu không thì
          </div>

          <div className="pl-6 border-l-8 border-[#FFAB19] py-1 ml-2">
            <div className="inline-block bg-[#9966FF] text-white px-3 py-1 rounded text-xs font-medium shadow-sm">
              nói <span className="text-emerald-300 font-bold">"Nhiệt độ an toàn"</span> trong 2 giây
            </div>
          </div>

          <div className="bg-[#FFAB19] text-white px-3 py-1 rounded-b-md w-24 text-[11px] font-bold text-center">
            {/* cap */}
          </div>
        </div>
      )}

      {stationNo === 5 && (
        <div className="space-y-0.5">
          <div className="inline-flex items-center bg-[#FFAB19] text-white px-3 py-1.5 rounded-t-md font-bold text-xs sm:text-sm shadow">
            <span>nếu</span>
            <div className="mx-1.5 px-2 py-0.5 bg-[#59C059] text-white rounded text-[11px] sm:text-xs font-semibold flex items-center gap-1">
              <span>số linh kiện</span>
              <span className="font-extrabold">≥</span>
              <span>5</span>
            </div>
            <span>thì</span>
          </div>

          <div className="pl-6 border-l-8 border-[#FFAB19] py-1 ml-2">
            <div className="inline-block bg-[#9966FF] text-white px-3 py-1 rounded text-xs font-medium shadow-sm">
              nói <span className="text-emerald-300 font-bold">"Nhiệm vụ hoàn thành"</span>
            </div>
          </div>

          <div className="bg-[#FFAB19] text-white px-3 py-1 font-bold text-xs sm:text-sm shadow-sm inline-block">
            nếu không thì
          </div>

          <div className="pl-6 border-l-8 border-[#FFAB19] py-1 ml-2">
            <div className="inline-block bg-[#9966FF] text-white px-3 py-1 rounded text-xs font-medium shadow-sm">
              nói <span className="text-amber-300 font-bold">"Chưa đủ linh kiện"</span>
            </div>
          </div>

          <div className="bg-[#FFAB19] text-white px-3 py-1 rounded-b-md w-24 text-[11px] font-bold text-center">
            {/* cap */}
          </div>
        </div>
      )}
    </div>
  );
};
