import React, { useState, useEffect } from 'react';
import { SessionData, PlayData, ClassItem } from '../../shared/types';
import { Shield, RefreshCw, Download, Plus, Key, Users, CheckCircle, AlertCircle, ArrowLeft, LogIn, Lock, Trash2 } from 'lucide-react';
import { fetchClasses, fetchSystemStatus } from '../utils/api';

import { auth, googleProvider } from '../utils/firebase';
import { signInWithPopup, signOut } from 'firebase/auth';

const DEMO_TEACHER_TOKEN = 'demo-teacher-token';

// Firebase ID tokens expire after 1 hour, so always ask the SDK for a fresh one.
async function getTeacherToken(storedToken: string): Promise<string> {
  if (storedToken === DEMO_TEACHER_TOKEN) return storedToken;
  await auth.authStateReady();
  return auth.currentUser ? auth.currentUser.getIdToken() : storedToken;
}

interface TeacherDashboardProps {
  onBackToGame: () => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ onBackToGame }) => {
  const [authToken, setAuthToken] = useState<string>(() => localStorage.getItem('teacher_token') || '');
  const [teacherEmail, setTeacherEmail] = useState<string>(() => localStorage.getItem('teacher_email') || '');
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string>('');
  const [plays, setPlays] = useState<PlayData[]>([]);
  const [systemNotice, setSystemNotice] = useState<string>('');
  const [storageMode, setStorageMode] = useState<string>('');
  const [demoTeacherEnabled, setDemoTeacherEnabled] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');

  // Form state for creating new session
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [newClassCode, setNewClassCode] = useState<string>('8C1');
  const [newTitle, setNewTitle] = useState<string>('Tiết 14: Cấu trúc điều khiển Scratch');
  const [newPin12, setNewPin12] = useState<string>('1209');
  const [newPin23, setNewPin23] = useState<string>('4820');
  const [newPin34, setNewPin34] = useState<string>('7391');
  const [newPin45, setNewPin45] = useState<string>('0042');

  // Load status and classes on mount
  useEffect(() => {
    fetchSystemStatus().then((res) => {
      setSystemNotice(res.notice);
      setStorageMode(res.storageMode);
      setDemoTeacherEnabled(res.demoTeacherEnabled === true);
    }).catch(() => {});

    fetchClasses().then((cls) => {
      setClasses(cls);
      if (cls.length > 0) setNewClassCode(cls[0].code);
    }).catch(() => {});
  }, []);

  const handleGoogleLogin = async () => {
    setErrorMsg('');
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      const token = await cred.user.getIdToken();
      const email = cred.user.email || '';
      setAuthToken(token);
      setTeacherEmail(email);
      localStorage.setItem('teacher_token', token);
      localStorage.setItem('teacher_email', email);
    } catch (err: any) {
      console.warn('Google sign-in error:', err.message);
      setErrorMsg('Đăng nhập Google không thành công. Vui lòng cho phép cửa sổ bật lên và thử lại.');
    }
  };

  const handleDemoLogin = () => {
    const email = 'dungnq@vietanhschool.edu.vn';
    setAuthToken(DEMO_TEACHER_TOKEN);
    setTeacherEmail(email);
    localStorage.setItem('teacher_token', DEMO_TEACHER_TOKEN);
    localStorage.setItem('teacher_email', email);
  };

  const handleLogout = () => {
    signOut(auth).catch(() => {});
    setAuthToken('');
    setTeacherEmail('');
    localStorage.removeItem('teacher_token');
    localStorage.removeItem('teacher_email');
    setSessions([]);
    setPlays([]);
  };

  const loadSessions = async (token = authToken) => {
    if (!token) return;
    setIsLoading(true);
    setErrorMsg('');
    try {
      const idToken = await getTeacherToken(token);
      const res = await fetch('/api/teacher/sessions', {
        headers: { Authorization: `Bearer ${idToken}` }
      });
      const data = await res.json();
      if (res.status === 401) {
        handleLogout();
      }
      if (!res.ok) throw new Error(data.error?.message || 'Không thể tải danh sách tiết.');
      setSessions(data);
      if (data.length > 0 && !selectedSessionId) {
        setSelectedSessionId(data[0].sessionId);
        loadPlays(data[0].sessionId, token);
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const loadPlays = async (sessionId: string, token = authToken) => {
    if (!token || !sessionId) return;
    try {
      const idToken = await getTeacherToken(token);
      const res = await fetch(`/api/teacher/plays?sessionId=${encodeURIComponent(sessionId)}`, {
        headers: { Authorization: `Bearer ${idToken}` }
      });
      const data = await res.json();
      if (res.ok) {
        setPlays(data);
      }
    } catch (err: any) {
      console.warn('Cannot load plays:', err.message);
    }
  };

  useEffect(() => {
    if (authToken) {
      loadSessions(authToken);
    }
  }, [authToken]);

  useEffect(() => {
    if (selectedSessionId && authToken) {
      loadPlays(selectedSessionId, authToken);
    }
  }, [selectedSessionId]);

  const handleGenerateRandomPins = () => {
    const generate4Digit = () => Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const p1 = generate4Digit();
    let p2 = generate4Digit();
    while (p2 === p1) p2 = generate4Digit();
    let p3 = generate4Digit();
    while (p3 === p1 || p3 === p2) p3 = generate4Digit();
    let p4 = generate4Digit();
    while (p4 === p1 || p4 === p2 || p4 === p3) p4 = generate4Digit();

    setNewPin12(p1);
    setNewPin23(p2);
    setNewPin34(p3);
    setNewPin45(p4);
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/teacher/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${await getTeacherToken(authToken)}`
        },
        body: JSON.stringify({
          classCode: newClassCode,
          title: newTitle,
          pin12: newPin12,
          pin23: newPin23,
          pin34: newPin34,
          pin45: newPin45
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'Lỗi tạo tiết học.');

      setSuccessMsg(`Tạo thành công tiết học cho lớp ${newClassCode}!`);
      setShowCreateModal(false);
      loadSessions(authToken);
      setSelectedSessionId(data.sessionId);
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const handleStatusChange = async (sessionId: string, newStatus: 'DRAFT' | 'ACTIVE' | 'CLOSED') => {
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await fetch(`/api/teacher/sessions/${sessionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${await getTeacherToken(authToken)}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'Lỗi cập nhật trạng thái.');

      setSuccessMsg(`Đã cập nhật trạng thái thành ${newStatus}!`);
      loadSessions(authToken);
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const handleDeleteSession = async (session: SessionData) => {
    const ok = window.confirm(
      `Xóa tiết "${session.title}" của lớp ${session.classCode}? Lượt chơi của học sinh trong tiết này cũng bị xóa.`
    );
    if (!ok) return;
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await fetch(`/api/teacher/sessions/${session.sessionId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${await getTeacherToken(authToken)}` }
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error?.message || 'Không thể xóa tiết học.');
      if (selectedSessionId === session.sessionId) {
        setSelectedSessionId('');
        setPlays([]);
      }
      setSuccessMsg(`Đã xóa tiết học của lớp ${session.classCode}.`);
      loadSessions(authToken);
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const handleExportCsv = (type: 'summary' | 'events') => {
    if (!selectedSessionId) return;
    const url = `/api/teacher/export?sessionId=${encodeURIComponent(selectedSessionId)}&type=${type}`;
    getTeacherToken(authToken)
      .then((idToken) => fetch(url, { headers: { Authorization: `Bearer ${idToken}` } }))
      .then((res) => {
        if (!res.ok) throw new Error('Không thể tải CSV.');
        return res.blob();
      })
      .then((blob) => {
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `bao_cao_${type}_${selectedSessionId}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      })
      .catch((err) => setErrorMsg(err.message));
  };

  const currentSession = sessions.find((s) => s.sessionId === selectedSessionId);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToGame}
              className="p-2 bg-slate-900 hover:bg-slate-800 rounded-xl border border-slate-700 transition"
              title="Quay lại giao diện học sinh"
            >
              <ArrowLeft className="w-5 h-5 text-slate-300" />
            </button>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                <Shield className="w-6 h-6 text-indigo-400" />
                CỔNG QUẢN TRỊ GIÁO VIÊN
              </h2>
              <p className="text-xs text-slate-400">
                Điều tiết 5 trạm, cấp 4 mã PIN và trích xuất dữ liệu nghiên cứu bài học
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {authToken ? (
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2.5 py-1 bg-indigo-950 border border-indigo-800 text-indigo-300 rounded-lg">
                  {teacherEmail || 'Giáo viên'}
                </span>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 text-xs transition"
                >
                  Đăng xuất
                </button>
              </div>
            ) : null}
          </div>
        </div>

        {/* System Notice Banner */}
        <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                storageMode === 'FIRESTORE' ? 'bg-emerald-400 animate-pulse' : 'bg-cyan-400'
              }`}
            />
            <span className="text-slate-300 font-medium">{systemNotice || 'Đang kiểm tra trạng thái lưu trữ...'}</span>
          </div>
          <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 uppercase">
            {storageMode || 'DATABASE'}
          </span>
        </div>

        {/* Error / Success alerts */}
        {errorMsg && (
          <div className="p-3 bg-rose-950/80 border border-rose-500 rounded-xl text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="p-3 bg-emerald-950/80 border border-emerald-500 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {!authToken ? (
          /* Login prompt */
          <div className="max-w-md mx-auto my-12 p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-950 border border-indigo-800 flex items-center justify-center text-indigo-400">
              <Lock className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-white">Đăng nhập tài khoản Giáo viên</h3>
            <p className="text-xs text-slate-400">
              Chỉ các tài khoản giáo viên được cấp quyền mới có thể tạo tiết học và xuất kết quả.
            </p>

            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full py-2.5 px-4 bg-white hover:bg-slate-100 text-slate-900 font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                Đăng nhập bằng tài khoản Google
              </button>

              {demoTeacherEnabled && (
                <button
                  type="button"
                  onClick={handleDemoLogin}
                  className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-indigo-600/30"
                >
                  <LogIn className="w-4 h-4" />
                  Đăng nhập nhanh (chế độ demo)
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Teacher Workspace */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Sessions list & creator */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Key className="w-4 h-4 text-cyan-400" />
                  Danh sách tiết học
                </h3>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-1 px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Tạo tiết mới
                </button>
              </div>

              <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
                {sessions.map((s) => (
                  <div
                    key={s.sessionId}
                    onClick={() => setSelectedSessionId(s.sessionId)}
                    className={`p-3 rounded-xl border transition cursor-pointer ${
                      selectedSessionId === s.sessionId
                        ? 'bg-slate-800 border-cyan-500 shadow-md'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-cyan-300 px-2 py-0.5 bg-cyan-950 rounded border border-cyan-800">
                        {s.classCode}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          s.status === 'ACTIVE'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-600'
                            : s.status === 'CLOSED'
                            ? 'bg-rose-950 text-rose-400 border border-rose-800'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {s.status === 'ACTIVE' ? 'ĐANG MỞ' : s.status === 'CLOSED' ? 'ĐÃ ĐÓNG' : 'BẢN NHÁP'}
                      </span>
                    </div>
                    <h4 className="text-xs font-semibold text-white truncate">{s.title}</h4>
                    <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2 text-[11px] text-slate-400">
                      <span className="font-mono text-amber-300 font-bold tracking-wider truncate">
                        {s.pin12} | {s.pin23} | {s.pin34} | {s.pin45}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSession(s);
                        }}
                        className="shrink-0 p-1 rounded-md text-rose-300 hover:bg-rose-950 hover:text-rose-200"
                        title="Xóa tiết học"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Selected Session Detail & Student Live Progress */}
            <div className="lg:col-span-2 space-y-4">
              {currentSession ? (
                <>
                  {/* Session Control Panel */}
                  <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span className="text-xs font-bold text-cyan-400 mr-2">Lớp {currentSession.classCode}</span>
                        <h3 className="text-base font-bold text-white inline">{currentSession.title}</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        {currentSession.status !== 'ACTIVE' ? (
                          <button
                            onClick={() => handleStatusChange(currentSession.sessionId, 'ACTIVE')}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition shadow"
                          >
                            Kích hoạt (Mở lớp)
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStatusChange(currentSession.sessionId, 'CLOSED')}
                            className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition shadow"
                          >
                            Đóng tiết học
                          </button>
                        )}
                        <button
                          onClick={() => loadPlays(currentSession.sessionId)}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition"
                          title="Làm mới danh sách"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* PIN Control Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                      <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-center">
                        <span className="text-[10px] text-slate-400 block font-mono">Trạm 1 → 2</span>
                        <span className="font-mono text-sm font-extrabold text-amber-400 tracking-wider">
                          {currentSession.pin12}
                        </span>
                      </div>
                      <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-center">
                        <span className="text-[10px] text-slate-400 block font-mono">Trạm 2 → 3</span>
                        <span className="font-mono text-sm font-extrabold text-amber-400 tracking-wider">
                          {currentSession.pin23}
                        </span>
                      </div>
                      <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-center">
                        <span className="text-[10px] text-slate-400 block font-mono">Trạm 3 → 4</span>
                        <span className="font-mono text-sm font-extrabold text-amber-400 tracking-wider">
                          {currentSession.pin34}
                        </span>
                      </div>
                      <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-center">
                        <span className="text-[10px] text-slate-400 block font-mono">Trạm 4 → 5</span>
                        <span className="font-mono text-sm font-extrabold text-amber-400 tracking-wider">
                          {currentSession.pin45}
                        </span>
                      </div>
                    </div>

                    {/* Export Actions */}
                    <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800 text-xs">
                      <span className="text-slate-400">Xuất dữ liệu nghiên cứu bài học:</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleExportCsv('summary')}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition border border-slate-700"
                        >
                          <Download className="w-3.5 h-3.5 text-cyan-400" />
                          Xuất CSV Tổng hợp (Summary)
                        </button>
                        <button
                          onClick={() => handleExportCsv('events')}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition border border-slate-700"
                        >
                          <Download className="w-3.5 h-3.5 text-indigo-400" />
                          Xuất CSV Sự kiện (Events)
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Student Progress Table */}
                  <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <Users className="w-4 h-4 text-emerald-400" />
                        Tiến độ học sinh trong tiết ({plays.length} lượt tham gia)
                      </h4>
                      <span className="text-xs text-slate-400">
                        Hoàn thành: {plays.filter((p) => p.phase === 'COMPLETED').length}/{plays.length}
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px]">
                          <tr>
                            <th className="p-2.5 rounded-l-lg">Họ và tên</th>
                            <th className="p-2.5">Trạm hiện tại</th>
                            <th className="p-2.5">Trạng thái pha</th>
                            <th className="p-2.5">Đúng lần 1</th>
                            <th className="p-2.5">Tổng số lần thử</th>
                            <th className="p-2.5 rounded-r-lg">Gợi ý đã nhận</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                          {plays.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="p-4 text-center text-slate-500">
                                Chưa có học sinh nào tham gia tiết học này.
                              </td>
                            </tr>
                          ) : (
                            plays.map((p) => (
                              <tr key={p.playId} className="hover:bg-slate-800/50">
                                <td className="p-2.5 font-bold text-white">{p.fullName}</td>
                                <td className="p-2.5 font-mono text-cyan-300 font-semibold">
                                  Trạm {p.currentStation}/5
                                </td>
                                <td className="p-2.5">
                                  <span
                                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                      p.phase === 'COMPLETED'
                                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-700'
                                        : p.phase === 'WAIT_PIN'
                                        ? 'bg-amber-950 text-amber-400 border border-amber-700'
                                        : 'bg-slate-800 text-slate-300'
                                    }`}
                                  >
                                    {p.phase}
                                  </span>
                                </td>
                                <td className="p-2.5 font-mono text-emerald-400 font-bold">
                                  {p.firstTryCorrectCount} / 5
                                </td>
                                <td className="p-2.5 font-mono text-slate-300">
                                  {p.totalAttempts} ({p.wrongAttempts} sai)
                                </td>
                                <td className="p-2.5 font-mono text-slate-400">
                                  [
                                  {['1', '2', '3', '4', '5']
                                    .map((st) => `T${st}: H${p.hintsByStation[st] || 0}`)
                                    .join(', ')}
                                  ]
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-8 bg-slate-900 border border-slate-800 rounded-2xl text-center text-slate-500">
                  Chọn một tiết học ở cột bên trái để xem chi tiết và điều tiết trạm.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal Create Session */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-5 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h3 className="font-bold text-white text-base">Tạo tiết học mới</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-slate-400 hover:text-white text-sm"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateSession} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Chọn lớp học:</label>
                  <select
                    value={newClassCode}
                    onChange={(e) => setNewClassCode(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                  >
                    {classes.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.displayName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Tiêu đề tiết học:</label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                    required
                  />
                </div>

                <div className="pt-2 border-t border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-amber-400">4 Mã PIN chuyển trạm (4 chữ số khác nhau):</span>
                    <button
                      type="button"
                      onClick={handleGenerateRandomPins}
                      className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px]"
                    >
                      Sinh ngẫu nhiên
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 font-mono">
                    <div>
                      <span className="text-[10px] text-slate-400">Trạm 1 → 2:</span>
                      <input
                        type="text"
                        maxLength={4}
                        value={newPin12}
                        onChange={(e) => setNewPin12(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-bold tracking-wider"
                        required
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400">Trạm 2 → 3:</span>
                      <input
                        type="text"
                        maxLength={4}
                        value={newPin23}
                        onChange={(e) => setNewPin23(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-bold tracking-wider"
                        required
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400">Trạm 3 → 4:</span>
                      <input
                        type="text"
                        maxLength={4}
                        value={newPin34}
                        onChange={(e) => setNewPin34(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-bold tracking-wider"
                        required
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400">Trạm 4 → 5:</span>
                      <input
                        type="text"
                        maxLength={4}
                        value={newPin45}
                        onChange={(e) => setNewPin45(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-bold tracking-wider"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-3 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl"
                  >
                    Lưu tiết học
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
