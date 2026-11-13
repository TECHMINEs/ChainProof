"use client"
import React from 'react'

export function TopBar() {
  return (
    <header className="h-16 bg-black dark:bg-[#050505] border-b border-line dark:border-line flex items-center justify-between px-6 z-10">
      <div className="flex items-center md:hidden">
        <span className="text-xl font-bold dark:text-white">ChainProof</span>
      </div>
      <div className="hidden md:block">
        {/* Breadcrumbs or page title could go here */}
      </div>
      <div className="flex items-center space-x-4">
        <button className="p-2 text-neutral-400 hover:text-neutral-500 dark:hover:text-neutral-300 relative">
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-line"></span>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </button>
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-panel-2 text-white dark:bg-panel-2 dark:text-white flex items-center justify-center font-bold">
            U
          </div>
        </div>
      </div>
    </header>
  )
}
