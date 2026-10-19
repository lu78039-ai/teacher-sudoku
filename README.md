# 尋找班導

觀察與推理，找出色塊裡的班導。手機、平板、電腦及離線遊玩皆可使用。

- 每行、每列、每個色區各一位；彼此不相鄰，包含斜角。
- 點一下標記 ×，點兩下找班導；滑動連續標記。一般白色 × 可清除。
- 放錯會留下鎖定的紅色 × 並扣一顆愛心，三次犯錯結束。同格不重複扣。
- 沒有復原與分數功能；重來重設本局。提示目前隱藏。
- 自動保存進度與每關最佳時間。設定可開關離線音效與保持亮屏。

正式網址：https://lu78039-ai.github.io/teacher-sudoku/dist/index.html

本機執行 node server.cjs，開啟 /teacher-sudoku/dist/index.html。直接開 file:// 能遊玩，但無法使用 PWA 安裝與離線快取。

V2 候選分支 feature/v2-ui：新 UI 與色盤驗收見 [V2-REVIEW.md](V2-REVIEW.md)。新色盤在 palette-test.html 或 index.html?palette=v2 預覽，待確認後才改預設；尚未部署或合併 main。

驗證：node scripts/audit-levels.cjs、node scripts/prepare-pwa.cjs、node verify-all.cjs。原始題目索引不可重新排列，進度依內部索引保存。PWA 每次內容變更須重建並完整部署，詳見 [PWA-INSTALL.md](PWA-INSTALL.md)。

教室插畫版：獨立班導與背景素材、完整 HTML 首頁與遊戲卡片。素材提示詞及測試見 [qa/storybook/REPORT.md](qa/storybook/REPORT.md)，截圖見 [qa/storybook/index.html](qa/storybook/index.html)。

最新修正：首頁單一插畫、關卡選項不顯示人數；電腦導覽圖示在全螢幕按鈕上方。手動切關須確認，過關自動晉級；雙擊放寬到 500ms，說明見 [修正紀錄](qa/storybook-refine/REPORT.md)。

桌面棋盤最大化：左欄為關卡與操作，右欄為狀態與班導，中央僅棋盤；手機版保留。見 [版型驗證](qa/board-only/REPORT.md)。

題庫共 500 關。第 1–300 關保留原編號與內容；新增第 301–500 關為進階題，包含 8×8 至 12×12，依尺寸與推理分級排序。每題唯一解，並排除旋轉、鏡像與色區重新編號後的重複題。難度分級為演算法估計，不等同真人解題時間。
