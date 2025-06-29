
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, X } from 'lucide-react';
import { Question, Exam } from '@/types';
import { saveQuestion, updateQuestion } from '@/lib/storage';

interface AddQuestionDialogProps {
  availableExams: Exam[];
  availableTags: string[];
  editingQuestion?: Question;
  onQuestionSaved: (question: Question) => void;
  onClose: () => void;
}

const AddQuestionDialog = ({
  availableExams,
  availableTags,
  editingQuestion,
  onQuestionSaved,
  onClose
}: AddQuestionDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [examId, setExamId] = useState(editingQuestion?.examId || '');
  const [questionNumber, setQuestionNumber] = useState(editingQuestion?.questionNumber?.toString() || '');
  const [type, setType] = useState<'multiple-choice' | 'open-answer'>(editingQuestion?.type || 'multiple-choice');
  const [selectedTags, setSelectedTags] = useState<string[]>(editingQuestion?.tags || []);
  const [newTag, setNewTag] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!examId || !questionNumber) {
      alert('Please fill in all required fields');
      return;
    }

    const questionData = {
      examId,
      questionNumber: parseInt(questionNumber),
      type,
      tags: selectedTags
    };

    let savedQuestion: Question;
    
    if (editingQuestion) {
      savedQuestion = updateQuestion(editingQuestion.id, questionData)!;
    } else {
      savedQuestion = saveQuestion(questionData);
    }

    onQuestionSaved(savedQuestion);
    handleClose();
  };

  const handleClose = () => {
    setIsOpen(false);
    onClose();
    // Reset form
    setExamId('');
    setQuestionNumber('');
    setType('multiple-choice');
    setSelectedTags([]);
    setNewTag('');
  };

  const handleTagAdd = () => {
    if (newTag.trim() && !selectedTags.includes(newTag.trim())) {
      setSelectedTags([...selectedTags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleTagRemove = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove));
  };

  const handleExistingTagAdd = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  return (
    <Dialog open={isOpen || !!editingQuestion} onOpenChange={setIsOpen}>
      {!editingQuestion && (
        <DialogTrigger asChild>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Question
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editingQuestion ? 'Edit Question' : 'Add New Question'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="exam">Exam *</Label>
            <Select value={examId} onValueChange={setExamId}>
              <SelectTrigger>
                <SelectValue placeholder="Select an exam" />
              </SelectTrigger>
              <SelectContent>
                {availableExams.map((exam) => (
                  <SelectItem key={exam.id} value={exam.id}>
                    {exam.identifier}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="questionNumber">Question Number *</Label>
            <Input
              id="questionNumber"
              type="number"
              value={questionNumber}
              onChange={(e) => setQuestionNumber(e.target.value)}
              placeholder="e.g., 1"
              min="1"
              required
            />
          </div>

          <div>
            <Label htmlFor="type">Question Type *</Label>
            <Select value={type} onValueChange={(value: 'multiple-choice' | 'open-answer') => setType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                <SelectItem value="open-answer">Open Answer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {selectedTags.map((tag) => (
                <Badge key={tag} variant="default" className="flex items-center gap-1">
                  {tag}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => handleTagRemove(tag)}
                  />
                </Badge>
              ))}
            </div>
            
            <div className="flex gap-2 mb-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add new tag"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleTagAdd())}
              />
              <Button type="button" variant="outline" onClick={handleTagAdd}>
                Add
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-1">
              {availableTags
                .filter(tag => !selectedTags.includes(tag))
                .map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="cursor-pointer hover:bg-blue-50"
                    onClick={() => handleExistingTagAdd(tag)}
                  >
                    + {tag}
                  </Badge>
                ))}
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              {editingQuestion ? 'Update' : 'Add'} Question
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddQuestionDialog;
