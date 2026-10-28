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
    title: 'Trạm 4 – Ước của hai số',
    scenario:
      'Có hai số nguyên A, B (đảm bảo A ≥ B). Nếu số A chia hết cho số B thì hiển thị “B là ước của A”.',
    question:
      'Có hai số nguyên A, B (đảm bảo A ≥ B). Nếu số A chia hết cho số B thì hiển thị “B là ước của A”.',
    optionA: '/assets/hinhcauhoi/k8_b14_game_tuong_tac/cau1_a.png',
    optionB: '/assets/hinhcauhoi/k8_b14_game_tuong_tac/cau1_b.png',
    correctOption: 'A',
    hints: [
      'Đề chỉ nói việc cần làm khi A chia hết cho B. Có yêu cầu thêm câu khi không chia hết không?',
      'Nếu đề không nêu việc làm khi điều kiện sai, chương trình không cần nhánh “nếu không thì”.',
      'Chương trình đúng chỉ có: nếu A chia lấy dư B = 0 thì nói B là ước của A.'
    ],
    explanation: {
      correctChoice: 'A. if then — chỉ nói “B là ước của A” khi A chia hết cho B.',
      reason:
        'Đề chỉ yêu cầu một việc: nếu A chia hết cho B thì hiển thị “B là ước của A”. Đề không yêu cầu thông báo khi A không chia hết cho B, nên không thêm nhánh “nếu không thì”.',
      branchesAnalysis:
        'Hình A chỉ có khối nếu A chia lấy dư B = 0 thì nói B là ước của A. Hình B thêm câu “không là ước của A”. Đó là việc đề không yêu cầu.',
      takeaway:
        'Khi bài chỉ nói việc cần làm nếu điều kiện đúng, dùng if then. Chỉ dùng if then else khi đề nêu rõ việc làm khi điều kiện sai.'
    }
  },
  5: {
    stationNo: 5,
    title: 'Trạm 5 – Số chẵn và số lẻ',
    scenario:
      'Có một số nguyên N (đảm bảo N khác 0). Nếu số N chia hết cho 2 thì hiển thị “là số chẳn”. Ngược lại, hiển thị “là số lẻ”.',
    question:
      'Có một số nguyên N (đảm bảo N khác 0). Nếu số N chia hết cho 2 thì hiển thị “là số chẳn”. Ngược lại, hiển thị “là số lẻ”.',
    optionA: '/assets/hinhcauhoi/k8_b14_game_tuong_tac/cau2_a.png',
    optionB: '/assets/hinhcauhoi/k8_b14_game_tuong_tac/cau2_b.png',
    correctOption: 'B',
    hints: [
      'Đề có hai kết quả khác nhau: chia hết cho 2 và không chia hết cho 2.',
      'Điều kiện cần kiểm tra là N chia hết cho 2, không phải N bằng 0.',
      'Nếu N chia lấy dư 2 = 0 thì nói là số chẳn; nếu không thì nói là số lẻ.'
    ],
    explanation: {
      correctChoice: 'B. if then else — chia hết cho 2 thì là số chẳn, ngược lại là số lẻ.',
      reason:
        'Đề yêu cầu hai thông báo. Nếu N chia hết cho 2 thì hiển thị “là số chẳn”. Ngược lại hiển thị “là số lẻ”. Chương trình cần đủ hai nhánh.',
      branchesAnalysis:
        'Hình B kiểm tra N chia lấy dư 2 = 0: nhánh thì nói là số chẳn, nhánh không thì nói là số lẻ. Hình A kiểm tra N = 0 và luôn nói là số lẻ, nên không đúng đề.',
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
