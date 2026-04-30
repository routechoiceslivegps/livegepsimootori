wsgi_app = "routechoices.wsgi:application"
daemon = False
raw_env = ["DJANGO_SETTINGS_MODULE=routechoices.settings"]
workers = 5
max_requests = 3000
max_requests_jitter = 100
worker_class = "gevent"
