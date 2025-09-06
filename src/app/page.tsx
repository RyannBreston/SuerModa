// src/app/page.tsx
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Store as StoreIcon, Lock, Loader2, FolderOpen } from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

// O tipo Store pode ser movido para um arquivo de tipos compartilhado
interface Store {
  id: string;
  name: string;
  theme_color: string;
}

export default function Home() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStores() {
      try {
        const response = await fetch('/api/stores');
        if (!response.ok) {
          throw new Error('Não foi possível carregar as lojas');
        }
        const data = await response.json();
        setStores(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchStores();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-background p-6">
      <motion.div 
        className="flex flex-col items-center gap-8 max-w-4xl w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-extrabold text-foreground drop-shadow-sm">
            Seja bem-vindo(a) ao
             <span className="text-primary"> Acelera GT 🚀</span>
          </h1>
        </div>

        <motion.div
          className="w-full max-w-lg bg-card p-8 rounded-2xl shadow-lg mt-4 border"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <h2 className="text-center text-xl font-semibold text-card-foreground mb-6">
            Selecione sua loja para começar. 
          </h2>

          {!stores || stores.length === 0 ? (
            <div className="flex flex-col items-center text-center text-muted-foreground py-6">
              <FolderOpen className="h-12 w-12 mb-4" />
              <p className="font-medium text-lg">Nenhuma loja encontrada</p>
              <p className="text-sm mt-1 max-w-xs">
                O administrador precisa adicionar uma loja no painel global para começar.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {stores.map((store) => (
                <Button
                  asChild
                  size="lg"
                  key={store.id}
                  variant="default"
                  className="justify-start h-auto py-4 px-5 rounded-xl transition-all 
                            hover:bg-primary/90
                            shadow-sm hover:shadow-lg hover:-translate-y-1 group"
                >
                  <Link href={`/loja/${store.id}`} className="flex items-center gap-4 w-full">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-background/20">
                      <StoreIcon className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <span className="font-semibold text-base flex-grow text-left text-primary-foreground">
                      {store.name}
                    </span>
                    <ArrowRight className="ml-auto h-5 w-5 text-primary-foreground/70 group-hover:text-primary-foreground transition-colors" />
                  </Link>
                </Button>
              ))}
            </div>
          )}
        </motion.div>

        <div className="text-center mt-6">
          <Button
            variant="ghost"
            asChild
            className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
          >
            <Link href="/login?redirect=/admin">
              <Lock className="h-4 w-4" />
              Acesso Restrito de Administrador
            </Link>
          </Button>
        </div>
      </motion.div>
       <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-full text-center text-xs text-muted-foreground space-y-1">
        <p>build tete 0.0.1 version</p>
        <p>RyannBreston desenvolvedor</p>
        <p>&copy; {new Date().getFullYear()} Acelera GT. Todos os direitos reservados.</p>
      </div>
    </main>
  );
}