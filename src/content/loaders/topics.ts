import topicsData from '../generated/topics-index.json';
import { TopicsIndexFileSchema } from '../schemas';

export const topics = TopicsIndexFileSchema.parse(topicsData);
