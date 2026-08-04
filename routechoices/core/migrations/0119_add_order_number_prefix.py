from django.db import migrations
from django.db.models import F, Value
from django.db.models.functions import Concat

from routechoices.lib.lemonsqueezy import LEMONSQUEEZY_PREFIX


def forwards_func(apps, schema_editor):
    Club = apps.get_model("core", "Club")
    db_alias = schema_editor.connection.alias
    clubs = (
        Club.objects.using(db_alias).exclude(order_id="").exclude(order_id__isnull=True)
    )
    clubs.update(order_id=Concat(Value(LEMONSQUEEZY_PREFIX), F("order_id")))


def reverse_func(apps, schema_editor):
    pass


class Migration(migrations.Migration):
    dependencies = [
        ("core", "0118_event_external_id_eventset_external_id"),
    ]

    operations = [
        migrations.RunPython(forwards_func, reverse_func),
    ]
