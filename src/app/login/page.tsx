// src/app/login/page.tsx
"use client";

import { useState, Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, KeyRound, Loader2 } from 'lucide-react';
import Link from 'next/link';
// A importação de 'getAdminPassword' foi removida

function LoginComponent() {
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const redirectUrl = searchParams.get('redirect') || '/admin';

  useEffect(() => {
    const adminAuthenticated = sessionStorage.getItem('adminAuthenticated') === 'true';
    if (adminAuthenticated) {
      router.push(redirectUrl);
    } else {
      setLoading(false);
    }
  }, [router, redirectUrl]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/auth/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        sessionStorage.setItem('adminAuthenticated', 'true');
        toast({
          title: 'Acesso concedido!',
          description: 'Bem-vindo, administrador.',
        });
        router.push(redirectUrl);
      } else {
        throw new Error('Senha incorreta');
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Senha incorreta',
        description: 'Por favor, tente novamente.',
      });
      setIsSubmitting(false);
    }
  };

  if (loading) {
     return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <Loader2 className="mr-2 h-16 w-16 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Verificando acesso...</p>
        </div>
    )
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-background p-8 relative">
       <div className="absolute top-4 left-4">
            <Button asChild variant="outline">
                <Link href="/">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Página Inicial
                </Link>
            </Button>
        </div>
      <div className="flex flex-col items-center gap-6 w-full max-w-sm">
        <Card className="w-full">
          <CardHeader className="text-center">
            <CardTitle>Acesso Restrito</CardTitle>
            <CardDescription>
                Por favor, insira a senha de administrador para continuar.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
               <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="********"
                    required
                  />
                </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Verificando...' : 'Entrar'}
                <KeyRound className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="flex flex-col items-center justify-center min-h-screen">
                <Loader2 className="mr-2 h-16 w-16 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">Carregando...</p>
            </div>
        }>
            <LoginComponent />
        </Suspense>
    )
}