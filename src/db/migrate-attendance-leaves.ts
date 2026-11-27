import "dotenv/config";
import { sql } from "drizzle-orm";
import { db } from "./index";

async function main() {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS attendance_leaves (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      leave_date VARCHAR(10) NOT NULL,
      reason TEXT NOT NULL,
      attachment VARCHAR(255) NULL,
      attachment_public_id VARCHAR(255) NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'pending',
      reviewed_by INT NULL,
      reviewed_at DATETIME NULL,
      review_note TEXT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT attendance_leaves_user_fk FOREIGN KEY (user_id) REFERENCES users(id),
      CONSTRAINT attendance_leaves_reviewer_fk FOREIGN KEY (reviewed_by) REFERENCES users(id),
      INDEX attendance_leaves_user_date_idx (user_id, leave_date)
    )
  `);

  console.log("attendance_leaves table ensured successfully!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Failed to create attendance_leaves table:", err);
  process.exit(1);
});
