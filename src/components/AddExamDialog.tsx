
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Calendar } from 'lucide-react';
import { Exam } from '@/types';

interface AddExamDialogProps {
  onExamSaved: (exam: Exam) => void;
  saveExam: (exam: { identifier: string }) => Promise<Exam>;
  validateExamIdentifier: (identifier: string) => boolean;
  isExamIdentifierUnique: (identifier: string) => Promise<boolean>;
}

const AddExamDialog = ({ 
  onExamSaved, 
  saveExam, 
  validateExamIdentifier, 
  isExamIdentifierUnique 
}: AddExamDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    if (!identifier.trim()) {
      setError('Exam identifier is required');
      setLoading(false);
      return;
    }

    if (!validateExamIdentifier(identifier)) {
      setError('Invalid format. Use format: YYYYXX (e.g., 2023AA)');
      setLoading(false);
      return;
    }

    try {
      const isUnique = await isExamIdentifierUnique(identifier);
      if (!isUnique) {
        setError('This exam identifier already exists');
        setLoading(false);
        return;
      }

      const savedExam = await saveExam({ identifier: identifier.toUpperCase() });
      onExamSaved(savedExam);
      handleClose();
    } catch (error) {
      console.error('Error saving exam:', error);
      setError('Failed to save exam. Please try again.');
    }
    
    setLoading(false);
  };

  const handleClose = () => {
    setIsOpen(false);
    setIdentifier('');
    setError('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50">
          <Calendar className="h-4 w-4 mr-2" />
          Add Exam
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Exam</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="identifier">Exam Identifier *</Label>
            <Input
              id="identifier"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value.toUpperCase())}
              placeholder="e.g., 2023AA"
              maxLength={6}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Format: 4-digit year + 2 letters (e.g., 2023AA, 2019BC)
            </p>
            {error && (
              <p className="text-xs text-red-500 mt-1">{error}</p>
            )}
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
              {loading ? 'Adding...' : 'Add Exam'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddExamDialog;
