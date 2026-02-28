import { currentUser } from "@/lib/auth";
import { Header } from "./header";

export async function HeaderServer() {
  const user = await currentUser();
  return <Header user={user} />;
}
