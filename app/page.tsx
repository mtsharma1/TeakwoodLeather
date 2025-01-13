"use client"
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter()
  useEffect(() => {
    router.push('/analysis/understock')
  }, [])

  // const result = await fetchMonthlyData(0, 0)

  return (
    <div className="container mx-auto my-10">
      {/* <AdvancedInventoryTable data={result.rows} columnNames={result.columns} /> */}
    </div>
  );
}
