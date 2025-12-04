import { Article } from '../types';

interface ArticleCardProps {
  article: Article;
  onToggleFavorite: (articleId: string) => void;
}

const ArticleCard = ({ article, onToggleFavorite }: ArticleCardProps) => {
  return (
    <div className="bg-white border border-gray-300 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      {/* Publication name with hyperlink */}
      <h3 className="mb-2">
        <a
          href={article.publicationUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 font-semibold text-sm underline"
        >
          {article.publicationName}
        </a>
      </h3>

      {/* Summary */}
      <p className="text-sm text-gray-700 mb-3 line-clamp-3">
        {article.summary}
      </p>

      {/* Authors */}
      <div className="text-xs text-gray-600 mb-2">
        <span className="font-medium">Authors:</span>{' '}
        {article.authors.join(', ')}
      </div>

      {/* Metadata row */}
      <div className="flex flex-wrap gap-2 text-xs text-gray-600 mb-2">
        <span className="font-medium">{article.source}</span>
        <span>•</span>
        <span>{article.publicationDate}</span>
      </div>

      {/* Stats row */}
      <div className="flex flex-wrap gap-3 text-xs">
        <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
          RS {article.relevancyScore}%
        </span>
        <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded">
          {article.status}
        </span>
        <span className="text-gray-600">
          Similar {article.similarArticlesCount}
        </span>
        <span className="text-gray-600">
          Cited by {article.citationsCount}
        </span>
      </div>

      {/* Favorite button */}
      <button
        onClick={() => onToggleFavorite(article.id)}
        className="mt-3 text-xs text-blue-600 hover:text-blue-800 underline"
      >
        {article.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
      </button>
    </div>
  );
};

export default ArticleCard;

