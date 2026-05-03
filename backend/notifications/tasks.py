from celery import shared_task
from django.core.mail import EmailMultiAlternatives
from django.conf import settings
from django.utils import timezone


def create_notification(user, type, title, message, link=''):
    """Create in-app notification — callable from anywhere."""
    from .models import Notification
    try:
        Notification.objects.create(
            user=user, type=type,
            title=title, message=message, link=link
        )
        print(f"[NOTIFICATION] {user.email}: {title}")
    except Exception as e:
        print(f"[NOTIFICATION ERROR] {e}")


def _get_base_url():
    return getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')


def _divider():
    return '<div style="height:1px;background:#f1f5f9;margin:28px 0"></div>'


def _base_template(preheader, content_html):
    year = timezone.now().year
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Nexhire</title>
  <style>
    body{{margin:0;padding:0;background:#f1f5f9;
          font-family:'Segoe UI',Helvetica,Arial,sans-serif}}
    table{{border-collapse:collapse}}
    a{{color:#2563eb;text-decoration:none}}
  </style>
</head>
<body style="margin:0;padding:0;background:#f1f5f9">
  <div style="display:none;max-height:0;overflow:hidden;color:#f1f5f9;font-size:1px">
    {preheader}&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;
  </div>
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
    <tr>
      <td align="center" style="padding:40px 16px">
        <table width="600" cellpadding="0" cellspacing="0" role="presentation"
               style="max-width:600px;width:100%">

          <!-- Header -->
          <tr>
            <td style="background:#0f172a;padding:28px 40px;border-radius:12px 12px 0 0">
              <table cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td style="background:#2563eb;width:36px;height:36px;border-radius:8px;
                             text-align:center;vertical-align:middle">
                    <span style="color:#fff;font-size:18px;font-weight:800;
                                 line-height:36px;display:block">J</span>
                  </td>
                  <td style="padding-left:12px;vertical-align:middle">
                    <span style="color:#fff;font-size:18px;font-weight:700">Nexhire</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background:#ffffff;padding:40px;border-left:1px solid #e2e8f0;
                       border-right:1px solid #e2e8f0">
              {content_html}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc;padding:24px 40px;border:1px solid #e2e8f0;
                       border-top:none;border-radius:0 0 12px 12px">
              <p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.6">
                You received this email based on your Nexhire account preferences.
              </p>
              <p style="margin:8px 0 0;font-size:12px;color:#cbd5e1">
                &copy; {year} Nexhire. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""


def _job_listing_row(job, base_url):
    """Single job row used in alert / digest emails."""
    salary = ''
    if getattr(job, 'salary_min', None) and getattr(job, 'salary_max', None):
        salary = (f"&#8377;{job.salary_min/100000:.1f}"
                  f"&#8211;{job.salary_max/100000:.1f} LPA")
    elif getattr(job, 'salary_min', None):
        salary = f"&#8377;{job.salary_min/100000:.1f}+ LPA"

    meta_parts = [x for x in [job.location, getattr(job, 'work_mode', ''), salary] if x]
    meta       = '  &middot;  '.join(meta_parts)

    skills_html = ''
    if getattr(job, 'skills_required', None):
        skills_html = ''.join(
            f'<span style="display:inline-block;background:#f1f5f9;color:#475569;'
            f'font-size:11px;padding:3px 9px;border-radius:4px;margin:0 4px 4px 0">'
            f'{s}</span>'
            for s in job.skills_required[:4]
        )

    return f"""
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
           style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;
                  margin-bottom:12px">
      <tr>
        <td style="padding:20px 24px">
          <p style="margin:0 0 3px;font-size:16px;font-weight:700;color:#0f172a">
            {job.title}
          </p>
          <p style="margin:0 0 6px;font-size:13px;color:#475569;font-weight:500">
            {job.company.name}
          </p>
          {'<p style="margin:0 0 10px;font-size:12px;color:#94a3b8">' + meta + '</p>' if meta else ''}
          {skills_html}
          <div style="margin-top:14px">
            <a href="{base_url}/jobs/{job.slug}"
               style="display:inline-block;background:#2563eb;color:#ffffff;
                      font-size:13px;font-weight:600;padding:9px 20px;
                      border-radius:7px;text-decoration:none">
              View Position
            </a>
          </div>
        </td>
      </tr>
    </table>"""


# ── Job alert emails ──────────────────────────────────────────────────────────

@shared_task
def send_job_alerts():
    from .models import JobAlert
    from jobs.models import Job

    BASE   = _get_base_url()
    alerts = JobAlert.objects.filter(is_active=True).select_related('user')
    print(f"[TASK] Processing {alerts.count()} job alerts")

    for alert in alerts:
        try:
            qs = Job.objects.filter(status='active').select_related('company')

            if alert.last_sent:
                qs = qs.filter(created_at__gt=alert.last_sent)
            if alert.keywords:
                from django.db.models import Q
                qs = qs.filter(
                    Q(title__icontains=alert.keywords) |
                    Q(description__icontains=alert.keywords)
                )
            if alert.location:
                qs = qs.filter(location__icontains=alert.location)
            if alert.job_type:
                qs = qs.filter(job_type=alert.job_type)
            if alert.work_mode:
                qs = qs.filter(work_mode=alert.work_mode)
            if alert.min_salary:
                qs = qs.filter(salary_min__gte=alert.min_salary)

            jobs = list(qs[:10])
            if not jobs:
                continue

            keyword_label = f'&ldquo;{alert.keywords}&rdquo;' if alert.keywords else 'your saved criteria'
            count         = len(jobs)
            jobs_html     = ''.join(_job_listing_row(j, BASE) for j in jobs)

            content = f"""
            <span style="display:inline-block;background:#eff6ff;color:#1d4ed8;
                          font-size:11px;font-weight:600;letter-spacing:0.5px;
                          text-transform:uppercase;padding:4px 12px;border-radius:100px">
              Job Alert
            </span>

            <h1 style="margin:20px 0 8px;font-size:22px;font-weight:700;color:#0f172a">
              {count} new position{'s' if count > 1 else ''} for you
            </h1>
            <p style="margin:0 0 28px;font-size:14px;color:#64748b">
              Matching {keyword_label}
            </p>

            {jobs_html}
            {_divider()}

            <p style="margin:0;font-size:13px;color:#94a3b8">
              <a href="{BASE}/alerts" style="color:#94a3b8;text-decoration:underline">
                Manage your alerts
              </a>
              &nbsp;&middot;&nbsp;
              <a href="{BASE}/jobs" style="color:#94a3b8;text-decoration:underline">
                Browse all positions
              </a>
            </p>
            """

            html = _base_template(
                f"{count} new job{'s' if count>1 else ''} matching {alert.keywords or 'your alert'}.",
                content,
            )

            msg = EmailMultiAlternatives(
                subject=(f"{count} new position{'s' if count>1 else ''} "
                         f"matching {alert.keywords or 'your alert'} — Nexhire"),
                body=f"{count} new jobs matching your alert on Nexhire.",
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[alert.user.email],
            )
            msg.attach_alternative(html, 'text/html')
            msg.send(fail_silently=True)

            create_notification(
                user=alert.user,
                type='job_alert',
                title=f'{count} new position{"s" if count>1 else ""} for your alert',
                message=f'New roles matching {alert.keywords or "your criteria"} are available.',
                link='/jobs',
            )

            alert.last_sent = timezone.now()
            alert.save(update_fields=['last_sent'])
            print(f"[EMAIL] Job alert sent to {alert.user.email} ({count} jobs)")

        except Exception as e:
            print(f"[TASK ERROR] Job alert for {alert.user.email}: {e}")
            continue


# ── Weekly digest ─────────────────────────────────────────────────────────────

@shared_task
def send_weekly_digest():
    from django.contrib.auth import get_user_model
    from jobs.models import Job
    from datetime import timedelta

    BASE     = _get_base_url()
    User     = get_user_model()
    seekers  = User.objects.filter(role='jobseeker', is_active=True)
    week_ago = timezone.now() - timedelta(days=7)
    new_jobs = list(
        Job.objects.filter(status='active', created_at__gte=week_ago)
        .select_related('company')[:12]
    )

    if not new_jobs:
        print("[TASK] No new jobs for weekly digest")
        return

    print(f"[TASK] Sending weekly digest to {seekers.count()} seekers")
    count = len(new_jobs)

    for user in seekers:
        try:
            profile = getattr(user, 'jobseeker_profile', None)
            name    = profile.full_name if profile else 'there'

            jobs_html = ''.join(_job_listing_row(j, BASE) for j in new_jobs)

            content = f"""
            <span style="display:inline-block;background:#f8fafc;color:#475569;
                          font-size:11px;font-weight:600;letter-spacing:0.5px;
                          text-transform:uppercase;padding:4px 12px;
                          border-radius:100px;border:1px solid #e2e8f0">
              Weekly Digest
            </span>

            <h1 style="margin:20px 0 8px;font-size:22px;font-weight:700;color:#0f172a">
              This week on Nexhire
            </h1>
            <p style="margin:0 0 28px;font-size:14px;color:#64748b">
              Hi {name} &mdash; here are {count} new position{'s' if count>1 else ''}
              posted this week.
            </p>

            {jobs_html}
            {_divider()}

            <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
              <tr>
                <td align="center">
                  <a href="{BASE}/jobs"
                     style="display:inline-block;background:#0f172a;color:#ffffff;
                            font-size:14px;font-weight:600;padding:14px 32px;
                            border-radius:8px;text-decoration:none">
                    Browse All Positions
                  </a>
                </td>
              </tr>
            </table>

            <p style="margin:28px 0 0;font-size:13px;color:#94a3b8;text-align:center">
              <a href="{BASE}/profile" style="color:#94a3b8;text-decoration:underline">
                Update your profile
              </a>
              &nbsp;&middot;&nbsp;
              <a href="{BASE}/alerts" style="color:#94a3b8;text-decoration:underline">
                Manage alerts
              </a>
            </p>
            """

            html = _base_template(
                f"{count} new positions posted this week on Nexhire.",
                content,
            )

            msg = EmailMultiAlternatives(
                subject=f"Your weekly digest — {count} new position{'s' if count>1 else ''} on Nexhire",
                body=f"{count} new jobs posted this week on Nexhire.",
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[user.email],
            )
            msg.attach_alternative(html, 'text/html')
            msg.send(fail_silently=True)

        except Exception as e:
            print(f"[TASK ERROR] Weekly digest for {user.email}: {e}")
            continue


# ── Matched job alerts (skill-based, daily) ───────────────────────────────────

@shared_task
def send_matched_job_alerts():
    from django.contrib.auth import get_user_model
    from jobs.models import Job
    from django.db.models import Q
    from datetime import timedelta

    BASE    = _get_base_url()
    User    = get_user_model()
    seekers = User.objects.filter(role='jobseeker', is_active=True)
    day_ago = timezone.now() - timedelta(hours=24)

    print(f"[TASK] Matched alerts for {seekers.count()} seekers")

    for user in seekers:
        try:
            profile = getattr(user, 'jobseeker_profile', None)
            if not profile:
                continue

            skills   = profile.skills or []
            headline = profile.headline or ''
            name     = profile.full_name or 'there'

            if not skills and not headline:
                continue

            q = Q()
            for skill in skills[:5]:
                q |= Q(skills_required__icontains=skill)
                q |= Q(title__icontains=skill)
            if headline:
                for word in [w for w in headline.split() if len(w) > 3][:3]:
                    q |= Q(title__icontains=word)

            jobs = list(
                Job.objects.filter(q, status='active', created_at__gte=day_ago)
                .select_related('company').distinct()[:8]
            )
            if not jobs:
                continue

            count      = len(jobs)
            skill_tags = ''.join(
                f'<span style="display:inline-block;background:#eff6ff;color:#1d4ed8;'
                f'font-size:12px;padding:4px 12px;border-radius:100px;margin:0 6px 6px 0">'
                f'{s}</span>'
                for s in skills[:5]
            )
            jobs_html = ''.join(_job_listing_row(j, BASE) for j in jobs)

            content = f"""
            <span style="display:inline-block;background:#f0fdf4;color:#15803d;
                          font-size:11px;font-weight:600;letter-spacing:0.5px;
                          text-transform:uppercase;padding:4px 12px;border-radius:100px">
              Matched For You
            </span>

            <h1 style="margin:20px 0 8px;font-size:22px;font-weight:700;color:#0f172a">
              {count} position{'s' if count>1 else ''} matching your profile
            </h1>
            <p style="margin:0 0 16px;font-size:14px;color:#64748b">
              Hi {name} &mdash; based on your skills and experience, these roles
              were posted in the last 24 hours.
            </p>

            <div style="margin-bottom:28px">{skill_tags}</div>

            {jobs_html}
            {_divider()}

            <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
              <tr>
                <td align="center">
                  <a href="{BASE}/jobs"
                     style="display:inline-block;background:#2563eb;color:#ffffff;
                            font-size:14px;font-weight:600;padding:14px 32px;
                            border-radius:8px;text-decoration:none">
                    Browse All Matching Positions
                  </a>
                </td>
              </tr>
            </table>

            <p style="margin:28px 0 0;font-size:13px;color:#94a3b8;text-align:center">
              <a href="{BASE}/profile" style="color:#94a3b8;text-decoration:underline">
                Update profile &amp; skills
              </a>
              &nbsp;&middot;&nbsp;
              <a href="{BASE}/alerts" style="color:#94a3b8;text-decoration:underline">
                Manage alerts
              </a>
            </p>
            """

            html = _base_template(
                f"{count} new roles matching your skills posted today.",
                content,
            )

            msg = EmailMultiAlternatives(
                subject=(f"{count} position{'s' if count>1 else ''} matching your "
                         f"profile today — Nexhire"),
                body=f"{count} new jobs matching your skills on Nexhire.",
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[user.email],
            )
            msg.attach_alternative(html, 'text/html')
            msg.send(fail_silently=True)

            create_notification(
                user=user,
                type='job_alert',
                title=f'{count} position{"s" if count>1 else ""} matched your profile',
                message=f'Roles matching: {", ".join(skills[:3])}',
                link='/jobs',
            )
            print(f"[EMAIL] Matched alert sent to {user.email}")

        except Exception as e:
            print(f"[TASK ERROR] Matched alert for {user.email}: {e}")
            continue