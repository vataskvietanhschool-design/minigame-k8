# GIẢI CỨU ROBOT – CHỌN NHÁNH ĐÚNG NHẤT

Ứng dụng web giáo dục full-stack phục vụ nghiên cứu bài học môn Tin học lớp 8 (Bài 14: Cấu trúc điều khiển trong Scratch) được xây dựng theo đúng tài liệu đặc tả **ROBOT-RESCUE-SRS-1.0**.

---

## 1. Giới thiệu & Cấu trúc Sư phạm

Trò chơi đưa học sinh vào hành trình giải cứu robot qua **đúng 5 trạm thử thách**, mỗi trạm là **1 câu hỏi trắc nghiệm A/B** chuyên sâu về cách chọn cấu trúc rẽ nhánh `if then` (khuyết else) và `if then else` (đầy đủ):

1. **Trạm 1 – Khởi động robot:** Kiểm tra mức pin `pin ≥ 50%`. (Đáp án: **A. if then**).
2. **Trạm 2 – Mở cửa phòng thí nghiệm:** Thẻ từ hợp lệ thì mở cửa, không hợp lệ vẫn đóng. (Đáp án: **A. Vì chỉ cần thực hiện hành động khi điều kiện đúng**).
3. **Trạm 3 – Vượt tường laser:** Mã đúng đèn xanh, mã sai đèn đỏ. (Đáp án: **B. if then else**).
4. **Trạm 4 – Sửa lỗi hệ thống:** Nhiệt độ đúng bằng 80°C với điều kiện `nhiệt độ > 80°C`. (Đáp án: **B. “Nhiệt độ an toàn”, dùng if then else**).
5. **Trạm 5 – Thoát hiểm:** Thu thập 3 linh kiện với điều kiện ít nhất 5 linh kiện. (Đáp án: **B. “Chưa đủ linh kiện”, dùng if then else**).

### Cơ chế trò chơi
- **Gợi ý tăng dần khi chọn sai:** H1 (lần 1) → H2 (lần 2) → H3 (lần 3+), học sinh được suy nghĩ và chọn lại không giới hạn lượt.
- **Chốt lý thuyết 4 phần khi đúng:** Đáp án phù hợp, lý do sư phạm, diễn biến đúng/sai, điều cần ghi nhớ.
- **4 Mã PIN chuyển trạm (6 chữ số khác nhau):** Do giáo viên trực tiếp cung cấp trên lớp sau khi học sinh nghe chốt lý thuyết. Mã được giáo viên thay đổi linh hoạt mà không cần build lại ứng dụng.
- **Chống trùng & Khôi phục phiên:** Xác thực qua cặp `sessionId + deviceId` và cookie ký bảo mật HttpOnly; học sinh chỉ được tạo duy nhất một lượt chơi trong một tiết học, tải lại trang vẫn giữ nguyên vị trí, không thể chơi lại sau khi hoàn thành.

---

## 2. Cấu trúc Thư mục Dự án

```
├── api/index.ts                # Entry serverless function cho Vercel (export Express app)
├── scripts/seed.ts             # Tạo sẵn các lớp 8C1-8C9 trên Firestore (npm run seed)
├── firebase.json / .firebaserc # Cấu hình Firebase CLI (deploy rules & indexes)
├── firebase-blueprint.json     # Schema blueprint cho collections Firestore
├── firestore.rules             # Quy tắc bảo mật Firestore (deny all direct client SDK)
├── firestore.indexes.json      # Index cho truy vấn collection group "events"
├── vercel.json                 # Cấu hình build & rewrite cho Vercel
├── package.json                # Dependencies, scripts
├── server.ts                   # Server chạy local (Vite middleware khi dev / static khi production)
├── server/
│   ├── app.ts                  # Tạo Express app dùng chung cho local và Vercel
│   ├── auth.ts                 # Ký token cookie, middleware bảo vệ học sinh & giáo viên
│   ├── db.ts                   # Repository Firestore giao dịch & kho lưu trữ an toàn
│   ├── firebaseAdmin.ts        # Khởi tạo Firebase Admin SDK
│   ├── gameRules.ts            # Logic kiểm tra A/B, gợi ý, PIN, chống injection CSV
│   ├── gameRules.test.ts       # Bộ kiểm thử đơn vị logic trò chơi
│   ├── integration.test.ts     # Bộ kiểm thử tích hợp vòng đời phiên chơi
│   └── routes.ts               # Các API routes (/api/play/*, /api/teacher/*)
├── shared/
│   ├── questions.ts            # Dữ liệu chính thức 5 câu hỏi, gợi ý, chốt kiến thức
│   └── types.ts                # Định nghĩa kiểu dữ liệu TypeScript dùng chung
└── src/
    ├── App.tsx                 # Điều phối 7 màn hình & khôi phục trạng thái
    ├── components/
    │   ├── HeaderBar.tsx       # Thanh tiến độ 5 trạm, thông tin học sinh
    │   ├── RobotAvatar.tsx     # Nhân vật robot SVG hoạt họa biểu cảm
    │   ├── ScratchBlockVisual.tsx # Mô hình trực quan khối lệnh Scratch màu cam
    │   ├── StationIllustration.tsx # Trực quan hóa bối cảnh 5 trạm
    │   └── TeacherDashboard.tsx # Cổng điều hành của giáo viên
    ├── utils/
    │   ├── api.ts              # API client wrapper
    │   └── storage.ts          # Quản lý device_id & current_play ở localStorage
    └── views/
        ├── Screen01Start.tsx   # Nhập họ tên & chọn lớp
        ├── Screen02Intro.tsx   # Cốt truyện & lộ trình 5 trạm
        ├── Screen03Question.tsx # Đọc tình huống & chọn A/B
        ├── Screen04WrongHint.tsx # Báo sai & hiển thị gợi ý H1-H3
        ├── Screen05CorrectTheory.tsx # Chốt 4 phần lý thuyết khi đúng
        ├── Screen06WaitPin.tsx # Ô nhập 6 chữ số mã PIN
        ├── Screen07Completed.tsx # Bảng kết quả & xem lại lý thuyết
        └── ReviewModal.tsx     # Xem lại trạm đã hoàn thành
```

---

## 3. Chạy Kiểm Thử (Unit & Integration Tests)

Chạy toàn bộ kiểm thử (logic câu hỏi, PIN, gợi ý, chống injection CSV, vòng đời phiên, idempotency). Lệnh này luôn dùng kho dữ liệu local `.data/store.json`, không ghi vào Firestore thật:
```bash
npm test
```

Kiểm tra cú pháp TypeScript & Linting:
```bash
npm run lint
```

Kiểm tra build production:
```bash
npm run build
```

---

## 4. Khu Vực Quản Trị Giáo Viên (`/teacher`)

- **Đường dẫn:** Nhấp vào nút **"Giáo viên"** trên góc phải thanh điều hướng hoặc truy cập đường dẫn `/teacher`.
- **Tài khoản được phân quyền:** Các email Google liệt kê trong biến môi trường `TEACHER_EMAILS`.
- **Chức năng chính:**
  1. **Tạo tiết học:** Chọn lớp (8C1 - 8C9), nhập tiêu đề, tự động sinh hoặc tự đặt 4 mã PIN 6 chữ số khác nhau.
  2. **Kích hoạt / Đóng tiết:** Chuyển trạng thái `DRAFT` → `ACTIVE` → `CLOSED`. Hệ thống tự động ngăn chặn việc mở 2 tiết ACTIVE cùng một lớp.
  3. **Đổi mã PIN:** Giáo viên có thể đổi mã PIN bất kỳ lúc nào ngay trên giao diện mà không cần xuất bản lại ứng dụng.
  4. **Theo dõi trực tiếp:** Bảng hiển thị danh sách học sinh đang tham gia, trạm hiện tại, số lần thử, số câu đúng ngay lần đầu.
  5. **Xuất báo cáo CSV:**
     - **CSV Tổng hợp (Summary):** Họ tên, mã máy, tiến độ, số câu đúng lần đầu, số lần sai, mức gợi ý từng trạm.
     - **CSV Sự kiện (Events):** Nhật ký chi tiết từng cú bấm A/B, mã trạm, thời gian server.
     - Tệp tải về có **UTF-8 BOM** để mở trực tiếp trong Microsoft Excel không bị lỗi phông tiếng Việt, đồng thời được bảo vệ khỏi tấn công Formula Injection (`=`, `+`, `-`, `@`).

---

## 5. Hướng Dẫn Vận Hành Trên Phòng Tin Học (28 Học Sinh/Lớp)

1. **Chuẩn bị trước giờ học:**
   - Giáo viên vào `/teacher`, kiểm tra tiết học của lớp (ví dụ lớp 8C1) đang ở trạng thái **ACTIVE**.
   - Ghi lại 4 mã PIN của tiết (ví dụ: `102938`, `482019`, `739104`, `004216`).
2. **Trong giờ học:**
   - Tất cả 28 máy học sinh mở cùng một đường link URL của ứng dụng.
   - Học sinh nhập Họ và tên (ví dụ: "Nguyễn Văn An") và chọn lớp "8C1" → nhấn "Bắt đầu giải cứu Robot".
   - Học sinh tự trải nghiệm và vượt qua Trạm 1. Sau khi học sinh trả lời đúng và xem chốt kiến thức, màn hình sẽ dừng ở bước **"Nhập mã chuyển trạm"**.
   - Giáo viên hướng dẫn/nhận xét trên lớp và cung cấp Mã PIN 1 (Trạm 1 → 2) cho cả lớp để cùng mở Trạm 2.
   - Quy trình tương tự lặp lại cho các Trạm 2, 3, 4. Sau Trạm 5, học sinh hoàn thành toàn bộ nhiệm vụ.
3. **Sau giờ học:**
   - Giáo viên vào `/teacher`, nhấn nút **"Đóng tiết học"** để khóa lượt và tải 2 tệp CSV về máy tính lưu trữ minh chứng nghiên cứu bài học.

---

## 6. Thiết Lập Firebase (project `minigame-k8`)

1. **Firestore:** Dùng database mặc định của project. Biến `FIRESTORE_DATABASE_ID` và `VITE_FIREBASE_FIRESTORE_DATABASE_ID` đặt là `(default)`.
2. **Service account key:** Firebase Console → Project settings → Service accounts → **Generate new private key**. Mở file JSON tải về, nối thành một dòng và dán vào biến `FIREBASE_SERVICE_ACCOUNT_KEY` (bọc trong dấu nháy đơn trong `.env`). Tuyệt đối không commit file này.
3. **Đăng nhập Google:** Authentication → Sign-in method → bật **Google**.
4. **Authorized domains:** Authentication → Settings → Authorized domains → thêm domain Vercel (ví dụ `ten-du-an.vercel.app`) và domain riêng nếu có.
5. **Deploy rules & index** bằng service account trong `.env` (không cần Firebase CLI):
   ```bash
   npm run deploy:firestore
   ```
   Service account Admin SDK mặc định không có quyền tạo index. Nếu báo lỗi 403 ở bước index, tạo thủ công: Firestore → Indexes → **Single field** → **Add exemption** → Collection ID `events`, Field path `sessionId`, bật **Ascending** cho cả phạm vi *Collection* và *Collection group*.
   Nếu đã cài Firebase CLI và đăng nhập bằng tài khoản Owner thì có thể dùng `firebase deploy --only firestore`.
6. **Tạo sẵn các lớp 8C1-8C9:**
   ```bash
   npm run seed
   ```

---

## 7. Chạy Local

```bash
npm install
cp .env.example .env   # rồi điền giá trị thật
npm run dev            # http://localhost:3000
```

Muốn chạy thử không cần Firebase: đặt `STORAGE_MODE="local"` và `ALLOW_DEMO_TEACHER="true"` trong `.env`.

---

## 8. Deploy Lên Vercel

1. Đẩy code lên GitHub, vào Vercel → **Add New Project** → chọn repo. Vercel tự đọc `vercel.json` (build `npm run build`, output `dist`, API ở `api/index.ts`).
2. Vào **Settings → Environment Variables**, thêm các biến sau cho môi trường Production (và Preview nếu cần):
   - `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`, `VITE_FIREBASE_FIRESTORE_DATABASE_ID`: cấu hình web public, lấy từ `.env`.
   - `FIREBASE_PROJECT_ID` = `minigame-k8`, `FIRESTORE_DATABASE_ID` = `(default)`.
   - `FIREBASE_SERVICE_ACCOUNT_KEY`: nội dung JSON service account (dán nguyên văn, không cần dấu nháy).
   - `PLAY_TOKEN_SECRET`: chuỗi ngẫu nhiên dài, bắt buộc.
   - `TEACHER_EMAILS`: email giáo viên, phân tách bằng dấu phẩy.

   **Không** đặt `STORAGE_MODE` hay `ALLOW_DEMO_TEACHER` trên Vercel.
3. Nhấn **Deploy**. Sau khi có domain, thêm domain đó vào Authorized domains của Firebase (mục 6.4).
4. Kiểm tra nhanh: mở `https://<domain>/api/system/status` phải trả về `"storageMode":"FIRESTORE"` và `"isFirestoreConnected":true`.

**Lưu ý:** bộ đếm chặn nhập sai PIN (5 lần/phút) lưu trong bộ nhớ của từng instance serverless nên chỉ mang tính tương đối.

# minigame-k8
