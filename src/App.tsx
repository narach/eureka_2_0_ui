import { useState, useEffect, useRef } from 'react';
import HypothesisGraph from './components/HypothesisGraph';
import ResearchPanel, { ResearchPanelRef } from './components/ResearchPanel';
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
  const researchPanelRef = useRef<ResearchPanelRef>(null);

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

  const handleSearchHypothesis = (hypothesisText: string) => {
    // Only trigger validation if there's a selected connection
    if (selectedConnection) {
      setIsLoadingArticles(true);
      setArticlesError(null);
      
      fetchAndValidateArticles(
        hypothesisText,
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
    }
  };

  const toggleFavorite = (articleId: string) => {
    setArticles(articles.map(a => 
      a.id === articleId ? { ...a, isFavorite: !a.isFavorite } : a
    ));
  };

  const handleAddToBoard = (articleId: string) => {
    // Find the article
    const article = articles.find(a => a.id === articleId);
    if (!article || !article.secondaryItem) {
      console.warn('Article not found or missing secondaryItem');
      return;
    }

    // Find Ozempic entity (id: '3')
    const ozempicEntity = entities.find(e => e.id === '3');
    if (!ozempicEntity) {
      console.warn('Ozempic entity not found');
      return;
    }

    // Check if entity with this secondaryItem already exists
    const existingEntity = entities.find(e => e.name === article.secondaryItem);
    if (existingEntity) {
      console.warn('Entity with this name already exists');
      return;
    }

    // Generate a new unique ID for the new entity
    const maxId = Math.max(...entities.map(e => parseInt(e.id) || 0));
    const newEntityId = String(maxId + 1);

    // Place the new entity to the right of Ozempic
    // Find entities to the right of Ozempic (same y level, higher x) to determine position
    const entitiesToRightOfOzempic = entities.filter(e => 
      e.id !== ozempicEntity.id &&
      Math.abs(e.y - ozempicEntity.y) < 50 && // Same y level (within 50px)
      e.x > ozempicEntity.x // To the right
    );
    const newX = entitiesToRightOfOzempic.length > 0 
      ? Math.max(...entitiesToRightOfOzempic.map(e => e.x)) + 200 // Place 200px to the right of the rightmost entity
      : ozempicEntity.x + 200; // Place 200px to the right of Ozempic if no entities to the right

    // Create new entity
    const newEntity: Entity = {
      id: newEntityId,
      name: article.secondaryItem,
      type: 'disease',
      x: newX,
      y: ozempicEntity.y, // Same y position as Ozempic
    };

    // Add the new entity to the entities array
    setEntities([...entities, newEntity]);

    // Update hypothesis text to append the new fact
    const newFact = 'Take this fact into account: Ozempic, a successful drug for Obesity treatment, is also used to treat Type 2 Diabetes';
    
    if (isCreateNewMode) {
      // In "New Hypothesis" mode, update the new hypothesis text via ref
      if (researchPanelRef.current) {
        researchPanelRef.current.appendToNewHypothesis(newFact);
      }
    } else {
      // In normal mode, update the selected hypothesis text
      const updatedText = selectedHypothesis.text 
        ? `${selectedHypothesis.text}\n\n${newFact}`
        : newFact;
      
      setSelectedHypothesis({
        ...selectedHypothesis,
        text: updatedText,
      });
    }
  };

  // Fetch and validate articles when a connection is selected
  // Note: This only runs when selectedConnection changes, NOT when hypothesis text changes
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
    } else if (!isCreateNewMode) {
      // Clear articles when connection is deselected (but not in create new mode)
      setArticles([]);
      setArticlesError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedConnection, isCreateNewMode]);

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
          ref={researchPanelRef}
          entities={entities}
          hypothesis={selectedHypothesis}
          onHypothesisChange={handleHypothesisChange}
          selectedConnection={selectedConnection}
          selectedEntity={selectedEntity}
          isCreateNewMode={isCreateNewMode}
          onCreateNew={handleCreateNew}
          onSaveNewHypothesis={handleSaveNewHypothesis}
          onSearchHypothesis={handleSearchHypothesis}
        />
      </div>

      {/* Search Results - 30% */}
      <div className="w-[30%] bg-white overflow-hidden flex flex-col">
        <SearchResults
          articles={articles}
          showFavoritesOnly={showFavoritesOnly}
          onToggleFavoritesFilter={() => setShowFavoritesOnly(!showFavoritesOnly)}
          onToggleFavorite={toggleFavorite}
          onAddToBoard={handleAddToBoard}
          isLoading={isLoadingArticles}
          error={articlesError}
        />
      </div>
    </div>
  );
}

export default App;

