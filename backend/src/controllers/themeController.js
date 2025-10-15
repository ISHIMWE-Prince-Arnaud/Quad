import Theme from '../models/Theme.js';

// @desc    Get current active theme
// @route   GET /api/themes/current
// @access  Public
export const getCurrentTheme = async (req, res) => {
  try {
    const currentTheme = await Theme.findOne({
      isActive: true,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() },
    });

    if (!currentTheme) {
      return res.json({ message: 'No active theme at the moment' });
    }

    res.json(currentTheme);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new theme
// @route   POST /api/themes
// @access  Private/Admin
export const createTheme = async (req, res) => {
  try {
    const { title, description, startDate, endDate } = req.body;

    // Deactivate all current themes
    await Theme.updateMany({}, { isActive: false });

    const theme = await Theme.create({
      title,
      description,
      startDate,
      endDate,
      isActive: true,
    });

    res.status(201).json(theme);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all themes
// @route   GET /api/themes
// @access  Public
export const getThemes = async (req, res) => {
  try {
    const themes = await Theme.find().sort({ startDate: -1 });
    res.json(themes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
