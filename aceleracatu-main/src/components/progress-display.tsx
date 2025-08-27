
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
  TrendingUp,
  CheckCircle,
  Award, 
  Star,
  Gift,
  Zap,
  Trophy,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "./ui/skeleton";


type RankingMetric = 'vendas' | 'pa' | 'ticketMedio' | 'corridinhaDiaria' | 'totalIncentives';

interface ProgressDisplayProps {
  salesData: {
    vendas: number;
    pa: number;
    ticketMedio: number;
    corridinhaDiaria: number;
    metaMinha: number;
    meta: number;
    metona: number;
    metaLendaria: number;
    paGoal4: number;
    ticketMedioGoal4: number;
  };
  incentives: IncentiveProjectionOutput | null;
  rankings: Record<RankingMetric, number> | null;
  loading: boolean;
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
  isCurrency = false,
}: {
  icon: React.ReactNode;
  title: string;
  currentValue: number;
  goalValue: number;
  formatValue?: (value: number) => string;
  isCurrency?: boolean;
}) => {
  const percentage = goalValue > 0 ? ((currentValue || 0) / goalValue) * 100 : 0;
  const achieved = currentValue >= goalValue;

  return (
    <div>
      <div className="flex justify-between items-baseline mb-1">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          {icon}
          <span>{title}</span>
        </div>
        <div
          className={cn(
            "font-semibold flex items-center gap-1",
            achieved && "text-green-600 dark:text-green-400"
          )}
        >
          {achieved && <CheckCircle className="w-4 h-4" />}
          <span>
            {formatValue(currentValue)} / {formatValue(goalValue)}
          </span>
        </div>
      </div>
      <Progress value={percentage} className={achieved ? "[&>div]:bg-green-500" : ""} />
    </div>
  );
};

const IncentiveItem = ({
  icon,
  label,
  value,
  achieved,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  achieved: boolean;
}) => (
  <div
    className={cn(
      "flex items-center justify-between p-3 rounded-lg transition-all",
      achieved ? "bg-green-100 dark:bg-green-900/30" : "bg-muted/50"
    )}
  >
    <div className="flex items-center gap-3">
      <div
        className={cn(
          "p-1.5 rounded-full",
          achieved
            ? "bg-green-500 text-white"
            : "bg-primary/10 text-primary"
        )}
      >
        {icon}
      </div>
      <span
        className={cn(
          "font-medium",
          achieved ? "text-green-800 dark:text-green-300" : "text-muted-foreground"
        )}
      >
        {label}
      </span>
    </div>
    <div className="flex items-center gap-2">
      {achieved && <CheckCircle className="w-5 h-5 text-green-500" />}
      <span
        className={cn(
          "font-semibold text-lg",
          achieved ? "text-green-600 dark:text-green-400" : "text-foreground"
        )}
      >
        {formatCurrency(value)}
      </span>
    </div>
  </div>
);

const RankingItem = ({ title, rank }: { title: string; rank?: number }) => {
  const getRankColor = (r?: number) => {
    if (r === 1) return "text-amber-500";
    if (r === 2) return "text-slate-500";
    if (r === 3) return "text-amber-700";
    return "text-muted-foreground";
  };

  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
        <span className="font-medium text-muted-foreground">{title}</span>
        <div className="flex items-center gap-2">
            <Trophy className={cn("w-5 h-5", getRankColor(rank))} />
            <span className={cn("font-bold text-xl", getRankColor(rank))}>
                {rank ? `${rank}º` : "-"}
            </span>
        </div>
    </div>
  )
};

const SalesGoalDetail = ({ label, goal, current, prize }: {label: string; goal: number; current: number; prize: number;}) => {
    const achieved = current >= goal;
    return (
        <div className={cn("flex justify-between items-center p-2 rounded-md", achieved ? "bg-green-100/80 dark:bg-green-900/30" : "")}>
            <div className="flex items-center gap-2">
                {achieved ? <CheckCircle className="w-5 h-5 text-green-500"/> : <Target className="w-5 h-5 text-muted-foreground"/>}
                <div>
                    <p className={cn("font-semibold", achieved && "text-green-700 dark:text-green-300")}>{label}</p>
                    <p className="text-xs text-muted-foreground">{formatCurrency(current)} / {formatCurrency(goal)}</p>
                </div>
            </div>
            <p className={cn("font-bold text-lg", achieved ? "text-green-600 dark:text-green-400" : "text-muted-foreground")}>{formatCurrency(prize)}</p>
        </div>
    )
}

export function ProgressDisplay({ salesData, incentives, rankings, loading }: ProgressDisplayProps) {
  const {
    vendas,
    pa,
    ticketMedio,
    corridinhaDiaria,
    metaMinha,
    meta,
    metona,
    metaLendaria,
    paGoal4,
    ticketMedioGoal4,
  } = salesData;

  const salesPercentage = metaLendaria > 0 ? (vendas / metaLendaria) * 100 : 0;
  
  const totalIncentives = incentives
    ? (incentives.metinhaPremio || 0) +
      (incentives.metaPremio || 0) +
      (incentives.metonaPremio || 0) +
      (incentives.legendariaBonus || 0) +
      (incentives.paBonus || 0) +
      (incentives.ticketMedioBonus || 0) +
      (incentives.corridinhaDiariaBonus || 0)
    : 0;

  const renderSkeletons = () => (
     <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-12 w-1/4" />
      </div>
       <Separator/>
      <div className="space-y-2 pt-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  );

  return (
    <Card className="shadow-lg border-2 border-transparent has-[[data-achieved=true]]:border-green-500 transition-all">
      <CardHeader>
        <CardTitle>Dashboard de Progresso e Incentivos</CardTitle>
        <CardDescription>
          Sua jornada para o sucesso em tempo real.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6" data-achieved={totalIncentives > 0}>
        <div>
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-6 h-6 text-primary" />
            <h3 className="text-lg font-semibold">Progresso de Vendas</h3>
          </div>
          <div className="relative pt-6">
            <Progress value={salesPercentage} className="h-4" />
            {metaLendaria > 0 && (
              <>
                <div
                  className="absolute top-0 h-full border-r-2 border-dashed border-foreground/20"
                  style={{ left: `${(metaMinha / metaLendaria) * 100}%` }}
                  title={`Metinha: ${formatCurrency(metaMinha)}`}
                >
                  <span className="absolute -top-6 -translate-x-1/2 text-xs font-bold text-muted-foreground">Metinha</span>
                </div>
                <div
                  className="absolute top-0 h-full border-r-2 border-dashed border-foreground/20"
                  style={{ left: `${(meta / metaLendaria) * 100}%` }}
                  title={`Meta: ${formatCurrency(meta)}`}
                >
                  <span className="absolute -top-6 -translate-x-1/2 text-xs font-bold text-muted-foreground">Meta</span>
                </div>
                <div
                  className="absolute top-0 h-full border-r-2 border-dashed border-foreground/20"
                  style={{ left: `${(metona / metaLendaria) * 100}%` }}
                  title={`Metona: ${formatCurrency(metona)}`}
                >
                  <span className="absolute -top-6 -translate-x-1/2 text-xs font-bold text-muted-foreground">Metona</span>
                </div>
                <div
                  className="absolute top-0 h-full"
                  style={{ left: `100%` }}
                  title={`Lendária: ${formatCurrency(metaLendaria)}`}
                >
                  <span className="absolute -top-6 -translate-x-1/2 text-xs font-bold text-muted-foreground">Lendária</span>
                </div>
              </>
            )}
          </div>
          <div className="text-right mt-2 font-bold text-lg text-primary">
            {formatCurrency(vendas)} / {formatCurrency(metaLendaria)}
          </div>
        </div>
        
        {loading ? (
            <div className="space-y-2"><Skeleton className="h-8 w-full" /><Skeleton className="h-8 w-full" /><Skeleton className="h-8 w-full" /></div>
        ) : incentives && (
            <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
                <h3 className="font-semibold text-center text-muted-foreground mb-2">Detalhes dos Prêmios de Vendas</h3>
                <SalesGoalDetail label="Prêmio Metinha" goal={metaMinha} current={vendas} prize={incentives.metinhaPremio} />
                <SalesGoalDetail label="Prêmio Meta" goal={meta} current={vendas} prize={incentives.metaPremio} />
                <SalesGoalDetail label="Prêmio Metona" goal={metona} current={vendas} prize={incentives.metonaPremio} />
                <SalesGoalDetail label="Bônus Lendária" goal={metaLendaria} current={vendas} prize={incentives.legendariaBonus} />
            </div>
        )}

        <div className="grid sm:grid-cols-1 gap-6 pt-4">
          <ProgressItem
            icon={<Package className="w-5 h-5" />}
            title="Produtos por Atendimento (PA)"
            currentValue={pa}
            goalValue={paGoal4}
            formatValue={(v) => (typeof v === 'number' ? v.toFixed(2) : Number(v || 0).toFixed(2))}
          />
          <ProgressItem
            icon={<Ticket className="w-5 h-5" />}
            title="Ticket Médio"
            currentValue={ticketMedio}
            goalValue={ticketMedioGoal4}
            formatValue={formatCurrency}
            isCurrency
          />
          <ProgressItem
            icon={<TrendingUp className="w-5 h-5" />}
            title="Corridinha Diária"
            currentValue={corridinhaDiaria}
            goalValue={corridinhaDiaria}
            formatValue={formatCurrency}
            isCurrency
          />
        </div>

        {rankings && (
            <>
                <Separator />
                <div>
                     <div className="flex items-center gap-2 mb-4">
                        <Trophy className="w-6 h-6 text-primary" />
                        <h3 className="text-lg font-semibold">Ranking Geral</h3>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                        <RankingItem title="Vendas" rank={rankings.vendas} />
                        <RankingItem title="PA" rank={rankings.pa} />
                        <RankingItem title="Ticket Médio" rank={rankings.ticketMedio} />
                        <RankingItem title="Corridinha" rank={rankings.corridinhaDiaria} />
                        <RankingItem title="Incentivos" rank={rankings.totalIncentives} />
                    </div>
                </div>
            </>
        )}

        <Separator/>

        <div className="pt-4">
          {loading ? (
            renderSkeletons()
          ) : incentives ? (
            <div className="space-y-4">
              <div className="bg-primary/10 dark:bg-primary/20 p-4 rounded-lg flex justify-between items-center">
                <span className="font-bold text-primary text-lg">
                  Ganho Total
                </span>
                <span className="text-3xl font-bold text-primary">
                  {formatCurrency(totalIncentives)}
                </span>
              </div>
              
              <div className="space-y-2 pt-4">
                 <h3 className="font-semibold text-center text-muted-foreground mb-4">Detalhes dos Outros Prêmios</h3>
                <IncentiveItem
                  icon={<Gift className="w-5 h-5" />}
                  label="Bônus PA"
                  value={incentives.paBonus}
                  achieved={incentives.paBonus > 0}
                />
                <IncentiveItem
                  icon={<Gift className="w-5 h-5" />}
                  label="Bônus Ticket Médio"
                  value={incentives.ticketMedioBonus}
                  achieved={incentives.ticketMedioBonus > 0}
                />
                <IncentiveItem
                  icon={<Zap className="w-5 h-5" />}
                  label="Bônus Corridinha Diária"
                  value={incentives.corridinhaDiariaBonus}
                  achieved={incentives.corridinhaDiariaBonus > 0}
                />
              </div>
            </div>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              <Award className="mx-auto h-12 w-12" />
              <p className="mt-4">
                Clique em "Salvar Metas e Calcular" no painel de admin para ver seus incentivos.
              </p>
            </div>
          )}
        </div>


      </CardContent>
    </Card>
  );
}
