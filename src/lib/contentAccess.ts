export const contentPermissions = ["recruitment", "articles", "events", "team", "programs", "screening"] as const;

export type ContentPermission = (typeof contentPermissions)[number];

export const contentPermissionLabels: Record<ContentPermission, string> = {
  recruitment: "Recruitment Page & Status",
  articles: "Articles",
  events: "Events",
  team: "Team",
  programs: "Programs",
  screening: "Screening Dashboard",
};
