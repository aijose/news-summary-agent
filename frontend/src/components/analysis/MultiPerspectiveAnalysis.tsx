import { useState } from 'react'
import { ChevronDownIcon, ChevronUpIcon, EyeIcon, SparklesIcon, CheckIcon } from '@heroicons/react/24/outline'
import { articleApi } from '@/services/api'
import type { SearchResult } from '@/types/article'

interface MultiPerspectiveAnalysisProps {
  selectedArticles: SearchResult[]
  onClearSelection?: () => void
}

interface AnalysisResult {
  synthesis_style: string
  analysis_focus: string
  total_articles: number
  multi_perspective_analysis: {
    analysis_text: string
    articles_analyzed: number
    analysis_focus: string
    article_details: Array<{
      id: number
      title: string
      source: string
      url: string
      published_date: string | null
    }>
    source_diversity: string[]
    generated_at: string
    model_info: {
      model: string
      temperature: number
    }
  }
  message: string
}

export function MultiPerspectiveAnalysis({ selectedArticles, onClearSelection }: MultiPerspectiveAnalysisProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisFocus, setAnalysisFocus] = useState('')
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleAnalyze = async () => {
    if (selectedArticles.length < 2) {
      setError('Please select at least 2 articles for multi-perspective analysis')
      return
    }

    setIsAnalyzing(true)
    setError(null)

    try {
      const articleIds = selectedArticles.map(article => article.article_id)
      const focus = analysisFocus.trim() || 'the main topic'

      const result = await articleApi.analyzeMultiplePerspectives(articleIds, focus)
      setAnalysisResult(result)
      setIsExpanded(true)
    } catch (err) {
      console.error('Analysis error:', err)
      setError(err instanceof Error ? err.message : 'Failed to perform analysis')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const formatAnalysisText = (text: string) => {
    // Split by major sections and format with proper headers
    const sections = text.split(/(?=\d+\.\s\*\*|\*\*\d+\.\s)/)

    return sections.map((section, index) => {
      if (section.trim() === '') return null

      // Check if this is a header section
      const headerMatch = section.match(/^(\d+\.\s)?\*\*([^*]+)\*\*:?\s*(.*)$/s)

      if (headerMatch) {
        const [, number, title, content] = headerMatch
        return (
          <div key={index} className="mb-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full mr-3">
                {number ? number.replace('.', '') : index + 1}
              </span>
              {title.trim()}
            </h4>
            <div className="prose prose-sm max-w-none text-gray-700">
              {content.trim().split('\n').map((line, lineIndex) => {
                if (line.trim().startsWith('- ')) {
                  return (
                    <div key={lineIndex} className="flex items-start space-x-2 mb-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>{line.trim().substring(2)}</span>
                    </div>
                  )
                }
                return line.trim() ? <p key={lineIndex} className="mb-2">{line.trim()}</p> : null
              })}
            </div>
          </div>
        )
      }

      return (
        <div key={index} className="mb-4 text-gray-700">
          {section.trim().split('\n').map((line, lineIndex) =>
            line.trim() ? <p key={lineIndex} className="mb-2">{line.trim()}</p> : null
          )}
        </div>
      )
    }).filter(Boolean)
  }

  if (selectedArticles.length === 0) {
    return (
      <div className="card p-6">
        <div className="text-center py-8">
          <EyeIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Multi-Perspective Analysis</h3>
          <p className="text-gray-600 mb-4">
            Select articles from search results to analyze different perspectives on the same topic.
          </p>
          <div className="text-sm text-gray-500">
            • Select 2-10 articles from different sources
            • AI will analyze various viewpoints and biases
            • Get a comprehensive understanding of complex topics
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Selection Summary */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <EyeIcon className="h-5 w-5 mr-2 text-blue-600" />
            Multi-Perspective Analysis
          </h3>
          {onClearSelection && (
            <button
              onClick={onClearSelection}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Clear selection
            </button>
          )}
        </div>

        <div className="mb-4">
          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
            <span>{selectedArticles.length} articles selected</span>
            <span>•</span>
            <span>{new Set(selectedArticles.map(a => a.source)).size} sources</span>
          </div>

          <div className="grid grid-cols-1 gap-2 mb-4">
            {selectedArticles.map((article) => (
              <div key={article.article_id} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-md">
                <CheckIcon className="h-4 w-4 text-green-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">{article.title}</div>
                  <div className="text-xs text-gray-500">{article.source}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mb-4">
            <label htmlFor="analysis-focus" className="block text-sm font-medium text-gray-700 mb-2">
              Analysis Focus (optional)
            </label>
            <input
              type="text"
              id="analysis-focus"
              value={analysisFocus}
              onChange={(e) => setAnalysisFocus(e.target.value)}
              placeholder="e.g., economic impacts, environmental concerns, political implications..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-3">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing || selectedArticles.length < 2}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isAnalyzing ? (
              <SparklesIcon className="h-4 w-4 animate-spin" />
            ) : (
              <SparklesIcon className="h-4 w-4" />
            )}
            <span>{isAnalyzing ? 'Analyzing...' : 'Analyze Perspectives'}</span>
          </button>
        </div>
      </div>

      {/* Analysis Results */}
      {analysisResult && (
        <div className="card">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <SparklesIcon className="h-5 w-5 mr-2 text-green-600" />
                Analysis Results
              </h3>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700"
              >
                <span>{isExpanded ? 'Collapse' : 'Expand'}</span>
                {isExpanded ? (
                  <ChevronUpIcon className="h-4 w-4" />
                ) : (
                  <ChevronDownIcon className="h-4 w-4" />
                )}
              </button>
            </div>

            <div className="mb-4 text-sm text-gray-600">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-medium">Focus:</span> {analysisResult.analysis_focus}
                </div>
                <div>
                  <span className="font-medium">Articles analyzed:</span> {analysisResult.total_articles}
                </div>
                <div>
                  <span className="font-medium">Sources:</span> {analysisResult.multi_perspective_analysis?.source_diversity?.join(', ')}
                </div>
                <div>
                  <span className="font-medium">Generated:</span> {
                    analysisResult.multi_perspective_analysis?.generated_at
                      ? new Date(analysisResult.multi_perspective_analysis.generated_at).toLocaleString()
                      : 'Unknown'
                  }
                </div>
              </div>
            </div>

            {isExpanded && analysisResult.multi_perspective_analysis && (
              <div className="border-t pt-6">
                <div className="prose max-w-none">
                  {formatAnalysisText(analysisResult.multi_perspective_analysis.analysis_text)}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}