import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PersonalDataForm } from "./PersonalDataForm";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface UserData {
  name: string;
  email: string;
  phone: string;
  birthDate: string;
  gender: string;
  bio: string;
  avatar: string;
  data?: {
    birthDate?: string;
    avatar?: string;
    [key: string]: any;
  };
}

interface Profile {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  data: {
    birthDate?: string;
    avatar?: string;
    [key: string]: any;
  };
  genero: string;
  biografia: string;
}

const formatDateForSupabase = (date: string): string => {
  if (!date) return '';
  const [day, month, year] = date.split('/');
  return `${year}-${month}-${day}`;
};

const formatPhoneNumberForSupabase = (phone: string): string => {
  return phone.replace(/\D/g, '');
};

export default function ClientProfile() {
  const [userData, setUserData] = useState<UserData>({
    name: '',
    email: '',
    phone: '',
    birthDate: '',
    gender: '',
    bio: '',
    avatar: '',
    data: {}
  });
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

      // Preparar os dados para atualização
      const updateData = {
        first_name: userData.name.split(' ')[0] || '',
        last_name: userData.name.split(' ').slice(1).join(' ') || '',
        phone: userData.phone.replace(/\D/g, ''),
        data: {
          ...userData.data,
          birthDate: userData.birthDate
        },
        genero: userData.gender,
        biografia: userData.bio,
        updated_at: new Date().toISOString()
      };

      console.log('Dados para atualização:', updateData);

      const { error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", session.user.id);

      if (error) {
        console.error('Erro ao atualizar perfil:', error);
        toast.error("Erro ao salvar perfil: " + error.message);
      } else {
        toast.success("Perfil salvo com sucesso!");
        setIsEditing(false);
      }
    } catch (err: any) {
      console.error('Erro ao salvar perfil:', err);
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
          .select("first_name, last_name, email, phone, data, genero, biografia")
          .eq("id", session.user.id)
          .single();
        if (error) {
          toast.error("Erro ao buscar perfil: " + error.message);
        } else if (profile) {
          console.log("Profile data:", profile);
          try {
            const profileData = profile as unknown as Profile;
            setUserData({
              name: `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim(),
              email: profileData.email || session.user.email || '',
              phone: profileData.phone || '',
              birthDate: profileData.data?.birthDate 
                ? profileData.data.birthDate 
                : '',
              gender: profileData.genero || '',
              bio: profileData.biografia || '',
              avatar: profileData.data?.avatar || '',
              data: profileData.data || {}
            });
            console.log('Valor de profileData.data?.birthDate lido do banco:', profileData.data?.birthDate);
            console.log('Valor setado para userData.birthDate:', profileData.data?.birthDate ? profileData.data.birthDate : '');
          } catch (err) {
            console.error("Erro ao processar dados do perfil:", err);
            toast.error("Dados do perfil inválidos");
          }
        }
      } catch (err: any) {
        console.error("Erro ao carregar perfil:", err);
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