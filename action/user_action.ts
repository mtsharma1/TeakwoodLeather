'use server'

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { Prisma } from "@prisma/client"

// Create a Zod schema that automatically matches your Prisma model
// We create a partial schema since we're doing updates (all fields optional except id)
const MonthDataItemSchema = z.object({
  id: z.string(),
}).merge(
  z.object(
    Object.fromEntries(
      Object.entries(Prisma.MonthDataItemScalarFieldEnum)
        .filter(([key]) => key !== 'id')
        .map(([key]) => [key, z.string().optional().nullable()])
    )
  )
);

export type UpdateMonthDataInput = z.infer<typeof MonthDataItemSchema>;

function normalizeData(data: Record<string, unknown>): UpdateMonthDataInput {
  const { id, ...rest } = data as { id: number }; // Ensure `id` is extracted as a number
  const normalized: Record<string, string | number | null | undefined> = { id };

  for (const [key, value] of Object.entries(rest)) {
    const words = key.split(" ").map((word, index) =>
      index === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1)
    );

    const formattedKey = words.join("") as keyof UpdateMonthDataInput;

    normalized[formattedKey] = value as string | null | undefined;
  }

  return normalized as UpdateMonthDataInput;
}

export async function updateMonthDataItem(
  data: UpdateMonthDataInput,
  path: string
): Promise<{ success: boolean; data?: Awaited<ReturnType<typeof prisma.monthDataItem.update>>; error?: string; details?: z.ZodIssue[] }> {
  try {
    const validatedData = MonthDataItemSchema.parse(normalizeData(data));

    const { id, ...updateData } = validatedData;

    if (path === '/monthly-report/analysis/under-stock') {
      await prisma.monthDataItem.update({
        where: { id: Number(id) },
        data: updateData,
      });
    }
    if (path === '/price-checklist/stop') {
      await prisma.priceCheckData.update({
        where: { id: Number(id) },
        data: updateData,
      });
    }


    revalidatePath(path);

    return { success: true };
  } catch (error) {
    console.error("Failed to update month data item:", JSON.stringify(error));

    if (error instanceof z.ZodError) {
      return { success: false, error: "Validation error", details: error.errors };
    }

    return { success: false, error: "Failed to update item" };
  }
}


export async function getProductImageBySKU(sku: string) {
  return await prisma.productWithImage.findFirst({
    where: {
      OR: [

        { parent_sku: sku },
        { product_code: sku }
      ]
    },
    select: {
      image_urls: true
    }
  })

}