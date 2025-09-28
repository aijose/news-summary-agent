import { useNavigate } from 'react-router-dom'
import { ArrowTopRightOnSquareIcon, ClockIcon } from '@heroicons/react/24/outline'
import type { Article } from '@/types/article'

interface ArticleCardProps {
  article: Article
  showSummary?: boolean
  compact?: boolean
}

export function ArticleCard({ article, showSummary = false, compact = false }: ArticleCardProps) {
  const navigate = useNavigate()

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

  const cardClasses = compact
    ? "card p-4 hover:shadow-md transition-shadow cursor-pointer"
    : "card p-6 hover:shadow-lg transition-shadow"

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

      {showSummary && article.metadata?.ai_summary && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
          <div className="text-sm font-medium text-blue-800 mb-1">AI Summary</div>
          <div className="text-sm text-blue-700">{article.metadata.ai_summary}</div>
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