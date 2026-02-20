"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface Task {
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

interface Agent {
  id: string;
  name: string;
  role: string;
  status: 'working' | 'idle';
  location_x: number;
  location_y: number;
  current_task: string;
}

type Tab = "tasks" | "content" | "calendar" | "memory" | "team" | "office";
type ColumnType = 'todo' | 'in-progress' | 'done';

const API_BASE = '/api/supabase';

function TaskCard({ task, onUpdate, onDelete, onDragStart }: { 
  task: Task; 
  onUpdate: (id: number, updates: Partial<Task>) => void;
  onDelete: (id: number) => void;
  onDragStart: (e: React.DragEvent, taskId: number) => void;
}) {
  return (
    <div 
      className="kanban-card"
      draggable={true}
      onDragStart={(e) => {
        console.log('DragStart:', task.id);
        e.dataTransfer.setData('text/plain', task.id.toString());
        e.dataTransfer.effectAllowed = 'move';
        onDragStart(e, task.id);
      }}
    >
      <div className="card-priority dot"></div>
      <input 
        className="card-title"
        value={task.title}
        onChange={(e) => {
          e.stopPropagation();
          onUpdate(task.id, { title: e.target.value });
        }}
      />
      <div className="card-footer">
        <span className="card-assignee">
          {task.assigned_to === "me" ? "👤 Me" : "🤖 Claw"}
        </span>
        <button 
          className="delete-btn" 
          onClick={(e) => {
            e.stopPropagation();
            onDelete(task.id);
          }}
        >
          🗑️
        </button>
      </div>
    </div>
  );
}

function Column({ 
  id, 
  title, 
  tasks, 
  onUpdate, 
  onDelete,
  onDragOver,
  onDrop 
}: { 
  id: ColumnType;
  title: string;
  tasks: Task[];
  onUpdate: (id: number, updates: Partial<Task>) => void;
  onDelete: (id: number) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
}) {
  return (
    <div 
      className="kanban-column"
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <div className="column-header">
        <span className="column-title">{title}</span>
        <span className="column-count">{tasks.length}</span>
      </div>
      {tasks.map(task => (
        <TaskCard 
          key={task.id} 
          task={task} 
          onUpdate={onUpdate}
          onDelete={onDelete}
          onDragStart={handleDragStart}
        />
      ))}
    </div>
  );
}

export default function MissionControl() {
  const [activeTab, setActiveTab] = useState<Tab>("tasks");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const draggedTaskRef = useRef<number | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [tasksRes, agentsRes] = await Promise.all([
        fetch(`${API_BASE}?table=tasks`),
        fetch(`${API_BASE}?table=agents`)
      ]);
      
      const tasksData = await tasksRes.json();
      const agentsData = await agentsRes.json();
      
      setTasks(tasksData || []);
      setAgents(agentsData || []);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const addTask = async () => {
    try {
      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table: 'tasks',
          title: "New Task",
          status: "todo",
          assigned_to: "me"
        })
      });
      const newTask = await res.json();
      if (newTask && newTask[0]) {
        setTasks([newTask[0], ...tasks]);
      }
    } catch (err) {
      console.error('Error adding task:', err);
    }
  };

  const updateTask = async (id: number, updates: Partial<Task>) => {
    try {
      await fetch(API_BASE, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table: 'tasks', id, ...updates })
      });
      setTasks(tasks.map(t => t.id === id ? { ...t, ...updates } : t));
    } catch (err) {
      console.error('Error updating task:', err);
    }
  };

  const deleteTask = async (id: number) => {
    try {
      await fetch(`${API_BASE}?table=tasks&id=${id}`, { method: 'DELETE' });
      setTasks(tasks.filter(t => t.id !== id));
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  };

  const handleDragStart = (e: React.DragEvent, taskId: number) => {
    console.log('handleDragStart set:', taskId);
    draggedTaskRef.current = taskId;
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, newStatus: ColumnType) => {
    e.preventDefault();
    const taskId = draggedTaskRef.current;
    console.log('Drop:', taskId, 'to', newStatus);
    if (taskId) {
      const task = tasks.find(t => t.id === taskId);
      if (task && task.status !== newStatus) {
        updateTask(taskId, { status: newStatus });
      }
    }
    draggedTaskRef.current = null;
  };

  const tabs = [
    { id: "tasks", label: "Tasks", emoji: "📋" },
    { id: "content", label: "Content", emoji: "🎬" },
    { id: "calendar", label: "Calendar", emoji: "📅" },
    { id: "memory", label: "Memory", emoji: "🧠" },
    { id: "team", label: "Team", emoji: "👥" },
    { id: "office", label: "Office", emoji: "🏢" },
  ] as const;

  if (loading) {
    return <div className="mission-control"><div className="loading">Loading...</div></div>;
  }

  if (error) {
    return <div className="mission-control"><div className="loading">{error}</div></div>;
  }

  const todoTasks = tasks.filter(t => t.status === 'todo');
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress');
  const doneTasks = tasks.filter(t => t.status === 'done');

  return (
    <div className="mission-control">
      <header className="header">
        <div className="header-left">
          <h1>🎛️ Mission Control</h1>
        </div>
        <div className="header-center">
          <div className="search-box">
            <span>🔍</span>
            <input type="text" placeholder="Search anything..." />
          </div>
        </div>
        <div className="header-right">
          <span className="status-dot green"></span>
          <button className="pause-btn">⏸️ Pause</button>
          <span className="user-avatar">R</span>
        </div>
      </header>

      <div className="main-layout">
        <nav className="sidebar">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`nav-item ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="nav-emoji">{tab.emoji}</span>
              <span className="nav-label">{tab.label}</span>
            </button>
          ))}
        </nav>

        <main className="content">
          {activeTab === "tasks" && (
            <div className="tasks-view">
              <div className="section-header">
                <div className="header-info">
                  <h2>Tasks</h2>
                  <div className="stats">
                    <span>📅 This week: {tasks.length}</span>
                    <span>🔥 In progress: {inProgressTasks.length}</span>
                    <span>📊 Total: {tasks.length}</span>
                    <span className="completion">✓ {Math.round((doneTasks.length / Math.max(tasks.length, 1)) * 100)}%</span>
                  </div>
                </div>
                <button className="btn-primary" onClick={addTask}>+ New Task</button>
              </div>
              
              <div className="kanban">
                <Column 
                  id="todo" 
                  title="🤔 To Do" 
                  tasks={todoTasks} 
                  onUpdate={updateTask} 
                  onDelete={deleteTask}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, 'todo')}
                />
                <Column 
                  id="in-progress" 
                  title="🔥 In Progress" 
                  tasks={inProgressTasks} 
                  onUpdate={updateTask} 
                  onDelete={deleteTask}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, 'in-progress')}
                />
                <Column 
                  id="done" 
                  title="✅ Done" 
                  tasks={doneTasks} 
                  onUpdate={updateTask} 
                  onDelete={deleteTask}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, 'done')}
                />
              </div>
            </div>
          )}

          {activeTab === "office" && (
            <div className="office-view">
              <div className="section-header">
                <div className="header-info">
                  <h2>🏢 The Office</h2>
                  <p className="subtitle">AI team headquarters — live view</p>
                </div>
                <div className="demo-controls">
                  <button className="control-btn green">All Working</button>
                  <button className="control-btn blue">Gather</button>
                  <button className="control-btn amber">Run Meeting</button>
                  <button className="control-btn teal">Watercooler</button>
                </div>
              </div>
              
              <div className="office-layout">
                <div className="office-canvas">
                  <div className="floor-grid">
                    {agents.map(agent => (
                      <div 
                        key={agent.id} 
                        className={`desk ${agent.status}`}
                        style={{ left: agent.location_x, top: agent.location_y }}
                      >
                        <div className="desk-monitor">🖥️</div>
                        <div className="agent">
                          <span className="agent-face">🤖</span>
                          <span className="agent-name">{agent.name}</span>
                          {agent.current_task && (
                            <span className="agent-task">{agent.current_task}</span>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    <div className="conference-table">
                      <span>🪑🪑🪑</span>
                    </div>
                    
                    <div className="plant" style={{ left: 50, top: 50 }}>🪴</div>
                    <div className="coffee-station" style={{ left: 50, top: 300 }}>☕</div>
                  </div>
                </div>
                
                <div className="live-activity">
                  <h3>Live Activity</h3>
                  <div className="activity-feed">
                    <p className="empty-state">No recent activity</p>
                  </div>
                </div>
              </div>
              
              <div className="legend">
                <span>🟢 Working</span>
                <span>🟡 Idle</span>
              </div>
            </div>
          )}

          {activeTab === "team" && (
            <div className="team-view">
              <h2>👥 Team</h2>
              <div className="team-grid">
                {agents.map(agent => (
                  <div key={agent.id} className="team-card">
                    <div className="team-avatar">{agent.name[0]}</div>
                    <h4>{agent.name}</h4>
                    <span className="role">{agent.role}</span>
                    <span className={`status ${agent.status}`}>
                      {agent.status === "working" ? "🟢 Working" : "🟡 Idle"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "memory" && (
            <div className="memory-view">
              <h2>🧠 Memory</h2>
              <div className="memory-search">
                <input type="text" placeholder="🔍 Search memories..." />
              </div>
              <p className="empty-state">Memories will appear here.</p>
            </div>
          )}

          {activeTab === "calendar" && (
            <div className="calendar-view">
              <h2>📅 Calendar</h2>
              <p className="empty-state">Scheduled tasks will appear here.</p>
            </div>
          )}

          {activeTab === "content" && (
            <div className="content-view">
              <h2>🎬 Content Pipeline</h2>
              <p className="empty-state">Content pipeline coming soon.</p>
            </div>
          )}
        </main>
      </div>

      <style>{`
        .mission-control { min-height: 100vh; background: #0d0d12; color: #e0e0e0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
        .loading { display: flex; align-items: center; justify-content: center; height: 100vh; font-size: 1.5rem; }
        .header { display: flex; align-items: center; justify-content: space-between; padding: 12px 24px; background: #151520; border-bottom: 1px solid #252535; }
        .header h1 { font-size: 1.2rem; font-weight: 600; }
        .search-box { display: flex; align-items: center; gap: 8px; background: #1a1a28; padding: 8px 16px; border-radius: 8px; border: 1px solid #252535; }
        .search-box input { background: transparent; border: none; color: #888; width: 300px; outline: none; }
        .header-right { display: flex; align-items: center; gap: 16px; }
        .status-dot { width: 8px; height: 8px; border-radius: 50%; }
        .status-dot.green { background: #00ff88; }
        .pause-btn { background: #1a1a28; border: 1px solid #252535; color: #888; padding: 6px 12px; border-radius: 6px; cursor: pointer; }
        .user-avatar { width: 32px; height: 32px; background: linear-gradient(135deg, #7c3aed 0%, #db2777 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 0.9rem; }
        .main-layout { display: flex; height: calc(100vh - 60px); }
        .sidebar { width: 180px; background: #151520; border-right: 1px solid #252535; padding: 16px 8px; display: flex; flex-direction: column; gap: 4px; }
        .nav-item { display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-radius: 8px; background: transparent; border: none; color: #888; cursor: pointer; font-size: 0.95rem; text-align: left; transition: all 0.2s; }
        .nav-item:hover { background: #1a1a28; color: #e0e0e0; }
        .nav-item.active { background: linear-gradient(135deg, #7c3aed20 0%, #db277720 100%); color: #a78bfa; }
        .content { flex: 1; padding: 24px; overflow-y: auto; }
        .section-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
        .header-info h2 { font-size: 1.5rem; margin-bottom: 8px; }
        .subtitle { color: #666; font-size: 0.9rem; }
        .stats { display: flex; gap: 20px; color: #888; font-size: 0.85rem; }
        .completion { color: #00ff88; font-weight: 600; }
        .btn-primary { background: linear-gradient(135deg, #7c3aed 0%, #db2777 100%); border: none; color: white; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; }
        .kanban { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .kanban-column { background: #151520; border-radius: 12px; padding: 16px; min-height: 400px; }
        .column-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid #252535; }
        .column-title { font-weight: 600; font-size: 0.9rem; }
        .column-count { background: #252535; padding: 2px 8px; border-radius: 10px; font-size: 0.8rem; color: #888; }
        .kanban-card { background: #1a1a28; border-radius: 8px; padding: 12px; margin-bottom: 12px; border-left: 3px solid #7c3aed; cursor: grab; }
        .kanban-card:active { cursor: grabbing; }
        .card-priority { width: 6px; height: 6px; border-radius: 50%; background: #00ff88; margin-bottom: 8px; }
        .card-title { background: transparent; border: none; color: #e0e0e0; width: 100%; font-size: 0.95rem; margin-bottom: 8px; outline: none; }
        .card-footer { display: flex; justify-content: space-between; font-size: 0.75rem; color: #666; }
        .delete-btn { background: transparent; border: none; cursor: pointer; }
        .office-layout { display: flex; gap: 20px; }
        .office-canvas { flex: 1; height: 500px; background: #151520; border-radius: 12px; position: relative; background-image: linear-gradient(#1f1f2e 1px, transparent 1px), linear-gradient(90deg, #1f1f2e 1px, transparent 1px); background-size: 40px 40px; }
        .desk { position: absolute; display: flex; flex-direction: column; align-items: center; }
        .desk-monitor { font-size: 2rem; }
        .agent { position: absolute; bottom: -30px; display: flex; flex-direction: column; align-items: center; }
        .agent.working .agent-face { filter: drop-shadow(0 0 10px #00ff88); }
        .agent-face { font-size: 2.5rem; }
        .agent-name { font-size: 0.7rem; font-weight: 600; color: #7c3aed; }
        .agent-task { font-size: 0.6rem; color: #666; max-width: 80px; text-align: center; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .conference-table { position: absolute; bottom: 80px; left: 50%; transform: translateX(-50%); font-size: 2rem; }
        .plant { position: absolute; font-size: 2rem; }
        .coffee-station { position: absolute; font-size: 2rem; }
        .live-activity { width: 250px; background: #151520; border-radius: 12px; padding: 16px; }
        .live-activity h3 { font-size: 0.9rem; margin-bottom: 16px; color: #888; }
        .activity-feed .empty-state { color: #444; font-size: 0.85rem; text-align: center; padding: 40px 0; }
        .demo-controls { display: flex; gap: 8px; }
        .control-btn { padding: 6px 14px; border-radius: 6px; border: none; font-size: 0.8rem; font-weight: 600; cursor: pointer; }
        .control-btn.green { background: #00ff8820; color: #00ff88; }
        .control-btn.blue { background: #3b82f620; color: #3b82f6; }
        .control-btn.amber { background: #f59e0b20; color: #f59e0b; }
        .control-btn.teal { background: #14b8a620; color: #14b8a6; }
        .legend { display: flex; gap: 24px; margin-top: 16px; font-size: 0.8rem; color: #666; }
        .team-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 16px; }
        .team-card { background: #151520; border-radius: 12px; padding: 24px; text-align: center; }
        .team-avatar { width: 50px; height: 50px; background: linear-gradient(135deg, #7c3aed 0%, #db2777 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; font-weight: 600; margin: 0 auto 12px; }
        .role { display: inline-block; background: #7c3aed20; color: #7c3aed; padding: 4px 12px; border-radius: 12px; font-size: 0.75rem; margin: 8px 0; }
        .empty-state { color: #444; text-align: center; padding: 60px; }
        .memory-search input { width: 100%; padding: 14px; background: #151520; border: 1px solid #252535; border-radius: 8px; color: #e0e0e0; margin-bottom: 24px; }
      `}</style>
    </div>
  );
}
