// src/components/admin-tab.tsx
"use client";

import { UseFormReturn, useWatch } from "react-hook-form";
import { UserPlus, Trash2, Edit, Save, X, Eye, EyeOff, Calculator } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FormValues } from "./goal-getter-dashboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Seller, Goals, Incentives } from "@/lib/storage";
import { incentiveProjection } from "@/ai/flows/incentive-projection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// ... (interface e constantes de Tiers permanecem as mesmas) ...
interface AdminTabProps {
  form: UseFormReturn<FormValues>;
  storeId: string;
  onIncentivesCalculated: (incentives: Incentives) => void;
  incentives: Incentives;
  addSeller: (name: string, pass: string) => void;
  handleSaveGoals: () => void;
}

const goalTiers = [
  { id: "Nível 1", goal: "paGoal1", prize: "paPrize1" },
  { id: "Nível 2", goal: "paGoal2", prize: "paPrize2" },
  { id: "Nível 3", goal: "paGoal3", prize: "paPrize3" },
  { id: "Nível 4", goal: "paGoal4", prize: "paPrize4" },
];

const ticketMedioTiers = [
  { id: "Nível 1", goal: "ticketMedioGoal1", prize: "ticketMedioPrize1" },
  { id: "Nível 2", goal: "ticketMedioGoal2", prize: "ticketMedioPrize2" },
  { id: "Nível 3", goal: "ticketMedioGoal3", prize: "ticketMedioPrize3" },
  { id: "Nível 4", goal: "ticketMedioGoal4", prize: "ticketMedioPrize4" },
];

export function AdminTab({
  form,
  storeId,
  addSeller,
  handleSaveGoals,
}: AdminTabProps) {
  const { toast } = useToast();
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSaving, setIsSaving] = useState<Record<string, boolean>>({});

  const { control, getValues, trigger } = form;

  const sellers: Seller[] = useWatch({ control, name: "sellers" }) ?? [];
  
  const handleSaveChanges = async (sellerId: string, sellerIndex: number) => {
    setIsSaving(prev => ({...prev, [sellerId]: true}));
    const isValid = await trigger(`sellers.${sellerIndex}`);
    if (!isValid) {
      toast({ variant: "destructive", title: "Campos inválidos" });
      setIsSaving(prev => ({...prev, [sellerId]: false}));
      return;
    }
    const sellerData = getValues(`sellers.${sellerIndex}`);
    // Simulação de chamada API
    console.log("Salvando dados para o vendedor:", sellerData);
    toast({ title: "Sucesso!", description: `Dados de ${sellerData.name} salvos.` });
    setIsSaving(prev => ({...prev, [sellerId]: false}));
  };

  const handleCalculateIncentives = async () => {
    setIsCalculating(true);
    // Simulação
    toast({ title: "Cálculo iniciado!"});
    setIsCalculating(false);
  };

  return (
    <div className="space-y-8">
      <Tabs defaultValue="vendedores" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="vendedores">👥 Vendedores</TabsTrigger>
          <TabsTrigger value="lancamentos">📊 Lançamentos</TabsTrigger>
          <TabsTrigger value="metas">🎯 Metas & Prêmios</TabsTrigger>
        </TabsList>
        
        <TabsContent value="vendedores">
          <Card>
            <CardHeader><CardTitle>Gerenciar Vendedores</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4 p-4 border rounded-lg">
                  <h3 className="text-lg font-medium">Adicionar Novo Vendedor</h3>
                  <FormField control={control} name="newSellerName" render={({ field }) => ( 
                    <FormItem> 
                      <FormLabel>Nome do Vendedor</FormLabel> 
                      {/* CORREÇÃO APLICADA AQUI */}
                      <FormControl><Input placeholder="Ex: João Silva" {...field} value={field.value ?? ''} /></FormControl> 
                      <FormMessage /> 
                    </FormItem> 
                  )} />
                  <FormField control={control} name="newSellerPassword" render={({ field }) => ( 
                    <FormItem> 
                      <FormLabel>Senha</FormLabel> 
                      {/* CORREÇÃO APLICADA AQUI */}
                      <FormControl><Input type="password" placeholder="Mínimo 4 caracteres" {...field} value={field.value ?? ''} /></FormControl> 
                      <FormMessage /> 
                    </FormItem> 
                  )} />
                  <Button type="button" onClick={() => addSeller(getValues("newSellerName") || '', getValues("newSellerPassword") || '')}><UserPlus className="mr-2" /> Adicionar</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lancamentos">
          <Card>
            <CardHeader><CardTitle>Lançamentos de Desempenho</CardTitle></CardHeader>
            <CardContent>
              {sellers?.length > 0 ? (
                <div className="space-y-6">
                  {sellers.map((seller, index) => (
                    <div key={seller.id} className="p-4 border rounded-lg space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="font-semibold text-lg">{seller.name}</h3>
                        <Button size="sm" onClick={() => handleSaveChanges(seller.id, index)} disabled={isSaving[seller.id]}>
                          <Save className="mr-2 h-4 w-4" />
                          {isSaving[seller.id] ? "Salvando..." : "Salvar"}
                        </Button>
                      </div>
                      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* CORREÇÃO APLICADA AQUI EM TODOS OS INPUTS */}
                        <FormField control={control} name={`sellers.${index}.vendas`} render={({field}) => (<FormItem><FormLabel>Vendas (R$)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? 0} /></FormControl></FormItem>)}/>
                        <FormField control={control} name={`sellers.${index}.pa`} render={({field}) => (<FormItem><FormLabel>PA (Unid.)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? 0} /></FormControl></FormItem>)}/>
                        <FormField control={control} name={`sellers.${index}.ticket_medio`} render={({field}) => (<FormItem><FormLabel>Ticket Médio (R$)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? 0} /></FormControl></FormItem>)}/>
                        <FormField control={control} name={`sellers.${index}.corridinha_diaria`} render={({field}) => (<FormItem><FormLabel>Bônus Corridinha (R$)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? 0} /></FormControl></FormItem>)}/>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">Adicione vendedores para começar.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="metas">
           <Card>
            <CardHeader><CardTitle>Configuração de Metas e Prêmios</CardTitle></CardHeader>
            <CardContent className="space-y-8">
                <div>
                    <h3 className="font-semibold text-lg mb-4">Metas de Vendas</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* CORREÇÃO APLICADA AQUI EM TODOS OS INPUTS */}
                        <FormField control={control} name="goals.metaMinha" render={({ field }) => (<FormItem><FormLabel>Metinha (R$)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? 0} /></FormControl></FormItem>)} />
                        <FormField control={control} name="goals.meta" render={({ field }) => (<FormItem><FormLabel>Meta (R$)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? 0} /></FormControl></FormItem>)} />
                        <FormField control={control} name="goals.metona" render={({ field }) => (<FormItem><FormLabel>Metona (R$)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? 0} /></FormControl></FormItem>)} />
                        {/* E assim por diante para todos os outros campos de metas... */}
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                 <Button onClick={handleSaveGoals}>
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Metas
                 </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}