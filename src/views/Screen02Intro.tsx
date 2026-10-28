import React from 'react';
import { StationPathMap } from '../components/StationPathMap';

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
  return (
    <div className="max-w-xl mx-auto p-4 sm:p-6 space-y-4 my-2">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-black text-white">Chào {fullName} ({classCode})!</h2>
        <p className="text-sm text-slate-300">
          Đi lần lượt 5 trạm và chọn đúng <strong>if then</strong> hoặc <strong>if then else</strong>. Bấm trạm 1 để bắt đầu.
        </p>
      </div>
      <StationPathMap
        mode="pick"
        completedStations={[]}
        fromStation={1}
        toStation={1}
        onEnterFirst={onEnterStation1}
      />
    </div>
  );
};
