import { useState, useEffect } from 'react';
import HypothesisGraph from './components/HypothesisGraph';
import ResearchPanel from './components/ResearchPanel';
import SearchResults from './components/SearchResults';
import { Entity, Hypothesis, Article } from './types';
import { initialEntities, mockArticles } from './mockData';
import { fetchAndValidateArticles, createNewHypothesisAndGetArticles } from './services/api';

interface SelectedConnection {
  from: Entity;
  to: Entity;
}

function App() {
  const [entities, setEntities] = useState<Entity[]>(initialEntities);
  const [selectedConnection, setSelectedConnection] = useState<SelectedConnection | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
  const [isCreateNewMode, setIsCreateNewMode] = useState(false);
  const [previousConnection, setPreviousConnection] = useState<SelectedConnection | null>(null);
  const [selectedHypothesis, setSelectedHypothesis] = useState<Hypothesis>({
    id: '1',
    entities: {
      disease: '1',
      target: '2',
      drug: '3',
    },
    text: 'Semaglutide (Ozempic) exerts its metabolic and organ-protective effects primarily via activation of GLP-1 receptors in peripheral and central tissues, engaging canonical cAMP/PKA signaling to modulate insulin secretion, appetite, and tissue protection.',
    status: 'Fact',
    relevancyThreshold: 70,
    citationThreshold: 10,
    includeRelatedSearches: false,
    englishOnly: true,
  });
  const [articles, setArticles] = useState<Article[]>(mockArticles);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [isLoadingArticles, setIsLoadingArticles] = useState(false);
  const [articlesError, setArticlesError] = useState<string | null>(null);

  const handleEntityMove = (id: string, x: number, y: number) => {
    setEntities(entities.map(e => e.id === id ? { ...e, x, y } : e));
  };

  const handleEntitySelect = (entity: Entity | null) => {
    setSelectedEntity(entity);
    setIsCreateNewMode(entity !== null);
    // Clear connection selection when selecting an entity
    if (entity !== null) {
      setSelectedConnection(null);
    }
  };

  const handleCreateNew = () => {
    if (isCreateNewMode) {
      // Close: switch back to previously selected hypothesis
      setIsCreateNewMode(false);
      // Restore previous connection if it existed
      if (previousConnection) {
        setSelectedConnection(previousConnection);
      }
    } else {
      // Create new: enter create new mode
      // Save current connection before clearing it
      if (selectedConnection) {
        setPreviousConnection(selectedConnection);
      }
      setIsCreateNewMode(true);
      setSelectedConnection(null);
      // Keep selectedEntity if one is already selected
    }
  };

  const handleSaveNewHypothesis = (primaryItem: string, secondaryItem: string, hypothesis: string) => {
    // Validate inputs
    if (!primaryItem.trim() || !secondaryItem.trim() || !hypothesis.trim()) {
      setArticlesError('Please fill in all fields');
      return;
    }

    setIsLoadingArticles(true);
    setArticlesError(null);
    
    // Create new hypothesis and fetch/validate articles
    // Note: Do NOT switch back to Selected Hypothesis mode - user stays in create new mode
    createNewHypothesisAndGetArticles(primaryItem, secondaryItem, hypothesis)
      .then((validatedArticles) => {
        setArticles(validatedArticles);
        setIsLoadingArticles(false);
      })
      .catch((error) => {
        console.error('Error creating new hypothesis:', error);
        setArticlesError(error instanceof Error ? error.message : 'Failed to create hypothesis and fetch articles');
        setIsLoadingArticles(false);
      });
  };

  const handleHypothesisChange = (hypothesis: Hypothesis) => {
    setSelectedHypothesis(hypothesis);
  };

  const toggleFavorite = (articleId: string) => {
    setArticles(articles.map(a => 
      a.id === articleId ? { ...a, isFavorite: !a.isFavorite } : a
    ));
  };

  // Fetch and validate articles when a connection is selected
  useEffect(() => {
    if (selectedConnection) {
      setIsLoadingArticles(true);
      setArticlesError(null);
      
      fetchAndValidateArticles(
        selectedHypothesis.text,
        selectedConnection.from,
        selectedConnection.to
      )
        .then((validatedArticles) => {
          setArticles(validatedArticles);
          setIsLoadingArticles(false);
        })
        .catch((error) => {
          console.error('Error fetching and validating articles:', error);
          setArticlesError(error instanceof Error ? error.message : 'Failed to fetch articles');
          setIsLoadingArticles(false);
        });
    } else {
      // Clear articles when connection is deselected
      setArticles([]);
      setArticlesError(null);
    }
  }, [selectedConnection, selectedHypothesis.text]);

  return (
    <div className="h-screen w-screen flex bg-gray-50">
      {/* Hypothesis Graph Constructor - 45% */}
      <div className="w-[45%] border-r border-gray-300 bg-white">
        <HypothesisGraph
          entities={entities}
          onEntityMove={handleEntityMove}
          onConnectionSelect={(conn) => {
            setSelectedConnection(conn);
            if (conn) {
              setPreviousConnection(conn);
            }
            setIsCreateNewMode(false);
            if (conn === null) {
              setSelectedEntity(null);
            }
          }}
          onEntitySelect={handleEntitySelect}
        />
      </div>

      {/* Research Panel - 25% */}
      <div className="w-[25%] border-r border-gray-300 bg-white">
        <ResearchPanel
          entities={entities}
          hypothesis={selectedHypothesis}
          onHypothesisChange={handleHypothesisChange}
          selectedConnection={selectedConnection}
          selectedEntity={selectedEntity}
          isCreateNewMode={isCreateNewMode}
          onCreateNew={handleCreateNew}
          onSaveNewHypothesis={handleSaveNewHypothesis}
        />
      </div>

      {/* Search Results - 30% */}
      <div className="w-[30%] bg-white overflow-hidden flex flex-col">
        <SearchResults
          articles={articles}
          showFavoritesOnly={showFavoritesOnly}
          onToggleFavoritesFilter={() => setShowFavoritesOnly(!showFavoritesOnly)}
          onToggleFavorite={toggleFavorite}
          isLoading={isLoadingArticles}
          error={articlesError}
        />
      </div>
    </div>
  );
}

export default App;

