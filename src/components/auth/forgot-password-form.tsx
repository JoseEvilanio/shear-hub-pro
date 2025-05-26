
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { KeyRound } from "lucide-react";
import { supabase } from "@/integrations/supabase/client"; // Import supabase

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Email inválido" }),
});

export function ForgotPasswordForm() {
  const navigate = useNavigate(); // Keep navigate if needed for other purposes, but not for success path here
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const handleSubmit = async (values: z.infer<typeof forgotPasswordSchema>) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(values.email, {
        redirectTo: `${window.location.origin}/update-password`,
      });

      if (error) {
        toast.error(error.message || "Erro ao enviar email de recuperação.");
        console.error("Error sending password reset email:", error);
      } else {
        toast.success("Email de recuperação enviado! Verifique sua caixa de entrada.");
        // Do not navigate immediately, user needs to check email.
        // Optionally, you could clear the form or redirect after a delay,
        // but typically user stays on page or is informed to check email.
        form.reset(); // Clear the form on success
      }
    } catch (error: any) {
      toast.error("Ocorreu um erro inesperado.");
      console.error("Unexpected error in handleSubmit:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6 p-6 bg-card rounded-lg shadow-lg">
      <div className="flex flex-col items-center space-y-2 mb-6">
        <div className="p-3 rounded-full bg-primary/10">
          <KeyRound className="h-6 w-6 text-barber-gold" />
        </div>
        <h2 className="text-2xl font-semibold">Esqueceu sua senha?</h2>
        <p className="text-center text-muted-foreground">
          Digite seu email e enviaremos instruções para redefinir sua senha.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="seu@email.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full bg-barber-gold hover:bg-barber-gold/80" disabled={isLoading}>
            {isLoading ? "Enviando..." : "Enviar instruções"}
          </Button>
          <div className="text-center mt-4">
            <Link to="/login" className="text-barber-gold hover:underline text-sm">
              Voltar para o login
            </Link>
          </div>
        </form>
      </Form>
    </div>
  );
}
