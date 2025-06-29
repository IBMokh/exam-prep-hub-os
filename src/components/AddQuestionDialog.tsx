import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, X } from 'lucide-react';
import { Question, Exam } from '@/types';
import { saveQuestion, updateQuestion } from '@/lib/supabase';

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
  const [filteredTags, setFilteredTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Filter available tags based on what's already selected and search input
  useEffect(() => {
    const filtered = availableTags.filter(tag => 
      !selectedTags.includes(tag) && 
      tag.toLowerCase().includes(newTag.toLowerCase())
    );
    setFilteredTags(filtered);
  }, [availableTags, selectedTags, newTag]);

  // Open dialog when editing a question
  useEffect(() => {
    if (editingQuestion) {
      setIsOpen(true);
    }
  }, [editingQuestion]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!examId || !questionNumber) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);

    const questionData = {
      examId,
      questionNumber: parseInt(questionNumber),
      type,
      tags: selectedTags
    };

    try {
      let savedQuestion: Question;
      
      if (editingQuestion) {
        savedQuestion = await updateQuestion({ ...editingQuestion, ...questionData });
      } else {
        savedQuestion = await saveQuestion(questionData);
      }

      onQuestionSaved(savedQuestion);
      handleClose();
    } catch (error) {
      console.error('Error saving question:', error);
      alert('Error saving question. Please try again.');
    }
    
    setLoading(false);
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
    const tagToAdd = newTag.trim().toLowerCase();
    if (tagToAdd && !selectedTags.includes(tagToAdd)) {
      setSelectedTags([...selectedTags, tagToAdd]);
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleTagAdd();
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
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
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
            
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add or search for tags"
                  onKeyPress={handleKeyPress}
                />
                <Button type="button" variant="outline" onClick={handleTagAdd}>
                  Add
                </Button>
              </div>
              
              {/* Existing tags suggestions */}
              {newTag && filteredTags.length > 0 && (
                <div className="border rounded-md p-2 max-h-32 overflow-y-auto">
                  <p className="text-xs text-gray-500 mb-1">Existing tags:</p>
                  <div className="flex flex-wrap gap-1">
                    {filteredTags.slice(0, 10).map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="cursor-pointer hover:bg-blue-50 text-xs"
                        onClick={() => handleExistingTagAdd(tag)}
                      >
                        + {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Show some popular existing tags when input is empty */}
              {!newTag && availableTags.length > 0 && (
                <div className="border rounded-md p-2">
                  <p className="text-xs text-gray-500 mb-1">Popular tags:</p>
                  <div className="flex flex-wrap gap-1">
                    {availableTags
                      .filter(tag => !selectedTags.includes(tag))
                      .slice(0, 10)
                      .map((tag) => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className="cursor-pointer hover:bg-blue-50 text-xs"
                          onClick={() => handleExistingTagAdd(tag)}
                        >
                          + {tag}
                        </Badge>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? 'Saving...' : (editingQuestion ? 'Update' : 'Add')} Question
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddQuestionDialog;
