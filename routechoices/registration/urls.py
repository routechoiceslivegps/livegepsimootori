from django.urls import re_path
from routechoices.site import views

urlpatterns = [
    re_path(
        r"^$",
        views.registration_view,
        name="registration_view",
    ),
]
