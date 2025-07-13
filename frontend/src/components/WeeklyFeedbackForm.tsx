
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Star } from 'lucide-react';

interface WeeklyFeedbackFormProps {
  userRole: 'student' | 'mentor' | 'admin';
}

const WeeklyFeedbackForm: React.FC<WeeklyFeedbackFormProps> = ({ userRole }) => {
  const [formData, setFormData] = useState({
    rating: 0,
    experience: '',
    improvements: '',
    goals: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const handleRatingClick = (rating: number) => {
    setFormData(prev => ({ ...prev, rating }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mock submission
    setTimeout(() => {
      setSubmitted(true);
      toast({
        title: "Feedback Submitted!",
        description: "Thank you for your valuable feedback.",
      });
    }, 1000);
  };

  const getFormLabels = () => {
    switch (userRole) {
      case 'student':
        return {
          title: 'Weekly Learning Feedback',
          experience: 'How was your learning experience this week?',
          improvements: 'What could be improved?',
          goals: 'What are your goals for next week?'
        };
      case 'mentor':
        return {
          title: 'Weekly Mentoring Feedback',
          experience: 'How was your mentoring experience this week?',
          improvements: 'What platform improvements would help you mentor better?',
          goals: 'What are your mentoring goals for next week?'
        };
      case 'admin':
        return {
          title: 'Weekly Platform Feedback',
          experience: 'How is the platform performing this week?',
          improvements: 'What administrative features need improvement?',
          goals: 'What are your administrative goals for next week?'
        };
      default:
        return {
          title: 'Weekly Feedback',
          experience: 'How was your experience this week?',
          improvements: 'What could be improved?',
          goals: 'What are your goals for next week?'
        };
    }
  };

  const labels = getFormLabels();

  if (submitted) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Star className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Thank You!</h3>
          <p className="text-gray-600">Your feedback has been submitted successfully.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-800">{labels.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">
              Overall Rating (1-5 stars)
            </Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleRatingClick(star)}
                  className={`p-1 rounded transition-colors ${
                    star <= formData.rating ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                >
                  <Star className="w-6 h-6 fill-current" />
                </button>
              ))}
            </div>
          </div>

          {/* Experience */}
          <div>
            <Label htmlFor="experience" className="text-sm font-medium text-gray-700 mb-2 block">
              {labels.experience}
            </Label>
            <Textarea
              id="experience"
              value={formData.experience}
              onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
              placeholder="Share your thoughts about this week..."
              rows={3}
              required
            />
          </div>

          {/* Improvements */}
          <div>
            <Label htmlFor="improvements" className="text-sm font-medium text-gray-700 mb-2 block">
              {labels.improvements}
            </Label>
            <Textarea
              id="improvements"
              value={formData.improvements}
              onChange={(e) => setFormData(prev => ({ ...prev, improvements: e.target.value }))}
              placeholder="Suggest improvements..."
              rows={3}
            />
          </div>

          {/* Goals */}
          <div>
            <Label htmlFor="goals" className="text-sm font-medium text-gray-700 mb-2 block">
              {labels.goals}
            </Label>
            <Textarea
              id="goals"
              value={formData.goals}
              onChange={(e) => setFormData(prev => ({ ...prev, goals: e.target.value }))}
              placeholder="Set your goals..."
              rows={2}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            disabled={formData.rating === 0 || !formData.experience}
          >
            Submit Feedback
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default WeeklyFeedbackForm;
