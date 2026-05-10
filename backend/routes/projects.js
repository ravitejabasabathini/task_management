const express = require('express');
const Project = require('../models/Project');
const User = require('../models/User');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, requireRole(['Admin']), async (req, res) => {
  const { title, description, members } = req.body;
  if (!title) return res.status(400).json({ message: 'Project title is required' });
  try {
    const project = await Project.create({
      title,
      description,
      owner: req.user._id,
      members: members || [req.user._id],
    });
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: 'Unable to create project', error: error.message });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const projects = await Project.find({ members: req.user._id }).populate('owner', 'name email role').populate('members', 'name email role');
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Unable to load projects', error: error.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('members', 'name email role').populate('owner', 'name email role');
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (!project.members.some((member) => member._id.equals(req.user._id))) {
      return res.status(403).json({ message: 'Not a member of this project' });
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Unable to load project', error: error.message });
  }
});

router.put('/:id/members', auth, requireRole(['Admin']), async (req, res) => {
  const { members } = req.body;
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    project.members = Array.isArray(members) ? members : project.members;
    await project.save();
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Unable to update members', error: error.message });
  }
});

module.exports = router;
