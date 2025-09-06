// src/lib/storage.ts
import { IncentiveProjectionOutput } from "@/ai/flows/incentive-projection";

// TIPOS DE DADOS (ainda muito úteis em toda a aplicação)
export interface Seller {
  id: string;
  name: string;
  avatarId: string;
  vendas: number;
  pa: number;
  ticketMedio: number;
  corridinhaDiaria: number;
  password?: string;
}

export interface Goals {
  metaMinha: number;
  meta: number;
  metona: number;
  metaLendaria: number;
  legendariaBonusValorVenda: number;
  legendariaBonusValorPremio: number;
  metaMinhaPrize: number;
  metaPrize: number;
  metonaPrize: number;
  paGoal1: number;
  paGoal2: number;
  paGoal3: number;
  paGoal4: number;
  paPrize1: number;
  paPrize2: number;
  paPrize3: number;
  paPrize4: number;
  ticketMedioGoal1: number;
  ticketMedioGoal2: number;
  ticketMedioGoal3: number;
  ticketMedioGoal4: number;
  ticketMedioPrize1: number;
  ticketMedioPrize2: number;
  ticketMedioPrize3: number;
  ticketMedioPrize4: number;
}

export type Incentives = Record<string, IncentiveProjectionOutput | null>;

export interface Store {
    id: string;
    name: string;
    theme_color: string; // Corrigido para corresponder ao DB
}

// O AppState pode ser útil para tipar o estado geral em componentes, se necessário.
export interface AppState {
    stores: Store[];
    sellers: Record<string, Seller[]>;
    goals: Record<string, Goals>;
    incentives: Record<string, Incentives>;
}

const defaultGoals: Goals = {
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
};

// FUNÇÃO PARA OBTER O ESTADO INICIAL (usada na criação de novas lojas na API)
export function getInitialState(): AppState {
    return {
        stores: [],
        sellers: {},
        goals: {
            'default': defaultGoals,
        },
        incentives: {},
    }
}

// As funções que interagiam com o localStorage (loadState, saveState, etc.)
// foram removidas, pois a aplicação agora utiliza a API para persistir os dados.