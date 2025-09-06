
"use client";

import type { IncentiveProjectionOutput } from "@/ai/flows/incentive-projection";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  DollarSign,
  Package,
  Ticket,
  Award,
  Target,
  Rocket
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Goals, Seller } from "@/lib/storage";


type ProgressDisplaySalesData = Partial<Seller> & {
    goals: Goals;
};

interface ProgressDisplayProps {
  salesData: ProgressDisplaySalesData;
  incentives: IncentiveProjectionOutput | null;
  rankings: Record<string, number> | null;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value || 0);

const ProgressItem = ({
  icon,
  title,
  currentValue,
  goalValue,
  formatValue = (v) => v.toString(),
}: {
  icon?: React.ReactNode;
  title: string;
  currentValue: number;
  goalValue: number;
  formatValue?: (value: number) => string;
}) => {
  const percentage = goalValue > 0 ? Math.min((Number(currentValue) / goalValue) * 100, 100) : 0;
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-baseline">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          {icon}
          <span>{title}</span>
        </div>
        <div className="font-semibold flex items-center gap-1 text-sm">
          <span>
            {formatValue(Number(currentValue))} / {formatValue(goalValue)}
          </span>
        </div>
      </div>
       <Progress value={percentage} />
    </div>
  );
};

const MetricCard = ({ title, value, icon, description }: { title: string, value: string, icon: React.ReactNode, description: string }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            {icon}
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
            <p className="text-xs text-muted-foreground">{description}</p>
        </CardContent>
    </Card>
);

const GoalDetail = ({ label, prize, achieved }: { label: string, prize: number, achieved: boolean }) => (
     <div className={cn("flex justify-between items-center p-3 rounded-lg", achieved ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300" : "bg-muted/50")}>
        <p className="font-medium">{label}</p>
        <p className={cn("font-bold text-lg", achieved ? "text-green-600 dark:text-green-400" : "text-muted-foreground")}>{formatCurrency(prize)}</p>
    </div>
)

const TargetGoalItem = ({ label, value }: { label: string; value: string }) => (
    <div className="flex justify-between items-center text-sm">
        <p className="text-muted-foreground">{label}</p>
        <p className="font-semibold text-foreground">{value}</p>
    </div>
);


export function ProgressDisplay({ salesData, incentives, rankings }: ProgressDisplayProps) {
  const {
    vendas = 0,
    pa = 0,
    ticketMedio = 0,
    corridinhaDiaria = 0,
    goals,
  } = salesData;
  
  if (!goals) {
    return <div className="p-4">Carregando metas...</div>;
  }

  const totalIncentives = incentives
    ? Object.values(incentives).reduce((sum, val) => sum + (val || 0), 0)
    : 0;

  return (
    <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
             <Card className="col-span-1 md:col-span-2 lg:col-span-4 bg-primary text-primary-foreground">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-base font-semibold">Ganho Total Projetado</CardTitle>
                    <Award className="h-5 w-5 text-primary-foreground/80" />
                </CardHeader>
                <CardContent>
                    <div className="text-4xl font-bold">{formatCurrency(totalIncentives)}</div>
                    <p className="text-xs text-primary-foreground/80">Soma de todos os prêmios e bônus alcançados.</p>
                </CardContent>
            </Card>
            <MetricCard 
                title="Vendas Realizadas" 
                value={formatCurrency(vendas)} 
                icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
                description="Total vendido no período"
            />
            <MetricCard
                title="Produtos por Atendimento (PA)"
                value={String(Number(pa || 0).toFixed(2))}
                icon={<Package className="h-4 w-4 text-muted-foreground" />}
                description="Média de itens por venda"
            />
            <MetricCard 
                title="Ticket Médio" 
                value={formatCurrency(ticketMedio)} 
                icon={<Ticket className="h-4 w-4 text-muted-foreground" />}
                description="Valor médio por venda"
            />
            <MetricCard 
                title="Bônus Corridinha" 
                value={formatCurrency(corridinhaDiaria)} 
                icon={<Rocket className="h-4 w-4 text-muted-foreground" />}
                description="Bônus diário direto"
            />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1">
                <CardHeader>
                     <CardTitle className="text-xl">Progresso das Metas</CardTitle>
                    <CardDescription>Veja o quão perto você está de bater suas metas.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <ProgressItem title="Meta de Vendas" currentValue={vendas} goalValue={goals.metaLendaria} formatValue={formatCurrency}/>
                    </div>
                    <Separator className="my-4" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                         <ProgressItem title="Meta PA" currentValue={pa || 0} goalValue={goals.paGoal4} formatValue={(v) => Number(v || 0).toFixed(2)}/>
                         <ProgressItem title="Meta Ticket Médio" currentValue={ticketMedio || 0} goalValue={goals.ticketMedioGoal4} formatValue={formatCurrency}/>
                    </div>
                </CardContent>
            </Card>
             <Card className="lg:col-span-1">
                <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                        <Target /> Suas Metas
                    </CardTitle>
                    <CardDescription>Valores a serem alcançados para os prêmios.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div>
                        <h4 className="font-semibold mb-2 text-sm">Metas de Vendas</h4>
                        <div className="space-y-2 text-sm">
                            <TargetGoalItem label="Metinha" value={formatCurrency(goals.metaMinha)} />
                            <TargetGoalItem label="Meta" value={formatCurrency(goals.meta)} />
                            <TargetGoalItem label="Metona" value={formatCurrency(goals.metona)} />
                            <TargetGoalItem label="Lendária" value={formatCurrency(goals.metaLendaria)} />
                        </div>
                    </div>
                    <Separator />
                     <div>
                        <h4 className="font-semibold mb-2 text-sm">Metas de PA</h4>
                         <div className="space-y-2 text-sm">
                            <TargetGoalItem label="Nível 1" value={goals.paGoal1.toFixed(2)} />
                            <TargetGoalItem label="Nível 2" value={goals.paGoal2.toFixed(2)} />
                            <TargetGoalItem label="Nível 3" value={goals.paGoal3.toFixed(2)} />
                            <TargetGoalItem label="Nível 4" value={goals.paGoal4.toFixed(2)} />
                        </div>
                    </div>
                     <Separator />
                     <div>
                        <h4 className="font-semibold mb-2 text-sm">Metas de Ticket Médio</h4>
                         <div className="space-y-2 text-sm">
                            <TargetGoalItem label="Nível 1" value={formatCurrency(goals.ticketMedioGoal1)} />
                            <TargetGoalItem label="Nível 2" value={formatCurrency(goals.ticketMedioGoal2)} />
                            <TargetGoalItem label="Nível 3" value={formatCurrency(goals.ticketMedioGoal3)} />
                            <TargetGoalItem label="Nível 4" value={formatCurrency(goals.ticketMedioGoal4)} />
                        </div>
                    </div>
                </CardContent>
            </Card>
            <Card className="lg:col-span-1">
                <CardHeader>
                     <CardTitle className="text-xl">Resumo de Ganhos</CardTitle>
                    <CardDescription>Seus prêmios e bônus detalhados.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    <GoalDetail label="Prêmio Metinha" prize={incentives?.metinhaPremio || 0} achieved={(incentives?.metinhaPremio || 0) > 0} />
                    <GoalDetail label="Prêmio Meta" prize={incentives?.metaPremio || 0} achieved={(incentives?.metaPremio || 0) > 0} />
                    <GoalDetail label="Prêmio Metona" prize={incentives?.metonaPremio || 0} achieved={(incentives?.metonaPremio || 0) > 0} />
                    <GoalDetail label="Bônus Lendária" prize={incentives?.legendariaBonus || 0} achieved={(incentives?.legendariaBonus || 0) > 0} />
                    <Separator/>
                    <GoalDetail label="Bônus PA" prize={incentives?.paBonus || 0} achieved={(incentives?.paBonus || 0) > 0} />
                    <GoalDetail label="Bônus Ticket Médio" prize={incentives?.ticketMedioBonus || 0} achieved={(incentives?.ticketMedioBonus || 0) > 0} />
                    <GoalDetail label="Bônus Corridinha" prize={incentives?.corridinhaDiariaBonus || 0} achieved={(incentives?.corridinhaDiariaBonus || 0) > 0} />
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
