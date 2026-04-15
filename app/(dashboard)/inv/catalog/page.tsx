import Link from 'next/link'
import { Package, Boxes, LayoutGrid, ArrowRight, Info } from 'lucide-react'

export default function CatalogPortal() {
  const sections = [
    {
      title: 'Global Categories',
      description: 'The highest level of taxonomy. Define broad groups like "Audio", "Lighting", or "Video".',
      href: '/inv/catalog/categories',
      icon: Package,
      color: 'text-amber-600',
      bg: 'bg-amber-50'
    },
    {
      title: 'Subcategories',
      description: 'Drill down into specific item types like "Microphones", "Movers", or "Monitors".',
      href: '/inv/catalog/subcategories',
      icon: Boxes,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      title: 'Product Models',
      description: 'Specific hardware specs. This is where you define brands and model numbers (e.g. Shure SM58).',
      icon: LayoutGrid,
      href: '/inv/catalog/models',
      color: 'text-emerald-600',
      bg: 'bg-emerald-50'
    }
  ]

  return (
    <div className="space-y-12 animate-fade-up max-w-[1200px] mx-auto pb-12 px-4 md:px-0">
      {/* Header */}
      <div className="space-y-1">
        <div className="inline-flex items-center px-3 py-1 bg-white border border-border-light rounded-full text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-4">
          INVENTORY SYSTEM
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-text-primary underline decoration-border-light decoration-4 underline-offset-8">Catalog Portal</h1>
        <p className="text-text-secondary text-sm">Organize your hardware taxonomy and model specifications.</p>
      </div>

      {/* Introduction */}
      <section className="bg-surface-warm/50 border border-border-light p-8 rounded-3xl space-y-4">
        <div className="flex items-center gap-3 text-text-primary">
          <span className="w-10 h-10 bg-white border border-border-light rounded-xl flex items-center justify-center">
            <Info className="w-5 h-5 text-action-primary" />
          </span>
          <h2 className="text-lg font-bold">Understanding the Taxonomy</h2>
        </div>
        <p className="text-text-secondary text-sm leading-relaxed max-w-2xl">
          The Catalog follows a strict hierarchy to keep your inventory organized. 
          To add a new piece of gear, you first need a <strong>Category</strong>, 
          which then contains <strong>Subcategories</strong>, and finally 
          the specific <strong>Models</strong> that hardware belongs to.
        </p>
      </section>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {sections.map((section) => (
          <Link 
            key={section.title} 
            href={section.href}
            className="group p-6 bg-white border border-border-light rounded-2xl hover:border-action-primary transition-all hover:bg-surface-warm/30 flex flex-col justify-between space-y-6 shadow-none"
          >
            <div className="space-y-4">
              <div className={`w-12 h-12 rounded-xl ${section.bg} flex items-center justify-center ${section.color}`}>
                <section.icon className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-text-primary group-hover:text-action-primary transition-colors">
                  {section.title}
                </h3>
                <p className="text-xs text-text-tertiary leading-relaxed">
                  {section.description}
                </p>
              </div>
            </div>
            <div className="flex items-center text-[10px] font-bold text-text-tertiary uppercase tracking-widest group-hover:text-action-primary transition-colors">
              Manage Section
              <ArrowRight className="w-3 h-3 ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ))}
      </div>

      {/* Workflow Diagram */}
      <div className="py-8 flex flex-col items-center justify-center">
        <div className="text-[10px] font-bold text-text-tertiary uppercase tracking-[0.2em] mb-8">Creation Workflow</div>
        <div className="flex flex-col md:flex-row items-center gap-4 text-xs font-bold text-text-secondary">
          <div className="px-5 py-3 bg-white border border-border-light rounded-lg">1. Create Category</div>
          <ArrowRight className="w-4 h-4 text-border-light hidden md:block" />
          <div className="px-5 py-3 bg-white border border-border-light rounded-lg">2. Create Subcategory</div>
          <ArrowRight className="w-4 h-4 text-border-light hidden md:block" />
          <div className="px-5 py-3 bg-white border border-border-light rounded-lg">3. Create Model</div>
          <ArrowRight className="w-4 h-4 text-border-light hidden md:block" />
          <div className="px-5 py-3 bg-action-primary text-white border border-action-primary rounded-lg">4. Add Physical Asset</div>
        </div>
      </div>
    </div>
  )
}
