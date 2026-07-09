import blueprintData from '../generated/exam-blueprint.json';
import profilesData from '../generated/exam-profiles.json';
import fixturesData from '../generated/citation-fixtures.json';
import healthData from '../generated/content-health.json';
import manifestData from '../generated/content-manifest.json';
import {
  CitationFixturesFileSchema,
  ContentHealthSchema,
  ContentManifestSchema,
  ExamProfilesFileSchema,
} from '../schemas';

export const coreContent = {
  manifest: ContentManifestSchema.parse(manifestData),
  health: ContentHealthSchema.parse(healthData),
  profiles: ExamProfilesFileSchema.parse(profilesData),
  fixtures: CitationFixturesFileSchema.parse(fixturesData),
  blueprint: blueprintData,
};
