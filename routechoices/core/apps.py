from django.apps import AppConfig
from geojson_validator.main import logger as annoying_logger


class CoreConfig(AppConfig):
    name = "routechoices.core"
    verbose_name = "Routechoices"

    def ready(self):
        annoying_logger.remove()
