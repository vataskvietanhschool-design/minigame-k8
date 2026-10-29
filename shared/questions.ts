import { QuestionData, StationId, ClientQuestionView } from './types.js';

/**
 * BỘ 5 CÂU HỎI CHÍNH THỨC - GIỮ NGUYÊN CÂU CHỮ THEO ĐẶC TẢ MỤC 7.
 * Đáp án và logic kiểm tra nằm ở backend, không gửi đáp án đúng cho client trước khi trả lời.
 */
export const QUESTIONS_DB: Record<StationId, QuestionData> = {
  1: {
    stationNo: 1,
    title: 'Trạm 1 – Khởi động robot',
    scenario:
      'Năng lượng chỉ tăng khi bấm trúng viên pin. Bấm không trúng thì không có việc gì xảy ra.',
    question: 'Năng lượng chỉ tăng lên khi bấm trúng viên pin. Câu lệnh điều kiện nên dùng là gì?',
    optionA: 'if then',
    optionB: 'if then else',
    correctOption: 'A',
    hints: [
      'Bấm không trúng viên pin thì có việc gì xảy ra không?',
      'Nếu chỉ có việc làm khi bấm trúng, có cần nhánh else không?',
      'Bấm trúng thì năng lượng tăng. Bấm trượt thì không làm gì, nên dùng if then.'
    ],
    explanation: {
      correctChoice: 'A. if then',
      reason:
        'Năng lượng chỉ tăng khi bấm trúng viên pin. Bấm không đúng viên pin thì không có hiện tượng gì, nên không cần nhánh else.',
      branchesAnalysis:
        'Bấm trúng viên pin: năng lượng tăng 5%. Bấm không trúng: không có việc gì xảy ra.',
      takeaway:
        'Khi chỉ có việc cần làm nếu điều kiện đúng, và không có việc gì nếu điều kiện sai, dùng if then.'
    }
  },
  2: {
    stationNo: 2,
    title: 'Trạm 2 – Năng lượng hai nhánh',
    scenario:
      'Bấm trúng viên pin thì năng lượng tăng 5%. Pin chạm cạnh dưới thì năng lượng giảm 5%. Đó là hai điều kiện riêng.',
    question:
      'Bấm trúng thì +5%, pin chạm cạnh dưới thì −5%. Câu lệnh điều kiện nên dùng là gì?',
    optionA: '2 câu if then',
    optionB: 'if then else',
    correctOption: 'A',
    hints: [
      'Bấm trúng và pin chạm cạnh dưới có phải cùng một điều kiện không?',
      'Mỗi việc xảy ra với một điều kiện riêng thì có cần ghép thành if then else không?',
      'Một câu if then cho lúc bấm trúng, một câu if then cho lúc pin chạm cạnh dưới.'
    ],
    explanation: {
      correctChoice: 'A. 2 câu if then',
      reason:
        'Bấm trúng viên pin và pin chạm cạnh dưới là hai điều kiện khác nhau. Mỗi điều kiện một việc, nên dùng hai câu if then.',
      branchesAnalysis:
        'If bấm trúng then +5%. If pin chạm cạnh dưới then −5%.',
      takeaway:
        'Khi có hai điều kiện riêng, mỗi điều kiện một việc, dùng hai câu if then.'
    }
  },
  3: {
    stationNo: 3,
    title: 'Trạm 3 – Kích hoạt robot',
    scenario:
      'Click đủ 120 lần trong 30 giây thì robot kích hoạt thành công. Hết giờ mà chưa đủ thì kích hoạt thất bại.',
    question: 'Đủ 120 lần trong 30 giây thì thành công, không đủ thì thất bại. Câu lệnh nào phù hợp?',
    optionA: 'if then',
    optionB: 'if then else',
    correctOption: 'B',
    hints: [
      'Hết 30 giây mà chưa đủ 120 lần thì có thông báo gì không?',
      'Một điều kiện có hai kết quả khác nhau thì cần mấy nhánh?',
      'Đủ 120 lần trong 30 giây thì thành công, không đủ thì thất bại, nên dùng if then else.'
    ],
    explanation: {
      correctChoice: 'B. if then else',
      reason:
        'Click đủ 120 lần trong 30 giây thì kích hoạt thành công. Hết giờ mà chưa đủ thì thông báo kích hoạt thất bại. Cùng một điều kiện có hai kết quả, nên dùng if then else.',
      branchesAnalysis:
        'Đủ 120 lần trong 30 giây: thành công. Không đủ: kích hoạt thất bại.',
      takeaway:
        'Khi một điều kiện có việc làm nếu đúng và việc làm khác nếu sai, dùng if then else.'
    }
  },
  4: {
    stationNo: 4,
    title: 'Trạm 4 – Mật khẩu hệ thống',
    scenario:
      'Hệ thống không báo mật khẩu đúng hay sai. Nhập quá nhiều lần thì máy tự khóa. Cần chương trình báo thành công khi đúng và báo sai mật khẩu khi sai.',
    question: 'Chương trình báo hai trường hợp đúng và sai mật khẩu. Câu lệnh rẽ nhánh nào phù hợp?',
    optionA: 'If then else',
    optionB: 'if then',
    correctOption: 'A',
    hints: [
      'Chương trình cần báo mấy trường hợp?',
      'If then chỉ làm việc khi điều kiện đúng. Khi mật khẩu sai thì sao?',
      'Đúng thì nói thành công, sai thì nói sai mật khẩu, nên dùng if then else.'
    ],
    explanation: {
      correctChoice: 'A. If then else',
      reason:
        'Chương trình cần thông báo khi mật khẩu đúng và khi mật khẩu sai. If then chỉ xử lý một trường hợp, nên dùng if then else.',
      branchesAnalysis:
        'Mật khẩu đúng: nói Thành công. Mật khẩu sai: nói Sai Mật khẩu.',
      takeaway:
        'Khi một điều kiện có hai việc khác nhau lúc đúng và lúc sai, dùng if then else.'
    }
  },
  5: {
    stationNo: 5,
    title: 'Trạm 5 – Hạ nhiệt robot',
    scenario:
      'Robot đang quá nóng. Nếu nhiệt độ trên 60 thì báo đang làm mát. Nếu không thì báo đang hoạt động bình thường.',
    question: 'Chương trình hạ nhiệt đúng dùng câu lệnh rẽ nhánh nào?',
    optionA: 'if then',
    optionB: 'if then else',
    correctOption: 'B',
    hints: [
      'Chương trình có báo khi robot đang hoạt động bình thường không?',
      'Nhiệt độ robot đang cao hơn 60. Điều kiện “nhỏ hơn 60” có chạy nhánh làm mát không?',
      'Nhiệt độ trên 60 thì làm mát, không thì báo đang hoạt động, nên dùng if then else.'
    ],
    explanation: {
      correctChoice: 'B. if then else',
      reason:
        'Nhiệt độ trên 60 thì báo đang làm mát. Nhiệt độ không còn cao thì báo đang hoạt động. Cần cả hai nhánh, và điều kiện phải là lớn hơn 60.',
      branchesAnalysis:
        'Đúng: nếu nhiệt độ > 60 thì “Đang làm mát”, else “Đang hoạt động”. Sai nếu chỉ có if then, hoặc nếu điều kiện là nhiệt độ < 60.',
      takeaway:
        'Khi có việc làm nếu điều kiện đúng và việc làm khác nếu điều kiện sai, dùng if then else.'
    }
  }
};

export function getClientQuestion(stationNo: StationId): ClientQuestionView {
  const q = QUESTIONS_DB[stationNo];
  return {
    stationNo: q.stationNo,
    title: q.title,
    scenario: q.scenario,
    question: q.question,
    optionA: q.optionA,
    optionB: q.optionB
  };
}
