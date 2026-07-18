import { useEffect, useState } from "react";

const urgencyTheme = {
  low: {
    gauge: "#16A34A",
    soft: "bg-successSoft",
    border: "border-l-success",
    text: "text-success",
    dot: "bg-success",
    label: "Low urgency",
  },
  moderate: {
    gauge: "#D97706",
    soft: "bg-warningSoft",
    border: "border-l-warning",
    text: "text-warning",
    dot: "bg-warning",
    label: "Moderate urgency",
  },
  high: {
    gauge: "#DC2626",
    soft: "bg-dangerSoft",
    border: "border-l-danger",
    text: "text-danger",
    dot: "bg-danger",
    label: "High urgency",
  },
};

const RADIUS = 54;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function RiskGauge({ probability, color }) {
  const pct = Math.max(0, Math.min(1, probability ?? 0));
  const [offset, setOffset] = useState(CIRCUMFERENCE);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setOffset(CIRCUMFERENCE * (1 - pct));
    });
    return () => cancelAnimationFrame(frame);
  }, [pct]);

  return (
    <div className="relative mx-auto h-44 w-44">
      <svg viewBox="0 0 140 140" className="h-full w-full -rotate-90" aria-hidden>
        <circle
          cx="70"
          cy="70"
          r={RADIUS}
          fill="none"
          stroke="#E2E8F0"
          strokeWidth="12"
        />
        <circle
          cx="70"
          cy="70"
          r={RADIUS}
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 900ms ease-out" }}
        />
      </svg>
      <div className="absolute inset-0 flex rotate-0 flex-col items-center justify-center">
        <p className="font-heading text-3xl font-extrabold tabular-nums text-ink">
          {(pct * 100).toFixed(1)}%
        </p>
        <p className="mt-0.5 text-xs font-medium uppercase tracking-wide text-slate-400">
          Risk probability
        </p>
      </div>
    </div>
  );
}

function ResultSkeleton() {
  return (
    <div
      className="animate-pulse space-y-5 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm"
      aria-busy="true"
      aria-label="Loading prediction"
    >
      <div className="mx-auto h-44 w-44 rounded-full bg-slate-100" />
      <div className="mx-auto h-4 w-48 rounded bg-slate-100" />
      <div className="space-y-3">
        <div className="h-20 rounded-xl bg-slate-100" />
        <div className="h-28 rounded-xl bg-slate-100" />
      </div>
    </div>
  );
}

export default function ResultCard({ result, loading = false }) {
  if (loading) return <ResultSkeleton />;
  if (!result) return null;

  const { prediction, risk_probability, recommendation } = result;
  const theme = urgencyTheme[recommendation.urgency] || urgencyTheme.low;

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
      <div className="text-center">
        <p className={`text-xs font-semibold uppercase tracking-wide ${theme.text}`}>
          {theme.label}
        </p>
        <h3 className="mt-1 font-heading text-xl font-bold text-ink sm:text-2xl">
          {prediction === 1 ? "Heart Disease Risk Detected" : "No Significant Risk Detected"}
        </h3>
      </div>

      <RiskGauge probability={risk_probability} color={theme.gauge} />

      <div
        className={`rounded-xl border border-slate-100 border-l-4 ${theme.border} ${theme.soft} px-4 py-3`}
      >
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Doctor advice</p>
        <p className="mt-1 text-sm leading-relaxed text-ink">{recommendation.doctor_advice}</p>
      </div>

      <div
        className={`rounded-xl border border-slate-100 border-l-4 ${theme.border} bg-white px-4 py-3`}
      >
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Lifestyle recommendations
        </p>
        <ul className="mt-2 space-y-2">
          {recommendation.lifestyle_tips.map((tip, idx) => (
            <li key={idx} className="flex gap-2 text-sm leading-relaxed text-ink/80">
              <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${theme.dot}`} />
              {tip}
            </li>
          ))}
        </ul>
      </div>

      <p className="border-t border-slate-100 pt-3 text-xs text-slate-400">
        This tool is for educational purposes only and does not replace professional medical advice.
      </p>
    </div>
  );
}
