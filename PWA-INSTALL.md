# 尋找班導 PWA 安裝與發佈驗收

## 目前狀態

候選分支 feature/pwa-install，正式網址維持 https://lu78039-ai.github.io/teacher-sudoku/dist/index.html 。沒有合併 main 或上傳正式站。

正式站初次檢查：index.html 200，但未連結 Manifest；manifest.webmanifest、sw.js、icons/app-192.png、icons/app-512.png 均 404。原始 HTTP 紀錄：qa/pwa/live-before.json。

候選版：manifest.webmanifest 的 name/short_name 為尋找班導，display 為 standalone；相對 start_url ./index.html、scope ./、id ./ 分別解析到原 GitHub Pages dist 路徑。192/512 PNG 使用現有班導頭像。保留既有題目與 localStorage key。

## 已驗證與未驗證

- 已：本機 Chrome 實際註冊/啟用 Service Worker、16 個離線資源、Manifest 與 PNG HTTP 200、MIME 正確、斷開本機伺服器後重開遊戲與進度保持。
- 已：桌面 Chrome 模擬重新部署，新 worker 先 waiting；點更新後 active、舊 cache 清除，錯誤標記與 1/3 犯錯保持。
- 已：程式測試壞部署不取代上一個成功快取、只刪此 scope 的舊 cache、不攔截外站或其他專案、不清除 localStorage。
- 未：Chrome DevTools Application 面板人工檢查。瀏覽器工具不能直接操作此面板，已以本機診斷頁與自動測試補充，不能視為同一項驗收。
- 未：Android 實機安裝成功、從桌面啟動的實際 standalone 模式、重新部署後正式站 MIME/404。Manifest 設定正確不等於已完成實機安裝。

## 每次更新與部署

1. 修改候選分支後執行 node scripts/audit-levels.cjs、node scripts/prepare-pwa.cjs。
2. 執行 node verify-all.cjs，確認全部檢查通過。
3. 經使用者確認後才合併/部署。上傳完整 dist，包含 icons、assets、manifest.webmanifest、sw.js、pwa.js、wake-lock.js、level-order.js，不能只上傳 index.html。保留原路徑。
4. GitHub Pages 完成部署後，再以下列實機與 DevTools 步驟驗收。

Service Worker 依檔案內容產生版本指紋，Windows/Git 換行不影響版本。每個版本完整預快取，完整下載成功後才等待啟用；遊戲顯示「更新／稍後」。按更新先保存進度再切換與重新載入；選稍後繼續舊版，所有舊版視窗關閉後新版也可接手。斷線使用最後成功版本。重新上線或回到視窗會檢查更新。

## Android Chrome 安裝測試

1. 待候選版部署後，以 Android 的 Chrome 直接開啟上述 HTTPS 網址，勿使用通訊軟體內嵌瀏覽器或 file://。
2. 首次連線等離線資源下載完成；Chrome 選單選「安裝應用程式」，部分版本位於「新增至主畫面」內。確認對話框顯示尋找班導與班導圖示。
3. 從手機桌面的新圖示啟動，確認沒有瀏覽器網址列，仍進入 /teacher-sudoku/dist/index.html 的遊戲。
4. 玩幾格後關閉，重新開啟確認進度；再開飛航模式測試遊戲、圖示、慶祝圖片和關卡選擇。
5. 下一次重新部署後，連網開啟，確認新版本提示、稍後不中斷遊戲、更新後保留進度。

若只有建立捷徑，先檢查遠端 Manifest/圖示的狀態與 MIME、App 是否已安裝、Chrome/裝置支援，再查 Application 的 installability 問題。不要直接清除網站資料，會刪除遊戲進度。

## Chrome DevTools Application 驗收

- Manifest：名稱、192/512 圖示、Start URL、Scope、Display=standalone，無解析與 installability error。正式 Manifest MIME 應為 application/manifest+json（application/json 亦可解析），圖示 image/png。
- Service Workers：來源 /teacher-sudoku/dist/sw.js，scope /teacher-sudoku/dist/，activated 且控制遊戲頁。初次安裝後必要時重載一次。
- Cache Storage：此 scope 的 teacher-sudoku 版本快取包含完整 16 個資源。離線模擬後重載頁面，仍能操作；測完取消 Offline。
- Network：Manifest、SW、CSS、JS、兩張 PNG 圖示、頭像與慶祝圖均無 404。不要用不在快取清單內的隨機網址測試離線 fallback。
- 更新：修改候選內容並重建 sw，部署後回到頁面，確認 waiting、更新提示、切換完成及進度保持。保留多視窗時逐一確認。

參考：Chrome 官方 PWA Debugging https://developer.chrome.com/docs/devtools/progressive-web-apps 、MDN Installability https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable 。

V9：新增 release.json 與逐檔 SHA-256 校驗，完整部署 dist 及根目錄 update.html。舊快取持續顯示 149 關時，部署完成後使用根目錄更新頁；不清除網站資料。詳見 DEPLOY-V9.md。
