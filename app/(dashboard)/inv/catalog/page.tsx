import Link from 'next/link'
import { Package, Boxes, LayoutGrid, ArrowRight, Info } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { PageContainer } from '@/components/ui/PageContainer'

export default function CatalogPortal() {
  const sections = [
    {
      title: 'Global Categories',
      description: 'The highest level of taxonomy. Define broad groups like "Audio", "Lighting", or "Video".',
      href: '/inv/catalog/categories',
      icon: Package,
    },
    {
      title: 'Subcategories',
      description: 'Drill down into specific item types like "Microphones", "Movers", or "Monitors".',
      href: '/inv/catalog/subcategories',
      icon: Boxes,
    },
    {
      title: 'Product Models',
      description: 'Specific hardware specs. This is where you define brands and model numbers (e.g. Shure SM58).',
      icon: LayoutGrid,
      href: '/inv/catalog/models',
    }
  ]

  return (
    <PageContainer>
      <PageHeader 
        label="Catalog Taxonomy"
        title="Catalog Portal"
        subtitle="Organize your hardware taxonomy and model specifications with a strictly hierarchical structure."
      />

      <div className="space-y-16">
        {/* Introduction / Information Card */}
        <section className="bg-white border border-border p-8 rounded-lg max-w-3xl mx-auto space-y-4">
          <div className="flex items-center gap-4 text-charcoal">
            <div className="size-10 bg-secondary rounded-md flex items-center justify-center">
              <Info className="size-5" />
            </div>
            <h2 className="text-xl font-display font-semibold">Hierarchy Overview</h2>
          </div>
          <p className="text-mid-gray text-base font-light leading-relaxed">
            The Catalog follows a strict hierarchy. To add gear, you first need a <strong>Category</strong>, 
            which contains <strong>Subcategories</strong>, and finally the specific <strong>Models</strong> 
            to which individual assets belong.
          </p>
        </section>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {sections.map((section) => (
            <Link 
              key={section.title} 
              href={section.href}
              className="group p-8 bg-white rounded-lg border border-border hover:border-charcoal/10 transition-all flex flex-col justify-between space-y-8"
            >
              <div className="space-y-6">
                <div className="size-12 rounded-md bg-secondary flex items-center justify-center text-charcoal">
                  <section.icon className="size-6" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-display font-semibold text-charcoal group-hover:underline underline-offset-4 decoration-1">
                    {section.title}
                  </h3>
                  <p className="text-sm text-mid-gray leading-relaxed font-light">
                    {section.description}
                  </p>
                </div>
              </div>
              <div className="flex items-center text-[10px] font-semibold text-mid-gray uppercase tracking-widest group-hover:text-charcoal transition-colors">
                Manage Section
                <ArrowRight className="size-3 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>

        {/* Workflow Progression */}
        <div className="py-12 flex flex-col items-center">
          <div className="text-[10px] uppercase tracking-[0.3em] font-semibold text-mid-gray mb-10">System Workflow</div>
          <div className="flex flex-col md:flex-row items-center gap-6 text-sm">
            <div className="px-6 py-4 bg-white rounded-md text-charcoal font-medium border border-border">Categories</div>
            <ArrowRight className="size-4 text-border hidden md:block" />
            <div className="px-6 py-4 bg-white rounded-md text-charcoal font-medium border border-border">Subcategories</div>
            <ArrowRight className="size-4 text-border hidden md:block" />
            <div className="px-6 py-4 bg-white rounded-md text-charcoal font-medium border border-border">Models</div>
            <ArrowRight className="size-4 text-border hidden md:block" />
            <div className="px-6 py-4 bg-charcoal text-white rounded-md font-semibold">Physical Assets</div>
          </div>
        </div>
      </div>
    </PageContainer>
  )
}
