'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/app/lib/axios';

interface Task {
  id: string;
  title: string;
  matter: string;
  time: string;
  dueDate?: string;
  priority: string;
  completed: boolean;
}

export default function AdminTasksPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'COMPLETED' | 'OVERDUE'>('ALL');

  // New Task Form State
  const [title, setTitle] = useState('');
  const [matter, setMatter] = useState('');
  const [time, setTime] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('NORMAL');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadTasks = async () => {
      setLoading(true);
      try {
        const res = await api.get('/tasks');
        setTasks(res.data.data || []);
      } catch (err) {
        console.error('Failed to fetch tasks:', err);
      } finally {
        setLoading(false);
      }
    };

    void loadTasks();
  }, []);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    setSubmitting(true);
    try {
      const res = await api.post('/tasks', {
        title,
        matter: matter || 'General Matter',
        time: time || '12:00 PM',
        dueDate: dueDate || new Date().toISOString().split('T')[0],
        priority,
      });
      setTasks([res.data.data, ...tasks]);
      setTitle('');
      setMatter('');
      setTime('');
      setDueDate('');
      alert('Task created successfully!');
    } catch (err) {
      console.error('Failed to create task:', err);
      alert('Failed to create task.');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleTask = async (id: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: newStatus } : t));
    try {
      await api.patch(`/tasks/${id}`, { completed: newStatus });
    } catch {
      setTasks(tasks.map(t => t.id === id ? { ...t, completed: currentStatus } : t));
    }
  };

  // Helper to check if a task is overdue
  const isOverdue = (task: Task) => {
    if (task.completed) return false;
    if (!task.dueDate) return false;
    const today = new Date().toISOString().split('T')[0];
    return task.dueDate < today;
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'PENDING') return !task.completed && !isOverdue(task);
    if (filter === 'COMPLETED') return task.completed;
    if (filter === 'OVERDUE') return isOverdue(task);
    return true;
  });

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#0A2647] font-sans p-6 lg:p-10 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-6">
        <div>
          <button onClick={() => router.push('/admin/dashboard')} className="text-xs text-[#C49A6C] font-semibold mb-2 block hover:underline">
            ← Back to Dashboard
          </button>
          <h1 className="text-2xl font-serif font-bold text-[#0A2647]">Firm Task Management</h1>
          <p className="text-xs text-[#738290]">Create, organize, and monitor all firm assignments.</p>
        </div>
        <div className="flex gap-2">
          {(['ALL', 'PENDING', 'COMPLETED', 'OVERDUE'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wider ${
                filter === tab ? 'bg-[#0A2647] text-white' : 'bg-white border text-[#738290]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Create Task Form */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4 h-fit">
          <h3 className="font-serif font-bold text-base text-[#0A2647] border-b pb-3">Create New Task</h3>
          <form onSubmit={handleCreateTask} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold mb-1">Task Title</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="e.g. Draft settlement agreement"
                required
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Related Matter</label>
              <input
                type="text"
                value={matter}
                onChange={e => setMatter(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="e.g. Jenkins v. Altura"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold mb-1">Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Time</label>
                <input
                  type="text"
                  value={time}
                  onChange={e => setTime(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="2:00 PM"
                />
              </div>
            </div>
            <div>
              <label className="block font-semibold mb-1">Priority</label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="NORMAL">Normal</option>
                <option value="HIGH">High Priority</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 bg-[#C49A6C] hover:bg-[#b58b5e] text-white font-semibold rounded-lg shadow uppercase tracking-wider"
            >
              {submitting ? 'Saving...' : 'Add Task'}
            </button>
          </form>
        </div>

        {/* Task List Table / Cards */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
          <h3 className="font-serif font-bold text-base text-[#0A2647] border-b pb-3">
            Tasks List ({filteredTasks.length})
          </h3>

          {loading ? (
            <p className="text-xs text-[#738290] py-4">Loading tasks...</p>
          ) : filteredTasks.length === 0 ? (
            <p className="text-xs text-[#738290] py-4">No tasks found under this filter.</p>
          ) : (
            <div className="space-y-3">
              {filteredTasks.map(task => {
                const overdue = isOverdue(task);
                return (
                  <div key={task.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => toggleTask(task.id, task.completed)}
                        className="mt-1 accent-[#C49A6C]"
                      />
                      <div>
                        <span className={`font-semibold text-sm block ${task.completed ? 'line-through text-gray-400' : 'text-[#0A2647]'}`}>
                          {task.title}
                        </span>
                        <span className="text-[10px] text-[#738290]">{task.matter} · Due: {task.dueDate || 'Today'} at {task.time}</span>
                      </div>
                    </div>
                    <div>
                      {task.completed ? (
                        <span className="text-[10px] bg-green-50 text-green-700 font-semibold px-2 py-0.5 rounded">Completed</span>
                      ) : overdue ? (
                        <span className="text-[10px] bg-red-50 text-red-700 font-semibold px-2 py-0.5 rounded">Overdue</span>
                      ) : (
                        <span className="text-[10px] bg-amber-50 text-amber-700 font-semibold px-2 py-0.5 rounded">Pending</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}