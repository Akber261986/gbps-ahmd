// Offline storage utility for student data
// Stores student data in localStorage for offline entry and batch upload

export interface PendingStudent {
  id: string; // Temporary ID (UUID)
  gr_number: string;
  admission_date: string;
  name: string;
  father_name: string;
  qom: string | null;
  caste: string | null;
  relation_with_guardian: string | null;
  guardian_name: string | null;
  guardian_occupation: string | null;
  place_of_birth: string | null;
  address: string | null;
  date_of_birth: string;
  date_of_birth_in_letter: string;
  previous_school: string | null;
  gr_of_previos_school: string | null;
  admission_class_id: number;
  current_class_id: number | null;
  gender: string;
  roll_number: string | null;
  created_at: string; // Timestamp when added offline
}

const STORAGE_KEY = 'pending_students';

// Generate a temporary UUID
function generateTempId(): string {
  return 'temp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Get all pending students from localStorage
export function getPendingStudents(): PendingStudent[] {
  if (typeof window === 'undefined') return [];

  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading pending students:', error);
    return [];
  }
}

// Add a student to pending list (offline mode)
export function addPendingStudent(student: Omit<PendingStudent, 'id' | 'created_at'>): PendingStudent {
  const pendingStudents = getPendingStudents();

  const newStudent: PendingStudent = {
    ...student,
    id: generateTempId(),
    created_at: new Date().toISOString()
  };

  pendingStudents.push(newStudent);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pendingStudents));
  } catch (error) {
    console.error('Error saving pending student:', error);
    throw new Error('Failed to save student offline. Storage might be full.');
  }

  return newStudent;
}

// Remove a pending student by temporary ID
export function removePendingStudent(tempId: string): void {
  const pendingStudents = getPendingStudents();
  const filtered = pendingStudents.filter(s => s.id !== tempId);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error removing pending student:', error);
  }
}

// Update a pending student
export function updatePendingStudent(tempId: string, updates: Partial<PendingStudent>): void {
  const pendingStudents = getPendingStudents();
  const index = pendingStudents.findIndex(s => s.id === tempId);

  if (index !== -1) {
    pendingStudents[index] = { ...pendingStudents[index], ...updates };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(pendingStudents));
    } catch (error) {
      console.error('Error updating pending student:', error);
    }
  }
}

// Clear all pending students (after successful upload)
export function clearPendingStudents(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing pending students:', error);
  }
}

// Get count of pending students
export function getPendingStudentsCount(): number {
  return getPendingStudents().length;
}

// Check if there are pending students
export function hasPendingStudents(): boolean {
  return getPendingStudentsCount() > 0;
}

// Export pending students as JSON (for backup)
export function exportPendingStudents(): string {
  const students = getPendingStudents();
  return JSON.stringify(students, null, 2);
}

// Import pending students from JSON (for restore)
export function importPendingStudents(jsonData: string): void {
  try {
    const students = JSON.parse(jsonData);
    if (Array.isArray(students)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
    } else {
      throw new Error('Invalid data format');
    }
  } catch (error) {
    console.error('Error importing pending students:', error);
    throw new Error('Failed to import students. Invalid JSON format.');
  }
}

// Prepare pending students for batch upload (remove temporary fields)
export function prepareBatchUpload(): any[] {
  const pendingStudents = getPendingStudents();

  return pendingStudents.map(student => {
    const { id, created_at, ...studentData } = student;
    return studentData;
  });
}
