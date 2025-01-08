
import { fetchMonthlyData, fetchSalesData } from '@/action/csv'
import AdvancedInventoryTable from './advanced-inventory-table'

const DataTable: React.FC = async () => {
  const result = await fetchMonthlyData(0,5000)

  return (
    <div className="container mx-auto p-4">
      <AdvancedInventoryTable
        data={result.rows}
        columnNames={result.columns || []}
      />
    </div>
  )
}

export default DataTable