"use client";

const RatingDot = ({ r }) => {
  if (!r || r === 0) return <span className="text-gray-300 font-mono text-xs">—</span>;
  const c = r >= 8 ? "text-win" : r >= 7 ? "text-draw" : "text-loss";
  return <span className={`font-bold font-mono text-[13px] ${c}`}>{r.toFixed(1)}</span>;
};

const Trend = ({ t }) =>
  t === "up" ? (
    <span className="text-win">↑</span>
  ) : t === "down" ? (
    <span className="text-loss">↓</span>
  ) : (
    <span className="text-muted">→</span>
  );

const ST = ({ icon, title }) => (
  <h3 className="text-sm font-bold font-serif text-ink mt-6 mb-2 border-b-2 border-ink pb-1 inline-block">
    {icon} {title}
  </h3>
);

const PlayerStatTable = ({ title, home, away, homeName, awayName, statKey, statLabel }) => (
  <div className="mb-4">
    <div className="grid grid-cols-2 gap-3">
      {[
        { team: homeName, players: home, color: "text-blue-700" },
        { team: awayName, players: away, color: "text-orange-700" },
      ].map((side) => (
        <div key={side.team}>
          <div className={`text-[11px] font-bold uppercase tracking-wide mb-1.5 ${side.color}`}>
            {side.team}
          </div>
          {side.players.map((p) => (
            <div
              key={p.name}
              className="flex items-center justify-between py-1 border-b border-gray-100 text-[13px]"
            >
              <span className="font-medium">{p.name}</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-muted">
                  {p[statKey]} {statLabel}
                </span>
                <div className="flex gap-0.5 text-[10px]">
                  {p.form.map((f, i) => (
                    <span
                      key={i}
                      className={`px-1 rounded ${
                        f === "—" ? "text-gray-300" : "text-ink font-medium"
                      }`}
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  </div>
);

export default function MatchDetail({ m, onBack }) {
  return (
    <div className="animate-fade-in">
      <button
        onClick={onBack}
        className="bg-transparent border-none text-muted text-[13px] cursor-pointer py-2 font-sans"
      >
        ← Retour
      </button>

      {/* Header */}
      <div className="text-center py-3 pb-4 border-b border-border mb-1">
        <div className="text-[11px] text-muted uppercase tracking-widest font-mono mb-1.5">
          {m.icon} {m.comp} · {m.round}
        </div>
        <div className="text-2xl font-bold font-serif">
          {m.home} – {m.away}
        </div>
        <div className="text-[13px] text-muted mt-1.5 font-mono">{m.time}</div>
        {m.firstLeg && (
          <div className="text-xs text-muted mt-1">
            Aller : <strong>{m.firstLeg.score}</strong>
            {m.firstLeg.detail ? ` · ${m.firstLeg.detail}` : ""}
          </div>
        )}
        {m.aggregate && (
          <div className="mt-1 text-[13px] font-semibold">{m.aggregate}</div>
        )}
      </div>

      {/* Fun fact */}
      <div className="px-3.5 py-3 bg-insight-bg border border-insight-border rounded-lg my-3.5 text-sm leading-relaxed text-insight-text">
        <strong>📌</strong> {m.funFact}
      </div>

      {/* Win probabilities */}
      {m.winProb && (
        <>
          <ST icon="📊" title="Probabilités" />
          <div className="flex gap-0 rounded-md overflow-hidden h-2 mb-1.5">
            <div className="bg-accent" style={{ flex: m.winProb.home }} />
            <div className="bg-gray-300" style={{ flex: m.winProb.draw }} />
            <div className="bg-away" style={{ flex: m.winProb.away }} />
          </div>
          <div className="flex justify-between text-[13px]">
            <span>
              <strong>{m.winProb.home}%</strong> {m.home}
            </span>
            <span>
              <strong>{m.winProb.draw}%</strong> Nul
            </span>
            <span>
              <strong>{m.winProb.away}%</strong> {m.away}
            </span>
          </div>
        </>
      )}

      {/* News */}
      {m.news?.length > 0 && (
        <>
          <ST icon="📰" title="Actus récentes" />
          {m.news.map((n, i) => (
            <div
              key={i}
              className={`px-3 py-2 border border-border rounded-md mb-1.5 text-[13px] leading-snug ${
                i === 0 ? "bg-news-bg" : "bg-card"
              }`}
            >
              <div className="text-[10px] text-muted mb-0.5 font-mono">
                {n.date} · {n.source}
              </div>
              {n.text}
            </div>
          ))}
        </>
      )}

      {/* Top Scorers */}
      {m.topScorers && (
        <>
          <ST icon="⚽" title="Top buteurs (3 derniers matchs)" />
          <PlayerStatTable
            home={m.topScorers.home}
            away={m.topScorers.away}
            homeName={m.home}
            awayName={m.away}
            statKey="goals"
            statLabel="buts"
          />
        </>
      )}

      {/* Top Assisters */}
      {m.topAssisters && (
        <>
          <ST icon="🅰️" title="Top passeurs (3 derniers matchs)" />
          <PlayerStatTable
            home={m.topAssisters.home}
            away={m.topAssisters.away}
            homeName={m.home}
            awayName={m.away}
            statKey="assists"
            statLabel="passes"
          />
        </>
      )}

      {/* Hot players */}
      {m.hotPlayers && (
        <>
          <ST icon="🔥" title="Joueurs en forme" />
          {["home", "away"].map((s) => (
            <div key={s} className="mb-3.5">
              <div
                className={`text-xs font-bold uppercase tracking-wide mb-1.5 ${
                  s === "home" ? "text-blue-700" : "text-orange-700"
                }`}
              >
                {m[s === "home" ? "home" : "away"]}
              </div>
              {m.hotPlayers[s].map((p) => (
                <div
                  key={p.name}
                  className="p-2 border border-gray-100 rounded-md mb-1 bg-card"
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-sm font-semibold">
                      {p.name}{" "}
                      <span className="text-[11px] text-muted font-normal">
                        {p.pos}
                      </span>
                    </span>
                    <Trend t={p.trend} />
                  </div>
                  <div className="flex gap-1.5 mb-0.5">
                    {p.ratings.map((r, i) => (
                      <span key={i} className="flex items-center gap-0.5">
                        <span className="text-[10px] text-muted">M{i + 1}:</span>
                        <RatingDot r={r} />
                      </span>
                    ))}
                    {p.ratings.filter((r) => r > 0).length > 0 && (
                      <span className="text-[11px] text-muted ml-1">
                        Moy:{" "}
                        <strong>
                          {(
                            p.ratings.filter((r) => r > 0).reduce((a, b) => a + b, 0) /
                            p.ratings.filter((r) => r > 0).length
                          ).toFixed(1)}
                        </strong>
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 leading-snug">{p.detail}</div>
                </div>
              ))}
            </div>
          ))}
        </>
      )}

      {/* Deep analysis */}
      {m.deepAnalysis && (
        <>
          <ST icon="🔬" title="Analyse des 3 derniers matchs" />
          {["home", "away"].map((s) => {
            const d = m.deepAnalysis[s];
            return (
              <div key={s} className="mb-4">
                <div
                  className={`text-[13px] font-bold mb-1.5 ${
                    s === "home" ? "text-blue-700" : "text-orange-700"
                  }`}
                >
                  {d.team}
                </div>
                {d.matches.map((x, i) => (
                  <div
                    key={i}
                    className="px-3 py-2 border border-border rounded-md mb-1 bg-card"
                  >
                    <div className="flex justify-between mb-0.5">
                      <span className="text-[13px] font-semibold">{x.vs}</span>
                      <span className="font-mono text-sm font-bold">{x.score}</span>
                    </div>
                    <div className="flex gap-3 text-[11px] text-muted mb-0.5 font-mono">
                      <span>xG: {x.xg}</span>
                      <span>{x.goalTiming}</span>
                    </div>
                    <div className="text-xs text-gray-500 leading-snug">{x.note}</div>
                  </div>
                ))}
                <div className="px-3 py-2 bg-analysis-bg border border-analysis-border rounded-md text-[13px] leading-snug text-analysis-text">
                  <strong>💡</strong> {d.keyInsight}
                </div>
              </div>
            );
          })}
        </>
      )}

      {/* Injuries */}
      {(m.injuries.home.length > 0 || m.injuries.away.length > 0) && (
        <>
          <ST icon="🚑" title="Absences" />
          {["home", "away"].map(
            (s) =>
              m.injuries[s].length > 0 && (
                <div key={s} className="mb-2.5">
                  <div className="text-xs font-semibold mb-1">
                    {m[s === "home" ? "home" : "away"]}
                  </div>
                  {m.injuries[s].map((inj) => (
                    <div
                      key={inj.player}
                      className="px-2.5 py-1 bg-red-50 rounded-md mb-0.5 text-[13px]"
                    >
                      <span className="text-red-800 font-semibold">✕ {inj.player}</span>
                      <span className="text-muted"> — {inj.reason}</span>
                      {inj.impact && (
                        <div className="text-[11px] text-red-700">{inj.impact}</div>
                      )}
                    </div>
                  ))}
                </div>
              )
          )}
        </>
      )}

      {/* Standings */}
      <ST icon="🏆" title="Classement" />
      <div className="text-[13px] leading-loose mb-10">
        {m.home} : <strong>{m.standings.home}</strong>
        <br />
        {m.away} : <strong>{m.standings.away}</strong>
      </div>
    </div>
  );
}
