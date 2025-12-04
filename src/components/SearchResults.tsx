import { Article } from '../types';
import ArticleCard from './ArticleCard';

interface SearchResultsProps {
  articles: Article[];
  showFavoritesOnly: boolean;
  onToggleFavoritesFilter: () => void;
  onToggleFavorite: (articleId: string) => void;
}

const SearchResults = ({
  articles,
  showFavoritesOnly,
  onToggleFavoritesFilter,
  onToggleFavorite,
}: SearchResultsProps) => {
  return (
    <div className="h-full flex flex-col">
      {/* Header with filter */}
      <div className="p-4 border-b border-gray-300 flex items-center justify-between">
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

      {/* Articles list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {articles.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            No articles found
          </div>
        ) : (
          articles.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              onToggleFavorite={onToggleFavorite}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default SearchResults;

