// src/components/goal-getter-dashboard.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { ShieldCheck, Home, CheckCircle, Loader2 } from "lucide-react";
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

// Definições de esquema e tipos
const sellerSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Nome é obrigatório"),
  password: z.string().min(4, "A senha deve ter pelo menos 4 caracteres"),
  avatar_id: z.string(), // Corrigido para corresponder ao DB
  vendas: z.coerce.number().min(0).default(0),
  pa: z.coerce.number().min(0).default(0),
  ticket_medio: z.coerce.number().min(0).default(0),
  corridinha_diaria: z.coerce.number().min(0).default(0),
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
    // **A CORREÇÃO ESTÁ AQUI**
    // Inicia o formulário com a estrutura completa de metas, garantindo que nenhum valor seja undefined.
    defaultValues: {
      newSellerName: "",
      newSellerPassword: "",
      sellers: [],
      goals: getInitialState().goals.default,
    },
  });

  const { reset, getValues, setValue } = form;

  useEffect(() => {
    const adminAuthenticated = sessionStorage.getItem("adminAuthenticated") === "true";
    setIsAdmin(adminAuthenticated);

    async function fetchData() {
      try {
        const [sellersRes, storesRes] = await Promise.all([
          fetch(`/api/sellers/${storeId}`),
          fetch(`/api/stores`),
        ]);

        if (!sellersRes.ok || !storesRes.ok) throw new Error("Falha ao carregar dados da loja.");
        
        const sellersData = await sellersRes.json();
        const storesData: Store[] = await storesRes.json();
        const currentStoreDetails = storesData.find(s => s.id === storeId);
        setCurrentStore(currentStoreDetails || null);

        const goalsRes = await fetch(`/api/goals/${storeId}`);
        let goalsData;

        if (goalsRes.status === 404) {
          goalsData = getInitialState().goals.default;
        } else if (!goalsRes.ok) {
          throw new Error("Falha ao carregar metas da loja.");
        } else {
          goalsData = await goalsRes.json();
        }

        reset({ sellers: sellersData, goals: goalsData });
        
        const tabFromUrl = searchParams.get("tab");
        const sellersForStore = sellersData || [];
        let tabToActivate = tabFromUrl || (adminAuthenticated ? "admin" : sellersForStore.length > 0 ? sellersForStore[0].id : "admin");
        
        setActiveTab(tabToActivate);

      } catch (error: any) {
        toast({ variant: "destructive", title: "Erro ao Carregar", description: error.message });
      }
    }

    fetchData();
  }, [storeId, reset, router, toast, searchParams]);
  
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

  const addSeller = useCallback(async (name: string, pass: string) => {
    const currentSellers = getValues("sellers") || [];
    const existingAvatarIds = new Set(currentSellers.map((s) => s.avatar_id));
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

        const newSellerData = await response.json();
        // Garantir que todos os campos obrigatórios estejam presentes
        const newSeller: Seller = {
            id: newSellerData.id,
            name: newSellerData.name,
            password: newSellerData.password,
            avatarId: newSellerData.avatar_id ?? "",
            vendas: newSellerData.vendas ?? 0,
            pa: newSellerData.pa ?? 0,
            ticketMedio: newSellerData.ticket_medio ?? 0,
            corridinhaDiaria: newSellerData.corridinha_diaria ?? 0,
        };
        setValue(
          "sellers",
          [
            ...getValues("sellers").map((s) => ({
              id: s.id ?? "",
              name: s.name ?? "",
              password: s.password ?? "",
              avatar_id: (s as any).avatar_id ?? (s as any).avatarId ?? "",
              vendas: typeof s.vendas === "number" ? s.vendas : Number(s.vendas) || 0,
              pa: typeof s.pa === "number" ? s.pa : Number(s.pa) || 0,
              ticket_medio: typeof (s as any).ticket_medio === "number" ? (s as any).ticket_medio : Number((s as any).ticket_medio ?? (s as any).ticketMedio) || 0,
              corridinha_diaria: typeof (s as any).corridinha_diaria === "number" ? (s as any).corridinha_diaria : Number((s as any).corridinha_diaria ?? (s as any).corridinhaDiaria) || 0,
            })),
            {
              id: newSeller.id ?? "",
              name: newSeller.name ?? "",
              password: newSeller.password ?? "",
              avatar_id: newSeller.avatarId ?? newSeller.avatarId ?? "",
              vendas: typeof newSeller.vendas === "number" ? newSeller.vendas : Number(newSeller.vendas) || 0,
              pa: typeof newSeller.pa === "number" ? newSeller.pa : Number(newSeller.pa) || 0,
              ticket_medio: typeof newSeller.ticketMedio === "number" ? newSeller.ticketMedio : Number(newSeller.ticketMedio ?? newSeller.ticketMedio) || 0,
              corridinha_diaria: typeof newSeller.corridinhaDiaria === "number" ? newSeller.corridinhaDiaria : Number(newSeller.corridinhaDiaria ?? newSeller.corridinhaDiaria) || 0,
            }
          ]
        );
        toast({ title: "Vendedor adicionado!", description: `${name} foi adicionado(a) com sucesso.` });
        router.push(`/dashboard/${storeId}?tab=${newSeller.id}`, { scroll: false });

    } catch (error) {
        toast({ variant: "destructive", title: "Erro", description: "Não foi possível adicionar o vendedor." });
    }
  }, [getValues, setValue, storeId, router, toast]);

  const handleIncentivesCalculated = useCallback((newIncentives: Incentives) => {
    setIncentives(newIncentives);
  }, []);
  
  const handleTabChange = (newTab: string) => {
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
                                    seller={{
                                        ...seller,
                                        avatarId: seller.avatar_id,
                                        ticketMedio: seller.ticket_medio,
                                        corridinhaDiaria: seller.corridinha_diaria,
                                    }}
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