import { Article, ValidationResult, Entity } from '../types';

const API_BASE_URL = '/api/v1';

export interface ArticleWithValidation extends Article {
  validationResult?: ValidationResult;
}

/**
 * Backend article format from API
 */
interface BackendArticle {
  id: number;
  title: string;
  url: string;
  topic?: string;
  research_id?: number;
  main_item?: string;
  secondary_item?: string;
}

/**
 * Backend articles response format
 */
interface BackendArticlesResponse {
  articles: BackendArticle[];
}

/**
 * Backend validation response format
 */
interface BackendValidationResponse {
  result: {
    relevancy: number;
    key_take: string;
    validity: number;
  };
}

/**
 * Backend entity type format
 */
export interface BackendEntityType {
  id: number;
  name: string;
}

/**
 * Backend entity types response format
 */
interface BackendEntityTypesResponse {
  entity_types: BackendEntityType[];
}

/**
 * Backend research format
 */
interface BackendResearch {
  id: number;
  primary_item: string;
  secondary_item: string;
}

/**
 * Backend researches search response format
 */
interface BackendResearchesSearchResponse {
  researches: BackendResearch[];
}

/**
 * Backend article from search format
 */
interface BackendSearchArticle {
  id: number;
  title: string;
  url: string;
  topic: string;
  research_id: number;
  main_item?: string;
  secondary_item?: string;
}

/**
 * Backend articles search response format
 */
interface BackendArticlesSearchResponse {
  articles: BackendSearchArticle[];
}

/**
 * Fetches all available articles from the backend
 */
export async function fetchArticles(): Promise<Article[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/articles`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch articles: ${response.statusText}`);
    }
    
    const data: BackendArticlesResponse = await response.json();
    
    // Map backend article format to our Article interface
    return data.articles.map((backendArticle): Article => ({
      id: String(backendArticle.id),
      publicationName: backendArticle.title,
      publicationUrl: backendArticle.url,
      summary: backendArticle.topic || '', // Use topic as summary if available
      authors: [], // Not provided by backend, will be empty
      source: '', // Not provided by backend, will be empty
      publicationDate: '', // Not provided by backend, will be empty
      relevancyScore: 0, // Not provided by backend, will be 0
      status: '', // Not provided by backend, will be empty
      similarArticlesCount: 0, // Not provided by backend, will be 0
      citationsCount: 0, // Not provided by backend, will be 0
      isFavorite: false,
      mainItem: backendArticle.main_item,
      secondaryItem: backendArticle.secondary_item,
    }));
  } catch (error) {
    console.error('Error fetching articles:', error);
    throw error;
  }
}

/**
 * Validates a hypothesis against an article
 * @param articleUrl - The URL of the article to validate against
 * @param hypothesis - The hypothesis text to validate
 */
export async function validateHypothesis(
  articleUrl: string,
  hypothesis: string
): Promise<ValidationResult> {
  try {
    const response = await fetch(`${API_BASE_URL}/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        hypothesis: hypothesis,
        article_url: articleUrl,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to validate hypothesis: ${response.statusText}`);
    }
    
    const data: BackendValidationResponse = await response.json();
    
    // Map backend validation result to our ValidationResult interface
    const result = data.result;
    return {
      isValid: result.validity > 0, // Consider valid if validity > 0
      score: result.validity,
      reasoning: result.key_take,
      relevancy: result.relevancy,
      validity: result.validity,
      keyTake: result.key_take,
    };
  } catch (error) {
    console.error('Error validating hypothesis:', error);
    throw error;
  }
}

/**
 * Fetches articles and validates them against a hypothesis
 * @param hypothesis - The hypothesis text
 * @param fromEntity - The source entity (not used in API call but kept for future use)
 * @param toEntity - The target entity (not used in API call but kept for future use)
 */
export async function fetchAndValidateArticles(
  hypothesis: string,
  fromEntity: Entity,
  toEntity: Entity
): Promise<ArticleWithValidation[]> {
  try {
    // Step 1: Fetch all articles
    const articles = await fetchArticles();
    
    // Step 2: Validate each article
    const articlesWithValidation = await Promise.all(
      articles.map(async (article) => {
        try {
          const validationResult = await validateHypothesis(
            article.publicationUrl,
            hypothesis
          );
          return {
            ...article,
            validationResult,
          };
        } catch (error) {
          console.error(`Error validating article ${article.id}:`, error);
          // Return article without validation result if validation fails
          return {
            ...article,
            validationResult: undefined,
          };
        }
      })
    );
    
    return articlesWithValidation;
  } catch (error) {
    console.error('Error fetching and validating articles:', error);
    throw error;
  }
}

/**
 * Fetches all available entity types from the backend
 */
export async function fetchEntityTypes(): Promise<BackendEntityType[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/entity_types`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch entity types: ${response.statusText}`);
    }
    
    const data: BackendEntityTypesResponse = await response.json();
    return data.entity_types;
  } catch (error) {
    console.error('Error fetching entity types:', error);
    throw error;
  }
}

/**
 * Searches for researches by primary and secondary items
 * @param primaryItem - The primary item value
 * @param secondaryItem - The secondary item value
 */
export async function searchResearches(
  primaryItem: string,
  secondaryItem: string
): Promise<BackendResearch[]> {
  try {
    const params = new URLSearchParams({
      primary_item: primaryItem,
      secondary_item: secondaryItem,
    });
    
    const response = await fetch(`${API_BASE_URL}/researches/search?${params}`);
    
    if (!response.ok) {
      throw new Error(`Failed to search researches: ${response.statusText}`);
    }
    
    const data: BackendResearchesSearchResponse = await response.json();
    return data.researches;
  } catch (error) {
    console.error('Error searching researches:', error);
    throw error;
  }
}

/**
 * Searches for articles by research ID
 * @param researchId - The research ID
 */
export async function searchArticlesByResearch(
  researchId: number
): Promise<BackendSearchArticle[]> {
  try {
    const params = new URLSearchParams({
      research_id: String(researchId),
    });
    
    const response = await fetch(`${API_BASE_URL}/articles/search?${params}`);
    
    if (!response.ok) {
      throw new Error(`Failed to search articles: ${response.statusText}`);
    }
    
    const data: BackendArticlesSearchResponse = await response.json();
    return data.articles;
  } catch (error) {
    console.error('Error searching articles:', error);
    throw error;
  }
}

/**
 * Validates a hypothesis against an article by article ID
 * @param articleId - The article ID
 * @param hypothesis - The hypothesis text to validate
 */
export async function validateHypothesisByArticleId(
  articleId: number,
  hypothesis: string
): Promise<ValidationResult> {
  try {
    const response = await fetch(`${API_BASE_URL}/validate_by_article_id`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        hypothesis: hypothesis,
        article_id: articleId,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to validate hypothesis: ${response.statusText}`);
    }
    
    const data: BackendValidationResponse = await response.json();
    
    // Map backend validation result to our ValidationResult interface
    const result = data.result;
    return {
      isValid: result.validity >= 50, // Consider valid if validity >= 50
      score: result.validity,
      reasoning: result.key_take,
      relevancy: result.relevancy,
      validity: result.validity,
      keyTake: result.key_take,
    };
  } catch (error) {
    console.error('Error validating hypothesis by article ID:', error);
    throw error;
  }
}

/**
 * Creates a new hypothesis and fetches/validates articles
 * @param primaryItem - The primary item (first entity name) - not used in API call but kept for future use
 * @param secondaryItem - The secondary item (second entity name) - not used in API call but kept for future use
 * @param hypothesis - The hypothesis text
 */
export async function createNewHypothesisAndGetArticles(
  primaryItem: string,
  secondaryItem: string,
  hypothesis: string
): Promise<ArticleWithValidation[]> {
  try {
    // Step 1: Fetch all available articles
    const articles = await fetchArticles();
    
    if (articles.length === 0) {
      return [];
    }
    
    // Step 2: Validate each article against the hypothesis
    const articlesWithValidation = await Promise.all(
      articles.map(async (article) => {
        try {
          const validationResult = await validateHypothesis(
            article.publicationUrl,
            hypothesis
          );
          
          return {
            ...article,
            validationResult,
          };
        } catch (error) {
          console.error(`Error validating article ${article.id}:`, error);
          // Return article without validation result if validation fails
          return {
            ...article,
            validationResult: undefined,
          };
        }
      })
    );
    
    return articlesWithValidation;
  } catch (error) {
    console.error('Error creating new hypothesis and getting articles:', error);
    throw error;
  }
}
