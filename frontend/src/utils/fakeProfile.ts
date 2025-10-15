const adjectives = [
  "Happy",
  "Clever",
  "Brave",
  "Wise",
  "Kind",
  "Swift",
  "Bright",
  "Noble",
  "Gentle",
  "Bold",
];

const nouns = [
  "Panda",
  "Eagle",
  "Lion",
  "Dolphin",
  "Wolf",
  "Tiger",
  "Fox",
  "Owl",
  "Bear",
  "Hawk",
];

const colors = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#96CEB4",
  "#FFEEAD",
  "#D4A5A5",
  "#9B89B3",
  "#FF9999",
  "#77DD77",
  "#AEC6CF",
];

export const generateFakeProfile = () => {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const color = colors[Math.floor(Math.random() * colors.length)];

  // Generate initials from the name
  const initials = `${adjective[0]}${noun[0]}`;

  // Create SVG data URL for the avatar
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <rect width="100" height="100" fill="${color}"/>
      <text x="50" y="50" font-family="Arial" font-size="35" fill="white" 
        text-anchor="middle" dominant-baseline="central">${initials}</text>
    </svg>
  `;

  const avatar = `data:image/svg+xml;base64,${btoa(svg)}`;

  return {
    name: `${adjective}${noun}`,
    avatar,
  };
};
