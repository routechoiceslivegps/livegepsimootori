from django.core.management import call_command
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Clean up"

    def handle(self, *args, **options):
        self.stdout.write(self.style.MIGRATE_HEADING("Removing expired sessions"))
        call_command("clearsessions")
        self.stdout.write(self.style.SUCCESS("Done"))

        self.stdout.write(self.style.MIGRATE_HEADING("\nRemoving expired invitations"))
        call_command("clear_expired_invitations")
        self.stdout.write(self.style.SUCCESS("Done"))

        self.stdout.write(self.style.MIGRATE_HEADING("\nRemoving unused files"))
        call_command("clean_storage", force=True)

        self.stdout.write(
            self.style.MIGRATE_HEADING("\nArchiving old competitors devices")
        )
        call_command("archive_devices", force=True)

        self.stdout.write(
            self.style.MIGRATE_HEADING("\nRemoving unused locations from devices")
        )
        call_command(
            "clean_locations",
            force=True,
            workers=2,
        )

        self.stdout.write(self.style.MIGRATE_HEADING("\nCleaning up devices"))
        call_command("clean_devices", force=True)

        self.stdout.write(
            self.style.MIGRATE_HEADING("\nRemoving freemium clubs without activity")
        )
        call_command("clean_clubs")
