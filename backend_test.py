import requests
import sys
import json
from datetime import datetime

class PreciosaModasAPITester:
    def __init__(self, base_url="https://elegance-retail.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.user_token = None
        self.admin_token = None
        self.test_user_id = None
        self.test_product_id = None
        self.test_order_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def log_test(self, name, success, details=""):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name}")
        else:
            print(f"❌ {name} - {details}")
            self.failed_tests.append({"test": name, "error": details})

    def test_api_endpoint(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Generic API test method"""
        url = f"{self.api_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        if headers:
            test_headers.update(headers)

        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=10)

            success = response.status_code == expected_status
            details = f"Expected {expected_status}, got {response.status_code}"
            if not success and response.text:
                try:
                    error_data = response.json()
                    details += f" - {error_data.get('detail', response.text[:100])}"
                except:
                    details += f" - {response.text[:100]}"
            
            self.log_test(name, success, details)
            return success, response.json() if success and response.text else {}

        except Exception as e:
            self.log_test(name, False, f"Exception: {str(e)}")
            return False, {}

    def test_user_registration(self):
        """Test user registration"""
        timestamp = datetime.now().strftime('%H%M%S')
        user_data = {
            "nome": f"Test User {timestamp}",
            "email": f"test{timestamp}@example.com",
            "cpf_cnpj": f"123.456.789-{timestamp[-2:]}",
            "telefone": f"(11) 9999-{timestamp[-4:]}",
            "senha": "testpass123",
            "tipo": "atacado"
        }
        
        success, response = self.test_api_endpoint(
            "User Registration",
            "POST",
            "auth/register",
            200,
            data=user_data
        )
        
        if success and 'token' in response:
            self.user_token = response['token']
            self.test_user_id = response['user']['id']
            return True
        return False

    def test_user_login(self):
        """Test user login with existing credentials"""
        if not self.test_user_id:
            return False
            
        # Try to login with the registered user
        login_data = {
            "cpf_cnpj": f"123.456.789-{datetime.now().strftime('%H%M%S')[-2:]}",
            "senha": "testpass123"
        }
        
        success, response = self.test_api_endpoint(
            "User Login",
            "POST", 
            "auth/login",
            200,
            data=login_data
        )
        
        if success and 'token' in response:
            self.user_token = response['token']
            return True
        return False

    def test_get_current_user(self):
        """Test getting current user info"""
        if not self.user_token:
            return False
            
        headers = {'Authorization': f'Bearer {self.user_token}'}
        success, response = self.test_api_endpoint(
            "Get Current User",
            "GET",
            "auth/me",
            200,
            headers=headers
        )
        return success

    def test_admin_login(self):
        """Test admin login"""
        admin_data = {
            "username": "admin",
            "senha": "admin123"
        }
        
        success, response = self.test_api_endpoint(
            "Admin Login",
            "POST",
            "admin/login",
            200,
            data=admin_data
        )
        
        if success and 'token' in response:
            self.admin_token = response['token']
            return True
        return False

    def test_get_products(self):
        """Test getting products list"""
        success, response = self.test_api_endpoint(
            "Get Products",
            "GET",
            "products",
            200
        )
        
        if success and isinstance(response, list) and len(response) > 0:
            self.test_product_id = response[0]['id']
            return True
        return success

    def test_get_product_by_id(self):
        """Test getting single product"""
        if not self.test_product_id:
            return False
            
        success, response = self.test_api_endpoint(
            "Get Product by ID",
            "GET",
            f"products/{self.test_product_id}",
            200
        )
        return success

    def test_get_featured_products(self):
        """Test getting featured products"""
        success, response = self.test_api_endpoint(
            "Get Featured Products",
            "GET",
            "products?destaque=true",
            200
        )
        return success

    def test_create_product(self):
        """Test creating a product (admin only)"""
        if not self.admin_token:
            return False
            
        product_data = {
            "nome": "Test Product",
            "descricao": "Test product description",
            "preco_atacado": 50.00,
            "preco_varejo": 80.00,
            "categoria": "test",
            "imagens": ["https://via.placeholder.com/300"],
            "estoque": 10,
            "disponivel": True,
            "destaque": False
        }
        
        headers = {'Authorization': f'Bearer {self.admin_token}'}
        success, response = self.test_api_endpoint(
            "Create Product",
            "POST",
            "admin/products",
            200,
            data=product_data,
            headers=headers
        )
        
        if success and 'id' in response:
            self.test_product_id = response['id']
            return True
        return False

    def test_update_product(self):
        """Test updating a product"""
        if not self.admin_token or not self.test_product_id:
            return False
            
        product_data = {
            "nome": "Updated Test Product",
            "descricao": "Updated description",
            "preco_atacado": 55.00,
            "preco_varejo": 85.00,
            "categoria": "test",
            "imagens": ["https://via.placeholder.com/300"],
            "estoque": 15,
            "disponivel": True,
            "destaque": True
        }
        
        headers = {'Authorization': f'Bearer {self.admin_token}'}
        success, response = self.test_api_endpoint(
            "Update Product",
            "PUT",
            f"admin/products/{self.test_product_id}",
            200,
            data=product_data,
            headers=headers
        )
        return success

    def test_create_order(self):
        """Test creating an order"""
        if not self.test_user_id or not self.test_product_id:
            return False
            
        order_data = {
            "user_id": self.test_user_id,
            "user_nome": "Test User",
            "produtos": [
                {
                    "product_id": self.test_product_id,
                    "nome": "Test Product",
                    "quantidade": 2,
                    "preco_unitario": 50.00
                }
            ],
            "total": 100.00,
            "metodo_pagamento": "pix"
        }
        
        success, response = self.test_api_endpoint(
            "Create Order",
            "POST",
            "orders",
            200,
            data=order_data
        )
        
        if success and 'id' in response:
            self.test_order_id = response['id']
            return True
        return False

    def test_get_user_orders(self):
        """Test getting user orders"""
        if not self.test_user_id:
            return False
            
        success, response = self.test_api_endpoint(
            "Get User Orders",
            "GET",
            f"orders/user/{self.test_user_id}",
            200
        )
        return success

    def test_get_admin_orders(self):
        """Test getting all orders (admin)"""
        if not self.admin_token:
            return False
            
        headers = {'Authorization': f'Bearer {self.admin_token}'}
        success, response = self.test_api_endpoint(
            "Get Admin Orders",
            "GET",
            "admin/orders",
            200,
            headers=headers
        )
        return success

    def test_update_order_status(self):
        """Test updating order status"""
        if not self.admin_token or not self.test_order_id:
            return False
            
        headers = {'Authorization': f'Bearer {self.admin_token}'}
        success, response = self.test_api_endpoint(
            "Update Order Status",
            "PUT",
            f"admin/orders/{self.test_order_id}/status?status=confirmado",
            200,
            headers=headers
        )
        return success

    def test_contact_form(self):
        """Test contact form submission"""
        contact_data = {
            "nome": "Test Contact",
            "email": "test@example.com",
            "telefone": "(11) 99999-9999",
            "mensagem": "Test message"
        }
        
        success, response = self.test_api_endpoint(
            "Contact Form",
            "POST",
            "contact",
            200,
            data=contact_data
        )
        return success

    def test_get_admin_contacts(self):
        """Test getting contacts (admin)"""
        if not self.admin_token:
            return False
            
        headers = {'Authorization': f'Bearer {self.admin_token}'}
        success, response = self.test_api_endpoint(
            "Get Admin Contacts",
            "GET",
            "admin/contacts",
            200,
            headers=headers
        )
        return success

    def test_delete_product(self):
        """Test deleting a product"""
        if not self.admin_token or not self.test_product_id:
            return False
            
        headers = {'Authorization': f'Bearer {self.admin_token}'}
        success, response = self.test_api_endpoint(
            "Delete Product",
            "DELETE",
            f"admin/products/{self.test_product_id}",
            200,
            headers=headers
        )
        return success

    def run_all_tests(self):
        """Run all API tests"""
        print(f"🚀 Starting Preciosa Modas API Tests")
        print(f"📍 Testing API at: {self.api_url}")
        print("=" * 50)

        # Authentication Tests
        print("\n🔐 Authentication Tests:")
        self.test_user_registration()
        self.test_admin_login()
        self.test_get_current_user()

        # Product Tests
        print("\n📦 Product Tests:")
        self.test_get_products()
        self.test_get_product_by_id()
        self.test_get_featured_products()
        self.test_create_product()
        self.test_update_product()

        # Order Tests
        print("\n🛒 Order Tests:")
        self.test_create_order()
        self.test_get_user_orders()
        self.test_get_admin_orders()
        self.test_update_order_status()

        # Contact Tests
        print("\n📞 Contact Tests:")
        self.test_contact_form()
        self.test_get_admin_contacts()

        # Cleanup Tests
        print("\n🧹 Cleanup Tests:")
        self.test_delete_product()

        # Results
        print("\n" + "=" * 50)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} passed")
        
        if self.failed_tests:
            print("\n❌ Failed Tests:")
            for test in self.failed_tests:
                print(f"  - {test['test']}: {test['error']}")
        
        success_rate = (self.tests_passed / self.tests_run) * 100 if self.tests_run > 0 else 0
        print(f"✨ Success Rate: {success_rate:.1f}%")
        
        return self.tests_passed == self.tests_run

def main():
    tester = PreciosaModasAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())