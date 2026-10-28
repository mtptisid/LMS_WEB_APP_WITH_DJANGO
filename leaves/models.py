from django.db import models
from django.contrib.auth.models import User
from decimal import Decimal


class LeaveType(models.Model):
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=20, unique=True)
    description = models.TextField(blank=True)
    is_paid = models.BooleanField(default=True)
    requires_balance = models.BooleanField(default=True)
    allows_half_day = models.BooleanField(default=True)
    requires_attachment = models.BooleanField(default=False)
    carry_forward_allowed = models.BooleanField(default=False)
    max_carry_forward_days = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return f'{self.name} ({self.code})'


class LeavePeriod(models.Model):
    name = models.CharField(max_length=100)
    start_date = models.DateField()
    end_date = models.DateField()
    is_current = models.BooleanField(default=False)

    class Meta:
        ordering = ['-start_date']

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if self.is_current:
            LeavePeriod.objects.exclude(pk=self.pk).update(is_current=False)
        super().save(*args, **kwargs)


class LeaveBalanceAccount(models.Model):
    employee = models.ForeignKey('employees.EmployeeProfile', on_delete=models.CASCADE, related_name='leave_balances')
    leave_type = models.ForeignKey(LeaveType, on_delete=models.CASCADE, related_name='balances')
    period = models.ForeignKey(LeavePeriod, on_delete=models.CASCADE, related_name='balances')
    opening_balance = models.DecimalField(max_digits=6, decimal_places=2, default=Decimal('0'))
    accrued_days = models.DecimalField(max_digits=6, decimal_places=2, default=Decimal('0'))
    carry_forward_days = models.DecimalField(max_digits=6, decimal_places=2, default=Decimal('0'))
    adjustment_days = models.DecimalField(max_digits=6, decimal_places=2, default=Decimal('0'))
    consumed_days = models.DecimalField(max_digits=6, decimal_places=2, default=Decimal('0'))
    reserved_days = models.DecimalField(max_digits=6, decimal_places=2, default=Decimal('0'))
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('employee', 'leave_type', 'period')

    def __str__(self):
        return f'{self.employee.employee_id} - {self.leave_type.code}'

    @property
    def available_balance(self):
        return (self.opening_balance + self.accrued_days + self.carry_forward_days +
                self.adjustment_days - self.consumed_days - self.reserved_days)


class LeaveRequest(models.Model):
    HALF_PERIOD = [('FIRST', 'First Half'), ('SECOND', 'Second Half')]
    STATUS = [
        ('PENDING', 'Pending'), ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'), ('CANCELLED', 'Cancelled'), ('WITHDRAWN', 'Withdrawn'),
    ]
    employee = models.ForeignKey('employees.EmployeeProfile', on_delete=models.CASCADE, related_name='leave_requests')
    leave_type = models.ForeignKey(LeaveType, on_delete=models.PROTECT, related_name='requests')
    start_date = models.DateField()
    end_date = models.DateField()
    start_half = models.CharField(max_length=10, choices=HALF_PERIOD, null=True, blank=True)
    end_half = models.CharField(max_length=10, choices=HALF_PERIOD, null=True, blank=True)
    requested_days = models.DecimalField(max_digits=6, decimal_places=2)
    reason = models.TextField(blank=True)
    status = models.CharField(max_length=15, choices=STATUS, default='PENDING')
    submitted_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    cancelled_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-submitted_at']

    def __str__(self):
        return f'{self.employee.employee_id} - {self.leave_type.code} {self.start_date}'

    @property
    def duration_display(self):
        d = float(self.requested_days)
        if d == 0.5:
            return 'Half Day'
        return f'{int(d) if d == int(d) else d} Day{"s" if d != 1 else ""}'


class LeaveApproval(models.Model):
    request = models.ForeignKey(LeaveRequest, on_delete=models.CASCADE, related_name='approvals')
    approver = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='leave_approvals')
    decision = models.CharField(max_length=15, choices=[('APPROVED', 'Approved'), ('REJECTED', 'Rejected')])
    note = models.TextField(blank=True)
    decided_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-decided_at']


class LeaveBalanceTransaction(models.Model):
    TYPES = [
        ('CREDIT', 'Credit'), ('DEBIT', 'Debit'), ('REVERSAL', 'Reversal'),
        ('ADJUSTMENT', 'Adjustment'), ('CARRY_FORWARD', 'Carry Forward'),
    ]
    employee = models.ForeignKey('employees.EmployeeProfile', on_delete=models.CASCADE, related_name='balance_transactions')
    leave_type = models.ForeignKey(LeaveType, on_delete=models.CASCADE)
    balance_account = models.ForeignKey(LeaveBalanceAccount, on_delete=models.CASCADE, related_name='transactions')
    transaction_type = models.CharField(max_length=20, choices=TYPES)
    amount = models.DecimalField(max_digits=6, decimal_places=2)
    effective_date = models.DateField()
    reference = models.CharField(max_length=100, blank=True)
    description = models.TextField(blank=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='balance_transactions_created')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
