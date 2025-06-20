import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';

const AdminContainer = styled.div`
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
`;

const Title = styled.h1`
  margin-bottom: 2rem;
  text-align: center;
  color: #333;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2rem;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const TextArea = styled.textarea`
  padding: 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  min-height: 200px;
  font-family: inherit;
  font-size: 1rem;
  line-height: 1.5;
  resize: vertical;
  width: 100%;
  box-sizing: border-box;
  
  &:focus {
    outline: none;
    border-color: #0066cc;
    box-shadow: 0 0 0 2px rgba(0, 102, 204, 0.1);
  }
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  background-color: #0066cc;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  transition: background-color 0.2s;

  &:hover {
    background-color: #0052a3;
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const DeleteButton = styled(Button)`
  background-color: #dc3545;
  
  &:hover {
    background-color: #c82333;
  }
`;

const TrainingExample = styled.div`
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.2s;

  &:hover {
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  }
`;

const Label = styled.label`
  font-weight: 600;
  font-size: 1.1rem;
  color: #333;
  margin-bottom: 0.5rem;
  display: block;
`;

const ExamplesHeader = styled.h2`
  color: #333;
  margin: 2rem 0 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e0e0e0;
`;

const NoExamplesText = styled.p`
  text-align: center;
  color: #666;
  font-style: italic;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  border: 1px dashed #ccc;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

export interface TrainingData {
  id: string;
  context: string;
}

const STORAGE_KEY = 'chatTrainingData';

function Admin() {
  const [trainingData, setTrainingData] = useState<TrainingData[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  const [context, setContext] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trainingData));
  }, [trainingData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!context.trim()) {
      alert('Please enter some training context');
      return;
    }
    
    if (editingId) {
      setTrainingData(trainingData.map(example => 
        example.id === editingId 
          ? { ...example, context }
          : example
      ));
      setEditingId(null);
    } else {
      const newExample: TrainingData = {
        id: Date.now().toString(),
        context
      };
      setTrainingData([...trainingData, newExample]);
    }

    setContext('');
  };

  const handleEdit = (example: TrainingData) => {
    setContext(example.context);
    setEditingId(example.id);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this training example?')) {
      setTrainingData(trainingData.filter(example => example.id !== id));
    }
  };

  return (
    <AdminContainer>
      <Title>Training Data Management</Title>
      
      <Form onSubmit={handleSubmit}>
        <div>
          <Label htmlFor="context">Context</Label>
          <TextArea
            id="context"
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="Enter training context or information..."
            required
          />
        </div>

        <Button type="submit">
          {editingId ? 'Update Training' : 'Add Training'}
        </Button>
      </Form>

      <ExamplesHeader>Training Examples ({trainingData.length})</ExamplesHeader>
      {trainingData.length === 0 ? (
        <NoExamplesText>No training examples yet. Add some above!</NoExamplesText>
      ) : (
        trainingData.map(example => (
          <TrainingExample key={example.id}>
            <p>{example.context}</p>
            <ButtonGroup>
              <Button onClick={() => handleEdit(example)}>Edit</Button>
              <DeleteButton onClick={() => handleDelete(example.id)}>Delete</DeleteButton>
            </ButtonGroup>
          </TrainingExample>
        ))
      )}
    </AdminContainer>
  );
}

export default Admin;
