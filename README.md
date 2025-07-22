# 🧤 Mitten Index

**Mitten Index** is a cold weather scoring system that tells you how *brutal* it really feels out there — not just what the thermometer says. Using real-time local data and Midwestern common sense, it gives you a score you can actually dress for.

## 🌡️ What It Measures

The Mitten Index blends hard data and human judgment, factoring in:

- **Temperature** (obviously)
- **Wind chill** (is your face gonna fall off?)
- **Humidity** (dry cold vs bone-deep chill)
- **Sunlight or cloud cover** (is the sun helping, or hiding?)
- **Recent weather shifts** (sudden 40° drops mess you up)
- **Perceived cold** (how Minnesotans *feel* it, not just measure it)

In short, is it “sweater weather” or “better cancel your plans”?

## 🧠 Why?

If you live where your eyelashes can freeze, you know the weather app doesn’t tell the whole story. A sunny 5°F might feel fine. A windy 25°F might feel like death. This tool helps you prep your layers, errands, and attitude accordingly — so you don’t get caught in a bad mood in a bad jacket.

## ⚙️ Tech Stack (Planned)

- **Next.js 15** with App Router
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui** for components with nice mittens
- **Weather API** (Open-Meteo, Tomorrow.io, etc.)
- **Supabase** (for logging trends, not storing ice)
- **Deployed on Vercel** (where it's always sunny and warm... unlike here)

## 🚀 Roadmap

- [ ] Basic MVP score by location
- [ ] Heuristic scoring engine
- [ ] UI showing today’s index + dressing tips (“you’ll want long underwear”)
- [ ] Compare today's score to yesterday and last year
- [ ] Shareable daily cards (textable to your mom)
- [ ] User tolerance profiles (because Duluth cold hits different than St. Paul)

## 📦 Local Development

```bash
pnpm install
pnpm dev 
```

📄 License

MIT

Made in Minnesota by @bryanbeltran