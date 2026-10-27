import React from 'react';
import { RobotAvatar } from '../components/RobotAvatar';
import { ArrowRight, Compass, ShieldAlert, KeyRound, CheckCircle } from 'lucide-react';

interface Screen02IntroProps {
  fullName: string;
  classCode: string;
  onEnterStation1: () => void;
}

export const Screen02Intro: React.FC<Screen02IntroProps> = ({
  fullName,
  classCode,
  onEnterStation1
}) => {
  const stations = [
    { no: 1, title: 'Khởi động robot', desc: 'Kiểm tra mức pin ≥ 50%', type: 'if then' },
    { no: 2, title: 'Mở cửa phòng thí nghiệm', desc: 'Xác thực thẻ từ hợp lệ', type: 'if then' },
    { no: 3, title: 'Vượt tường laser', desc: 'Bảo mật: đèn xanh / đèn đỏ', type: 'if then else' },
    { no: 4, title: 'Sửa lỗi hệ thống', desc: 'Cảm biến nhiệt độ 80°C', type: 'if then else' },
    { no: 5, title: 'Thoát hiểm', desc: 'Thu thập ít nhất 5 linh kiện', type: 'if then else' }
  ];

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6 my-4">
      {/* Hero Mission Brief */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
          <RobotAvatar mood="idle" size="lg" />
          <div className="space-y-3 text-center md:text-left">
            <span className="px-3 py-1 bg-cyan-950 text-cyan-300 border border-cyan-800 rounded-full text-xs font-bold inline-block">
              Nhiệm vụ cứu hộ phòng thí nghiệm
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Chào {fullName} ({classCode})!
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Một robot nghiên cứu đang bị phong tỏa bên trong hệ thống tự động của phòng thí nghiệm. Hệ thống bảo mật yêu cầu người điều khiển phải <strong>chọn đúng cấu trúc điều khiển rẽ nhánh trong Scratch</strong> (<code className="text-amber-400 font-bold">if then</code> hoặc <code className="text-cyan-400 font-bold">if then else</code>) để kích hoạt từng cánh cửa an ninh.
            </p>
          </div>
        </div>

        {/* 3 Core Rules */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-6 pt-6 border-t border-slate-800/80 text-xs">
          <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 flex items-start gap-2.5">
            <Compass className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white block mb-0.5">5 Trạm – Chỉ chọn A hoặc B</span>
              <span className="text-slate-400">Mỗi trạm chỉ gồm một câu hỏi trắc nghiệm A/B trọng tâm bài học.</span>
            </div>
          </div>
          <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white block mb-0.5">Gợi ý tăng dần khi sai</span>
              <span className="text-slate-400">Nếu chọn chưa đúng, robot sẽ nhận gợi ý để em suy nghĩ và thử lại.</span>
            </div>
          </div>
          <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 flex items-start gap-2.5">
            <KeyRound className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white block mb-0.5">4 Mã PIN từ Thầy/Cô</span>
              <span className="text-slate-400">Sau khi nghe chốt lý thuyết, giáo viên sẽ cung cấp mã PIN mở trạm tiếp.</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5-Station Roadmap */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-cyan-400" />
          Bản đồ lộ trình 5 trạm thử thách
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {stations.map((s) => (
            <div
              key={s.no}
              className={`p-3.5 rounded-2xl border flex flex-col justify-between space-y-2 transition ${
                s.no === 1
                  ? 'bg-slate-800/90 border-cyan-500 shadow-md shadow-cyan-500/10'
                  : 'bg-slate-950/60 border-slate-800'
              }`}
            >
              <div>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-800 text-cyan-300 rounded font-bold">
                  Trạm {s.no}
                </span>
                <h4 className="text-xs font-bold text-white mt-1.5">{s.title}</h4>
                <p className="text-[11px] text-slate-400 mt-1">{s.desc}</p>
              </div>
              <div className="pt-2 border-t border-slate-800">
                <span className="text-[10px] font-mono font-semibold text-amber-400">
                  {s.type}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Start button */}
        <div className="pt-4 flex justify-center">
          <button
            onClick={onEnterStation1}
            className="w-full sm:w-auto min-w-[280px] py-4 px-8 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-sm tracking-wide rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-cyan-500/30 transition active:scale-[0.98]"
          >
            <span>VÀO TRẠM 1: KHỞI ĐỘNG ROBOT</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
