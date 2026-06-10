import urllib.parse

from django.core.management.base import BaseCommand

from routechoices.lib.other_gps_services.livelox import Livelox


class Command(BaseCommand):
    help = "Download livelox kmz"

    def add_arguments(self, parser):
        parser.add_argument("--url", dest="event_url", type=str)
        parser.add_argument("-o", "--output", dest="output", type=str)

    def handle(self, *args, **options):
        event_url = options["event_url"]
        prefix = "https://www.livelox.com/Viewer/"
        if event_url.startswith(prefix):
            event_url = urllib.parse.urlparse(event_url).query

        solution = Livelox()
        solution.parse_init_data(event_url)
        event = solution.get_or_create_event()
        solution.assign_maps_to_event(event)
        with open(options["output"], "wb") as fp:
            fp.write(event.map.kmz)
        self.stdout.write("Done!")
