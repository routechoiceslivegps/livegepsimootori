from datetime import timedelta

from django.core.management.base import BaseCommand
from django.utils.timezone import now

from routechoices.core.models import Competitor


class Command(BaseCommand):
    help = "Archive competitors device two weeks after event finishes"

    def add_arguments(self, parser):
        parser.add_argument("--force", action="store_true", default=False)

    def handle(self, *args, **options):
        force = options["force"]
        two_weeks_ago = now() - timedelta(days=14)
        idle_competitors = Competitor.objects.filter(
            event__end_date__lt=two_weeks_ago,
            device__isnull=False,
            device__virtual=False,
        )
        idle_competitor_count = idle_competitors.count()
        if idle_competitor_count:
            self.stdout.write(
                self.style.WARNING(
                    f"{idle_competitor_count} competitors still associated to an actual device two week after the event end"
                )
            )
        else:
            self.stdout.write(
                self.style.SUCCESS(
                    "No competitors associated to an actual device two week after the event end"
                )
            )

        if idle_competitor_count and force:
            for competitor in idle_competitors:
                competitor.archive_device()
            self.stdout.write(
                self.style.SUCCESS(
                    f"Successfully archived {idle_competitor_count} competitor devices"
                )
            )
