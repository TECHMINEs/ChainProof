"use client"
import React from 'react'

export interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
}

export function StatCard({ title, value, icon, trend, trendUp }: StatCardProps) {
  return (
    <div className="bg-black dark:bg-[#050505] rounded-xl p-6 border border-line dark:border-line shadow-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 rounded-full bg-panel-2 dark:bg-panel-2 opacity-50 pointer-events-none" />
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">{title}</h3>
        {icon && <div className="text-neutral-400 dark:text-neutral-500">{icon}</div>}
      </div>
      <div className="flex items-baseline space-x-2">
        <p className="text-3xl font-bold text-white dark:text-white tracking-tight">{value}</p>
        {trend && (
          <span className={`text-sm font-medium ${trendUp ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {trendUp ? '↑' : '↓'} {trend}
          </span>
        )}
      </div>
    </div>
  )
}
