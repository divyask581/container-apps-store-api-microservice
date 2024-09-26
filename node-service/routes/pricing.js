var express = require('express');
var router = express.Router();
const axios = require('axios').default;
const daprPort = process.env.DAPR_HTTP_PORT || 3500;
const daprSidecar = `http://localhost:${daprPort}/v1.0/state/statestore`;

/* GET pricing information */
router.get('/', async function(req, res, next) {
  try {
    const key = req.query.key;
    const response = await axios.get(`${daprSidecar}/${key}`);
    res.json(response.data);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

/* POST create or update pricing information */
router.post('/', async function(req, res, next) {
  try {
    const key = req.body.key;
    const value = req.body.value;
    const response = await axios.post(daprSidecar, [
      {
        key: key,
        value: value
      }
    ]);
    res.json(response.data);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

module.exports = router;
