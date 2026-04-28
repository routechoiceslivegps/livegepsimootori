from django.core.management.base import BaseCommand
from django.db.models import Count, Func, F, TextField, Value
 from django.db.models.functions import Length

from routechoices.core.models import Device


class Command(BaseCommand):
    help = "Remove old images files from storage"

    def add_arguments(self, parser):
        parser.add_argument("--force", action="store_true", default=False)

    def handle(self, *args, **options):
        force = options["force"]
        mismatched_devices = Device.objects.annotate(
            nb_loc=(
                Length(
                    Func(
                        F("locations_encoded"),
                        Value(r"[^A-Z?@\[\\\]\^]"),
                        Value(""),
                        Value("g"),
                        function="REGEXP_REPLACE",
                        output_field=TextField()
                    )
                ) / 3
            )
        ).exclude(_location_count=F("nb_loc"))
        for device in mismatched_devices:
            device.update_cached_data()
            if force:
                device.save()
        nb_devices = 0
        devices = Device.objects.annotate(
            competitor_count=Count("competitor_set")
        ).filter(
            virtual=True,
            competitor_count=0,
            _location_count=0,
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
