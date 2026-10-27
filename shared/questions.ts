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
    title: 'Trạm 4 – Sửa lỗi hệ thống',
    scenario:
      'Nếu nhiệt độ robot lớn hơn 80°C, robot hiển thị “Quá nóng!”. Nếu nhiệt độ nhỏ hơn hoặc bằng 80°C, robot hiển thị “Nhiệt độ an toàn”.',
    question:
      'Nếu nhiệt độ robot đúng bằng 80°C, thông báo nào xuất hiện và nên dùng cấu trúc nào?',
    optionA: '“Quá nóng!”, dùng if then.',
    optionB: '“Nhiệt độ an toàn”, dùng if then else.',
    correctOption: 'B',
    hints: [
      '80 có lớn hơn 80 không?',
      'Nếu điều kiện > 80°C sai thì chạy nhánh nào?',
      '79°C và 80°C thuộc nhánh an toàn; 81°C thuộc nhánh quá nóng.'
    ],
    explanation: {
      correctChoice: 'B. “Nhiệt độ an toàn”, dùng if then else.',
      reason:
        'Điều kiện nhiệt độ > 80°C là SAI tại giá trị đúng bằng 80°C (vì 80 không lớn hơn 80). Do đó, chương trình sẽ thực hiện nhánh else: hiển thị “Nhiệt độ an toàn”.',
      branchesAnalysis:
        'Phân biệt dấu so sánh: dấu “>” không chứa giá trị bằng. Các mức nhiệt độ: 79°C (SAI) → An toàn; 80°C (SAI) → An toàn; 81°C (ĐÚNG) → Quá nóng.',
      takeaway:
        'Lưu ý ranh giới so sánh trong lập trình Scratch: điều kiện “> 80” chỉ đúng từ 81 trở lên (nếu là số nguyên). Tại 80, điều kiện sai nên nhánh else sẽ được kích hoạt.'
    }
  },
  5: {
    stationNo: 5,
    title: 'Trạm 5 – Thoát hiểm',
    scenario:
      'Robot cần thu thập ít nhất 5 linh kiện để hoàn thành nhiệm vụ. Nếu đủ 5 linh kiện trở lên, robot thông báo “Nhiệm vụ hoàn thành”. Nếu ít hơn 5 linh kiện, robot thông báo “Chưa đủ linh kiện”.',
    question:
      'Nếu robot chỉ thu thập được 3 linh kiện, kết quả nào đúng và cấu trúc nào phù hợp?',
    optionA: '“Nhiệm vụ hoàn thành”, dùng if then.',
    optionB: '“Chưa đủ linh kiện”, dùng if then else.',
    correctOption: 'B',
    hints: [
      'Số 3 đã đạt mức ít nhất 5 chưa?',
      'Nếu chưa đủ 5 linh kiện, chương trình cần hiển thị thông báo nào?',
      '3 < 5 nên thuộc nhánh ‘Chưa đủ linh kiện’; nếu đúng 5 sẽ là ‘Nhiệm vụ hoàn thành’.'
    ],
    explanation: {
      correctChoice: 'B. “Chưa đủ linh kiện”, dùng if then else.',
      reason:
        'Cụm từ “ít nhất 5” nghĩa là điều kiện số linh kiện ≥ 5. Với 3 linh kiện, điều kiện (3 ≥ 5) là SAI, chương trình chuyển sang nhánh else và thông báo “Chưa đủ linh kiện”.',
      branchesAnalysis:
        'Có hai thông báo cho hai trường hợp: Đủ linh kiện (≥ 5) và Chưa đủ (< 5). Do đó cần cấu trúc if then else để kiểm soát trọn vẹn cả hai nhánh.',
      takeaway:
        'Điều kiện “ít nhất X” tương ứng toán tử “≥ X”. Khi dữ liệu đầu vào không thỏa mãn, nhánh else sẽ tiếp nhận xử lý.'
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
