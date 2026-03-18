"use client";

export default function MatchCard({ m, onClick }) {
  return (
    <div
      onClick={onClick}
      className="p-4 border border-border rounded-[10px] mb-2 cursor-pointer bg-card transition-all hover:border-gray-400 hover:-translate-y-px"
    >
      <div className="flex justify-between items-baseline mb-1">
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-[16px] font-bold font-serif">
            {m.home} – {m.away}
          </span>
        </div>
        <span className="text-[11px] text-muted font-mono shrink-0">
          {m.icon} {m.time}
        </span>
      </div>

      {m.firstLeg && (
        <div className="text-xs text-muted mb-1">
          Aller : <strong>{m.firstLeg.score}</strong>
          {m.aggregate ? ` · ${m.aggregate}` : ""}
        </div>
      )}

      <div className="text-xs text-insight-text bg-insight-bg px-2.5 py-1.5 rounded-md leading-snug">
        📌 {m.funFact}
      </div>

      <div className="flex gap-2 mt-1.5 text-[11px] text-muted flex-wrap">
        {m.news?.length > 0 && <span>📰 {m.news.length}</span>}
        {m.hotPlayers && <span>🔥 joueurs</span>}
        {m.deepAnalysis && <span>🔬 xG</span>}
        {(m.injuries.home.length + m.injuries.away.length) > 0 && (
          <span>🚑 {m.injuries.home.length + m.injuries.away.length}</span>
        )}
        {m.winProb && (
          <span>
            📊 {Math.max(m.winProb.home, m.winProb.away).toFixed(0)}% favori
          </span>
        )}
      </div>
    </div>
  );
}
