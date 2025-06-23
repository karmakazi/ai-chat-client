import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { 
  ModelType, 
  getSelectedModel, 
  setSelectedModel,
  getMessageHistoryEnabled,
  setMessageHistoryEnabled,
  getMessageHistoryLength,
  setMessageHistoryLength,
  DEFAULT_MESSAGE_HISTORY_ENABLED,
  DEFAULT_MESSAGE_HISTORY_LENGTH,
  MAX_MESSAGE_HISTORY_LENGTH,
  getTemperature,
  setTemperature,
  DEFAULT_TEMPERATURE
} from '../services/modelService';

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

const SettingsSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const SettingsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Select = styled.select`
  padding: 0.75rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  width: 100%;
  margin-bottom: 1rem;
  
  &:focus {
    outline: none;
    border-color: #0066cc;
  }
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  width: 100%;
  margin-bottom: 1rem;
  
  &:focus {
    outline: none;
    border-color: #0066cc;
  }
`;

const Toggle = styled.label`
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  gap: 0.5rem;
`;

const ToggleInput = styled.input`
  appearance: none;
  width: 50px;
  height: 26px;
  background: #e0e0e0;
  border-radius: 13px;
  position: relative;
  cursor: pointer;
  transition: background 0.3s;

  &:checked {
    background: #0066cc;
  }

  &:before {
    content: '';
    position: absolute;
    width: 22px;
    height: 22px;
    border-radius: 11px;
    background: white;
    top: 2px;
    left: 2px;
    transition: transform 0.3s;
  }

  &:checked:before {
    transform: translateX(24px);
  }
`;

const PrioritySelect = styled.select`
  padding: 0.5rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.9rem;
  margin-right: 1rem;
  background-color: white;
  cursor: pointer;

  &.high {
    border-color: #dc3545;
    color: #dc3545;
  }

  &.medium {
    border-color: #ffc107;
    color: #856404;
  }

  &.low {
    border-color: #28a745;
    color: #28a745;
  }
`;

const ControlsGroup = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  justify-content: space-between;
`;

const LeftControls = styled.div`
  display: flex;
  align-items: center;
`;

const ModelSelect = styled(Select)`
  max-width: 200px;
`;

const ModelSection = styled(SettingsSection)`
  margin-bottom: 2rem;
`;

const Slider = styled.input`
  width: 100%;
  margin: 10px 0;
  -webkit-appearance: none;
  appearance: none;
  height: 4px;
  border-radius: 2px;
  background: #e0e0e0;
  outline: none;
  
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #007bff;
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:hover {
      transform: scale(1.2);
      background: #0056b3;
    }
  }
  
  &::-moz-range-thumb {
    width: 16px;
    height: 16px;
    border: none;
    border-radius: 50%;
    background: #007bff;
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:hover {
      transform: scale(1.2);
      background: #0056b3;
    }
  }
`;

const SliderValue = styled.div`
  text-align: center;
  font-size: 0.9rem;
  color: #666;
  margin-top: 4px;
`;

export interface TrainingData {
  id: string;
  context: string;
  isEnabled: boolean;
  priority: 'high' | 'medium' | 'low';
}

interface PersonalitySettings {
  tone: string;
  customTone: string;
}

interface ResponseSettings {
  lengthPreference: string;
  minWords: number;
  maxWords: number;
}

interface Settings {
  personality: PersonalitySettings;
  response: ResponseSettings;
  messageHistory: {
    enabled: boolean;
    length: number;
  };
}

const SETTINGS_STORAGE_KEY = 'chatSettings';
const TRAINING_STORAGE_KEY = 'trainingExamples';

const defaultSettings: Settings = {
  personality: {
    tone: 'professional',
    customTone: '',
  },
  response: {
    lengthPreference: 'brief',
    minWords: 50,
    maxWords: 150,
  },
  messageHistory: {
    enabled: DEFAULT_MESSAGE_HISTORY_ENABLED,
    length: DEFAULT_MESSAGE_HISTORY_LENGTH,
  },
};

function Admin() {
  const [trainingData, setTrainingData] = useState<TrainingData[]>(() => {
    const saved = localStorage.getItem(TRAINING_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [selectedModel, setSelectedModelState] = useState<ModelType>(getSelectedModel());
  const [messageHistoryEnabled, setMessageHistoryEnabledState] = useState(getMessageHistoryEnabled());
  const [messageHistoryLength, setMessageHistoryLengthState] = useState(getMessageHistoryLength());
  const [temperature, setTemperatureState] = useState(getTemperature());

  const [context, setContext] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(TRAINING_STORAGE_KEY, JSON.stringify(trainingData));
  }, [trainingData]);

  useEffect(() => {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    // Load saved settings from localStorage
    const savedSettings = localStorage.getItem('settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
    
    setSelectedModelState(getSelectedModel());
    setMessageHistoryEnabledState(getMessageHistoryEnabled());
    setMessageHistoryLengthState(getMessageHistoryLength());
    setTemperatureState(getTemperature());
  }, []);

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
        context,
        isEnabled: true,
        priority: 'medium' // default priority
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

  const handleToggle = (id: string) => {
    setTrainingData(trainingData.map(example =>
      example.id === id
        ? { ...example, isEnabled: !example.isEnabled }
        : example
    ));
  };

  const handlePriorityChange = (id: string, priority: 'high' | 'medium' | 'low') => {
    setTrainingData(trainingData.map(example =>
      example.id === id
        ? { ...example, priority }
        : example
    ));
  };

  const handleSettingsChange = (section: keyof Settings, field: string, value: string | number | boolean) => {
    setSettings(prev => {
      const newSettings = {
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value,
        },
      };
      localStorage.setItem('settings', JSON.stringify(newSettings));
      return newSettings;
    });
  };

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const model = e.target.value as ModelType;
    setSelectedModelState(model);
    setSelectedModel(model);
  };

  const handleMessageHistoryToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const enabled = e.target.checked;
    setMessageHistoryEnabledState(enabled);
    setMessageHistoryEnabled(enabled);
    handleSettingsChange('messageHistory', 'enabled', enabled);
  };

  const handleMessageHistoryLengthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const length = parseInt(e.target.value, 10);
    setMessageHistoryLengthState(length);
    setMessageHistoryLength(length);
    handleSettingsChange('messageHistory', 'length', length);
  };

  const handleTemperatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setTemperatureState(value);
    setTemperature(value);
  };

  return (
    <AdminContainer>
      <Title>Admin Settings</Title>
      
      <SettingsGrid>
        <SettingsSection>
          <Label>Model Settings</Label>
          <Select value={selectedModel} onChange={handleModelChange}>
            <option value="gemini">Gemini (1.5 Flash)</option>
            <option value="claude">Claude (3 Opus)</option>
            <option value="chatgpt">ChatGPT (3.5 Turbo)</option>
          </Select>

          <div style={{ marginTop: '1rem' }}>
            <Toggle>
              <ToggleInput
                type="checkbox"
                checked={messageHistoryEnabled}
                onChange={handleMessageHistoryToggle}
              />
              Enable Message History
            </Toggle>
            
            {messageHistoryEnabled && (
              <div style={{ marginTop: '0.5rem' }}>
                <Select
                  value={messageHistoryLength}
                  onChange={handleMessageHistoryLengthChange}
                >
                  {Array.from({ length: MAX_MESSAGE_HISTORY_LENGTH + 1 }, (_, i) => (
                    <option key={i} value={i}>{i} messages</option>
                  ))}
                </Select>
              </div>
            )}
          </div>

          <div style={{ marginTop: '1rem' }}>
            <Label>Temperature</Label>
            <Slider
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={temperature}
              onChange={handleTemperatureChange}
            />
            <SliderValue>
              {temperature} - {temperature === 0 
                ? 'Deterministic' 
                : temperature < 0.3 
                  ? 'Conservative' 
                  : temperature < 0.7 
                    ? 'Balanced' 
                    : temperature < 0.9 
                      ? 'Creative' 
                      : 'Very Creative'}
            </SliderValue>
          </div>
        </SettingsSection>

        <SettingsSection>
          <Label>Response Length</Label>
          <Select
            value={settings.response.lengthPreference}
            onChange={(e) => handleSettingsChange('response', 'lengthPreference', e.target.value)}
          >
            <option value="brief">Brief</option>
            <option value="balanced">Balanced</option>
            <option value="detailed">Detailed</option>
            <option value="custom">Custom</option>
          </Select>

          {settings.response.lengthPreference === 'custom' && (
            <div>
              <Label>Min Words</Label>
              <Input
                type="number"
                value={settings.response.minWords}
                onChange={(e) => handleSettingsChange('response', 'minWords', parseInt(e.target.value))}
                min="10"
                max="1000"
              />
              <Label>Max Words</Label>
              <Input
                type="number"
                value={settings.response.maxWords}
                onChange={(e) => handleSettingsChange('response', 'maxWords', parseInt(e.target.value))}
                min="10"
                max="1000"
              />
            </div>
          )}
        </SettingsSection>

        <SettingsSection>
          <Label>Personality Settings</Label>
          <Select
            value={settings.personality.tone}
            onChange={(e) => handleSettingsChange('personality', 'tone', e.target.value)}
          >
            <option value="professional">Professional</option>
            <option value="casual">Casual</option>
            <option value="friendly">Friendly</option>
            <option value="technical">Technical</option>
            <option value="custom">Custom</option>
          </Select>
          
          {settings.personality.tone === 'custom' && (
            <TextArea
              value={settings.personality.customTone}
              onChange={(e) => handleSettingsChange('personality', 'customTone', e.target.value)}
              placeholder="Describe the custom personality/tone you want the chatbot to have..."
              style={{ marginTop: '1rem' }}
            />
          )}
        </SettingsSection>
      </SettingsGrid>

      <Form onSubmit={handleSubmit}>
        <div>
          <Label htmlFor="context">Training Context</Label>
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
            <ControlsGroup>
              <LeftControls>
                <Toggle>
                  <ToggleInput
                    type="checkbox"
                    checked={example.isEnabled}
                    onChange={() => handleToggle(example.id)}
                  />
                  {example.isEnabled ? 'Enabled' : 'Disabled'}
                </Toggle>
              </LeftControls>
              <PrioritySelect
                value={example.priority}
                onChange={(e) => handlePriorityChange(example.id, e.target.value as 'high' | 'medium' | 'low')}
                className={example.priority}
              >
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </PrioritySelect>
            </ControlsGroup>
            <p style={{ opacity: example.isEnabled ? 1 : 0.5 }}>{example.context}</p>
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
