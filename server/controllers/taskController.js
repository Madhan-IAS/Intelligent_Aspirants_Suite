const Task = require('../models/Task');

// Get all tasks for user
exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// Create a new task
exports.createTask = async (req, res) => {
  try {
    const { title, subject, dueDate } = req.body;
    
    const task = new Task({
      title,
      subject,
      dueDate,
      user: req.user.id,
      completed: false
    });
    
    await task.save();
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// Update task (e.g. toggle completed)
exports.updateTask = async (req, res) => {
  try {
    const { title, subject, completed, dueDate } = req.body;
    
    let task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    
    // Ensure user owns the task
    if (task.user.toString() !== req.user.id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    if (title !== undefined) task.title = title;
    if (subject !== undefined) task.subject = subject;
    if (completed !== undefined) task.completed = completed;
    if (dueDate !== undefined) task.dueDate = dueDate;
    
    await task.save();
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// Delete task
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    
    if (task.user.toString() !== req.user.id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    await task.deleteOne();
    res.json({ message: 'Task removed' });
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};
