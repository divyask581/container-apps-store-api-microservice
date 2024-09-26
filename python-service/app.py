import os
import logging
import flask
from flask import request, jsonify, abort
from flask import json
from flask_cors import CORS
from dapr.clients import DaprClient
from datetime import datetime

logging.basicConfig(level=logging.INFO)

app = flask.Flask(__name__)
CORS(app)

@app.route('/order', methods=['GET'])
def getOrder():
    app.logger.info('order service called')
    with DaprClient() as d:
        d.wait(5)
        try:
            id = request.args.get('id')
            if id:
                # Get the order status from Cosmos DB via Dapr
                state = d.get_state(store_name='orders', key=id)
                if state.data:
                    resp = jsonify(json.loads(state.data))
                else:
                    resp = jsonify('no order with that id found')
                resp.status_code = 200
                return resp
            else:
                resp = jsonify('Order "id" not found in query string')
                resp.status_code = 500
                return resp
        except Exception as e:
            app.logger.info(e)
            return str(e)
        finally:
            app.logger.info('completed order call')

@app.route('/order', methods=['POST'])
def createOrder():
    app.logger.info('create order called')
    with DaprClient() as d:
        d.wait(5)
        try:
            # Get ID from the request body
            id = request.json['id']
            if id:
                # Save the order to Cosmos DB via Dapr
                d.save_state(store_name='orders', key=id, value=json.dumps(request.json))
                resp = jsonify(request.json)
                resp.status_code = 200
                return resp
            else:
                resp = jsonify('Order "id" not found in query string')
                resp.status_code = 500
                return resp
        except Exception as e:
            app.logger.info(e)
            return str(e)
        finally:
            app.logger.info('created order')

@app.route('/order', methods=['DELETE'])
def deleteOrder():
    app.logger.info('delete called in the order service')
    with DaprClient() as d:
        d.wait(5)
        id = request.args.get('id')
        if id:
            # Delete the order status from Cosmos DB via Dapr
            try: 
                d.delete_state(store_name='orders', key=id)
                return f'Item {id} successfully deleted', 200
            except Exception as e:
                app.logger.info(e)
                return abort(500)
            finally:
                app.logger.info('completed order delete')
        else:
            resp = jsonify('Order "id" not found in query string')
            resp.status_code = 400
            return resp

@app.route('/orders', methods=['GET'])
def getAllOrders():
    app.logger.info('get all orders called')
    with DaprClient() as d:
        d.wait(5)
        try:
            page = int(request.args.get('page', 1))
            per_page = int(request.args.get('per_page', 10))
            sort_by = request.args.get('sort_by', 'id')
            sort_order = request.args.get('sort_order', 'asc')

            # Get all orders from Cosmos DB via Dapr
            state = d.get_bulk_state(store_name='orders', keys=[], parallelism=10)
            orders = [json.loads(order.data) for order in state.items]

            # Sort orders
            orders.sort(key=lambda x: x.get(sort_by, ''), reverse=(sort_order == 'desc'))

            # Paginate orders
            start = (page - 1) * per_page
            end = start + per_page
            paginated_orders = orders[start:end]

            resp = jsonify(paginated_orders)
            resp.status_code = 200
            return resp
        except Exception as e:
            app.logger.info(e)
            return str(e)
        finally:
            app.logger.info('completed get all orders call')

@app.route('/orders/filter', methods=['GET'])
def filterOrdersByDate():
    app.logger.info('filter orders by date called')
    with DaprClient() as d:
        d.wait(5)
        try:
            start_date = request.args.get('start_date')
            end_date = request.args.get('end_date')

            if not start_date or not end_date:
                resp = jsonify('Invalid date range')
                resp.status_code = 400
                return resp

            start_date = datetime.strptime(start_date, '%Y-%m-%d')
            end_date = datetime.strptime(end_date, '%Y-%m-%d')

            # Get all orders from Cosmos DB via Dapr
            state = d.get_bulk_state(store_name='orders', keys=[], parallelism=10)
            orders = [json.loads(order.data) for order in state.items]

            # Filter orders by date range
            filtered_orders = [order for order in orders if start_date <= datetime.strptime(order['date'], '%Y-%m-%d') <= end_date]

            resp = jsonify(filtered_orders)
            resp.status_code = 200
            return resp
        except Exception as e:
            app.logger.info(e)
            return str(e)
        finally:
            app.logger.info('completed filter orders by date call')

@app.route('/orders/search', methods=['GET'])
def searchOrdersById():
    app.logger.info('search orders by ID called')
    with DaprClient() as d:
        d.wait(5)
        try:
            order_id = request.args.get('order_id')
            if not order_id:
                resp = jsonify('Invalid order ID')
                resp.status_code = 400
                return resp

            # Get all orders from Cosmos DB via Dapr
            state = d.get_bulk_state(store_name='orders', keys=[], parallelism=10)
            orders = [json.loads(order.data) for order in state.items]

            # Search orders by order ID
            searched_orders = [order for order in orders if order_id in order['id']]

            resp = jsonify(searched_orders)
            resp.status_code = 200
            return resp
        except Exception as e:
            app.logger.info(e)
            return str(e)
        finally:
            app.logger.info('completed search orders by ID call')

app.run(host='0.0.0.0', port=os.getenv('PORT', '5000'))
