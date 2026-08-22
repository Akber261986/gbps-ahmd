/**
 * Enhanced API wrapper with automatic cache invalidation
 *
 * This wrapper automatically invalidates relevant caches when data is modified.
 * Use these functions instead of direct API calls for automatic cache management.
 */

import { studentApi, classApi, subjectApi, leavingCertificateApi, gradeApi } from './api';
import { invalidateStudentCache, invalidateClassCache, invalidateSubjectCache } from './hooks';
import { invalidateCache } from './requestCache';

/**
 * Student API with automatic cache invalidation
 */
export const cachedStudentApi = {
  /**
   * Get all students (uses cache)
   */
  getAll: studentApi.getAll,

  /**
   * Get student by ID (uses cache)
   */
  getById: studentApi.getById,

  /**
   * Create a new student and invalidate cache
   */
  create: async (data: any) => {
    const result = await studentApi.create(data);
    invalidateStudentCache();
    return result;
  },

  /**
   * Update a student and invalidate cache
   */
  update: async (id: number, data: any) => {
    const result = await studentApi.update(id, data);
    invalidateStudentCache();
    invalidateCache(`/students/${id}`);
    return result;
  },

  /**
   * Delete a student and invalidate cache
   */
  delete: async (id: number) => {
    const result = await studentApi.delete(id);
    invalidateStudentCache();
    invalidateCache(`/students/${id}`);
    return result;
  },
};

/**
 * Class API with automatic cache invalidation
 */
export const cachedClassApi = {
  /**
   * Get all classes (uses cache)
   */
  getAll: classApi.getAll,

  /**
   * Get class by ID (uses cache)
   */
  getById: classApi.getById,

  /**
   * Create a new class and invalidate cache
   */
  create: async (data: any) => {
    const result = await classApi.create(data);
    invalidateClassCache();
    return result;
  },

  /**
   * Update a class and invalidate cache
   */
  update: async (id: number, data: any) => {
    const result = await classApi.update(id, data);
    invalidateClassCache();
    return result;
  },

  /**
   * Delete a class and invalidate cache
   */
  delete: async (id: number) => {
    const result = await classApi.delete(id);
    invalidateClassCache();
    return result;
  },
};

/**
 * Subject API with automatic cache invalidation
 */
export const cachedSubjectApi = {
  /**
   * Get all subjects (uses cache)
   */
  getAll: subjectApi.getAll,

  /**
   * Get subject by ID (uses cache)
   */
  getById: subjectApi.getById,

  /**
   * Create a new subject and invalidate cache
   */
  create: async (data: any) => {
    const result = await subjectApi.create(data);
    invalidateSubjectCache();
    return result;
  },

  /**
   * Update a subject and invalidate cache
   */
  update: async (id: number, data: any) => {
    const result = await subjectApi.update(id, data);
    invalidateSubjectCache();
    return result;
  },

  /**
   * Delete a subject and invalidate cache
   */
  delete: async (id: number) => {
    const result = await subjectApi.delete(id);
    invalidateSubjectCache();
    return result;
  },
};

/**
 * Grade API with automatic cache invalidation
 */
export const cachedGradeApi = {
  getByStudentId: gradeApi.getByStudentId,
  getBySubjectId: gradeApi.getBySubjectId,
  getStudentMarks: gradeApi.getStudentMarks,

  /**
   * Create grade and invalidate related caches
   */
  create: async (data: any) => {
    const result = await gradeApi.create(data);
    invalidateCache('/grades');
    return result;
  },

  /**
   * Save batch grades and invalidate related caches
   */
  saveBatch: async (data: any) => {
    const result = await gradeApi.saveBatch(data);
    invalidateCache('/grades');
    // Also invalidate students cache since grades might affect student status
    invalidateStudentCache();
    return result;
  },

  /**
   * Update grade and invalidate related caches
   */
  update: async (id: number, data: any) => {
    const result = await gradeApi.update(id, data);
    invalidateCache('/grades');
    return result;
  },

  /**
   * Delete grade and invalidate related caches
   */
  delete: async (id: number) => {
    const result = await gradeApi.delete(id);
    invalidateCache('/grades');
    return result;
  },
};

/**
 * Leaving Certificate API with automatic cache invalidation
 */
export const cachedLeavingCertificateApi = {
  getAll: leavingCertificateApi.getAll,
  getByStudentId: leavingCertificateApi.getByStudentId,

  /**
   * Create leaving certificate and invalidate related caches
   */
  create: async (data: any) => {
    const result = await leavingCertificateApi.create(data);
    invalidateCache('/school-leaving-certificates');
    invalidateStudentCache(); // Student status changes when leaving certificate is created
    return result;
  },

  /**
   * Update leaving certificate and invalidate related caches
   */
  update: async (id: number, data: any) => {
    const result = await leavingCertificateApi.update(id, data);
    invalidateCache('/school-leaving-certificates');
    invalidateStudentCache();
    return result;
  },

  /**
   * Delete leaving certificate and invalidate related caches
   */
  delete: async (id: number) => {
    const result = await leavingCertificateApi.delete(id);
    invalidateCache('/school-leaving-certificates');
    invalidateStudentCache();
    return result;
  },
};
