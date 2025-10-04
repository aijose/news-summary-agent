import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowTopRightOnSquareIcon, ClockIcon, SparklesIcon } from '@heroicons/react/24/outline'
import { useCreateSummary } from '@/hooks/useArticlesQuery'
import { SaveToReadingListButton } from './SaveToReadingListButton'
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
    ? "card p-6 cursor-pointer"
    : "card p-8"

  // Determine which summary to display
  const displaySummary = generatedSummary || article.metadata?.ai_summary
  // Show summary if: user just generated one OR showSummary prop is true and summary exists
  const shouldShowSummary = generatedSummary ? true : (showSummary && displaySummary)

  return (
    <article className={cardClasses} onClick={handleCardClick}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className={`font-bold text-neutral-900 line-clamp-2 mb-3 leading-tight ${compact ? 'text-lg' : 'text-2xl'}`}>
            {article.title}
          </h3>
          <div className="flex items-center flex-wrap gap-3 text-sm text-neutral-600 mb-4">
            <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-primary-50 text-primary-700 font-semibold text-xs">
              {article.source}
            </span>
            <div className="flex items-center gap-1.5">
              <ClockIcon className="h-4 w-4 text-neutral-500" />
              <span>{formatDate(article.published_date)}</span>
            </div>
            {!compact && (
              <span className="text-neutral-500">{getReadingTime(article.content)} min read</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 ml-6" onClick={(e) => e.stopPropagation()}>
          <SaveToReadingListButton articleId={article.id} />
          {article.url && (
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-neutral-400 hover:text-primary-600 rounded-lg hover:bg-neutral-100"
              onClick={(e) => e.stopPropagation()}
              title="Read original article"
            >
              <ArrowTopRightOnSquareIcon className="h-5 w-5" />
            </a>
          )}
        </div>
      </div>

      {!compact && (
        <div className="text-neutral-700 line-clamp-3 mb-6 text-base leading-relaxed">
          {article.content.length > 250
            ? `${article.content.substring(0, 250)}...`
            : article.content
          }
        </div>
      )}

      {/* Summarize Button */}
      {!compact && !displaySummary && (
        <div className="mb-6">
          <button
            onClick={handleSummarize}
            disabled={isGenerating}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-secondary-500 rounded-lg hover:bg-secondary-600 disabled:bg-neutral-300 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
          >
            <SparklesIcon className="h-4 w-4" />
            {isGenerating ? 'Generating...' : 'Generate Summary'}
          </button>
        </div>
      )}

      {/* Display Summary */}
      {shouldShowSummary && (
        <div className="bg-primary-50 border-2 border-primary-200 rounded-lg p-5 mb-6">
          <div className="flex items-center gap-2 text-sm font-semibold text-primary-800 mb-3">
            <SparklesIcon className="h-4 w-4" />
            <span>AI Summary</span>
            {generatedSummary && <span className="text-xs font-normal text-primary-600">(Just generated)</span>}
          </div>
          <div className="text-sm text-primary-900 prose prose-sm max-w-none leading-relaxed">
            {displaySummary.split('\n').map((line: string, index: number) => {
              // Bold headers (lines starting with **)
              if (line.trim().startsWith('**') && line.trim().endsWith('**')) {
                const text = line.trim().slice(2, -2)
                return <div key={index} className="font-bold text-primary-900 mt-3 mb-2">{text}</div>
              }
              // Bullet points
              if (line.trim().startsWith('•')) {
                return <div key={index} className="ml-4 mb-1.5">{line.trim()}</div>
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
        <div className="flex flex-wrap gap-2 pt-4 border-t border-neutral-200">
          {article.metadata.topic_keywords && Array.isArray(article.metadata.topic_keywords) && (
            <div className="flex flex-wrap gap-2">
              {article.metadata.topic_keywords.slice(0, 3).map((keyword: string, index: number) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
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