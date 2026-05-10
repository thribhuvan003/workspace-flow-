import { PageLoader } from "@/components/ui/loading-spinner";

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <PageLoader />
    </div>
  );
}
