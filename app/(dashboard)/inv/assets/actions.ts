'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function deleteAsset(id: string) {
  const supabase = await createClient()
  
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
  
  const { error } = await supabase
    .from('assets')
    .update(updates)
    .eq('id', id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/inv/assets')
  return { success: true }
}
