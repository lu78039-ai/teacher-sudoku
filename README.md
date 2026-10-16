# 尋找班導

用觀察與推理，找出藏在色塊裡的班導。支援手機、平板、電腦與離線遊玩。

## 怎麼玩

- 每行、每列、每個色區各一位班導。
- 彼此不能相鄰，包含斜角。
- 點一下標記 ×，點兩下找班導；滑動可連續標記。
- 三次犯錯結束，同一錯格不重複扣愛心。
- 復原只撤回最新一步，愛心不退回。提示目前隱藏。
- 每關保存最佳時間，重新挑戰可刷新紀錄。

## 開啟遊戲

正式網址：https://lu78039-ai.github.io/teacher-sudoku/dist/index.html

本機執行 node server.cjs，再開啟 http://127.0.0.1:4173/teacher-sudoku/dist/index.html 。直接開 file:// 也能玩，但不能使用 PWA 離線快取與安裝。

## 開發與部署

執行 node scripts/audit-levels.cjs、node scripts/prepare-pwa.cjs、node verify-all.cjs。原始題目索引不可重新排列；顯示與晉級順序由 level-order.js 決定，以保留玩家進度與最佳時間。

確認後才合併與部署完整 dist，保留原網址。PWA 驗收見 [PWA-INSTALL.md](PWA-INSTALL.md)，本次手機優化與新增推理題組見 [qa/mobile-v8/REPORT.md](qa/mobile-v8/REPORT.md)。
