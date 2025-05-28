import React, { useState } from 'react';

export enum QuestionType {
  MCQ = 'MCQ',            // Trắc nghiệm một đáp án
  TRUE_FALSE = 'TRUE_FALSE',  // Đúng/Sai
  MULTIPLE_SELECT = 'MULTIPLE_SELECT', // Nhiều đáp án
  MATCHING = 'MATCHING',  // Ghép đôi
  ESSAY = 'ESSAY'         // Tự luận
}

export interface QuestionOption {
  id: string;
  content: string;
  isCorrect?: boolean;
  order: number;
  imageUrl?: string;
  matchingText?: string;
}

export interface Question {
  id: string;
  content: string;
  type: QuestionType;
  timeLimit?: number;
  points: number;
  difficulty: string;
  order: number;
  imageUrl?: string;
  videoUrl?: string;
  options: QuestionOption[];
}

interface QuestionProps {
  question: Question;
  onSubmit: (optionIds: string[], responseTime: number) => void;
  isDisabled?: boolean;
  startTime: number;
}

// Tạo các component UI cơ bản để thay thế vì không tìm thấy các component từ thư viện
const Card: React.FC<{children: React.ReactNode, className?: string}> = ({children, className}) => {
  return <div className={`border rounded-lg shadow-sm ${className || ''}`}>{children}</div>;
};

const CardContent: React.FC<{children: React.ReactNode, className?: string}> = ({children, className}) => {
  return <div className={`p-4 ${className || ''}`}>{children}</div>;
};

const Button: React.FC<{
  children: React.ReactNode, 
  onClick: () => void, 
  disabled?: boolean,
  className?: string
}> = ({children, onClick, disabled, className}) => {
  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={`px-4 py-2 rounded-md font-medium ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className || ''}`}
    >
      {children}
    </button>
  );
};

const Label: React.FC<{
  children: React.ReactNode, 
  htmlFor: string,
  className?: string
}> = ({children, htmlFor, className}) => {
  return <label htmlFor={htmlFor} className={`block ${className || ''}`}>{children}</label>;
};

// Định nghĩa interface cho props của RadioGroupItem
interface RadioGroupItemProps {
  value: string;
  id: string;
  checked?: boolean;
  onChange?: () => void;
  disabled?: boolean;
  className?: string;
}

// RadioGroup Component
const RadioGroup: React.FC<{
  value: string,
  onValueChange: (value: string) => void,
  children: React.ReactNode,
  className?: string,
  disabled?: boolean
}> = ({value, onValueChange, children, className, disabled}) => {
  return (
    <div className={`space-y-2 ${className || ''}`} role="radiogroup">
      {React.Children.map(children, child => {
        if (React.isValidElement<RadioGroupItemProps>(child)) {
          return React.cloneElement(child, {
            checked: child.props.value === value,
            onChange: () => !disabled && onValueChange(child.props.value),
            disabled
          });
        }
        return child;
      })}
    </div>
  );
};

// RadioGroupItem Component
const RadioGroupItem: React.FC<RadioGroupItemProps> = ({value, id, checked, onChange, disabled, className}) => {
  return (
    <input 
      type="radio" 
      id={id} 
      value={value} 
      checked={checked} 
      onChange={onChange} 
      disabled={disabled}
      className={`w-4 h-4 ${className || ''}`}
    />
  );
};

// Checkbox Component
const Checkbox: React.FC<{
  id: string,
  checked: boolean,
  onCheckedChange: (checked: boolean) => void,
  disabled?: boolean,
  className?: string
}> = ({id, checked, onCheckedChange, disabled, className}) => {
  return (
    <input 
      type="checkbox" 
      id={id} 
      checked={checked} 
      onChange={(e) => onCheckedChange(e.target.checked)}
      disabled={disabled}
      className={`w-4 h-4 ${className || ''}`}
    />
  );
};

// Component cho câu hỏi trắc nghiệm một đáp án
export const MCQQuestion: React.FC<QuestionProps> = ({ question, onSubmit, isDisabled, startTime }) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const handleSubmit = () => {
    if (selectedOption) {
      const responseTime = Date.now() - startTime;
      onSubmit([selectedOption], responseTime);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardContent className="p-6">
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2">{question.content}</h3>
          {question.imageUrl && (
            <div className="mb-4">
              <img src={question.imageUrl} alt="Question" className="max-w-full rounded-lg" />
            </div>
          )}
        </div>

        <RadioGroup
          value={selectedOption || ""}
          onValueChange={setSelectedOption}
          className="space-y-3"
          disabled={isDisabled}
        >
          {question.options.sort((a, b) => a.order - b.order).map((option) => (
            <div key={option.id} className="flex items-start space-x-2 p-3 border rounded-md">
              <RadioGroupItem value={option.id} id={option.id} className="mt-1" />
              <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                {option.imageUrl && (
                  <img src={option.imageUrl} alt="" className="mb-2 max-h-32 rounded" />
                )}
                <span dangerouslySetInnerHTML={{ __html: option.content }} />
              </Label>
            </div>
          ))}
        </RadioGroup>

        <div className="mt-6">
          <Button 
            onClick={handleSubmit} 
            disabled={!selectedOption || isDisabled}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            Gửi câu trả lời
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Component cho câu hỏi Đúng/Sai
export const TrueFalseQuestion: React.FC<QuestionProps> = ({ question, onSubmit, isDisabled, startTime }) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const handleSubmit = () => {
    if (selectedOption) {
      const responseTime = Date.now() - startTime;
      onSubmit([selectedOption], responseTime);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardContent className="p-6">
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2">{question.content}</h3>
          {question.imageUrl && (
            <div className="mb-4">
              <img src={question.imageUrl} alt="Question" className="max-w-full rounded-lg" />
            </div>
          )}
        </div>

        <RadioGroup
          value={selectedOption || ""}
          onValueChange={setSelectedOption}
          className="space-y-3"
          disabled={isDisabled}
        >
          {question.options.sort((a, b) => a.order - b.order).map((option) => (
            <div key={option.id} className="flex items-start space-x-2 p-3 border rounded-md">
              <RadioGroupItem value={option.id} id={option.id} className="mt-1" />
              <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                {option.content}
              </Label>
            </div>
          ))}
        </RadioGroup>

        <div className="mt-6">
          <Button 
            onClick={handleSubmit} 
            disabled={!selectedOption || isDisabled}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            Gửi câu trả lời
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Component cho câu hỏi nhiều đáp án
export const MultipleSelectQuestion: React.FC<QuestionProps> = ({ question, onSubmit, isDisabled, startTime }) => {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  const handleOptionChange = (optionId: string, checked: boolean) => {
    if (checked) {
      setSelectedOptions([...selectedOptions, optionId]);
    } else {
      setSelectedOptions(selectedOptions.filter(id => id !== optionId));
    }
  };

  const handleSubmit = () => {
    if (selectedOptions.length > 0) {
      const responseTime = Date.now() - startTime;
      onSubmit(selectedOptions, responseTime);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardContent className="p-6">
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2">{question.content}</h3>
          <p className="text-sm text-gray-500 mb-2">Chọn tất cả các đáp án đúng</p>
          {question.imageUrl && (
            <div className="mb-4">
              <img src={question.imageUrl} alt="Question" className="max-w-full rounded-lg" />
            </div>
          )}
        </div>

        <div className="space-y-3">
          {question.options.sort((a, b) => a.order - b.order).map((option) => (
            <div key={option.id} className="flex items-start space-x-2 p-3 border rounded-md">
              <Checkbox 
                id={option.id} 
                checked={selectedOptions.includes(option.id)}
                onCheckedChange={(checked: boolean) => handleOptionChange(option.id, checked)}
                disabled={isDisabled}
                className="mt-1"
              />
              <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                {option.imageUrl && (
                  <img src={option.imageUrl} alt="" className="mb-2 max-h-32 rounded" />
                )}
                <span dangerouslySetInnerHTML={{ __html: option.content }} />
              </Label>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <Button 
            onClick={handleSubmit} 
            disabled={selectedOptions.length === 0 || isDisabled}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            Gửi câu trả lời
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}; 