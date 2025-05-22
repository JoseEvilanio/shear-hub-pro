import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PersonalDataForm } from "./PersonalDataForm";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function ClientProfile() {
  const [userData, setUserData] = useState<any>({});
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          toast.error("Você precisa estar logado para acessar esta área");
          return;
        }
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("first_name, last_name, email, avatar, phone, birthDate, gender, bio")
          .eq("id", session.user.id)
          .single();
        if (error) {
          toast.error("Erro ao buscar perfil: " + error.message);
        } else if (profile) {
          setUserData({
            name: `${profile.first_name || ""} ${profile.last_name || ""}`.trim(),
            email: profile.email || session.user.email,
            avatar: profile.avatar || "",
            phone: profile.phone || "",
            birthDate: profile.birthDate || "",
            gender: profile.gender || "",
            bio: profile.bio || ""
          });
        }
      } catch (err: any) {
        toast.error("Erro ao carregar perfil");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Carregando...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Meu Perfil</h2>
        <Button variant="outline" onClick={() => setIsEditing((v) => !v)}>
          {isEditing ? "Cancelar" : "Editar"}
        </Button>
      </div>
      <PersonalDataForm userData={userData} setUserData={setUserData} isEditing={isEditing} />
    </div>
  );
}