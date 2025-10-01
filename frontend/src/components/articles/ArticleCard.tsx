import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowTopRightOnSquareIcon, ClockIcon, SparklesIcon } from '@heroicons/react/24/outline'
import { useCreateSummary } from '@/hooks/useArticlesQuery'
import type { Article } from '@/types/article'

interface ArticleCardProps {
  article: Article
  showSummary?: boolean
  compact?: boolean
}

export function ArticleCard({ article, showSummary = false, compact = false }: ArticleCardProps) {
  const navigate = useNavigate()
  const [generatedSummary, setGeneratedSummary] = useState<string | null>(null)
  const { mutate: createSummary, isPending: isGenerating } = useCreateSummary()

  const handleCardClick = () => {
    navigate(`/article/${article.id}`)
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Unknown date'
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
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
    const readingTime = Math.ceil(wordCount / wordsPerMinute)
    return readingTime
  }

  const handleSummarize = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent card click navigation
    createSummary(
      { articleId: article.id, summaryType: 'comprehensive' },
      {
        onSuccess: (data) => {
          setGeneratedSummary(data.summary_text)
        }
      }
    )
  }

  const cardClasses = compact
    ? "card p-4 hover:shadow-md transition-shadow cursor-pointer"
    : "card p-6 hover:shadow-lg transition-shadow"

  // Determine which summary to display
  const displaySummary = generatedSummary || article.metadata?.ai_summary
  // Show summary if: user just generated one OR showSummary prop is true and summary exists
  const shouldShowSummary = generatedSummary ? true : (showSummary && displaySummary)

  return (
    <article className={cardClasses} onClick={handleCardClick}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className={`font-semibold text-gray-900 line-clamp-2 mb-2 ${compact ? 'text-base' : 'text-lg'}`}>
            {article.title}
          </h3>
          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
            <span className="font-medium">{article.source}</span>
            <span>•</span>
            <div className="flex items-center space-x-1">
              <ClockIcon className="h-4 w-4" />
              <span>{formatDate(article.published_date)}</span>
            </div>
            {!compact && (
              <>
                <span>•</span>
                <span>{getReadingTime(article.content)} min read</span>
              </>
            )}
          </div>
        </div>

        {article.url && (
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-4 p-2 text-gray-400 hover:text-blue-600 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <ArrowTopRightOnSquareIcon className="h-5 w-5" />
          </a>
        )}
      </div>

      {!compact && (
        <div className="text-gray-700 line-clamp-3 mb-4">
          {article.content.length > 200
            ? `${article.content.substring(0, 200)}...`
            : article.content
          }
        </div>
      )}

      {/* Summarize Button */}
      {!compact && !displaySummary && (
        <div className="mb-4">
          <button
            onClick={handleSummarize}
            disabled={isGenerating}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            <SparklesIcon className="h-4 w-4" />
            {isGenerating ? 'Generating...' : 'Summarize'}
          </button>
        </div>
      )}

      {/* Display Summary */}
      {shouldShowSummary && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
          <div className="text-sm font-medium text-blue-800 mb-2">
            AI Summary {generatedSummary && <span className="text-xs text-blue-600">(Just generated)</span>}
          </div>
          <div className="text-sm text-blue-900 prose prose-sm max-w-none">
            {displaySummary.split('\n').map((line, index) => {
              // Bold headers (lines starting with **)
              if (line.trim().startsWith('**') && line.trim().endsWith('**')) {
                const text = line.trim().slice(2, -2)
                return <div key={index} className="font-semibold text-blue-900 mt-3 mb-1">{text}</div>
              }
              // Bullet points
              if (line.trim().startsWith('•')) {
                return <div key={index} className="ml-4 mb-1">{line.trim()}</div>
              }
              // Regular paragraphs
              if (line.trim()) {
                return <div key={index} className="mb-2">{line.trim()}</div>
              }
              return null
            })}
          </div>
        </div>
      )}

      {article.metadata && Object.keys(article.metadata).length > 0 && !compact && (
        <div className="flex flex-wrap gap-2 mt-4">
          {article.metadata.topic_keywords && Array.isArray(article.metadata.topic_keywords) && (
            <div className="flex flex-wrap gap-1">
              {article.metadata.topic_keywords.slice(0, 3).map((keyword: string, index: number) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700"
                >
                  {keyword}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </article>
  )
}