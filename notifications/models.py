from django.db import models
from django.contrib.auth.models import User


class Notification(models.Model):
    TYPES = [
        ('LEAVE_REQUEST', 'Leave Request'),
        ('LEAVE_APPROVED', 'Leave Approved'),
        ('LEAVE_REJECTED', 'Leave Rejected'),
        ('WFH_REQUEST', 'WFH Request'),
        ('WFH_APPROVED', 'WFH Approved'),
        ('WFH_REJECTED', 'WFH Rejected'),
        ('CORRECTION_DECIDED', 'Correction Decided'),
        ('SYSTEM', 'System'),
        ('ANNOUNCEMENT', 'Announcement'),
    ]
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    notification_type = models.CharField(max_length=30, choices=TYPES, default='SYSTEM')
    title = models.CharField(max_length=200)
    message = models.TextField()
    target_url = models.CharField(max_length=300, blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    read_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.recipient.username} - {self.title}'

    def get_icon(self):
        return {
            'LEAVE_REQUEST': 'calendar', 'LEAVE_APPROVED': 'check-circle',
            'LEAVE_REJECTED': 'x-circle', 'WFH_REQUEST': 'home',
            'WFH_APPROVED': 'check-circle', 'WFH_REJECTED': 'x-circle',
            'CORRECTION_DECIDED': 'edit', 'SYSTEM': 'bell', 'ANNOUNCEMENT': 'megaphone',
        }.get(self.notification_type, 'bell')
