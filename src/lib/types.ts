// Mission Control - Task definitions and types
// Based on Alex Finn's Mission Control concept

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'done';
  assignedTo: 'me' | 'claw';
  createdAt: string;
  updatedAt: string;
}

export interface ContentItem {
  id: string;
  title: string;
  stage: 'idea' | 'script' | 'thumbnail' | 'filming' | 'done';
  script?: string;
  thumbnailUrl?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ScheduledTask {
  id: string;
  title: string;
  description?: string;
  scheduledFor: string; // ISO date
  cronExpression?: string;
  completed: boolean;
  createdAt: string;
}

export interface Memory {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: 'developer' | 'writer' | 'designer' | 'manager' | 'main';
  status: 'working' | 'idle' | 'waiting';
  currentTask?: string;
  avatar?: string;
}

export interface Agent {
  id: string;
  name: string;
  role: string;
  status: 'working' | 'idle';
  location: { x: number; y: number };
  currentTask?: string;
}

// Initial demo data
export const initialTasks: Task[] = [
  {
    id: '1',
    title: 'Set up Mission Control',
    description: 'Build the mission control dashboard',
    status: 'in-progress',
    assignedTo: 'claw',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Review eatmacandcheese.com',
    description: 'Check the site and provide feedback',
    status: 'todo',
    assignedTo: 'me',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const initialContent: ContentItem[] = [
  {
    id: '1',
    title: 'OpenClaw Tutorial Video',
    stage: 'script',
    script: '# OpenClaw Tutorial\n\nIntroduction to OpenClaw...',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Vibe Coding Tips',
    stage: 'idea',
    notes: 'Quick tips for vibe coding',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const initialScheduled: ScheduledTask[] = [
  {
    id: '1',
    title: 'Daily OpenClaw Digest',
    description: 'Send daily news digest at 6:30am',
    scheduledFor: '2026-02-19T06:30:00',
    cronExpression: '30 6 * * *',
    completed: false,
    createdAt: new Date().toISOString(),
  },
];

export const initialTeam: Agent[] = [
  {
    id: 'main',
    name: 'Henry',
    role: 'Main Agent',
    status: 'working',
    location: { x: 100, y: 150 },
    currentTask: 'Building Mission Control',
  },
  {
    id: 'coder',
    name: 'Dev Agent',
    role: 'Developer',
    status: 'idle',
    location: { x: 300, y: 150 },
  },
  {
    id: 'writer',
    name: 'Writer Agent',
    role: 'Writer',
    status: 'idle',
    location: { x: 500, y: 150 },
  },
];
