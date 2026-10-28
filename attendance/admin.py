from django.contrib import admin
from .models import AttendanceSession, WFHRequest, AttendanceCorrectionRequest


@admin.register(AttendanceSession)
class AttendanceSessionAdmin(admin.ModelAdmin):
    list_display = ['employee', 'work_date', 'clock_in_at', 'clock_out_at', 'work_mode', 'status']
    list_filter = ['work_mode', 'status', 'work_date']
    search_fields = ['employee__employee_id', 'employee__user__full_name']
    date_hierarchy = 'work_date'


@admin.register(WFHRequest)
class WFHRequestAdmin(admin.ModelAdmin):
    list_display = ['employee', 'start_date', 'end_date', 'status', 'reviewed_by', 'created_at']
    list_filter = ['status']
    search_fields = ['employee__employee_id', 'employee__user__full_name']


@admin.register(AttendanceCorrectionRequest)
class CorrectionRequestAdmin(admin.ModelAdmin):
    list_display = ['employee', 'work_date', 'status', 'reviewed_by', 'created_at']
    list_filter = ['status']
