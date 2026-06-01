from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("users", "0004_freelancerprofile_categories"),
    ]

    operations = [
        migrations.AddField(
            model_name="customuser",
            name="is_2fa_enabled",
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name="customuser",
            name="totp_secret",
            field=models.CharField(blank=True, max_length=32, null=True),
        ),
    ]
