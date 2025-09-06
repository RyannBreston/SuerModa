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
import { Seller, Goals, Store, Incentives } from "@/lib/storage"; // Mantemos os tipos
import { AdminTab } from "@/components/admin-tab";
import { SellerTab } from "@/components/seller-tab";
import { Skeleton } from "./ui/skeleton";

// Definições de esquema e tipos (como no seu arquivo original)
const sellerSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Nome é obrigatório"),
  password: z.string().min(4, "A senha deve ter pelo menos 4 caracteres"),
  avatarId: z.string(),
  vendas: z.coerce.number().min(0).default(0),
  pa: z.coerce.number().min(0).default(0),
  ticketMedio: z.coerce.number().min(0).default(0),
  corridinhaDiaria: z.coerce.number().min(0).default(0),
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

// Componente de Skeleton para o carregamento inicial
const DashboardSkeleton = () => (
    <div className="container mx-auto p-4 py-8 md:p-8">
        <header className="flex items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
            <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
            </div>
        </div>
        <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
        </div>
        </header>
        <div className="border-b mb-4">
        <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
        </div>
        </div>
        <Skeleton className="h-[500px] w-full" />
    </div>
);

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
    defaultValues: {
      newSellerName: "",
      newSellerPassword: "",
      sellers: [],
      goals: {},
    },
  });

  const { reset, getValues, setValue, control } = form;

  // Função para adicionar vendedor - AGORA CHAMA A API
  const addSeller = useCallback(async (name: string, pass: string) => {
    const currentSellers = getValues("sellers") || [];
    const existingAvatarIds = new Set(currentSellers.map((s) => s.avatarId));
    let randomAvatarId = availableAvatarIds[Math.floor(Math.random() * availableAvatarIds.length)];

    if (existingAvatarIds.size < availableAvatarIds.length) {
      while (existingAvatarIds.has(randomAvatarId)) {
        randomAvatarId = availableAvatarIds[Math.floor(Math.random() * availableAvatarIds.length)];
      }
    }

    try {
        const response = await fetch(`/api/sellers/${storeId}`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ name, password: pass, avatarId: randomAvatarId })
        });
        if (!response.ok) throw new Error("Falha ao adicionar vendedor");

        const newSeller: Seller = await response.json();
        // Ensure password is always a string for all sellers
        const currentSellers = getValues("sellers").map(seller => ({
          ...seller,
          password: seller.password ?? ""
        }));
        const sellerWithPassword: Seller = {
          ...newSeller,
          password: newSeller.password ?? ""
        };
        setValue(
          "sellers",
          [...currentSellers, sellerWithPassword].map(seller => ({
            ...seller,
            password: seller.password ?? ""
          }))
        );
        toast({ title: "Vendedor adicionado!", description: `${name} foi adicionado(a) com sucesso.` });
        router.push(`/dashboard/${storeId}?tab=${sellerWithPassword.id}`, { scroll: false });

    } catch (error) {
        toast({ variant: "destructive", title: "Erro", description: "Não foi possível adicionar o vendedor." });
    }
  }, [getValues, setValue, storeId, router, toast]);

  // Função para salvar metas - AGORA CHAMA A API
  const handleSaveGoals = useCallback(async () => {
    const goals = getValues().goals as Goals;
    try {
        const response = await fetch(`/api/goals/${storeId}`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(goals)
        });
        if (!response.ok) throw new Error("Falha ao salvar as metas.");
        
        toast({ title: "Metas Salvas!", description: "As novas metas e prêmios foram salvos com sucesso.", action: <CheckCircle className="text-green-500" /> });
    } catch (error) {
        toast({ variant: "destructive", title: "Erro", description: "Não foi possível salvar as metas." });
    }
  }, [getValues, storeId, toast]);

  // Lógica para carregar os dados iniciais da API
  useEffect(() => {
    const adminAuthenticated = sessionStorage.getItem("adminAuthenticated") === "true";
    setIsAdmin(adminAuthenticated);

    async function fetchData() {
      try {
        const [sellersRes, goalsRes] = await Promise.all([
          fetch(`/api/sellers/${storeId}`),
          fetch(`/api/goals/${storeId}`),
        ]);

        if (!sellersRes.ok || !goalsRes.ok) {
          throw new Error("Falha ao carregar dados do painel.");
        }

        const sellersData: Seller[] = await sellersRes.json();
        const goalsData: Goals = await goalsRes.json();
        
        // TODO: Buscar o nome da loja de uma API /api/stores/[storeId] também
        // Por agora, vamos pegar do localStorage para manter o nome visível
        const stateFromStorage = JSON.parse(localStorage.getItem("goalGetterState_v2") || "{}");
        const storeDetails = stateFromStorage.stores?.find((s: Store) => s.id === storeId);
        setCurrentStore(storeDetails || null);

        reset({ sellers: sellersData, goals: goalsData });
        
        // Lógica de autenticação e seleção de aba (igual à sua versão original)
        const tabFromUrl = searchParams.get("tab");
        let tabToActivate = tabFromUrl || (adminAuthenticated ? "admin" : sellersData.length > 0 ? sellersData[0].id : "admin");
        
        // ... (resto da sua lógica de verificação de abas e redirecionamento)
        
        setActiveTab(tabToActivate);

      } catch (error) {
        toast({ variant: "destructive", title: "Erro ao Carregar", description: "Não foi possível buscar os dados do servidor." });
        router.push("/");
      }
    }

    fetchData();
  }, [storeId, reset, router, toast, searchParams]);
  
  // O restante do seu componente (handleTabChange, calculateRankings, JSX, etc.) permanece praticamente o mesmo.
  // Apenas as funções que modificam os dados precisam ser atualizadas para chamar a API.
  
  // As funções onIncentivesCalculated, calculateRankings, etc. podem ser mantidas como estão
  // pois operam no estado do formulário, que agora é preenchido pela API.
  const calculateRankings = useCallback(
    (sellers: Seller[]) => { /* ... sua implementação ... */ }, []
  );
  
  const handleIncentivesCalculated = useCallback(
    (newIncentives: Incentives) => {
        setIncentives(newIncentives);
        // Opcional: Você pode criar uma API para salvar os incentivos calculados se precisar deles persistidos
        calculateRankings(getValues().sellers);
    }, [calculateRankings, getValues]
  );
  
  const handleTabChange = (newTab: string) => {
    // Sua lógica de mudança de aba aqui...
    setActiveTab(newTab);
    router.push(`/dashboard/${storeId}?tab=${newTab}`, { scroll: false });
  };
  
  if (activeTab === "loading") {
    return <DashboardSkeleton />;
  }

  return (
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
                        {getValues("sellers").map((seller) => (
                            <TabsContent key={seller.id} value={seller.id} className="mt-6">
                                <SellerTab
                                    seller={seller}
                                    goals={getValues().goals as Goals}
                                    incentives={incentives[seller.id]}
                                    rankings={rankings[seller.id]}
                                />
                            </TabsContent>
                        ))}
                    </Tabs>
                </TooltipProvider>
            </form>
        </Form>
    </div>
  );
}