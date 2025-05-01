
import { LoginForm } from "@/components/auth/login-form";
import { ThemeToggle } from "@/components/theme-toggle";

const Login = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-6 items-center">
        <div className="hidden md:flex flex-col space-y-4">
          <h1 className="text-5xl font-bold tracking-tight text-barber-gold">
            ShearHub
          </h1>
          <p className="text-2xl text-foreground">
            Gerencie sua barbearia com facilidade e profissionalismo
          </p>
          <ul className="space-y-2 mt-6">
            <li className="flex items-center space-x-2">
              <div className="h-1.5 w-1.5 rounded-full bg-barber-gold"></div>
              <span>Agendamentos integrados</span>
            </li>
            <li className="flex items-center space-x-2">
              <div className="h-1.5 w-1.5 rounded-full bg-barber-gold"></div>
              <span>Controle de clientes e fidelização</span>
            </li>
            <li className="flex items-center space-x-2">
              <div className="h-1.5 w-1.5 rounded-full bg-barber-gold"></div>
              <span>Pagamentos simplificados</span>
            </li>
            <li className="flex items-center space-x-2">
              <div className="h-1.5 w-1.5 rounded-full bg-barber-gold"></div>
              <span>Relatórios e análises</span>
            </li>
          </ul>
        </div>
        
        <LoginForm />
      </div>
    </div>
  );
};

export default Login;
