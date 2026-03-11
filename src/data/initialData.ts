import { Area } from '../types';
import { v4 as uuidv4 } from 'uuid';

export const createInitialData = (): Area[] => {
  // Generate all IDs upfront for parent references
  const healthId = uuidv4();
  const careerId = uuidv4();
  const financesId = uuidv4();
  const relationshipsId = uuidv4();
  const growthId = uuidv4();
  const recreationId = uuidv4();

  // Health sub-areas
  const physicalFitnessId = uuidv4();
  const nutritionId = uuidv4();
  const sleepId = uuidv4();
  const mentalHealthId = uuidv4();

  // Career sub-areas
  const currentRoleId = uuidv4();
  const skillsLearningId = uuidv4();
  const sideProjectsId = uuidv4();
  const networkingId = uuidv4();

  // Finances sub-areas
  const savingsId = uuidv4();
  const investmentsId = uuidv4();
  const debtId = uuidv4();
  const budgetingId = uuidv4();

  // Relationships sub-areas
  const familyId = uuidv4();
  const friendsId = uuidv4();
  const romanticId = uuidv4();
  const communityId = uuidv4();

  // Growth sub-areas
  const learningId = uuidv4();
  const habitsId = uuidv4();
  const mindfulnessId = uuidv4();
  const languagesId = uuidv4();

  // Recreation sub-areas
  const creativeId = uuidv4();
  const sportsOutdoorsId = uuidv4();
  const travelId = uuidv4();
  const entertainmentId = uuidv4();

  return [
    // ============ HEALTH ============
    {
      id: healthId,
      name: 'Health',
      color: '#22c55e',
      icon: '💚',
      description: 'Physical and mental wellness',
      parentId: null,
      targetProgress: 80,
      targetDate: '2025-12-31',
      aggregation: 'average',
      trackers: [],
      children: [
        {
          id: physicalFitnessId,
          name: 'Physical Fitness',
          color: '#16a34a',
          icon: '🏋️',
          description: 'Exercise, strength, and cardiovascular health',
          parentId: healthId,
          trackers: [
            { id: uuidv4(), name: 'Workouts This Week', type: 'number', value: 0, target: 5 },
            { id: uuidv4(), name: 'Weekly Cardio Minutes', type: 'progress', value: 0, target: 150, min: 0, max: 150 },
            { id: uuidv4(), name: 'Strength Training Days', type: 'number', value: 0, target: 3 },
            { id: uuidv4(), name: 'Daily Steps Average', type: 'number', value: 0, target: 10000, unit: 'steps' },
          ],
          children: [],
        },
        {
          id: nutritionId,
          name: 'Nutrition',
          color: '#84cc16',
          icon: '🥗',
          description: 'Diet quality and eating habits',
          parentId: healthId,
          trackers: [
            { id: uuidv4(), name: 'Water Intake', type: 'progress', value: 0, target: 8, min: 0, max: 8, unit: 'glasses' },
            { id: uuidv4(), name: 'Meals Prepped', type: 'number', value: 0, target: 5 },
            { id: uuidv4(), name: 'Protein Goal Met', type: 'percentage', value: 0, min: 0, max: 100 },
            { id: uuidv4(), name: 'Processed Food Days', type: 'number', value: 0, target: 2 },
          ],
          children: [],
        },
        {
          id: sleepId,
          name: 'Sleep',
          color: '#6366f1',
          icon: '😴',
          description: 'Rest and recovery',
          parentId: healthId,
          trackers: [
            { id: uuidv4(), name: 'Hours Per Night', type: 'number', value: 0, target: 8, unit: 'hrs' },
            { id: uuidv4(), name: 'Sleep Quality', type: 'percentage', value: 0, min: 0, max: 100 },
            { id: uuidv4(), name: 'Consistent Bedtime', type: 'boolean', value: 0 },
            { id: uuidv4(), name: 'Screen-Free Before Bed', type: 'boolean', value: 0 },
          ],
          children: [],
        },
        {
          id: mentalHealthId,
          name: 'Mental Health',
          color: '#a855f7',
          icon: '🧠',
          description: 'Psychological wellbeing and stress management',
          parentId: healthId,
          trackers: [
            { id: uuidv4(), name: 'Mood Rating', type: 'level', value: 0, max: 10 },
            { id: uuidv4(), name: 'Stress Level', type: 'level', value: 0, max: 10 },
            { id: uuidv4(), name: 'Therapy Sessions This Month', type: 'number', value: 0, target: 4 },
            { id: uuidv4(), name: 'Mental Health Days Taken', type: 'number', value: 0 },
          ],
          children: [],
        },
      ],
    },

    // ============ CAREER ============
    {
      id: careerId,
      name: 'Career',
      color: '#3b82f6',
      icon: '💼',
      description: 'Professional growth and work life',
      parentId: null,
      targetProgress: 75,
      aggregation: 'average',
      trackers: [],
      children: [
        {
          id: currentRoleId,
          name: 'Current Role',
          color: '#2563eb',
          icon: '🎯',
          description: 'Performance in current position',
          parentId: careerId,
          trackers: [
            { id: uuidv4(), name: 'Job Satisfaction', type: 'percentage', value: 0, min: 0, max: 100 },
            { id: uuidv4(), name: 'Goals Completed This Quarter', type: 'progress', value: 0, target: 5, min: 0, max: 5 },
            { id: uuidv4(), name: 'Performance Review Score', type: 'level', value: 0, max: 5 },
            { id: uuidv4(), name: 'Projects Delivered', type: 'number', value: 0 },
          ],
          children: [],
        },
        {
          id: skillsLearningId,
          name: 'Skills & Learning',
          color: '#0ea5e9',
          icon: '📚',
          description: 'Professional development and upskilling',
          parentId: careerId,
          trackers: [
            { id: uuidv4(), name: 'Courses Completed', type: 'number', value: 0 },
            { id: uuidv4(), name: 'Certifications Earned', type: 'number', value: 0 },
            { id: uuidv4(), name: 'Technical Books Read', type: 'number', value: 0, target: 6 },
            { id: uuidv4(), name: 'New Skills This Year', type: 'number', value: 0, target: 3 },
          ],
          children: [],
        },
        {
          id: sideProjectsId,
          name: 'Side Projects',
          color: '#8b5cf6',
          icon: '🚀',
          description: 'Personal and open source projects',
          parentId: careerId,
          trackers: [
            { id: uuidv4(), name: 'Active Projects', type: 'number', value: 0 },
            { id: uuidv4(), name: 'Projects Shipped', type: 'number', value: 0 },
            { id: uuidv4(), name: 'Weekly Hours Invested', type: 'number', value: 0, target: 5, unit: 'hrs' },
            { id: uuidv4(), name: 'GitHub Contributions', type: 'number', value: 0 },
          ],
          children: [],
        },
        {
          id: networkingId,
          name: 'Networking',
          color: '#06b6d4',
          icon: '🤝',
          description: 'Professional relationships and community',
          parentId: careerId,
          trackers: [
            { id: uuidv4(), name: 'Coffee Chats This Month', type: 'number', value: 0, target: 4 },
            { id: uuidv4(), name: 'Conferences/Meetups Attended', type: 'number', value: 0 },
            { id: uuidv4(), name: 'LinkedIn Connections', type: 'number', value: 0 },
            { id: uuidv4(), name: 'Mentorship Sessions', type: 'number', value: 0, target: 2 },
          ],
          children: [],
        },
      ],
    },

    // ============ FINANCES ============
    {
      id: financesId,
      name: 'Finances',
      color: '#f59e0b',
      icon: '💰',
      description: 'Financial health and money management',
      parentId: null,
      trackers: [],
      children: [
        {
          id: savingsId,
          name: 'Savings',
          color: '#d97706',
          icon: '🏦',
          description: 'Emergency fund and savings goals',
          parentId: financesId,
          trackers: [
            { id: uuidv4(), name: 'Emergency Fund', type: 'progress', value: 0, target: 100, min: 0, max: 100, unit: '%' },
            { id: uuidv4(), name: 'Savings Rate', type: 'percentage', value: 0, min: 0, max: 100 },
            { id: uuidv4(), name: 'Monthly Savings Goal Met', type: 'boolean', value: 0 },
          ],
          children: [],
        },
        {
          id: investmentsId,
          name: 'Investments',
          color: '#65a30d',
          icon: '📈',
          description: 'Investment portfolio and retirement',
          parentId: financesId,
          trackers: [
            { id: uuidv4(), name: 'Portfolio Growth YTD', type: 'percentage', value: 0, min: -50, max: 100 },
            { id: uuidv4(), name: 'Retirement Contribution', type: 'boolean', value: 0 },
            { id: uuidv4(), name: 'Investment Accounts Funded', type: 'number', value: 0 },
          ],
          children: [],
        },
        {
          id: debtId,
          name: 'Debt',
          color: '#ef4444',
          icon: '📉',
          description: 'Debt payoff progress',
          parentId: financesId,
          trackers: [
            { id: uuidv4(), name: 'Debt Payoff Progress', type: 'percentage', value: 0, min: 0, max: 100 },
            { id: uuidv4(), name: 'Accounts Paid Off', type: 'number', value: 0 },
            { id: uuidv4(), name: 'On Track for Payoff Goal', type: 'boolean', value: 0 },
          ],
          children: [],
        },
        {
          id: budgetingId,
          name: 'Budgeting',
          color: '#eab308',
          icon: '📊',
          description: 'Spending and budget tracking',
          parentId: financesId,
          trackers: [
            { id: uuidv4(), name: 'Budget Adherence', type: 'percentage', value: 0, min: 0, max: 100 },
            { id: uuidv4(), name: 'Subscriptions Audited', type: 'boolean', value: 0 },
            { id: uuidv4(), name: 'Expense Categories Tracked', type: 'number', value: 0 },
          ],
          children: [],
        },
      ],
    },

    // ============ RELATIONSHIPS ============
    {
      id: relationshipsId,
      name: 'Relationships',
      color: '#ec4899',
      icon: '❤️',
      description: 'Connections with people who matter',
      parentId: null,
      trackers: [],
      children: [
        {
          id: familyId,
          name: 'Family',
          color: '#db2777',
          icon: '👨‍👩‍👧‍👦',
          description: 'Family relationships and time together',
          parentId: relationshipsId,
          trackers: [
            { id: uuidv4(), name: 'Family Calls/Visits This Week', type: 'number', value: 0, target: 2 },
            { id: uuidv4(), name: 'Quality Time Hours', type: 'number', value: 0, target: 5, unit: 'hrs' },
            { id: uuidv4(), name: 'Family Relationship Satisfaction', type: 'percentage', value: 0, min: 0, max: 100 },
          ],
          children: [],
        },
        {
          id: friendsId,
          name: 'Friends',
          color: '#f472b6',
          icon: '👯',
          description: 'Friendships and social connections',
          parentId: relationshipsId,
          trackers: [
            { id: uuidv4(), name: 'Close Friends', type: 'number', value: 0 },
            { id: uuidv4(), name: 'Social Events This Month', type: 'number', value: 0, target: 4 },
            { id: uuidv4(), name: 'Friends Reached Out To', type: 'number', value: 0, target: 5 },
            { id: uuidv4(), name: 'New Friendships This Year', type: 'number', value: 0 },
          ],
          children: [],
        },
        {
          id: romanticId,
          name: 'Romantic',
          color: '#e11d48',
          icon: '💕',
          description: 'Romantic relationship nurturing',
          parentId: relationshipsId,
          trackers: [
            { id: uuidv4(), name: 'Date Nights This Month', type: 'number', value: 0, target: 4 },
            { id: uuidv4(), name: 'Relationship Satisfaction', type: 'percentage', value: 0, min: 0, max: 100 },
            { id: uuidv4(), name: 'Quality Conversations', type: 'number', value: 0, target: 7 },
          ],
          children: [],
        },
        {
          id: communityId,
          name: 'Community',
          color: '#c026d3',
          icon: '🌍',
          description: 'Giving back and community involvement',
          parentId: relationshipsId,
          trackers: [
            { id: uuidv4(), name: 'Volunteer Hours This Month', type: 'number', value: 0, target: 8, unit: 'hrs' },
            { id: uuidv4(), name: 'Organizations Involved In', type: 'number', value: 0 },
            { id: uuidv4(), name: 'Community Events Attended', type: 'number', value: 0 },
          ],
          children: [],
        },
      ],
    },

    // ============ GROWTH ============
    {
      id: growthId,
      name: 'Growth',
      color: '#8b5cf6',
      icon: '🌱',
      description: 'Personal development and self-improvement',
      parentId: null,
      trackers: [],
      children: [
        {
          id: learningId,
          name: 'Learning',
          color: '#7c3aed',
          icon: '📖',
          description: 'Knowledge acquisition and education',
          parentId: growthId,
          trackers: [
            { id: uuidv4(), name: 'Books Read This Year', type: 'number', value: 0, target: 24 },
            { id: uuidv4(), name: 'Courses In Progress', type: 'number', value: 0 },
            { id: uuidv4(), name: 'Podcasts/Week', type: 'number', value: 0, target: 5 },
            { id: uuidv4(), name: 'Learning Hours This Week', type: 'number', value: 0, target: 5, unit: 'hrs' },
          ],
          children: [],
        },
        {
          id: habitsId,
          name: 'Habits',
          color: '#a78bfa',
          icon: '✅',
          description: 'Daily routines and habit building',
          parentId: growthId,
          trackers: [
            { id: uuidv4(), name: 'Morning Routine Completed', type: 'percentage', value: 0, min: 0, max: 100 },
            { id: uuidv4(), name: 'Habit Streak Days', type: 'number', value: 0, unit: 'days' },
            { id: uuidv4(), name: 'Habits Tracked', type: 'number', value: 0 },
            { id: uuidv4(), name: 'Weekly Habit Success Rate', type: 'percentage', value: 0, min: 0, max: 100 },
          ],
          children: [],
        },
        {
          id: mindfulnessId,
          name: 'Mindfulness',
          color: '#6366f1',
          icon: '🧘',
          description: 'Meditation, reflection, and presence',
          parentId: growthId,
          trackers: [
            { id: uuidv4(), name: 'Meditation Minutes Today', type: 'number', value: 0, target: 20, unit: 'min' },
            { id: uuidv4(), name: 'Meditation Streak', type: 'number', value: 0, unit: 'days' },
            { id: uuidv4(), name: 'Journal Entries This Week', type: 'number', value: 0, target: 7 },
            { id: uuidv4(), name: 'Gratitude Practice', type: 'boolean', value: 0 },
          ],
          children: [],
        },
        {
          id: languagesId,
          name: 'Languages',
          color: '#f97316',
          icon: '🗣️',
          description: 'Language learning progress',
          parentId: growthId,
          trackers: [
            { id: uuidv4(), name: 'Languages In Progress', type: 'number', value: 3 },
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
                { id: uuidv4(), name: 'WaniKani Level', type: 'level', value: 0, max: 60 },
                { id: uuidv4(), name: 'Kanji Known', type: 'progress', value: 0, target: 2136, min: 0, max: 2136 },
                { id: uuidv4(), name: 'Vocab Known', type: 'number', value: 0, target: 10000 },
                { id: uuidv4(), name: 'JLPT Level', type: 'level', value: 0, max: 5, unit: 'N' },
                { id: uuidv4(), name: 'Immersion Hours/Week', type: 'number', value: 0, target: 10, unit: 'hrs' },
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
                { id: uuidv4(), name: 'Duolingo Streak', type: 'number', value: 0, unit: 'days' },
                { id: uuidv4(), name: 'Words Learned', type: 'number', value: 0, target: 5000 },
                { id: uuidv4(), name: 'Speaking Confidence', type: 'percentage', value: 0, min: 0, max: 100 },
                { id: uuidv4(), name: 'Conversations This Week', type: 'number', value: 0, target: 3 },
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
                { id: uuidv4(), name: 'Devanagari Script Mastery', type: 'percentage', value: 0, min: 0, max: 100 },
                { id: uuidv4(), name: 'Words Learned', type: 'number', value: 0, target: 3000 },
                { id: uuidv4(), name: 'Can Hold Basic Conversation', type: 'boolean', value: 0 },
              ],
              children: [],
            },
          ],
        },
      ],
    },

    // ============ RECREATION ============
    {
      id: recreationId,
      name: 'Recreation',
      color: '#06b6d4',
      icon: '🎮',
      description: 'Fun, hobbies, and leisure activities',
      parentId: null,
      trackers: [],
      children: [
        {
          id: creativeId,
          name: 'Creative',
          color: '#0891b2',
          icon: '🎨',
          description: 'Artistic and creative pursuits',
          parentId: recreationId,
          trackers: [
            { id: uuidv4(), name: 'Creative Hours This Week', type: 'number', value: 0, target: 5, unit: 'hrs' },
            { id: uuidv4(), name: 'Projects In Progress', type: 'number', value: 0 },
            { id: uuidv4(), name: 'Pieces Completed This Month', type: 'number', value: 0 },
            { id: uuidv4(), name: 'New Techniques Learned', type: 'number', value: 0 },
          ],
          children: [],
        },
        {
          id: sportsOutdoorsId,
          name: 'Sports & Outdoors',
          color: '#059669',
          icon: '🏔️',
          description: 'Active recreation and nature',
          parentId: recreationId,
          trackers: [
            { id: uuidv4(), name: 'Outdoor Activities This Month', type: 'number', value: 0, target: 8 },
            { id: uuidv4(), name: 'Hikes Completed', type: 'number', value: 0 },
            { id: uuidv4(), name: 'Sports Games Played', type: 'number', value: 0 },
            { id: uuidv4(), name: 'New Activities Tried', type: 'number', value: 0 },
          ],
          children: [],
        },
        {
          id: travelId,
          name: 'Travel',
          color: '#0d9488',
          icon: '✈️',
          description: 'Exploration and adventures',
          parentId: recreationId,
          trackers: [
            { id: uuidv4(), name: 'Trips This Year', type: 'number', value: 0, target: 4 },
            { id: uuidv4(), name: 'New Places Visited', type: 'number', value: 0 },
            { id: uuidv4(), name: 'Countries Visited (Lifetime)', type: 'number', value: 0 },
            { id: uuidv4(), name: 'Trip Planned', type: 'boolean', value: 0 },
          ],
          children: [],
        },
        {
          id: entertainmentId,
          name: 'Entertainment',
          color: '#7c3aed',
          icon: '🎬',
          description: 'Media and leisure consumption',
          parentId: recreationId,
          trackers: [
            { id: uuidv4(), name: 'Movies Watched This Month', type: 'number', value: 0 },
            { id: uuidv4(), name: 'TV Shows Completed', type: 'number', value: 0 },
            { id: uuidv4(), name: 'Games Played', type: 'number', value: 0 },
            { id: uuidv4(), name: 'Concerts/Events Attended', type: 'number', value: 0 },
          ],
          children: [],
        },
      ],
    },
  ];
};
