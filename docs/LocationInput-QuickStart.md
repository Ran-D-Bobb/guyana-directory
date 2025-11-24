# LocationInput - Quick Start Guide

## 🚀 Get Started in 3 Steps

### Step 1: Get API Key (2 minutes)
1. Go to https://www.geoapify.com/
2. Sign up (free, no credit card)
3. Copy your API key

### Step 2: Configure (30 seconds)
```bash
# Add to .env.local
NEXT_PUBLIC_GEOAPIFY_API_KEY=paste-your-key-here
```

### Step 3: Restart Dev Server
```bash
npm run dev
```

## ✅ That's It!

The LocationInput is **already integrated** into your business registration form. Just test it:

1. Go to business registration page
2. Fill in Step 1 (name, description)
3. In Step 2, type an address (e.g., "Georgetown Guyana")
4. Select from suggestions
5. See the map with draggable pin
6. Complete and submit

## 📍 Where It's Integrated

- ✅ **Business Registration Form** - Step 2 (Category & Location)
- ⏳ **Rental Form** - Not yet (optional)
- ⏳ **Event Form** - Not yet (optional)

## 📊 What Gets Saved

When a business is created, the database stores:
- `latitude` - e.g., 6.801111
- `longitude` - e.g., -58.167222
- `formatted_address` - e.g., "123 Main St, Georgetown, Guyana"

## 🎯 Use Cases

### Display on Business Profile
```tsx
{business.formatted_address && (
  <p>{business.formatted_address}</p>
)}
```

### Get Directions Link
```tsx
<a href={`https://www.google.com/maps/search/?api=1&query=${business.latitude},${business.longitude}`}>
  Get Directions
</a>
```

### Show Map
```tsx
import { MapPreview } from '@/components/forms/inputs/MapPreview'

<MapPreview
  latitude={business.latitude}
  longitude={business.longitude}
  apiKey={process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY!}
  draggable={false}
/>
```

## 📚 Full Documentation

- **This Quick Start** - You are here
- **Setup Checklist** - `docs/LocationInput-Setup-Checklist.md`
- **Complete Usage Guide** - `docs/LocationInput-Usage.md`
- **Integration Status** - `docs/LocationInput-Integration-Complete.md`
- **Technical Summary** - `docs/LocationInput-Implementation-Summary.md`

## 💡 Common Questions

**Q: Where do I get the API key?**
A: https://www.geoapify.com/ (free tier: 3,000 requests/day)

**Q: Is it already integrated?**
A: Yes! Business registration form uses it. Just add your API key.

**Q: What if I want to add it to rental/event forms?**
A: See `docs/LocationInput-Integration-Complete.md` for instructions

**Q: How do I use the component in a custom form?**
A: See `docs/LocationInput-Usage.md` for examples

**Q: Can I customize the component?**
A: Yes! See the props reference in `docs/LocationInput-Usage.md`

## 🐛 Troubleshooting

**No suggestions appearing?**
1. Check API key is in `.env.local`
2. Restart dev server
3. Type at least 3 characters

**Map not loading?**
- Same as above - check API key

**TypeScript errors?**
- Run `npm install` and restart TS server

## 🎉 You're Ready!

Just add your API key and you're good to go. The integration is complete and production-ready.
