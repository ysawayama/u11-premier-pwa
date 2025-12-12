import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// チームID一覧（上記の出力から）
const TEAMS = {
  ESFORCO: "8a8da5d6-ed98-48f3-8140-783908399fa0",
  vinculo: "b57cd2ec-38ca-4765-91ce-9f1c920b5d48",
  東海岸: "f6a92320-dad2-48a9-95e0-046e7004fd8b",
  PALAVRA: "7d2c5a9d-3c44-4210-9599-b98dfa8bd626",
  SFAT伊勢原: "1789a425-ad14-4355-8d71-6793320ef352",
  TDFC: "fd199536-7747-40f0-b058-ccc8b1b62d38",
  あざみ野: "4be41b3d-2712-4db1-ad38-b5c74425db16",
  あざみ野K: "2e0cb14e-5a4f-440d-a341-3c9e6112355d",
  大豆戸: "7b4c8e6b-2333-4414-8262-a7a05e8193c9",
  横浜ジュニオール: "45e82eee-9428-4b40-8568-bc4af17c48b1",
  黒滝: "90e69fe7-38b9-4bf7-afaa-e729ef95decc",
};

// 画像から読み取った不足している試合データ
// 形式: [ホームチーム, アウェイチーム, ホームスコア, アウェイスコア, 日付]
const missingMatches = [
  // ESFORCO行
  ["ESFORCO", "大豆戸", 8, 0, "2025-06-28"], // 既存
  ["ESFORCO", "あざみ野", 2, 1, "2025-09-28"], // 既存
  ["ESFORCO", "vinculo", 5, 0, "2025-04-27"], // 不足
  ["ESFORCO", "横浜ジュニオール", 2, 1, "2025-04-19"], // 既存
  ["ESFORCO", "黒滝", 3, 2, "2025-06-01"], // 既存
  ["ESFORCO", "TDFC", 4, 2, "2025-09-13"], // 既存
  ["ESFORCO", "PALAVRA", 3, 1, "2025-07-19"], // 既存 (実際は PALAVRA vs ESFORCO 1-3)
  ["ESFORCO", "SFAT伊勢原", 9, 1, "2025-08-02"], // 既存
  ["ESFORCO", "東海岸", 9, 0, "2025-06-01"], // 既存
  ["ESFORCO", "あざみ野K", 8, 0, "2025-04-19"], // 既存

  // 大豆戸行
  ["大豆戸", "ESFORCO", 0, 8, null], // 未実施?
  ["大豆戸", "あざみ野", 6, 3, "2025-07-06"], // 既存
  ["大豆戸", "vinculo", 0, 5, "2025-07-20"], // 既存
  ["大豆戸", "横浜ジュニオール", 5, 0, "2025-06-22"], // 既存 (実際は横浜J vs 大豆戸 0-5)
  ["大豆戸", "黒滝", 2, 4, "2025-07-12"], // 既存
  ["大豆戸", "TDFC", 2, 0, "2025-05-18"], // 既存
  ["大豆戸", "PALAVRA", 6, 1, "2025-06-22"], // 既存
  ["大豆戸", "SFAT伊勢原", 1, 0, "2025-09-21"], // 既存 (実際はSFAT vs 大豆戸 0-1)
  ["大豆戸", "東海岸", 13, 0, "2025-09-20"], // 既存
  ["大豆戸", "あざみ野K", 5, 1, "2025-05-18"], // 既存

  // あざみ野FC行 - いくつか不足
  ["あざみ野", "ESFORCO", 1, 2, "2025-09-28"], // 既存
  ["あざみ野", "大豆戸", 3, 6, "2025-07-06"], // 既存 (逆から)
  ["あざみ野", "vinculo", 0, 4, "2025-07-21"], // 既存
  ["あざみ野", "黒滝", 4, 3, "2025-05-25"], // 既存 (逆)
  ["あざみ野", "TDFC", 1, 0, "2025-07-20"], // 既存 (逆)
  ["あざみ野", "PALAVRA", 6, 0, "2025-04-27"], // 既存
  ["あざみ野", "SFAT伊勢原", 2, 1, "2025-09-27"], // 既存 (逆)
  ["あざみ野", "東海岸", 7, 0, "2025-04-27"], // 既存
  ["あざみ野", "あざみ野K", 9, 0, "2025-07-06"], // 既存

  // vinculo行 - 不足多い
  ["vinculo", "ESFORCO", 1, 3, "2025-09-14"], // 既存
  ["vinculo", "大豆戸", 5, 0, "2025-07-20"], // 既存 (逆)
  ["vinculo", "あざみ野", 4, 0, "2025-07-21"], // 既存 (逆)
  ["vinculo", "横浜ジュニオール", 3, 1, "2025-08-30"], // 既存
  ["vinculo", "黒滝", 2, 0, "2025-09-21"], // 既存
  ["vinculo", "TDFC", 7, 1, "2025-06-21"], // 既存 (逆)
  ["vinculo", "PALAVRA", 6, 1, "2025-04-26"], // 既存
  ["vinculo", "SFAT伊勢原", 6, 1, "2025-09-21"], // 既存 (逆)
  ["vinculo", "東海岸", 9, 1, "2025-09-15"], // 既存
  ["vinculo", "あざみ野K", 4, 0, "2025-07-21"], // 既存

  // 横浜ジュニオール行 - 確認
  ["横浜ジュニオール", "ESFORCO", 1, 2, "2025-04-19"], // 既存 (逆)
  ["横浜ジュニオール", "大豆戸", 0, 5, "2025-06-22"], // 既存
  ["横浜ジュニオール", "あざみ野", 3, 1, "2025-04-29"], // 既存 (逆)
  ["横浜ジュニオール", "vinculo", 1, 3, "2025-08-30"], // 既存 (逆)
  ["横浜ジュニオール", "黒滝", 2, 2, "2025-06-21"], // 既存 (逆)
  ["横浜ジュニオール", "TDFC", 2, 2, "2025-09-20"], // 既存
  ["横浜ジュニオール", "PALAVRA", 0, 0, "2025-06-22"], // 既存
  ["横浜ジュニオール", "SFAT伊勢原", 4, 2, "2025-08-31"], // 既存 (逆)
  ["横浜ジュニオール", "東海岸", 4, 0, "2025-09-20"], // 既存
  ["横浜ジュニオール", "あざみ野K", 12, 2, "2025-07-12"], // 既存

  // 黒滝行
  ["黒滝", "ESFORCO", 2, 3, "2025-06-01"], // 既存 (逆)
  ["黒滝", "大豆戸", 4, 2, "2025-07-12"], // 既存 (逆)
  ["黒滝", "あざみ野", 3, 4, "2025-05-25"], // 既存
  ["黒滝", "vinculo", 0, 2, "2025-09-21"], // 既存 (逆)
  ["黒滝", "横浜ジュニオール", 2, 2, "2025-06-21"], // 既存
  ["黒滝", "TDFC", 4, 2, "2025-05-24"], // 既存 (逆)
  ["黒滝", "PALAVRA", 7, 1, "2025-07-19"], // 既存 (逆)
  ["黒滝", "SFAT伊勢原", 8, 2, "2025-08-31"], // 既存 (逆)
  ["黒滝", "東海岸", 1, 1, "2025-09-28"], // 既存 (逆)
  ["黒滝", "あざみ野K", 4, 0, "2025-06-21"], // 既存
];

// 実際に不足している試合を追加
// 画像を見直して正確に追加が必要なものだけ抽出
const toAdd = [
  // ESFORCOのホーム試合で不足
  { home: "ESFORCO", away: "vinculo", homeScore: 5, awayScore: 0, date: "2025-04-27" },

  // vinculoのホーム試合で不足
  { home: "vinculo", away: "大豆戸", homeScore: 4, awayScore: 0, date: "2025-12-20" },  // 予定?

  // 横浜ジュニオールのホーム試合
  { home: "横浜ジュニオール", away: "あざみ野", homeScore: 3, awayScore: 1, date: "2025-04-29" }, // あざみ野 1-3 横浜ジュニオール は既存

  // TDFCのホーム試合で不足
  { home: "TDFC", away: "横浜ジュニオール", homeScore: 2, awayScore: 2, date: "2025-09-20" }, // 既存は横浜J vs TDFC
  { home: "TDFC", away: "SFAT伊勢原", homeScore: 5, awayScore: 0, date: "2025-08-24" }, // 既存は SFAT vs TDFC 0-5

  // PALAVRAのホーム試合
  { home: "PALAVRA", away: "東海岸", homeScore: 3, awayScore: 2, date: "2025-04-27" }, // 東海岸 3-2 PALAVRA は既存、これは逆

  // 東海岸のホーム試合で不足
  { home: "東海岸", away: "あざみ野", homeScore: 0, awayScore: 7, date: "2025-04-27" }, // あざみ野 7-0 東海岸は既存

  // あざみ野Kのホーム試合で不足
  { home: "あざみ野K", away: "ESFORCO", homeScore: 0, awayScore: 8, date: "2025-04-19" }, // ESFORCO 8-0 あざみ野Kは既存
];

// ここで画像をもう一度確認して、本当に不足しているデータのみを追加する必要がある
// 現在のDBデータと画像を比較

async function checkAndAdd() {
  // 現在のシーズンを取得
  const { data: season } = await supabase
    .from("seasons")
    .select("id")
    .eq("is_current", true)
    .single();

  if (!season) {
    console.log("Current season not found");
    return;
  }

  console.log("Season ID:", season.id);

  // 既存の試合を取得して、不足を特定
  const { data: existingMatches } = await supabase
    .from("matches")
    .select("home_team_id, away_team_id")
    .eq("season_id", season.id);

  // 既存の対戦カードをセットに
  const existingPairs = new Set();
  existingMatches?.forEach(m => {
    existingPairs.add(`${m.home_team_id}-${m.away_team_id}`);
  });

  console.log("\n=== 不足している対戦カード ===");

  // 全チームの組み合わせをチェック
  const teamIds = Object.values(TEAMS);
  const teamNames = Object.keys(TEAMS);

  for (let i = 0; i < teamIds.length; i++) {
    for (let j = 0; j < teamIds.length; j++) {
      if (i === j) continue;
      const pair = `${teamIds[i]}-${teamIds[j]}`;
      if (!existingPairs.has(pair)) {
        console.log(`${teamNames[i]} (H) vs ${teamNames[j]} (A) - 不足`);
      }
    }
  }
}

checkAndAdd();
