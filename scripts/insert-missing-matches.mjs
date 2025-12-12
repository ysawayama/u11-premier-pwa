import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// チームID
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
// [ホームチーム, アウェイチーム, ホームスコア, アウェイスコア, 日付(nullは未定)]
const matchesToAdd = [
  // ESFORCO (H) の不足分
  ["ESFORCO", "vinculo", 5, 0, null],
  ["ESFORCO", "PALAVRA", 8, 0, "2025-11-03"],  // 既存かも
  ["ESFORCO", "SFAT伊勢原", 9, 1, "2025-08-02"],  // 逆は既存
  ["ESFORCO", "TDFC", 4, 2, "2025-09-13"],  // 逆は既存
  ["ESFORCO", "あざみ野", 2, 1, "2025-09-28"],  // 逆は既存

  // vinculo (H) の不足分
  ["vinculo", "SFAT伊勢原", 6, 1, "2025-09-21"],  // 逆は既存
  ["vinculo", "TDFC", 7, 1, "2025-06-21"],  // 逆は既存
  ["vinculo", "あざみ野", 4, 0, "2025-07-21"],  // 逆は既存
  ["vinculo", "あざみ野K", 4, 0, "2025-07-21"],  // 逆は既存
  ["vinculo", "大豆戸", 5, 0, "2025-07-20"],  // 逆は既存

  // 東海岸 (H) の不足分
  ["東海岸", "ESFORCO", 0, 9, "2025-06-01"],  // 逆は既存
  ["東海岸", "vinculo", 1, 9, "2025-09-15"],  // 逆は既存
  ["東海岸", "あざみ野", 0, 7, "2025-04-27"],  // 逆は既存
  ["東海岸", "大豆戸", 0, 13, "2025-09-20"],  // 逆は既存
  ["東海岸", "横浜ジュニオール", 0, 4, "2025-09-20"],  // 逆は既存

  // PALAVRA (H) の不足分
  ["PALAVRA", "vinculo", 1, 6, "2025-04-26"],  // 逆は既存
  ["PALAVRA", "SFAT伊勢原", 1, 1, "2025-08-30"],  // 逆は既存
  ["PALAVRA", "あざみ野", 0, 6, "2025-04-27"],  // 逆は既存
  ["PALAVRA", "横浜ジュニオール", 0, 0, "2025-06-22"],  // 逆は既存

  // SFAT伊勢原 (H) の不足分
  ["SFAT伊勢原", "東海岸", 1, 1, "2025-08-02"],  // 逆は既存

  // TDFC (H) の不足分
  ["TDFC", "SFAT伊勢原", 5, 0, "2025-08-24"],  // 逆は既存
  ["TDFC", "あざみ野K", 4, 0, "2025-05-18"],  // 逆は既存
  ["TDFC", "横浜ジュニオール", 2, 2, "2025-09-20"],  // 逆は既存

  // あざみ野 (H) の不足分
  ["あざみ野", "SFAT伊勢原", 2, 1, "2025-09-27"],  // 逆は既存
  ["あざみ野", "大豆戸", 3, 6, "2025-07-06"],  // 逆は既存
  ["あざみ野", "黒滝", 4, 3, "2025-05-25"],  // 逆は既存

  // あざみ野K (H) の不足分
  ["あざみ野K", "ESFORCO", 0, 8, "2025-04-19"],  // 逆は既存
  ["あざみ野K", "PALAVRA", 1, 1, "2025-07-26"],  // 逆は既存
  ["あざみ野K", "SFAT伊勢原", 1, 8, "2025-09-27"],  // 逆は既存
  ["あざみ野K", "あざみ野", 0, 9, "2025-07-06"],  // 逆は既存

  // 大豆戸 (H) の不足分
  ["大豆戸", "ESFORCO", 0, 8, "2025-06-28"],  // 逆は既存
  ["大豆戸", "SFAT伊勢原", 1, 0, "2025-09-21"],  // 逆は既存

  // 横浜ジュニオール (H) の不足分
  ["横浜ジュニオール", "ESFORCO", 1, 2, "2025-04-19"],  // 逆は既存
  ["横浜ジュニオール", "vinculo", 1, 3, "2025-08-30"],  // 逆は既存
  ["横浜ジュニオール", "SFAT伊勢原", 4, 2, "2025-08-31"],  // 逆は既存
  ["横浜ジュニオール", "あざみ野", 3, 1, "2025-04-29"],  // 逆は既存
  ["横浜ジュニオール", "黒滝", 2, 2, "2025-06-21"],  // 逆は既存

  // 黒滝 (H) の不足分
  ["黒滝", "ESFORCO", 2, 3, "2025-06-01"],  // 逆は既存
  ["黒滝", "vinculo", 0, 2, "2025-09-21"],  // 逆は既存
  ["黒滝", "PALAVRA", 7, 1, "2025-07-19"],  // 逆は既存
  ["黒滝", "SFAT伊勢原", 8, 2, "2025-08-31"],  // 逆は既存
  ["黒滝", "TDFC", 4, 2, "2025-05-24"],  // 逆は既存
  ["黒滝", "大豆戸", 4, 2, "2025-07-12"],  // 逆は既存
];

async function insertMatches() {
  // シーズンID取得
  const { data: season } = await supabase
    .from("seasons")
    .select("id")
    .eq("is_current", true)
    .single();

  if (!season) {
    console.log("Season not found");
    return;
  }

  console.log("Season ID:", season.id);

  // 既存の試合を確認
  const { data: existing } = await supabase
    .from("matches")
    .select("home_team_id, away_team_id")
    .eq("season_id", season.id);

  const existingSet = new Set();
  existing?.forEach(m => existingSet.add(`${m.home_team_id}-${m.away_team_id}`));

  let addedCount = 0;
  let skippedCount = 0;

  for (const match of matchesToAdd) {
    const [homeTeam, awayTeam, homeScore, awayScore, matchDate] = match;
    const homeTeamId = TEAMS[homeTeam];
    const awayTeamId = TEAMS[awayTeam];

    if (!homeTeamId || !awayTeamId) {
      console.log(`Invalid team: ${homeTeam} or ${awayTeam}`);
      continue;
    }

    const pairKey = `${homeTeamId}-${awayTeamId}`;
    if (existingSet.has(pairKey)) {
      console.log(`Skip (exists): ${homeTeam} vs ${awayTeam}`);
      skippedCount++;
      continue;
    }

    const matchData = {
      season_id: season.id,
      home_team_id: homeTeamId,
      away_team_id: awayTeamId,
      home_score: homeScore,
      away_score: awayScore,
      match_date: matchDate ? `${matchDate}T14:00:00+09:00` : null,
      status: homeScore !== null ? "finished" : "scheduled",
      match_type: "league",
      venue: "会場未定",
    };

    const { error } = await supabase.from("matches").insert(matchData);
    if (error) {
      console.log(`Error adding ${homeTeam} vs ${awayTeam}:`, error.message);
    } else {
      console.log(`Added: ${homeTeam} ${homeScore}-${awayScore} ${awayTeam}`);
      addedCount++;
      existingSet.add(pairKey);
    }
  }

  console.log(`\nDone. Added: ${addedCount}, Skipped: ${skippedCount}`);
}

insertMatches();
