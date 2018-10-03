import os
import unittest


from dublin_bikes import serve
TEST_DB = 'test.db'
class BasicTests(unittest.TestCase):
 
 
    ############################
    #### setup and teardown ####
    ############################
 
    # executed prior to each test
    def setUp(self):
        serve.config['TESTING'] = True
        serve.config['WTF_CSRF_ENABLED'] = False
        serve.config['DEBUG'] = False
        serve.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + \
            os.path.join(serve.config['BASEDIR'], TEST_DB)
        self.sever = serve.test_client()
        db.drop_all()
        db.create_all()
 
        # Disable sending emails during unit testing
        mail.init_app(serve)
        self.assertEqual(serve.debug, False)
 
    # executed after each test
    def tearDown(self):
        pass
 
 
    def test_main_page(self):
        response = self.serve.get('/', follow_redirects=True)
        self.assertEqual(response.status_code, 200)
 
 
if __name__ == "__main__":
    unittest.main()