from django.db import models
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError


class Department(models.Model):
    name = models.CharField(max_length=100, unique=True)
    code = models.CharField(max_length=20, unique=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class Designation(models.Model):
    title = models.CharField(max_length=100, unique=True)
    level = models.PositiveSmallIntegerField(default=1)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['level', 'title']

    def __str__(self):
        return self.title


class Shift(models.Model):
    name = models.CharField(max_length=100)
    start_time = models.TimeField()
    end_time = models.TimeField()
    break_minutes = models.PositiveIntegerField(default=60)
    grace_period_minutes = models.PositiveIntegerField(default=15)
    is_overnight = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return f'{self.name} ({self.start_time.strftime("%I:%M %p")} - {self.end_time.strftime("%I:%M %p")})'


class ShiftScheduleDay(models.Model):
    WEEKDAYS = [
        (0, 'Monday'), (1, 'Tuesday'), (2, 'Wednesday'),
        (3, 'Thursday'), (4, 'Friday'), (5, 'Saturday'), (6, 'Sunday'),
    ]
    shift = models.ForeignKey(Shift, on_delete=models.CASCADE, related_name='schedule_days')
    weekday = models.PositiveSmallIntegerField(choices=WEEKDAYS)
    is_working = models.BooleanField(default=True)
    start_time = models.TimeField(null=True, blank=True)
    end_time = models.TimeField(null=True, blank=True)

    class Meta:
        unique_together = ('shift', 'weekday')
        ordering = ['weekday']

    def __str__(self):
        return f'{self.shift.name} - {self.get_weekday_display()}'


class EmployeeProfile(models.Model):
    EMPLOYMENT_STATUS = [
        ('ACTIVE', 'Active'),
        ('INACTIVE', 'Inactive'),
        ('ON_LEAVE', 'On Leave'),
    ]
    EMPLOYMENT_TYPE = [
        ('FULL_TIME', 'Full Time'),
        ('PART_TIME', 'Part Time'),
        ('CONTRACT', 'Contract'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='employee_profile')
    employee_id = models.CharField(max_length=20, unique=True)
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True, related_name='employees')
    designation = models.ForeignKey(Designation, on_delete=models.SET_NULL, null=True, blank=True, related_name='employees')
    reporting_manager = models.ForeignKey(
        'self', on_delete=models.SET_NULL, null=True, blank=True, related_name='direct_reports_set'
    )
    date_of_joining = models.DateField(null=True, blank=True)
    employment_status = models.CharField(max_length=20, choices=EMPLOYMENT_STATUS, default='ACTIVE')
    employment_type = models.CharField(max_length=20, choices=EMPLOYMENT_TYPE, default='FULL_TIME')
    work_location = models.CharField(max_length=100, default='Office')
    assigned_shift = models.ForeignKey(Shift, on_delete=models.SET_NULL, null=True, blank=True, related_name='employees')
    phone = models.CharField(max_length=20, blank=True)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['employee_id']

    def __str__(self):
        return f'{self.get_full_name()} ({self.employee_id})'

    def clean(self):
        if self.reporting_manager and self.pk and self.reporting_manager.pk == self.pk:
            raise ValidationError('An employee cannot report to themselves.')
        if self.reporting_manager and self.pk:
            mgr = self.reporting_manager
            visited = set()
            while mgr:
                if mgr.pk == self.pk:
                    raise ValidationError('Circular reporting hierarchy detected.')
                if mgr.pk in visited:
                    break
                visited.add(mgr.pk)
                mgr = mgr.reporting_manager

    def get_full_name(self):
        name = f'{self.user.first_name} {self.user.last_name}'.strip()
        return name or self.user.username

    def get_initials(self):
        fn = self.user.first_name
        ln = self.user.last_name
        if fn and ln:
            return (fn[0] + ln[0]).upper()
        return self.user.username[:2].upper()

    @property
    def is_hr(self):
        return self.user.groups.filter(name='HR').exists()

    @property
    def direct_reports(self):
        return EmployeeProfile.objects.filter(reporting_manager=self).select_related('user', 'department', 'designation')

    def get_ancestors(self):
        chain = []
        mgr = self.reporting_manager
        visited = set()
        while mgr and mgr.pk not in visited:
            chain.append(mgr)
            visited.add(mgr.pk)
            mgr = mgr.reporting_manager
        return chain


class CompanyHoliday(models.Model):
    HOLIDAY_TYPES = [
        ('NATIONAL', 'National Holiday'),
        ('REGIONAL', 'Regional Holiday'),
        ('OPTIONAL', 'Optional Holiday'),
    ]
    date = models.DateField(unique=True)
    name = models.CharField(max_length=200)
    holiday_type = models.CharField(max_length=20, choices=HOLIDAY_TYPES, default='NATIONAL')
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['date']

    def __str__(self):
        return f'{self.name} ({self.date})'
