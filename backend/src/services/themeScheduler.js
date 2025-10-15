import cron from 'node-cron';
import Theme from '../models/Theme.js';

/**
 * Updates active themes based on current date
 * Runs every day at midnight
 */
export const startThemeScheduler = () => {
  // Run every day at 00:00 (midnight)
  cron.schedule('0 0 * * *', async () => {
    try {
      console.log('🔄 Running daily theme update...');
      await updateActiveTheme();
    } catch (error) {
      console.error('❌ Error updating themes:', error);
    }
  });

  // Also run immediately on server start
  updateActiveTheme();
  
  console.log('✅ Theme scheduler started - themes will update daily at midnight');
};

/**
 * Updates the active theme based on current date
 */
export const updateActiveTheme = async () => {
  try {
    const now = new Date();
    
    // Deactivate all themes first
    await Theme.updateMany({}, { isActive: false });

    // Find and activate today's theme
    const todayTheme = await Theme.findOne({
      startDate: { $lte: now },
      endDate: { $gte: now },
    });

    if (todayTheme) {
      todayTheme.isActive = true;
      await todayTheme.save();
      console.log(`✅ Activated theme: ${todayTheme.title}`);
    } else {
      console.log('⚠️ No theme found for today');
    }

    // Check if we need to create new themes for next week
    await checkAndCreateFutureThemes();
  } catch (error) {
    console.error('Error updating active theme:', error);
    throw error;
  }
};

/**
 * Checks if we need to create themes for upcoming weeks
 * Creates themes for the next 4 weeks if needed
 */
const checkAndCreateFutureThemes = async () => {
  try {
    const now = new Date();
    const fourWeeksFromNow = new Date(now);
    fourWeeksFromNow.setDate(now.getDate() + 28);

    // Check if we have themes for the next 4 weeks
    const futureThemesCount = await Theme.countDocuments({
      startDate: { $gte: now, $lte: fourWeeksFromNow }
    });

    // If we have less than 28 themes (7 days * 4 weeks), create more
    if (futureThemesCount < 28) {
      console.log('📅 Creating themes for upcoming weeks...');
      
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

      const currentDay = now.getDay();
      const themesToCreate = [];

      // Create themes for next 4 weeks
      for (let week = 0; week < 4; week++) {
        for (const theme of weeklyThemes) {
          const daysUntilTheme = (theme.dayOfWeek - currentDay + 7) % 7;
          const themeDate = new Date(now);
          themeDate.setDate(now.getDate() + daysUntilTheme + (week * 7));
          themeDate.setHours(0, 0, 0, 0);

          const endDate = new Date(themeDate);
          endDate.setHours(23, 59, 59, 999);

          // Only create if this date doesn't already have a theme
          const existingTheme = await Theme.findOne({
            startDate: themeDate,
            dayOfWeek: theme.dayOfWeek
          });

          if (!existingTheme) {
            themesToCreate.push({
              title: theme.title,
              description: theme.description,
              dayOfWeek: theme.dayOfWeek,
              emoji: theme.emoji,
              startDate: themeDate,
              endDate: endDate,
              isActive: false,
              isRecurring: true
            });
          }
        }
      }

      if (themesToCreate.length > 0) {
        await Theme.insertMany(themesToCreate);
        console.log(`✅ Created ${themesToCreate.length} new themes for upcoming weeks`);
      }
    }
  } catch (error) {
    console.error('Error creating future themes:', error);
  }
};
