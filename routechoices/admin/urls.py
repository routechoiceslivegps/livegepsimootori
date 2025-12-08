from django.conf import settings
from django.contrib import admin
from django.urls import path


admin.site.site_header = "Admin"
admin.site.site_title = "Admin Site"
admin.site.index_title = "Welcome to the administration site"
admin.site.site_url = f"//dashboard.{settings.PARENT_HOST}/admin/"

urlpatterns = [
    path("/", admin.site.urls),
]
