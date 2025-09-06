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
  onIncentivesCalculated,
  addSeller,
  handleSaveGoals,
}: AdminTabProps) {
  const { toast } = useToast();
  const [editingSellerId, setEditingSellerId] = useState<string | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSaving, setIsSaving] = useState<Record<string, boolean>>({});

  const { control, getValues, setValue, trigger } = form;

  const rawSellers = useWatch({ control, name: "sellers" }) ?? [];
  const sellers: Seller[] = rawSellers.map((seller: any) => ({
    ...seller,
    ticketMedio: seller.ticket_medio,
    corridinhaDiaria: seller.corridinha_diaria,
  }));
  
  // Lógica para salvar dados individuais do vendedor
  const handleSaveChanges = async (sellerId: string, sellerIndex: number) => {
    setIsSaving(prev => ({...prev, [sellerId]: true}));
    const isValid = await trigger(`sellers.${sellerIndex}`);
    if (!isValid) {
      toast({ variant: "destructive", title: "Campos inválidos", description: "Verifique os dados do vendedor." });
      setIsSaving(prev => ({...prev, [sellerId]: false}));
      return;
    }
    // ... aqui viria a chamada fetch para a API ...
    console.log("Salvando dados para o vendedor:", getValues(`sellers.${sellerIndex}`));
    toast({ title: "Sucesso!", description: "Dados do vendedor salvos (simulado)." });
    setIsSaving(prev => ({...prev, [sellerId]: false}));
  };

  // Lógica para calcular incentivos
  const handleCalculateIncentives = async () => {
    setIsCalculating(true);
    // ...
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
            <CardHeader>
              <CardTitle>Gerenciar Vendedores</CardTitle>
              <CardDescription>Adicione, edite ou remova vendedores da sua equipe.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Formulário para adicionar novo vendedor */}
              <div className="space-y-4 p-4 border rounded-lg bg-card">
                  <h3 className="text-lg font-medium">Adicionar Novo Vendedor</h3>
                  <FormField control={control} name="newSellerName" render={({ field }) => ( <FormItem> <FormLabel>Nome do Vendedor</FormLabel> <FormControl><Input placeholder="Ex: João Silva" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                  <FormField control={control} name="newSellerPassword" render={({ field }) => ( <FormItem> <FormLabel>Senha</FormLabel> <FormControl><Input type="password" placeholder="Mínimo 4 caracteres" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                  <Button type="button" onClick={() => addSeller(getValues("newSellerName") || '', getValues("newSellerPassword") || '')}><UserPlus className="mr-2" /> Adicionar</Button>
              </div>
              <Separator />
               <div>
                <h3 className="text-lg font-medium mb-4">Vendedores Atuais</h3>
                <div className="space-y-2">
                  {sellers && sellers.length > 0 ? sellers.map((seller) => (
                    <div key={seller.id} className="flex items-center justify-between gap-2 p-3 rounded-lg bg-muted">
                      <span className="font-medium">{seller.name}</span>
                      {/* Botões de editar/remover */}
                    </div>
                  )) : (
                    <p className="text-muted-foreground text-sm">Nenhum vendedor cadastrado ainda.</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lancamentos">
          <Card>
            <CardHeader>
              <CardTitle>Lançamentos de Desempenho</CardTitle>
              <CardDescription>Insira os valores de Vendas, PA e Ticket Médio para cada vendedor.</CardDescription>
            </CardHeader>
            <CardContent>
              {sellers && sellers.length > 0 ? (
                <div className="space-y-6">
                  {sellers.map((seller, index) => (
                    <div key={seller.id} className="p-4 border rounded-lg space-y-4 bg-card">
                      <div className="flex justify-between items-center">
                        <h3 className="font-semibold text-lg">{seller.name}</h3>
                        <Button size="sm" onClick={() => handleSaveChanges(seller.id, index)} disabled={isSaving[seller.id]}>
                          <Save className="mr-2 h-4 w-4" />
                          {isSaving[seller.id] ? "Salvando..." : "Salvar"}
                        </Button>
                      </div>
                      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <FormField control={control} name={`sellers.${index}.vendas`} render={({field}) => (<FormItem><FormLabel>Vendas (R$)</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)}/>
                        <FormField control={control} name={`sellers.${index}.pa`} render={({field}) => (<FormItem><FormLabel>PA (Unid.)</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)}/>
                        <FormField control={control} name={`sellers.${index}.ticket_medio`} render={({field}) => (<FormItem><FormLabel>Ticket Médio (R$)</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)}/>
                        <FormField control={control} name={`sellers.${index}.corridinha_diaria`} render={({field}) => (<FormItem><FormLabel>Bônus Corridinha (R$)</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)}/>
                      </div>
                    </div>
                  ))}
                  <Separator className="my-6"/>
                  <Button onClick={handleCalculateIncentives} disabled={isCalculating}>
                    <Calculator className="mr-2" />
                    {isCalculating ? "Calculando..." : "Calcular Todos os Incentivos"}
                  </Button>
                </div>
              ) : (
                <p className="text-muted-foreground">Adicione vendedores na aba "Vendedores" para começar.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="metas">
           <Card>
            <CardHeader>
                <CardTitle>Configuração de Metas e Prêmios</CardTitle>
                <CardDescription>Defina os objetivos para Vendas, PA e Ticket Médio.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
                {/* Metas de Vendas */}
                <div>
                    <h3 className="font-semibold text-lg mb-4">Metas de Vendas e Prêmios</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <FormField control={control} name="goals.metaMinha" render={({ field }) => (<FormItem><FormLabel>Metinha (R$)</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                        <FormField control={control} name="goals.meta" render={({ field }) => (<FormItem><FormLabel>Meta (R$)</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                        <FormField control={control} name="goals.metona" render={({ field }) => (<FormItem><FormLabel>Metona (R$)</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                        <FormField control={control} name="goals.metaMinhaPrize" render={({ field }) => (<FormItem><FormLabel>Prêmio Metinha (R$)</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                        <FormField control={control} name="goals.metaPrize" render={({ field }) => (<FormItem><FormLabel>Prêmio Meta (R$)</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                        <FormField control={control} name="goals.metonaPrize" render={({ field }) => (<FormItem><FormLabel>Prêmio Metona (R$)</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                    </div>
                </div>
                {/* Metas de PA */}
                 <Separator/>
                 <div>
                    <h3 className="font-semibold text-lg mb-4">Metas de Produtos por Atendimento (PA)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-4">
                        {goalTiers.map(tier => (
                            <div key={tier.id} className="space-y-2">
                                <FormField control={control} name={`goals.${tier.goal}`} render={({field}) => (<FormItem><FormLabel>{tier.id} (PA)</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl></FormItem>)} />
                                <FormField control={control} name={`goals.${tier.prize}`} render={({field}) => (<FormItem><FormLabel>Prêmio (R$)</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                            </div>
                        ))}
                    </div>
                </div>
                {/* Metas de Ticket Médio */}
                 <Separator/>
                <div>
                    <h3 className="font-semibold text-lg mb-4">Metas de Ticket Médio</h3>
                     <div className="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-4">
                        {ticketMedioTiers.map(tier => (
                            <div key={tier.id} className="space-y-2">
                                <FormField control={control} name={`goals.${tier.goal}`} render={({field}) => (<FormItem><FormLabel>{tier.id} (R$)</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                                <FormField control={control} name={`goals.${tier.prize}`} render={({field}) => (<FormItem><FormLabel>Prêmio (R$)</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                            </div>
                        ))}
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