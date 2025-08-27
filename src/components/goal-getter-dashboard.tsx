
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState, useTransition, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from 'next/navigation';
import {
  Loader2,
  UserPlus,
  Trash2,
  Edit,
  Save,
  X,
  ShieldCheck,
  Calculator,
  Home,
} from "lucide-react";

import {
  incentiveProjection,
  type IncentiveProjectionOutput,
} from "@/ai/flows/incentive-projection";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { ProgressDisplay } from "@/components/progress-display";
import { Logo } from "@/components/logo";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";


const sellerSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Nome é obrigatório"),
  vendas: z.coerce.number({ invalid_type_error: "Deve ser um número" }).min(0).default(0),
  pa: z.coerce.number({ invalid_type_error: "Deve ser um número" }).min(0).default(0),
  ticketMedio: z.coerce.number({ invalid_type_error: "Deve ser um número" }).min(0).default(0),
  corridinhaDiaria: z.coerce.number({ invalid_type_error: "Deve ser um número" }).min(0).default(0),
});

const formSchema = z.object({
  newSellerName: z.string(),
  metaMinha: z.coerce.number({ invalid_type_error: "Deve ser um número" }).min(0),
  meta: z.coerce.number({ invalid_type_error: "Deve ser um número" }).min(0),
  metona: z.coerce.number({ invalid_type_error: "Deve ser um número" }).min(0),
  metaLendaria: z.coerce.number({ invalid_type_error: "Deve ser um número" }).min(0),
  legendariaBonusValorVenda: z.coerce.number({ invalid_type_error: "Deve ser um número" }).min(1, "Deve ser maior que zero"),
  legendariaBonusValorPremio: z.coerce.number({ invalid_type_error: "Deve ser um número" }).min(0),
  metaMinhaPrize: z.coerce.number({ invalid_type_error: "Deve ser um número" }).min(0),
  metaPrize: z.coerce.number({ invalid_type_error: "Deve ser um número" }).min(0),
  metonaPrize: z.coerce.number({ invalid_type_error: "Deve ser um número" }).min(0),
  paGoal1: z.coerce.number({ invalid_type_error: "Deve ser um número" }).min(0),
  paGoal2: z.coerce.number({ invalid_type_error: "Deve ser um número" }).min(0),
  paGoal3: z.coerce.number({ invalid_type_error: "Deve ser um número" }).min(0),
  paGoal4: z.coerce.number({ invalid_type_error: "Deve ser um número" }).min(0),
  paPrize1: z.coerce.number({ invalid_type_error: "Deve ser um número" }).min(0),
  paPrize2: z.coerce.number({ invalid_type_error: "Deve ser um número" }).min(0),
  paPrize3: z.coerce.number({ invalid_type_error: "Deve ser um número" }).min(0),
  paPrize4: z.coerce.number({ invalid_type_error: "Deve ser um número" }).min(0),
  ticketMedioGoal1: z.coerce.number({ invalid_type_error: "Deve ser um número" }).min(0),
  ticketMedioGoal2: z.coerce.number({ invalid_type_error: "Deve ser um número" }).min(0),
  ticketMedioGoal3: z.coerce.number({ invalid_type_error: "Deve ser um número" }).min(0),
  ticketMedioGoal4: z.coerce.number({ invalid_type_error: "Deve ser um número" }).min(0),
  ticketMedioPrize1: z.coerce.number({ invalid_type_error: "Deve ser um número" }).min(0),
  ticketMedioPrize2: z.coerce.number({ invalid_type_error: "Deve ser um número" }).min(0),
  ticketMedioPrize3: z.coerce.number({ invalid_type_error: "Deve ser um número" }).min(0),
  ticketMedioPrize4: z.coerce.number({ invalid_type_error: "Deve ser um número" }).min(0),
  sellers: z.array(sellerSchema),
});

type FormValues = z.infer<typeof formSchema>;
type Seller = z.infer<typeof sellerSchema>;

type RankingMetric = 'vendas' | 'pa' | 'ticketMedio' | 'corridinhaDiaria' | 'totalIncentives';
type Rankings = Record<string, Record<RankingMetric, number>>;

const initialSellers: Seller[] = [
  { id: '1', name: 'Val', vendas: 0, pa: 0, ticketMedio: 0, corridinhaDiaria: 0 },
  { id: '2', name: 'Rose', vendas: 0, pa: 0, ticketMedio: 0, corridinhaDiaria: 0 },
  { id: '3', name: 'Thays', vendas: 0, pa: 0, ticketMedio: 0, corridinhaDiaria: 0 },
  { id: '4', name: 'Mercia', vendas: 0, pa: 0, ticketMedio: 0, corridinhaDiaria: 0 },
  { id: '5', name: 'Joisse', vendas: 0, pa: 0, ticketMedio: 0, corridinhaDiaria: 0 },
  { id: '6', name: 'Dajila', vendas: 0, pa: 0, ticketMedio: 0, corridinhaDiaria: 0 },
];

const goalTiers = [
    { id: 'Metinha', goal: 'paGoal1', prize: 'paPrize1'},
    { id: 'Meta', goal: 'paGoal2', prize: 'paPrize2' },
    { id: 'Metona', goal: 'paGoal3', prize: 'paPrize3' },
    { id: 'Lendária', goal: 'paGoal4', prize: 'paPrize4' },
];

const ticketMedioTiers = [
    { id: 'Metinha', goal: 'ticketMedioGoal1', prize: 'ticketMedioPrize1'},
    { id: 'Meta', goal: 'ticketMedioGoal2', prize: 'ticketMedioPrize2' },
    { id: 'Metona', goal: 'ticketMedioGoal3', prize: 'ticketMedioPrize3' },
    { id: 'Lendária', goal: 'ticketMedioGoal4', prize: 'ticketMedioPrize4' },
];

export function GoalGetterDashboard() {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const [incentives, setIncentives] =
    useState<Record<string, IncentiveProjectionOutput | null>>({});
  const [editingSellerId, setEditingSellerId] = useState<string | null>(null);
  const [rankings, setRankings] = useState<Rankings>({});
  const searchParams = useSearchParams();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      newSellerName: "",
      metaMinha: 8000,
      meta: 9000,
      metona: 10000,
      metaLendaria: 12000,
      legendariaBonusValorVenda: 2000,
      legendariaBonusValorPremio: 50,
      metaMinhaPrize: 50,
      metaPrize: 100,
      metonaPrize: 120,
      paGoal1: 1.5,
      paGoal2: 1.6,
      paGoal3: 1.9,
      paGoal4: 2.0,
      paPrize1: 5,
      paPrize2: 10,
      paPrize3: 15,
      paPrize4: 20,
      ticketMedioGoal1: 180,
      ticketMedioGoal2: 185,
      ticketMedioGoal3: 190,
      ticketMedioGoal4: 200,
      ticketMedioPrize1: 5,
      ticketMedioPrize2: 10,
      ticketMedioPrize3: 15,
      ticketMedioPrize4: 20,
      sellers: initialSellers,
    },
  });
  
  const { watch, getValues, setValue } = form;
  const currentValues = watch();

  const getInitialTab = useCallback(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl) return tabFromUrl;
    if (currentValues.sellers.length > 0) return currentValues.sellers[0].id;
    return "admin";
  }, [searchParams, currentValues.sellers]);
  
  const [activeTab, setActiveTab] = useState(getInitialTab);

  useEffect(() => {
    setActiveTab(getInitialTab());
  }, [getInitialTab])


  const calculateRankings = useCallback((sellers: Seller[], currentIncentives: Record<string, IncentiveProjectionOutput | null>) => {
    const newRankings: Rankings = {};
    const metrics: RankingMetric[] = ['vendas', 'pa', 'ticketMedio', 'corridinhaDiaria', 'totalIncentives'];

    metrics.forEach(metric => {
        const sortedSellers = [...sellers]
            .map(seller => {
                let value = 0;
                if (metric === 'totalIncentives') {
                    const incentiveData = currentIncentives[seller.id];
                    value = incentiveData ? Object.values(incentiveData).reduce((sum, val) => sum + val, 0) : 0;
                } else if (metric === 'corridinhaDiaria') {
                    const incentiveData = currentIncentives[seller.id];
                    value = incentiveData?.corridinhaDiariaBonus || 0;
                }
                else {
                    value = seller[metric as keyof Omit<Seller, 'id' | 'name'>] as number;
                }
                return { id: seller.id, value };
            })
            .sort((a, b) => b.value - a.value);

        let rank = 1;
        for (let i = 0; i < sortedSellers.length; i++) {
            if (i > 0 && sortedSellers[i].value < sortedSellers[i - 1].value) {
                rank = i + 1;
            }
            const sellerId = sortedSellers[i].id;
            if (!newRankings[sellerId]) {
                newRankings[sellerId] = {} as Record<RankingMetric, number>;
            }
            newRankings[sellerId][metric] = rank;
        }
    });

    setRankings(newRankings);
  }, []);

  useEffect(() => {
    // This effect ensures localStorage is accessed only on the client side
    try {
      const savedState = localStorage.getItem("goalGetterState");
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        // A simple validation to make sure we are not setting junk state
        if (parsedState && typeof parsedState.meta === 'number') {
            form.reset(parsedState);
        }
      }
    } catch (error) {
        console.error("Failed to load state from localStorage", error);
    }
  }, [form]);

  useEffect(() => {
    // This effect saves the form state to localStorage on every change.
    const subscription = watch((value) => {
        try {
            localStorage.setItem("goalGetterState", JSON.stringify(value));
            if(value.sellers && incentives){
                 calculateRankings(value.sellers, incentives);
            }
        } catch(error) {
            console.error("Failed to save state to localStorage", error);
        }
    });
    return () => subscription.unsubscribe();
  }, [watch, incentives, calculateRankings]);


  const addSeller = () => {
    const newSellerName = getValues("newSellerName");
    if (newSellerName.trim() === "") {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "O nome do vendedor não pode estar vazio.",
      });
      return;
    }
    const newSeller: Seller = {
      id: new Date().toISOString(),
      name: newSellerName,
      vendas: 0,
      pa: 0,
      ticketMedio: 0,
      corridinhaDiaria: 0,
    };
    const updatedSellers = [...getValues("sellers"), newSeller];
    setValue("sellers", updatedSellers);
    setValue("newSellerName", "");
    setActiveTab(newSeller.id);
  };

  const removeSeller = (sellerId: string) => {
    const updatedSellers = currentValues.sellers.filter(s => s.id !== sellerId);
    setValue("sellers", updatedSellers);
    setIncentives(prev => {
        const newIncentives = {...prev};
        delete newIncentives[sellerId];
        return newIncentives;
    });
    if (activeTab === sellerId) {
        setActiveTab(updatedSellers.length > 0 ? updatedSellers[0].id : "admin");
    }
  }

  const startEditing = (sellerId: string) => {
    setEditingSellerId(sellerId);
  }

  const cancelEditing = () => {
    setEditingSellerId(null);
  }

  const saveSellerName = (sellerId: string) => {
    const sellerIndex = currentValues.sellers.findIndex(s => s.id === sellerId);
    if (sellerIndex === -1) return;

    const newName = getValues(`sellers.${sellerIndex}.name`);
    if (newName.trim() === "") {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "O nome do vendedor não pode estar vazio.",
      });
      return;
    }
    setEditingSellerId(null);
  }

  const calculateAllIncentives = (values: FormValues) => {
    startTransition(async () => {
      try {
        const newIncentives: Record<string, IncentiveProjectionOutput | null> = {};
        for (const seller of values.sellers) {
          const result = await incentiveProjection({
            vendas: seller.vendas,
            pa: seller.pa,
            ticketMedio: seller.ticketMedio,
            corridinhaDiaria: seller.corridinhaDiaria,
            metaMinha: values.metaMinha,
            meta: values.meta,
            metona: values.metona,
            metaLendaria: values.metaLendaria,
            legendariaBonusValorVenda: values.legendariaBonusValorVenda,
            legendariaBonusValorPremio: values.legendariaBonusValorPremio,
            metaMinhaPrize: values.metaMinhaPrize,
            metaPrize: values.metaPrize,
            metonaPrize: values.metonaPrize,
            paGoal1: values.paGoal1,
            paGoal2: values.paGoal2,
            paGoal3: values.paGoal3,
            paGoal4: values.paGoal4,
            paPrize1: values.paPrize1,
            paPrize2: values.paPrize2,
            paPrize3: values.paPrize3,
            paPrize4: values.paPrize4,
            ticketMedioGoal1: values.ticketMedioGoal1,
            ticketMedioGoal2: values.ticketMedioGoal2,
            ticketMedioGoal3: values.ticketMedioGoal3,
            ticketMedioGoal4: values.ticketMedioGoal4,
            ticketMedioPrize1: values.ticketMedioPrize1,
            ticketMedioPrize2: values.ticketMedioPrize2,
            ticketMedioPrize3: values.ticketMedioPrize3,
            ticketMedioPrize4: values.ticketMedioPrize4,
          });
          newIncentives[seller.id] = result;
        }
        setIncentives(newIncentives);
        calculateRankings(values.sellers, newIncentives);
        toast({
          title: "Sucesso!",
          description: "Painel de todos os vendedores atualizado com sucesso.",
        });
      } catch (error) {
        console.error("Calculation Error:", error);
        toast({
          variant: "destructive",
          title: "Erro de Cálculo",
          description: "Não foi possível calcular os incentivos. Tente novamente.",
        });
      }
    });
  };

  const onSubmit = (values: FormValues) => {
    calculateAllIncentives(values);
  };
  
  const renderGoalInputs = (level: string, tiers: typeof goalTiers | typeof ticketMedioTiers) => (
    <div>
        <h3 className="font-semibold mb-4 text-primary">Metas de {level}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
            {tiers.map(tier => (
                 <div className="space-y-2" key={tier.id}>
                    <h4 className="font-medium text-sm">{tier.id}</h4>
                    <div className="flex items-center gap-2">
                        <FormField control={form.control} name={tier.goal as keyof FormValues} render={({ field }) => ( <FormItem className="flex-grow"><FormLabel className="sr-only">Meta</FormLabel><FormControl><Input type="number" placeholder="Meta" {...field} /></FormControl><FormMessage /></FormItem> )}/>
                        <FormField control={form.control} name={tier.prize as keyof FormValues} render={({ field }) => ( <FormItem className="flex-grow"><FormLabel className="sr-only">Prêmio</FormLabel><FormControl><Input type="number" placeholder="Prêmio (R$)" {...field} /></FormControl><FormMessage /></FormItem> )}/>
                    </div>
                </div>
            ))}
        </div>
    </div>
  )


  return (
    <div className="container mx-auto p-4 py-8 md:p-8">
      <header className="flex items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
            <Logo />
            <div>
              <h1 className="text-3xl font-bold font-headline text-primary">
                Corridinha GT
              </h1>
              <p className="text-muted-foreground">
                Acompanhe suas metas e maximize seus ganhos.
              </p>
            </div>
        </div>
        <Button asChild variant="outline">
          <Link href="/">
            <Home className="mr-2 h-4 w-4" />
            Página Inicial
          </Link>
        </Button>
      </header>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
           <TooltipProvider>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="flex items-center border-b">
                    <TabsList className="flex-grow h-auto p-0 bg-transparent border-0 rounded-none">
                        {currentValues.sellers.map(seller => (
                            <TabsTrigger key={seller.id} value={seller.id} className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none">
                                {seller.name}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                    <Tooltip>
                        <TooltipTrigger asChild>
                             <TabsList className="h-auto p-0 bg-transparent border-0 rounded-none">
                                <TabsTrigger value="admin" className="px-3">
                                    <ShieldCheck className="h-5 w-5"/>
                                    <span className="sr-only">Admin</span>
                                </TabsTrigger>
                             </TabsList>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Painel do Administrador</p>
                        </TooltipContent>
                    </Tooltip>
                </div>

                <TabsContent value="admin">
                    <Card className="mt-4">
                        <CardHeader>
                        <CardTitle>Controles do Administrador</CardTitle>
                        <CardDescription>
                            Ajuste as metas, prêmios e gerencie os vendedores aqui.
                        </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            
                            <div className="grid lg:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="font-semibold mb-2 text-primary">Cadastrar Novo Vendedor</h3>
                                        <div className="flex items-center gap-2">
                                        <FormField control={form.control} name="newSellerName" render={({ field }) => (
                                            <FormItem className="flex-grow">
                                                <FormLabel className="sr-only">Nome do Vendedor</FormLabel>
                                                <FormControl><Input placeholder="Nome do Vendedor" {...field} /></FormControl>
                                            </FormItem>
                                        )}
                                        />
                                        <Button type="button" onClick={addSeller}><UserPlus/></Button>
                                        </div>
                                    </div>

                                    <Separator/>

                                    <div>
                                        <h3 className="font-semibold mb-4 text-primary">Gerenciar Vendedores</h3>
                                        <div className="space-y-2">
                                            {currentValues.sellers.map((seller, index) => (
                                                <div key={seller.id} className="flex items-center justify-between gap-2 p-2 rounded-md bg-muted/50">
                                                    {editingSellerId === seller.id ? (
                                                        <>
                                                            <FormField control={form.control} name={`sellers.${index}.name`} render={({ field }) => (
                                                            <FormItem className="flex-grow"><FormControl><Input {...field} /></FormControl></FormItem>
                                                            )}
                                                        />
                                                            <Button size="icon" variant="ghost" onClick={() => saveSellerName(seller.id)}><Save className="h-4 w-4"/></Button>
                                                            <Button size="icon" variant="ghost" onClick={cancelEditing}><X className="h-4 w-4"/></Button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <span className="font-medium">{seller.name}</span>
                                                            <div className="flex items-center">
                                                                <Button size="icon" variant="ghost" onClick={() => startEditing(seller.id)}><Edit className="h-4 w-4"/></Button>
                                                                <AlertDialog>
                                                                    <AlertDialogTrigger asChild>
                                                                        <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4"/></Button>
                                                                    </AlertDialogTrigger>
                                                                    <AlertDialogContent>
                                                                        <AlertDialogHeader>
                                                                            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                                                                            <AlertDialogDescription>Essa ação não pode ser desfeita. Isso irá remover permanentemente o vendedor e seus dados.</AlertDialogDescription>
                                                                        </AlertDialogHeader>
                                                                        <AlertDialogFooter>
                                                                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                                            <AlertDialogAction onClick={() => removeSeller(seller.id)} className="bg-destructive hover:bg-destructive/90">Remover</AlertDialogAction>
                                                                        </AlertDialogFooter>
                                                                    </AlertDialogContent>
                                                                </AlertDialog>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    <Separator/>

                                    <div>
                                        <h3 className="font-semibold mb-4 text-primary">Lançar Vendas</h3>
                                        <div className="space-y-4">
                                            {currentValues.sellers.map((seller, index) => (
                                                <div key={seller.id}>
                                                    <h4 className="font-medium mb-2">{seller.name}</h4>
                                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                                                         <FormField control={form.control} name={`sellers.${index}.vendas`} render={({ field }) => ( <FormItem><FormLabel className="text-xs">Vendas</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem> )}/>
                                                        <FormField control={form.control} name={`sellers.${index}.pa`} render={({ field }) => ( <FormItem><FormLabel className="text-xs">PA</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem> )}/>
                                                        <FormField control={form.control} name={`sellers.${index}.ticketMedio`} render={({ field }) => ( <FormItem><FormLabel className="text-xs">Ticket Médio</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem> )}/>
                                                        <FormField control={form.control} name={`sellers.${index}.corridinhaDiaria`} render={({ field }) => ( <FormItem><FormLabel className="text-xs">Corridinha</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem> )}/>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                </div>
                                <div className="space-y-6">
                                     <div>
                                        <h3 className="font-semibold mb-4 text-primary">Metas de Vendas</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
                                        <div className="space-y-2">
                                            <h4 className="font-medium text-sm">Metinha</h4>
                                            <div className="flex items-center gap-2">
                                                <FormField control={form.control} name="metaMinha" render={({ field }) => ( <FormItem className="flex-grow"><FormLabel className="sr-only">Meta</FormLabel><FormControl><Input type="number" placeholder="Meta" {...field} /></FormControl></FormItem> )}/>
                                                <FormField control={form.control} name="metaMinhaPrize" render={({ field }) => ( <FormItem className="flex-grow"><FormLabel className="sr-only">Prêmio</FormLabel><FormControl><Input type="number" placeholder="Prêmio (R$)" {...field} /></FormControl></FormItem> )}/>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <h4 className="font-medium text-sm">Meta</h4>
                                            <div className="flex items-center gap-2">
                                                <FormField control={form.control} name="meta" render={({ field }) => ( <FormItem className="flex-grow"><FormLabel className="sr-only">Meta</FormLabel><FormControl><Input type="number" placeholder="Meta" {...field} /></FormControl></FormItem> )}/>
                                                <FormField control={form.control} name="metaPrize" render={({ field }) => ( <FormItem className="flex-grow"><FormLabel className="sr-only">Prêmio</FormLabel><FormControl><Input type="number" placeholder="Prêmio (R$)" {...field} /></FormControl></FormItem> )}/>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <h4 className="font-medium text-sm">Metona</h4>
                                            <div className="flex items-center gap-2">
                                                <FormField control={form.control} name="metona" render={({ field }) => ( <FormItem className="flex-grow"><FormLabel className="sr-only">Meta</FormLabel><FormControl><Input type="number" placeholder="Meta" {...field} /></FormControl></FormItem> )}/>
                                                <FormField control={form.control} name="metonaPrize" render={({ field }) => ( <FormItem className="flex-grow"><FormLabel className="sr-only">Prêmio</FormLabel><FormControl><Input type="number" placeholder="Prêmio (R$)" {...field} /></FormControl></FormItem> )}/>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <h4 className="font-medium text-sm">Lendária</h4>
                                            <FormField control={form.control} name="metaLendaria" render={({ field }) => ( <FormItem className="flex-grow"><FormLabel className="sr-only">Meta</FormLabel><FormControl><Input type="number" placeholder="Meta" {...field} /></FormControl></FormItem> )}/>
                                            <div className="flex items-center gap-2">
                                                <FormField control={form.control} name="legendariaBonusValorVenda" render={({ field }) => ( <FormItem className="flex-grow"><FormLabel>A cada (R$)</FormLabel><FormControl><Input type="number" placeholder="Valor Venda" {...field} /></FormControl><FormMessage /></FormItem> )}/>
                                                <FormField control={form.control} name="legendariaBonusValorPremio" render={({ field }) => ( <FormItem className="flex-grow"><FormLabel>Bônus (R$)</FormLabel><FormControl><Input type="number" placeholder="Valor Prêmio" {...field} /></FormControl><FormMessage /></FormItem> )}/>
                                            </div>
                                        </div>
                                        </div>
                                    </div>

                                    <Separator />
                                    {renderGoalInputs("PA", goalTiers)}
                                    <Separator />
                                    {renderGoalInputs("Ticket Médio", ticketMedioTiers)}
                                </div>
                            </div>

                             <Separator />

                            <Button type="submit" disabled={isPending} className="w-full">
                                {isPending ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Calculando...</>) : "Salvar Metas e Calcular Todos os Incentivos"}
                                <Calculator className="ml-2 h-5 w-5"/>
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>
                
                {currentValues.sellers.map((seller, index) => (
                    <TabsContent key={seller.id} value={seller.id} className="mt-4">
                        <div className="grid lg:grid-cols-1 gap-8">
                            <ProgressDisplay 
                                salesData={{
                                    vendas: currentValues.sellers[index]?.vendas || 0,
                                    pa: currentValues.sellers[index]?.pa || 0,
                                    ticketMedio: currentValues.sellers[index]?.ticketMedio || 0,
                                    corridinhaDiaria: currentValues.sellers[index]?.corridinhaDiaria || 0,
                                    metaMinha: currentValues.metaMinha,
                                    meta: currentValues.meta,
                                    metona: currentValues.metona,
                                    metaLendaria: currentValues.metaLendaria,
                                    paGoal4: currentValues.paGoal4,
                                    ticketMedioGoal4: currentValues.ticketMedioGoal4,
                                }}
                                incentives={incentives[seller.id]}
                                rankings={rankings[seller.id]}
                                loading={isPending}
                            />
                        </div>
                    </TabsContent>
                ))}
            </Tabs>
           </TooltipProvider>
        </form>
      </Form>
    </div>
  );
}
