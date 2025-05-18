import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import React from "react";

interface NotificationSettingsProps {
  notifications: any;
  setNotifications: (data: any) => void;
  isEditing: boolean;
}

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({ notifications, setNotifications, isEditing }) => {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">Notificações por E-mail</h3>
            <p className="text-sm text-muted-foreground">Receber comunicações e alertas por e-mail</p>
          </div>
          <Switch
            checked={!!notifications.email}
            onCheckedChange={(checked) => setNotifications({ ...notifications, email: checked })}
            disabled={!isEditing}
            aria-label="Ativar notificações por e-mail"
          />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">Notificações Push</h3>
            <p className="text-sm text-muted-foreground">Notificações em tempo real no seu dispositivo</p>
          </div>
          <Switch
            checked={!!notifications.push}
            onCheckedChange={(checked) => setNotifications({ ...notifications, push: checked })}
            disabled={!isEditing}
            aria-label="Ativar notificações push"
          />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">Notificações por SMS</h3>
            <p className="text-sm text-muted-foreground">Receber alertas por mensagem de texto</p>
          </div>
          <Switch
            checked={!!notifications.sms}
            onCheckedChange={(checked) => setNotifications({ ...notifications, sms: checked })}
            disabled={!isEditing}
            aria-label="Ativar notificações por SMS"
          />
        </div>
      </div>
      <div className="pt-2 border-t">
        <h3 className="font-medium mb-3">Tipos de Comunicação</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Lembretes de Agendamentos</h4>
              <p className="text-sm text-muted-foreground">Notificações sobre agendamentos próximos</p>
            </div>
            <Switch
              checked={!!notifications.reminders}
              onCheckedChange={(checked) => setNotifications({ ...notifications, reminders: checked })}
              disabled={!isEditing}
              aria-label="Ativar lembretes de agendamento"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Promoções e Novidades</h4>
              <p className="text-sm text-muted-foreground">Ofertas especiais e novidades das barbearias</p>
            </div>
            <Switch
              checked={!!notifications.promotions}
              onCheckedChange={(checked) => setNotifications({ ...notifications, promotions: checked })}
              disabled={!isEditing}
              aria-label="Ativar promoções e novidades"
            />
          </div>
        </div>
      </div>
    </div>
  );
}