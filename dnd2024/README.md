# 灰燈遺跡：獨立 2024 規則原型

入口：`dnd2024/index.html`。以 HTTP 提供整個 gametest repo，例如在 repo 根目錄執行 `python3 -m http.server 8000`，開 `http://localhost:8000/dnd2024/`。ES modules 與 JSON fetch 不支援直接 file:// 雙擊。

只新增 dnd2024/；不修改原 dwarfossan.html、assets/，不依賴 fuwafuwatavern 的程式或存檔。沒有 Service Worker。localStorage 唯一鍵是 `dnd2024:srd521:save`。

## 目前可玩
- 四個1級預設角色（戰士、遊蕩者、牧師、法師），可改名、選主角；同伴手動／本機 AI 切換。
- 石室探索：相鄰格移動、牆與牆角阻擋、靠近石門搜索、發現守衛進先攻。
- 戰鬥：行動／附贈動作／移動／反應、武器、選定法術、死亡豁免、護盾反應暫停、機會攻擊。
- 戰後取回信物並返回下方入口；短休／長休，本機存檔、匯出／匯入。
- 390×844 手機介面、自有 SVG 示意人物與遺跡圖；中文 UI 字型子集內附。暫用合成環境音，不是正式配樂。

這是架構與可玩路徑原型，不是完整2024實作。未實作項目見 docs/現況.md；不得因數項測試通過而宣稱完整支援。

## 結構
- data/catalog.json：規則資料與來源版本、頁碼；四個角色模板與原創任務。
- js/rules/engine.mjs：唯一驗證／結算、骰子、回合、反應、休息與存檔格式。
- js/controllers/ai.mjs：讀取可見狀態，只提交合法意圖，禁止直接修改HP或資源。
- js/ui/app.mjs：畫面與輸入，從同一狀態產生圖示、數值、按鈕和紀錄。
- css/game.css、assets/：獨立樣式、字型與授權。
- tests/rules.mjs：針對性規則驗證，`node dnd2024/tests/rules.mjs`。

核心程式使用者名稱只經HTML跳脫，存檔需核對版本、角色與法術；匯入失敗保留目前遊戲。

## 戰鬥介面（20261014.4）
戰鬥 UI 使用上方先攻列、大地圖、右下分層指令列與底部 D&D 資源。僅參考毛絨絨版面，不引入其自訂規則。UI 模組為 js/ui/battle.mjs，樣式 css/battle.css；檢查 node dnd2024/tests/battle-ui.mjs。

移動範圍：js/rules/movement.mjs 共用單步驗證器搜尋合法路徑；檢查 node dnd2024/tests/movement.mjs。戰鬥測試場為 16×16，藍格標記總移動花費，點選可逐格移動並暫停處理反應。
