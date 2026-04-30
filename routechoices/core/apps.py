import geojson_validator
from django.apps import AppConfig


class CoreConfig(AppConfig):
    name = "routechoices.core"
    verbose_name = "Routechoices"

    def ready(self):
        geojson_validator.configure_logging(enabled=False)
