'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addAssets(formData: {
  model_id: string
  location_id: string
  status: string
  condition: string
  case_number?: string
  purchase_date?: string
  purchase_cost?: number
  warranty_expiry?: string
  last_maintenance?: string
  next_maintenance?: string
  items: { asset_code: string; serial_number: string }[]
}) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('assets')
    .insert(
      formData.items.map(item => ({
        model_id: formData.model_id,
        location_id: formData.location_id,
        status: formData.status,
        condition: formData.condition,
        case_number: formData.case_number,
        purchase_date: formData.purchase_date || null,
        purchase_cost: formData.purchase_cost,
        warranty_expiry: formData.warranty_expiry || null,
        last_maintenance: formData.last_maintenance || null,
        next_maintenance: formData.next_maintenance || null,
        asset_code: item.asset_code,
        serial_number: item.serial_number,
      }))
    )

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/inv/assets')
  return { success: true }
}
