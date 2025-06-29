
export interface Question {
  id: string;
  examId: string;
  questionNumber: number;
  type: 'multiple-choice' | 'open-answer';
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Exam {
  id: string;
  identifier: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PersonalProgress {
  questionId: string;
  solved: boolean;
  notes: string;
  lastUpdated: Date;
}

export interface User {
  id: string;
  name: string;
}
