CREATE TABLE IF NOT EXISTS study_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  word TEXT NOT NULL,
  chinese_sentence TEXT NOT NULL,
  user_translation TEXT,
  ai_feedback TEXT,
  created_at INTEGER DEFAULT (strftime('%s', 'now'))
);