var express = require('express');
var router = express.Router();
const axios = require('axios').default;
const orderService = process.env.ORDER_SERVICE_NAME || 'python-app';
const daprPort = process.env.DAPR_HTTP_PORT || 3500;

//use dapr http proxy (header) to call orders service with normal /order route URL in axios.get call
const daprSidecar = `http://localhost:${daprPort}`

/* GET order by calling order microservice via dapr */
router.get('/', async function(req, res, next) {

  console.log('Service invoke to: ' + `${daprSidecar}/order?id=${req.query.id}`);
  var data = await axios.get(`${daprSidecar}/order?id=${req.query.id}`, {
    headers: {'dapr-app-id': `${orderService}`} //sets app name for service discovery
  });
  
  res.setHeader('Content-Type', 'application/json');
  res.send(`${JSON.stringify(data.data)}`);
});

/* POST create order by calling order microservice via dapr */
router.post('/', async function(req, res, next) {
  try{
    var order = req.body;
    order['location'] = 'Seattle';
    order['priority'] = 'Standard';
    console.log('Service invoke POST to: ' + `${daprSidecar}/order?id=${req.query.id}` + ', with data: ' +  JSON.stringify(order));
    var data = await axios.post(`${daprSidecar}/order?id=${req.query.id}`, order, {
      headers: {'dapr-app-id': `${orderService}`} //sets app name for service discovery
    });
  
    res.send(`<p>Order created!</p><br/><code>${JSON.stringify(data.data)}</code>`);
  }
  catch(err){
    res.send(`<p>Error creating order<br/>Order microservice or dapr may not be running.<br/></p><br/><code>${err}</code>`);
  }
});

/* DELETE order by calling order microservice via dapr */
router.post('/delete', async function(req, res ) {
   
  var data = await axios.delete(`${daprSidecar}/order?id=${req.body.id}`, {
    headers: {'dapr-app-id': `${orderService}`}
  });
  
  res.setHeader('Content-Type', 'application/json');
  res.send(`${JSON.stringify(data.data)}`);
});

/* GET all orders with pagination and sorting by calling order microservice via dapr */
router.get('/all', async function(req, res, next) {
  try {
    const page = req.query.page || 1;
    const per_page = req.query.per_page || 10;
    const sort_by = req.query.sort_by || 'id';
    const sort_order = req.query.sort_order || 'asc';

    var data = await axios.get(`${daprSidecar}/orders?page=${page}&per_page=${per_page}&sort_by=${sort_by}&sort_order=${sort_order}`, {
      headers: {'dapr-app-id': `${orderService}`}
    });

    res.setHeader('Content-Type', 'application/json');
    res.send(`${JSON.stringify(data.data)}`);
  } catch (err) {
    res.status(500).send(`<p>Error fetching orders<br/>Order microservice or dapr may not be running.<br/></p><br/><code>${err}</code>`);
  }
});

/* GET filter orders by date range by calling order microservice via dapr */
router.get('/filter', async function(req, res, next) {
  try {
    const start_date = req.query.start_date;
    const end_date = req.query.end_date;

    if (!start_date || !end_date) {
      res.status(400).send('Invalid date range');
      return;
    }

    var data = await axios.get(`${daprSidecar}/orders/filter?start_date=${start_date}&end_date=${end_date}`, {
      headers: {'dapr-app-id': `${orderService}`}
    });

    res.setHeader('Content-Type', 'application/json');
    res.send(`${JSON.stringify(data.data)}`);
  } catch (err) {
    res.status(500).send(`<p>Error filtering orders<br/>Order microservice or dapr may not be running.<br/></p><br/><code>${err}</code>`);
  }
});

/* GET search orders by order ID by calling order microservice via dapr */
router.get('/search', async function(req, res, next) {
  try {
    const order_id = req.query.order_id;

    if (!order_id) {
      res.status(400).send('Invalid order ID');
      return;
    }

    var data = await axios.get(`${daprSidecar}/orders/search?order_id=${order_id}`, {
      headers: {'dapr-app-id': `${orderService}`}
    });

    res.setHeader('Content-Type', 'application/json');
    res.send(`${JSON.stringify(data.data)}`);
  } catch (err) {
    res.status(500).send(`<p>Error searching orders<br/>Order microservice or dapr may not be running.<br/></p><br/><code>${err}</code>`);
  }
});

module.exports = router;
