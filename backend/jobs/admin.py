from django.contrib import admin
from .models import Job

class JobAdmin(admin.ModelAdmin):
    list_display = ['title', 'company', 'location', 'status']  # adjust fields as needed
    search_fields = ['title', 'company']
    list_filter = ['status']

# Register your models here with the custom admin class
# admin.site.register(Job, JobAdmin)