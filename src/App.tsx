import { useState } from 'react';
import HypothesisGraph from './components/HypothesisGraph';
import ResearchPanel from './components/ResearchPanel';
import SearchResults from './components/SearchResults';
import { Entity, Hypothesis, Article } from './types';
import { initialEntities, mockArticles } from './mockData';

interface SelectedConnection {
  from: Entity;
  to: Entity;
}

function App() {
  const [entities, setEntities] = useState<Entity[]>(initialEntities);
  const [selectedConnection, setSelectedConnection] = useState<SelectedConnection | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
  const [isCreateNewMode, setIsCreateNewMode] = useState(false);
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
    setIsCreateNewMode(true);
    setSelectedConnection(null);
    // Keep selectedEntity if one is already selected
  };

  const handleSaveNewHypothesis = () => {
    // For now, just switch back to Selected Hypothesis mode
    // In the future, this would create the new hypothesis and entity
    setIsCreateNewMode(false);
    setSelectedEntity(null);
  };

  const handleHypothesisChange = (hypothesis: Hypothesis) => {
    setSelectedHypothesis(hypothesis);
  };

  const toggleFavorite = (articleId: string) => {
    setArticles(articles.map(a => 
      a.id === articleId ? { ...a, isFavorite: !a.isFavorite } : a
    ));
  };

  const filteredArticles = showFavoritesOnly 
    ? articles.filter(a => a.isFavorite)
    : articles;

  return (
    <div className="h-screen w-screen flex bg-gray-50">
      {/* Hypothesis Graph Constructor - 45% */}
      <div className="w-[45%] border-r border-gray-300 bg-white">
        <HypothesisGraph
          entities={entities}
          onEntityMove={handleEntityMove}
          onConnectionSelect={(conn) => {
            setSelectedConnection(conn);
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
          articles={filteredArticles}
          showFavoritesOnly={showFavoritesOnly}
          onToggleFavoritesFilter={() => setShowFavoritesOnly(!showFavoritesOnly)}
          onToggleFavorite={toggleFavorite}
        />
      </div>
    </div>
  );
}

export default App;

