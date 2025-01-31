import { DashboardPage } from "@/components/dashboard/dashboard-page";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <Card className="w-full xl:max-w-[1600px] mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold capitalize">Dashboard</CardTitle>
      </CardHeader>
      <CardContent>
        <DashboardPage />
      </CardContent>
    </Card>
  );
}
