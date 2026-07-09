import foundationCompetenciesData from '../generated/foundation-competencies.json';
import diagnosticItemsAsymptoticsData from '../generated/diagnostic-items-asymptotics.json';
import diagnosticItemsRecurrencesData from '../generated/diagnostic-items-recurrences.json';
import diagnosticItemsSortingSearchData from '../generated/diagnostic-items-sorting-search.json';
import diagnosticItemsDataStructuresData from '../generated/diagnostic-items-data-structures.json';
import diagnosticItemsGraphsData from '../generated/diagnostic-items-graphs.json';
import diagnosticItemsParadigmsData from '../generated/diagnostic-items-paradigms.json';
import diagnosticItemsProofsData from '../generated/diagnostic-items-proofs.json';
import diagnosticMisconceptionsData from '../generated/diagnostic-misconceptions.json';
import diagnosticRecommendationRulesData from '../generated/diagnostic-recommendation-rules.json';
import diagnosticSessionTemplatesData from '../generated/diagnostic-session-templates.json';
import {
  DiagnosticItemsFileSchema,
  DiagnosticMisconceptionsFileSchema,
  DiagnosticRecommendationRulesFileSchema,
  DiagnosticSessionTemplatesFileSchema,
  FoundationCompetenciesFileSchema,
} from '../../domain/foundations-diagnostic/schemas';

export const diagnosticContent = {
  foundationCompetencies: FoundationCompetenciesFileSchema.parse(foundationCompetenciesData),
  diagnosticItems: DiagnosticItemsFileSchema.parse([
    ...diagnosticItemsAsymptoticsData,
    ...diagnosticItemsRecurrencesData,
    ...diagnosticItemsSortingSearchData,
    ...diagnosticItemsDataStructuresData,
    ...diagnosticItemsGraphsData,
    ...diagnosticItemsParadigmsData,
    ...diagnosticItemsProofsData,
  ]),
  diagnosticItemsByFile: {
    asymptotics: DiagnosticItemsFileSchema.parse(diagnosticItemsAsymptoticsData),
    recurrences: DiagnosticItemsFileSchema.parse(diagnosticItemsRecurrencesData),
    sortingSearch: DiagnosticItemsFileSchema.parse(diagnosticItemsSortingSearchData),
    dataStructures: DiagnosticItemsFileSchema.parse(diagnosticItemsDataStructuresData),
    graphs: DiagnosticItemsFileSchema.parse(diagnosticItemsGraphsData),
    paradigms: DiagnosticItemsFileSchema.parse(diagnosticItemsParadigmsData),
    proofs: DiagnosticItemsFileSchema.parse(diagnosticItemsProofsData),
  },
  diagnosticSessionTemplates: DiagnosticSessionTemplatesFileSchema.parse(
    diagnosticSessionTemplatesData,
  ),
  diagnosticMisconceptions: DiagnosticMisconceptionsFileSchema.parse(diagnosticMisconceptionsData),
  diagnosticRecommendationRules: DiagnosticRecommendationRulesFileSchema.parse(
    diagnosticRecommendationRulesData,
  ),
};

export type DiagnosticContent = typeof diagnosticContent;
