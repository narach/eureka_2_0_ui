import { useState, useEffect } from 'react';
import { Entity, Hypothesis, HypothesisStatus } from '../types';
import { fetchEntityTypes, BackendEntityType } from '../services/api';

interface SelectedConnection {
  from: Entity;
  to: Entity;
}

interface ResearchPanelProps {
  entities: Entity[];
  hypothesis: Hypothesis;
  onHypothesisChange: (hypothesis: Hypothesis) => void;
  selectedConnection: SelectedConnection | null;
  selectedEntity: Entity | null;
  isCreateNewMode: boolean;
  onCreateNew: () => void;
  onSaveNewHypothesis?: (primaryItem: string, secondaryItem: string, hypothesis: string) => void;
}

const ResearchPanel = ({ entities, hypothesis, onHypothesisChange, selectedConnection, selectedEntity, isCreateNewMode, onCreateNew, onSaveNewHypothesis }: ResearchPanelProps) => {
  // entities prop is available for future use (e.g., dropdown of available entities)
  void entities;
  const [localHypothesis, setLocalHypothesis] = useState<Hypothesis>(hypothesis);
  const [newEntityType, setNewEntityType] = useState<string>('');
  const [newEntityName, setNewEntityName] = useState<string>('New');
  const [newHypothesisText, setNewHypothesisText] = useState<string>('');
  const [firstEntityType, setFirstEntityType] = useState<string>('');
  const [firstEntityName, setFirstEntityName] = useState<string>('');
  const [entityTypes, setEntityTypes] = useState<BackendEntityType[]>([]);
  const [isLoadingEntityTypes, setIsLoadingEntityTypes] = useState(false);

  // Sync local state with prop changes
  useEffect(() => {
    setLocalHypothesis(hypothesis);
  }, [hypothesis]);

  // Fetch entity types when entering create new mode
  useEffect(() => {
    if (isCreateNewMode) {
      setIsLoadingEntityTypes(true);
      fetchEntityTypes()
        .then((types) => {
          setEntityTypes(types);
          // Set default values if not already set
          if (types.length > 0) {
            if (!firstEntityType) {
              setFirstEntityType(String(types[0].id));
            }
            if (!newEntityType) {
              setNewEntityType(String(types[0].id));
            }
          }
          setIsLoadingEntityTypes(false);
        })
        .catch((error) => {
          console.error('Error fetching entity types:', error);
          setIsLoadingEntityTypes(false);
        });
    } else {
      // Clear entity types when leaving create new mode
      setEntityTypes([]);
      setFirstEntityType('');
      setNewEntityType('');
    }
  }, [isCreateNewMode]);

  // Sync first entity state with selectedEntity when it changes
  useEffect(() => {
    if (selectedEntity) {
      setFirstEntityName(selectedEntity.name);
      // Find matching entity type by name or use first available
      const matchingType = entityTypes.find(et => 
        et.name.toLowerCase() === selectedEntity.type.toLowerCase()
      );
      if (matchingType) {
        setFirstEntityType(String(matchingType.id));
      } else if (entityTypes.length > 0) {
        setFirstEntityType(String(entityTypes[0].id));
      }
    } else {
      setFirstEntityName('');
      if (entityTypes.length > 0) {
        setFirstEntityType(String(entityTypes[0].id));
      }
    }
  }, [selectedEntity, entityTypes]);

  const handleChange = (updates: Partial<Hypothesis>) => {
    const updated = { ...localHypothesis, ...updates };
    setLocalHypothesis(updated);
    onHypothesisChange(updated);
  };

  return (
    <div className="h-full flex flex-col p-4 overflow-y-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Research Panel</h2>
        {isCreateNewMode ? (
          <button 
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
            onClick={onCreateNew}
          >
            Close
          </button>
        ) : (
          <button 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
            onClick={onCreateNew}
          >
            Create new
          </button>
        )}
      </div>

      {/* Selected Hypothesis Container / Create New Hypothesis */}
      <div className="mb-4">
        {isCreateNewMode ? (
          <>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">New hypothesis</h3>
            <div className="space-y-3">
              {/* First pair: Editable entity */}
              <div className="space-y-1">
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
                    value={firstEntityName}
                    onChange={(e) => setFirstEntityName(e.target.value)}
                    placeholder="Enter entity name or select a card"
                  />
                  <select
                    className="w-32 px-3 py-2 border border-gray-300 rounded text-sm"
                    value={firstEntityType}
                    onChange={(e) => setFirstEntityType(e.target.value)}
                    disabled={isLoadingEntityTypes || entityTypes.length === 0}
                  >
                    {isLoadingEntityTypes ? (
                      <option value="">Loading...</option>
                    ) : entityTypes.length === 0 ? (
                      <option value="">No types</option>
                    ) : (
                      entityTypes.map((type) => (
                        <option key={type.id} value={String(type.id)}>
                          {type.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>
              {/* Second pair: New entity */}
              <div className="space-y-1">
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
                    value={newEntityName}
                    onChange={(e) => setNewEntityName(e.target.value)}
                    placeholder="Enter entity name"
                  />
                  <select
                    className="w-32 px-3 py-2 border border-gray-300 rounded text-sm"
                    value={newEntityType}
                    onChange={(e) => setNewEntityType(e.target.value)}
                    disabled={isLoadingEntityTypes || entityTypes.length === 0}
                  >
                    {isLoadingEntityTypes ? (
                      <option value="">Loading...</option>
                    ) : entityTypes.length === 0 ? (
                      <option value="">No types</option>
                    ) : (
                      entityTypes.map((type) => (
                        <option key={type.id} value={String(type.id)}>
                          {type.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>
            </div>
            
            {/* Hypothesis Text for New Hypothesis */}
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Request</h3>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm resize-none"
                rows={6}
                value={newHypothesisText}
                onChange={(e) => setNewHypothesisText(e.target.value)}
                placeholder="Provide new hypothesis description"
              />
            </div>
            
            {/* Validate Button */}
            <div className="mt-4">
              <button
                className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                onClick={() => {
                  if (onSaveNewHypothesis) {
                    onSaveNewHypothesis(
                      firstEntityName,
                      newEntityName,
                      newHypothesisText
                    );
                    // Note: Form is NOT reset and mode is NOT switched - user stays in create new mode
                  }
                }}
              >
                Validate
              </button>
            </div>
          </>
        ) : (
          <>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Selected hypothesis</h3>
            {selectedConnection ? (
              <div className="space-y-3">
            {/* First pair: Top card (to) */}
            <div className="space-y-1">
              <div className="flex gap-2">
                <input
                  type="text"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm bg-gray-50"
                  value={selectedConnection.to.name}
                  readOnly
                />
                <select
                  className="w-32 px-3 py-2 border border-gray-300 rounded text-sm bg-gray-50"
                  value={selectedConnection.to.type}
                  disabled
                >
                  <option value="disease">Disease</option>
                  <option value="target">Target</option>
                  <option value="drug">Drug</option>
                </select>
              </div>
            </div>
            {/* Second pair: Bottom card (from) */}
            <div className="space-y-1">
              <div className="flex gap-2">
                <input
                  type="text"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm bg-gray-50"
                  value={selectedConnection.from.name}
                  readOnly
                />
                <select
                  className="w-32 px-3 py-2 border border-gray-300 rounded text-sm bg-gray-50"
                  value={selectedConnection.from.type}
                  disabled
                >
                  <option value="disease">Disease</option>
                  <option value="target">Target</option>
                  <option value="drug">Drug</option>
                </select>
              </div>
            </div>
          </div>
        ) : (
              <div className="text-sm text-gray-500 italic">
                Select a connection in the graph to view hypothesis
              </div>
            )}
          </>
        )}
      </div>

      {/* Hypothesis Text */}
      {!isCreateNewMode && (
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Full hypothesis text</h3>
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm resize-none"
            rows={6}
            value={localHypothesis.text}
            onChange={(e) => handleChange({ text: e.target.value })}
            placeholder="Enter hypothesis text..."
          />
        </div>
      )}

      {/* Filter Section - Only show when not in create new mode */}
      {!isCreateNewMode && (
        <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-700">Filter</h3>

        {/* Status */}
        <div>
          <label className="block text-xs text-gray-600 mb-1">Status</label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
            value={localHypothesis.status}
            onChange={(e) => handleChange({ status: e.target.value as HypothesisStatus })}
          >
            <option value="Fact">Fact</option>
            <option value="Case study">Case study</option>
            <option value="Early hypothesis">Early hypothesis</option>
            <option value="Clinical testing">Clinical testing</option>
            <option value="Unapproved">Unapproved</option>
            <option value="All">All</option>
          </select>
        </div>

        {/* Relevancy Threshold */}
        <div>
          <label className="block text-xs text-gray-600 mb-1">
            Relevancy threshold, %: {localHypothesis.relevancyThreshold}
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={localHypothesis.relevancyThreshold}
            onChange={(e) => handleChange({ relevancyThreshold: parseInt(e.target.value) })}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0</span>
            <span>100</span>
          </div>
        </div>

        {/* Citation */}
        <div>
          <label className="block text-xs text-gray-600 mb-1">
            Citation: {localHypothesis.citationThreshold}
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={localHypothesis.citationThreshold}
            onChange={(e) => handleChange({ citationThreshold: parseInt(e.target.value) })}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0</span>
            <span>100</span>
          </div>
        </div>

        {/* Checkboxes */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={localHypothesis.includeRelatedSearches}
              onChange={(e) => handleChange({ includeRelatedSearches: e.target.checked })}
              className="rounded"
            />
            <span>Include related searches</span>
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={localHypothesis.englishOnly}
              onChange={(e) => handleChange({ englishOnly: e.target.checked })}
              className="rounded"
            />
            <span>English only</span>
          </label>
        </div>
      </div>
      )}
    </div>
  );
};

export default ResearchPanel;

