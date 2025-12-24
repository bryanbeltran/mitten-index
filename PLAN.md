# 🧤 Mitten Index - Planning & Development Notes

## 🚀 Roadmap

### MVP Features

**Core Functionality:**
- [ ] Location-based weather data fetching (geolocation or manual input)
- [ ] Heuristic scoring engine that calculates Mitten Index from:
  - Current temperature
  - Wind chill factor
  - Humidity levels
  - Cloud cover / sunlight conditions
- [ ] Display current Mitten Index score (0-100 scale or similar)
- [ ] Basic UI showing:
  - Today's index prominently
  - Key contributing factors (temperature, wind, etc.)
  - Simple dressing recommendations based on score ranges
- [ ] Responsive design (mobile-friendly)

**MVP Scope:**
- Single location at a time (current location or search)
- Real-time current conditions only
- Basic scoring algorithm (no historical comparisons yet)
- Simple, clean interface to get the score and basic tips

### Future Enhancements

- [ ] Compare today's score to yesterday and last year
- [ ] Historical trends and charts
- [ ] Shareable daily cards (textable to your mom)
- [ ] User tolerance profiles (because Duluth cold hits different than St. Paul)
- [ ] Multiple saved locations
- [ ] Weather alerts for extreme conditions
- [ ] Detailed breakdown of scoring factors

## ⚙️ Tech Stack

- **Next.js 15** with App Router
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui** for components with nice mittens
- **Weather API** (see data sources below)
- **Supabase** (for logging trends, not storing ice)
- **Deployed on Vercel** (where it's always sunny and warm... unlike here)

## 📊 Data Sources

### Government Sources (Free)

**NOAA / National Weather Service**
- **NOAA API** - Free, official US government weather data
  - Current conditions, forecasts, historical data
  - Temperature, wind, humidity, cloud cover
  - Requires API key (free registration)
  - Best for: US locations, reliable official data
  - Note: May require calculating wind chill from temperature + wind speed

**MesoWest** (University of Utah)
- Cooperative mesoscale weather observation network
- Real-time station data across the US
- Temperature, humidity, wind, precipitation
- Free access to aggregated data

### Private Sources

**Open-Meteo** ⭐ (Recommended for MVP)
- **Free tier**: Unlimited requests, no API key required
- Provides: Temperature, apparent temperature, wind speed, humidity, cloud cover, solar radiation
- Global coverage, current + forecast + historical data
- Simple REST API, good documentation
- Best for: MVP, global coverage, easy integration

**Google Maps Platform Weather API**
- Real-time, hyperlocal weather data
- Includes: Temperature, wind chill, humidity, cloud cover, UV index
- Current conditions, hourly/daily forecasts, historical (24h)
- Requires Google Cloud account (free tier available)
- Best for: Hyperlocal accuracy, premium features

**Weatherbit**
- Free tier: 500 calls/day
- Temperature, apparent temp, humidity, cloud cover, wind
- Current, forecast, and historical data
- Good documentation, reliable service
- Best for: Balanced free tier, good coverage

**Tomorrow.io** (formerly Climacell)
- Free tier available
- Hyperlocal forecasts with high resolution
- Real-time conditions, forecasts, historical data
- Good for: Advanced features, high accuracy

**Stormglass.io**
- Aggregates data from multiple meteorological sources
- Free tier: 50 requests/day
- Temperature, humidity, cloud coverage, wind, solar radiance
- Global coverage, high-resolution forecasts
- Best for: Multiple data source aggregation

### Recommendation for MVP

**Start with Open-Meteo** - It's free, requires no API key, has all the data points needed (temperature, wind, humidity, cloud cover), and is easy to integrate. Can always add NOAA or other sources later for redundancy or US-specific accuracy.

## 🧮 Scoring Algorithm Notes

### Factors to Consider:
- **Temperature** (obviously)
- **Wind chill** (is your face gonna fall off?)
- **Humidity** (dry cold vs bone-deep chill)
- **Sunlight or cloud cover** (is the sun helping, or hiding?)
- **Recent weather shifts** (sudden 40° drops mess you up)
- **Perceived cold** (how Minnesotans *feel* it, not just measure it)

### Scoring Scale Ideas:
- 0-100 scale where higher = more brutal?
- Or inverted where lower = more brutal?
- Need to define ranges and corresponding dressing recommendations

## 📝 Development Notes

_Add implementation notes, decisions, and learnings here as development progresses._

