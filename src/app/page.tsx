"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Store as StoreIcon, Lock, Loader2, FolderOpen } from "lucide-react";
import { useEffect, useState } from "react";
import { AppState, loadState } from "@/lib/storage";
import { motion } from "framer-motion";
import Image from "next/image";

export default function Home() {
  const [state, setState] = useState<AppState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadedState = loadState();
    setState(loadedState);
    setLoading(false);
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
        
        

        {/* Título */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-extrabold text-foreground drop-shadow-sm">
            Seja bem-vindo (a) ao
             Acelera GT 🚀
          </h1>
        </div>

        {/* Card */}
        <motion.div
          className="w-full max-w-lg bg-card p-8 rounded-3xl shadow-xl border mt-4"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <h2 className="text-center text-xl font-semibold text-card-foreground mb-6">
            Selecione sua loja para começar. 
          </h2>

          {!state || state.stores.length === 0 ? (
            <div className="flex flex-col items-center text-muted-foreground py-6 text-center">
              <FolderOpen className="h-12 w-12 mb-4" />
              <p className="font-medium text-lg">Nenhuma loja encontrada</p>
              <p className="text-sm mt-1 max-w-xs">
                O administrador precisa adicionar uma loja no painel global para começar.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {state.stores.map((store) => (
                <Button
                  asChild
                  size="lg"
                  key={store.id}
                  className="justify-start h-auto py-4 px-5 rounded-xl border
                            bg-primary text-primary-foreground
                            hover:bg-primary/90 transition-all 
                            shadow-sm hover:shadow-lg hover:-translate-y-1 group"
                >
                  <Link href={`/loja/${store.id}`} className="flex items-center gap-4 w-full">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-white/20">
                      <StoreIcon className="h-5 w-5 text-white" />
                    </div>
                    <span className="font-semibold text-base flex-grow text-left">
                      {store.name}
                    </span>
                    <ArrowRight className="ml-auto h-5 w-5 text-white/70 group-hover:text-white transition-colors" />
                  </Link>
                </Button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Admin */}
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
    </main>
  );
}
