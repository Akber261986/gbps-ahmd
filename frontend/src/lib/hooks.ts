/**
 * Custom React hooks with built-in caching and request deduplication
 */

import { useState, useEffect, useCallback } from 'react';
import { requestCache, invalidateCache } from './requestCache';
import { classApi, studentApi, subjectApi, Student, Class, Subject } from './api';

interface UseDataResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * Hook to fetch classes with caching and deduplication
 */
export function useClasses(): UseDataResult<Class[]> {
  const [data, setData] = useState<Class[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClasses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await requestCache.execute(
        '/classes',
        () => classApi.getAll().then((res) => res.data),
        undefined,
        3 * 60 * 1000 // 3 minutes TTL
      );

      setData(result);
    } catch (err: any) {
      console.error('Failed to fetch classes:', err);
      setError(err.response?.data?.detail || 'Failed to load classes');
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    invalidateCache('/classes');
    await fetchClasses();
  }, [fetchClasses]);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  return { data, loading, error, refresh };
}

/**
 * Hook to fetch students with caching and deduplication
 */
export function useStudents(classId?: number): UseDataResult<Student[]> {
  const [data, setData] = useState<Student[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await requestCache.execute(
        '/students',
        () => studentApi.getAll(classId).then((res) => res.data),
        { class_id: classId },
        3 * 60 * 1000 // 3 minutes TTL
      );

      setData(result);
    } catch (err: any) {
      console.error('Failed to fetch students:', err);
      setError(err.response?.data?.detail || 'Failed to load students');
    } finally {
      setLoading(false);
    }
  }, [classId]);

  const refresh = useCallback(async () => {
    invalidateCache('/students');
    await fetchStudents();
  }, [fetchStudents]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  return { data, loading, error, refresh };
}

/**
 * Hook to fetch subjects with caching and deduplication
 */
export function useSubjects(classId?: number): UseDataResult<Subject[]> {
  const [data, setData] = useState<Subject[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await requestCache.execute(
        '/subjects',
        () => subjectApi.getAll(classId).then((res) => res.data),
        { class_id: classId },
        3 * 60 * 1000 // 3 minutes TTL
      );

      setData(result);
    } catch (err: any) {
      console.error('Failed to fetch subjects:', err);
      setError(err.response?.data?.detail || 'Failed to load subjects');
    } finally {
      setLoading(false);
    }
  }, [classId]);

  const refresh = useCallback(async () => {
    invalidateCache('/subjects');
    await fetchSubjects();
  }, [fetchSubjects]);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  return { data, loading, error, refresh };
}

/**
 * Hook to fetch a single student with caching
 */
export function useStudent(studentId: number | null): UseDataResult<Student> {
  const [data, setData] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStudent = useCallback(async () => {
    if (!studentId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await requestCache.execute(
        `/students/${studentId}`,
        () => studentApi.getById(studentId).then((res) => res.data),
        undefined,
        2 * 60 * 1000 // 2 minutes TTL for individual students
      );

      setData(result);
    } catch (err: any) {
      console.error('Failed to fetch student:', err);
      setError(err.response?.data?.detail || 'Failed to load student');
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  const refresh = useCallback(async () => {
    if (studentId) {
      invalidateCache(`/students/${studentId}`);
      await fetchStudent();
    }
  }, [studentId, fetchStudent]);

  useEffect(() => {
    fetchStudent();
  }, [fetchStudent]);

  return { data, loading, error, refresh };
}

/**
 * Utility to invalidate all student-related caches
 * Call this after creating, updating, or deleting a student
 */
export function invalidateStudentCache() {
  invalidateCache('/students');
}

/**
 * Utility to invalidate all class-related caches
 * Call this after creating, updating, or deleting a class
 */
export function invalidateClassCache() {
  invalidateCache('/classes');
}

/**
 * Utility to invalidate all subject-related caches
 * Call this after creating, updating, or deleting a subject
 */
export function invalidateSubjectCache() {
  invalidateCache('/subjects');
}
