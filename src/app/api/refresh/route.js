// src/app/api/refresh/route.js
export const dynamic = "force-dynamic";
//
// GET /api/refresh → fetches upcoming matches (J+3) from football-data.org,
// enriches them via Claude API, returns JSON.
// Requires env vars: FOOTBALL_DATA_API_KEY, ANTHROPIC_API_KEY

import { NextResponse } from "next/server";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

const CACHE_PATH = join(process.cwd(), "matches-cache.json");
const FOOTBALL_API = "https://api.football-data.org/v4";

// Competitions we track (free tier on football-data.org)
const COMPETITIONS = {
  CL: { code: "CL", name: "Champions League", icon: "🏆" },
  PL: { code: "PL", name: "Premier League", icon: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  FL1: { code: "FL1", name: "Ligue 1", icon: "🇫🇷" },
};

// ─── FOOTBALL-DATA.ORG ───────────────────────────────────────

async function fetchFootballData(endpoint) {
  const key = process.env.FOOTBALL_DATA_API_KEY;
  if (!key) throw new Error("FOOTBALL_DATA_API_KEY manquante");

  const res = await fetch(`${FOOTBALL_API}${endpoint}`, {
    headers: { "X-Auth-Token": key },
    next: { revalidate: 0 },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`football-data.org ${res.status}: ${text}`);
  }
  return res.json();
}

async function getUpcomingMatches() {
  const now = new Date();
  const to = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // J+3
  const dateFrom = now.toISOString().split("T")[0];
  const dateTo = to.toISOString().split("T")[0];

  const allMatches = [];

  for (const comp of Object.values(COMPETITIONS)) {
    try {
      const data = await fetchFootballData(
        `/competitions/${comp.code}/matches?dateFrom=${dateFrom}&dateTo=${dateTo}&status=SCHEDULED,TIMED,IN_PLAY,PAUSED`
      );
      if (data.matches) {
        for (const m of data.matches) {
          allMatches.push({
            _raw: m,
            comp: comp.name,
            compCode: comp.code,
            icon: comp.icon,
          });
        }
      }
    } catch (e) {
      console.error(`Erreur ${comp.code}:`, e.message);
    }
  }
  return allMatches;
}

async function getTeamScorers(compCode) {
  try {
    const data = await fetchFootballData(`/competitions/${compCode}/scorers?limit=50`);
    return data.scorers || [];
  } catch {
    return [];
  }
}

// ─── CLAUDE AI INSIGHTS ──────────────────────────────────────

async function generateInsights(matchData) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    // Fallback si pas de clé Claude
    return {
      funFact: `${matchData.home} vs ${matchData.away} — match à suivre.`,
      news: [],
    };
  }

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [
          {
            role: "user",
            content: `Tu es un analyste football pour parieurs. Pour le match ${matchData.home} vs ${matchData.away} (${matchData.comp}, ${matchData.round || ""}):

Donne-moi en JSON UNIQUEMENT (pas de markdown, pas de backticks) :
{
  "funFact": "Un fait unique et spécifique sur le H2H ou une stat marquante (1 phrase)",
  "news": [
    {"date": "date récente", "source": "source", "text": "info pertinente pour un parieur (1-2 phrases)"}
  ]
}

Donne 2-3 news maximum. Sois concis et factuel. Écris en français.`,
          },
        ],
      }),
    });

    const data = await res.json();
    const text = data.content?.[0]?.text || "{}";
    // Parse JSON from response
    const cleaned = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("Claude API error:", e.message);
    return {
      funFact: `${matchData.home} vs ${matchData.away} — match à suivre.`,
      news: [],
    };
  }
}

// ─── BUILD MATCH OBJECTS ─────────────────────────────────────

function buildMatch(raw, comp, icon, scorersMap, insights) {
  const m = raw._raw;
  const kickoff = m.utcDate;
  const expiresAt = new Date(new Date(kickoff).getTime() + 2 * 3600 * 1000).toISOString();
  const home = m.homeTeam?.shortName || m.homeTeam?.name || "Home";
  const away = m.awayTeam?.shortName || m.awayTeam?.name || "Away";
  const homeId = m.homeTeam?.id;
  const awayId = m.awayTeam?.id;
  const round = m.matchday ? `J${m.matchday}` : m.stage?.replace(/_/g, " ") || "";
  const time = new Date(kickoff).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Paris",
  });

  // Extract top scorers for each team from competition scorers
  const getTeamScorers = (teamId) => {
    return scorersMap
      .filter((s) => s.team?.id === teamId)
      .slice(0, 3)
      .map((s) => ({
        name: s.player?.name?.split(" ").pop() || s.player?.name || "?",
        goals: s.goals || 0,
        form: ["—", "—", "—"], // placeholder — would need match-by-match data
      }));
  };

  const getTeamAssisters = (teamId) => {
    return scorersMap
      .filter((s) => s.team?.id === teamId && (s.assists || 0) > 0)
      .sort((a, b) => (b.assists || 0) - (a.assists || 0))
      .slice(0, 3)
      .map((s) => ({
        name: s.player?.name?.split(" ").pop() || s.player?.name || "?",
        assists: s.assists || 0,
        form: ["—", "—", "—"],
      }));
  };

  const homeScorers = getTeamScorers(homeId);
  const awayScorers = getTeamScorers(awayId);
  const homeAssisters = getTeamAssisters(homeId);
  const awayAssisters = getTeamAssisters(awayId);

  return {
    id: `${raw.compCode}-${homeId}-${awayId}`,
    comp,
    round,
    icon,
    home,
    away,
    time,
    kickoff,
    expiresAt,
    firstLeg: null,
    aggregate: null,
    funFact: insights?.funFact || `${home} vs ${away}`,
    winProb: null, // football-data.org free tier doesn't have odds
    standings: {
      home: `${home}`,
      away: `${away}`,
    },
    news: insights?.news || [],
    topScorers:
      homeScorers.length > 0 || awayScorers.length > 0
        ? { home: homeScorers, away: awayScorers }
        : null,
    topAssisters:
      homeAssisters.length > 0 || awayAssisters.length > 0
        ? { home: homeAssisters, away: awayAssisters }
        : null,
    hotPlayers: null,
    deepAnalysis: null,
    injuries: { home: [], away: [] },
  };
}

// ─── MAIN HANDLER ────────────────────────────────────────────

export async function GET() {
  try {
    const rawMatches = await getUpcomingMatches();

    if (rawMatches.length === 0) {
      return NextResponse.json({
        ok: true,
        matches: [],
        message: "Aucun match trouvé dans les 3 prochains jours.",
      });
    }

    // Fetch scorers for each competition
    const scorersMap = {};
    for (const comp of Object.values(COMPETITIONS)) {
      scorersMap[comp.code] = await getTeamScorers(comp.code);
    }

    // Generate insights for each match (in parallel, max 5 at a time)
    const matches = [];
    for (const raw of rawMatches) {
      const home = raw._raw.homeTeam?.shortName || raw._raw.homeTeam?.name;
      const away = raw._raw.awayTeam?.shortName || raw._raw.awayTeam?.name;

      const insights = await generateInsights({
        home,
        away,
        comp: raw.comp,
        round: raw._raw.stage,
      });

      const match = buildMatch(
        raw,
        raw.comp,
        raw.icon,
        scorersMap[raw.compCode] || [],
        insights
      );
      matches.push(match);
    }

    // Save to cache file
    const cache = { updatedAt: new Date().toISOString(), matches };
    try {
      writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2));
    } catch (e) {
      // Vercel serverless: filesystem is read-only except /tmp
      console.log("Cache write skipped (serverless)");
    }

    return NextResponse.json({ ok: true, matches, updatedAt: cache.updatedAt });
  } catch (e) {
    console.error("Refresh error:", e);
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
