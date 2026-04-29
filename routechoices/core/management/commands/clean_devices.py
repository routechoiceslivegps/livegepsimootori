from django.core.management.base import BaseCommand
from django.db.models import Count, F, Func, Q, Value
from django.db.models.functions import Length

from routechoices.core.models import Device


class Command(BaseCommand):
    help = "Fixes invalid cache and trashes unused virtual devices"

    def add_arguments(self, parser):
        parser.add_argument("--force", action="store_true", default=False)

    def handle(self, *args, **options):
        force = options["force"]
        invalid_cache_devices = Device.objects.annotate(
            db_location_count=(
                Length(
                    Func(
                        F("locations_encoded"),
                        Value(r"[^?-^]"),
                        Value(""),
                        Value("g"),
                        function="REGEXP_REPLACE",
                    )
                )
                / 3
            )
        ).exclude(_location_count=F("db_location_count"))
        invalid_cache_devices_count = invalid_cache_devices.count()
        if invalid_cache_devices_count:
            self.stdout.write(
                self.style.WARNING(
                    f"{invalid_cache_devices_count} devices with invalid cache"
                )
            )
        else:
            self.stdout.write(self.style.SUCCESS("No devices with invalid cache"))

        if force and invalid_cache_devices_count:
            for device in invalid_cache_devices:
                device.update_cached_data()
                device.save()
            self.stdout.write(self.style.SUCCESS("Successfully updated cache"))

        void_devices = (
            Device.objects.annotate(competitor_count=Count("competitor_set"))
            .filter(
                virtual=True,
            )
            .filter(Q(competitor_count=0) | Q(locations_encoded=""))
        )
        void_devices_count = void_devices.count()
        if void_devices_count:
            self.stdout.write(
                self.style.WARNING(
                    f"{void_devices_count} virtual devices without any uses"
                )
            )
        else:
            self.stdout.write(self.style.SUCCESS("No virtual devices without any uses"))

        if void_devices_count and force:
            void_devices.delete()
            self.stdout.write(
                self.style.SUCCESS(
                    f"Successfully removed {void_devices_count} virtual devices"
                )
            )
