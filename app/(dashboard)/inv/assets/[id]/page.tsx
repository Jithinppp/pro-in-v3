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

  const { data: asset, error } = await supabase
    .from('assets')
    .select(`
      *,
      models(id, name, brand),
      storage_locations(id, name)
    `)
    .eq('id', id)
    .single()

  if (error || !asset) {
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
        updatedAt={new Date(asset.updated_at).toLocaleDateString('en-GB')} 
      />
    </PageContainer>
  )
}
