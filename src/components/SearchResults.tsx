import { useState, useMemo } from 'react';
import { Article } from '../types';
import ArticleCard from './ArticleCard';

interface SearchResultsProps {
  articles: Article[];
  showFavoritesOnly: boolean;
  onToggleFavoritesFilter: () => void;
  onToggleFavorite: (articleId: string) => void;
  onAddToBoard?: (articleId: string) => void;
  isLoading?: boolean;
  error?: string | null;
}

const SearchResults = ({
  articles,
  showFavoritesOnly,
  onToggleFavoritesFilter,
  onToggleFavorite,
  onAddToBoard,
  isLoading = false,
  error = null,
}: SearchResultsProps) => {
  const [relevancyThreshold, setRelevancyThreshold] = useState(50);

  // Filter and sort articles
  const filteredAndSortedArticles = useMemo(() => {
    // Get relevancy score for an article (prefer validationResult.relevancy, fallback to relevancyScore)
    const getRelevancy = (article: Article): number => {
      if (article.validationResult?.relevancy !== undefined) {
        return article.validationResult.relevancy;
      }
      return article.relevancyScore || 0;
    };

    // First filter by favorites if needed
    let filtered = articles;
    if (showFavoritesOnly) {
      filtered = articles.filter((article) => article.isFavorite);
    }

    // Then filter by relevancy threshold
    const threshold = Number(relevancyThreshold);
    filtered = filtered.filter((article) => {
      const relevancy = Number(getRelevancy(article));
      return relevancy >= threshold;
    });

    // Sort by relevancy in descending order
    const sorted = [...filtered].sort((a, b) => {
      const relevancyA = getRelevancy(a);
      const relevancyB = getRelevancy(b);
      return relevancyB - relevancyA;
    });

    return sorted;
  }, [articles, relevancyThreshold, showFavoritesOnly]);

  return (
    <div className="h-full flex flex-col">
      {/* Header with filter */}
      <div className="p-4 border-b border-gray-300">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-800">Search results</h2>
          <div className="flex gap-2">
            <button
              className={`px-3 py-1 text-sm rounded ${
                !showFavoritesOnly
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              onClick={() => !showFavoritesOnly && onToggleFavoritesFilter()}
            >
              All
            </button>
            <button
              className={`px-3 py-1 text-sm rounded ${
                showFavoritesOnly
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              onClick={() => showFavoritesOnly && onToggleFavoritesFilter()}
            >
              Favorites
            </button>
          </div>
        </div>
        
        {/* Relevancy threshold slider */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-medium text-gray-700 whitespace-nowrap">
            Relevancy threshold:
          </label>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={relevancyThreshold}
            onChange={(e) => {
              const newValue = Number(e.target.value);
              setRelevancyThreshold(newValue);
            }}
            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-xs font-semibold text-gray-800 w-12 text-right">
            {relevancyThreshold}%
          </span>
        </div>
      </div>

      {/* Articles list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="text-center text-gray-500 mt-8">
            <div className="animate-pulse">Loading articles and validating...</div>
          </div>
        ) : error ? (
          <div className="text-center text-red-600 mt-8">
            <div className="font-semibold">Error loading articles</div>
            <div className="text-sm mt-2">{error}</div>
          </div>
        ) : filteredAndSortedArticles.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            No articles found matching the relevancy threshold. Select a connection in the graph to search.
          </div>
        ) : (
          filteredAndSortedArticles.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              onToggleFavorite={onToggleFavorite}
              onAddToBoard={onAddToBoard}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default SearchResults;

