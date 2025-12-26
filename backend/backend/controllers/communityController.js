const Story = require('../models/Story');

// Get all stories
const getStories = async (req, res) => {
    try {
        const stories = await Story.find()
            .populate('user', 'name isAnonymous')
            .populate('comments.user', 'name isAnonymous')
            .sort({ createdAt: -1 });
        res.json(stories);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Create a new story
const createStory = async (req, res) => {
    const { title, content, isAnonymous } = req.body;
    try {
        const newStory = new Story({
            user: req.user._id,
            title,
            content,
            isAnonymous
        });
        const savedStory = await newStory.save();
        res.status(201).json(savedStory);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Like a story
const likeStory = async (req, res) => {
    try {
        const story = await Story.findById(req.params.id);
        if (!story) return res.status(404).json({ message: 'Story not found' });

        if (story.likes.includes(req.user._id)) {
             // Unlike
            story.likes = story.likes.filter(id => id.toString() !== req.user._id.toString());
        } else {
            // Like
            story.likes.push(req.user._id);
        }
        await story.save();
        res.json(story);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Add a comment
const addComment = async (req, res) => {
    const { content, isAnonymous } = req.body;
    try {
        const story = await Story.findById(req.params.id);
        if (!story) return res.status(404).json({ message: 'Story not found' });

        const newComment = {
            user: req.user._id,
            content,
            isAnonymous: isAnonymous || false
        };
        story.comments.push(newComment);
        await story.save();
        
        // Re-fetch to populate user
        const updatedStory = await Story.findById(req.params.id)
             .populate('user', 'name')
             .populate('comments.user', 'name');

        res.json(updatedStory);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    getStories,
    createStory,
    likeStory,
    addComment
};
