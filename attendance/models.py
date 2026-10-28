from django.db import models
from django.contrib.auth.models import User
from datetime import timedelta


class AttendanceSession(models.Model):
    WORK_MODE = [('OFFICE', 'Office'), ('WFH', 'Work From Home')]
    STATUS = [('OPEN', 'Open'), ('COMPLETED', 'Completed'), ('INCOMPLETE', 'Incomplete')]

    employee = models.ForeignKey('employees.EmployeeProfile', on_delete=models.CASCADE, related_name='attendance_sessions')
    work_date = models.DateField()
    clock_in_at = models.DateTimeField()
    clock_out_at = models.DateTimeField(null=True, blank=True)
    work_mode = models.CharField(max_length=10, choices=WORK_MODE, default='OFFICE')
    status = models.CharField(max_length=15, choices=STATUS, default='OPEN')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-work_date', '-clock_in_at']

    def __str__(self):
        return f'{self.employee.employee_id} - {self.work_date} ({self.work_mode})'

    @property
    def gross_duration(self):
        if self.clock_out_at and self.clock_in_at:
            return self.clock_out_at - self.clock_in_at
        return timedelta(0)

    @property
    def gross_hours_display(self):
        td = self.gross_duration
        hours, rem = divmod(int(td.total_seconds()), 3600)
        minutes = rem // 60
        return f'{hours}h {minutes}m'

    @property
    def is_open(self):
        return self.status == 'OPEN'


class WFHRequest(models.Model):
    STATUS = [
        ('PENDING', 'Pending'), ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'), ('CANCELLED', 'Cancelled'),
    ]
    employee = models.ForeignKey('employees.EmployeeProfile', on_delete=models.CASCADE, related_name='wfh_requests')
    start_date = models.DateField()
    end_date = models.DateField()
    reason = models.TextField(blank=True)
    status = models.CharField(max_length=15, choices=STATUS, default='PENDING')
    reviewed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='wfh_reviews')
    reviewed_at = models.DateTimeField(null=True, blank=True)
    reviewer_note = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.employee.employee_id} WFH {self.start_date} - {self.end_date}'

    @property
    def total_days(self):
        return (self.end_date - self.start_date).days + 1


class AttendanceCorrectionRequest(models.Model):
    STATUS = [('PENDING', 'Pending'), ('APPROVED', 'Approved'), ('REJECTED', 'Rejected')]

    employee = models.ForeignKey('employees.EmployeeProfile', on_delete=models.CASCADE, related_name='correction_requests')
    session = models.ForeignKey(AttendanceSession, on_delete=models.CASCADE, null=True, blank=True, related_name='correction_requests')
    work_date = models.DateField()
    original_clock_in = models.DateTimeField(null=True, blank=True)
    original_clock_out = models.DateTimeField(null=True, blank=True)
    requested_clock_in = models.DateTimeField()
    requested_clock_out = models.DateTimeField(null=True, blank=True)
    reason = models.TextField()
    status = models.CharField(max_length=15, choices=STATUS, default='PENDING')
    reviewed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='correction_reviews')
    reviewer_note = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
