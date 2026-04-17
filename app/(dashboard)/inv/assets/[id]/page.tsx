import { createClient } from '@/lib/supabase/server'
import { PageContainer } from '@/components/ui/PageContainer'
import { PageHeader } from '@/components/ui/PageHeader'
import { AssetDetailView } from '@/components/assets/AssetDetailView'
import { notFound } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'

export default async function AssetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [
    { data: asset },
    { data: locations },
    { data: suppliers }
  ] = await Promise.all([
    supabase
      .from('assets')
      .select(`
        *,
        models(
          id, 
          name, 
          brand, 
          subcategories(
            id, 
            name, 
            categories(id, name)
          )
        ),
        storage_locations(id, name),
        suppliers(id, name, contact_name, email, phone)
      `)
      .eq('id', id)
      .single(),
    supabase.from('storage_locations').select('id, name').order('name'),
    supabase.from('suppliers').select('id, name').order('name'),
  ])

  if (!asset) {
    notFound()
  }

  return (
    <PageContainer>
      <div className="mb-12">
        <Link 
          href="/inv/assets" 
          className="inline-flex items-center text-xs font-semibold text-mid-gray hover:text-charcoal uppercase tracking-widest transition-colors mb-4 group"
        >
          <ChevronLeft className="size-4 mr-1 group-hover:-translate-x-1 transition-transform" />
          Back to Assets
        </Link>
        <PageHeader 
          label="Inventory Control"
          title={asset.asset_code}
          subtitle={`Detailed record for ${asset.models?.brand} ${asset.models?.name} — ${asset.serial_number || 'No Serial'}`}
          className="!mb-0 !items-start !text-left"
        />
      </div>

      <AssetDetailView 
        asset={asset} 
        locations={locations || []}
        suppliers={suppliers || []}
        updatedAt={new Date(asset.updated_at).toLocaleDateString('en-GB')} 
      />
    </PageContainer>
  )
}
