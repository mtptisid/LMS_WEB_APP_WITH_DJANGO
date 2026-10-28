from django.contrib import admin
from .models import LeaveType, LeavePeriod, LeaveBalanceAccount, LeaveRequest, LeaveApproval, LeaveBalanceTransaction


@admin.register(LeaveType)
class LeaveTypeAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'is_paid', 'requires_balance', 'carry_forward_allowed', 'is_active']
    list_filter = ['is_paid', 'is_active']


@admin.register(LeavePeriod)
class LeavePeriodAdmin(admin.ModelAdmin):
    list_display = ['name', 'start_date', 'end_date', 'is_current']


@admin.register(LeaveBalanceAccount)
class LeaveBalanceAccountAdmin(admin.ModelAdmin):
    list_display = ['employee', 'leave_type', 'period', 'accrued_days', 'consumed_days', 'available_balance']
    list_filter = ['leave_type', 'period']
    search_fields = ['employee__employee_id', 'employee__user__full_name']

    def available_balance(self, obj):
        return obj.available_balance
    available_balance.short_description = 'Available'


@admin.register(LeaveRequest)
class LeaveRequestAdmin(admin.ModelAdmin):
    list_display = ['employee', 'leave_type', 'start_date', 'end_date', 'requested_days', 'status', 'submitted_at']
    list_filter = ['status', 'leave_type']
    search_fields = ['employee__employee_id', 'employee__user__full_name']
    date_hierarchy = 'start_date'


@admin.register(LeaveApproval)
class LeaveApprovalAdmin(admin.ModelAdmin):
    list_display = ['request', 'approver', 'decision', 'decided_at']
    list_filter = ['decision']


@admin.register(LeaveBalanceTransaction)
class LeaveBalanceTransactionAdmin(admin.ModelAdmin):
    list_display = ['employee', 'leave_type', 'transaction_type', 'amount', 'effective_date', 'created_by']
    list_filter = ['transaction_type', 'leave_type']
