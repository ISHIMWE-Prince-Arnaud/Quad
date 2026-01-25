# Quad Frontend User Guide

This document explains how end-users interact with Quad’s main features:

- Onboarding and first-time setup
- Using core features (posts, chat, stories, polls, notifications, search, analytics)
- Frequently asked questions & troubleshooting
- Accessibility and keyboard usage

---

## 1. Onboarding Walkthrough

### 1.1 Sign Up / Log In

1. Open the Quad web app.
2. From the landing page:
   - Choose **Sign Up** to create a new account, or
   - Choose **Log In** if you already have one.
3. Complete the authentication flow (email and/or provider sign-in, managed by Clerk).
4. After successful auth, you’ll be redirected into the app (`/app/feed`).

### 1.2 Setting Up Your Profile

1. Go to your **Profile** from the sidebar (Profile item under the main nav).
2. Use the **Edit profile** action to:
   - Upload a profile image and optional cover image.
   - Add a short bio.
   - Update your display name and other details.
3. Save your changes – your profile will be visible across posts, stories, polls, and chat.

### 1.3 Understanding the Main Layout

Once logged in, you’ll see three main areas:

- **Top Navbar**
  - Theme selector (Light / Dark / System).
  - Notifications bell with unread badge.
  - Access to account/user menu.

- **Left Sidebar**
  - Main navigation: Feed, Notifications, Messages, Stories, Polls, Analytics, Settings, Profile.

- **Right Panel**
  - Suggested users, trending content, and other contextual widgets.

---

## 2. Feature Usage Guides

### 2.1 Feed & Posts

- **Viewing the feed**
  - The **Feed** page (`/app/feed`) shows posts from users you follow and relevant content.
  - Cards show the author, text/media, and basic stats (reactions, comments).

- **Creating a post**
  1. Click the **Create** entry (or use quick-create UI if present in the feed).
  2. Choose **Post**.
  3. Write your text, optionally attach media.
  4. Publish to have it appear in your feed and your profile.

- **Interacting with posts**
  - React to posts using the reaction controls.
  - Open the comments section to read or add comments.
  - Click through to a post’s detail page for a focused view.

### 2.2 Stories

- **Viewing stories**
  - Navigate to **Stories** from the sidebar.
  - Browse through cards representing different stories.
  - Click a story to open its full view; you can see images and text, plus view counts.

- **Creating stories**
  1. Go to **Create → Story** or a story-specific create button.
  2. Add text and optional media.
  3. Publish to make it visible on the Stories page and your profile.

### 2.3 Polls

- **Viewing polls**
  - Open **Polls** from the sidebar.
  - Each poll card shows the question and high-level voting information.

- **Voting**
  - Open a poll, choose an option, and submit your vote.
  - After voting, aggregated results update in real time or on refresh.

- **Creating polls**
  1. Go to **Create → Poll**.
  2. Enter your question and add answer options.
  3. Publish to make the poll available to your followers and in your profile.

### 2.4 Chat (Messages)

- **Accessing chat**
  - Click **Messages** in the sidebar or visit `/app/chat`.

- **Using chat**
  - Select or start a conversation.
  - Send and receive messages in real time (powered by sockets).
  - Navigate directly to a conversation by URL (`/app/chat/:conversationId`).

### 2.5 Notifications

- **Notifications bell**
  - The bell icon in the navbar shows your **unread count**.
  - A red badge indicates new notifications.

- **Notifications page**
  - Visit **Notifications** from the sidebar.
  - See a timeline of activities (reactions, comments, follows, chat messages, etc.).
  - Use filters (e.g., show all vs. unread).
  - Click a notification to open the related post, story, poll, chat, or profile.
  - Mark single notifications as read or clear read ones using available actions.

### 2.6 Analytics

- **Accessing analytics**
  - Open **Analytics** from the sidebar.

- **What you see**
  - Overview of your content volume:
    - Number of posts, stories, and polls.
    - Total reactions/comments on posts.
    - Total views on stories.
    - Total votes on polls.
  - Simple timeline of posting activity over recent months.
  - Top-performing posts and polls by engagement.

---

## 3. FAQs & Troubleshooting

### 3.1 Authentication Issues

**Q: I can’t log in or sign up.**

- Check your internet connection.
- Ensure you’re using the correct email/credentials.
- If using a third-party provider, verify that the provider account is active.
- If problems persist, try logging out of all sessions and clearing browser cookies for the site, then retry.

**Q: My profile data seems out of date.**

- Try refreshing the page.
- Re-open the **Profile** page; some profile data is fetched on demand.
- If the issue persists, log out and log back in.

### 3.2 Media Upload Problems

**Q: Image or video uploads fail.**

- Confirm your file size and type meet any indicated limits.
- Try uploading a smaller file.
- Check your connection stability.
- If you repeatedly see errors, it may be a temporary backend or storage issue—try again later.

### 3.3 Notifications Not Appearing

**Q: I don’t see notifications for new activity.**

- Ensure you are logged in and the app is open.
- Confirm your connection; real-time updates rely on a socket connection.
- Refresh the page to trigger a full sync from the server.
- Visit the **Notifications** page to see if items appear but are already marked as read.

### 3.4 Chat Messages Not Updating

**Q: My chat messages don’t appear in real time.**

- Check that you’re on the **Messages** page (`/app/chat`).
- Ensure your internet connection is stable.
- Refresh the page; this forces a re-connection to the chat socket.

---

## 4. Accessibility & Keyboard Usage

### 4.1 General Accessibility Principles

Quad’s frontend aims to follow common accessibility best practices:

- **Semantic HTML** for core layout and content where possible.
- **Visible focus states** so you can see which element is active while tabbing.
- **ARIA attributes** where appropriate (for example, the active sidebar item uses `aria-current="page"` so screen readers announce the current section).
- **Color contrast** tuned to be readable in both light and dark modes.

### 4.2 Keyboard Navigation

- Use **Tab** / **Shift+Tab** to move forward/backward through interactive elements (links, buttons, form fields).
- Use **Enter** or **Space** to activate buttons and links when focused.
- Use **Arrow keys** inside some components (e.g., menus, dropdowns) as supported by the component library.

> If you notice any area that is difficult to reach or operate via keyboard alone, treat that as a bug and report it.

### 4.3 Themes and Reduced Motion

- **Themes**: You can switch between **Light**, **Dark**, and **System** themes via the theme selector in the navbar or sidebar.
  - **System** follows your operating system’s theme preference.
- **Motion**:
  - Subtle animations (page transitions, card hover/tap effects) are used to enhance clarity.
  - If you rely on reduced motion settings, ensure your OS/browser preferences are configured; the app aims to respect standard platform behavior when possible.

---

## 5. Getting Help

If you encounter persistent issues:

- Try refreshing the page or logging out and back in.
- Check your network connection.
- If problems continue, capture screenshots and steps to reproduce so developers can debug using the technical docs (API mappings, services, and state stores).
