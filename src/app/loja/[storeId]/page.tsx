// src/app/loja/[storeId]/page.tsx
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, Shield, Loader2, ArrowRight, Sun, Moon } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { SellerAvatar } from "@/components/seller-avatar";
import { useParams, useRouter } from 'next/navigation';
import { Store } from "@/lib/storage"; // Removido Seller e loadState que não são mais usados aqui
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

// Definindo o tipo para Seller, já que não estamos mais importando de storage.ts
// O ideal seria ter um arquivo de tipos compartilhado.
interface Seller {
  id: string;
  name: string;
  avatarId: string;
  // Outras propriedades que a API retornar podem ser adicionadas aqui
}

export default function StoreHomePage() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [store, setStore] = useState<Store | null>(null); // Mantemos o store para o nome e tema
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const storeId = params.storeId as string;

  // Carrega os dados da loja (sem os vendedores) do localStorage
  const loadStoreDetails = useCallback(() => {
    // Esta parte ainda pode ser útil para carregar rapidamente o nome da loja
    // ou outras informações que não mudam com frequência.
    try {
        const state = JSON.parse(localStorage.getItem("goalGetterState_v2") || "{}");
        const foundStore = state.stores?.find((s: Store) => s.id === storeId);
        if(foundStore) {
            setStore(foundStore);
        } else {
             setError(`Loja com ID "${storeId}" não foi encontrada.`);
        }
    } catch (e) {
        console.error("Failed to load store details from localStorage", e);
        setError("Ocorreu um erro ao carregar os detalhes da loja.");
    }
  }, [storeId]);


  useEffect(() => {
    loadStoreDetails(); // Carrega detalhes da loja como nome, tema, etc.
    
    // **AQUI ENTRA O SEU CÓDIGO PARA BUSCAR OS VENDEDORES**
    async function fetchSellers() {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/sellers/${storeId}`);
        if (!response.ok) {
          throw new Error('Falha ao buscar dados dos vendedores');
        }
        const data = await response.json();
        setSellers(data);
      } catch (err: any) { // Usando 'any' para capturar a propriedade message
        setError(err.message);
        toast({
            variant: "destructive",
            title: "Erro de Rede",
            description: err.message,
        });
      } finally {
        setLoading(false);
      }
    }

    if (storeId) {
      fetchSellers();
    }
  // Adicionamos toast e loadStoreDetails às dependências
  }, [storeId, toast, loadStoreDetails]); 
  
  useEffect(() => {
    const body = document.body;
    const isDark = localStorage.getItem('darkMode') === 'true';
    setDarkMode(isDark);
    if(isDark) {
      body.classList.add('dark');
    } else {
      body.classList.remove('dark');
    }
  }, [])
  
  useEffect(() => {
    const body = document.body;
    if(darkMode) {
      body.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      body.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [darkMode])


  const handleAdminAccess = () => {
    const isAdmin = sessionStorage.getItem('adminAuthenticated') === 'true';
    const destination = `/dashboard/${storeId}?tab=admin`;
    if (isAdmin) {
      router.push(destination);
    } else {
      router.push(`/login?redirect=${encodeURIComponent(destination)}`);
    }
  };

  const handleSellerAccess = (sellerId: string) => {
    const isSellerAuthenticated = sessionStorage.getItem(`sellerAuthenticated-${sellerId}`) === 'true';
    const destination = `/dashboard/${storeId}?tab=${sellerId}`;

    if (isSellerAuthenticated) {
      router.push(destination);
    } else {
      router.push(`/login/vendedor?storeId=${storeId}&sellerId=${sellerId}&redirect=${encodeURIComponent(destination)}`);
    }
  };

  if (loading) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background">
            <Loader2 className="mr-2 h-16 w-16 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Carregando dados da loja...</p>
        </div>
    )
  }
  
  if (error) {
     return (
        <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-8">
             <h1 className="text-3xl font-bold text-destructive mb-4">Erro ao Carregar Loja</h1>
             <p className="text-xl text-destructive text-center mb-8">{error}</p>
             <Button asChild variant="secondary">
                <Link href="/">
                <Home className="h-5 w-5 mr-2" />
                Voltar para Todas as Lojas
                </Link>
            </Button>
        </main>
     )
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen flex flex-col items-center px-4 py-8 transition-colors duration-300">
      <div className="w-full max-w-2xl flex justify-between items-center mb-8">
        <h1 
            className="text-3xl font-bold text-primary dark:text-gray-100"
        >
          {store?.name || "Carregando..."}
        </h1>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setDarkMode(!darkMode)}
            className="rounded-full"
          >
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          <Button asChild variant="secondary" className="flex items-center gap-2 shadow">
            <Link href="/">
                <Home className="h-5 w-5" />
                Todas as Lojas
            </Link>
          </Button>
        </div>
      </div>

      <p className="text-gray-600 dark:text-gray-300 text-center mb-6 text-lg">
        Selecione seu usuário para começar.
      </p>

      <Card className="w-full max-w-md shadow-2xl rounded-2xl dark:bg-gray-800">
        <CardContent className="p-6 space-y-5">
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-100">Acessar Painel</h2>

          <motion.div
            whileHover={{ scale: 1.03 }}
            onClick={handleAdminAccess}
            style={{ backgroundColor: 'hsl(var(--primary))' }}
            className="text-white flex items-center justify-between px-4 py-4 rounded-xl shadow cursor-pointer transition"
          >
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6" />
              <div>
                <p className="text-lg font-semibold">Administrador</p>
                <p className="text-sm opacity-80">Ver painel de controle</p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5" />
          </motion.div>

          <div className="space-y-3">
            {sellers.map((seller) => (
              <motion.div
                key={seller.id}
                onClick={() => handleSellerAccess(seller.id)}
                whileHover={{ scale: 1.02 }}
                className="flex items-center justify-between p-4 rounded-xl shadow-sm border hover:shadow-lg transition cursor-pointer dark:bg-gray-700 bg-white"
              >
                <div className="flex items-center gap-3">
                    <SellerAvatar avatarId={seller.avatarId} className="h-11 w-11" />
                  <div>
                    <p className="text-base font-semibold text-gray-800 dark:text-gray-100">
                      {seller.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-300">
                      Ver meu desempenho
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400" />
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}