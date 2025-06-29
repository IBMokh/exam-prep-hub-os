
import React, { useState, useEffect } from 'react';
import { Question, Exam, PersonalProgress } from '@/types';
import {
  initializeData,
  getQuestions,
  getExams,
  getPersonalProgress,
  getAllTags,
  updatePersonalProgress
} from '@/lib/storage';
import Layout from '@/components/Layout';
import QuestionCard from '@/components/QuestionCard';
import FilterBar from '@/components/FilterBar';
import AddQuestionDialog from '@/components/AddQuestionDialog';
import AddExamDialog from '@/components/AddExamDialog';
import StatsCard from '@/components/StatsCard';
import { BookOpen, FileQuestion, CheckCircle, TrendingUp } from 'lucide-react';

const Index = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [progress, setProgress] = useState<PersonalProgress[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedExam, setSelectedExam] = useState<string>('');
  const [editingQuestion, setEditingQuestion] = useState<Question | undefined>();

  useEffect(() => {
    initializeData();
    loadData();
  }, []);

  const loadData = () => {
    setQuestions(getQuestions());
    setExams(getExams());
    setProgress(getPersonalProgress());
    setAvailableTags(getAllTags());
  };

  const filteredQuestions = questions.filter(question => {
    const matchesExam = !selectedExam || question.examId === selectedExam;
    const matchesTags = selectedTags.length === 0 || 
      selectedTags.some(tag => question.tags.includes(tag));
    return matchesExam && matchesTags;
  });

  const handleProgressUpdate = (newProgress: PersonalProgress) => {
    setProgress(prev => {
      const filtered = prev.filter(p => p.questionId !== newProgress.questionId);
      return [...filtered, newProgress];
    });
  };

  const handleQuestionSaved = (question: Question) => {
    loadData();
    setEditingQuestion(undefined);
  };

  const handleQuestionDelete = (questionId: string) => {
    setQuestions(prev => prev.filter(q => q.id !== questionId));
  };

  const handleExamSaved = (exam: Exam) => {
    loadData();
  };

  const getQuestionProgress = (questionId: string) => {
    return progress.find(p => p.questionId === questionId);
  };

  const getExamIdentifier = (examId: string) => {
    const exam = exams.find(e => e.id === examId);
    return exam?.identifier || 'Unknown';
  };

  const handleClearFilters = () => {
    setSelectedTags([]);
    setSelectedExam('');
  };

  // Statistics
  const totalQuestions = questions.length;
  const solvedQuestions = progress.filter(p => p.solved).length;
  const totalExams = exams.length;
  const progressPercentage = totalQuestions > 0 ? Math.round((solvedQuestions / totalQuestions) * 100) : 0;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">OS Exam Questions</h1>
            <p className="text-gray-600 mt-1">
              Collaborative preparation for Operating Systems exams
            </p>
          </div>
          <div className="flex space-x-3">
            <AddExamDialog onExamSaved={handleExamSaved} />
            <AddQuestionDialog
              availableExams={exams}
              availableTags={availableTags}
              editingQuestion={editingQuestion}
              onQuestionSaved={handleQuestionSaved}
              onClose={() => setEditingQuestion(undefined)}
            />
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatsCard
            title="Total Questions"
            value={totalQuestions}
            icon={FileQuestion}
            color="blue"
          />
          <StatsCard
            title="Questions Solved"
            value={solvedQuestions}
            icon={CheckCircle}
            color="green"
          />
          <StatsCard
            title="Total Exams"
            value={totalExams}
            icon={BookOpen}
            color="purple"
          />
          <StatsCard
            title="Progress"
            value={`${progressPercentage}%`}
            icon={TrendingUp}
            color="orange"
            description={`${solvedQuestions} of ${totalQuestions} solved`}
          />
        </div>

        {/* Filters */}
        <FilterBar
          availableTags={availableTags}
          availableExams={exams}
          selectedTags={selectedTags}
          selectedExam={selectedExam}
          onTagsChange={setSelectedTags}
          onExamChange={setSelectedExam}
          onClearFilters={handleClearFilters}
        />

        {/* Questions List */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">
              Questions ({filteredQuestions.length})
            </h2>
          </div>
          
          {filteredQuestions.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <FileQuestion className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No questions found
              </h3>
              <p className="text-gray-500 mb-4">
                {questions.length === 0 
                  ? "Start by adding your first question to the database."
                  : "Try adjusting your filters to see more questions."
                }
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredQuestions.map((question) => (
                <QuestionCard
                  key={question.id}
                  question={question}
                  examIdentifier={getExamIdentifier(question.examId)}
                  progress={getQuestionProgress(question.id)}
                  onProgressUpdate={handleProgressUpdate}
                  onQuestionDelete={handleQuestionDelete}
                  onQuestionEdit={setEditingQuestion}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Index;
