# 🎨 Weekly Themes System

## Overview
Quad now features an automated weekly themes system that cycles through 7 different themes, one for each day of the week. These themes repeat every week automatically.

## Weekly Themes Schedule

### 🗓️ Monday – "Meme Drop Monday"
Start the week with chaos. Students post their funniest, freshest memes — about school life, coding fails, teachers, or anything random.
**Goal:** Fill the feed with laughter and energy to kick off the week.

### 🧠 Tuesday – "Tech Trouble Tuesday"
The day for developers' pain. Post screenshots of errors, bugs, or weird code moments — things like "Why is my program crying again?" or "404: brain not found."
**Goal:** Share programming struggles humorously.

### 😭 Wednesday – "Weird Wednesday"
Get weird, get wild. Post strange photos, awkward moments, funny class memories, cursed screenshots, or just random weirdness.
**Goal:** Be the most random person on campus for one day.

### 📸 Thursday – "Throwback Thursday"
Nostalgia hits. Share old school photos, funny childhood pics, or past school events that still make you laugh (or cringe).
**Goal:** Make people go "No way that's you!"

### 😂 Friday – "Roast Friday"
Time to roast — playfully! Create funny posts or captions that gently roast things like your own class, subjects, or student life.
**⚠️ Keep it friendly, no personal attacks.**
**Goal:** Funniest roast of the week gets featured.

### 💬 Saturday – "Confession Saturday"
Go anonymous, go honest. Students post funny, embarrassing, or secret stories (like "I submitted a blank file and still passed.").
**Goal:** Let the confessions entertain everyone.

### 📊 Sunday – "Poll Party Sunday"
The day for debates and votes. Create fun polls like:
- "Best programming language: Python or JavaScript?"
- "Would you rather pass without studying or never have exams?"
**Goal:** Get everyone to vote and argue playfully.

---

## Setup Instructions

### 1. Seed the Weekly Themes
Run this command to populate the database with themes for the next 4 weeks:

```bash
cd backend
npm run seed:themes
```

This will:
- Clear any existing themes
- Create themes for the next 4 weeks (28 themes total)
- Automatically activate today's theme

### 2. Automatic Theme Updates
The theme scheduler runs automatically when the server starts. It will:
- Update the active theme every day at midnight (00:00)
- Automatically create new themes for upcoming weeks
- Ensure there are always themes for the next 4 weeks

### 3. Manual Theme Update (Optional)
If you need to manually trigger a theme update, you can restart the server, which will automatically check and update the active theme.

---

## How It Works

### Theme Scheduler
- **Runs:** Daily at midnight (00:00)
- **Function:** Activates the correct theme based on the current day
- **Auto-creation:** Automatically creates themes for future weeks if needed

### Theme Rotation
- Themes are based on the day of the week (0 = Sunday, 1 = Monday, etc.)
- Each theme lasts for exactly 24 hours (00:00 to 23:59)
- Themes repeat every week automatically

### Database Structure
```javascript
{
  title: "🗓️ Meme Drop Monday",
  description: "Start the week with chaos...",
  emoji: "🎨",
  dayOfWeek: 1, // 0-6 (Sunday-Saturday)
  startDate: Date,
  endDate: Date,
  isActive: Boolean,
  isRecurring: true
}
```

---

## API Endpoints

### Get Current Active Theme
```
GET /api/themes/current
```
Returns the currently active theme.

### Get All Themes
```
GET /api/themes
```
Returns all themes, sorted by start date.

### Create Theme (Admin Only)
```
POST /api/themes
```
Create a new custom theme (requires admin authentication).

---

## Frontend Integration

The current theme is automatically fetched and displayed in the Feed page. When users create a post, it's automatically tagged with the current theme.

### Example Usage
```javascript
// Fetch current theme
const response = await api.get('/api/themes/current');
const currentTheme = response.data;

// Display theme banner
<div className="theme-banner">
  <span>{currentTheme.emoji}</span>
  <h2>{currentTheme.title}</h2>
  <p>{currentTheme.description}</p>
</div>
```

---

## Maintenance

### Check Active Theme
The server logs will show which theme is active:
```
✅ Activated theme: 🗓️ Meme Drop Monday
```

### Verify Themes in Database
You can check themes in MongoDB:
```javascript
db.themes.find({ isActive: true })
```

### Reset Themes
If you need to reset all themes:
```bash
npm run seed:themes
```

---

## Notes

- Themes are timezone-aware based on your server's timezone
- The system automatically handles week transitions
- Old themes are kept in the database for historical purposes
- Themes can be manually created by admins for special events
- The recurring flag ensures themes repeat weekly

---

## Troubleshooting

**Theme not updating?**
- Check server logs for cron job execution
- Restart the server to trigger immediate update
- Verify MongoDB connection

**No active theme?**
- Run `npm run seed:themes` to create initial themes
- Check that themes exist for today's date in the database

**Wrong theme showing?**
- Verify server timezone matches your location
- Check the `dayOfWeek` field in the database (0-6)
