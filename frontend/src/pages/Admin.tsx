import { IngestionPanel } from '@/components/admin/IngestionPanel'
import { Database, Settings, BarChart3 } from 'lucide-react'

export function Admin() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">System Administration</h1>
        <p className="text-gray-600">
          Manage article ingestion, system settings, and monitor application health.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Article Ingestion */}
          <IngestionPanel />

          {/* Future: System Stats */}
          <div className="card p-6">
            <div className="flex items-center space-x-2 mb-4">
              <BarChart3 className="h-5 w-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">System Statistics</h3>
            </div>
            <div className="text-sm text-gray-500">
              System statistics and monitoring will be available in future updates.
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="card p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Database className="h-5 w-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Quick Stats</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Database Status:</span>
                <span className="text-green-600 font-medium">Connected</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Vector Store:</span>
                <span className="text-green-600 font-medium">Active</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">RSS Feeds:</span>
                <span className="text-blue-600 font-medium">10 configured</span>
              </div>
            </div>
          </div>

          {/* System Health */}
          <div className="card p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Settings className="h-5 w-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">System Health</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-sm text-gray-700">API Server</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-sm text-gray-700">Database</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-sm text-gray-700">Vector Search</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <span className="text-sm text-gray-700">AI Features (API Key Required)</span>
              </div>
            </div>
          </div>

          {/* RSS Feed Sources */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">RSS Feed Sources</h3>
            <div className="space-y-2 text-sm">
              <div className="text-gray-700">• BBC News</div>
              <div className="text-gray-700">• Reuters</div>
              <div className="text-gray-700">• The Guardian</div>
              <div className="text-gray-700">• TechCrunch</div>
              <div className="text-gray-700">• Ars Technica</div>
              <div className="text-gray-700">• Science Daily</div>
              <div className="text-gray-700">• MIT News</div>
              <div className="text-gray-700">• Hacker News</div>
              <div className="text-gray-700">• NPR</div>
              <div className="text-gray-700">• Associated Press</div>
            </div>
            <div className="mt-4 text-xs text-gray-500">
              All sources are free and publicly available RSS feeds.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}