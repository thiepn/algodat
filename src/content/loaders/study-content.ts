import learningGraphData from '../generated/learning-resource-graph.json';
import studyModulesData from '../generated/study-modules.json';
import taskSlotLearningMapData from '../generated/task-slot-learning-map.json';
import type {
  LearningResourceGraphFile,
  StudyModulesFile,
  TaskSlotLearningMapFile,
} from '../../domain/study-content/types';

export const studyModules = studyModulesData as StudyModulesFile;
export const taskSlotLearningMap = taskSlotLearningMapData as TaskSlotLearningMapFile;
export const learningResourceGraph = learningGraphData as LearningResourceGraphFile;

export function getTaskLearningEntry(taskNumber: number) {
  return taskSlotLearningMap.tasks.find((task) => task.taskNumber === taskNumber);
}

export function getStudyModule(moduleId: string) {
  return studyModules.modules.find((module) => module.moduleId === moduleId);
}

export function getStudyModulesForTopic(topicId: string) {
  return studyModules.modules.filter((module) => module.topicIds.includes(topicId));
}
