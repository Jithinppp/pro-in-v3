import { createClient } from '@/lib/supabase/server'
import { AddAssetForm } from './AddAssetForm'

export default async function AddAssetPage() {
  const supabase = await createClient()

  // Fetch full hierarchy (including codes) and locations for the form
  const [
    { data: categories },
    { data: subcategories },
    { data: models },
    { data: locations }
  ] = await Promise.all([
    supabase.from('categories').select('id, name, code').order('name'),
    supabase.from('subcategories').select('id, name, code, category_id').order('name'),
    supabase.from('models').select('id, name, brand, code, subcategory_id').order('name'),
    supabase.from('storage_locations').select('id, name').order('name'),
  ])

  return (
    <div className="max-w-[1000px] mx-auto pb-20">
      <AddAssetForm 
        categories={categories || []}
        subcategories={subcategories || []}
        models={models || []} 
        locations={locations || []} 
      />
    </div>
  )
}
