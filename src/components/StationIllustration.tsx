import React from 'react';
import { StationId } from '../../shared/types';

interface StationIllustrationProps {
  stationNo: StationId;
  isSuccess?: boolean;
}

export const StationIllustration: React.FC<StationIllustrationProps> = ({
  stationNo,
  isSuccess = false
}) => {
  return (
    <div className="w-full flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 rounded-2xl border border-slate-800 shadow-lg overflow-hidden">
      {stationNo === 1 && (
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex flex-col items-center">
              <span className="text-slate-400 mb-1">Mức pin mẫu</span>
              <div className="w-24 h-10 border-2 border-slate-500 rounded-lg p-1 flex items-center relative bg-slate-950">
                <div
                  className={`h-full rounded transition-all duration-500 ${
                    isSuccess ? 'w-[65%] bg-emerald-500' : 'w-[40%] bg-amber-500'
                  }`}
                />
                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white drop-shadow">
                  {isSuccess ? '60% (≥ 50%)' : '40% (< 50%)'}
                </span>
                <div className="absolute -right-2 top-2.5 w-1.5 h-4 bg-slate-500 rounded-r" />
              </div>
            </div>

            <div className="flex flex-col items-center">
              <span className="text-slate-400 mb-1">Trạng thái robot</span>
              <div
                className={`px-3 py-2 rounded-lg font-bold text-xs flex items-center gap-1.5 border ${
                  isSuccess
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                    : 'bg-slate-800/80 border-slate-700 text-slate-400'
                }`}
              >
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    isSuccess ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'
                  }`}
                />
                {isSuccess ? 'BẬT NGUỒN' : 'CHƯA BẬT NGUỒN'}
              </div>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 text-center">
            {isSuccess
              ? 'Pin đủ điều kiện (≥ 50%) → Robot được bật nguồn thành công!'
              : 'Điều kiện bật nguồn: Mức pin từ 50% trở lên.'}
          </p>
        </div>
      )}

      {stationNo === 2 && (
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-6">
            {/* Magnetic Card Reader */}
            <div className="w-20 h-28 bg-slate-800 border-2 border-slate-600 rounded-xl p-2 flex flex-col items-center justify-between shadow-inner">
              <div className="w-full flex justify-between items-center">
                <span className="text-[9px] text-slate-400 font-mono">RFID</span>
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    isSuccess ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'
                  }`}
                />
              </div>
              <div
                className={`w-14 h-9 rounded flex items-center justify-center text-[10px] font-bold text-white shadow ${
                  isSuccess ? 'bg-emerald-600 rotate-0' : 'bg-blue-600 -rotate-6'
                } transition-transform`}
              >
                THẺ TỪ
              </div>
              <div className="w-full h-1 bg-slate-950 rounded" />
            </div>

            {/* Door graphic */}
            <div className="relative w-32 h-28 bg-slate-950 border-2 border-slate-700 rounded-lg overflow-hidden flex items-center justify-center">
              <div
                className={`absolute inset-y-0 left-0 w-1/2 bg-slate-800 border-r border-slate-600 transition-transform duration-700 ${
                  isSuccess ? '-translate-x-full' : 'translate-x-0'
                }`}
              />
              <div
                className={`absolute inset-y-0 right-0 w-1/2 bg-slate-800 border-l border-slate-600 transition-transform duration-700 ${
                  isSuccess ? 'translate-x-full' : 'translate-x-0'
                }`}
              />
              <span className="text-xs font-bold text-emerald-400 z-10">
                {isSuccess ? 'CỬA ĐÃ MỞ' : 'CỬA ĐÓNG'}
              </span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 text-center">
            {isSuccess
              ? 'Thẻ hợp lệ → Cửa mở. Thẻ không hợp lệ → Cửa vốn dĩ vẫn đóng.'
              : 'Ban đầu cửa đang ở trạng thái đóng.'}
          </p>
        </div>
      )}

      {stationNo === 3 && (
        <div className="flex flex-col items-center gap-2">
          <div className="relative w-64 h-24 bg-slate-950 border-2 border-slate-700 rounded-xl overflow-hidden flex items-center justify-around px-4">
            {/* Status Beacon */}
            <div className="flex flex-col items-center gap-1">
              <span className="text-[10px] font-mono text-slate-400">ĐÈN TÍN HIỆU</span>
              <div
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shadow-lg transition-colors ${
                  isSuccess
                    ? 'bg-emerald-500 border-emerald-300 shadow-emerald-500/50'
                    : 'bg-rose-500 border-rose-300 shadow-rose-500/50 animate-pulse'
                }`}
              >
                <span className="text-[10px] font-black text-white">
                  {isSuccess ? 'XANH' : 'ĐỎ'}
                </span>
              </div>
            </div>

            {/* Laser beams */}
            <div className="flex-1 flex flex-col justify-around h-16 ml-4">
              <div
                className={`h-1 rounded transition-colors ${
                  isSuccess ? 'bg-emerald-500/30' : 'bg-rose-500 animate-pulse'
                }`}
              />
              <div
                className={`h-1 rounded transition-colors ${
                  isSuccess ? 'bg-emerald-500/30' : 'bg-rose-500 animate-pulse'
                }`}
              />
              <div
                className={`h-1 rounded transition-colors ${
                  isSuccess ? 'bg-emerald-500/30' : 'bg-rose-500 animate-pulse'
                }`}
              />
            </div>
          </div>
          <p className="text-[11px] text-slate-400 text-center">
            {isSuccess
              ? 'Mã đúng → Đèn xanh (then); Mã sai → Đèn đỏ (else). Hai nhánh rẽ đầy đủ!'
              : 'Tường laser bảo mật hai trạng thái màu đèn.'}
          </p>
        </div>
      )}

      {stationNo === 4 && (
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-4">
            {/* Thermometer scale */}
            <div className="flex flex-col items-center bg-slate-950 p-2.5 rounded-xl border border-slate-700">
              <span className="text-[10px] text-slate-400 font-mono mb-1">CẢM BIẾN NHIỆT ĐỘ</span>
              <div className="flex items-center gap-3">
                <div className="w-5 h-20 bg-slate-800 rounded-full p-0.5 flex flex-col justify-end relative">
                  <div className="w-full h-14 bg-gradient-to-t from-emerald-500 to-amber-500 rounded-full" />
                  <div className="absolute -right-16 top-3 text-[10px] text-rose-400 font-bold">81°C (Nóng)</div>
                  <div className="absolute -right-20 top-9 text-[10px] text-emerald-400 font-bold underline">80°C (Mốc)</div>
                  <div className="absolute -right-16 bottom-3 text-[10px] text-emerald-400 font-bold">79°C (An toàn)</div>
                </div>
                <div className="text-center pl-16">
                  <div className="text-2xl font-black text-emerald-400 font-mono">80°C</div>
                  <span className="inline-block mt-1 px-2 py-0.5 bg-emerald-950 border border-emerald-500 text-emerald-300 text-[10px] rounded font-bold">
                    NHIỆT ĐỘ AN TOÀN
                  </span>
                </div>
              </div>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 text-center">
            Điều kiện <code className="text-amber-300 font-bold">&gt; 80°C</code> sai tại 80°C → Thực thi nhánh else.
          </p>
        </div>
      )}

      {stationNo === 5 && (
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-5">
            {/* Component basket */}
            <div className="bg-slate-950 border border-slate-700 rounded-xl p-3 flex flex-col items-center">
              <span className="text-[10px] text-slate-400 font-mono mb-1">LINH KIỆN THU THẬP</span>
              <div className="flex items-center gap-1.5 my-1">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center shadow"
                  >
                    ⚙
                  </div>
                ))}
                {[4, 5].map((i) => (
                  <div
                    key={i}
                    className="w-7 h-7 rounded-lg bg-slate-800 border border-dashed border-slate-600 text-slate-500 text-xs flex items-center justify-center"
                  >
                    ?
                  </div>
                ))}
              </div>
              <div className="text-xs font-mono font-bold text-amber-400 mt-1">
                3 / 5 linh kiện
              </div>
            </div>

            {/* Exit notification */}
            <div className="bg-slate-950 border border-amber-600/50 rounded-xl p-3 flex flex-col items-center">
              <span className="text-[10px] text-slate-400 font-mono mb-1">KẾT QUẢ HIỂN THỊ</span>
              <span className="px-2.5 py-1.5 rounded-lg bg-amber-950/80 border border-amber-500 text-amber-300 font-bold text-xs">
                "Chưa đủ linh kiện"
              </span>
              <span className="text-[10px] text-slate-500 mt-1">Nhánh else được gọi (3 &lt; 5)</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 text-center">
            {isSuccess
              ? 'Robot đã xác định đúng nhánh rẽ! Chuẩn bị mở cánh cửa thoát hiểm.'
              : 'Yêu cầu ít nhất 5 linh kiện để hoàn thành nhiệm vụ.'}
          </p>
        </div>
      )}
    </div>
  );
};
