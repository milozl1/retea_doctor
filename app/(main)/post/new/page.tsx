import { requireAuth } from "@/lib/auth";
import { PostForm } from "@/components/post/post-form";

export const metadata = {
  title: "Postare nouă — MedRețea",
};

export default async function NewPostPage() {
  await requireAuth();
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">Creează o postare</h1>
      <PostForm />
    </div>
  );
}
