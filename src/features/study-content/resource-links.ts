import { trainerRegistry } from '../trainer/trainer-service';
import { getRichModule } from '../learning/study-module-details';

export function trainerPath(trainerId: string): string {
  const entry = trainerRegistry.find((candidate) => candidate.trainerId === trainerId);
  if (entry?.rendererType === 'greedy_design_fitnesspunkte')
    return `/trainer/entwurf/greedy/${trainerId}`;
  if (entry?.rendererType === 'divide_conquer_max_difference')
    return `/trainer/entwurf/divide-and-conquer/${trainerId}`;
  if (entry?.rendererType === 'floyd_warshall_matrix')
    return `/trainer/graphen/floyd-warshall/${trainerId}`;
  if (entry?.rendererType === 'dijkstra_trace') return `/trainer/graphen/dijkstra/${trainerId}`;
  if (entry?.rendererType === 'prim_mst_trace') return `/trainer/graphen/prim/${trainerId}`;
  if (entry?.rendererType === 'red_black_tree_insertion')
    return `/trainer/baeume/rot-schwarz/${trainerId}`;
  if (entry?.rendererType === 'dp_design_mine') return `/trainer/entwurf/dp/${trainerId}`;
  if (entry?.rendererType === 'recurrence_runtime_proof')
    return `/trainer/rekurrenzen/${trainerId}`;
  if (entry?.trainerKind === 'proof') return `/trainer/beweise/${trainerId}`;
  return `/trainer/tracing/${trainerId}`;
}

export function hrefForResource(resourceId: string): string {
  if (resourceId === 'diagnose:schnellcheck') return '/diagnose/schnellcheck';
  if (resourceId === 'diagnose:standard') return '/diagnose/standard';
  if (resourceId.startsWith('trainer:')) return trainerPath(resourceId.replace('trainer:', ''));
  if (resourceId.startsWith('module:')) {
    const moduleId = resourceId.replace('module:', '');
    const module = getRichModule(moduleId);
    return module ? `/lernen/${module.slug}` : '/lernen';
  }
  if (resourceId.startsWith('klausuren:fragen')) {
    const query = resourceId.split('?')[1];
    return query ? `/klausuren/fragen?${query}` : '/klausuren/fragen';
  }
  return '/lernplan';
}

export function labelForResource(resourceId: string): string {
  if (resourceId === 'diagnose:schnellcheck') return 'Schnellcheck starten';
  if (resourceId === 'diagnose:standard') return 'Standarddiagnose starten';
  if (resourceId.startsWith('trainer:')) {
    const trainerId = resourceId.replace('trainer:', '');
    return trainerRegistry.find((entry) => entry.trainerId === trainerId)?.title ?? trainerId;
  }
  if (resourceId.startsWith('module:')) {
    const module = getRichModule(resourceId.replace('module:', ''));
    return module?.title ?? 'Lernmodul lesen';
  }
  if (resourceId.startsWith('klausuren:fragen')) return 'Historische Fragen ansehen';
  return 'Lernplan öffnen';
}
