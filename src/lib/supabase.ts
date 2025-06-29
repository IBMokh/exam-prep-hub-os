
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
    throw error;
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
    throw error;
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
    throw error;
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

// Global Tags Management
export const getAllTags = async (): Promise<string[]> => {
  const { data, error } = await supabase
    .from('questions')
    .select('tags');
  
  if (error) {
    console.error('Error fetching tags:', error);
    throw error;
  }
  
  // Extract all unique tags from all questions
  const allTags = new Set<string>();
  data.forEach(question => {
    if (question.tags && Array.isArray(question.tags)) {
      question.tags.forEach((tag: string) => {
        if (tag && tag.trim()) {
          allTags.add(tag.trim().toLowerCase());
        }
      });
    }
  });
  
  return Array.from(allTags).sort();
};

// Add a new tag to the global pool by creating a question with it
export const addGlobalTag = async (tag: string): Promise<void> => {
  // Tags are automatically added to the global pool when questions are saved with them
  // This function is mainly for consistency, but the real addition happens when saving questions
  console.log(`Tag "${tag}" will be added to global pool when used in a question`);
};

// Utility functions
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
