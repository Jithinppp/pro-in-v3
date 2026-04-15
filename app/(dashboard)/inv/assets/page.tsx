import { createClient } from '@/lib/supabase/server'
import { AssetSearch } from '@/components/assets/AssetSearch'
import { AssetFilters } from '@/components/assets/AssetFilters'
import { AssetTable } from '@/components/assets/AssetTable'
import { Pagination } from '@/components/assets/Pagination'
import { PlusCircle } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { PageContainer } from '@/components/ui/PageContainer'
import { PageHeader } from '@/components/ui/PageHeader'

export default async function AssetsPage(props: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  const searchParams = await props.searchParams
  const supabase = await createClient()

  // ... (rest of data fetching logic)
  const [{ data: categories }, { data: subcategories }, { data: models }, { data: locations }] = await Promise.all([
    supabase.from('categories').select('id, name').order('name'),
    supabase.from('subcategories').select('id, name').order('name'),
    supabase.from('models').select('id, name, brand').order('name'),
    supabase.from('storage_locations').select('id, name').order('name'),
  ])

  const mappedModels = (models || []).map(m => ({ id: m.id, name: `${m.brand} ${m.name}` }))
  const q = searchParams.q || ''
  const categoryId = searchParams.category || ''
  const subcategoryId = searchParams.subcategory || ''
  const modelId = searchParams.model || ''
  const locationId = searchParams.location || ''
  const status = searchParams.status || ''
  const condition = searchParams.condition || ''
  const page = parseInt(searchParams.page || '1')
  const pageSize = 50
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from('assets')
    .select(`
      *,
      models!inner(id, name, brand, subcategory_id, subcategories(category_id)),
      storage_locations(name)
    `, { count: 'exact' })

  if (q) query = query.or(`asset_code.ilike.%${q}%,serial_number.ilike.%${q}%`)
  if (modelId) query = query.eq('model_id', modelId)
  if (subcategoryId) query = query.eq('models.subcategory_id', subcategoryId)
  if (categoryId) query = query.eq('models.subcategories.category_id', categoryId)
  if (locationId) query = query.eq('location_id', locationId)
  if (status) query = query.eq('status', status)
  if (condition) query = query.eq('condition', condition)

  const { data: assets, count } = await query
    .order('created_at', { ascending: false })
    .range(from, to)

  return (
    <PageContainer>
      <PageHeader 
        label="Inventory"
        title="Asset Management"
        subtitle={`${count || 0} unique assets currently tracked in system.`}
        actions={
          <Link href="/inv/assets/add">
            <Button className="flex items-center gap-2 group">
              <PlusCircle className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
              Add Asset
            </Button>
          </Link>
        }
      />

      <div className="space-y-10">
        <AssetSearch />
        <AssetFilters 
          categories={categories || []}
          subcategories={subcategories || []}
          models={mappedModels}
          locations={locations || []}
        />
      </div>

      {/* Data Table */}
      <AssetTable assets={assets || []} />

      {/* Pagination */}
      <Pagination 
        totalCount={count || 0} 
        pageSize={pageSize} 
        currentPage={page} 
      />
    </PageContainer>
  )
}
