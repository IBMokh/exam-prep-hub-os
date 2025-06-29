
import { Question, Exam, PersonalProgress } from '@/types';

// Local storage keys
const QUESTIONS_KEY = 'os-exam-questions';
const EXAMS_KEY = 'os-exam-exams';
const PROGRESS_KEY = 'os-exam-progress';
const USER_KEY = 'os-exam-user';

// Default data
const DEFAULT_EXAMS: Exam[] = [
  {
    id: '1',
    identifier: '2023AA',
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2023-01-15')
  },
  {
    id: '2',
    identifier: '2022AB',
    createdAt: new Date('2022-06-20'),
    updatedAt: new Date('2022-06-20')
  },
  {
    id: '3',
    identifier: '2021BA',
    createdAt: new Date('2021-09-10'),
    updatedAt: new Date('2021-09-10')
  }
];

const DEFAULT_QUESTIONS: Question[] = [
  {
    id: '1',
    examId: '1',
    questionNumber: 1,
    type: 'multiple-choice',
    tags: ['Process Management', 'CPU Scheduling'],
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2023-01-15')
  },
  {
    id: '2',
    examId: '1',
    questionNumber: 2,
    type: 'open-answer',
    tags: ['Memory Management', 'Virtual Memory'],
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2023-01-15')
  },
  {
    id: '3',
    examId: '2',
    questionNumber: 1,
    type: 'multiple-choice',
    tags: ['File Systems', 'Storage'],
    createdAt: new Date('2022-06-20'),
    updatedAt: new Date('2022-06-20')
  },
  {
    id: '4',
    examId: '2',
    questionNumber: 2,
    type: 'open-answer',
    tags: ['Synchronization', 'Deadlocks'],
    createdAt: new Date('2022-06-20'),
    updatedAt: new Date('2022-06-20')
  },
  {
    id: '5',
    examId: '3',
    questionNumber: 1,
    type: 'multiple-choice',
    tags: ['Process Management', 'IPC'],
    createdAt: new Date('2021-09-10'),
    updatedAt: new Date('2021-09-10')
  }
];

// Initialize data if not exists
export const initializeData = () => {
  if (!localStorage.getItem(EXAMS_KEY)) {
    localStorage.setItem(EXAMS_KEY, JSON.stringify(DEFAULT_EXAMS));
  }
  if (!localStorage.getItem(QUESTIONS_KEY)) {
    localStorage.setItem(QUESTIONS_KEY, JSON.stringify(DEFAULT_QUESTIONS));
  }
  if (!localStorage.getItem(PROGRESS_KEY)) {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify([]));
  }
};

// Questions
export const getQuestions = (): Question[] => {
  const data = localStorage.getItem(QUESTIONS_KEY);
  return data ? JSON.parse(data).map((q: any) => ({
    ...q,
    createdAt: new Date(q.createdAt),
    updatedAt: new Date(q.updatedAt)
  })) : [];
};

export const saveQuestion = (question: Omit<Question, 'id' | 'createdAt' | 'updatedAt'>): Question => {
  const questions = getQuestions();
  const newQuestion: Question = {
    ...question,
    id: Date.now().toString(),
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  questions.push(newQuestion);
  localStorage.setItem(QUESTIONS_KEY, JSON.stringify(questions));
  return newQuestion;
};

export const updateQuestion = (id: string, updates: Partial<Question>): Question | null => {
  const questions = getQuestions();
  const index = questions.findIndex(q => q.id === id);
  
  if (index === -1) return null;
  
  questions[index] = {
    ...questions[index],
    ...updates,
    updatedAt: new Date()
  };
  
  localStorage.setItem(QUESTIONS_KEY, JSON.stringify(questions));
  return questions[index];
};

export const deleteQuestion = (id: string): boolean => {
  const questions = getQuestions();
  const filtered = questions.filter(q => q.id !== id);
  
  if (filtered.length === questions.length) return false;
  
  localStorage.setItem(QUESTIONS_KEY, JSON.stringify(filtered));
  return true;
};

// Exams
export const getExams = (): Exam[] => {
  const data = localStorage.getItem(EXAMS_KEY);
  return data ? JSON.parse(data).map((e: any) => ({
    ...e,
    createdAt: new Date(e.createdAt),
    updatedAt: new Date(e.updatedAt)
  })) : [];
};

export const saveExam = (exam: Omit<Exam, 'id' | 'createdAt' | 'updatedAt'>): Exam => {
  const exams = getExams();
  const newExam: Exam = {
    ...exam,
    id: Date.now().toString(),
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  exams.push(newExam);
  localStorage.setItem(EXAMS_KEY, JSON.stringify(exams));
  return newExam;
};

export const deleteExam = (id: string): boolean => {
  const exams = getExams();
  const filtered = exams.filter(e => e.id !== id);
  
  if (filtered.length === exams.length) return false;
  
  // Also delete all questions from this exam
  const questions = getQuestions();
  const filteredQuestions = questions.filter(q => q.examId !== id);
  localStorage.setItem(QUESTIONS_KEY, JSON.stringify(filteredQuestions));
  
  localStorage.setItem(EXAMS_KEY, JSON.stringify(filtered));
  return true;
};

// Personal Progress
export const getPersonalProgress = (): PersonalProgress[] => {
  const data = localStorage.getItem(PROGRESS_KEY);
  return data ? JSON.parse(data).map((p: any) => ({
    ...p,
    lastUpdated: new Date(p.lastUpdated)
  })) : [];
};

export const updatePersonalProgress = (questionId: string, updates: Partial<Omit<PersonalProgress, 'questionId' | 'lastUpdated'>>): PersonalProgress => {
  const progress = getPersonalProgress();
  const index = progress.findIndex(p => p.questionId === questionId);
  
  if (index === -1) {
    const newProgress: PersonalProgress = {
      questionId,
      solved: false,
      notes: '',
      ...updates,
      lastUpdated: new Date()
    };
    progress.push(newProgress);
  } else {
    progress[index] = {
      ...progress[index],
      ...updates,
      lastUpdated: new Date()
    };
  }
  
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  return progress.find(p => p.questionId === questionId)!;
};

// User
export const getCurrentUser = () => {
  const userData = localStorage.getItem(USER_KEY);
  return userData ? JSON.parse(userData) : null;
};

export const setCurrentUser = (user: { name: string }) => {
  const userData = {
    id: Date.now().toString(),
    ...user
  };
  localStorage.setItem(USER_KEY, JSON.stringify(userData));
  return userData;
};

// Utility functions
export const getAllTags = (): string[] => {
  const questions = getQuestions();
  const tagSet = new Set<string>();
  
  questions.forEach(q => {
    q.tags.forEach(tag => tagSet.add(tag));
  });
  
  return Array.from(tagSet).sort();
};

export const validateExamIdentifier = (identifier: string): boolean => {
  const regex = /^\d{4}[A-Z]{2}$/;
  return regex.test(identifier);
};

export const isExamIdentifierUnique = (identifier: string): boolean => {
  const exams = getExams();
  return !exams.some(exam => exam.identifier === identifier);
};
