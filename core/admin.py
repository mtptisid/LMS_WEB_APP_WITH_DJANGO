from django.contrib import admin
from .models import AuditLog


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ['actor', 'action', 'entity_type', 'entity_id', 'timestamp', 'ip_address']
    list_filter = ['action', 'entity_type']
    search_fields = ['actor__email', 'action', 'entity_type', 'change_summary']
    readonly_fields = ['actor', 'action', 'entity_type', 'entity_id', 'timestamp', 'change_summary', 'ip_address']

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False
