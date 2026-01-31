import type { ProfileTab } from "@/components/profile/ProfileTabs";
import type { ContentItem } from "@/components/profile/ProfileContentGrid";

export function filterProfileContent(
  content: ContentItem[],
  activeTab: ProfileTab,
) {
  return content.filter((item) => {
    switch (activeTab) {
      case "posts":
        return item.type === "post";
      case "stories":
        return item.type === "story";
      case "polls":
        return item.type === "poll";
      case "saved":
        return true;
      default:
        return false;
    }
  });
}
