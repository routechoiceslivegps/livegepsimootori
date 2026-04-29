from django.conf import settings
from django.core.management.base import BaseCommand

from routechoices.core.models import Club, Event, Map
from routechoices.lib.s3 import get_s3_client, s3_delete_key


class Command(BaseCommand):
    help = "Remove old unused files from storage"

    def add_arguments(self, parser):
        parser.add_argument("--force", action="store_true", default=False)

    def scan_directory(self, directory):
        # Should use v2 but wasabi fails to list all files with it
        # paginator = s3.get_paginator('list_objects_v2')
        paginator = self.s3.get_paginator("list_objects")
        kwargs = {
            "Bucket": settings.AWS_S3_BUCKET,
            "Prefix": directory,
        }
        for page in paginator.paginate(**kwargs):
            try:
                contents = page["Contents"]
            except KeyError:
                break
            for obj in contents:
                key = obj["Key"]
                yield key

    def process_file(self, file_name, force):
        if file_name not in self.file_paths:
            self.n_file_removed += 1
            if force:
                s3_delete_key(file_name, settings.AWS_S3_BUCKET)

    def handle(self, *args, **options):
        force = options["force"]
        self.file_paths = set(Map.objects.values_list("image", flat=True))
        self.file_paths.update(
            set(
                Club.objects.all()
                .exclude(logo__isnull=True)
                .exclude(logo="")
                .values_list("logo", flat=True)
            )
        )
        self.file_paths.update(
            set(
                Club.objects.all()
                .exclude(banner__isnull=True)
                .exclude(banner="")
                .values_list("banner", flat=True)
            )
        )
        self.file_paths.update(
            set(
                Event.objects.all()
                .exclude(geojson_layer__isnull=True)
                .exclude(geojson_layer="")
                .values_list("geojson_layer", flat=True)
            )
        )

        self.n_file_removed = 0
        self.s3 = get_s3_client()
        for directory in ("banners", "geojson", "logos", "maps"):
            for filename in self.scan_directory(directory):
                self.process_file(filename, force)

        if self.n_file_removed == 0:
            self.stdout.write(self.style.SUCCESS("No files to remove"))
        elif force:
            self.stdout.write(
                self.style.SUCCESS(f"Successfully removed {self.n_file_removed} files")
            )
        else:
            self.stdout.write(
                self.style.WARNING(f"{self.n_file_removed} files could be removed")
            )
