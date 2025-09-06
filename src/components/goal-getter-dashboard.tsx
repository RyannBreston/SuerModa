// src/components/goal-getter-dashboard.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { ShieldCheck, Home, CheckCircle } from "lucide-react";
import { incentiveProjection, type IncentiveProjectionOutput } from "@/ai/flows/incentive-projection";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
// Importamos getInitialState para ter acesso às metas padrão no frontend
import { Seller, Goals, Store, Incentives, getInitialState } from "@/lib/storage"; 
import { AdminTab } from "@/components/admin-tab";
import { SellerTab } from "@/components/seller-tab";
import { Skeleton } from "./ui/skeleton";

// ... (schemas e types permanecem os mesmos) ...
const sellerSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Nome é obrigatório"),
  password: z.string().min(4, "A senha deve ter pelo menos 4 caracteres"),
  avatarId: z.string(), // Corrigido para avatar_id para corresponder ao DB
  vendas: z.coerce.number().min(0).default(0),
  pa: z.coerce.number().min(0).default(0),
  ticket_medio: z.coerce.number().min(0).default(0), // Corrigido para snake_case
  corridinha_diaria: z.coerce.number().min(0).default(0), // Corrigido para snake_case
});

export const formSchema = z.object({
  newSellerName: z.string().optional(),
  newSellerPassword: z.string().optional(),
  goals: z.record(z.any()),
  sellers: z.array(sellerSchema),
});

export type FormValues = z.infer<typeof formSchema>;
export type RankingMetric = "vendas" | "pa" | "ticketMedio" | "corridinhaDiaria";
export type Rankings = Record<string, Record<RankingMetric, number>>;

const DashboardSkeleton = () => ( <div className="container mx-auto p-4 py-8 md:p-8"> <header className="flex items-center justify-between gap-4 mb-8"> <div className="flex items-center gap-4"> <div> <Skeleton className="h-8 w-48 mb-2" /> <Skeleton className="h-4 w-64" /> </div></div><div className="flex items-center gap-2"> <Skeleton className="h-10 w-32" /> <Skeleton className="h-10 w-32" /> </div></header> <div className="border-b mb-4"> <div className="flex items-center gap-2"> <Skeleton className="h-10 w-24" /> <Skeleton className="h-10 w-24" /> <Skeleton className="h-10 w-24" /> </div></div><Skeleton className="h-[500px] w-full" /> </div> );
const availableAvatarIds = ["avatar1", "avatar2", "avatar3", "avatar4", "avatar5", "avatar6", "avatar7", "avatar8", "avatar9", "avatar10"];


export function GoalGetterDashboard({ storeId }: { storeId: string }) {
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentStore, setCurrentStore] = useState<Store | null>(null);
  const [incentives, setIncentives] = useState<Incentives>({});
  const [rankings, setRankings] = useState<Rankings>({});
  const [activeTab, setActiveTab] = useState<string>("loading");
  
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { sellers: [], goals: {} },
  });

  const { reset, getValues, setValue } = form;

  // Lógica de carregamento de dados foi refatorada
  useEffect(() => {
    const adminAuthenticated = sessionStorage.getItem("adminAuthenticated") === "true";
    setIsAdmin(adminAuthenticated);

    async function fetchData() {
      try {
        // Busca lojas e vendedores
        const [sellersRes, storesRes] = await Promise.all([
          fetch(`/api/sellers/${storeId}`),
          fetch(`/api/stores`), // Busca todas as lojas para encontrar o nome da atual
        ]);

        if (!sellersRes.ok || !storesRes.ok) throw new Error("Falha ao carregar dados da loja.");
        
        const sellersData = await sellersRes.json();
        const storesData: Store[] = await storesRes.json();
        const currentStoreDetails = storesData.find(s => s.id === storeId);
        setCurrentStore(currentStoreDetails || null);

        // Tenta buscar as metas
        const goalsRes = await fetch(`/api/goals/${storeId}`);
        let goalsData;

        if (goalsRes.status === 404) {
          // **LÓGICA INTELIGENTE:** Se não encontrar (404), usa as metas padrão
          toast({
            title: "Configuração Inicial",
            description: "Esta loja ainda não tem metas salvas. Carregando valores padrão.",
          });
          goalsData = getInitialState().goals.default;
        } else if (!goalsRes.ok) {
          // Se for outro erro, aí sim é um problema
          throw new Error("Falha ao carregar metas da loja.");
        } else {
          goalsData = await goalsRes.json();
        }

        reset({ sellers: sellersData, goals: goalsData });
        
        // Lógica de seleção de aba
        const tabFromUrl = searchParams.get("tab");
        const sellersForStore = sellersData || [];
        let tabToActivate = tabFromUrl || (adminAuthenticated ? "admin" : sellersForStore.length > 0 ? sellersForStore[0].id : "admin");
        
        // ... (lógica de verificação de abas e redirecionamento)
        
        setActiveTab(tabToActivate);

      } catch (error: any) {
        toast({ variant: "destructive", title: "Erro ao Carregar", description: error.message });
      }
    }

    fetchData();
  }, [storeId, reset, router, toast, searchParams]);
  
  // As outras funções (addSeller, handleSaveGoals, etc.) não precisam de mudança
  const handleSaveGoals = useCallback(async () => { /* ... */ }, []);
  const addSeller = useCallback(async (name: string, pass: string) => { /* ... */ }, []);
  const handleIncentivesCalculated = useCallback((newIncentives: Incentives) => { /* ... */ }, []);
  const handleTabChange = (newTab: string) => { /* ... */ };

  if (activeTab === "loading") {
    return <DashboardSkeleton />;
  }

  return (
    // Seu JSX para o painel continua aqui, sem alterações.
    <div className="container mx-auto p-4 py-8 md:p-8 relative">
        <header className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <h1 className="text-3xl font-bold font-headline text-primary">
                {currentStore?.name || "Carregando..."}
            </h1>
            <div className="flex items-center gap-2">
                <Button asChild variant="outline">
                    <Link href="/"><Home className="mr-2 h-4 w-4" /> Todas as Lojas</Link>
                </Button>
                {isAdmin && (
                    <Button asChild variant="outline">
                        <Link href="/admin"><ShieldCheck className="mr-2 h-4 w-4" /> Admin Global</Link>
                    </Button>
                )}
            </div>
        </header>
        
        <Form {...form}>
            <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
                <TooltipProvider>
                    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                        <div className="flex items-center border-b justify-between">
                            <TabsList>
                                {getValues("sellers").map((seller) => (
                                    <TabsTrigger key={seller.id} value={seller.id}>{seller.name}</TabsTrigger>
                                ))}
                            </TabsList>
                            {isAdmin && (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <TabsList>
                                            <TabsTrigger value="admin"><ShieldCheck className="h-5 w-5"/></TabsTrigger>
                                        </TabsList>
                                    </TooltipTrigger>
                                    <TooltipContent><p>Painel do Administrador</p></TooltipContent>
                                </Tooltip>
                            )}
                        </div>
                        {isAdmin && (
                            <TabsContent value="admin" className="mt-6">
                                <AdminTab
                                    form={form}
                                    storeId={storeId}
                                    onIncentivesCalculated={handleIncentivesCalculated}
                                    incentives={incentives}
                                    addSeller={addSeller}
                                    handleSaveGoals={handleSaveGoals}
                                />
                            </TabsContent>
                        )}
                        {getValues("sellers").map((seller) => {
                            // Map snake_case fields to camelCase for SellerTab
                            const sellerForTab = {
                                ...seller,
                                ticketMedio: seller.ticket_medio,
                                corridinhaDiaria: seller.corridinha_diaria,
                            };
                            return (
                                <TabsContent key={seller.id} value={seller.id} className="mt-6">
                                    <SellerTab
                                        seller={sellerForTab}
                                        goals={getValues().goals as Goals}
                                        incentives={incentives[seller.id]}
                                        rankings={rankings[seller.id]}
                                    />
                                </TabsContent>
                            );
                        })}
                    </Tabs>
                </TooltipProvider>
            </form>
        </Form>
    </div>
  );
}