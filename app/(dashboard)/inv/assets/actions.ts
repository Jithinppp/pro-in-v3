'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import * as z from 'zod'

const updateAssetSchema = z.object({
  model_id: z.string().optional(),
  location_id: z.string().optional(),
  status: z.string().optional(),
  condition: z.string().optional(),
  serial_number: z.string().optional(),
  case_number: z.string().optional(),
  purchase_date: z.string().nullable().optional(),
  purchase_cost: z.coerce.number().optional(),
  warranty_expiry: z.string().nullable().optional(),
  last_maintenance: z.string().nullable().optional(),
  next_maintenance: z.string().nullable().optional(),
  description: z.string().optional(),
  weight: z.string().optional(),
  invoice_number: z.string().optional(),
  supplier_id: z.string().optional(),
})

export async function deleteAsset(id: string) {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('Unauthorized: You must be logged in to delete assets')
  }
  
  const { error } = await supabase
    .from('assets')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/inv/assets')
  return { success: true }
}

export async function updateAsset(id: string, updates: any) {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('Unauthorized: You must be logged in to update assets')
  }

  const validatedUpdates = updateAssetSchema.parse(updates)
  
  const finalUpdates = { ...validatedUpdates }
  const dateFields = ['purchase_date', 'warranty_expiry', 'last_maintenance', 'next_maintenance']
  
  dateFields.forEach(field => {
    if (finalUpdates[field as keyof typeof finalUpdates] === '') {
      (finalUpdates as any)[field] = null
    }
  })
  
  const { error } = await supabase
    .from('assets')
    .update(finalUpdates)
    .eq('id', id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/inv/assets')
  return { success: true }
}
