export type EntityType = 'disease' | 'target' | 'drug';

export interface Entity {
  id: string;
  name: string;
  type: EntityType;
  x: number;
  y: number;
}

export interface Connection {
  id: string;
  from: string;
  to: string;
}

export interface Hypothesis {
  id: string;
  entities: {
    disease?: string;
    target?: string;
    drug?: string;
  };
  text: string;
  status: HypothesisStatus;
  relevancyThreshold: number;
  citationThreshold: number;
  includeRelatedSearches: boolean;
  englishOnly: boolean;
}

export type HypothesisStatus = 
  | 'Fact' 
  | 'Case study' 
  | 'Early hypothesis' 
  | 'Clinical testing' 
  | 'Unapproved' 
  | 'All';

export interface Article {
  id: string;
  publicationName: string;
  publicationUrl: string;
  summary: string;
  authors: string[];
  source: string;
  publicationDate: string;
  relevancyScore: number;
  status: string;
  similarArticlesCount: number;
  citationsCount: number;
  isFavorite?: boolean;
}

