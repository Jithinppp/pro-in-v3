import { createClient } from '@/lib/supabase/server'
import { AssetSearch } from '@/components/assets/AssetSearch'
import { AssetFilters } from '@/components/assets/AssetFilters'
import { AssetTable } from '@/components/assets/AssetTable'
import { Pagination } from '@/components/assets/Pagination'
import { PlusCircle, ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { PageContainer } from '@/components/ui/PageContainer'
import { PageHeader } from '@/components/ui/PageHeader'

export default async function AssetsPage(props: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  const searchParams = await props.searchParams
  const supabase = await createClient()

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
      <div className="mb-12">
        <Link 
          href="/inv" 
          className="inline-flex items-center text-xs font-semibold text-mid-gray hover:text-charcoal uppercase tracking-widest transition-colors mb-4 group"
        >
          <ChevronLeft className="size-4 mr-1 group-hover:-translate-x-1 transition-transform" />
          Dashboard
        </Link>
        <PageHeader 
          label="Inventory Control"
          title="Asset Management"
          subtitle={`${count || 0} unique items registered in your global database.`}
          className="!mb-0 !items-start !text-left"
          actions={
            <Link href="/inv/assets/add">
              <Button className="h-11 px-6 flex items-center gap-3 group">
                <PlusCircle className="size-4 transition-transform group-hover:rotate-90 duration-300" />
                Add New Asset
              </Button>
            </Link>
          }
        />
      </div>

      <div className="space-y-16">
        {/* Search & Refinement */}
        <section className="space-y-10 p-10 bg-white border border-border rounded-lg">
          <AssetSearch />
          <AssetFilters 
            categories={categories || []}
            subcategories={subcategories || []}
            models={mappedModels}
            locations={locations || []}
          />
        </section>

        {/* Listings Section */}
        <section className="space-y-8">
          <div className="flex items-center gap-4">
            <h2 className="text-[10px] font-bold text-mid-gray uppercase tracking-[0.3em] whitespace-nowrap">Asset Records</h2>
            <div className="h-px w-full bg-border"></div>
          </div>
          
          <AssetTable assets={assets || []} />

          <Pagination 
            totalCount={count || 0} 
            pageSize={pageSize} 
            currentPage={page} 
          />
        </section>
      </div>
    </PageContainer>
  )
}

