import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PersonalDataForm } from "./PersonalDataForm";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function ClientProfile() {
  const [userData, setUserData] = useState<any>({});
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Você precisa estar logado para salvar o perfil");
        return;
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          name: userData.name,
          telefone: userData.phone.replace(/[^\d]/g, ''),
          data: formatDateForSupabase(userData.birthDate),
          genero: userData.gender,
          biografia: userData.bio,
          updated_at: new Date().toISOString(),
        })
        .eq("id", session.user.id);

      if (error) {
        toast.error("Erro ao salvar perfil: " + error.message);
      } else {
        toast.success("Perfil salvo com sucesso!");
        setIsEditing(false);
      }
    } catch (err: any) {
      toast.error("Erro ao salvar perfil");
    } finally {
      setIsLoading(false);
    }
  };

  const handleButtonClick = () => {
    if (isEditing) {
      handleSave();
    } else {
      setIsEditing(true);
    }
  };

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
          .select("name, email, telefone, data, genero, biografia")
          .eq("id", session.user.id)
          .single();
        if (error) {
          toast.error("Erro ao buscar perfil: " + error.message);
        } else if (profile) {
          console.log("Profile data:", profile);
          setUserData({
            name: profile.name || "",
            email: profile.email || session.user.email,
            phone: formatPhoneNumberDisplay(profile.telefone) || "",
            birthDate: formatDateFromSupabase(profile.data) || "",
            gender: profile.genero || "",
            bio: profile.biografia || ""
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
        <Button variant="outline" onClick={handleButtonClick}>
          {isEditing ? "Salvar" : "Editar"}
        </Button>
      </div>
      <PersonalDataForm userData={userData} setUserData={setUserData} isEditing={isEditing} />
    </div>
  );
}

const formatDateForSupabase = (dateString: string) => {
  if (!dateString) return null;
  const [day, month, year] = dateString.split('/');
  if (!day || !month || !year) return null;
  return `${year}-${month}-${day}`;
};

const formatDateFromSupabase = (dateString: string) => {
  if (!dateString) return null;
  const [year, month, day] = dateString.split('-');
  if (!year || !month || !day) return null;
  return `${day}/${month}/${year}`;
};

const formatPhoneNumberDisplay = (phoneNumber: string) => {
  if (!phoneNumber) return "";
  const cleaned = ('' + phoneNumber).replace(/\D/g, '');
  const match = cleaned.match(/^(\d{2})(\d{5})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  return phoneNumber;
};