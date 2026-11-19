# ROOMIE AI 日本版デモ / Japan Edition Demo (v1.1)

> 本デモは架空の物件・データを使用したシミュレーションです。媒介・契約・重要事項説明・空室や料金の確定は行いません。
> This is a client-side simulation with fictional sample data. It is not a live service.

設計書 / Spec: [`../TECHNICAL_DESIGN_JP.md`](../TECHNICAL_DESIGN_JP.md)

---

## 日本語

### 起動方法
Node 20 以上が必要です。

```bash
npm install
npm run dev      # 開発サーバー
npm test         # テスト（Vitest）
npm run build    # 型チェック + 本番ビルド（dist/）
npm run preview  # ビルド結果の確認
```

### 画面構成
- **左：お客様チャット**（スマートフォン風）。利用目的への同意が済むまで質問は始まりません。
- **右：管理会社ダッシュボード**。問い合わせ件数、仮予約、有人対応キュー、サンプル物件、活動ログ。
- **スマートフォン幅**では「お客様｜管理画面」のタブで切り替えます。
- **ヘッダーのデモ操作**：シナリオ切替（標準3物件／高家賃のみ）、営業時間内／外、リセット。

### 商談前の確認手順（設計書 11章）
1. シークレットウィンドウで開き、同意画面が最初に表示されることを確認。
2. 同意して開始 →「7〜10万円」→「すぐに」→「飼っていない」→「来店して見学」→「土曜 11:00」
   → 「仮予約」と表示され（「予約確定」ではない）、家賃合計 86,000円。
3. リセット →「〜7万円」→「1ヶ月以内」→「飼っている」→ 担当者へ引き継ぎ、キュー1件。
4. 「弁護士に相談したい」と入力 → 有人対応（優先度：通常、理由：法務・契約）。
5. 「外国人は入居できますか」と入力 → 有人対応（優先度：高、理由：入居差別）。ボットは回答しません。
6. 「営業時間外」に切り替えて内見を予約 → 翌営業日に確認する旨のメッセージ。
7. IME変換中にEnter → 確定するまで送信されません。

手順1〜6と7（IME）は自動テストでも確認しています（`src/App.test.tsx`、`ChatInput.test.tsx`）。

### 補足
- 営業時間モードは、初回表示時に**日本時間の実際の時刻**から決まります（平日9:00〜18:00）。夜間の商談では「営業時間内」に切り替えてから始めてください。
- 入力内容はこのブラウザの localStorage にのみ保存されます。リセットで削除されます。

---

## English

### Run
Requires Node 20+.

```bash
npm install
npm run dev      # dev server
npm test         # unit + UI tests (Vitest)
npm run build    # typecheck + production build to dist/
npm run preview  # serve the build locally
```

Any static host works (Vercel, Netlify, GitHub Pages). Deploy the `dist/` folder.

### What's implemented
| Spec | Where |
|------|-------|
| F1 Renter chat, quick replies, IME-safe input | `src/components/RenterChat/` |
| F2 Consent gate (利用目的 + checkbox) | `src/components/ConsentGate/` |
| F3–F4 Qualification and matching on 家賃＋管理費 | `src/bot/flow.ts`, `src/domain/matching.ts` |
| F5 内見 仮予約 (現地待ち合わせ / 来店) | `src/bot/flow.ts`, `src/domain/slots.ts` |
| F6 Owner dashboard | `src/components/OwnerDashboard/` |
| F7 Handoff keywords, priority, business-hours copy | `src/config/rules.ts`, `src/domain/handoff.ts` |
| F8 Versioned localStorage persistence | `src/storage/localStore.ts` |
| F9 Reset, scenario switch, open/closed toggle | `src/components/Controls/DemoControls.tsx` |

All Japanese copy lives in `src/i18n/ja.ts`. All money is integer yen. All business-hour logic uses Asia/Tokyo.

### Decisions where the spec was ambiguous
1. **Budget bands do not overlap.** Section 8.3 only checks `total <= max`, but Section 9 expects 「7〜10万円」 to match unit B (86,000円). With an upper bound alone, unit A (70,000円) would match first. The bands are therefore 〜70,000 / 70,001〜100,000 / 100,001〜150,000円, so each button shows the sample the acceptance script expects, and 「10万円以上」 shows unit C.
2. **Chat line breaking.** Section 10.2 suggests `word-break: break-all`. That splits numbers like 「86,000円」 and 「11:00」 in half. Japanese already wraps between characters, so the bubbles use `line-break: strict` (禁則処理), `word-break: auto-phrase` where supported, and `overflow-wrap: anywhere` as the fallback.
3. **Weekend viewing slots.** Section 9 says slots fall on business days, but the script in Section 7.2 uses 「土曜 11:00 / 14:00」. The demo keeps the Saturday slots from the script. The first slot is the next business day at 17:00.
4. **Business-hours mode** starts from the real JST clock, and the toggle overrides it, as Section 8.5 describes.

### Tests
69 tests: normalization (NFKC, full-width digits), matching edge cases, validation, handoff keywords, JST business hours, the bot flow paths, the reducer and storage, the IME guard, and the full acceptance script driven through the UI.
