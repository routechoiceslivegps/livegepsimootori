from django.db import migrations


def change_separator(original_separator, new_separator, apps, schema_editor):
    # We get the model from the versioned app registry;
    # if we directly import it, it'll be the wrong version
    Event = apps.get_model("core", "Event")
    db_alias = schema_editor.connection.alias
    qs_with_accepted_tags = Event.objects.using(db_alias).exclude(acceptable_tags="")
    qs_with_map_tags = Event.objects.using(db_alias).exclude(map_tags="")
    for event in qs_with_accepted_tags:
        event.tags = event.tags.replace(original_separator, new_separator)
        event.save()
    for event in qs_with_map_tags:
        event.map_tags = event.tags.replace(original_separator, new_separator)
        event.save()

    MapAssignation = apps.get_model("core", "MapAssignation")
    qs_with_tags = MapAssignation.objects.using(db_alias).exclude(tags="")
    for map_assignation in qs_with_tags:
        map_assignation.tags = map_assignation.tags.replace(
            original_separator, new_separator
        )
        map_assignation.save()

    Competitor = apps.get_model("core", "Competitor")
    qs_with_tags = Competitor.objects.using(db_alias).exclude(tags="")
    for competitor in qs_with_tags:
        competitor.tags = competitor.tags.replace(original_separator, new_separator)
        competitor.save()


def forwards_func(apps, schema_editor):
    change_separator(" ", "\u2063", apps, schema_editor)


def reverse_func(apps, schema_editor):
    change_separator("\u2063", " ", apps, schema_editor)


class Migration(migrations.Migration):
    dependencies = [
        ("core", "0116_alter_event_map_tags_alter_event_map_title"),
    ]

    operations = [
        migrations.RunPython(forwards_func, reverse_func),
    ]
