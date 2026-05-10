import React, { useEffect, useState } from 'react';
import api from '../api';

const Dashboard = ({ user }) => {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [summary, setSummary] = useState({ todo: 0, inProgress: 0, completed: 0, overdue: 0 });
  const [newProject, setNewProject] = useState({ title: '', description: '' });
  const [newTask, setNewTask] = useState({ title: '', projectId: '', assignedTo: '', dueDate: '' });
  const [message, setMessage] = useState('');

  const loadData = async () => {
    try {
      const [projectRes, taskRes, summaryRes] = await Promise.all([
        api.get('/projects'),
        api.get('/tasks'),
        api.get('/tasks/dashboard/summary'),
      ]);
      setProjects(projectRes.data);
      setTasks(taskRes.data);
      setSummary(summaryRes.data);
      if (projectRes.data.length > 0 && !newTask.projectId) {
        setNewTask((prev) => ({ ...prev, projectId: projectRes.data[0]._id }));
      }
    } catch (error) {
      setMessage('Unable to load data.');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleProjectSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/projects', { ...newProject });
      setNewProject({ title: '', description: '' });
      await loadData();
      setMessage('Project created.');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Project creation failed');
    }
  };

  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/tasks', { ...newTask });
      setNewTask((prev) => ({ ...prev, title: '', description: '', dueDate: '' }));
      await loadData();
      setMessage('Task created.');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Task creation failed');
    }
  };

  const updateTaskStatus = async (taskId, status) => {
    try {
      await api.put(`/tasks/${taskId}`, { status });
      await loadData();
    } catch (error) {
      setMessage('Unable to update task status');
    }
  };

  return (
    <div className="grid grid-4">
      <div className="card summary-card">
        <strong>Todo</strong>
        <span>{summary.todo}</span>
      </div>
      <div className="card summary-card">
        <strong>In Progress</strong>
        <span>{summary.inProgress}</span>
      </div>
      <div className="card summary-card">
        <strong>Completed</strong>
        <span>{summary.completed}</span>
      </div>
      <div className="card summary-card">
        <strong>Overdue</strong>
        <span>{summary.overdue}</span>
      </div>

      <div className="card card-padding" style={{ gridColumn: '1 / -1' }}>
        <div className="section-title">
          <div>
            <h2>Welcome back, {user.name}</h2>
            <p style={{ margin: 4, color: 'var(--muted)' }}>Role: {user.role}</p>
          </div>
        </div>
        {message && <div className="message-banner">{message}</div>}
      </div>

      {user.role === 'Admin' && (
        <div className="card form-card card-padding">
          <div className="section-title">
            <h3>Create Project</h3>
          </div>
          <form onSubmit={handleProjectSubmit} className="grid" style={{ gap: 12 }}>
            <label>
              Project title
              <input value={newProject.title} onChange={(e) => setNewProject({ ...newProject, title: e.target.value })} placeholder="Project title" required />
            </label>
            <label>
              Description
              <textarea value={newProject.description} onChange={(e) => setNewProject({ ...newProject, description: e.target.value })} placeholder="Project description" />
            </label>
            <div className="form-actions">
              <button className="btn btn-primary" type="submit">Create project</button>
            </div>
          </form>
        </div>
      )}

      <div className="card form-card card-padding">
        <div className="section-title">
          <h3>Create Task</h3>
        </div>
        <form onSubmit={handleTaskSubmit} className="grid" style={{ gap: 12 }}>
          <label>
            Task title
            <input value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} placeholder="Task title" required />
          </label>
          <label>
            Description
            <textarea value={newTask.description} onChange={(e) => setNewTask({ ...newTask, description: e.target.value })} placeholder="Task description" />
          </label>
          <label>
            Project
            <select value={newTask.projectId} onChange={(e) => setNewTask({ ...newTask, projectId: e.target.value })} required>
              <option value="">Select project</option>
              {projects.map((project) => (
                <option key={project._id} value={project._id}>{project.title}</option>
              ))}
            </select>
          </label>
          <label>
            Assigned to (user id)
            <input value={newTask.assignedTo} onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })} placeholder="Assigned user ID" required />
          </label>
          <label>
            Due date
            <input type="date" value={newTask.dueDate} onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })} />
          </label>
          <div className="form-actions">
            <button className="btn btn-primary" type="submit">Create task</button>
          </div>
        </form>
      </div>

      <div className="card card-padding" style={{ gridColumn: '1 / -1' }}>
        <div className="section-title">
          <h3>Projects</h3>
        </div>
        {projects.length === 0 ? (
          <p style={{ color: 'var(--muted)' }}>No projects yet. Create a project to get started.</p>
        ) : (
          <div className="card-list">
            {projects.map((project) => (
              <div key={project._id} className="project-card">
                <h4>{project.title}</h4>
                <p style={{ color: 'var(--muted)', margin: '10px 0 14px' }}>{project.description || 'No description provided.'}</p>
                <div className="item-meta">
                  <span>Owner: {project.owner?.name}</span>
                  <span>Members: {project.members.map((member) => member.name).join(', ') || 'None'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card card-padding" style={{ gridColumn: '1 / -1' }}>
        <div className="section-title">
          <h3>Tasks</h3>
        </div>
        {tasks.length === 0 ? (
          <p style={{ color: 'var(--muted)' }}>No tasks assigned yet. Create a task or join an existing project.</p>
        ) : (
          <div className="card-list">
            {tasks.map((task) => (
              <div key={task._id} className="task-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
                  <h4>{task.title}</h4>
                  <span className={`badge ${task.status === 'Completed' ? 'completed' : task.dueDate && new Date(task.dueDate) < new Date() ? 'overdue' : ''}`}>{task.status}</span>
                </div>
                <p style={{ margin: '10px 0', color: 'var(--muted)' }}>{task.description || 'No details added.'}</p>
                <div className="item-meta">
                  <span>Project: {task.project?.title}</span>
                  <span>Assigned: {task.assignedTo?.name}</span>
                  <span>Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'None'}</span>
                </div>
                {(user.role === 'Admin' || task.assignedTo?._id === user.id) && (
                  <div className="task-actions">
                    <button className="btn btn-ghost" type="button" onClick={() => updateTaskStatus(task._id, 'Todo')}>Todo</button>
                    <button className="btn btn-secondary" type="button" onClick={() => updateTaskStatus(task._id, 'In Progress')}>In Progress</button>
                    <button className="btn btn-primary" type="button" onClick={() => updateTaskStatus(task._id, 'Completed')}>Completed</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
