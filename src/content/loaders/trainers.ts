import rubricsData from '../generated/tracing-rubrics.json';
import trainersData from '../generated/tracing-trainers.json';
import dpDesignRubricsData from '../generated/dp-design-rubrics.json';
import dpDesignTrainersData from '../generated/dp-design-trainers.json';
import divideConquerDesignRubricsData from '../generated/divide-conquer-design-rubrics.json';
import divideConquerDesignTrainersData from '../generated/divide-conquer-design-trainers.json';
import greedyDesignRubricsData from '../generated/greedy-design-rubrics.json';
import greedyDesignTrainersData from '../generated/greedy-design-trainers.json';
import graphTracingRubricsData from '../generated/graph-tracing-rubrics.json';
import graphTracingTrainersData from '../generated/graph-tracing-trainers.json';
import rbInsertionRubricsData from '../generated/rb-insertion-rubrics.json';
import rbInsertionTrainersData from '../generated/rb-insertion-trainers.json';
import proofRubricsData from '../generated/proof-rubrics.json';
import proofTrainersData from '../generated/proof-trainers.json';
import recurrenceRubricsData from '../generated/recurrence-rubrics.json';
import recurrenceTrainersData from '../generated/recurrence-trainers.json';
import {
  DpDesignRubricsFileSchema,
  DpDesignTrainersFileSchema,
  DivideConquerDesignRubricsFileSchema,
  DivideConquerDesignTrainersFileSchema,
  GreedyDesignRubricsFileSchema,
  GreedyDesignTrainersFileSchema,
  GraphTracingRubricsFileSchema,
  GraphTracingTrainersFileSchema,
  RbInsertionRubricsFileSchema,
  RbInsertionTrainersFileSchema,
  ProofRubricsFileSchema,
  ProofTrainersFileSchema,
  RecurrenceRubricsFileSchema,
  RecurrenceTrainersFileSchema,
  TracingRubricsFileSchema,
  TracingTrainersFileSchema,
} from '../schemas';

export const tracingTrainers = TracingTrainersFileSchema.parse(trainersData);
export const tracingRubrics = TracingRubricsFileSchema.parse(rubricsData);
export const dpDesignTrainers = DpDesignTrainersFileSchema.parse(dpDesignTrainersData);
export const dpDesignRubrics = DpDesignRubricsFileSchema.parse(dpDesignRubricsData);
export const divideConquerDesignTrainers = DivideConquerDesignTrainersFileSchema.parse(
  divideConquerDesignTrainersData,
);
export const divideConquerDesignRubrics = DivideConquerDesignRubricsFileSchema.parse(
  divideConquerDesignRubricsData,
);
export const greedyDesignTrainers = GreedyDesignTrainersFileSchema.parse(greedyDesignTrainersData);
export const greedyDesignRubrics = GreedyDesignRubricsFileSchema.parse(greedyDesignRubricsData);
export const graphTracingTrainers = GraphTracingTrainersFileSchema.parse(graphTracingTrainersData);
export const graphTracingRubrics = GraphTracingRubricsFileSchema.parse(graphTracingRubricsData);
export const rbInsertionTrainers = RbInsertionTrainersFileSchema.parse(rbInsertionTrainersData);
export const rbInsertionRubrics = RbInsertionRubricsFileSchema.parse(rbInsertionRubricsData);
export const proofTrainers = ProofTrainersFileSchema.parse(proofTrainersData);
export const proofRubrics = ProofRubricsFileSchema.parse(proofRubricsData);
export const recurrenceTrainers = RecurrenceTrainersFileSchema.parse(recurrenceTrainersData);
export const recurrenceRubrics = RecurrenceRubricsFileSchema.parse(recurrenceRubricsData);
