const express = require('express');
const router = express.Router();
const { getDataByDateTime } = require('../controllers/dataController');

router.get('/data', async (req, res) => {
  const { date, time } = req.query;

  try {
    const data = await getDataByDateTime(date, time);
    res.json(data);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
