import { CommunityForm } from "@/components/admin/community-form";

export default function AdminCreateCommunityPage() {
  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-xl font-bold text-white">Creează comunitate nouă</h1>
        <div className="glass-card p-6">
          <CommunityForm mode="create" />
        </div>
      </div>
    </div>
  );
}
