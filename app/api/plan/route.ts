import "server-only";
import { generateObject } from "ai";
import { groq } from "@ai-sdk/groq";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 60;

const RequestSchema = z.object({
  dailyLog: z.string().min(10).max(4000),
  goal: z.enum(["zayiflama", "kas", "saglikli"]),
  dietType: z
    .enum(["standart", "vejetaryen", "vegan", "glutensiz"])
    .default("standart"),
  allergies: z.string().max(500).optional(),
});

const PlanSchema = z.object({
  totals: z.object({
    calories: z.number().int(),
    protein: z.number().int(),
    carbs: z.number().int(),
    fat: z.number().int(),
  }),
  foods: z
    .array(
      z.object({
        name: z.string(),
        portion: z.string(),
        kcal: z.number().int(),
      }),
    )
    .min(1)
    .max(30),
  balance: z.string(),
  tips: z.array(z.string()).min(2).max(6),
  weeklyPlan: z
    .array(
      z.object({
        day: z.string(),
        breakfast: z.string(),
        lunch: z.string(),
        snack: z.string(),
        dinner: z.string(),
        kcal: z.number().int(),
      }),
    )
    .length(7),
});

const GOAL_LABEL: Record<z.infer<typeof RequestSchema>["goal"], string> = {
  zayiflama: "Kilo verme (günlük kalori açığı ~400-500 kcal)",
  kas: "Kas kazanma (günlük hafif kalori fazlası, yüksek protein 1.6 g/kg)",
  saglikli: "Sağlıklı beslenme dengesi (koruyucu kalori)",
};

const DIET_LABEL: Record<z.infer<typeof RequestSchema>["dietType"], string> = {
  standart: "standart karışık",
  vejetaryen: "vejetaryen (et yok, süt/yumurta var)",
  vegan: "vegan (hayvansal ürün yok)",
  glutensiz: "glutensiz",
};

export async function POST(req: Request) {
  const limited = await rateLimit({
    action: "diyet-plan",
    windowMs: 60 * 60 * 1000,
    max: 15,
  });
  if (!limited.ok) {
    return json(
      {
        error:
          "Saatte en fazla 15 plan üretebilirsin. Lütfen biraz sonra tekrar dene.",
      },
      429,
    );
  }

  let body: z.infer<typeof RequestSchema>;
  try {
    body = RequestSchema.parse(await req.json());
  } catch {
    return json({ error: "Geçersiz istek gövdesi." }, 400);
  }

  const system = [
    "Sen deneyimli bir beslenme koçusun. Türkiye'deki yaygın yiyecekleri biliyorsun.",
    "Kullanıcı gün içinde yediklerini serbest metin olarak yazar.",
    "Sen yiyecekleri tek tek ayıklayıp porsiyon + tahmini kalori değerlerini çıkarırsın.",
    "Günlük toplam kalori + protein + karbonhidrat + yağ gramajını hesaplarsın.",
    "Beslenme dengesini kısaca (1-2 cümle) yorumlarsın.",
    "Kullanıcının hedefine göre 2-6 somut ipucu verirsin.",
    "7 günlük beslenme planı önerirsin (her gün için kahvaltı + öğle + ara + akşam + tahmini toplam kcal).",
    "Her şey Türkçe. 'Kesin' tıbbi öneri verme; 'önerilir', 'olabilir', 'tahmini' gibi ifadeler kullan.",
    "Kalorileri Türk porsiyonlarıyla hesapla (1 orta ekmek ~200 kcal, 1 kase pilav ~250 kcal, 1 orta elma ~80 kcal).",
    `Diyet türü: ${DIET_LABEL[body.dietType]}.`,
    `Hedef: ${GOAL_LABEL[body.goal]}.`,
    body.allergies ? `Alerji/kaçınma: ${body.allergies}` : "",
  ]
    .filter(Boolean)
    .join(" ");

  const prompt = `Kullanıcının bugün yedikleri:\n\n${body.dailyLog}\n\nAnalizi ve 7 günlük planı JSON şemasına uygun döndür.`;

  try {
    const { object } = await generateObject({
      model: groq("openai/gpt-oss-120b"),
      schema: PlanSchema,
      system,
      prompt,
      temperature: 0.4,
    });
    return json(object);
  } catch (err) {
    console.error("[diyet] failed:", err);
    return json(
      { error: "Plan üretilemedi. Lütfen biraz sonra tekrar dene." },
      502,
    );
  }
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
