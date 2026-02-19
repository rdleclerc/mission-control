import { createClient } from '@supabase/supabase-js';

// Use anon key for client-side (safe to expose)
const supabaseUrl = 'https://your-project.supabase.co';
const supabaseAnonKey = 'YOUR_ANON_KEY_HERE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Task {
  id: number;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'done';
  assigned_to: 'me' | 'claw';
  priority: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface Agent {
  id: string;
  name: string;
  role: string;
  status: 'working' | 'idle';
  location_x: number;
  location_y: number;
  current_task: string;
  avatar: string;
}

export interface Memory {
  id: number;
  title: string;
  content: string;
  tags: string[];
  created_at: string;
}

export async function getTasks(): Promise<Task[]> {
  const { data, error } = await supabase.from('tasks').select('*').order('created_at', { ascending: false });
  if (error) {
    console.error('Error fetching tasks:', error);
    return [];
  }
  return data || [];
}

export async function getAgents(): Promise<Agent[]> {
  const { data, error } = await supabase.from('agents').select('*');
  if (error) {
    console.error('Error fetching agents:', error);
    return [];
  }
  return data || [];
}

export async function addTask(task: { title: string; description?: string; status?: string; assigned_to?: string }) {
  const { error } = await supabase.from('tasks').insert([task]);
  if (error) {
    console.error('Error adding task:', error);
    throw error;
  }
}

export async function updateTask(id: number, updates: Partial<Task>) {
  const { error } = await supabase.from('tasks').update(updates).eq('id', id);
  if (error) {
    console.error('Error updating task:', error);
    throw error;
  }
}

export async function deleteTask(id: number) {
  const { error } = await supabase.from('tasks').delete().eq('id', id);
  if (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
}
