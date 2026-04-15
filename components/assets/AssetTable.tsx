'use client'

import React from 'react'

interface AssetTableProps {
  assets: any[]
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'AVAILABLE': return 'bg-[#ecfdf3] text-[#027a48]'
    case 'OUT': return 'bg-[#eff8ff] text-[#175cd3]'
    case 'RESERVED': return 'bg-[#fdf2fa] text-[#c11574]'
    case 'PENDING_QC': return 'bg-[#fffaeb] text-[#b54708]'
    case 'MAINTENANCE': return 'bg-[#fef3f2] text-[#b42318]'
    default: return 'bg-surface-warm text-text-secondary'
  }
}

const getConditionColor = (condition: string) => {
  switch (condition) {
    case 'EXCELLENT':
    case 'GOOD': return 'text-[#027a48]'
    case 'FAIR': return 'text-[#b54708]'
    case 'POOR':
    case 'BROKEN': return 'text-[#b42318]'
    default: return 'text-text-secondary'
  }
}

export function AssetTable({ assets }: AssetTableProps) {
  if (assets.length === 0) {
    return (
      <div className="py-16 text-center text-text-secondary bg-background border border-border-light rounded-xl">
        No assets found matching your criteria.
      </div>
    )
  }

  return (
    <div className="w-full overflow-x-auto pt-6">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-border-light text-[10px] font-bold text-text-tertiary uppercase tracking-widest">
            <th className="py-4 font-bold">SKU</th>
            <th className="py-4 font-bold">SERIAL NUMBER</th>
            <th className="py-4 font-bold">MODEL</th>
            <th className="py-4 font-bold">LOCATION</th>
            <th className="py-4 font-bold">CONDITION</th>
            <th className="py-4 font-bold">STATUS</th>
            <th className="py-4 font-bold text-right">ACTION</th>
          </tr>
        </thead>
        <tbody className="text-sm">
          {assets.map((asset) => (
            <tr key={asset.id} className="border-b border-border-light/50 hover:bg-surface-warm/50 transition-colors">
              <td className="py-5 font-semibold text-text-primary whitespace-nowrap">
                {asset.asset_code}
              </td>
              <td className="py-5 text-text-secondary">
                {asset.serial_number || '-'}
              </td>
              <td className="py-5 text-text-primary">
                {asset.models ? `${asset.models.brand} ${asset.models.name}` : '-'}
              </td>
              <td className="py-5 text-text-secondary">
                {asset.storage_locations?.name || '-'}
              </td>
              <td className={`py-5 font-medium lowercase ${getConditionColor(asset.condition)}`}>
                {asset.condition || '-'}
              </td>
              <td className="py-5">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getStatusColor(asset.status)}`}>
                  {asset.status || '-'}
                </span>
              </td>
              <td className="py-5 text-right">
                <button className="text-[12px] font-semibold text-text-tertiary hover:text-text-primary transition-colors">
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
