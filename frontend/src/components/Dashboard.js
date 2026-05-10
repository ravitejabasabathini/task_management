import React, { useEffect, useState } from 'react';
import api from '../api';

const Dashboard = ({ user }) => {

  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);

  const [summary, setSummary] = useState({
    todo: 0,
    inProgress: 0,
    completed: 0,
    overdue: 0
  });

  const [newProject, setNewProject] = useState({
    title: '',
    description: ''
  });

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    projectId: '',
    assignedTo: '',
    dueDate: ''
  });

  const [message, setMessage] = useState('');

  /* LOAD DATA */

  const loadData = async () => {

    try {

      const [
        projectRes,
        taskRes,
        summaryRes
      ] = await Promise.all([

        api.get('/projects'),

        api.get('/tasks'),

        api.get('/tasks/dashboard/summary')

      ]);

      setProjects(projectRes.data);

      setTasks(taskRes.data);

      setSummary(summaryRes.data);

      if (
        projectRes.data.length > 0 &&
        !newTask.projectId
      ) {

        setNewTask((prev) => ({
          ...prev,
          projectId: projectRes.data[0]._id
        }));
      }

    } catch (error) {

      setMessage('Unable to load data.');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  /* CREATE PROJECT */

  const handleProjectSubmit = async (e) => {

    e.preventDefault();

    try {

      await api.post('/projects', {
        ...newProject
      });

      setNewProject({
        title: '',
        description: ''
      });

      await loadData();

      setMessage('Project created.');

    } catch (error) {

      setMessage(
        error.response?.data?.message ||
        'Project creation failed'
      );
    }
  };

  /* CREATE TASK */

  const handleTaskSubmit = async (e) => {

    e.preventDefault();

    try {

      await api.post('/tasks', {
        ...newTask
      });

      setNewTask({
        title: '',
        description: '',
        projectId: '',
        assignedTo: '',
        dueDate: ''
      });

      await loadData();

      setMessage('Task created.');

    } catch (error) {

      setMessage(
        error.response?.data?.message ||
        'Task creation failed'
      );
    }
  };

  /* UPDATE STATUS */

  const updateTaskStatus = async (
    taskId,
    status
  ) => {

    try {

      await api.put(
        `/tasks/${taskId}`,
        { status }
      );

      await loadData();

    } catch (error) {

      setMessage(
        'Unable to update task status'
      );
    }
  };

  return (

    <div className="dashboard-container">

      {/* SUMMARY CARDS */}

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

      </div>

      {/* WELCOME SECTION */}

      <div
        className="card card-padding"
        style={{ marginTop: 24 }}
      >

        <div className="section-title">

          <div>

            <h2>
              Welcome back, {user.name}
            </h2>

            <p
              style={{
                marginTop: 6,
                color: 'var(--muted)'
              }}
            >
              Role: {user.role}
            </p>

          </div>

        </div>

        {message && (

          <div className="message-banner">
            {message}
          </div>

        )}

      </div>

      {/* FORMS SECTION */}

      <div
        className="grid grid-2"
        style={{ marginTop: 28 }}
      >

        {/* CREATE PROJECT */}

        {user.role === 'Admin' && (

          <div className="form-card">

            <h3>Create Project</h3>

            <form onSubmit={handleProjectSubmit}>

              <label>

                Project Title

                <input
                  type="text"
                  value={newProject.title}
                  onChange={(e) =>
                    setNewProject({
                      ...newProject,
                      title: e.target.value
                    })
                  }
                  placeholder="Enter project title"
                  required
                />

              </label>

              <label>

                Description

                <textarea
                  value={newProject.description}
                  onChange={(e) =>
                    setNewProject({
                      ...newProject,
                      description: e.target.value
                    })
                  }
                  placeholder="Enter project description"
                />

              </label>

              <button
                className="btn btn-primary"
                type="submit"
              >
                Create Project
              </button>

            </form>

          </div>

        )}

        {/* CREATE TASK */}

        <div className="form-card">

          <h3>Create Task</h3>

          <form onSubmit={handleTaskSubmit}>

            <label>

              Task Title

              <input
                type="text"
                value={newTask.title}
                onChange={(e) =>
                  setNewTask({
                    ...newTask,
                    title: e.target.value
                  })
                }
                placeholder="Enter task title"
                required
              />

            </label>

            <label>

              Description

              <textarea
                value={newTask.description}
                onChange={(e) =>
                  setNewTask({
                    ...newTask,
                    description: e.target.value
                  })
                }
                placeholder="Enter task description"
              />

            </label>

            <label>

              Select Project

              <select
                value={newTask.projectId}
                onChange={(e) =>
                  setNewTask({
                    ...newTask,
                    projectId: e.target.value
                  })
                }
                required
              >

                <option value="">
                  Choose project
                </option>

                {projects.map((project) => (

                  <option
                    key={project._id}
                    value={project._id}
                  >
                    {project.title}
                  </option>

                ))}

              </select>

            </label>

            <label>

              Assigned User ID

              <input
                type="text"
                value={newTask.assignedTo}
                onChange={(e) =>
                  setNewTask({
                    ...newTask,
                    assignedTo: e.target.value
                  })
                }
                placeholder="Enter user ID"
                required
              />

            </label>

            <label>

              Due Date

              <input
                type="date"
                value={newTask.dueDate}
                onChange={(e) =>
                  setNewTask({
                    ...newTask,
                    dueDate: e.target.value
                  })
                }
              />

            </label>

            <button
              className="btn btn-primary"
              type="submit"
            >
              Create Task
            </button>

          </form>

        </div>

      </div>

      {/* PROJECTS */}

      <div
        className="card card-padding"
        style={{ marginTop: 28 }}
      >

        <div className="section-title">
          <h3>Projects</h3>
        </div>

        {projects.length === 0 ? (

          <p style={{ color: 'var(--muted)' }}>
            No projects yet.
          </p>

        ) : (

          <div className="card-list">

            {projects.map((project) => (

              <div
                key={project._id}
                className="project-card"
              >

                <h4>{project.title}</h4>

                <p
                  style={{
                    color: 'var(--muted)',
                    marginTop: 10
                  }}
                >
                  {project.description ||
                    'No description'}
                </p>

                <div className="item-meta">

                  <span>
                    Owner:
                    {' '}
                    {project.owner?.name}
                  </span>

                  <span>
                    Members:
                    {' '}
                    {project.members
                      .map(
                        (member) => member.name
                      )
                      .join(', ')}
                  </span>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

      {/* TASKS */}

      <div
        className="card card-padding"
        style={{ marginTop: 28 }}
      >

        <div className="section-title">
          <h3>Tasks</h3>
        </div>

        {tasks.length === 0 ? (

          <p style={{ color: 'var(--muted)' }}>
            No tasks yet.
          </p>

        ) : (

          <div className="card-list">

            {tasks.map((task) => (

              <div
                key={task._id}
                className="task-card"
              >

                <div
                  style={{
                    display: 'flex',
                    justifyContent:
                      'space-between',
                    alignItems: 'center'
                  }}
                >

                  <h4>{task.title}</h4>

                  <span
                    className={`badge ${
                      task.status === 'Completed'
                        ? 'completed'
                        : task.dueDate &&
                          new Date(task.dueDate) <
                            new Date()
                        ? 'overdue'
                        : ''
                    }`}
                  >
                    {task.status}
                  </span>

                </div>

                <p
                  style={{
                    color: 'var(--muted)',
                    marginTop: 10
                  }}
                >
                  {task.description ||
                    'No details'}
                </p>

                <div className="item-meta">

                  <span>
                    Project:
                    {' '}
                    {task.project?.title}
                  </span>

                  <span>
                    Assigned:
                    {' '}
                    {task.assignedTo?.name}
                  </span>

                  <span>
                    Due:
                    {' '}
                    {task.dueDate
                      ? new Date(
                          task.dueDate
                        ).toLocaleDateString()
                      : 'None'}
                  </span>

                </div>

                {(user.role === 'Admin' ||
                  task.assignedTo?._id ===
                    user.id) && (

                  <div className="task-actions">

                    <button
                      className="btn btn-ghost"
                      onClick={() =>
                        updateTaskStatus(
                          task._id,
                          'Todo'
                        )
                      }
                    >
                      Todo
                    </button>

                    <button
                      className="btn btn-secondary"
                      onClick={() =>
                        updateTaskStatus(
                          task._id,
                          'In Progress'
                        )
                      }
                    >
                      In Progress
                    </button>

                    <button
                      className="btn btn-primary"
                      onClick={() =>
                        updateTaskStatus(
                          task._id,
                          'Completed'
                        )
                      }
                    >
                      Completed
                    </button>

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