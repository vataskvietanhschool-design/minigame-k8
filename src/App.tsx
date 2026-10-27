import React, { useState, useEffect } from 'react';
import { PlayData, ClientQuestionView, StationId, GamePhase, QuestionData } from '../shared/types';
import { QUESTIONS_DB } from '../shared/questions';
import { getOrCreateDeviceId, saveStoredPlay, getStoredPlay } from './utils/storage';
import {
  fetchPlayState,
  fetchPlayQuestion,
  startPlay,
  submitAnswer,
  acknowledgeExplanation,
  unlockWithPin,
  finishMission,
  generateEventId,
  clearPlayToken
} from './utils/api';
import { HeaderBar } from './components/HeaderBar';
import { Screen01Start } from './views/Screen01Start';
import { Screen02Intro } from './views/Screen02Intro';
import { Screen03Question } from './views/Screen03Question';
import { Screen04WrongHint } from './views/Screen04WrongHint';
import { Screen05CorrectTheory } from './views/Screen05CorrectTheory';
import { Screen06WaitPin } from './views/Screen06WaitPin';
import { Screen07Completed } from './views/Screen07Completed';
import { ReviewModal } from './views/ReviewModal';
import { TeacherDashboard } from './components/TeacherDashboard';
import { AlertTriangle, Clock } from 'lucide-react';

export default function App() {
  const [viewMode, setViewMode] = useState<'game' | 'teacher'>(() => {
    return window.location.pathname.startsWith('/teacher') ? 'teacher' : 'game';
  });

  const [deviceId] = useState<string>(() => getOrCreateDeviceId());
  const [play, setPlay] = useState<PlayData | null>(null);
  const [question, setQuestion] = useState<ClientQuestionView | null>(null);
  const [hasSeenIntro, setHasSeenIntro] = useState<boolean>(false);
  const [showReviewModal, setShowReviewModal] = useState<boolean>(false);

  // Phase-specific sub-states
  const [wrongState, setWrongState] = useState<{
    hintLevel: number;
    hintText: string;
    attemptNo: number;
  } | null>(null);

  const [explanationState, setExplanationState] = useState<{
    explanation: QuestionData['explanation'];
    attemptNo: number;
    isFirstTry: boolean;
  } | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isActionLoading, setIsActionLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');

  // Initial restoration from server
  useEffect(() => {
    restoreStateFromServer();
  }, []);

  const restoreStateFromServer = async () => {
    setIsLoading(true);
    try {
      const res = await fetchPlayState();
      if (res?.play) {
        setPlay(res.play);
        setHasSeenIntro(true);
        saveStoredPlay({
          sessionId: res.play.sessionId,
          playId: res.play.playId,
          classCode: res.play.classCode,
          fullName: res.play.fullName,
          lastKnownStation: res.play.currentStation,
          lastKnownPhase: res.play.phase,
          updatedAt: Date.now()
        });

        if (res.play.phase === 'QUESTION') {
          await loadCurrentQuestion();
        } else if (res.play.phase === 'EXPLANATION') {
          const q = QUESTIONS_DB[res.play.currentStation];
          const attempts = res.play.attemptsByStation[String(res.play.currentStation)] || 1;
          const wrongs = res.play.wrongByStation[String(res.play.currentStation)] || 0;
          setExplanationState({
            explanation: q.explanation,
            attemptNo: attempts,
            isFirstTry: wrongs === 0
          });
        }
      }
    } catch {
      // Stale token or no active session
      clearPlayToken();
    } finally {
      setIsLoading(false);
    }
  };

  const loadCurrentQuestion = async () => {
    try {
      const qRes = await fetchPlayQuestion();
      setQuestion(qRes.question);
    } catch (err: any) {
      setErrorMessage(err.message || 'Không thể tải câu hỏi trạm hiện tại.');
    }
  };

  const handleStartPlay = async (fullName: string, classCode: string, sessionId: string) => {
    setIsActionLoading(true);
    setErrorMessage('');
    try {
      const res = await startPlay({
        sessionId,
        classCode,
        fullName,
        deviceId
      });

      setPlay(res.play);
      saveStoredPlay({
        sessionId: res.play.sessionId,
        playId: res.play.playId,
        classCode: res.play.classCode,
        fullName: res.play.fullName,
        lastKnownStation: res.play.currentStation,
        lastKnownPhase: res.play.phase,
        updatedAt: Date.now()
      });

      // If returning user already past station 1
      if (!res.isNew && res.play.currentStation > 1) {
        setHasSeenIntro(true);
        if (res.play.phase === 'QUESTION') {
          await loadCurrentQuestion();
        }
      } else {
        setHasSeenIntro(false);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Lỗi khởi tạo lượt chơi.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleEnterStation1 = async () => {
    setHasSeenIntro(true);
    setIsActionLoading(true);
    await loadCurrentQuestion();
    setIsActionLoading(false);
  };

  const handleSelectOption = async (option: 'A' | 'B') => {
    if (!play || isActionLoading) return;
    setIsActionLoading(true);
    setErrorMessage('');
    const eventId = generateEventId();

    try {
      const res = await submitAnswer({ eventId, selectedOption: option });

      if (res.isCorrect) {
        // Correct answer!
        setWrongState(null);
        setExplanationState({
          explanation: res.explanation || QUESTIONS_DB[play.currentStation].explanation,
          attemptNo: res.attemptNo,
          isFirstTry: (play.wrongByStation[String(play.currentStation)] || 0) === 0
        });

        // Update local play
        setPlay((prev) => {
          if (!prev) return null;
          const completed = [...prev.completedStations];
          if (!completed.includes(play.currentStation)) completed.push(play.currentStation);
          return {
            ...prev,
            phase: 'EXPLANATION',
            firstTryCorrectCount: res.firstTryCorrectCount ?? prev.firstTryCorrectCount,
            completedStations: completed
          };
        });
      } else {
        // Wrong answer -> Show progressive hint
        setWrongState({
          hintLevel: res.hintLevel || 1,
          hintText: res.hintText || 'Hãy quan sát lại yêu cầu đề bài.',
          attemptNo: res.attemptNo
        });

        setPlay((prev) => {
          if (!prev) return null;
          const curr = String(prev.currentStation);
          return {
            ...prev,
            attemptsByStation: {
              ...prev.attemptsByStation,
              [curr]: (prev.attemptsByStation[curr] || 0) + 1
            },
            wrongByStation: {
              ...prev.wrongByStation,
              [curr]: (prev.wrongByStation[curr] || 0) + 1
            },
            hintsByStation: {
              ...prev.hintsByStation,
              [curr]: res.hintLevel || 1
            },
            totalAttempts: prev.totalAttempts + 1,
            wrongAttempts: prev.wrongAttempts + 1
          };
        });
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Lỗi gửi câu trả lời.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleRetryAfterHint = () => {
    setWrongState(null);
  };

  const handleContinueAfterExplanation = async () => {
    if (!play || isActionLoading) return;
    setIsActionLoading(true);
    setErrorMessage('');
    const eventId = generateEventId();

    try {
      if (play.currentStation === 5) {
        // Station 5 finished -> complete mission
        const res = await finishMission(eventId);
        setPlay(res.play);
        setExplanationState(null);
      } else {
        // Station 1-4 -> transition to wait PIN
        const res = await acknowledgeExplanation(eventId);
        setPlay((prev) => (prev ? { ...prev, phase: res.phase } : null));
        setExplanationState(null);
        setPinError('');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Lỗi xác nhận chuyển bước.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleUnlockPin = async (pin: string) => {
    if (!play || isActionLoading) return;
    setIsActionLoading(true);
    setPinError('');
    const eventId = generateEventId();

    try {
      const res = await unlockWithPin({ eventId, pin });
      setPlay((prev) =>
        prev
          ? {
              ...prev,
              currentStation: res.newStation,
              phase: 'QUESTION'
            }
          : null
      );
      await loadCurrentQuestion();
    } catch (err: any) {
      setPinError(err.message || 'Mã chưa chính xác. Em hãy kiểm tra lại mã giáo viên cung cấp.');
    } finally {
      setIsActionLoading(false);
    }
  };

  if (viewMode === 'teacher') {
    return <TeacherDashboard onBackToGame={() => setViewMode('game')} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {/* Universal Header Bar */}
      <HeaderBar
        fullName={play?.fullName}
        classCode={play?.classCode}
        currentStation={play?.currentStation}
        completedStations={play?.completedStations || []}
        onOpenReview={() => setShowReviewModal(true)}
        onOpenTeacher={() => setViewMode('teacher')}
      />

      {/* Global Error Alert */}
      {errorMessage && (
        <div className="max-w-4xl mx-auto w-full px-4 pt-3">
          <div className="p-3 bg-rose-950/90 border border-rose-500 rounded-2xl text-rose-300 text-xs flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage('')}
              className="text-slate-400 hover:text-white px-2 py-0.5"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main View Router */}
      <main className="flex-1 flex flex-col justify-center">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-12 space-y-3">
            <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-slate-400 font-mono">Đang tải trạng thái tiến trình...</p>
          </div>
        ) : !play ? (
          /* Screen 01: Student Start & Class selection */
          <Screen01Start
            onStart={handleStartPlay}
            isLoading={isActionLoading}
            error={errorMessage}
            onOpenTeacher={() => setViewMode('teacher')}
          />
        ) : play.phase === 'SESSION_CLOSED' ? (
          /* Session Closed Banner */
          <div className="max-w-md mx-auto my-12 p-6 bg-slate-900 border border-slate-800 rounded-3xl text-center space-y-4">
            <Clock className="w-12 h-12 text-amber-400 mx-auto" />
            <h2 className="text-lg font-bold text-white">Tiết học đã kết thúc</h2>
            <p className="text-xs text-slate-400">
              Giáo viên đã tạm dừng hoặc đóng tiết học này. Dữ liệu tiến trình của em đã được lưu an toàn.
            </p>
          </div>
        ) : !hasSeenIntro ? (
          /* Screen 02: Storyline & 5-Station Mission Briefing */
          <Screen02Intro
            fullName={play.fullName}
            classCode={play.classCode}
            onEnterStation1={handleEnterStation1}
          />
        ) : play.phase === 'COMPLETED' ? (
          /* Screen 07: Mission Completed & Personal Scorecard */
          <Screen07Completed play={play} />
        ) : play.phase === 'EXPLANATION' && explanationState ? (
          /* Screen 05: Correct Answer & 4-Part Pedagogical Synthesis */
          <Screen05CorrectTheory
            stationNo={play.currentStation}
            explanation={explanationState.explanation}
            attemptNo={explanationState.attemptNo}
            isFirstTry={explanationState.isFirstTry}
            isSubmitting={isActionLoading}
            onContinue={handleContinueAfterExplanation}
          />
        ) : play.phase === 'WAIT_PIN' ? (
          /* Screen 06: Enter 6-digit Teacher PIN */
          <Screen06WaitPin
            currentStation={play.currentStation}
            isSubmitting={isActionLoading}
            error={pinError}
            onUnlock={handleUnlockPin}
          />
        ) : wrongState ? (
          /* Screen 04: Wrong Choice & Progressive Hint */
          <Screen04WrongHint
            stationNo={play.currentStation}
            hintLevel={wrongState.hintLevel}
            hintText={wrongState.hintText}
            attemptNo={wrongState.attemptNo}
            onRetry={handleRetryAfterHint}
          />
        ) : question ? (
          /* Screen 03: Question & Choices A/B */
          <Screen03Question
            question={question}
            stationNo={play.currentStation}
            attempts={play.attemptsByStation[String(play.currentStation)] || 0}
            wrongCount={play.wrongByStation[String(play.currentStation)] || 0}
            isSubmitting={isActionLoading}
            onSelectOption={handleSelectOption}
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-12">
            <button
              onClick={loadCurrentQuestion}
              className="px-4 py-2 bg-cyan-600 rounded-xl text-xs font-bold"
            >
              Tải lại câu hỏi
            </button>
          </div>
        )}
      </main>

      {/* Review Modal for Completed Stations */}
      {showReviewModal && (
        <ReviewModal
          completedStations={play?.completedStations || []}
          onClose={() => setShowReviewModal(false)}
        />
      )}
    </div>
  );
}
