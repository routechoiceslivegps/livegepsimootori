from django.core.management import call_command
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Clean up"

    def handle(self, *args, **options):
        self.stdout.write("Remove expired sessions")
        call_command("clearsessions")

        self.stdout.write("\nRemove expired invitations")
        call_command("clear_expired_invitations")

        self.stdout.write("\nRemove unused files")
        call_command("clean_storage", force=True)

        self.stdout.write("\nArchive old competitors devices")
        call_command("archive_devices", force=True)

        self.stdout.write("\nRemove unused locations from devices")
        call_command(
            "clean_locations",
            force=True,
            workers=2,
        )

        self.stdout.write("\nDevices cleanup")
        call_command("clean_devices", force=True)

        self.stdout.write("\nRemove clubs without activity")
        call_command("clean_clubs")
