import examLibraryData from '../generated/exam-library.json';
import type { SafeExamLibrary } from '../../domain/study-content/types';

export const examLibrary = examLibraryData as SafeExamLibrary;
