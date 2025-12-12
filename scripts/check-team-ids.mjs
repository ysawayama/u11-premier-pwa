import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const { data: standings } = await supabase
  .from("team_standings")
  .select("rank, team_id, team:teams(name)")
  .order("rank", { ascending: true });

console.log("=== 順位表のteam_id確認 ===");
standings?.forEach(s => {
  console.log(`${s.rank}. ${s.team?.name} - team_id: ${s.team_id}`);
});
