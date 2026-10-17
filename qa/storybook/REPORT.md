# 教室插畫版候選紀錄

此版本依參考圖的暖色教室插畫與圓潤遊戲 UI 方向製作，未部署正式站、未合併 main。延續最新規格：手機頂部兩個圖示與關卡同排、不顯示手機標題列、沒有復原與分數。新色盤仍僅 palette=v2 預覽，不改正式預設。

## 實作

- 新增獨立教室背景與透明班導比讚插畫；不是把完整參考圖貼成介面。標題、對話、規則、選單、按鈕與紀錄均為 HTML。
- 首頁有大人物、彩色立體標題、三條規則卡、綠色開始按鈕及三個功能入口。我的紀錄讀取既有最佳時間，不創建或重設紀錄。
- 遊戲頁使用暖白卡片、柔和厚度與陰影、綠色重來按鈕及藍色規則按鈕；手機下方有班導人物與 HTML 對話框，桌面右側有較大人物。
- 棋盤形狀、答案、題目順序、生命值、手勢及儲存 key 不變。既有棋盤像素頭像與勝利動畫素材保留。
- 首頁現在在所有版型皆暫停遊戲計時；進入遊戲後繼續。

## 素材與提示詞

使用內建 image_gen 工具，沒有使用 CLI 或外部 API key。參考圖只作人物身份與畫風參考。生成後已複製至專案，不依賴工具快取位置。

班導插畫：C:/Users/lu780/Downloads/dog sudoku/dog-sudoku/dist/assets/teacher-storybook-v2.png

教室背景：C:/Users/lu780/Downloads/dog sudoku/dog-sudoku/dist/assets/classroom-storybook-v2.png

班導提示詞：

> Create a production UI character asset, not a screenshot or mockup. Use the attached game reference ONLY as identity and art-style reference: the cheerful middle-aged East Asian male teacher, short spiky black hair, rectangular silver glasses, very broad toothy smile, navy blue polo shirt. Recreate this exact recognizable teacher as a polished friendly storybook/mobile casual-game illustration with warm detailed shading, subtle bold clean outlines, high quality similar to the left-side teacher in reference. Waist-up portrait, front-facing, one hand giving a thumbs-up near chest, other hand relaxed. Entire head, hair, shoulders, and hands fully visible within square canvas, centered, spacious transparent margin 6%, genuine transparent background. No text, no speech bubble, no logo, no UI, no classroom, no border, no pixel art. Designed for both homepage hero and small encouraging coach thumbnail. Save the final image as an asset.

背景提示詞：

> Production background illustration for a cozy Taiwanese classroom logic puzzle game, a clean decorative environment asset with NO text and NO characters, NO UI, NO symbols, NO board grid. Landscape 3:2 composition. Warm hand-painted polished storybook casual mobile game style, cream ivory and warm light oak colors, gentle morning sunlight from tall windows along the far left, blurred mint green chalkboard on far right, green leafy plant framing upper right corner, a subtle wooden desk with small stacked books and a cup of colored pencils at the bottom outer corners. The middle 70% should be softly luminous pale cream and very low detail, suitable for HTML UI cards overlaid on top. Depth of field and painterly atmospheric light, charming inviting classroom, detailed at edges but quiet in center. Not photorealistic, not a UI mockup, no writing whatsoever.

## 驗證

16 項自動檢查全部通過，新增首頁功能與非空/空最佳紀錄測試。原有 249 題唯一解、去重、手勢、錯格鎖定、計時、最佳時間、離線更新等測試保留。

瀏覽器實測：首頁 360×800、390×844、412×915、1366×768 均在一個視窗內顯示完整內容、無水平溢出；遊戲頁另測 768×1024、1920×1080，棋盤與格子正方形、人物對話不遮住操作。量測 layouts.json。

首頁三入口實際點選皆可正常開啟，紀錄空狀態正常。新美術納入 25 個離線預快取資源。瀏覽器無 JavaScript 錯誤；未以 Android/iPhone 實機或投影機驗證。

原始截圖：home-390.png、game-390.png，以及各寬度的 home/game PNG。首頁 gallery index.html 提供並排及桌面檢視。
