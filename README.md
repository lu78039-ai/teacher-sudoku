# 尋找班導

以像素班導頭像為主角的格子邏輯遊戲，提供 148 道唯一解關卡，最大 9×9，支援教室 4K 寬螢幕、手機與平板。

## 開始遊玩

直接用瀏覽器開啟根目錄的 `index.html`（會自動進入遊戲），或開啟 `dist/index.html`，無需安裝套件。也可執行 `node server.cjs`，開啟 http://127.0.0.1:4173。

## 規則與操作

- 每行、每列、每個色區恰好有一位班導；彼此不能相鄰，包含斜對角。
- 單擊標記 ×，雙擊找出班導；按住滑鼠或手指滑過可連續標記 ×。
- 拖曳不覆蓋已找到的班導，一次復原可撤回整段拖曳。
- 找錯位置會顯示心碎動畫與紅色 ×；犯錯三次即失敗。復原不退還犯錯次數，重來會歸零。
- 過關後顯示班導跳舞與隨機讚賞詞，持續五秒，自動進入下一關。
- 可用下拉選單直接選擇任一關；完成最後一關會顯示全部通關訊息。

## 題目與驗證

原始 24 關、第 25–48 關刪去法題組、第 49–148 關推理題組，全部具有唯一解。新增題組另驗證區域連通、無單格色區、可用候選刪去法解出，以及旋轉、鏡射、換色後不重複。

- `node verify.cjs`：檢查關卡、操作、犯錯、存檔、慶祝、晉級與頭像。
- `node generate.cjs`：重建原始題組，保留後續題組。
- `node expand-levels.cjs`：重建第 25–48 關，保留其他題組。
- `node add-100.cjs`：保留前 48 關，重建後續 100 關，需 `seed-9.json` 與 `deduction.cjs`。
- `puzzle-design-report.json`、`reasoning-100-report.json`：題目檢查與推理證明。

## 發佈

將 `dist` 內的 `index.html`、`style.css`、`app.js`、`levels.js` 與整個 `assets` 資料夾上傳至 GitHub Pages 或其他靜態網站空間。`assets/teacher-pixel-avatar.png` 是透明背景的像素班導頭像。

進度保存在各裝置的瀏覽器，裝置之間不會同步；存檔支援既有版本的進度。Google Fonts 無法載入時會使用系統字型。

第三次犯錯會跳出隨機鼓勵彈窗，共 10 句帶有悲傷、吐槽與玩笑的詞句；可選擇重新挑戰同一關，或查看棋盤。

根目錄的 `index.html` 是入口，會自動前往 `dist/index.html`，可讓整個專案以 GitHub Pages main / (root) 發佈。另提供「尋找班導-GitHub發布版.zip」，解壓後直接將其中檔案放在儲存庫根目錄即可，無須 dist 資料夾。

Mobile UI V1.0 已恢復「提示」功能，可從工具列使用。

過關圖片使用 `assets/teacher-pixel-victory.png`：全身像素班導，張開雙手、抬腳跳舞，透明 PNG；棋盤仍使用 `teacher-pixel-avatar.png`。

滑動標記會切換空白與 ×；同一段滑動每格僅切換一次，保留班導與紅色錯誤 ×，整段操作可一次復原。


## Mobile UI V1.0（feature/mobile-ui 候選版）

手機與平板（視窗寬度 1099px 以下）分成首頁與遊戲頁。首頁提供介紹、規則與「開始挑戰」，進入後改為精簡 App Bar、關卡選單、遊戲狀態、棋盤與四個操作按鈕。返回首頁不會重設本局，首頁暫停計時；重新載入保留進度。

新增 `dist/mobile.css`、`dist/mobile-ui.js`，發佈時必須一併上傳。所有路徑維持相對路徑，正式入口仍為 `/dist/index.html`，未加入 PWA。桌面維持原有三欄版面。

驗證指令：`node verify.cjs`、`node verify-mobile.cjs`。測試結果與修改前後截圖見 `qa/mobile-ui/REPORT.md`。這是待確認的本機功能分支，尚未合併或部署到正式站。
