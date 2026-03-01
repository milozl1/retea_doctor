import { getCommunities } from "@/db/queries";
import { Sidebar } from "./sidebar";

export async function SidebarServer() {
  const allCommunities = await getCommunities();

  const communities = allCommunities.map((c) => ({
    slug: c.slug,
    name: c.name,
    color: c.color,
    iconEmoji: c.iconSrc || "📁",
  }));

  return <Sidebar communities={communities} />;
}
