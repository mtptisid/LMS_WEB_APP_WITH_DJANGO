from django.contrib import admin
from .models import Department, Designation, Shift, ShiftScheduleDay, EmployeeProfile, CompanyHoliday


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'is_active']
    search_fields = ['name', 'code']


@admin.register(Designation)
class DesignationAdmin(admin.ModelAdmin):
    list_display = ['title', 'level', 'is_active']


class ShiftScheduleDayInline(admin.TabularInline):
    model = ShiftScheduleDay
    extra = 0


@admin.register(Shift)
class ShiftAdmin(admin.ModelAdmin):
    list_display = ['name', 'start_time', 'end_time', 'break_minutes', 'is_active']
    inlines = [ShiftScheduleDayInline]


@admin.register(EmployeeProfile)
class EmployeeProfileAdmin(admin.ModelAdmin):
    list_display = ['employee_id', 'get_full_name', 'department', 'designation', 'employment_status']
    list_filter = ['employment_status', 'department', 'employment_type']
    search_fields = ['employee_id', 'user__username', 'user__first_name', 'user__last_name']
    raw_id_fields = ['reporting_manager']

    def get_full_name(self, obj):
        return obj.get_full_name()
    get_full_name.short_description = 'Full Name'


@admin.register(CompanyHoliday)
class CompanyHolidayAdmin(admin.ModelAdmin):
    list_display = ['name', 'date', 'holiday_type', 'is_active']
    ordering = ['date']
