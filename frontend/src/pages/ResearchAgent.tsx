import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Search, Sparkles, CheckCircle, XCircle, Loader, Play } from 'lucide-react'
import { researchAgentApi } from '@/services/api'

interface PlanStep {
  step: number
  tool: string
  description: string
  params?: Record<string, any>
}

interface ExecutionStep {
  step: number
  tool: string
  description: string
  status: 'success' | 'error' | 'pending'
  result?: any
  error?: string
  timestamp?: string
}

export function ResearchAgent() {
  const [query, setQuery] = useState('')
  const [plan, setPlan] = useState<PlanStep[] | null>(null)
  const [execution, setExecution] = useState<ExecutionStep[] | null>(null)
  const [finalAnswer, setFinalAnswer] = useState<string | null>(null)
  const [isExecuting, setIsExecuting] = useState(false)

  const { mutate: performResearch, isPending } = useMutation({
    mutationFn: (query: string) => researchAgentApi.research(query),
    onSuccess: (data) => {
      console.log('Research result:', data)
      setPlan(data.plan.plan || data.plan.fallback_plan || [])
      setExecution(data.execution.execution_results || [])
      setFinalAnswer(data.final_answer || null)
      setIsExecuting(false)
    },
    onError: (error) => {
      console.error('Research error:', error)
      setIsExecuting(false)
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      setPlan(null)
      setExecution(null)
      setFinalAnswer(null)
      setIsExecuting(true)
      performResearch(query.trim())
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />
      default:
        return <Loader className="h-5 w-5 text-neutral-400 animate-spin" />
    }
  }

  const exampleQueries = [
    "Find recent articles about AI regulation and analyze different political perspectives",
    "What are the top 3 trending tech topics this week?",
    "Compare how different sources covered the recent climate summit",
    "Show me articles about renewable energy from the last month with summaries"
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-secondary-100 rounded-xl">
            <Sparkles className="h-8 w-8 text-secondary-600" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-neutral-900">Research Agent</h1>
            <p className="text-neutral-600 text-lg mt-1">Autonomous news research powered by AI</p>
          </div>
        </div>
        <p className="text-neutral-700 leading-relaxed max-w-3xl">
          Ask complex research questions in natural language. The agent will create a plan,
          execute research steps autonomously, and present comprehensive results.
        </p>
      </div>

      {/* Query Input */}
      <div className="card p-8 mb-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="research-query" className="block text-sm font-semibold text-neutral-700 mb-3">
              What would you like to research?
            </label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
              <textarea
                id="research-query"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g., Find recent AI regulation articles and analyze different political perspectives..."
                className="w-full pl-12 pr-4 py-4 border-2 border-neutral-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-opacity-20 resize-none"
                rows={3}
                disabled={isPending || isExecuting}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={!query.trim() || isPending || isExecuting}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isPending || isExecuting ? (
              <>
                <Loader className="h-5 w-5 animate-spin" />
                <span>Researching...</span>
              </>
            ) : (
              <>
                <Play className="h-5 w-5" />
                <span>Start Research</span>
              </>
            )}
          </button>
        </form>

        {/* Agent Capabilities & Example Queries */}
        {!plan && !execution && (
          <div className="mt-8 pt-8 border-t border-neutral-200 space-y-6">
            {/* Capabilities */}
            <div>
              <h3 className="text-sm font-semibold text-neutral-700 mb-4 uppercase tracking-wide">
                Agent Capabilities:
              </h3>
              <div className="grid md:grid-cols-2 gap-3 text-sm">
                <div className="flex items-start gap-2 text-neutral-700">
                  <span className="text-primary-500 font-bold">•</span>
                  <span><strong>Search articles</strong> by keywords or topics</span>
                </div>
                <div className="flex items-start gap-2 text-neutral-700">
                  <span className="text-primary-500 font-bold">•</span>
                  <span><strong>Filter by time range</strong> (e.g., "last week", "past month")</span>
                </div>
                <div className="flex items-start gap-2 text-neutral-700">
                  <span className="text-primary-500 font-bold">•</span>
                  <span><strong>Filter by source</strong> (Substack, TechCrunch, Ars Technica, etc.)</span>
                </div>
                <div className="flex items-start gap-2 text-neutral-700">
                  <span className="text-primary-500 font-bold">•</span>
                  <span><strong>Generate AI summaries</strong> for articles</span>
                </div>
                <div className="flex items-start gap-2 text-neutral-700">
                  <span className="text-primary-500 font-bold">•</span>
                  <span><strong>Extract trending topics</strong> from recent articles</span>
                </div>
                <div className="flex items-start gap-2 text-neutral-700">
                  <span className="text-primary-500 font-bold">•</span>
                  <span><strong>Analyze perspectives</strong> across multiple articles</span>
                </div>
                <div className="flex items-start gap-2 text-neutral-700">
                  <span className="text-primary-500 font-bold">•</span>
                  <span><strong>Compare articles</strong> side-by-side</span>
                </div>
                <div className="flex items-start gap-2 text-neutral-700">
                  <span className="text-primary-500 font-bold">•</span>
                  <span><strong>Categorize by bias</strong> (experimental)</span>
                </div>
              </div>
            </div>

            {/* Example Queries */}
            <div>
              <h3 className="text-sm font-semibold text-neutral-700 mb-4 uppercase tracking-wide">
                Example Queries:
              </h3>
              <div className="grid gap-3">
                {exampleQueries.map((example, index) => (
                  <button
                    key={index}
                    onClick={() => setQuery(example)}
                    className="text-left p-4 bg-neutral-50 hover:bg-neutral-100 rounded-lg text-sm text-neutral-700 transition-colors"
                  >
                    <span className="font-medium text-primary-600 mr-2">→</span>
                    {example}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Plan Display */}
      {plan && plan.length > 0 && (
        <div className="card p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Sparkles className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-neutral-900">Research Plan</h2>
              <p className="text-sm text-neutral-600">The agent will execute these steps</p>
            </div>
          </div>

          <div className="space-y-4">
            {plan.map((step, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-4 bg-neutral-50 rounded-lg"
              >
                <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  {step.step}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-neutral-900 mb-1">
                    {step.tool.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </div>
                  <p className="text-sm text-neutral-600">{step.description}</p>
                  {step.params && Object.keys(step.params).length > 0 && (
                    <div className="mt-2 text-xs text-neutral-500">
                      Parameters: {JSON.stringify(step.params)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Execution Progress */}
      {execution && execution.length > 0 && (
        <div className="card p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-secondary-100 rounded-lg">
              <Play className="h-6 w-6 text-secondary-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-neutral-900">Execution Progress</h2>
              <p className="text-sm text-neutral-600">
                {execution.filter(s => s.status === 'success').length} of {execution.length} steps completed
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {execution.map((step, index) => (
              <div
                key={index}
                className={`p-5 rounded-lg border-2 ${
                  step.status === 'success'
                    ? 'bg-green-50 border-green-200'
                    : step.status === 'error'
                    ? 'bg-red-50 border-red-200'
                    : 'bg-neutral-50 border-neutral-200'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 pt-1">
                    {getStatusIcon(step.status)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-bold text-neutral-900">
                        Step {step.step}:
                      </span>
                      <span className="text-sm font-semibold text-neutral-700">
                        {step.tool.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-600 mb-3">{step.description}</p>

                    {/* Show results */}
                    {step.status === 'success' && step.result && (
                      <div className="bg-white rounded-lg p-4 border border-neutral-200">
                        <div className="text-xs font-semibold text-neutral-500 mb-2 uppercase tracking-wide">
                          Result:
                        </div>
                        {step.result.count !== undefined && (
                          <div className="text-sm text-neutral-700">
                            Found {step.result.count} results
                          </div>
                        )}
                        {step.result.total_filtered !== undefined && (
                          <div className="text-sm text-neutral-700">
                            Filtered to {step.result.total_filtered} articles
                          </div>
                        )}
                        {step.result.articles && step.result.articles.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {step.result.articles.slice(0, 5).map((article: any, i: number) => (
                              <div key={i} className="text-sm text-neutral-600">
                                • {article.title}
                              </div>
                            ))}
                            {step.result.articles.length > 5 && (
                              <div className="text-xs text-neutral-400 mt-1">
                                And {step.result.articles.length - 5} more...
                              </div>
                            )}
                          </div>
                        )}
                        {step.result.categorized && (
                          <div className="mt-2">
                            {Object.entries(step.result.categorized).map(([source, ids]: [string, any]) => (
                              <div key={source} className="text-sm text-neutral-700">
                                <span className="font-semibold capitalize">{source}:</span> {ids.length} article{ids.length !== 1 ? 's' : ''}
                              </div>
                            ))}
                          </div>
                        )}
                        {step.result.topics && step.result.topics.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {step.result.topics.map((topic: string, i: number) => (
                              <span key={i} className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs font-medium">
                                {topic}
                              </span>
                            ))}
                          </div>
                        )}
                        {step.result.topics && step.result.topics.length === 0 && step.result.article_count > 0 && (
                          <div className="text-sm text-neutral-500 italic mt-2">
                            No topics extracted (analyzed {step.result.article_count} article{step.result.article_count !== 1 ? 's' : ''})
                          </div>
                        )}
                        {step.result.summary && (
                          <div className="text-sm text-neutral-700 mt-2">
                            {step.result.summary}
                          </div>
                        )}
                        {step.result.analysis && (
                          <div className="text-sm text-neutral-700 mt-2 prose prose-sm max-w-none">
                            {step.result.analysis.split('\n').map((line: string, i: number) => (
                              <p key={i}>{line}</p>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Show errors */}
                    {step.status === 'error' && step.error && (
                      <div className="bg-red-100 rounded-lg p-3 text-sm text-red-900">
                        Error: {step.error}
                      </div>
                    )}

                    {step.timestamp && (
                      <div className="text-xs text-neutral-400 mt-2">
                        {new Date(step.timestamp).toLocaleTimeString()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Final Answer - Most Prominent */}
          {finalAnswer && execution.every(s => s.status !== 'pending') && (
            <div className="mt-8 pt-8 border-t-2 border-primary-300">
              <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-xl p-8 border-2 border-primary-200">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center">
                      <Sparkles className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-primary-900 mb-4 text-2xl">Answer</h3>
                    <div className="prose prose-primary max-w-none">
                      <p className="text-lg text-neutral-800 leading-relaxed whitespace-pre-wrap">
                        {finalAnswer}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Summary */}
          {execution.every(s => s.status !== 'pending') && (
            <div className="mt-8">
              <div className="bg-neutral-50 rounded-lg p-6 border border-neutral-200">
                <h3 className="font-semibold text-neutral-700 mb-2 text-sm uppercase tracking-wide">
                  Execution Summary
                </h3>
                <p className="text-neutral-600 text-sm leading-relaxed">
                  The agent successfully executed {execution.filter(s => s.status === 'success').length} out of{' '}
                  {execution.length} planned steps.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
