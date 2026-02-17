"use client"
import { Suspense } from 'react';
import CategoryDataTable from "./categories-data-table";
import { Beltcolumns, CategoryData, Jacketcolumns, KidsShoescolumns, MensShoescolumns, OtherColumns, WomensShoescolumns } from "./categories-cols";
import { useParams } from 'next/navigation';
import { categorySizeMap } from './data-table-filters';

export default function TableCard({ data }: { data: CategoryData[] }) {

  const params: { type: string } = useParams()
  const key = params.type.replaceAll('-', '').trim() as keyof typeof CATEGORY_COLUMNS;

  const CATEGORY_COLUMNS = {
    mensshoes: { col: MensShoescolumns, length: categorySizeMap.mensshoes.length },
    womenshoes: { col: WomensShoescolumns, length: categorySizeMap.womenshoes.length },
    kidsshoes: { col: KidsShoescolumns, length: categorySizeMap.kidsshoes.length },
    leatherjackets: { col: Jacketcolumns, length: categorySizeMap.leatherjackets.length },
    leathermencasualbelt: { col: Beltcolumns, length: categorySizeMap.leathermencasualbelt.length },
    othercategory: { col: OtherColumns, length: categorySizeMap.othercategory.length },
  } as const;

  const columns = CATEGORY_COLUMNS[key] || [];

  return (
    <Suspense fallback={<>Loading....</>}>
      {data.length === 0 ? (
        <div className="text-center p-4 text-gray-500">
          No data available for this category
        </div>
      ) : (
        <CategoryDataTable
          data={data}
          columns={columns.col}
          groupLength={columns.length}
          filename={key}
        />
      )}
    </Suspense>
  );
}
