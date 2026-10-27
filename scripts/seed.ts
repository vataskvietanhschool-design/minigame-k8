import 'dotenv/config';
import { seedClassesIfEmpty, DEFAULT_CLASSES } from '../server/db.js';

const created = await seedClassesIfEmpty();
if (created > 0) {
  console.log(`[Seed] Đã tạo ${created} lớp: ${DEFAULT_CLASSES.map((c) => c.code).join(', ')}`);
} else {
  console.log('[Seed] Collection "classes" đã có dữ liệu hoặc đang ở chế độ local, không tạo thêm.');
}
process.exit(0);
