"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Save, Upload, Download, Settings, Database } from "lucide-react"

interface DashboardHeaderProps {
  onImportDataset?: () => void
  onExportResults?: () => void
  hasResults?: boolean
}

export function DashboardHeader({ onImportDataset, onExportResults, hasResults }: DashboardHeaderProps) {
  return (
    <header className="border-b bg-white px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold text-gray-900">Airfoil Optimization Tool</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input placeholder="Search airfoils..." className="pl-9 w-64" />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={onImportDataset}>
            <Database className="h-4 w-4 mr-2" />
            Load Dataset
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import Config
          </Button>
          <Button variant="outline" size="sm" onClick={onExportResults} disabled={!hasResults}>
            <Download className="h-4 w-4 mr-2" />
            Export Results
          </Button>
          <Button variant="outline" size="sm">
            <Save className="h-4 w-4 mr-2" />
            Save Project
          </Button>
          <Button variant="ghost" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}
