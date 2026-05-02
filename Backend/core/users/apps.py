from django.apps import AppConfig


class UsersConfig(AppConfi):
    default_auto_field = "django.db.models.BigAutoField"
    name = "users"

    def ready(self):
        import users.signals  # noqa