'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import toast from 'react-hot-toast'

const reportDamageSchema = z.object({
  assetId: z.string().uuid(),
  description: z.string().min(1, 'Description of damage is required'),
})

const completeMaintenanceSchema = z.object({
  logId: z.string().uuid(),
  assetId: z.string().uuid(),
  resolution: z.string().min(1, 'Resolution is required'),
  cost: z.coerce.number().optional(),
  partsReplaced: z.string().optional(),
  nextMaintenance: z.string().nullable().optional(),
})

export async function reportDamage(formData: unknown) {
  const supabase = await createClient()
  
  try {
    const validated = reportDamageSchema.parse(formData)
    
    // 1. Create the maintenance log entry
    const { error: logError } = await supabase
      .from('maintenance_logs')
      .insert([{
        asset_id: validated.assetId,
        service_date: new Date().toISOString().split('T')[0],
        description: validated.description,
      }])
    
    if (logError) throw logError

    // 2. Update asset status to MAINTENANCE
    const { error: assetError } = await supabase
      .from('assets')
      .update({ status: 'MAINTENANCE' })
      .eq('id', validated.assetId)
    
    if (assetError) throw assetError

    revalidatePath('/inv/assets')
    return { success: true }
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to report damage' }
  }
}

export async function completeMaintenance(formData: unknown) {
  const supabase = await createClient()
  
  try {
    const validated = completeMaintenanceSchema.parse(formData)
    
    // 1. Update the maintenance log entry
    const { error: logError } = await supabase
      .from('maintenance_logs')
      .update({
        description: validated.resolution, // Update description with the resolution
        cost: validated.cost,
        parts_replaced: validated.partsReplaced,
      })
      .eq('id', validated.logId)
    
    if (logError) throw logError

    // 2. Update asset: status -> AVAILABLE, dates -> updated
    const { error: assetError } = await supabase
      .from('assets')
      .update({ 
        status: 'AVAILABLE',
        last_maintenance: new Date().toISOString().split('T')[0],
        next_maintenance: validated.nextMaintenance || null
      })
      .eq('id', validated.assetId)
    
    if (assetError) throw assetError

    revalidatePath('/inv/assets')
    revalidatePath('/tech/maintenance')
    return { success: true }
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to complete maintenance' }
  }
}
