const Note = require('../models/Note');

// GET /api/notes — list all published notes (no content field for security)
exports.getAllNotes = async (req, res) => {
    try {
        const notes = await Note.find({ status: 'Published' })
            .select('-content')
            .sort({ paper: 1, subject: 1, sortOrder: 1, createdAt: -1 });
        res.json(notes);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching notes', error: error.message });
    }
};

// GET /api/notes/all — admin: list ALL notes including drafts (no content)
exports.getAllNotesAdmin = async (req, res) => {
    try {
        const notes = await Note.find()
            .select('-content')
            .sort({ paper: 1, subject: 1, sortOrder: 1, createdAt: -1 });
        res.json(notes);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching notes', error: error.message });
    }
};

// GET /api/notes/:id — get single note with full content
exports.getNoteById = async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);
        if (!note) return res.status(404).json({ message: 'Note not found' });
        res.json(note);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching note', error: error.message });
    }
};

// POST /api/notes — admin: create note
exports.createNote = async (req, res) => {
    try {
        const { paper, subject, title, content, tags, status, sortOrder } = req.body;
        const note = new Note({ paper, subject, title, content, tags, status, sortOrder });
        await note.save();
        res.status(201).json(note);
    } catch (error) {
        res.status(500).json({ message: 'Error creating note', error: error.message });
    }
};

// PUT /api/notes/:id — admin: update note
exports.updateNote = async (req, res) => {
    try {
        const note = await Note.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!note) return res.status(404).json({ message: 'Note not found' });
        res.json(note);
    } catch (error) {
        res.status(500).json({ message: 'Error updating note', error: error.message });
    }
};

// DELETE /api/notes/:id — admin: delete note
exports.deleteNote = async (req, res) => {
    try {
        const note = await Note.findByIdAndDelete(req.params.id);
        if (!note) return res.status(404).json({ message: 'Note not found' });
        res.json({ message: 'Note deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting note', error: error.message });
    }
};
