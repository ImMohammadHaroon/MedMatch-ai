import { useEffect, useState } from "react";
import PatientForm from "./components/PatientForm.jsx";
import ResultCard from "./components/ResultCard.jsx";
import { predictHeartDisease } from "./api.js";

const RESULT_STORAGE_KEY = "medmatch-latest-result";

function readStoredResult() {
  try {
    const raw = localStorage.getItem(RESULT_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function PageShell({ children }) {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-surface">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(ellipse_at_top,_rgba(13,148,136,0.12),_transparent_60%)]"
        aria-hidden
      />
      <div className="relative mx-auto max-w-2xl space-y-8 px-4 py-10 sm:py-14">{children}</div>
    </div>
  );
}

function ResultView({ pending }) {
  const [result, setResult] = useState(() => (pending ? null : readStoredResult()));
  const [loading, setLoading] = useState(pending);

  useEffect(() => {
    if (!pending) {
      setResult(readStoredResult());
      setLoading(false);
      return undefined;
    }

    const apply = () => {
      const next = readStoredResult();
      if (next) {
        setResult(next);
        setLoading(false);
      }
    };

    apply();
    const onStorage = (e) => {
      if (e.key === RESULT_STORAGE_KEY) apply();
    };
    window.addEventListener("storage", onStorage);
    const poll = window.setInterval(apply, 300);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.clearInterval(poll);
    };
  }, [pending]);

  return (
    <PageShell>
      <header className="space-y-3">
        <h1 className="font-heading text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
          MedMatch AI
        </h1>
        <p className="max-w-xl text-base leading-relaxed text-slate-500 sm:text-lg">
          Your prediction result
        </p>
      </header>

      {loading ? (
        <ResultCard loading />
      ) : result ? (
        <ResultCard result={result} />
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-6 text-sm text-slate-600 shadow-sm">
          No prediction found. Return to the form and run a new assessment.
        </div>
      )}

      <a
        href="/"
        className="inline-flex rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-ink transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary/40"
      >
        Back to form
      </a>
    </PageShell>
  );
}

function FormView() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (formData) => {
    setLoading(true);
    setError(null);

    // Open immediately (same user gesture) so the browser does not block the popup.
    const resultUrl = `${window.location.origin}/?view=result`;
    const pendingUrl = `${resultUrl}&pending=1`;
    const resultTab = window.open(pendingUrl, "_blank");

    try {
      const data = await predictHeartDisease(formData);
      localStorage.setItem(RESULT_STORAGE_KEY, JSON.stringify(data));

      if (resultTab && !resultTab.closed) {
        resultTab.location.href = resultUrl;
      } else {
        // Popup blocked — fall back to this tab.
        window.location.assign(resultUrl);
      }
    } catch (err) {
      if (resultTab && !resultTab.closed) resultTab.close();
      setError(
        err.response?.data?.detail || "Something went wrong while contacting the prediction service."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell>
      <header className="space-y-3">
        <h1 className="font-heading text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
          MedMatch AI
        </h1>
        <p className="max-w-xl text-base leading-relaxed text-slate-500 sm:text-lg">
          Heart disease risk classification with doctor-oriented advice and lifestyle guidance.
        </p>
      </header>

      <PatientForm onSubmit={handleSubmit} loading={loading} />

      {loading && (
        <p className="text-center text-sm text-slate-500" aria-live="polite">
          Analyzing… results will open in a new tab.
        </p>
      )}

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-danger/20 bg-dangerSoft px-4 py-3 text-sm text-danger"
        >
          {error}
        </div>
      )}
    </PageShell>
  );
}

export default function App() {
  const params = new URLSearchParams(window.location.search);
  const isResultView = params.get("view") === "result";
  const pending = params.get("pending") === "1";

  return isResultView ? <ResultView pending={pending} /> : <FormView />;
}
