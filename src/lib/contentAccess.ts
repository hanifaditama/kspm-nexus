export const contentPermissions = ["recruitment", "articles", "events", "team", "programs", "calendar"] as const;

export type ContentPermission = (typeof contentPermissions)[number];

export const contentPermissionLabels: Record<ContentPermission, string> = {
  recruitment: "Recruitment Page & Status",
  articles: "Articles",
  events: "Events",
  team: "Team",
  programs: "Programs",
  calendar: "Member Calendar",
};
