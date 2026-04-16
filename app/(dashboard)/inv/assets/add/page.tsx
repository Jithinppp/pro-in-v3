import { createClient } from '@/lib/supabase/server'
import { AddAssetForm } from './AddAssetForm'

export default async function AddAssetPage() {
  const supabase = await createClient()

  const [
    { data: categories },
    { data: subcategories },
    { data: models },
    { data: locations },
    { data: suppliers }
  ] = await Promise.all([
    supabase.from('categories').select('id, name, code').order('name'),
    supabase.from('subcategories').select('id, name, code, category_id').order('name'),
    supabase.from('models').select('id, name, brand, code, subcategory_id').order('name'),
    supabase.from('storage_locations').select('id, name').order('name'),
    supabase.from('suppliers').select('id, name').order('name'),
  ])

  return (
    <AddAssetForm 
      categories={categories || []}
      subcategories={subcategories || []}
      models={models || []} 
      locations={locations || []} 
      suppliers={suppliers || []}
    />
  )
}

