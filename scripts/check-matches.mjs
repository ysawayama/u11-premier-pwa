import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const { data: teams } = await supabase
  .from("teams")
  .select("id, name, short_name")
  .eq("is_active", true)
  .order("name");

console.log("=== チーム一覧 ===");
if (teams) teams.forEach(t => console.log(t.name + " (" + (t.short_name || "-") + "): " + t.id));

const { data: matches } = await supabase
  .from("matches")
  .select("id, home_team_id, away_team_id, home_score, away_score, match_date, status")
  .order("match_date");

console.log("");
console.log("=== 試合一覧 ===");
console.log("総試合数: " + (matches ? matches.length : 0));
if (matches && teams) {
  matches.forEach(m => {
    const homeTeam = teams.find(t => t.id === m.home_team_id);
    const awayTeam = teams.find(t => t.id === m.away_team_id);
    const homeName = homeTeam ? (homeTeam.short_name || homeTeam.name) : m.home_team_id;
    const awayName = awayTeam ? (awayTeam.short_name || awayTeam.name) : m.away_team_id;
    const homeScore = m.home_score === null ? "-" : m.home_score;
    const awayScore = m.away_score === null ? "-" : m.away_score;
    const date = m.match_date ? m.match_date.slice(0,10) : "TBD";
    console.log(date + " " + homeName + " " + homeScore + "-" + awayScore + " " + awayName + " (" + m.status + ")");
  });
}
