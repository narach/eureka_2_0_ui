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
      {article.summary && (
        <p className="text-sm text-gray-700 mb-3 line-clamp-3">
          {article.summary}
        </p>
      )}

      {/* Authors */}
      {article.authors && article.authors.length > 0 && (
        <div className="text-xs text-gray-600 mb-2">
          <span className="font-medium">Authors:</span>{' '}
          {article.authors.join(', ')}
        </div>
      )}

      {/* Metadata row */}
      {(article.source || article.publicationDate) && (
        <div className="flex flex-wrap gap-2 text-xs text-gray-600 mb-2">
          {article.source && <span className="font-medium">{article.source}</span>}
          {article.source && article.publicationDate && <span>•</span>}
          {article.publicationDate && <span>{article.publicationDate}</span>}
        </div>
      )}

      {/* Stats row */}
      <div className="flex flex-wrap gap-3 text-xs">
        {(() => {
          const relevancy = article.validationResult?.relevancy !== undefined 
            ? article.validationResult.relevancy 
            : article.relevancyScore || 0;
          
          // Determine color based on relevancy value
          let bgColor = '';
          let textColor = '';
          if (relevancy >= 0 && relevancy <= 20) {
            bgColor = 'bg-red-100';
            textColor = 'text-red-800';
          } else if (relevancy > 20 && relevancy <= 49) {
            bgColor = 'bg-orange-100';
            textColor = 'text-orange-800';
          } else if (relevancy >= 50 && relevancy <= 75) {
            bgColor = 'bg-green-100';
            textColor = 'text-green-800';
          } else if (relevancy > 75 && relevancy <= 100) {
            bgColor = 'bg-green-500';
            textColor = 'text-white';
          }
          
          return relevancy > 0 ? (
            <span className={`${bgColor} ${textColor} px-2 py-1 rounded font-medium`}>
              RS {relevancy}%
            </span>
          ) : null;
        })()}
        {article.status && (
          <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded">
            {article.status}
          </span>
        )}
        {article.similarArticlesCount > 0 && (
          <span className="text-gray-600">
            Similar {article.similarArticlesCount}
          </span>
        )}
        {article.citationsCount > 0 && (
          <span className="text-gray-600">
            Cited by {article.citationsCount}
          </span>
        )}
      </div>

      {/* Validation result */}
      {article.validationResult && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-xs font-semibold text-gray-700">Validation:</span>
            {(() => {
              const validity = article.validationResult.validity ?? 0;
              const isValid = validity >= 50;
              return (
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    isValid
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {isValid ? 'Valid' : 'Not valid'}
                </span>
              );
            })()}
            {article.validationResult.validity !== undefined && (
              <span className="text-xs text-gray-600">
                Validity: {article.validationResult.validity}%
              </span>
            )}
            {article.validationResult.relevancy !== undefined && (
              <span className="text-xs text-gray-600">
                Relevancy: {article.validationResult.relevancy}%
              </span>
            )}
          </div>
          {article.validationResult.reasoning && (
            <p className="text-xs text-gray-600 mt-1 line-clamp-2">
              {article.validationResult.reasoning}
            </p>
          )}
        </div>
      )}

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

