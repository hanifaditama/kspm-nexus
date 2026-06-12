export const contentPermissions = ["recruitment", "articles", "events", "team", "programs"] as const;

export type ContentPermission = (typeof contentPermissions)[number];

export const contentPermissionLabels: Record<ContentPermission, string> = {
  recruitment: "Recruitment Status",
  articles: "Articles",
  events: "Events",
  team: "Team",
  programs: "Programs",
};
