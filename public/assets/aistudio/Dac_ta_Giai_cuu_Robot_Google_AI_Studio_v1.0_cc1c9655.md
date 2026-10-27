# ĐẶC TẢ SẢN PHẨM & MASTER PROMPT TRIỂN KHAI

## GIẢI CỨU ROBOT – CHỌN NHÁNH ĐÚNG

**Mã tài liệu:** ROBOT-RESCUE-SRS-1.0  
**Phiên bản:** 1.0 – 24/10/2026  
**Môi trường phát triển:** Google AI Studio – Build  
**Mục tiêu xuất bản:** Publish lên Google Cloud Run trực tiếp từ Google AI Studio  
**Cơ sở dữ liệu:** Firebase Cloud Firestore  
**Đối tượng:** Học sinh lớp 8, Bài 14 – Cấu trúc điều khiển trong Scratch  
**Ngôn ngữ giao diện:** Tiếng Việt (100%)  
**Trạng thái:** Đặc tả để AI triển khai; các giả định bổ sung được gắn nhãn [ĐỀ XUẤT].

> **LỆNH THỰC THI CHO GOOGLE AI STUDIO:** Hãy xây dựng một **ỨNG DỤNG WEB FULL-STACK HOÀN CHỈNH, CHẠY THẬT**, theo toàn bộ tài liệu này. Tạo mã nguồn, giao diện, backend, Firestore, cơ chế chống trùng, xác thực mã mở khóa, quản trị giáo viên, xuất CSV, kiểm thử và hướng dẫn Publish. **Không tạo ứng dụng mock chỉ để minh họa.** Nếu chưa được kết nối Firebase hoặc chưa có quyền Publish, hãy tạo phần mã hoàn chỉnh, hướng dẫn chính xác bước cấu hình cần người dùng thực hiện, và đánh dấu các chức năng chưa kết nối; tuyệt đối không giả báo “đã lưu thành công”.

---

# 1. Mục tiêu, bối cảnh và thứ tự ưu tiên

## 1.1. Bối cảnh sư phạm

Học sinh lớp 8 có thể nhận diện hoặc làm theo mẫu các khối điều kiện Scratch nhưng còn nhầm lẫn trong việc chọn `if then` và `if then else`, nhất là xác định điều gì xảy ra khi điều kiện ĐÚNG/SAI. Trò chơi “Giải cứu Robot – Chọn nhánh đúng” gồm **chính xác 5 trạm**, mỗi trạm là **1 câu hỏi trắc nghiệm A/B**. Học sinh trả lời sai nhận gợi ý tăng dần và được chọn lại; trả lời đúng xem phần **chốt lý thuyết của chính câu đó**. Sau trạm 1–4, giáo viên chủ động cung cấp **4 mã 6 chữ số khác nhau** để mở từng trạm tiếp theo. Trạm 5 không có mã mở khóa mới.

Trò chơi phục vụ **hoạt động học có giáo viên điều tiết**, không phải cuộc thi tốc độ. Dữ liệu từng lần chọn A/B, số lượt sai và gợi ý được lưu để phân tích quá trình học. Vì chỉ dùng A/B, **không tuyên bố** hệ thống đo trực tiếp khả năng giải thích bằng lời hoặc vận dụng sang bài toán mới.

## 1.2. Kết quả triển khai bắt buộc

1. Một URL công khai chung cho các lớp 8, được cấp sau khi **Publish từ Google AI Studio lên Cloud Run**. Không dùng Vercel, GitHub Pages, Google Sheets hoặc Apps Script.
2. Ứng dụng thực sự hoạt động trên máy tính phòng Tin học: khoảng **28 học sinh đồng thời/lớp**, có thể mở nhiều lớp/tiết khác nhau.
3. Học sinh **không phải đăng nhập**, chỉ nhập họ tên và chọn lớp lần đầu trong tiết.
4. localStorage giúp tải lại trang mà không nhập lại thông tin; Firestore giữ trạng thái chính thức và ngăn **tạo hai lượt cho cùng cặp thiết bị-trình duyệt/tiết**.
5. Không thể bỏ qua trạm, vượt mã PIN hoặc tự thay đổi trạng thái bằng DevTools: tất cả bước chuyển phải được backend xác nhận.
6. Giáo viên có cách cấu hình lớp/tiết, cập nhật 4 mã PIN và tải kết quả CSV an toàn.
7. Có bộ kiểm thử rõ ràng và hướng dẫn cấu hình/Publish, không để mật khẩu hoặc thông tin học sinh lộ công khai.

## 1.3. Những yêu cầu KHÔNG được tự ý thay đổi

- Chỉ dùng **lớp 8**, chủ đề câu lệnh điều kiện Scratch.
- **Đúng 5 câu hỏi; chỉ chọn A/B**; không thêm câu 6, không yêu cầu nhập lời giải thích, không thêm bài kiểm tra cuối.
- Học sinh trả lời **đúng mới được xem chốt kiến thức**; trả lời sai thì có gợi ý và thử lại, không chuyển trạm.
- **4 mã chuyển trạm**, mỗi mã **đúng 6 chữ số và khác nhau**; do giáo viên thay đổi mà **không cần Publish lại**.
- Học sinh **không được chơi lại** sau khi hoàn thành trong cùng tiết trên cùng trình duyệt/máy đã được nhận diện.
- Dữ liệu chi tiết phải tồn tại qua reload; không chỉ lưu điểm cuối.
- Một URL chung, tiết học ACTIVE được xác định theo **lớp học sinh chọn**, không yêu cầu URL riêng cho từng lớp.
- Không cần offline; mất kết nối phải báo lỗi chính xác và không được xác nhận thao tác chưa lưu.
- Không gọi Gemini AI khi học sinh trả lời: tất cả câu hỏi, đáp án và gợi ý là logic cố định, không phát sinh chi phí suy luận AI lúc chơi.

# 2. Kiến trúc và công nghệ

## 2.1. Công nghệ phải sử dụng

| Tầng | Công nghệ | Vai trò |
|---|---|---|
| Công cụ xây dựng | Google AI Studio Build | Sinh/chỉnh sửa ứng dụng full-stack và Publish |
| Giao diện | React + TypeScript | Màn hình học sinh và giáo viên |
| Định dạng & hoạt ảnh | CSS, SVG, CSS animation (có thể dùng thư viện nhẹ) | Robot và 5 bối cảnh trạm |
| Backend | Node.js/TypeScript, API cùng origin | Kiểm tra A/B, PIN, phiên học, ghi sự kiện, xuất CSV |
| Database | Firebase Cloud Firestore | `classes`, `sessions`, `plays`, `events` |
| Tài khoản giáo viên | Firebase Authentication – Google Sign-In | Chỉ cho người quản trị, không áp dụng cho học sinh |
| Bộ nhớ trình duyệt | localStorage | `device_id`, thông tin lượt chơi, màn hình khôi phục |
| Hosting sau xuất bản | Google Cloud Run | Một website với frontend + backend |

**Kết nối Firestore:** Backend dùng **Firebase Admin SDK/Application Default Credentials (ADC)** của Cloud Run hoặc danh tính dịch vụ được AI Studio/Firebase tích hợp cấp quyền. **Không nhúng service account JSON, private key hoặc khóa có quyền quản trị vào React.** Client không được truy cập trực tiếp Firestore của trò chơi.

**Firestore Security Rules:** mặc định `deny all` đối với truy cập trực tiếp từ SDK trình duyệt. Quyền truy cập của backend do Google Cloud IAM quyết định; xác thực giáo viên dùng Firebase Authentication để đăng nhập vào chính backend. Phải giữ Rules trong mã nguồn và kiểm thử trước Publish.

## 2.2. Luồng dữ liệu

1. Browser → API cùng domain Cloud Run → Firestore (đọc tiết ACTIVE, tạo/khôi phục lượt chơi).
2. Browser → API trả lời → backend kiểm tra đáp án gốc trên máy chủ → Firestore transaction ghi sự kiện và cập nhật trạng thái → trả phản hồi.
3. Browser → API nhập PIN → backend tra PIN tiết hiện tại → Firestore transaction mở trạm tiếp.
4. Giáo viên → `/teacher` + Google Sign-In → backend xác thực `uid` cho phép → cấu hình tiết học/xuất CSV.
5. localStorage **không** là nguồn sự thật để mở khóa, tính điểm hay xác nhận đã hoàn thành.

# 3. Vai trò và quyền

| Vai trò | Đăng nhập | Quyền |
|---|---|---|
| Học sinh | Không | Xem câu hỏi của trạm được mở, chọn A/B, xem gợi ý/chốt kiến thức, nhập PIN, xem kết quả cá nhân |
| Giáo viên quản trị | Google Sign-In; `uid` trong danh sách cho phép | Tạo/mở/đóng tiết, quản lý 4 PIN, xem danh sách/kết quả, xuất CSV |
| Khách truy cập khác | Không | Chỉ xem màn hình khởi động; không đọc được dữ liệu học sinh/PIN/đáp án phía máy chủ |

**[ĐỀ XUẤT để vận hành thuận tiện]** Xây dựng một trang `/teacher` tối giản thay vì bắt buộc sửa mọi thứ trong Firebase Console. Nếu phần tích hợp quản trị chưa hoàn tất, cho phép chủ sở hữu sửa session/PIN trong Firebase Console; tuy nhiên **API xuất CSV phải luôn được bảo vệ** và không được mở công khai. Việc thêm Google Sign-In cho **giáo viên** không làm thay đổi yêu cầu **học sinh không đăng nhập**.

# 4. Tiết học và sử dụng một URL chung

## 4.1. Khái niệm phiên học

Mỗi tiết được đại diện bằng `session_id` bất biến, liên kết một `class_code` (ví dụ `8A1`, `8A2`) và trạng thái `DRAFT`, `ACTIVE`, `CLOSED`.

- Học sinh chọn lớp trên trang chủ; API trả về **duy nhất một** session `ACTIVE` thuộc lớp đó và còn trong khoảng thời gian hoạt động (nếu có cấu hình lịch).
- Không có session ACTIVE → thông báo “Giáo viên chưa mở hoạt động cho lớp này.”
- Tồn tại từ hai session ACTIVE cùng lớp → lỗi `SESSION_CONFLICT`, yêu cầu giáo viên xử lý; **không tự chọn ngẫu nhiên**.
- Nhiều lớp khác nhau được ACTIVE đồng thời.
- Session đóng không cho bắt đầu lượt mới hoặc mở trạm mới. Thông tin đã lưu vẫn được bảo toàn; khi giáo viên mở lại, học sinh có thể tiếp tục trạng thái cũ nếu chưa COMPLETED.
- Không sử dụng ngày/lớp làm khóa duy nhất vì có thể một lớp học hai tiết trong cùng ngày; giáo viên phải dùng `session_id` riêng.

## 4.2. Quy tắc chống trùng theo tiết

**Một lượt chơi duy nhất cho một cặp `session_id + device_id`**, trong phạm vi cùng trình duyệt còn giữ localStorage. Backend xác định `play_id = SHA-256(session_id + ':' + device_id)`, rồi dùng transaction hoặc thao tác `create-if-absent` để tránh hai tab cùng tạo bản ghi. Khi đã có lượt:

- `IN_PROGRESS` → khôi phục đúng trạm/pha đang chơi;
- `COMPLETED` → chỉ xem kết quả, không tạo lượt mới, không đổi tên;
- `SESSION_CLOSED` → hiển thị thông báo dừng theo phiên.

Trong lúc đang có lượt chơi của session hiện tại, giao diện không cho đổi lớp hoặc nhập tên khác để tạo lượt mới. Tiết mới có `session_id` khác nên cùng máy có thể phục vụ học sinh khác ở tiết tiếp theo.

**Giới hạn không được che giấu:** Đây là chống trùng trong cùng **trình duyệt/hồ sơ lưu trữ**, không thể nhận diện chắc chắn một máy vật lý sau khi xóa localStorage/cookie hoặc đổi trình duyệt. Không dùng browser fingerprint/IP để giả vờ bảo đảm chống gian lận tuyệt đối.

# 5. Màn hình nhập học sinh và localStorage

## 5.1. Đăng ký mới

- Giao diện gồm Họ và tên (bắt buộc), Lớp (dropdown lấy từ cấu hình), nút “Bắt đầu giải cứu Robot”.
- Chuẩn hóa khoảng trắng, giữ chữ có dấu; giới hạn họ tên 2–80 ký tự; không cho lưu toàn chuỗi trắng.
- Tạo `device_id` dạng UUID ngẫu nhiên một lần bằng `crypto.randomUUID()` và lưu localStorage theo origin.
- Nếu lớp có session ACTIVE, gửi `session_id, class_code, full_name, device_id, request_id` đến backend. Backend xác thực lớp/session khớp nhau.
- Chỉ hiển thị thành công khi API xác nhận đã tạo hoặc lấy lại lượt chơi trong Firestore.
- Sau khi đã đăng ký, họ tên/lớp bị khóa trong suốt lượt chơi; chỉ giáo viên mới có thể can thiệp thủ công ngoài phạm vi UI học sinh.

## 5.2. Dữ liệu localStorage

Sử dụng namespace có phiên bản, ví dụ `robot_rescue:v1:device_id` và `robot_rescue:v1:current_play`. `current_play` giữ `session_id`, `play_id`, `class_code`, `full_name`, `last_known_station`, `last_known_phase` và dấu thời gian cập nhật. **Không lưu PIN hoặc đáp án bí mật**.

Phiên xác nhận người chơi dùng cookie bảo mật **HttpOnly + Secure + SameSite=Lax** do backend phát hành (hoặc cơ chế token ký bảo mật tương đương nếu nền tảng thực tế yêu cầu), không lấy thông tin họ tên từ localStorage làm căn cứ cấp quyền.

Khi reload, trình duyệt gọi `/api/play/state` để lấy trạng thái thật trước khi cho thao tác. Nếu localStorage và Firestore lệch nhau, **Firestore thắng**. Nếu localStorage bị chặn hoặc xóa bất ngờ, báo giới hạn và yêu cầu học sinh liên hệ giáo viên; không tuyên bố chống trùng nữa.

# 6. Máy trạng thái trò chơi (state machine)

| Trạng thái | Ý nghĩa | Thao tác hợp lệ tiếp theo |
|---|---|---|
| `NOT_STARTED` | Chưa tạo lượt | Đăng ký |
| `QUESTION` | Đang đọc/chọn đáp án trạm N | Trả lời A/B |
| `EXPLANATION` | Đã đúng, hiển thị chốt kiến thức của trạm N | “Tiếp tục” (trạm 1–4), “Hoàn thành” (trạm 5) |
| `WAIT_PIN` | Đã xác nhận đọc chốt; đang chờ mã chuyển trạm | Nhập PIN của đúng cặp trạm N→N+1 |
| `COMPLETED` | Hoàn thành sau trạm 5 | Chỉ xem kết quả; không chơi lại |
| `SESSION_CLOSED` | Tiết bị đóng/tạm dừng | Chờ giáo viên hoặc xem trạng thái đã lưu |

**Luồng đúng:** `QUESTION` → trả lời đúng → `EXPLANATION` → nhấn “Tiếp tục” → `WAIT_PIN` → PIN đúng → `QUESTION` (trạm N+1). Riêng trạm 5: `QUESTION` → `EXPLANATION` → nhấn “Hoàn thành” → `COMPLETED`.

**Luồng sai:** `QUESTION` → A/B sai → giữ `QUESTION`, tăng lượt thử, trả gợi ý; khi A/B đúng mới sang `EXPLANATION`.

**Bất biến:** `current_station` chỉ tăng từng đơn vị khi PIN đúng; trạm 5 chỉ hoàn thành sau khi câu 5 được trả lời đúng và người chơi bấm kết thúc. Không chấp nhận `station_no` hoặc `phase` do browser tự khai báo nếu trái trạng thái trong Firestore.

# 7. Bộ câu hỏi CHÍNH THỨC – GIỮ NGUYÊN CÂU CHỮ

**Nguồn:** “Nội dung nghiên cứu học sinh.docx” – phần “Bộ 5 câu hỏi game Giải cứu Robot – Chinh phục 5 trạm thử thách”. Mỗi trạm có đúng 2 lựa chọn A/B. Nên lưu bộ câu hỏi trong một cấu hình TypeScript duy nhất, nhưng **đáp án và logic xác thực phải ở backend**, không dựa vào giá trị client truyền lên.

## Trạm 1 – Khởi động robot

**Tình huống:** Robot chỉ được bật nguồn khi pin còn từ 50% trở lên. Nếu pin dưới 50%, robot không thực hiện hành động nào.  
**Hỏi:** Nên sử dụng cấu trúc điều khiển nào trong Scratch?  
**A.** `if then`  
**B.** `if then else`  
**Đáp án chính xác:** **A**.

**Chốt kiến thức khi đúng:** `if then` phù hợp vì chỉ thực hiện lệnh bật nguồn khi điều kiện `pin ≥ 50%` đúng. Khi pin dưới 50%, bỏ qua lệnh; không có hành động khác cần xử lý. **Đúng 50% vẫn đủ điều kiện**. Hiển thị hai nhánh minh họa 60% → bật nguồn; 40% → không bật.

**Gợi ý tăng dần:**  
H1: “Khi pin dưới 50%, robot có phải thực hiện một hành động khác không?”  
H2: “Nếu điều kiện sai và không cần làm thêm gì, em có cần nhánh `else` không?”  
H3: “Hãy thử so sánh pin 60% và 40%: chương trình chỉ có một lệnh bật nguồn khi đủ pin.”

**Minh họa:** Robot nằm ở khoang khởi động, biểu tượng pin thay đổi, nút nguồn bật sau khi trả lời đúng.

## Trạm 2 – Mở cửa phòng thí nghiệm

**Tình huống:** Nếu thẻ từ hợp lệ, cửa sẽ mở. Nếu thẻ không hợp lệ, cửa vẫn đóng và không có hành động nào khác.  
**Hỏi:** Vì sao nên sử dụng cấu trúc `if then`?  
**A.** Vì chỉ cần thực hiện hành động khi điều kiện đúng.  
**B.** Vì cần thực hiện hai hành động khác nhau khi điều kiện đúng và sai.  
**Đáp án chính xác:** **A**.

**Chốt kiến thức khi đúng:** Điều kiện “thẻ hợp lệ” đúng thì thực hiện lệnh mở cửa. Nếu sai thì không thực hiện lệnh mở, cửa **vốn đang đóng** nên tiếp tục đóng; không cần một hành động mới. Điểm phân biệt là **không thực hiện lệnh khi sai** khác với việc phải chạy một nhánh hành động khác.

**Gợi ý:**  
H1: “Đề bài có yêu cầu robot bật báo động hoặc thực hiện hành động mới khi thẻ sai không?”  
H2: “Khi thẻ không hợp lệ, cửa đang đóng có phải đổi trạng thái không?”  
H3: “Chỉ có hành động mở cửa khi thẻ hợp lệ; trường hợp sai không chạy lệnh mở.”

**Minh họa:** Cửa **ban đầu ở trạng thái đóng**, thẻ xanh hợp lệ làm cửa mở sau khi giải đúng.

## Trạm 3 – Vượt tường laser

**Tình huống:** Robot kiểm tra mã bảo mật. Nếu mã đúng, đèn chuyển xanh. Nếu mã sai, đèn chuyển đỏ.  
**Hỏi:** Cấu trúc nào phù hợp nhất để xử lý cả hai trường hợp?  
**A.** `if then`  
**B.** `if then else`  
**Đáp án chính xác:** **B**.

**Chốt kiến thức khi đúng:** `if then else` phù hợp vì có **hai hành động khác nhau**: mã đúng → đèn xanh; mã sai → đèn đỏ. Cả hai nhánh được quy định rõ trong yêu cầu.

**Gợi ý:**  
H1: “Đề bài có cần bật một màu đèn khi mã sai không?”  
H2: “Nếu có cả hành động khi điều kiện đúng và hành động khi điều kiện sai, em cần mấy nhánh?”  
H3: “Nhánh `then`: đèn xanh; nhánh `else`: đèn đỏ.”

**Minh họa:** Hành lang laser, đèn trạng thái đỏ/xanh, robot vượt qua sau phản hồi đúng.

## Trạm 4 – Sửa lỗi hệ thống

**Tình huống:** Nếu nhiệt độ robot lớn hơn 80°C, robot hiển thị “Quá nóng!”. Nếu nhiệt độ nhỏ hơn hoặc bằng 80°C, robot hiển thị “Nhiệt độ an toàn”.  
**Hỏi:** Nếu nhiệt độ robot đúng bằng 80°C, thông báo nào xuất hiện và nên dùng cấu trúc nào?  
**A.** “Quá nóng!”, dùng `if then`.  
**B.** “Nhiệt độ an toàn”, dùng `if then else`.  
**Đáp án chính xác:** **B**.

**Chốt kiến thức khi đúng:** Điều kiện `nhiệt độ > 80°C` **sai tại 80°C**. Vì vậy thực hiện nhánh `else`: hiển thị “Nhiệt độ an toàn”. So sánh `>` với `≥`: dấu `>` không chứa giá trị bằng. Mô phỏng các mức 79°C, 80°C và 81°C.

**Gợi ý:**  
H1: “80 có lớn hơn 80 không?”  
H2: “Nếu điều kiện `> 80°C` sai thì chạy nhánh nào?”  
H3: “79°C và 80°C thuộc nhánh an toàn; 81°C thuộc nhánh quá nóng.”

**Minh họa:** Đồng hồ nhiệt độ, màn hình cảnh báo/an toàn; giá trị mặc định của câu hỏi là **đúng 80°C**.

## Trạm 5 – Thoát hiểm

**Tình huống:** Robot cần thu thập ít nhất 5 linh kiện để hoàn thành nhiệm vụ. Nếu đủ 5 linh kiện trở lên, robot thông báo “Nhiệm vụ hoàn thành”. Nếu ít hơn 5 linh kiện, robot thông báo “Chưa đủ linh kiện”.  
**Hỏi:** Nếu robot chỉ thu thập được 3 linh kiện, kết quả nào đúng và cấu trúc nào phù hợp?  
**A.** “Nhiệm vụ hoàn thành”, dùng `if then`.  
**B.** “Chưa đủ linh kiện”, dùng `if then else`.  
**Đáp án chính xác:** **B**.

**Chốt kiến thức khi đúng:** “Ít nhất 5” là điều kiện `số linh kiện ≥ 5`. Với 3 linh kiện, điều kiện sai, chương trình chạy nhánh `else` và hiện “Chưa đủ linh kiện”. Hai thông báo được xử lý bằng hai nhánh của `if then else`.

**Gợi ý:**  
H1: “Số 3 đã đạt mức ít nhất 5 chưa?”  
H2: “Nếu chưa đủ 5 linh kiện, chương trình cần hiển thị thông báo nào?”  
H3: “3 < 5 nên thuộc nhánh ‘Chưa đủ linh kiện’; nếu đúng 5 sẽ là ‘Nhiệm vụ hoàn thành’.”

**Minh họa:** Robot thu thập linh kiện, bảng đếm 3/5, cánh cửa thoát hiểm; sau câu đúng và chốt lý thuyết, robot về đích.

# 8. Phản hồi đúng/sai và cách chốt kiến thức

1. Mỗi lần bấm A/B, tạo **`event_id` UUID riêng**; khi gửi lại cùng hành động vì timeout, phải **tái sử dụng event_id cũ**.
2. Nếu sai: ghi `is_correct=false`, tăng `attempt_no`, trả `hint_level = min(số lần sai,3)` và đúng gợi ý trạm; cho thử lại **không giới hạn lượt**. Không tự tiết lộ đáp án dưới dạng nhãn đỏ/xanh của hai nút trước khi người chơi chọn đúng.
3. Nếu đúng: ghi `is_correct=true`, ghi `attempt_no`, cập nhật trạm sang `EXPLANATION`, khóa câu hỏi, hiện “Chính xác!”, chốt kiến thức 4 phần: đáp án phù hợp, lý do, diễn biến đúng/sai và ghi nhớ.
4. Không tự động chuyển trạm khi đúng; học sinh phải có nút **“Tiếp tục”**. Cú nhấn được lưu là đã chuyển bước **không phải bằng chứng đã hiểu bài**.
5. Không cộng điểm lại nếu reload trang ở `EXPLANATION`, `WAIT_PIN` hoặc `COMPLETED`.
6. Thống kê riêng **đúng lần đầu** và **đúng sau gợi ý**; không dùng “5/5 cuối cùng” như điểm phân hóa năng lực.

# 9. Bốn mã PIN chuyển trạm

| Đoạn chuyển | Trường dữ liệu session | Quy tắc |
|---|---|---|
| Trạm 1 → 2 | `pin12` | Đúng 6 chữ số |
| Trạm 2 → 3 | `pin23` | Đúng 6 chữ số, khác pin12 |
| Trạm 3 → 4 | `pin34` | Đúng 6 chữ số, khác hai mã trước |
| Trạm 4 → 5 | `pin45` | Đúng 6 chữ số, khác ba mã trước |

- PIN được lưu **dạng string**, chấp nhận số 0 đầu (ví dụ `004216`); tuyệt đối không ép sang number.
- PIN không hiển thị trên trang học sinh, không lưu localStorage, không đưa trong source frontend/bundle/API công khai; chỉ kiểm tra trên backend.
- Giáo viên thay mã bằng trang `/teacher` hoặc Firebase Console, có hiệu lực cho lần xác thực kế tiếp; các trạm **đã mở thành công** không bị khóa ngược.
- Chỉ nhận PIN khi người chơi đang ở `WAIT_PIN` của đúng trạm. PIN đúng ghi event thành công và tăng `current_station` đúng **một**; PIN sai hiển thị “Mã chưa chính xác. Em hãy kiểm tra lại mã giáo viên cung cấp.”
- Chặn thử mã hàng loạt: đề xuất **5 lần sai/60 giây trên mỗi play**, sau đó tạm khóa xác thực 60 giây. Không ghi nguyên PIN sai vào nhật ký.
- Giáo viên dùng mã như công cụ điều tiết tiến độ lớp học, **không coi PIN là yếu tố bảo mật cao**.

# 10. Firestore – cấu trúc dữ liệu bắt buộc

## 10.1. `classes/{classCode}`

| Trường | Kiểu | Mô tả |
|---|---|---|
| `code` | string | `8A1`, `8A2`... |
| `displayName` | string | Lớp 8A1 |
| `enabled` | boolean | Có trong dropdown hay không |
| `sortOrder` | number | Thứ tự hiển thị |

## 10.2. `sessions/{sessionId}`

| Trường | Kiểu | Mô tả |
|---|---|---|
| `sessionId` | string | Khóa duy nhất |
| `classCode` | string | Lớp |
| `title` | string | Tên tiết học |
| `status` | enum | DRAFT/ACTIVE/CLOSED |
| `startsAt`, `endsAt` | Timestamp/null | Cửa sổ hoạt động, nếu cấu hình |
| `pin12`, `pin23`, `pin34`, `pin45` | string | Bốn mã 6 chữ số khác nhau |
| `createdAt`, `updatedAt` | Timestamp | Tạo/cập nhật từ server |

## 10.3. `plays/{playId}`

| Trường | Kiểu | Mô tả |
|---|---|---|
| `playId` | string | SHA-256 của sessionId + deviceId |
| `sessionId`, `classCode` | string | Phân loại theo tiết/lớp |
| `deviceId` | string | UUID trình duyệt |
| `fullName` | string | Tên học sinh |
| `currentStation` | number | 1–5 |
| `phase` | enum | QUESTION/EXPLANATION/WAIT_PIN/COMPLETED |
| `attemptsByStation` | map | Tổng lần trả lời từng trạm |
| `wrongByStation` | map | Số lần sai từng trạm |
| `hintsByStation` | map | Mức gợi ý cao nhất từng trạm |
| `firstTryCorrectCount` | number | Số câu đúng lần đầu, 0–5 |
| `totalAttempts`, `wrongAttempts` | number | Tổng số lượt |
| `completedStations` | number[] | Danh sách trạm đã trả lời đúng |
| `version` | number | Phiên bản trạng thái để tránh cập nhật cũ |
| `startedAt`, `updatedAt`, `completedAt` | Timestamp/null | Thời điểm server |

## 10.4. `plays/{playId}/events/{eventId}`

| Trường | Kiểu | Mô tả |
|---|---|---|
| `eventId` | string | UUID duy nhất do client tạo và tái sử dụng khi retry |
| `eventType` | enum | ANSWER, EXPLANATION_ACK, PIN_UNLOCK, FINISH |
| `sessionId`, `stationNo` | string/number | Ngữ cảnh |
| `attemptNo` | number/null | Lần thử |
| `selectedOption` | A/B/null | Đáp án đã chọn |
| `isCorrect` | boolean/null | Kết quả |
| `hintLevel` | number/null | Mức gợi ý sau sự kiện |
| `createdAt` | Timestamp | Thời điểm backend |

**Lưu ý:** Không ghi mật khẩu PIN hay bí mật hệ thống vào events. Trong `plays`, tổng hợp dữ liệu để hiển thị nhanh; `events` lưu minh chứng gốc. Các thay đổi có quan hệ phải **transaction** để không ghi event thành công nhưng cập nhật play thất bại (hoặc ngược lại).

**Indexes:** xây dựng index cho truy vấn danh sách `sessions` theo `classCode + status`, danh sách `plays` theo `sessionId + startedAt` và truy vấn collection group events nếu cần báo cáo tập trung. Chỉ tạo index thực sự phục vụ truy vấn triển khai.

# 11. API backend và hợp đồng hành vi

Tạo API same-origin. Tất cả response lỗi có mã ổn định `{ error: { code, message } }`; không trả stack trace, cấu hình bí mật hoặc PII của người khác.

| Phương thức + đường dẫn | Quyền | Mục tiêu |
|---|---|---|
| `GET /api/classes` | Public | Danh sách lớp enabled; không đưa thông tin PIN |
| `POST /api/session/resolve` | Public | Nhận classCode, trả tiết ACTIVE hợp lệ hoặc mã lỗi |
| `POST /api/play/start` | Public | Tạo/lấy lại lượt dựa trên sessionId + deviceId, lưu tên/lớp |
| `GET /api/play/state` | Play cookie | Trả trạm/pha và thống kê riêng của lượt hiện tại |
| `GET /api/play/question` | Play cookie | Trả nội dung câu hỏi của trạm hiện tại; không lộ đáp án đúng |
| `POST /api/play/answer` | Play cookie | Chấm A/B phía server; ghi event idempotent; trả gợi ý hoặc chốt |
| `POST /api/play/ack` | Play cookie | Xác nhận tiếp tục sau phần chốt kiến thức |
| `POST /api/play/unlock` | Play cookie | Xác thực mã PIN, mở trạm kế |
| `POST /api/play/finish` | Play cookie | Hoàn thành sau chốt kiến thức trạm 5 |
| `GET /api/teacher/sessions` | Teacher auth | Xem tiết học |
| `POST /api/teacher/sessions` | Teacher auth | Tạo tiết mới |
| `PATCH /api/teacher/sessions/:id` | Teacher auth | Đổi status, thời gian, PIN |
| `GET /api/teacher/plays?sessionId=...` | Teacher auth | Xem kết quả theo tiết |
| `GET /api/teacher/export?sessionId=...&type=summary|events` | Teacher auth | Tải hai loại CSV |

### 11.1. Điều kiện idempotency và transaction

- `play/start`: dùng ID có thể dự đoán **phía server** theo `sessionId + deviceId`, kiểm tra và tạo trong transaction. Nếu đã có, không thay tên/lớp hoặc reset tiến độ.
- `answer`: trong transaction, kiểm tra eventId chưa tồn tại, play đang `QUESTION` đúng trạm, version hợp lệ; tạo event và cập nhật `attemptsByStation` / `wrongByStation` / `phase`. Nếu event đã tồn tại, trả kết quả của sự kiện đã lưu, không tạo lượt trả lời mới.
- `ack`: chỉ hợp lệ từ `EXPLANATION`. Với trạm 1–4 → WAIT_PIN; với trạm 5 có thể chuyển tới màn hình kết thúc và nhận `finish`.
- `unlock`: chỉ hợp lệ ở WAIT_PIN đúng trạm và đúng PIN; ghi event và chuyển QUESTION trạm mới một lần.
- `finish`: chỉ hợp lệ khi trạm 5 đúng và đã hiển thị chốt; ghi `completedAt`, phase COMPLETED; lệnh lặp lại không thay kết quả.
- Không để browser tự truyền `isCorrect`, `attemptNo`, `completedAt`, `newStation` làm dữ liệu đáng tin.

### 11.2. Cấu trúc dữ liệu trả về tối thiểu

API có thể sử dụng JSON dạng: `playId`, `sessionId`, `currentStation`, `phase`, `attemptsByStation`, `hintsByStation`, `firstTryCorrectCount`, `totalAttempts`, `version`. Chỉ trả `explanation` khi backend đã xác nhận đáp án đúng của câu đó. Không trả danh sách PIN hoặc đáp án đúng của các câu tương lai.

# 12. Thiết kế UI/UX

## 12.1. Bảy màn hình học sinh

| Màn hình | Yêu cầu |
|---|---|
| 01. Bắt đầu | Tên trò chơi, nhập họ tên, dropdown lớp, nút Bắt đầu |
| 02. Giới thiệu | Robot, câu chuyện phòng thí nghiệm, bản đồ 5 trạm, hướng dẫn ngắn |
| 03. Trạm câu hỏi | Tên trạm, tiến độ 1/5…5/5, câu hỏi, 2 nút A/B, cảnh robot |
| 04. Sai & gợi ý | Thông báo khích lệ, gợi ý mức 1–3, chọn lại; không xóa lựa chọn trước khỏi dữ liệu |
| 05. Đúng & chốt kiến thức | Đáp án, tại sao đúng, mô phỏng đúng/sai, điều cần nhớ, nút Tiếp tục |
| 06. Mã mở trạm | 6 ô/ô nhập số, thông báo chờ thầy/cô cung cấp mã, nút Xác nhận |
| 07. Hoàn thành | Robot đến đích, kết quả tóm tắt cá nhân, không có nút chơi lại |

**Nút/nhãn bằng tiếng Việt.** Ưu tiên màn hình máy tính phòng Tin học (1366×768; cần dùng tốt ở 1280×720 và 1024×768), chuột và bàn phím. Không có âm thanh tự phát bắt buộc, không có hiệu ứng nhấp nháy mạnh; độ tương phản đủ đọc, tab/Enter/Space thao tác được. Học sinh có thể xem lại lý thuyết trạm đã hoàn thành ở chế độ chỉ đọc nếu điều này không mở lại câu hỏi.

## 12.2. Phong cách thị giác

Robot 2D thân thiện với học sinh lớp 8; bối cảnh khoa học viễn tưởng/ phòng thí nghiệm. Mỗi trạm có hình minh họa riêng: pin, cửa từ, tường laser, nhiệt độ, linh kiện/thoát hiểm. Thể hiện tiến độ rõ nhưng **không đếm ngược, không xếp hạng tốc độ**; không biến nội dung thành game bấm nhanh.

## 12.3. Cảnh báo và phục hồi

- Lỗi kết nối: “Chưa thể lưu kết quả. Vui lòng thử lại.” Giữ nguyên màn hình, không hiện thành công giả.
- Session chưa mở: “Giáo viên chưa mở hoạt động cho lớp này.”
- PIN sai: “Mã chưa chính xác. Hãy kiểm tra lại mã giáo viên cung cấp.”
- Đã hoàn thành: “Em đã hoàn thành nhiệm vụ trong tiết học này.”
- localStorage không thể sử dụng: “Trình duyệt không lưu được tiến độ. Hãy liên hệ giáo viên.”

# 13. Khu vực giáo viên và xuất dữ liệu

## 13.1. `/teacher` [ĐỀ XUẤT PHƯƠNG ÁN TRIỂN KHAI]

- Đăng nhập Google bằng tài khoản giáo viên. Chỉ cho phép những Firebase Auth UID trong danh sách `ADMIN_UIDS` được cấu hình an toàn ở backend.
- Tạo lớp; tạo tiết với `classCode`, `title`, `startsAt`, `endsAt`, bốn PIN (bắt buộc đủ 6 ký tự và khác nhau).
- Đổi trạng thái DRAFT → ACTIVE → CLOSED. Không cho mở hai tiết ACTIVE cùng lớp.
- Sửa PIN mà không xuất bản lại website; lưu bản ghi ngày cập nhật, không hiển thị mã cho học sinh.
- Xem tổng số lượt, số đã hoàn thành, số lần đúng lần đầu theo câu, số lần thử sai theo câu.
- Xuất CSV `summary` và `events` cho **một session**; dữ liệu có dấu tiếng Việt, dùng UTF-8 BOM để Excel mở thuận lợi. Không xuất PIN.

Nếu Google AI Studio chỉ tạo được cấu hình qua Firebase Console trong lượt đầu, phải ưu tiên đảm bảo backend/học sinh hoạt động thật, sau đó bổ sung `/teacher`; không được xuất CSV công khai như giải pháp tạm.

## 13.2. CSV bắt buộc

- `summary`: session_id, class_code, full_name, device_id [có thể ẩn khi chia sẻ], play_id, started_at, completed_at, status, first_try_correct_count, total_attempts, wrong_attempts, highest_hint_per_station.
- `events`: session_id, play_id, station_no, event_type, attempt_no, selected_option, is_correct, hint_level, created_at.
- Bảo vệ CSV khỏi công thức Excel nguy hiểm: mọi giá trị văn bản có tiền tố `=`, `+`, `-`, `@` cần được xử lý an toàn khi xuất. Không đưa thông tin bảo mật vào CSV.

# 14. Bảo mật, quyền riêng tư và giới hạn

1. Học sinh không đăng nhập, nhưng vẫn chỉ được thao tác trên một lượt riêng qua **cookie/token phiên được backend ký và kiểm tra**; không dùng `playId` biết trước làm bằng chứng quyền truy cập.
2. Firebase Admin SDK **chỉ chạy ở backend**. Firestore Rules không mở quyền đọc/ghi trực tiếp từ client; Cloud Run service account dùng quyền IAM tối thiểu cần thiết.
3. Teacher APIs phải xác minh **Firebase ID token** ở backend và kiểm tra UID allowlist; không bảo vệ bằng cách chỉ giấu nút giao diện.
4. Kiểm tra dữ liệu đầu vào, độ dài tên, chữ số PIN, chống lỗi XSS, bảo vệ hành động cookie bằng SameSite/Origin check. Sử dụng HTTPS.
5. Các thao tác thay đổi trạng thái được transaction hóa; lỗi mạng không được dẫn tới hai lượt hoặc hai event.
6. Không public danh sách học sinh, họ tên, kết quả hoặc PIN. Không dùng tên học sinh làm khóa duy nhất.
7. Dữ liệu họ tên/lớp là dữ liệu học sinh: người quản lý cần phê duyệt mục đích thu thập, người được xem, thời hạn lưu/xóa theo quy định trường. **Không tự đặt thời hạn xóa khi chưa được thống nhất**.
8. Không thiết kế cơ chế vân tay trình duyệt hay ghi IP nhằm ép “1 máy vật lý tuyệt đối”. Chỉ bảo đảm chống trùng trong phạm vi localStorage/cookie còn tồn tại.
9. Tắt chế độ DEMO/mock trong bản Publish; chỉ hiện dữ liệu thật đã lưu Firestore.
10. Không cho sửa/xóa bản ghi từ giao diện học sinh. Giáo viên có thể can thiệp có kiểm soát trong Firebase Console nếu cần xử lý sự cố.

# 15. Phi chức năng, hiệu năng, vận hành

- Tối ưu cho **28 người dùng đồng thời trong một lớp**, kiểm thử cả **56 người dùng trong 2 lớp** vào cùng thời điểm.
- Không đưa ra cam kết tốc độ cố định chưa đo; mục tiêu nghiệm thu là không lỗi ghi trùng, không sai trạng thái, hoạt động ổn định ở số máy trên.
- Frontend cần tải nhanh trên mạng phòng Tin học; hình ảnh và animation nhẹ, không dùng video nền dung lượng lớn.
- Hỗ trợ trình duyệt Chrome phiên bản hiện hành trong phòng Tin; kiểm thử reload, đóng/mở tab và nhiều tab.
- Thời gian lấy từ backend Firestore `serverTimestamp`, giao diện hiển thị múi giờ `Asia/Ho_Chi_Minh`.
- Firestore và Cloud Run có hạn mức/chi phí; kiểm tra quota và billing của tài khoản trước khi Publish. Không khẳng định ứng dụng chắc chắn luôn miễn phí.
- Trò chơi **không cần hoạt động offline**; khi mất mạng phải dừng thao tác đang chờ và cho thử lại cùng event ID.

# 16. Danh sách kiểm thử nghiệm thu (bắt buộc)

| ID | Tình huống kiểm thử | Kết quả mong đợi |
|---|---|---|
| TC01 | Học sinh lần đầu vào URL chung | Nhập tên, chọn lớp, bắt đầu khi lớp có session ACTIVE |
| TC02 | Không có tiết ACTIVE | Hiện thông báo giáo viên chưa mở; không tạo play |
| TC03 | Hai ACTIVE cùng lớp | Báo lỗi cấu hình; không lấy sai tiết |
| TC04 | 28 máy đăng ký gần đồng thời | 28 play khác nhau, không trùng, không mất bản ghi |
| TC05 | Hai lớp cùng chơi | Không trộn dữ liệu giữa session/lớp |
| TC06 | Reload ở trạm 3 | Vẫn ở đúng trạm 3, không nhập lại tên |
| TC07 | Mở thêm tab, bấm Bắt đầu liên tiếp | Cùng một play, không ghi duplicate |
| TC08 | Sau trạm đúng, reload | Hiện chốt kiến thức/chờ PIN đúng pha, không cộng điểm thêm |
| TC09 | Trả lời sai lần 1,2,3 | H1, H2, H3 tăng dần, lưu đủ các lần |
| TC10 | Trả lời sai rồi đúng | Lưu đáp án đầu tiên sai và lần đúng sau; không tính đúng lần đầu |
| TC11 | Trạm 2 câu hỏi về “vì sao” | Đáp án A, không tự đổi thành câu hỏi chọn khối lệnh |
| TC12 | Trạm 4 điều kiện đúng 80°C | Đáp án B; giải thích `> 80` sai tại 80 |
| TC13 | Trạm 5 có 3 linh kiện | Đáp án B; không thêm câu 6 |
| TC14 | Nhập PIN chưa giải đúng trạm | Backend từ chối mở trạm |
| TC15 | PIN sai hoặc PIN chưa đủ 6 số | Không mở trạm, không mất tiến độ |
| TC16 | PIN có số 0 đầu, ví dụ 004216 | Xác thực đúng chuỗi 6 ký tự |
| TC17 | Bốn PIN trong cùng tiết bị trùng | Trang giáo viên từ chối lưu cấu hình |
| TC18 | Giáo viên sửa PIN trong Firestore | Lần xác thực mới dùng PIN mới, không cần Publish |
| TC19 | Sửa localStorage current_station thành 5 | Backend vẫn trả về trạm thật, không bỏ qua |
| TC20 | Gửi lại cùng event_id | Không ghi lại event, không tăng số lần thử |
| TC21 | Reload khi đã COMPLETED | Chỉ thấy kết quả, không có nút chơi lại |
| TC22 | Tiết mới trên cùng máy | Tạo play mới với session_id mới; không ghi đè dữ liệu tiết cũ |
| TC23 | Giáo viên chưa đăng nhập tải CSV | API từ chối; không rò tên học sinh |
| TC24 | Học sinh cố đọc Firestore trực tiếp | Firestore Rules từ chối |
| TC25 | Firestore không kết nối | Báo lỗi thật; không hiển thị “Đã lưu” giả |
| TC26 | Teacher xuất summary và events | Hai CSV đúng tiết, UTF-8, không có PIN |
| TC27 | 56 học sinh của hai lớp thử đồng thời | Không ghi trùng hoặc đổi sai trạng thái |
| TC28 | Đóng session khi học sinh chưa xong | Không mở thêm trạm; trạng thái đang có vẫn còn lưu |

# 17. Kế hoạch triển khai theo thứ tự cho Google AI Studio

**Pha 1 – Cấu trúc và UI:** Tạo React/TypeScript/Node.js, thiết kế 7 màn hình, dữ liệu câu hỏi chính thức ở mục 7, logic state machine, giao diện tiếng Việt. Nếu dùng dữ liệu giả để preview, phải hiện rõ **“DEMO – CHƯA KẾT NỐI FIRESTORE”**.

**Pha 2 – Firebase thật:** Bật tích hợp Firebase Firestore/Auth trong Google AI Studio; tạo schema cần thiết; cấu hình Firebase Admin SDK phía server và security rules deny direct client; tạo/lấy session ACTIVE; tạo play transaction.

**Pha 3 – Engine học tập:** Hoàn thành API answer, gợi ý, chốt kiến thức, ack, nhập bốn PIN, finish; bảo đảm idempotency/event logging.

**Pha 4 – Khôi phục và chống trùng:** device_id ở localStorage; cookie xác nhận lượt; reload/tabs/đã COMPLETED; khóa tạo trùng cùng thiết bị-session.

**Pha 5 – Quản trị và báo cáo:** `/teacher`, xác thực Google của giáo viên, session/PIN, CSV theo session, thống kê cơ bản.

**Pha 6 – Kiểm thử và Publish:** Chạy unit/integration test, kiểm thử Firestore Rules, thử 28 và 56 client, xác nhận không có dữ liệu demo; Publish từ Google AI Studio lên Cloud Run; lấy URL; hoàn thiện hướng dẫn giáo viên.

**Sau mỗi pha:** AI Studio phải tự kiểm tra lỗi TypeScript/build/runtime, sửa lỗi, cập nhật README. Không dừng lại ở ảnh giao diện hoặc pseudo-code rồi nói hoàn thành.

# 18. Gói đầu ra bắt buộc AI Studio phải tạo

1. **Ứng dụng chạy được** trên Preview và bản Publish (khi người dùng cấp quyền môi trường) gồm cả client và server.
2. Mã nguồn TypeScript có cấu trúc rõ: `src/`, `server/`, `shared/` (hoặc bố cục tương đương); không gộp tất cả logic vào một file khổng lồ.
3. `firestore.rules`, schema mô tả/index khi cần, script seed dữ liệu mẫu **không ghi đè dữ liệu production**.
4. `README.md` giải thích cách liên kết Firebase, chọn project/location, cấu hình Cloud Run, xác thực teacher, mở session mới, đổi PIN, export CSV.
5. `env.example` chỉ chứa **tên biến**, không chứa mật khẩu/khóa thật.
6. Các bài kiểm thử hành vi chống trùng, bốn mã PIN và năm đáp án; có chỉ dẫn chạy test.
7. Danh sách chính xác những bước **người dùng phải tự làm** trong Google AI Studio/Firebase khi môi trường yêu cầu cấp phép; không tự nhận là đã Publish nếu thực tế chưa Publish.
8. Hướng dẫn kiểm thử lớp 28 máy, cách đọc dữ liệu trong Firestore và cách tải CSV.

# 19. Tiêu chuẩn hoàn thành (Definition of Done)

Ứng dụng chỉ được coi **HOÀN THÀNH** khi: có thể chọn lớp/tên thật và tạo lượt trên Firestore; reload khôi phục được; 5 câu A/B đúng nội dung/đáp án; sai gợi ý và thử lại; đúng chốt kiến thức; 4 PIN mở từng trạm đúng thứ tự; không chơi lại sau hoàn thành; 2 tab không tạo trùng; giáo viên quản lý được tiết/mã; xuất được CSV riêng của tiết; và đã kiểm thử bảo mật cơ bản. **Giao diện đẹp nhưng không lưu vào Firestore hoặc chỉ giả lập kết quả không đạt nghiệm thu.**

# 20. Các giả định minh bạch và giới hạn nghiên cứu

**Đã được người dùng xác nhận:** Vercel không sử dụng; Google AI Studio Build để phát triển; dùng Firestore; học sinh không đăng nhập; localStorage chống reload trên cùng máy/trình duyệt; 28 học sinh/lớp; nhiều lớp; chỉ lớp 8; chỉ A/B; đúng 5 câu; 4 PIN khác nhau; giáo viên thay PIN không Publish lại; lưu chi tiết và tải dữ liệu.

**[ĐỀ XUẤT THIẾT KẾ – không phải yêu cầu nguyên văn ban đầu]:** trang `/teacher` đăng nhập Google để tạo tiết, sửa PIN và xuất CSV; backend phát hành cookie lượt chơi; giới hạn thử PIN 5 lần/60 giây; dùng Firebase Admin SDK và Firestore Rules deny all; các biện pháp này giúp đáp ứng yêu cầu vận hành và bảo mật. Khi thiếu điều kiện tích hợp, triển khai theo bước và báo đúng tình trạng, không tự bỏ các điều kiện chống trùng/trạng thái.

**Giới hạn khoa học:** Bài gốc đề cập mục tiêu học sinh giải thích và vận dụng trong tình huống mới. Phiên bản sản phẩm đã được chốt **chỉ có 5 câu A/B**, nên dữ liệu chỉ quan sát được lựa chọn, số lần thử, mức gợi ý và hoàn thành. Không kết luận trực tiếp về chất lượng giải thích hoặc khả năng chuyển giao nếu không có phiếu/quan sát riêng ngoài hệ thống.

# 21. Tài liệu tham khảo và cách sử dụng

## 21.1. Tài liệu nguồn của nhà trường

- `Nội dung nghiên cứu học sinh.docx`: bộ 5 câu hỏi A/B và định hướng “Chọn nhánh đúng”.
- `Kich_ban_NCBH_Giai_cuu_Robot_Chon_nhanh_dung.docx`: mục tiêu, quy trình 5 trạm, minh chứng nghiên cứu.
- `Kich_ban_nghien_cuu_bai_hoc_mau_DEBUG.docx`: quan sát dự đoán, thử nghiệm, hỗ trợ và phản tư (tham khảo sư phạm, không thay trọng tâm lớp 8).
- `Go_y_Nghien_cuu_bai_hoc_va_Trien_lam_Tin_hoc_STEM_AI.docx`: định hướng nghiên cứu bài học và triển lãm.

## 21.2. Nguồn kỹ thuật chính thức (kiểm tra 24/10/2026)

- Google AI Studio Build: https://ai.google.dev/gemini-api/docs/aistudio-build-mode
- Google AI Studio full-stack: https://ai.google.dev/gemini-api/docs/aistudio-fullstack.md
- Firebase integration for AI Studio: https://firebase.google.com/docs/ai-assistance/ai-studio-integration
- Publish từ AI Studio: https://ai.google.dev/gemini-api/docs/aistudio-deploying
- Firestore transactions: https://firebase.google.com/docs/firestore/manage-data/transactions
- Firestore Rules và IAM: https://firebase.google.com/docs/firestore/security/rules-conditions
- Firebase Admin SDK: https://firebase.google.com/docs/admin/setup
- Xác thực Firebase ID token: https://firebase.google.com/docs/auth/admin/verify-id-tokens
- Firestore pricing: https://firebase.google.com/docs/firestore/pricing

## 21.3. Câu lệnh cuối gửi Google AI Studio sau khi đính kèm tài liệu

> “Hãy thực hiện đúng toàn bộ tài liệu `Dac_ta_Giai_cuu_Robot_Google_AI_Studio_v1.0.md` làm single source of truth. Ưu tiên tạo ứng dụng full-stack hoạt động thật, kết nối Firebase Firestore thật, 5 trạm A/B, 4 PIN, localStorage + cơ chế chống trùng backend. Không tự bổ sung câu 6, tài khoản học sinh hay Vercel. Tạo các file mã nguồn, chạy kiểm thử và hướng dẫn tôi những thao tác cấp quyền cần thiết để Publish trên Google AI Studio. Khi thiếu quyền/đầu vào, phải nói rõ, không giả lập đã thành công.”
