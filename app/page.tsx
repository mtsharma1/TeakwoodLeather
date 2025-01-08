import { fetchMonthlyData } from "@/action/csv";
import AdvancedInventoryTable from "@/components/advanced-inventory-table";

export default async function Home() {

  const result = await fetchMonthlyData(0, 0)

  return (
    <div className="container mx-auto my-10">
      <AdvancedInventoryTable data={result.rows} columnNames={result.columns} />
    </div>
  );
}
