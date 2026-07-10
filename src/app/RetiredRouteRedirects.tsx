import { Navigate, useParams } from 'react-router-dom';

export function RetiredDocumentRouteRedirect() {
  return <Navigate replace to="/quellen" />;
}

export function RetiredExamOriginalRedirect() {
  const { examId } = useParams();
  return <Navigate replace to={examId ? `/klausuren/${examId}` : '/klausuren'} />;
}

export function RetiredExamTaskOriginalRedirect() {
  const { examId, taskId } = useParams();
  if (!examId) return <Navigate replace to="/klausuren" />;
  if (!taskId) return <Navigate replace to={`/klausuren/${examId}`} />;
  return <Navigate replace to={`/klausuren/${examId}/aufgabe/${taskId}`} />;
}

export function RetiredExerciseOriginalRedirect() {
  const { sheetId, taskId } = useParams();
  if (!sheetId) return <Navigate replace to="/uebungen" />;
  if (!taskId) return <Navigate replace to={`/uebungen/${sheetId}`} />;
  return <Navigate replace to={`/uebungen/${sheetId}/aufgabe/${taskId}`} />;
}
