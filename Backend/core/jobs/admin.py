from django.contrib import admin
from .models import Category, Job, Bid, Contract

admin.site.register(Category)
admin.site.register(Job)
admin.site.register(Bid)
admin.site.register(Contract)


# Register your models here.
