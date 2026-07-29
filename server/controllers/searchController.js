const Topic = require('../models/Topic');
const PYQ = require('../models/PYQ');
const CurrentAffair = require('../models/CurrentAffair');

exports.universalSearch = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    // Perform parallel $text searches across collections
    const [topics, pyqs, currentAffairs] = await Promise.all([
      Topic.find({ $text: { $search: q } }, { score: { $meta: 'textScore' } })
           .sort({ score: { $meta: 'textScore' } })
           .limit(10),
           
      PYQ.find({ $text: { $search: q } }, { score: { $meta: 'textScore' } })
         .sort({ score: { $meta: 'textScore' } })
         .limit(10),
         
      CurrentAffair.find({ $text: { $search: q } }, { score: { $meta: 'textScore' } })
                   .sort({ score: { $meta: 'textScore' } })
                   .limit(10)
    ]);

    res.json({
      query: q,
      results: {
        topics,
        pyqs,
        currentAffairs
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
