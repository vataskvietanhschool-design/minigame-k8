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
      'Robot chỉ được bật nguồn khi pin còn từ 50% trở lên. Nếu pin dưới 50%, robot không thực hiện hành động nào.',
    question: 'Nên sử dụng cấu trúc điều khiển nào trong Scratch?',
    optionA: 'if then',
    optionB: 'if then else',
    correctOption: 'A',
    hints: [
      'Khi pin dưới 50%, robot có phải thực hiện một hành động khác không?',
      'Nếu điều kiện sai và không cần làm thêm gì, em có cần nhánh else không?',
      'Hãy thử so sánh pin 60% và 40%: chương trình chỉ có một lệnh bật nguồn khi đủ pin.'
    ],
    explanation: {
      correctChoice: 'A. if then',
      reason:
        'Cấu trúc if then phù hợp vì chỉ thực hiện lệnh bật nguồn khi điều kiện pin ≥ 50% đúng. Khi pin dưới 50%, khối lệnh sẽ bỏ qua; không có hành động nào khác cần xử lý.',
      branchesAnalysis:
        'Đúng 50% vẫn đủ điều kiện bật nguồn. Mô phỏng: Pin 60% (ĐÚNG) → Bật nguồn; Pin 40% (SAI) → Không làm gì (bỏ qua).',
      takeaway:
        'Khi bài toán chỉ yêu cầu thực hiện hành động khi điều kiện ĐÚNG, và không có hành động nào khi SAI, ta chọn cấu trúc if then (khuyết nhánh else).'
    }
  },
  2: {
    stationNo: 2,
    title: 'Trạm 2 – Mở cửa phòng thí nghiệm',
    scenario:
      'Nếu thẻ từ hợp lệ, cửa sẽ mở. Nếu thẻ không hợp lệ, cửa vẫn đóng và không có hành động nào khác.',
    question: 'Vì sao nên sử dụng cấu trúc if then?',
    optionA: 'Vì chỉ cần thực hiện hành động khi điều kiện đúng.',
    optionB: 'Vì cần thực hiện hai hành động khác nhau khi điều kiện đúng và sai.',
    correctOption: 'A',
    hints: [
      'Đề bài có yêu cầu robot bật báo động hoặc thực hiện hành động mới khi thẻ sai không?',
      'Khi thẻ không hợp lệ, cửa đang đóng có phải đổi trạng thái không?',
      'Chỉ có hành động mở cửa khi thẻ hợp lệ; trường hợp sai không chạy lệnh mở.'
    ],
    explanation: {
      correctChoice: 'A. Vì chỉ cần thực hiện hành động khi điều kiện đúng.',
      reason:
        'Điều kiện “thẻ hợp lệ” đúng thì thực hiện lệnh mở cửa. Nếu sai thì không thực hiện lệnh mở, cửa vốn đang ở trạng thái đóng nên tiếp tục đóng; không cần một hành động mới.',
      branchesAnalysis:
        'Điểm phân biệt bản chất: Không thực hiện lệnh khi sai hoàn toàn khác với việc phải chạy một nhánh hành động khác (else).',
      takeaway:
        'Cửa vốn dĩ đang đóng. Nếu sai điều kiện mà không cần hành động phát sinh nào khác, không dùng nhánh else.'
    }
  },
  3: {
    stationNo: 3,
    title: 'Trạm 3 – Vượt tường laser',
    scenario:
      'Robot kiểm tra mã bảo mật. Nếu mã đúng, đèn chuyển xanh. Nếu mã sai, đèn chuyển đỏ.',
    question: 'Cấu trúc nào phù hợp nhất để xử lý cả hai trường hợp?',
    optionA: 'if then',
    optionB: 'if then else',
    correctOption: 'B',
    hints: [
      'Đề bài có cần bật một màu đèn khi mã sai không?',
      'Nếu có cả hành động khi điều kiện đúng và hành động khi điều kiện sai, em cần mấy nhánh?',
      'Nhánh then: đèn xanh; nhánh else: đèn đỏ.'
    ],
    explanation: {
      correctChoice: 'B. if then else',
      reason:
        'Cấu trúc if then else phù hợp nhất vì có hai hành động hoàn toàn khác nhau được quy định rõ: mã đúng → đèn chuyển xanh; mã sai → đèn chuyển đỏ.',
      branchesAnalysis:
        'Cả hai nhánh ĐÚNG (then) và SAI (else) đều có lệnh thực thi riêng biệt, không có trường hợp nào bị bỏ qua.',
      takeaway:
        'Khi bài toán phân rõ hai kịch bản hành động khác nhau tương ứng với điều kiện ĐÚNG và SAI, ta bắt buộc sử dụng if then else (rẽ nhánh đầy đủ).'
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
