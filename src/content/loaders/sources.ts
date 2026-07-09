import sourcesData from '../generated/sources.json';
import { SafeSourcesFileSchema } from '../schemas';

export const sources = SafeSourcesFileSchema.parse(sourcesData);
