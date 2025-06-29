
import React, { useState } from 'react';
import { Question, PersonalProgress } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle2, Circle, Edit, Trash2, MessageSquare, FileText } from 'lucide-react';
import { updatePersonalProgress, deleteQuestion } from '@/lib/storage';

interface QuestionCardProps {
  question: Question;
  examIdentifier: string;
  progress?: PersonalProgress;
  onProgressUpdate: (progress: PersonalProgress) => void;
  onQuestionDelete: (questionId: string) => void;
  onQuestionEdit: (question: Question) => void;
}

const QuestionCard = ({
  question,
  examIdentifier,
  progress,
  onProgressUpdate,
  onQuestionDelete,
  onQuestionEdit
}: QuestionCardProps) => {
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState(progress?.notes || '');

  const handleSolvedToggle = () => {
    const newProgress = updatePersonalProgress(question.id, {
      solved: !progress?.solved
    });
    onProgressUpdate(newProgress);
  };

  const handleNotesSubmit = () => {
    const newProgress = updatePersonalProgress(question.id, {
      notes
    });
    onProgressUpdate(newProgress);
    setShowNotes(false);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      deleteQuestion(question.id);
      onQuestionDelete(question.id);
    }
  };

  return (
    <Card className="transition-all duration-200 hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center space-x-2">
            <span className="text-blue-600">{examIdentifier}</span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-700">Q{question.questionNumber}</span>
            <div className="flex items-center space-x-1 ml-2">
              {question.type === 'multiple-choice' ? (
                <Badge variant="secondary" className="text-xs">
                  <Circle className="h-3 w-3 mr-1" />
                  Multiple Choice
                </Badge>
              ) : (
                <Badge variant="outline" className="text-xs">
                  <FileText className="h-3 w-3 mr-1" />
                  Open Answer
                </Badge>
              )}
            </div>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSolvedToggle}
              className={`${progress?.solved ? 'text-green-600' : 'text-gray-400'}`}
            >
              {progress?.solved ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <Circle className="h-5 w-5" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowNotes(!showNotes)}
              className="text-gray-500"
            >
              <MessageSquare className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onQuestionEdit(question)}
              className="text-gray-500"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-1 mb-3">
          {question.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
        
        {showNotes && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Personal Notes
            </label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add your personal notes here..."
              className="mb-2"
              rows={3}
            />
            <div className="flex space-x-2">
              <Button size="sm" onClick={handleNotesSubmit}>
                Save Notes
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowNotes(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
        
        {progress?.notes && !showNotes && (
          <div className="mt-2 p-2 bg-blue-50 rounded text-sm text-gray-700">
            <strong>Your notes:</strong> {progress.notes}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QuestionCard;
