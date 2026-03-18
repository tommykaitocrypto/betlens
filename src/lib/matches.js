// src/lib/matches.js
// Each match has an `expiresAt` (kickoff + 2h). Matches are filtered client-side.

export function getActiveMatches(allMatches) {
  const now = new Date();
  return allMatches.filter((m) => {
    const exp = new Date(m.expiresAt);
    return exp > now;
  });
}

export function groupByDate(matches) {
  const groups = {};
  matches.forEach((m) => {
    const d = new Date(m.kickoff);
    const key = d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
    if (!groups[key]) groups[key] = { label: key, date: d, matches: [] };
    groups[key].matches.push(m);
  });
  return Object.values(groups).sort((a, b) => a.date - b.date);
}

export function getRelativeTag(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diff = Math.round((target - today) / 86400000);
  if (diff === 0) return "Aujourd'hui";
  if (diff === 1) return "Demain";
  if (diff === -1) return "Hier";
  if (diff > 0 && diff <= 3) return `J+${diff}`;
  return null;
}

// ─── MATCH DATABASE ──────────────────────────────────────────
// expiresAt = kickoff + 2 hours (match lasts ~2h including extra time)
// When Date.now() > expiresAt, the match disappears from the list

export const ALL_MATCHES = [
  {
    id: "bar-new",
    comp: "Champions League",
    round: "8es retour",
    icon: "🏆",
    home: "FC Barcelona",
    away: "Newcastle",
    time: "18:45",
    kickoff: "2026-03-18T17:45:00Z",
    expiresAt: "2026-03-18T19:45:00Z",
    firstLeg: { score: "1-1", detail: "Rashford 22' — Yamal 67'" },
    aggregate: "Égalité 1-1",
    funFact:
      "Newcastle n'a jamais gagné à Barcelone en 3 déplacements. Le seul H2H gagné par Newcastle : le triplé d'Asprilla en 1997 (3-2).",
    winProb: { home: 61.2, draw: 19.6, away: 19.2 },
    standings: { home: "5e LDC (16 pts)", away: "12e LDC (14 pts)" },
    news: [
      { date: "17 mars", source: "Sports Mole", text: "Barça 5-2 vs Séville ce week-end. Yamal et Lewandowski en feu. Flick très confiant." },
      { date: "16 mars", source: "ESPN", text: "Newcastle éliminé de la FA Cup par Man United (1-3). Moral fragile." },
      { date: "10 mars", source: "FotMob", text: "Newcastle 1-1 Barcelona à l'aller. Rashford a répondu à Yamal." },
    ],
    topScorers: {
      home: [
        { name: "Lewandowski", goals: 13, form: ["⚽⚽", "⚽", "—"] },
        { name: "Yamal", goals: 6, form: ["—", "⚽", "—"] },
        { name: "Raphinha", goals: 5, form: ["⚽", "—", "—"] },
      ],
      away: [
        { name: "Rashford", goals: 8, form: ["—", "⚽⚽", "—"] },
        { name: "Isak", goals: 7, form: ["—", "—", "⚽"] },
        { name: "Gordon", goals: 5, form: ["⚽", "—", "—"] },
      ],
    },
    topAssisters: {
      home: [
        { name: "Yamal", assists: 8, form: ["🅰️", "—", "🅰️"] },
        { name: "Pedri", assists: 6, form: ["—", "🅰️", "—"] },
        { name: "Raphinha", assists: 5, form: ["🅰️", "—", "—"] },
      ],
      away: [
        { name: "Gordon", assists: 6, form: ["—", "🅰️", "—"] },
        { name: "Tonali", assists: 4, form: ["—", "—", "🅰️"] },
        { name: "Hall", assists: 4, form: ["🅰️", "—", "—"] },
      ],
    },
    hotPlayers: {
      home: [
        { name: "Lamine Yamal", pos: "AIL", ratings: [8.5, 7.8, 8.2], trend: "up", detail: "Buteur au match aller. 6G 8A cette saison. Prodige inarrêtable." },
        { name: "Lewandowski", pos: "ATT", ratings: [7.5, 8.0, 8.5], trend: "up", detail: "Doublé vs Séville. 13 buts en Liga." },
        { name: "Pedri", pos: "MIL", ratings: [7.8, 7.5, 7.8], trend: "stable", detail: "Métronome du milieu." },
      ],
      away: [
        { name: "Marcus Rashford", pos: "ATT", ratings: [7.0, 8.2, 6.5], trend: "down", detail: "Doublé au match aller mais invisible depuis." },
        { name: "Sandro Tonali", pos: "MIL", ratings: [7.5, 7.2, 7.0], trend: "stable", detail: "Milieu combatif." },
        { name: "Lewis Hall", pos: "DEF", ratings: [7.2, 7.5, 7.0], trend: "stable", detail: "Latéral en vue. Courtisé par Arsenal, City, Barça." },
      ],
    },
    deepAnalysis: {
      home: {
        team: "FC Barcelona",
        matches: [
          { vs: "Séville (Liga)", score: "5-2", xg: "3.8 – 1.2", goalTiming: "11', 24', 39', 58', 72'", note: "Machine offensive. 5 buts dont 3 en 1re MT." },
          { vs: "Newcastle (aller)", score: "1-1", xg: "1.4 – 1.6", goalTiming: "Enc. 22' / Marqué 67'", note: "Newcastle a posé des problèmes en transition." },
          { vs: "Athletic (Liga)", score: "1-0", xg: "1.2 – 0.8", goalTiming: "55'", note: "Victoire serrée mais solide." },
        ],
        keyInsight: "7 buts en 3 matchs. Au Camp Nou, c'est une forteresse. Mais l'aller a montré que Newcastle peut les blesser en contre.",
      },
      away: {
        team: "Newcastle",
        matches: [
          { vs: "Man United (FA Cup)", score: "1-3", xg: "1.0 – 2.1", goalTiming: "Enc. 15', 48', 67'", note: "Éliminé. Défense dépassée." },
          { vs: "Barcelona (aller)", score: "1-1", xg: "1.6 – 1.4", goalTiming: "Marqué 22' / Enc. 67'", note: "Bon match à domicile. Rashford en feu." },
          { vs: "Chelsea (PL)", score: "1-0", xg: "0.8 – 1.1", goalTiming: "Marqué 62'", note: "Victoire pragmatique." },
        ],
        keyInsight: "Irrégulier. Fort à domicile mais fragile à l'extérieur en LDC. La défaite 1-3 en Cup pèse.",
      },
    },
    injuries: { home: [], away: [] },
  },
  {
    id: "lfc-gal",
    comp: "Champions League",
    round: "8es retour",
    icon: "🏆",
    home: "Liverpool",
    away: "Galatasaray",
    time: "21:00",
    kickoff: "2026-03-18T20:00:00Z",
    expiresAt: "2026-03-18T22:00:00Z",
    firstLeg: { score: "0-1 (Galatasaray)", detail: "Lemina 7'" },
    aggregate: "Galatasaray mène 1-0",
    funFact: "Liverpool n'a JAMAIS battu Galatasaray en LDC (1V, 2N, 4D en 7 matchs). Les Turcs mènent la Süper Lig (64 pts).",
    winProb: { home: 75.9, draw: 14.0, away: 10.1 },
    standings: { home: "3e LDC (18 pts) · 5e PL", away: "20e LDC (10 pts) · 1er Süper Lig" },
    news: [
      { date: "17 mars", source: "ESPN", text: "Carragher : « Difficile pour Slot de regagner les fans. » Liverpool en crise, 5e de PL." },
      { date: "15 mars", source: "ESPN", text: "Liverpool 1-1 Tottenham. Nul frustrant à Anfield." },
      { date: "10 mars", source: "ESPN", text: "Galatasaray 1-0 Liverpool. Lemina marque d'entrée. Liverpool impuissant." },
    ],
    topScorers: {
      home: [
        { name: "Salah", goals: 15, form: ["⚽", "—", "⚽"] },
        { name: "Wirtz", goals: 9, form: ["—", "—", "⚽"] },
        { name: "Díaz", goals: 6, form: ["—", "—", "—"] },
      ],
      away: [
        { name: "Osimhen", goals: 18, form: ["⚽⚽", "⚽", "—"] },
        { name: "Ekitike", goals: 7, form: ["—", "⚽", "—"] },
        { name: "Sara", goals: 5, form: ["—", "—", "🅰️"] },
      ],
    },
    topAssisters: {
      home: [
        { name: "Salah", assists: 8, form: ["—", "—", "🅰️"] },
        { name: "Wirtz", assists: 7, form: ["🅰️", "—", "—"] },
        { name: "Mac Allister", assists: 5, form: ["—", "—", "—"] },
      ],
      away: [
        { name: "Sara", assists: 8, form: ["🅰️", "—", "🅰️"] },
        { name: "Osimhen", assists: 4, form: ["—", "🅰️", "—"] },
        { name: "Mertens", assists: 4, form: ["—", "—", "🅰️"] },
      ],
    },
    hotPlayers: {
      home: [
        { name: "Salah", pos: "ATT", ratings: [7.0, 6.5, 6.8], trend: "down", detail: "15 buts PL mais en baisse. Muet en Turquie." },
        { name: "Florian Wirtz", pos: "MIL", ratings: [7.5, 7.8, 6.5], trend: "down", detail: "Occasions gaspillées au match aller." },
      ],
      away: [
        { name: "Osimhen", pos: "ATT", ratings: [7.5, 7.8, 7.2], trend: "stable", detail: "But refusé au match aller. Dangereux en pivot." },
        { name: "Lemina", pos: "MIL", ratings: [6.5, 8.0, 7.0], trend: "up", detail: "Buteur décisif au match aller." },
      ],
    },
    deepAnalysis: {
      home: {
        team: "Liverpool",
        matches: [
          { vs: "Tottenham (PL)", score: "1-1", xg: "1.5 – 1.2", goalTiming: "Marqué 35' / Enc. 72'", note: "A mené puis rattrapé." },
          { vs: "Galatasaray (aller)", score: "0-1", xg: "1.0 – 0.7", goalTiming: "Enc. 7'", note: "But sur corner dès le début." },
          { vs: "Sunderland (PL)", score: "2-1", xg: "2.0 – 0.9", goalTiming: "25', 58' / Enc. 82'", note: "Encore un but encaissé en fin de match." },
        ],
        keyInsight: "Liverpool encaisse après la 70e systématiquement. Doit marquer tôt. Alisson absent = fragilité sur les CPA.",
      },
      away: {
        team: "Galatasaray",
        matches: [
          { vs: "Liverpool (aller)", score: "1-0", xg: "0.7 – 1.0", goalTiming: "Marqué 7'", note: "Plan tactique parfait : bloc bas + CPA." },
          { vs: "Fenerbahçe", score: "2-1", xg: "1.5 – 1.3", goalTiming: "30', 55' / Enc. 88'", note: "Leaders Süper Lig." },
          { vs: "Trabzonspor", score: "3-0", xg: "2.2 – 0.4", goalTiming: "20', 45', 78'", note: "Osimhen doublé." },
        ],
        keyInsight: "1er de Süper Lig. Dangereux sur CPA. Bloc bas + Osimhen en contre.",
      },
    },
    injuries: {
      home: [{ player: "Alisson", reason: "Blessé", impact: "Gardien n°1 absent" }],
      away: [],
    },
  },
  {
    id: "tot-atm",
    comp: "Champions League",
    round: "8es retour",
    icon: "🏆",
    home: "Tottenham",
    away: "Atlético Madrid",
    time: "21:00",
    kickoff: "2026-03-18T20:00:00Z",
    expiresAt: "2026-03-18T22:00:00Z",
    firstLeg: { score: "2-5 (Atlético)", detail: "" },
    aggregate: "Atlético mène 5-2",
    funFact: "Tottenham n'a JAMAIS battu l'Atlético en compétition européenne. 100% défaites.",
    winProb: { home: 37.0, draw: 25.3, away: 37.7 },
    standings: { home: "4e LDC · 16e PL (30 pts)", away: "14e LDC" },
    news: [{ date: "15 mars", source: "ESPN", text: "Liverpool 1-1 Tottenham. Spurs 16e de PL, saison noire." }],
    topScorers: {
      home: [
        { name: "Son", goals: 8, form: ["⚽", "—", "—"] },
        { name: "Solanke", goals: 6, form: ["—", "⚽", "—"] },
        { name: "Johnson", goals: 5, form: ["—", "—", "—"] },
      ],
      away: [
        { name: "Griezmann", goals: 10, form: ["⚽", "⚽", "—"] },
        { name: "J. Alvarez", goals: 8, form: ["⚽", "—", "⚽"] },
        { name: "Simeone Jr", goals: 4, form: ["—", "⚽", "—"] },
      ],
    },
    topAssisters: {
      home: [
        { name: "Son", assists: 6, form: ["🅰️", "—", "—"] },
        { name: "Maddison", assists: 5, form: ["—", "—", "🅰️"] },
        { name: "Kulusevski", assists: 4, form: ["—", "—", "—"] },
      ],
      away: [
        { name: "Griezmann", assists: 7, form: ["🅰️", "—", "🅰️"] },
        { name: "Llorente", assists: 4, form: ["—", "🅰️", "—"] },
        { name: "J. Alvarez", assists: 3, form: ["—", "—", "🅰️"] },
      ],
    },
    hotPlayers: null,
    deepAnalysis: null,
    injuries: { home: [], away: [] },
  },
  {
    id: "bmu-ata",
    comp: "Champions League",
    round: "8es retour",
    icon: "🏆",
    home: "Bayern Munich",
    away: "Atalanta",
    time: "21:00",
    kickoff: "2026-03-18T20:00:00Z",
    expiresAt: "2026-03-18T22:00:00Z",
    firstLeg: { score: "6-1 (Bayern)", detail: "Kane ×2" },
    aggregate: "Bayern mène 6-1",
    funFact: "Seule équipe à 6+ buts en 8es cette saison. Qualification actée.",
    winProb: { home: 72.6, draw: 15.3, away: 12.1 },
    standings: { home: "2e LDC (21 pts)", away: "15e LDC" },
    news: [{ date: "14 mars", source: "FotMob", text: "Bayern 1-1 Leverkusen (BL), 2 expulsions Bayern. Repos attendu." }],
    topScorers: {
      home: [
        { name: "Kane", goals: 22, form: ["⚽⚽", "⚽", "—"] },
        { name: "Musiala", goals: 8, form: ["⚽", "—", "⚽"] },
        { name: "Sané", goals: 5, form: ["—", "⚽", "—"] },
      ],
      away: [
        { name: "Lookman", goals: 9, form: ["⚽", "—", "—"] },
        { name: "De Ketelaere", goals: 7, form: ["—", "—", "⚽"] },
        { name: "Retegui", goals: 6, form: ["—", "⚽", "—"] },
      ],
    },
    topAssisters: {
      home: [
        { name: "Musiala", assists: 7, form: ["🅰️", "—", "🅰️"] },
        { name: "Sané", assists: 4, form: ["—", "🅰️", "—"] },
        { name: "Kimmich", assists: 4, form: ["—", "—", "🅰️"] },
      ],
      away: [
        { name: "Lookman", assists: 6, form: ["—", "🅰️", "—"] },
        { name: "De Ketelaere", assists: 5, form: ["🅰️", "—", "—"] },
        { name: "Pasalic", assists: 3, form: ["—", "—", "—"] },
      ],
    },
    hotPlayers: null,
    deepAnalysis: null,
    injuries: { home: [], away: [] },
  },
  {
    id: "bou-mun",
    comp: "Premier League",
    round: "J31",
    icon: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    home: "Bournemouth",
    away: "Man United",
    time: "21:00",
    kickoff: "2026-03-20T20:00:00Z",
    expiresAt: "2026-03-20T22:00:00Z",
    firstLeg: null,
    aggregate: null,
    funFact: "Bournemouth : record de nuls en PL (14 en 30 matchs). Man United 3e, vise le titre.",
    winProb: { home: 30.5, draw: 25.3, away: 44.2 },
    standings: { home: "10e PL (41 pts)", away: "3e PL (54 pts)" },
    news: [
      { date: "15 mars", source: "ESPN", text: "Man United 3-1 Aston Villa. Dans la course au titre." },
      { date: "14 mars", source: "FootMercato", text: "Bruno Fernandes reste. United verrouille son capitaine." },
    ],
    topScorers: {
      home: [
        { name: "Kluivert", goals: 7, form: ["⚽", "—", "—"] },
        { name: "Semenyo", goals: 6, form: ["—", "⚽", "—"] },
        { name: "Evanilson", goals: 5, form: ["—", "—", "—"] },
      ],
      away: [
        { name: "Hojlund", goals: 10, form: ["⚽", "⚽", "—"] },
        { name: "B. Fernandes", goals: 8, form: ["⚽", "—", "⚽"] },
        { name: "Rashford", goals: 7, form: ["—", "—", "⚽"] },
      ],
    },
    topAssisters: {
      home: [
        { name: "Semenyo", assists: 5, form: ["—", "🅰️", "—"] },
        { name: "Tavernier", assists: 4, form: ["—", "—", "🅰️"] },
        { name: "Kluivert", assists: 3, form: ["🅰️", "—", "—"] },
      ],
      away: [
        { name: "B. Fernandes", assists: 9, form: ["🅰️", "🅰️", "—"] },
        { name: "Diallo", assists: 6, form: ["—", "🅰️", "—"] },
        { name: "Garnacho", assists: 4, form: ["—", "—", "🅰️"] },
      ],
    },
    hotPlayers: null,
    deepAnalysis: null,
    injuries: { home: [], away: [] },
  },
  {
    id: "rcl-ang",
    comp: "Ligue 1",
    round: "J27",
    icon: "🇫🇷",
    home: "Lens",
    away: "Angers",
    time: "20:45",
    kickoff: "2026-03-20T19:45:00Z",
    expiresAt: "2026-03-20T21:45:00Z",
    firstLeg: null,
    aggregate: null,
    funFact: "Lens 2e à 1 point du PSG. Angers n'a jamais gagné à Bollaert cette saison. Mais Lens vient de perdre à Lorient.",
    winProb: { home: 73.9, draw: 16.6, away: 9.5 },
    standings: { home: "2e L1 (56 pts)", away: "12e L1 (32 pts)" },
    news: [{ date: "14 mars", source: "FootMercato", text: "Lorient 2-1 Lens. Défaite surprise pour le dauphin du PSG." }],
    topScorers: {
      home: [
        { name: "Sotoca", goals: 10, form: ["⚽", "—", "—"] },
        { name: "Nzola", goals: 7, form: ["—", "⚽", "—"] },
        { name: "Fulgini", goals: 5, form: ["—", "—", "⚽"] },
      ],
      away: [
        { name: "Allevinah", goals: 6, form: ["—", "—", "⚽"] },
        { name: "Ounahi", goals: 4, form: ["⚽", "—", "—"] },
        { name: "Cho", goals: 3, form: ["—", "—", "—"] },
      ],
    },
    topAssisters: {
      home: [
        { name: "Thomasson", assists: 6, form: ["🅰️", "—", "—"] },
        { name: "Sotoca", assists: 5, form: ["—", "🅰️", "—"] },
        { name: "Machado", assists: 4, form: ["—", "—", "🅰️"] },
      ],
      away: [
        { name: "Ounahi", assists: 4, form: ["—", "🅰️", "—"] },
        { name: "Allevinah", assists: 3, form: ["—", "—", "—"] },
        { name: "Cho", assists: 2, form: ["—", "—", "—"] },
      ],
    },
    hotPlayers: null,
    deepAnalysis: null,
    injuries: { home: [], away: [] },
  },
];
