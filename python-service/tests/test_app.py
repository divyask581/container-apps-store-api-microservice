import unittest
import json
from app import app

class TestOrderService(unittest.TestCase):

    def setUp(self):
        self.app = app.test_client()
        self.app.testing = True

    def test_get_all_orders(self):
        response = self.app.get('/orders?page=1&per_page=10&sort_by=id&sort_order=asc')
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(json.loads(response.data), list)

    def test_filter_orders_by_date(self):
        response = self.app.get('/orders/filter?start_date=2022-01-01&end_date=2022-12-31')
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(json.loads(response.data), list)

    def test_search_orders_by_order_id(self):
        response = self.app.get('/orders/search?order_id=12345')
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(json.loads(response.data), list)

    def test_invalid_order_id(self):
        response = self.app.get('/order?id=invalid_id')
        self.assertEqual(response.status_code, 404)
        self.assertEqual(json.loads(response.data), 'no order with that id found')

    def test_invalid_date_range(self):
        response = self.app.get('/orders/filter?start_date=invalid_date&end_date=invalid_date')
        self.assertEqual(response.status_code, 400)
        self.assertEqual(json.loads(response.data), 'Invalid date range')

if __name__ == '__main__':
    unittest.main()
