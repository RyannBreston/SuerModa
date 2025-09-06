"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, Shield, Loader2, ArrowRight, Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";
import { SellerAvatar } from "@/components/seller-avatar";
import { useParams, useRouter } from 'next/navigation';
import { Seller, Store } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function StoreHomePage() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const storeId = params.storeId as string;

  useEffect(() => {
    async function fetchData() {
      if (!storeId) {
        setError("ID da loja não especificado na URL.");
        setLoading(false);
        return;
      };

      try {
        // Busca os dados da loja e dos vendedores em paralelo
        const [storesRes, sellersRes] = await Promise.all([
          fetch('/api/stores'),
          fetch(`/api/sellers/${storeId}`)
        ]);

        if (!storesRes.ok || !sellersRes.ok) {
          throw new Error('Falha ao buscar dados da loja ou dos vendedores.');
        }

        const storesData: Store[] = await storesRes.json();
        const sellersData: Seller[] = await sellersRes.json();
        
        const foundStore = storesData.find(s => s.id === storeId);
        
        if (foundStore) {
          setStore(foundStore);
          setSellers(sellersData);
        } else {
          throw new Error(`Loja com ID "${storeId}" não foi encontrada.`);
        }
      } catch (e: any) {
        setError(e.message);
        toast({
          variant: "destructive",
          title: "Erro ao carregar",
          description: e.message,
        });
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [storeId, toast]);
  
  // Efeito para gerenciar o tema escuro
  useEffect(() => {
    const isDark = localStorage.getItem('darkMode') === 'true';
    setDarkMode(isDark);
    document.body.classList.toggle('dark', isDark);
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', String(newDarkMode));
    document.body.classList.toggle('dark', newDarkMode);
  };

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
    const destination = `/dashboard/${storeId}?tab=${sellerId}`;
    router.push(`/login/vendedor?storeId=${storeId}&sellerId=${sellerId}&redirect=${encodeURIComponent(destination)}`);
  };

  if (loading) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background">
            <Loader2 className="mr-2 h-16 w-16 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Carregando dados da loja...</p>
        </div>
    );
  }
  
  if (error) {
     return (
        <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-8">
             <h1 className="text-3xl font-bold text-destructive mb-4">Erro ao Carregar Loja</h1>
             <p className="text-xl text-destructive text-center mb-8">{error}</p>
             <Button asChild variant="secondary">
                <Link href="/"><Home className="h-5 w-5 mr-2" />Voltar para Todas as Lojas</Link>
            </Button>
        </main>
     );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen flex flex-col items-center px-4 py-8 transition-colors duration-300">
      <div className="w-full max-w-2xl flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-primary dark:text-gray-100">{store?.name}</h1>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={toggleDarkMode} className="rounded-full">
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          <Button asChild variant="secondary" className="flex items-center gap-2 shadow">
            <Link href="/"><Home className="h-5 w-5" />Todas as Lojas</Link>
          </Button>
        </div>
      </div>
      <p className="text-gray-600 dark:text-gray-300 text-center mb-6 text-lg">Selecione seu usuário para começar.</p>
      <Card className="w-full max-w-md shadow-2xl rounded-2xl dark:bg-gray-800">
        <CardContent className="p-6 space-y-5">
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-100">Acessar Painel</h2>
          <motion.div whileHover={{ scale: 1.03 }} onClick={handleAdminAccess} style={{ backgroundColor: 'hsl(var(--primary))' }} className="text-white flex items-center justify-between px-4 py-4 rounded-xl shadow cursor-pointer transition">
            <div className="flex items-center gap-3"><Shield className="h-6 w-6" /><div><p className="text-lg font-semibold">Administrador</p><p className="text-sm opacity-80">Ver painel de controle</p></div></div>
            <ArrowRight className="h-5 w-5" />
          </motion.div>
          <div className="space-y-3">
            {sellers.map((seller) => (
              <motion.div key={seller.id} onClick={() => handleSellerAccess(seller.id)} whileHover={{ scale: 1.02 }} className="flex items-center justify-between p-4 rounded-xl shadow-sm border hover:shadow-lg transition cursor-pointer dark:bg-gray-700 bg-white">
                <div className="flex items-center gap-3">
                    <SellerAvatar avatarId={seller.avatarId} className="h-11 w-11" />
                  <div>
                    <p className="text-base font-semibold text-gray-800 dark:text-gray-100">{seller.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-300">Ver meu desempenho</p>
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
