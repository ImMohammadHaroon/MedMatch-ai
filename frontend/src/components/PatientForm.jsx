import { useState } from "react";

const initialState = {
  age: "",
  sex: "Male",
  cp: "typical angina",
  trestbps: "",
  chol: "",
  fbs: false,
  restecg: "normal",
  thalch: "",
  exang: false,
  oldpeak: "",
  slope: "flat",
  ca: "",
  thal: "normal",
};

const STEPS = [
  { id: 1, title: "Vitals", description: "Core measurements" },
  { id: 2, title: "Symptoms & History", description: "Clinical indicators" },
  { id: 3, title: "Review", description: "Confirm & predict" },
];

const FIELD_META = {
  age: { label: "Age", unit: "years" },
  sex: { label: "Sex" },
  trestbps: { label: "Resting BP", unit: "mm Hg" },
  chol: { label: "Cholesterol", unit: "mg/dl" },
  thalch: { label: "Max heart rate", unit: "bpm" },
  cp: { label: "Chest pain type" },
  restecg: { label: "Resting ECG" },
  slope: { label: "ST slope" },
  ca: { label: "Major vessels", unit: "0–3" },
  thal: { label: "Thalassemia" },
  oldpeak: { label: "ST depression", unit: "oldpeak" },
  fbs: { label: "Fasting blood sugar > 120 mg/dl" },
  exang: { label: "Exercise-induced angina" },
};

function validateField(name, value) {
  const n = Number(value);
  switch (name) {
    case "age":
      if (value === "" || value === null) return "Age is required.";
      if (!Number.isFinite(n) || n < 1 || n > 120) return "Enter an age between 1 and 120.";
      return "";
    case "trestbps":
      if (value === "" || value === null) return "Blood pressure is required.";
      if (!Number.isFinite(n) || n <= 0) return "Enter a value greater than 0.";
      return "";
    case "chol":
      if (value === "" || value === null) return "Cholesterol is required.";
      if (!Number.isFinite(n) || n <= 0) return "Enter a value greater than 0.";
      return "";
    case "thalch":
      if (value === "" || value === null) return "Max heart rate is required.";
      if (!Number.isFinite(n) || n <= 0) return "Enter a value greater than 0.";
      return "";
    case "oldpeak":
      if (value === "" || value === null) return "ST depression is required.";
      if (!Number.isFinite(n) || n < 0) return "Enter a value of 0 or greater.";
      return "";
    case "ca":
      if (value === "" || value === null) return "Major vessels is required.";
      if (!Number.isFinite(n) || n < 0 || n > 3) return "Enter a value between 0 and 3.";
      return "";
    default:
      return "";
  }
}

function validateStep(step, formData) {
  const errors = {};
  if (step === 1) {
    for (const name of ["age", "trestbps", "chol", "thalch"]) {
      const msg = validateField(name, formData[name]);
      if (msg) errors[name] = msg;
    }
  }
  if (step === 2) {
    for (const name of ["oldpeak", "ca"]) {
      const msg = validateField(name, formData[name]);
      if (msg) errors[name] = msg;
    }
  }
  return errors;
}

function isStepComplete(step, formData) {
  return Object.keys(validateStep(step, formData)).length === 0;
}

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-ink shadow-sm transition " +
  "placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30";
const inputErrorClass =
  "w-full rounded-lg border border-danger bg-dangerSoft/40 px-3 py-2.5 text-sm text-ink shadow-sm transition " +
  "focus:border-danger focus:outline-none focus:ring-2 focus:ring-danger/30";
const labelClass = "mb-1.5 block text-sm font-medium text-ink";

export default function PatientForm({ onSubmit, loading }) {
  const [formData, setFormData] = useState(initialState);
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [direction, setDirection] = useState("forward");
  const [animKey, setAnimKey] = useState(0);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const nextValue = type === "checkbox" ? checked : value;
    setFormData((prev) => ({ ...prev, [name]: nextValue }));
    if (type !== "checkbox") {
      setErrors((prev) => ({ ...prev, [name]: validateField(name, nextValue) }));
    }
  };

  const handleBlur = (e) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") return;
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  const goTo = (nextStep) => {
    setDirection(nextStep > step ? "forward" : "back");
    setAnimKey((k) => k + 1);
    setStep(nextStep);
  };

  const handleNext = () => {
    const stepErrors = validateStep(step, formData);
    setErrors((prev) => ({ ...prev, ...stepErrors }));
    if (Object.keys(stepErrors).length > 0) return;
    goTo(Math.min(3, step + 1));
  };

  const handleBack = () => {
    goTo(Math.max(1, step - 1));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const allErrors = {
      ...validateStep(1, formData),
      ...validateStep(2, formData),
    };
    setErrors(allErrors);
    if (Object.keys(allErrors).length > 0) {
      goTo(Object.keys(validateStep(1, formData)).length ? 1 : 2);
      return;
    }
    onSubmit({
      ...formData,
      age: Number(formData.age),
      trestbps: Number(formData.trestbps),
      chol: Number(formData.chol),
      thalch: Number(formData.thalch),
      oldpeak: Number(formData.oldpeak),
      ca: Number(formData.ca),
    });
  };

  const canNext = isStepComplete(step, formData);

  return (
    <form
      onSubmit={handleSubmit}
      className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm"
    >
      {/* Progress tracker */}
      <div className="border-b border-slate-100 bg-surface/80 px-4 py-5 sm:px-6">
        <ol className="grid grid-cols-3 gap-2 sm:gap-3">
          {STEPS.map((s) => {
            const done = s.id < step;
            const current = s.id === step;
            return (
              <li key={s.id} className="min-w-0">
                <div
                  className={`mb-2 h-1.5 rounded-full transition-colors duration-300 ${
                    done || current ? "bg-primary" : "bg-slate-200"
                  }`}
                />
                <div className="flex items-start gap-2">
                  <span
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold transition-colors duration-300 ${
                      done
                        ? "bg-primary text-white"
                        : current
                          ? "bg-primary/15 text-primaryDark ring-2 ring-primary/40"
                          : "bg-slate-100 text-slate-400"
                    }`}
                    aria-hidden
                  >
                    {done ? (
                      <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M3.5 8.5 6.5 11.5 12.5 4.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : (
                      s.id
                    )}
                  </span>
                  <div className="min-w-0">
                    <p
                      className={`truncate font-heading text-xs font-semibold sm:text-sm ${
                        current || done ? "text-ink" : "text-slate-400"
                      }`}
                    >
                      {s.title}
                    </p>
                    <p className="hidden truncate text-[11px] text-slate-400 sm:block">{s.description}</p>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="relative px-4 py-6 sm:px-6">
        <div
          key={animKey}
          className={`transition-all duration-300 ease-out ${
            direction === "forward" ? "translate-x-0 opacity-100" : "translate-x-0 opacity-100"
          }`}
          style={{
            animation: "mmFadeSlide 280ms ease-out",
          }}
        >
          <style>{`
            @keyframes mmFadeSlide {
              from { opacity: 0; transform: translateX(${direction === "forward" ? "12px" : "-12px"}); }
              to { opacity: 1; transform: translateX(0); }
            }
          `}</style>

          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h2 className="font-heading text-lg font-bold text-ink">Vitals</h2>
                <p className="mt-0.5 text-sm text-slate-500">Basic patient measurements used by the model.</p>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field
                  label="Age"
                  name="age"
                  type="number"
                  value={formData.age}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.age}
                  min={1}
                  max={120}
                />
                <div>
                  <label className={labelClass} htmlFor="sex">
                    Sex
                  </label>
                  <select
                    id="sex"
                    name="sex"
                    className={inputClass}
                    value={formData.sex}
                    onChange={handleChange}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <Field
                  label="Resting Blood Pressure (mm Hg)"
                  name="trestbps"
                  type="number"
                  value={formData.trestbps}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.trestbps}
                />
                <Field
                  label="Serum Cholesterol (mg/dl)"
                  name="chol"
                  type="number"
                  value={formData.chol}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.chol}
                />
                <Field
                  label="Max Heart Rate Achieved"
                  name="thalch"
                  type="number"
                  value={formData.thalch}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.thalch}
                  className="sm:col-span-2"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h2 className="font-heading text-lg font-bold text-ink">Symptoms & History</h2>
                <p className="mt-0.5 text-sm text-slate-500">ECG, pain type, and related clinical history.</p>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass} htmlFor="cp">
                    Chest Pain Type
                  </label>
                  <select id="cp" name="cp" className={inputClass} value={formData.cp} onChange={handleChange}>
                    <option value="typical angina">Typical angina</option>
                    <option value="atypical angina">Atypical angina</option>
                    <option value="non-anginal">Non-anginal</option>
                    <option value="asymptomatic">Asymptomatic</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass} htmlFor="restecg">
                    Resting ECG
                  </label>
                  <select
                    id="restecg"
                    name="restecg"
                    className={inputClass}
                    value={formData.restecg}
                    onChange={handleChange}
                  >
                    <option value="normal">Normal</option>
                    <option value="st-t abnormality">ST-T abnormality</option>
                    <option value="lv hypertrophy">LV hypertrophy</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass} htmlFor="slope">
                    Slope of Peak Exercise ST
                  </label>
                  <select id="slope" name="slope" className={inputClass} value={formData.slope} onChange={handleChange}>
                    <option value="upsloping">Upsloping</option>
                    <option value="flat">Flat</option>
                    <option value="downsloping">Downsloping</option>
                  </select>
                </div>
                <Field
                  label="Major Vessels (0-3)"
                  name="ca"
                  type="number"
                  value={formData.ca}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.ca}
                  min={0}
                  max={3}
                />
                <div>
                  <label className={labelClass} htmlFor="thal">
                    Thalassemia
                  </label>
                  <select id="thal" name="thal" className={inputClass} value={formData.thal} onChange={handleChange}>
                    <option value="normal">Normal</option>
                    <option value="fixed defect">Fixed defect</option>
                    <option value="reversable defect">Reversable defect</option>
                  </select>
                </div>
                <Field
                  label="ST Depression (oldpeak)"
                  name="oldpeak"
                  type="number"
                  step="0.1"
                  value={formData.oldpeak}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.oldpeak}
                />
              </div>
              <div className="flex flex-col gap-3 rounded-xl border border-slate-100 bg-surface px-4 py-3 sm:flex-row sm:gap-8">
                <label className="flex cursor-pointer items-center gap-2.5 text-sm text-ink">
                  <input
                    type="checkbox"
                    name="fbs"
                    checked={formData.fbs}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-2 focus:ring-primary/40"
                  />
                  Fasting blood sugar &gt; 120 mg/dl
                </label>
                <label className="flex cursor-pointer items-center gap-2.5 text-sm text-ink">
                  <input
                    type="checkbox"
                    name="exang"
                    checked={formData.exang}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-2 focus:ring-primary/40"
                  />
                  Exercise-induced angina
                </label>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h2 className="font-heading text-lg font-bold text-ink">Review</h2>
                <p className="mt-0.5 text-sm text-slate-500">Confirm the details below, then run the prediction.</p>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {[
                  "age",
                  "sex",
                  "trestbps",
                  "chol",
                  "thalch",
                  "cp",
                  "restecg",
                  "slope",
                  "ca",
                  "thal",
                  "oldpeak",
                  "fbs",
                  "exang",
                ].map((key) => {
                  const meta = FIELD_META[key];
                  let display = formData[key];
                  if (typeof display === "boolean") display = display ? "Yes" : "No";
                  return (
                    <div
                      key={key}
                      className="rounded-xl border border-slate-100 bg-surface px-3.5 py-2.5"
                    >
                      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                        {meta.label}
                        {meta.unit ? ` · ${meta.unit}` : ""}
                      </p>
                      <p className="mt-0.5 truncate text-sm font-medium text-ink">{String(display)}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <button
          type="button"
          onClick={handleBack}
          disabled={step === 1}
          className="rounded-lg px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Back
        </button>

        <div className="flex gap-3">
          {step < 3 ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={!canNext}
              className="w-full rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primaryDark focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-primary/40 sm:w-auto"
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primaryDark focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-primary/40 sm:w-auto"
            >
              {loading ? "Analyzing…" : "Get Prediction"}
            </button>
          )}
        </div>
      </div>
    </form>
  );
}

function Field({ label, name, error, className = "", onBlur, ...props }) {
  return (
    <div className={className}>
      <label className={labelClass} htmlFor={name}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        required
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${name}-error` : undefined}
        className={error ? inputErrorClass : inputClass}
        onBlur={onBlur}
        {...props}
      />
      {error ? (
        <p id={`${name}-error`} className="mt-1.5 text-xs text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
