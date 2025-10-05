import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowTopRightOnSquareIcon, ArrowLeftIcon, SparklesIcon, ClockIcon } from '@heroicons/react/24/outline'
import { articleApi } from '@/services/api'
import { SaveToReadingListButton } from '@/components/articles/SaveToReadingListButton'
import type { Article, ArticleSummary } from '@/types/article'

export function ArticleDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [article, setArticle] = useState<Article | null>(null)
  const [summaries, setSummaries] = useState<ArticleSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedSummaryType, setSelectedSummaryType] = useState<'brief' | 'comprehensive' | 'analytical'>('comprehensive')

  useEffect(() => {
    if (!id || isNaN(Number(id))) {
      setError('Invalid article ID')
      setIsLoading(false)
      return
    }

    loadArticle(Number(id))
  }, [id])

  const loadArticle = async (articleId: number) => {
    setIsLoading(true)
    setError(null)

    try {
      // Load article details and summaries in parallel
      const [articleResponse, summariesResponse] = await Promise.all([
        articleApi.getArticle(articleId),
        articleApi.getArticleSummaries(articleId).catch(() => []) // Don't fail if summaries fail
      ])

      setArticle(articleResponse)
      setSummaries(Array.isArray(summariesResponse) ? summariesResponse : [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load article'
      setError(errorMessage)
      console.error('Error loading article:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const generateSummary = async () => {
    if (!article) return

    setIsGeneratingSummary(true)
    try {
      const newSummary = await articleApi.createSummary(article.id, selectedSummaryType)
      setSummaries(prev => [newSummary, ...prev])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate summary'
      setError(errorMessage)
      console.error('Error generating summary:', err)
    } finally {
      setIsGeneratingSummary(false)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Unknown date'
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return 'Unknown date'
    }
  }

  const getReadingTime = (content: string) => {
    const wordsPerMinute = 200
    const wordCount = content.split(' ').length
    return Math.ceil(wordCount / wordsPerMinute)
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error || !article) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card p-8">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Article</h3>
            <p className="text-red-700">{error || 'Article not found'}</p>
            <button
              onClick={() => navigate(-1)}
              className="btn-outline mt-4"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="btn-outline mb-6 flex items-center space-x-2"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        <span>Back</span>
      </button>

      {/* Article Header */}
      <article className="card p-8 mb-8">
        <header className="mb-8 pb-6 border-b border-gray-200">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-4xl font-bold text-neutral-900 leading-tight flex-1 mb-6">
              {article.title}
            </h1>
            <SaveToReadingListButton articleId={article.id} showLabel={true} className="ml-4" />
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-600">
            <span className="font-semibold text-primary-600">{article.source}</span>
            <span>•</span>
            <div className="flex items-center space-x-1">
              <ClockIcon className="h-4 w-4" />
              <span>{formatDate(article.published_date)}</span>
            </div>
            <span>•</span>
            <span>{getReadingTime(article.content)} min read</span>

            {article.url && (
              <>
                <span>•</span>
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 text-primary-600 hover:text-primary-800 font-medium"
                >
                  <span>Read original</span>
                  <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                </a>
              </>
            )}
          </div>
        </header>

        {/* Article Content */}
        <div className="prose prose-lg max-w-none mb-8">
          <div className="text-neutral-800 leading-relaxed space-y-4">
            {article.content.split('\n\n').map((paragraph, index) => (
              paragraph.trim() && (
                <p key={index} className="text-lg leading-relaxed">
                  {paragraph}
                </p>
              )
            ))}
          </div>
        </div>

        {/* Article Metadata */}
        {article.metadata && article.metadata.topic_keywords && Array.isArray(article.metadata.topic_keywords) && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Topics</h3>
            <div className="flex flex-wrap gap-2">
              {article.metadata.topic_keywords.slice(0, 8).map((keyword: string, index: number) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        )}
      </article>

      {/* AI Summaries Section */}
      <div className="card p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-neutral-900 flex items-center space-x-2">
            <SparklesIcon className="h-6 w-6 text-primary-600" />
            <span>AI Summaries</span>
          </h2>

          <div className="flex items-center space-x-4">
            <select
              value={selectedSummaryType}
              onChange={(e) => setSelectedSummaryType(e.target.value as any)}
              className="input"
              disabled={isGeneratingSummary}
            >
              <option value="brief">Brief Summary</option>
              <option value="comprehensive">Comprehensive Summary</option>
              <option value="analytical">Analytical Summary</option>
            </select>

            <button
              onClick={generateSummary}
              disabled={isGeneratingSummary}
              className="btn-primary flex items-center space-x-2"
            >
              {isGeneratingSummary ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <SparklesIcon className="h-4 w-4" />
                  <span>Generate Summary</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Existing Summaries */}
        {summaries.length > 0 ? (
          <div className="space-y-4">
            {summaries.map((summary, index) => (
              <div key={index} className="bg-primary-50 border-2 border-primary-200 rounded-xl p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-2">
                    <SparklesIcon className="h-5 w-5 text-primary-600" />
                    <span className="font-semibold text-primary-900 capitalize text-lg">
                      {summary.summary_type} Summary
                    </span>
                    {summary.cached && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                        Cached
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-primary-600 font-medium">
                    {formatDate(summary.generated_at)}
                  </span>
                </div>
                <div className="text-neutral-900 leading-relaxed space-y-4 prose prose-primary max-w-none">
                  {summary.summary_text.split('\n\n').map((paragraph, idx) => (
                    paragraph.trim() && (
                      <p key={idx} className="text-base leading-relaxed">
                        {paragraph.split('\n').map((line, lineIdx) => (
                          <span key={lineIdx}>
                            {line}
                            {lineIdx < paragraph.split('\n').length - 1 && <br />}
                          </span>
                        ))}
                      </p>
                    )
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-neutral-600">
            <SparklesIcon className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
            <p className="text-lg mb-2 font-medium">No summaries available yet</p>
            <p>Generate an AI summary to get started with intelligent analysis.</p>
          </div>
        )}
      </div>
    </div>
  )
}