import { Area } from '../types';
import { v4 as uuidv4 } from 'uuid';

export const createInitialData = (): Area[] => {
  const professionalId = uuidv4();
  const healthId = uuidv4();
  const socialId = uuidv4();
  const hobbiesId = uuidv4();
  const languagesId = uuidv4();
  const fitnessId = uuidv4();

  return [
    {
      id: professionalId,
      name: 'Professional',
      color: '#3b82f6',
      icon: '💼',
      description: 'Career and professional development',
      parentId: null,
      trackers: [
        { id: uuidv4(), name: 'Projects Completed', type: 'number', value: 12, target: 20, unit: 'projects' },
        { id: uuidv4(), name: 'Skills Learned', type: 'number', value: 5, target: 10 },
        { id: uuidv4(), name: 'Career Satisfaction', type: 'percentage', value: 75, min: 0, max: 100 },
      ],
      children: [],
    },
    {
      id: healthId,
      name: 'Health',
      color: '#22c55e',
      icon: '🏃',
      description: 'Physical and mental wellness',
      parentId: null,
      trackers: [
        { id: uuidv4(), name: 'Workouts This Week', type: 'number', value: 3, target: 5 },
        { id: uuidv4(), name: 'Sleep Quality', type: 'percentage', value: 80, min: 0, max: 100 },
      ],
      children: [
        {
          id: fitnessId,
          name: 'Fitness',
          color: '#16a34a',
          icon: '💪',
          description: 'Exercise and strength training',
          parentId: healthId,
          trackers: [
            { id: uuidv4(), name: 'Bench Press (lbs)', type: 'number', value: 185, target: 225, unit: 'lbs' },
            { id: uuidv4(), name: 'Running Pace', type: 'number', value: 8.5, target: 7.5, unit: 'min/mile' },
            { id: uuidv4(), name: 'Weekly Miles', type: 'progress', value: 15, target: 25, min: 0, max: 25 },
          ],
          children: [],
        },
      ],
    },
    {
      id: socialId,
      name: 'Social',
      color: '#ec4899',
      icon: '👥',
      description: 'Relationships and community',
      parentId: null,
      trackers: [
        { id: uuidv4(), name: 'Close Friends', type: 'number', value: 8 },
        { id: uuidv4(), name: 'Social Events/Month', type: 'number', value: 4, target: 6 },
      ],
      children: [],
    },
    {
      id: hobbiesId,
      name: 'Hobbies',
      color: '#f59e0b',
      icon: '🎨',
      description: 'Personal interests and creative pursuits',
      parentId: null,
      trackers: [],
      children: [
        {
          id: languagesId,
          name: 'Languages',
          color: '#d97706',
          icon: '🗣️',
          description: 'Language learning progress',
          parentId: hobbiesId,
          trackers: [
            { id: uuidv4(), name: 'Languages Started', type: 'number', value: 3 },
          ],
          children: [
            {
              id: uuidv4(),
              name: 'Japanese',
              color: '#dc2626',
              icon: '🇯🇵',
              description: 'Japanese language learning',
              parentId: languagesId,
              trackers: [
                { id: uuidv4(), name: 'WaniKani Level', type: 'level', value: 15, max: 60 },
                { id: uuidv4(), name: 'Kanji Known', type: 'progress', value: 450, target: 2136, min: 0, max: 2136 },
                { id: uuidv4(), name: 'Vocab Known', type: 'number', value: 2500, target: 10000 },
                { id: uuidv4(), name: 'JLPT Level', type: 'level', value: 3, max: 5, unit: 'N' },
              ],
              children: [],
            },
            {
              id: uuidv4(),
              name: 'French',
              color: '#2563eb',
              icon: '🇫🇷',
              description: 'French language learning',
              parentId: languagesId,
              trackers: [
                { id: uuidv4(), name: 'Duolingo Streak', type: 'number', value: 120, unit: 'days' },
                { id: uuidv4(), name: 'Words Learned', type: 'number', value: 1500, target: 5000 },
                { id: uuidv4(), name: 'Speaking Confidence', type: 'percentage', value: 40, min: 0, max: 100 },
              ],
              children: [],
            },
            {
              id: uuidv4(),
              name: 'Hindi',
              color: '#ea580c',
              icon: '🇮🇳',
              description: 'Hindi language learning',
              parentId: languagesId,
              trackers: [
                { id: uuidv4(), name: 'Script Mastery', type: 'percentage', value: 85, min: 0, max: 100 },
                { id: uuidv4(), name: 'Basic Conversations', type: 'boolean', value: 1 },
              ],
              children: [],
            },
          ],
        },
      ],
    },
  ];
};
