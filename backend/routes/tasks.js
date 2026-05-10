const express = require('express');
const Task = require('../models/Task');
const Project = require('../models/Project');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, requireRole(['Admin']), async (req, res) => {
  const { title, description, projectId, assignedTo, dueDate } = req.body;
  if (!title || !projectId || !assignedTo) {
    return res.status(400).json({ message: 'Title, projectId and assignedTo are required' });
  }
  try {
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (!project.members.some((member) => member.equals(assignedTo))) {
      return res.status(400).json({ message: 'Assigned user is not a project member' });
    }
    const task = await Task.create({ title, description, project: projectId, assignedTo, dueDate });
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Unable to create task', error: error.message });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const tasks = await Task.find({})
      .populate('project', 'title')
      .populate('assignedTo', 'name email role');
    const visible = tasks.filter((task) => task.project && task.assignedTo);
    res.json(visible);
  } catch (error) {
    res.status(500).json({ message: 'Unable to load tasks', error: error.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  const { status, title, description, dueDate } = req.body;
  try {
    const task = await Task.findById(req.params.id).populate('project');
    if (!task) return res.status(404).json({ message: 'Task not found' });
    if (!task.assignedTo.equals(req.user._id) && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Not allowed to update this task' });
    }
    if (title) task.title = title;
    if (description) task.description = description;
    if (status) task.status = status;
    if (dueDate) task.dueDate = dueDate;
    await task.save();
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Unable to update task', error: error.message });
  }
});

router.get('/dashboard/summary', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: req.user._id });
    const counts = { todo: 0, inProgress: 0, completed: 0, overdue: 0 };
    const now = new Date();
    tasks.forEach((task) => {
      if (task.status === 'Todo') counts.todo += 1;
      if (task.status === 'In Progress') counts.inProgress += 1;
      if (task.status === 'Completed') counts.completed += 1;
      if (task.dueDate && task.dueDate < now && task.status !== 'Completed') counts.overdue += 1;
    });
    res.json(counts);
  } catch (error) {
    res.status(500).json({ message: 'Unable to load dashboard summary', error: error.message });
  }
});

module.exports = router;
