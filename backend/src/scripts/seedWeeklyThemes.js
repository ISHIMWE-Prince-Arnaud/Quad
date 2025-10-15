import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Theme from '../models/Theme.js';

dotenv.config();

const weeklyThemes = [
  {
    dayOfWeek: 1, // Monday
    title: "🗓️ Meme Drop Monday",
    description: "Start the week with chaos. Students post their funniest, freshest memes — about school life, coding fails, teachers, or anything random. 🏆 Goal: Fill the feed with laughter and energy to kick off the week.",
    emoji: "🎨"
  },
  {
    dayOfWeek: 2, // Tuesday
    title: "🧠 Tech Trouble Tuesday",
    description: "The day for developers' pain. Post screenshots of errors, bugs, or weird code moments — things like 'Why is my program crying again?' or '404: brain not found.' 🏆 Goal: Share programming struggles humorously.",
    emoji: "💻"
  },
  {
    dayOfWeek: 3, // Wednesday
    title: "😭 Weird Wednesday",
    description: "Get weird, get wild. Post strange photos, awkward moments, funny class memories, cursed screenshots, or just random weirdness. 🏆 Goal: Be the most random person on campus for one day.",
    emoji: "🤪"
  },
  {
    dayOfWeek: 4, // Thursday
    title: "📸 Throwback Thursday",
    description: "Nostalgia hits. Share old school photos, funny childhood pics, or past school events that still make you laugh (or cringe). 🏆 Goal: Make people go 'No way that's you!'",
    emoji: "⏮️"
  },
  {
    dayOfWeek: 5, // Friday
    title: "😂 Roast Friday",
    description: "Time to roast — playfully! Create funny posts or captions that gently roast things like your own class, subjects, or student life. ⚠️ Keep it friendly, no personal attacks. 🏆 Goal: Funniest roast of the week gets featured.",
    emoji: "🔥"
  },
  {
    dayOfWeek: 6, // Saturday
    title: "💬 Confession Saturday",
    description: "Go anonymous, go honest. Students post funny, embarrassing, or secret stories (like 'I submitted a blank file and still passed.'). 🏆 Goal: Let the confessions entertain everyone.",
    emoji: "🤫"
  },
  {
    dayOfWeek: 0, // Sunday
    title: "📊 Poll Party Sunday",
    description: "The day for debates and votes. Create fun polls like: 'Best programming language: Python or JavaScript?' or 'Would you rather pass without studying or never have exams?' 🏆 Goal: Get everyone to vote and argue playfully.",
    emoji: "🗳️"
  }
];

const seedWeeklyThemes = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected...');

    // Clear existing themes
    await Theme.deleteMany({});
    console.log('Cleared existing themes');

    // Get current date
    const now = new Date();
    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.

    // Create themes for the next 4 weeks
    const themesToCreate = [];
    
    for (let week = 0; week < 4; week++) {
      for (const theme of weeklyThemes) {
        // Calculate the date for this theme
        const daysUntilTheme = (theme.dayOfWeek - currentDay + 7) % 7;
        const themeDate = new Date(now);
        themeDate.setDate(now.getDate() + daysUntilTheme + (week * 7));
        themeDate.setHours(0, 0, 0, 0);

        const endDate = new Date(themeDate);
        endDate.setHours(23, 59, 59, 999);

        // Check if this is today's theme
        const isToday = themeDate.toDateString() === now.toDateString();

        themesToCreate.push({
          title: theme.title,
          description: theme.description,
          dayOfWeek: theme.dayOfWeek,
          emoji: theme.emoji,
          startDate: themeDate,
          endDate: endDate,
          isActive: isToday,
          isRecurring: true
        });
      }
    }

    // Insert all themes
    await Theme.insertMany(themesToCreate);
    console.log(`✅ Successfully seeded ${themesToCreate.length} weekly themes!`);
    
    // Show active theme
    const activeTheme = themesToCreate.find(t => t.isActive);
    if (activeTheme) {
      console.log(`\n🎯 Today's Active Theme: ${activeTheme.title}`);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error seeding themes:', error);
    process.exit(1);
  }
};

seedWeeklyThemes();
