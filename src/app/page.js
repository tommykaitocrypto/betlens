"use client";
import { useState, useEffect, useCallback } from "react";
import { ALL_MATCHES, getActiveMatches, groupByDate, getRelativeTag } from "@/lib/matches";
import MatchDetail from "@/components/MatchDetail";
import MatchCard from "@/components/MatchCard";

export default function Home() {
  const [matches, setMatches] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const update = () => {
      const cached = typeof window !== "undefined" ? localStorage.getItem("betlens_matches") : null;
      let apiMatches = [];
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          apiMatches = parsed.matches || [];
          setLastUpdate(parsed.updatedAt);
        } catch {}
      }
      const apiIds = new Set(apiMatches.map((m) => m.id));
      const staticFiltered = getActiveMatches(ALL_MATCHES).filter((m) => !apiIds.has(m.id));
      const apiFiltered = apiMatches.filter((m) => new Date(m.expiresAt) > new Date());
      setMatches([...apiFiltered, ...staticFiltered].sort((a, b) => new Date(a.kickoff) - new Date(b.kickoff)));
    };
    update();
    const interval = setInterval(update, 60_000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/refresh");
      const data = await res.json();
      if (data.ok && data.matches?.length > 0) {
        localStorage.setItem("betlens_matches", JSON.stringify({ matches: data.matches, updatedAt: data.updatedAt }));
        setLastUpdate(data.updatedAt);
        const apiIds = new Set(data.matches.map((m) => m.id));
        const staticFiltered = getActiveMatches(ALL_MATCHES).filter((m) => !apiIds.has(m.id));
        setMatches([...data.matches, ...staticFiltered].sort((a, b) => new Date(a.kickoff) - new Date(b.kickoff)));
      } else if (data.error) {
        setError(data.error);
      }
    } catch (e) {
      setError("Impossible de contacter le serveur. Vérifiez les clés API dans Vercel.");
    }
    setLoading(false);
  }, []);

  const groups = groupByDate(matches);

  if (selected) {
    return (
      <main className="font-sans max-w-[580px] mx-auto px-5 pb-10">
        <MatchDetail m={selected} onBack={() => setSelected(null)} />
      </main>
    );
  }

  return (
    <main className="font-sans max-w-[580px] mx-auto px-5 pb-10">
      <div className="pt-6 pb-3 border-b-2 border-ink mb-5">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-[28px] font-bold font-serif tracking-tight m-0">BetLens</h1>
            <p className="mt-1 text-[13px] text-muted">LDC · Premier League · Ligue 1</p>
          </div>
          <button onClick={handleRefresh} disabled={loading}
            className={`mt-1 px-3 py-1.5 rounded-lg text-[12px] font-semibold border transition-all ${loading ? "bg-gray-100 text-gray-400 border-gray-200 cursor-wait" : "bg-white text-ink border-gray-300 hover:bg-gray-50 hover:border-gray-400 cursor-pointer"}`}>
            {loading ? "⏳ Chargement..." : "🔄 Rafraîchir"}
          </button>
        </div>
        {lastUpdate && (
          <p className="mt-1.5 text-[10px] text-gray-400 font-mono">
            MAJ : {new Date(lastUpdate).toLocaleString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
          </p>
        )}
        {error && (
          <div className="mt-2 px-3 py-2 bg-red-50 border border-red-200 rounded-md text-[12px] text-red-700">⚠️ {error}</div>
        )}
      </div>

      {matches.length === 0 ? (
        <div className="text-center py-20 text-muted">
          <p className="text-lg mb-2">Aucun match à venir</p>
          <p className="text-sm">Cliquez sur 🔄 Rafraîchir pour charger les matchs.</p>
        </div>
      ) : (
        groups.map((g) => {
          const tag = getRelativeTag(g.date);
          return (
            <div key={g.label} className="mb-7">
              <div className="flex items-baseline gap-2 mb-2.5">
                <h2 className="text-[17px] font-bold font-serif capitalize m-0">{g.label}</h2>
                {tag && (
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${tag === "Aujourd'hui" ? "text-loss bg-red-50" : tag === "Demain" ? "text-accent bg-blue-50" : "text-muted bg-gray-50"}`}>{tag}</span>
                )}
              </div>
              {g.matches.map((m) => (
                <MatchCard key={m.id} m={m} onClick={() => setSelected(m)} />
              ))}
            </div>
          );
        })
      )}

      <div className="mt-4 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-[12px] text-gray-500 leading-relaxed">
        <strong>⚙️ Configuration (Vercel → Settings → Environment Variables) :</strong><br />
        <code className="bg-gray-200 px-1 rounded text-[11px]">FOOTBALL_DATA_API_KEY</code> — gratuit sur <a href="https://www.football-data.org/client/register" className="text-accent underline" target="_blank" rel="noreferrer">football-data.org</a><br />
        <code className="bg-gray-200 px-1 rounded text-[11px]">ANTHROPIC_API_KEY</code> — pour les insights IA (optionnel)
      </div>

      <footer className="text-center pt-5 mt-4 text-[11px] text-gray-300 border-t border-gray-100">
        football-data.org · Claude AI · BetLens
      </footer>
    </main>
  );
}
