
import { supabase } from '@/integrations/supabase/client';
import { Question, Exam, PersonalProgress } from '@/types';

// Exams
export const getExams = async (): Promise<Exam[]> => {
  const { data, error } = await supabase
    .from('exams')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching exams:', error);
    return [];
  }
  
  return data.map(exam => ({
    id: exam.id,
    identifier: exam.identifier,
    createdAt: new Date(exam.created_at),
    updatedAt: new Date(exam.updated_at)
  }));
};

export const saveExam = async (exam: { identifier: string }): Promise<Exam> => {
  const { data, error } = await supabase
    .from('exams')
    .insert({ identifier: exam.identifier })
    .select()
    .single();
    
  if (error) throw error;
  
  return {
    id: data.id,
    identifier: data.identifier,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at)
  };
};

// Questions
export const getQuestions = async (): Promise<Question[]> => {
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching questions:', error);
    return [];
  }
  
  return data.map(question => ({
    id: question.id,
    examId: question.exam_id,
    questionNumber: question.question_number,
    type: question.type as 'multiple-choice' | 'open-answer',
    tags: question.tags || [],
    createdAt: new Date(question.created_at),
    updatedAt: new Date(question.updated_at)
  }));
};

export const saveQuestion = async (question: Omit<Question, 'id' | 'createdAt' | 'updatedAt'>): Promise<Question> => {
  const { data, error } = await supabase
    .from('questions')
    .insert({
      exam_id: question.examId,
      question_number: question.questionNumber,
      type: question.type,
      tags: question.tags
    })
    .select()
    .single();
    
  if (error) throw error;
  
  return {
    id: data.id,
    examId: data.exam_id,
    questionNumber: data.question_number,
    type: data.type as 'multiple-choice' | 'open-answer',
    tags: data.tags || [],
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at)
  };
};

export const updateQuestion = async (question: Question): Promise<Question> => {
  const { data, error } = await supabase
    .from('questions')
    .update({
      exam_id: question.examId,
      question_number: question.questionNumber,
      type: question.type,
      tags: question.tags
    })
    .eq('id', question.id)
    .select()
    .single();
    
  if (error) throw error;
  
  return {
    id: data.id,
    examId: data.exam_id,
    questionNumber: data.question_number,
    type: data.type as 'multiple-choice' | 'open-answer',
    tags: data.tags || [],
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at)
  };
};

export const deleteQuestion = async (questionId: string): Promise<void> => {
  const { error } = await supabase
    .from('questions')
    .delete()
    .eq('id', questionId);
    
  if (error) throw error;
};

// Personal Progress
export const getPersonalProgress = async (userId: string): Promise<PersonalProgress[]> => {
  const { data, error } = await supabase
    .from('personal_progress')
    .select('*')
    .eq('user_id', userId);
  
  if (error) {
    console.error('Error fetching personal progress:', error);
    return [];
  }
  
  return data.map(progress => ({
    questionId: progress.question_id,
    solved: progress.solved,
    notes: progress.notes || '',
    lastUpdated: new Date(progress.last_updated)
  }));
};

export const updatePersonalProgress = async (userId: string, progress: PersonalProgress): Promise<void> => {
  const { error } = await supabase
    .from('personal_progress')
    .upsert({
      user_id: userId,
      question_id: progress.questionId,
      solved: progress.solved,
      notes: progress.notes,
      last_updated: new Date().toISOString()
    });
    
  if (error) throw error;
};

// Utility functions
export const getAllTags = async (): Promise<string[]> => {
  const { data, error } = await supabase
    .from('questions')
    .select('tags');
  
  if (error) {
    console.error('Error fetching tags:', error);
    return [];
  }
  
  const allTags = new Set<string>();
  data.forEach(question => {
    if (question.tags) {
      question.tags.forEach((tag: string) => allTags.add(tag));
    }
  });
  
  return Array.from(allTags).sort();
};

export const validateExamIdentifier = (identifier: string): boolean => {
  const regex = /^\d{4}[A-Z]{2}$/;
  return regex.test(identifier);
};

export const isExamIdentifierUnique = async (identifier: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('exams')
    .select('id')
    .eq('identifier', identifier)
    .single();
    
  return error !== null; // If error, then it doesn't exist (unique)
};
