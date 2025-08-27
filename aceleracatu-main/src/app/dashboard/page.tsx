import { GoalGetterDashboard } from "@/components/goal-getter-dashboard";
import { Suspense } from "react";

function DashboardContent() {
    return <GoalGetterDashboard />
}

export default function DashboardPage() {
  return (
    <main>
      <Suspense fallback={<div>Carregando...</div>}>
        <DashboardContent />
      </Suspense>
    </main>
  );
}
