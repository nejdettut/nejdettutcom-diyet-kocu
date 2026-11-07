# AI Diyet Koçu

Gün içinde yediklerini serbest metin olarak yaz — yapay zekâ kalori hesaplar, beslenme dengesini yorumlar ve hedefine göre 7 günlük bir beslenme planı önerir.

[nejdettut.com](https://www.nejdettut.com) vitrinde yer alan, Next.js 16 + Vercel AI SDK + Groq tabanlı bir uygulama.

## Teknoloji

- Next.js 16 (App Router)
- Vercel AI SDK + `@ai-sdk/groq`
- Groq `openai/gpt-oss-120b`
- Zod schema
- Tailwind CSS v4

## Çalıştırma

```bash
npm install
cp .env.example .env.local
# GROQ_API_KEY değerini doldur (ücretsiz: console.groq.com)
npm run dev
```

## Deploy

1. Vercel'e bu repo'yu import et.
2. `GROQ_API_KEY` env'e ekle.
3. Yayına al. Varsayılan: `nejdettutcom-diyet-kocu.vercel.app`. Özel: `diyet.nejdettut.com`.

## Uyarı

Bu araç eğitim amaçlıdır; diyetisyen veya hekim önerisinin yerine geçmez.

## Lisans

MIT · [Nejdet Tut](https://www.nejdettut.com)
