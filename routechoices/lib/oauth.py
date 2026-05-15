from django.contrib.auth.mixins import (
    LoginRequiredMixin,
)
from oauth2_provider.views.base import (
    AuthorizationView,
)


class CustomOAuth2ProviderLoginView(AuthorizationView, LoginRequiredMixin):
    login_url = "/login/"
