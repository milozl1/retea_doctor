import { requireAuth } from "@/lib/auth";
import { getNetworkUser } from "@/db/queries";
import { redirect } from "next/navigation";
import { SettingsForm } from "@/components/settings/settings-form";

export default async function SettingsPage() {
  const { userId } = await requireAuth();
  const user = await getNetworkUser(userId);

  if (!user) {
    redirect("/");
  }

  return (
    <div className="space-y-4">
      <div className="glass-card p-6">
        <h1 className="text-xl font-bold text-white mb-1">
          ⚙️ Setări profil
        </h1>
        <p className="text-slate-400 text-sm">
          Editează informațiile publice ale profilului tău.
        </p>
      </div>

      <div className="glass-card p-6">
        <SettingsForm
          initialData={{
            userName: user.userName,
            bio: user.bio || "",
            specialization: user.specialization || "",
            experienceLevel: user.experienceLevel,
          }}
        />
      </div>
    </div>
  );
}
