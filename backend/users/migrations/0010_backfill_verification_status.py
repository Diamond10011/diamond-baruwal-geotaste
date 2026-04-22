from django.db import migrations


def backfill_verification_status(apps, schema_editor):
    CustomUser = apps.get_model("users", "CustomUser")
    Verification = apps.get_model("users", "Verification")

    verified_store_restaurant = CustomUser.objects.filter(
        role__in=["store", "restaurant"],
        verification_status="verified",
    )
    verified_with_verification = Verification.objects.values_list("user_id", flat=True)
    verified_store_restaurant.exclude(id__in=verified_with_verification).update(verification_status="pending")


class Migration(migrations.Migration):
    dependencies = [
        ("users", "0009_customuser_verification_status_notification_and_more"),
    ]

    operations = [
        migrations.RunPython(backfill_verification_status, migrations.RunPython.noop),
    ]

