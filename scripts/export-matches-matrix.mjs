import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// 本サイトと同じチーム順
const TEAM_ORDER = [
  "ESFORCO F.C.",
  "大豆戸FC",
  "あざみ野FC",
  "FC.vinculo",
  "横浜ジュニオールSC",
  "黒滝SC",
  "TDFC",
  "PALAVRA FC",
  "SFAT ISEHARA SC",
  "FC東海岸",
  "あざみ野キッカーズ"
];

const { data: teams } = await supabase
  .from("teams")
  .select("id, name, short_name")
  .eq("is_active", true);

const { data: matches } = await supabase
  .from("matches")
  .select("home_team_id, away_team_id, home_score, away_score, match_date")
  .eq("status", "finished")
  .order("match_date", { ascending: true });

// チームIDをマップ
const teamMap = {};
teams?.forEach(t => {
  teamMap[t.id] = t;
});

// マトリックスを構築
const matrix = {};
TEAM_ORDER.forEach(name => {
  const team = teams?.find(t => t.name === name);
  if (team) {
    matrix[team.id] = {};
    TEAM_ORDER.forEach(oppName => {
      const opp = teams?.find(t => t.name === oppName);
      if (opp && team.id !== opp.id) {
        matrix[team.id][opp.id] = [];
      }
    });
  }
});

// 試合データを追加
matches?.forEach(m => {
  if (matrix[m.home_team_id] && matrix[m.home_team_id][m.away_team_id]) {
    matrix[m.home_team_id][m.away_team_id].push({
      score: `${m.home_score}-${m.away_score}`,
      date: m.match_date?.slice(5, 10).replace("-", "/")
    });
  }
});

// 表示
console.log("=== 戦績表マトリックス ===");
console.log("ホーム \\ アウェイ");
console.log("");

// ヘッダー
const shortNames = TEAM_ORDER.map(name => {
  const team = teams?.find(t => t.name === name);
  return team?.short_name || name.slice(0, 4);
});
console.log("            " + shortNames.map(n => n.padEnd(12)).join(""));

// 各行
TEAM_ORDER.forEach(homeName => {
  const homeTeam = teams?.find(t => t.name === homeName);
  if (!homeTeam) return;

  let row = (homeTeam.short_name || homeName.slice(0, 8)).padEnd(12);

  TEAM_ORDER.forEach(awayName => {
    const awayTeam = teams?.find(t => t.name === awayName);
    if (!awayTeam) {
      row += "-".padEnd(12);
      return;
    }

    if (homeTeam.id === awayTeam.id) {
      row += "-".padEnd(12);
    } else {
      const results = matrix[homeTeam.id]?.[awayTeam.id] || [];
      if (results.length === 0) {
        row += "-".padEnd(12);
      } else if (results.length === 1) {
        row += results[0].score.padEnd(12);
      } else {
        row += results.map(r => r.score).join("/").padEnd(12);
      }
    }
  });

  console.log(row);
});
