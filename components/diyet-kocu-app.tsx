"use client";

import { useState } from "react";
import {
  AlertCircle,
  Apple,
  Flame,
  Loader2,
  Sparkles,
  Utensils,
} from "lucide-react";
import { cn } from "@/lib/utils";

type DailyFood = { name: string; portion: string; kcal: number };
type DayPlan = {
  day: string;
  breakfast: string;
  lunch: string;
  snack: string;
  dinner: string;
  kcal: number;
};

type PlanResult = {
  totals: { calories: number; protein: number; carbs: number; fat: number };
  foods: DailyFood[];
  balance: string;
  tips: string[];
  weeklyPlan: DayPlan[];
};

type Goal = "zayiflama" | "kas" | "saglikli";
type Diet = "standart" | "vejetaryen" | "vegan" | "glutensiz";

const GOALS: { value: Goal; label: string; icon: string }[] = [
  { value: "zayiflama", label: "Kilo vermek", icon: "📉" },
  { value: "kas", label: "Kas kazanmak", icon: "💪" },
  { value: "saglikli", label: "Sağlıklı beslenmek", icon: "🥗" },
];

const DIETS: { value: Diet; label: string }[] = [
  { value: "standart", label: "Standart" },
  { value: "vejetaryen", label: "Vejetaryen" },
  { value: "vegan", label: "Vegan" },
  { value: "glutensiz", label: "Glutensiz" },
];

const EXAMPLE = `Sabah: 2 yumurta omlet, 1 dilim tam buğday ekmek, 1 bardak sade çay
Ara: 1 orta elma, 10 adet badem
Öğle: 1 kase mercimek çorbası, tavuklu bulgur pilavı (1 porsiyon), 1 bardak ayran
Akşam: Ton balıklı salata, 2 dilim ekmek, 1 su bardağı su`;

const BTN_PRIMARY =
  "inline-flex items-center justify-center gap-1.5 rounded-lg bg-brand-navy px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-navy/90 hover:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-turquoise focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-brand-turquoise dark:text-brand-navy";

const BTN_OUTLINE =
  "inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white/70 px-4 py-2 text-sm font-medium text-slate-900 shadow-sm backdrop-blur transition hover:bg-slate-50 hover:shadow disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100 dark:hover:bg-slate-900";

const CARD =
  "rounded-2xl border border-slate-200 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/60";

const MUTED_TEXT = "text-slate-500 dark:text-slate-400";

export function DiyetKocuApp() {
  const [dailyLog, setDailyLog] = useState("");
  const [goal, setGoal] = useState<Goal>("saglikli");
  const [dietType, setDietType] = useState<Diet>("standart");
  const [allergies, setAllergies] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PlanResult | null>(null);
  const [activeDay, setActiveDay] = useState(0);

  async function run() {
    if (dailyLog.trim().length < 10) {
      setError("En az 10 karakterlik günlük beslenmeni yaz.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const r = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dailyLog, goal, dietType, allergies }),
      });
      const data = await r.json();
      if (!r.ok) setError(data.error ?? "Bilinmeyen hata.");
      else {
        setResult(data as PlanResult);
        setActiveDay(0);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ağ hatası.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      {/* Input column */}
      <div className="space-y-4 lg:col-span-2">
        <div className={CARD}>
          <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-800">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
              <Utensils className="size-4 text-brand-turquoise" />
              Bugün ne yedin?
            </h2>
          </div>
          <div className="space-y-4 p-5">
            <textarea
              value={dailyLog}
              onChange={(e) => setDailyLog(e.target.value)}
              placeholder="Serbestçe yaz. Örn: Sabah 2 yumurta, 1 bardak süt, 1 dilim ekmek. Öğle: tavuklu salata…"
              className="block h-44 w-full resize-y rounded-lg border border-slate-300 bg-white p-3 text-sm leading-relaxed text-slate-900 shadow-inner outline-none focus:border-brand-turquoise focus:ring-2 focus:ring-brand-turquoise/30 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />

            <div>
              <label className={cn("mb-1.5 block text-xs font-semibold uppercase tracking-wider", MUTED_TEXT)}>
                Hedefin
              </label>
              <div className="grid grid-cols-3 gap-2">
                {GOALS.map((g) => (
                  <button
                    key={g.value}
                    type="button"
                    onClick={() => setGoal(g.value)}
                    className={cn(
                      "rounded-lg border px-2 py-2 text-xs font-medium transition",
                      goal === g.value
                        ? "border-brand-navy bg-brand-navy/5 text-slate-900 dark:border-brand-turquoise dark:bg-brand-turquoise/10 dark:text-slate-100"
                        : "border-slate-300 bg-white/50 text-slate-600 hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300",
                    )}
                  >
                    <span className="mr-1">{g.icon}</span>
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className={cn("mb-1.5 block text-xs font-semibold uppercase tracking-wider", MUTED_TEXT)}>
                Diyet türü
              </label>
              <select
                value={dietType}
                onChange={(e) => setDietType(e.target.value as Diet)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              >
                {DIETS.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={cn("mb-1.5 block text-xs font-semibold uppercase tracking-wider", MUTED_TEXT)}>
                Alerji / kaçındıkların (opsiyonel)
              </label>
              <input
                type="text"
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                placeholder="örn: fıstık, deniz ürünü, laktoz"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              />
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                onClick={run}
                disabled={loading || dailyLog.trim().length < 10}
                className={BTN_PRIMARY}
              >
                {loading ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    Plan üretiliyor…
                  </>
                ) : (
                  <>
                    <Sparkles className="size-3.5" />
                    Planımı üret
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setDailyLog(EXAMPLE)}
                disabled={loading}
                className={BTN_OUTLINE}
              >
                Örnek doldur
              </button>
            </div>

            <p className={cn("text-[11px]", MUTED_TEXT)}>
              Saatte 15 plan sınırı. Metin maksimum 4.000 karakter.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-900 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-200">
          <strong>Bilgilendirme:</strong> Bu araç eğitim amaçlıdır; diyetisyen ya
          da hekim önerisinin yerine geçmez.
        </div>
      </div>

      {/* Output column */}
      <div className="space-y-4 lg:col-span-3">
        {error ? (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-900 dark:border-red-400/30 dark:bg-red-400/10 dark:text-red-200"
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <span>{error}</span>
          </div>
        ) : null}

        {!result && !loading && !error ? (
          <div
            className={cn(
              CARD,
              "flex flex-col items-center gap-3 border-dashed py-14 text-center",
            )}
          >
            <Apple className="size-10 text-brand-turquoise" />
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">
              Hazır olduğunda planını üret
            </h3>
            <p className={cn("max-w-sm text-sm", MUTED_TEXT)}>
              Bugün yediğini serbestçe yaz, hedefini seç, &quot;Planımı
              üret&quot;e bas. Kalori + beslenme dengesi + 7 günlük plan
              gelecek.
            </p>
          </div>
        ) : null}

        {loading ? (
          <div
            className={cn(
              CARD,
              "flex flex-col items-center gap-3 py-14 text-center",
            )}
          >
            <Loader2 className="size-10 animate-spin text-brand-turquoise" />
            <p className={cn("text-sm", MUTED_TEXT)}>
              Plan hazırlanıyor… 15-30 saniye.
            </p>
          </div>
        ) : null}

        {result ? (
          <>
            {/* Totals */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCard
                label="Kalori"
                value={result.totals.calories}
                unit="kcal"
                color="text-rose-600 dark:text-rose-400"
                icon={<Flame className="size-4" />}
              />
              <StatCard
                label="Protein"
                value={result.totals.protein}
                unit="g"
                color="text-sky-600 dark:text-sky-400"
              />
              <StatCard
                label="Karbonhidrat"
                value={result.totals.carbs}
                unit="g"
                color="text-amber-600 dark:text-amber-400"
              />
              <StatCard
                label="Yağ"
                value={result.totals.fat}
                unit="g"
                color="text-emerald-600 dark:text-emerald-400"
              />
            </div>

            {/* Food breakdown */}
            <div className={cn(CARD, "px-5 py-5")}>
              <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">
                Yiyeceklerinin dağılımı
              </h3>
              <ul className="divide-y divide-slate-200 dark:divide-slate-800">
                {result.foods.map((f, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between py-2 text-sm"
                  >
                    <span className="text-slate-900 dark:text-slate-100">
                      <span className="font-medium">{f.name}</span>
                      <span className={cn("ml-2 text-xs", MUTED_TEXT)}>
                        {f.portion}
                      </span>
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {f.kcal}{" "}
                      <span className={cn("text-xs font-normal", MUTED_TEXT)}>
                        kcal
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Balance + tips */}
            <div className={cn(CARD, "px-5 py-5")}>
              <h3 className="mb-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                Beslenme dengesi
              </h3>
              <p className={cn("mb-4 text-sm leading-relaxed", MUTED_TEXT)}>
                {result.balance}
              </p>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-brand-turquoise">
                Önerilen ipuçları
              </h4>
              <ul className="space-y-1.5">
                {result.tips.map((t, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-200"
                  >
                    <Sparkles className="mt-0.5 size-3.5 shrink-0 text-brand-amber" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Weekly plan */}
            <div className={cn(CARD, "overflow-hidden")}>
              <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-800">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  7 günlük beslenme planı
                </h3>
              </div>

              <div className="flex flex-wrap gap-1 border-b border-slate-200 px-3 py-2 dark:border-slate-800">
                {result.weeklyPlan.map((d, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveDay(i)}
                    className={cn(
                      "rounded-lg px-3 py-1.5 text-xs font-medium transition",
                      activeDay === i
                        ? "bg-brand-navy text-white dark:bg-brand-turquoise dark:text-brand-navy"
                        : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800",
                    )}
                  >
                    {d.day}
                  </button>
                ))}
              </div>

              {result.weeklyPlan[activeDay] ? (
                <div className="space-y-3 p-5">
                  <MealRow
                    label="Kahvaltı"
                    text={result.weeklyPlan[activeDay].breakfast}
                  />
                  <MealRow
                    label="Öğle"
                    text={result.weeklyPlan[activeDay].lunch}
                  />
                  <MealRow
                    label="Ara"
                    text={result.weeklyPlan[activeDay].snack}
                  />
                  <MealRow
                    label="Akşam"
                    text={result.weeklyPlan[activeDay].dinner}
                  />
                  <div className="mt-2 flex items-center justify-between rounded-lg bg-slate-100 px-3 py-2 text-sm dark:bg-slate-800">
                    <span className={MUTED_TEXT}>Tahmini toplam</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {result.weeklyPlan[activeDay].kcal} kcal
                    </span>
                  </div>
                </div>
              ) : null}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  unit,
  color,
  icon,
}: {
  label: string;
  value: number;
  unit: string;
  color: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className={cn(CARD, "px-4 py-4")}>
      <p
        className={cn(
          "flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider",
          MUTED_TEXT,
        )}
      >
        {icon}
        {label}
      </p>
      <p className={cn("mt-1 text-2xl font-bold tracking-tight", color)}>
        {value}
        <span className="ml-1 text-xs font-medium text-slate-500 dark:text-slate-400">
          {unit}
        </span>
      </p>
    </div>
  );
}

function MealRow({ label, text }: { label: string; text: string }) {
  return (
    <div>
      <p className="mb-0.5 text-xs font-semibold uppercase tracking-wider text-brand-turquoise">
        {label}
      </p>
      <p className="text-sm text-slate-700 dark:text-slate-200">{text}</p>
    </div>
  );
}
