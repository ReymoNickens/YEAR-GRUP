/** Real titles for the role keys, as members would say them (brief: real titles visible on admins). */
const TITLES: Record<string, string> = {
  organisation_admin: "Administrator",
  executive: "Executive",
  treasurer: "Treasurer",
  secretary: "Secretary",
  organiser: "Organiser",
  house_captain: "House captain",
  dorm_prefect: "Dorm prefect",
  cot_leader: "Cot leader",
  class_representative: "Class rep",
};

export function roleTitle(role: string): string {
  return TITLES[role] ?? role.replaceAll("_", " ").replace(/^\w/, (c) => c.toUpperCase());
}
