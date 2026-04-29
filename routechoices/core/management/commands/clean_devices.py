from django.core.management.base import BaseCommand
from django.db.models import Count, F, Func, Q, Value
from django.db.models.functions import Length

from routechoices.core.models import Device


class Command(BaseCommand):
    help = "Device cleaning: Fix bad cached values and trashes unused blank virtual devices"

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
        nb_invalid = invalid_cache_devices.count()
        if nb_invalid > 0:
            self.stdout.write(
                self.style.WARNING(f"{nb_invalid} devices with invalid cache")
            )
            for device in invalid_cache_devices:
                device.update_cached_data()
                if force:
                    device.save()
            if force:
                self.stdout.write(self.style.SUCCESS("Successfully updated cache"))
        else:
            self.stdout.write(self.style.SUCCESS("No devices with invalid cache"))
        nb_devices = 0
        devices = (
            Device.objects.annotate(competitor_count=Count("competitor_set"))
            .filter(
                virtual=True,
            )
            .filter(Q(competitor_count=0) | Q(locations_encoded=""))
        )
        nb_devices = devices.count()
        if nb_devices == 0:
            self.stdout.write(self.style.SUCCESS("No devices to remove"))
        elif force:
            devices.delete()
            self.stdout.write(
                self.style.SUCCESS(f"Successfully removed {nb_devices} devices")
            )
        else:
            self.stdout.write(f"Would remove {nb_devices} devices")
