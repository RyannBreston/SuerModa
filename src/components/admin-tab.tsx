// src/components/admin-tab.tsx
"use client";

import { UseFormReturn, useWatch } from "react-hook-form";
import {
  UserPlus,
  Trash2,
  Edit,
  Save,
  X,
  Eye,
  EyeOff,
  Calculator,
} from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FormValues } from "./goal-getter-dashboard";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
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
import { Seller, Goals, Incentives } from "@/lib/storage";
import { incentiveProjection } from "@/ai/flows/incentive-projection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// ... (o início do seu arquivo continua o mesmo)

interface AdminTabProps {
  form: UseFormReturn<FormValues>;
  storeId: string;
  onIncentivesCalculated: (incentives: Incentives) => void;
  incentives: Incentives;
  addSeller: (name: string, pass: string) => void;
  handleSaveGoals: () => void;
}

export function AdminTab({
  form,
  storeId,
  onIncentivesCalculated,
  incentives,
  addSeller,
  handleSaveGoals,
}: AdminTabProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [editingSellerId, setEditingSellerId] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSaving, setIsSaving] = useState<Record<string, boolean>>({});


  const {
    control,
    getValues,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
    register,
    trigger, // Adicionado para validar campos
  } = form;

  const rawSellers = useWatch({ control, name: "sellers" }) ?? [];
  const sellers: Seller[] = rawSellers.map(seller => ({
    id: seller.id ?? "",
    name: seller.name ?? "",
    avatarId: seller.avatarId ?? "",
    vendas: seller.vendas ?? 0,
    pa: seller.pa ?? 0,
    ticketMedio: seller.ticketMedio ?? 0,
    corridinhaDiaria: seller.corridinhaDiaria ?? 0,
    password: seller.password ?? "",
  }));

  // ===== INÍCIO DA NOVA FUNÇÃO E LÓGICA DE SALVAMENTO =====

  /**
   * Salva os dados de desempenho de um vendedor específico no banco de dados
   * através de uma chamada de API.
   */
  const handleSaveChanges = async (sellerId: string, sellerIndex: number) => {
    setIsSaving(prev => ({...prev, [sellerId]: true}));
    
    // Valida os campos do vendedor específico antes de salvar
    const fieldsToValidate: (keyof Seller)[] = ['vendas', 'pa', 'ticketMedio', 'corridinhaDiaria'];
    const isValid = await trigger(fieldsToValidate.map(field => `sellers.${sellerIndex}.${field}` as const));

    if (!isValid) {
      toast({
        variant: "destructive",
        title: "Campos inválidos",
        description: "Por favor, corrija os erros antes de salvar.",
      });
      setIsSaving(prev => ({...prev, [sellerId]: false}));
      return;
    }
    
    const sellerData = getValues(`sellers.${sellerIndex}`);

    const dataToSave = {
        vendas: Number(sellerData.vendas) || 0,
        pa: Number(sellerData.pa) || 0,
        ticketMedio: Number(sellerData.ticketMedio) || 0,
        corridinhaDiaria: Number(sellerData.corridinhaDiaria) || 0,
    };

    try {
      const response = await fetch(`/api/sellers/${storeId}/${sellerId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSave),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Falha ao salvar os dados');
      }

      toast({ title: "Sucesso!", description: `Dados de ${sellerData.name} atualizados.` });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erro ao Salvar", description: error.message });
    } finally {
        setIsSaving(prev => ({...prev, [sellerId]: false}));
    }
  };

  // ===== FIM DA NOVA FUNÇÃO E LÓGICA DE SALVAMENTO =====

  // ... (o resto das suas funções como handleAddSeller, removeSeller, etc., continuam aqui)
  // (O código foi omitido para brevidade, mas ele permanece o mesmo do seu arquivo original)

  const handleAddSeller = () => {
    const newSellerName = getValues("newSellerName");
    const newSellerPassword = getValues("newSellerPassword");

    if (!newSellerName || newSellerName.trim() === "") {
      setError("newSellerName", { type: "manual", message: "Nome é obrigatório." });
      return;
    }
    if (sellers.some(s => s.name.toLowerCase() === newSellerName.toLowerCase())) {
        setError("newSellerName", { type: "manual", message: "Este nome de vendedor já existe."});
        return;
    }
    clearErrors("newSellerName");

    const finalPassword =
      newSellerPassword && newSellerPassword.trim().length > 0
        ? newSellerPassword.trim()
        : newSellerName.trim().toLowerCase();

    if (finalPassword.length < 4) {
      setError("newSellerPassword", { type: "manual", message: "A senha deve ter no mínimo 4 caracteres." });
      return;
    }
    clearErrors("newSellerPassword");

    addSeller(newSellerName!, finalPassword);
    setValue("newSellerName", "");
    setValue("newSellerPassword", "");
  };

  const removeSeller = (sellerId: string) => {
    const updatedSellers = sellers
      .filter((s) => s.id !== sellerId)
      .map((s) => ({
        ...s,
        password: s.password ?? "",
      }));
    setValue("sellers", updatedSellers, { shouldDirty: true });

    // Aqui você também precisaria de uma API para deletar o vendedor do banco
    // fetch(`/api/sellers/${storeId}/${sellerId}`, { method: 'DELETE' });

    router.push(`/dashboard/${storeId}?tab=admin`);
    toast({ title: "Vendedor Removido", description: "O vendedor foi removido da lista." });
  };
  
  const handleCalculateIncentives = async () => {
    setIsCalculating(true);
    try {
      const currentSellers = getValues().sellers;
      const currentGoals = getValues().goals as Goals;
      
      // Salva todos os dados antes de calcular
      for (const [index, seller] of currentSellers.entries()) {
          await handleSaveChanges(seller.id, index);
      }
      
      const allIncentives: Incentives = {};

      for (const seller of currentSellers) {
        const result = await incentiveProjection({ seller, goals: currentGoals });
        allIncentives[seller.id] = result;
      }
      
      onIncentivesCalculated(allIncentives);

      toast({ title: "Sucesso!", description: "Incentivos de todos os vendedores foram calculados." });
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : "Falha ao calcular incentivos.";
      toast({ variant: "destructive", title: "Erro de Cálculo", description: errorMessage });
    } finally {
      setIsCalculating(false);
    }
  };


  return (
    <div className="space-y-8">
      <Tabs defaultValue="vendedores" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="vendedores">👥 Vendedores</TabsTrigger>
          <TabsTrigger value="lancamentos">📊 Lançamentos</TabsTrigger>
          <TabsTrigger value="metas">🎯 Metas & Prêmios</TabsTrigger>
        </TabsList>
        
        {/* Aba Vendedores (sem alterações) */}
        <TabsContent value="vendedores">
            {/* Seu código para adicionar e gerenciar vendedores continua aqui... */}
        </TabsContent>

        {/* Aba Lançamentos (COM ALTERAÇÕES) */}
        <TabsContent value="lancamentos">
          <Card>
            <CardHeader>
              <CardTitle>Lançamentos de Desempenho</CardTitle>
              <CardDescription>Insira os valores de Vendas, PA e Ticket Médio para cada vendedor.</CardDescription>
            </CardHeader>
            <CardContent>
              {sellers.length === 0 ? <p className="text-muted-foreground">Adicione vendedores na aba "Vendedores" para começar.</p> : (
                <div className="space-y-6">
                  {sellers.map((seller, index) => (
                    <div key={seller.id} className="p-4 border rounded-lg space-y-4 bg-card">
                      <div className="flex justify-between items-center">
                        <h3 className="font-semibold text-lg text-card-foreground">{seller.name}</h3>
                        {/* BOTÃO SALVAR ADICIONADO AQUI */}
                        <Button 
                            size="sm" 
                            onClick={() => handleSaveChanges(seller.id, index)}
                            disabled={isSaving[seller.id]}
                        >
                          <Save className="mr-2 h-4 w-4" />
                          {isSaving[seller.id] ? "Salvando..." : "Salvar"}
                        </Button>
                      </div>
                      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <FormField control={control} name={`sellers.${index}.vendas`} render={({field}) => (<FormItem><FormLabel>Vendas (R$)</FormLabel><FormControl><Input type="number" placeholder="0.00" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                        <FormField control={control} name={`sellers.${index}.pa`} render={({field}) => (<FormItem><FormLabel>PA (Unid.)</FormLabel><FormControl><Input type="number" placeholder="0.00" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                        <FormField control={control} name={`sellers.${index}.ticketMedio`} render={({field}) => (<FormItem><FormLabel>Ticket Médio (R$)</FormLabel><FormControl><Input type="number" placeholder="0.00" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                        <FormField control={control} name={`sellers.${index}.corridinhaDiaria`} render={({field}) => (<FormItem><FormLabel>Bônus Corridinha (R$)</FormLabel><FormControl><Input type="number" placeholder="0.00" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                      </div>
                    </div>
                  ))}
                  <Separator className="my-6"/>
                  <Button onClick={handleCalculateIncentives} disabled={isCalculating} className="w-full md:w-auto">
                    <Calculator className="mr-2" />
                    {isCalculating ? "Calculando..." : "Calcular Todos os Incentivos"}
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">Isso salvará os dados de todos e depois calculará os bônus.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Aba Metas e Prêmios (sem alterações) */}
        <TabsContent value="metas">
            {/* Seu formulário de metas continua aqui... */}
        </TabsContent>
      </Tabs>
    </div>
  );
}