from celery import shared_task
from django.core.mail import EmailMultiAlternatives
from django.conf import settings
from django.utils import timezone


# ── Helpers ───────────────────────────────────────────────────────────────────

def _get_base_url():
    return getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')


def _send_html_email(subject, to_email, html_content, plain_text):
    try:
        msg = EmailMultiAlternatives(
            subject=subject,
            body=plain_text,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[to_email],
        )
        msg.attach_alternative(html_content, 'text/html')
        msg.send(fail_silently=False)
        return True
    except Exception as e:
        print(f"[EMAIL ERROR] {e}")
        return False


def _base_template(preheader, content_html):
    """
    Single source-of-truth for every transactional email.
    Clean, minimal, professional — no emoji, proper typography.
    """
    year = timezone.now().year
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
  <title>Nexhire</title>
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings>
  <o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
  <style>
    body,table,td,a{{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%}}
    body{{margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Helvetica,Arial,sans-serif}}
    table{{border-collapse:collapse;mso-table-lspace:0;mso-table-rspace:0}}
    img{{border:0;height:auto;line-height:100%;outline:none;text-decoration:none}}
    a{{color:#2563eb;text-decoration:none}}
  </style>
</head>
<body style="margin:0;padding:0;background:#f1f5f9">

  <!-- Preheader (hidden preview text) -->
  <div style="display:none;max-height:0;overflow:hidden;color:#f1f5f9;font-size:1px">
    {preheader}&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;
    &#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;
  </div>

  <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
    <tr>
      <td align="center" style="padding:40px 16px">
        <table width="600" cellpadding="0" cellspacing="0" role="presentation"
               style="max-width:600px;width:100%">

          <!-- ── Header ── -->
          <tr>
            <td style="background:#0f172a;padding:28px 40px;border-radius:12px 12px 0 0">
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td>
                    <!-- Wordmark -->
                    <table cellpadding="0" cellspacing="0" role="presentation">
                      <tr>
                        <td style="background:#2563eb;width:36px;height:36px;
                                   border-radius:8px;text-align:center;
                                   vertical-align:middle">
                          <span style="color:#ffffff;font-size:18px;font-weight:800;
                                       line-height:36px;display:block">J</span>
                        </td>
                        <td style="padding-left:12px;vertical-align:middle">
                          <span style="color:#ffffff;font-size:18px;font-weight:700;
                                       letter-spacing:-0.3px">Nexhire</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── Body ── -->
          <tr>
            <td style="background:#ffffff;padding:40px;border-left:1px solid #e2e8f0;
                       border-right:1px solid #e2e8f0">
              {content_html}
            </td>
          </tr>

          <!-- ── Footer ── -->
          <tr>
            <td style="background:#f8fafc;padding:24px 40px;border:1px solid #e2e8f0;
                       border-top:none;border-radius:0 0 12px 12px">
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td style="font-size:12px;color:#94a3b8;line-height:1.6">
                    You received this email because of activity on your Nexhire account.
                    If you did not expect this email, you can safely ignore it.
                  </td>
                </tr>
                <tr>
                  <td style="padding-top:12px;font-size:12px;color:#cbd5e1">
                    &copy; {year} Nexhire. All rights reserved.
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""


def _pill(text, bg, color):
    """Inline status/badge pill."""
    return (f'<span style="display:inline-block;background:{bg};color:{color};'
            f'font-size:11px;font-weight:600;letter-spacing:0.5px;text-transform:uppercase;'
            f'padding:4px 12px;border-radius:100px">{text}</span>')


def _divider():
    return '<div style="height:1px;background:#f1f5f9;margin:28px 0"></div>'


def _cta_button(url, text, bg='#2563eb'):
    return f"""
    <table cellpadding="0" cellspacing="0" role="presentation" style="margin-top:32px">
      <tr>
        <td style="background:{bg};border-radius:8px">
          <a href="{url}"
             style="display:inline-block;color:#ffffff;font-size:14px;font-weight:600;
                    padding:14px 32px;text-decoration:none;letter-spacing:0.2px">
            {text}
          </a>
        </td>
      </tr>
    </table>"""


def _job_card(title, company, location, work_mode='', salary=''):
    meta_parts = [x for x in [location, work_mode, salary] if x]
    meta_html  = '  &middot;  '.join(meta_parts)
    return f"""
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
           style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;
                  margin-bottom:16px">
      <tr>
        <td style="padding:20px 24px">
          <p style="margin:0 0 4px;font-size:17px;font-weight:700;color:#0f172a;
                    line-height:1.3">{title}</p>
          <p style="margin:0 0 8px;font-size:14px;color:#475569;font-weight:500">
            {company}
          </p>
          {'<p style="margin:0;font-size:13px;color:#94a3b8">' + meta_html + '</p>' if meta_html else ''}
        </td>
      </tr>
    </table>"""


# ── Status email task ─────────────────────────────────────────────────────────

@shared_task(bind=True, max_retries=3)
def notify_application_status(self, application_id):
    from applications.models import Application
    from notifications.tasks import create_notification

    BASE = _get_base_url()

    STATUS_MAP = {
        'viewed': {
            'preheader': 'A recruiter viewed your application.',
            'pill_text': 'Application Viewed',
            'pill_bg':   '#eff6ff',
            'pill_color':'#1d4ed8',
            'heading':   'Your application has been reviewed',
            'body':      (
                'A recruiter at <strong style="color:#0f172a">{company}</strong> has reviewed '
                'your application for the <strong style="color:#0f172a">{title}</strong> position. '
                'This is a positive signal — they are actively evaluating candidates.'
            ),
            'note':      'Ensure your profile and resume are current. Recruiters often review them again before reaching out.',
            'cta_text':  'View Your Applications',
            'cta_bg':    '#2563eb',
        },
        'shortlisted': {
            'preheader': 'Congratulations — you have been shortlisted.',
            'pill_text': 'Shortlisted',
            'pill_bg':   '#f0fdf4',
            'pill_color':'#15803d',
            'heading':   'You have been shortlisted',
            'body':      (
                'Congratulations. <strong style="color:#0f172a">{company}</strong> has shortlisted '
                'you for the <strong style="color:#0f172a">{title}</strong> role. '
                'You are among the top candidates being considered for this position.'
            ),
            'note':      'The recruiter will contact you with next steps. Keep an eye on your email and messages.',
            'cta_text':  'View Application Status',
            'cta_bg':    '#16a34a',
        },
        'interviewing': {
            'preheader': 'You have been selected for an interview.',
            'pill_text': 'Interview Stage',
            'pill_bg':   '#fffbeb',
            'pill_color':'#b45309',
            'heading':   'Interview invitation',
            'body':      (
                '<strong style="color:#0f172a">{company}</strong> has selected you for an interview '
                'for the <strong style="color:#0f172a">{title}</strong> position. '
                'The recruiter will reach out with scheduling details.'
            ),
            'note':      'Research the company, review the job description, and prepare relevant examples from your experience.',
            'cta_text':  'View Interview Details',
            'cta_bg':    '#d97706',
        },
        'offered': {
            'preheader': 'You have received a job offer.',
            'pill_text': 'Offer Extended',
            'pill_bg':   '#f0fdf4',
            'pill_color':'#15803d',
            'heading':   'Job offer received',
            'body':      (
                '<strong style="color:#0f172a">{company}</strong> has extended a formal offer for the '
                '<strong style="color:#0f172a">{title}</strong> position. '
                'Please review the offer details carefully and respond at your earliest convenience.'
            ),
            'note':      'Take the time to review all offer terms. Do not hesitate to ask the recruiter for clarification on any detail.',
            'cta_text':  'View Offer',
            'cta_bg':    '#16a34a',
        },
        'rejected': {
            'preheader': 'An update regarding your application.',
            'pill_text': 'Application Closed',
            'pill_bg':   '#f8fafc',
            'pill_color':'#64748b',
            'heading':   'Application update',
            'body':      (
                'Thank you for your interest in the <strong style="color:#0f172a">{title}</strong> position '
                'at <strong style="color:#0f172a">{company}</strong>. After careful consideration, '
                'they have decided to move forward with another candidate at this time.'
            ),
            'note':      'This outcome does not reflect your overall qualifications. We encourage you to continue exploring opportunities — new roles are posted daily.',
            'cta_text':  'Browse Open Positions',
            'cta_bg':    '#475569',
        },
    }

    try:
        app = Application.objects.select_related(
            'job', 'job__company', 'applicant'
        ).get(id=application_id)

        info = STATUS_MAP.get(app.status)
        if not info:
            return

        title   = app.job.title
        company = app.job.company.name
        body    = info['body'].format(title=title, company=company)
        plain   = (f"Update on your application for {title} at {company}: "
                   f"Status changed to {app.status}.")

        # ── In-app notification ──
        create_notification(
            user=app.applicant,
            type='application_status',
            title=info['heading'],
            message=plain,
            link='/applications',
        )

        # ── Build email ──
        content = f"""
        {_pill(info['pill_text'], info['pill_bg'], info['pill_color'])}

        <h1 style="margin:20px 0 8px;font-size:22px;font-weight:700;
                   color:#0f172a;line-height:1.3">
          {info['heading']}
        </h1>
        <p style="margin:0 0 28px;font-size:14px;color:#64748b">
          Nexhire &mdash; Application Update
        </p>

        {_job_card(title, company, app.job.location, app.job.work_mode)}
        {_divider()}

        <p style="margin:0;font-size:15px;color:#334155;line-height:1.75">
          {body}
        </p>

        <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
               style="background:#f8fafc;border-left:3px solid {info['cta_bg']};
                      border-radius:0 8px 8px 0;margin-top:24px">
          <tr>
            <td style="padding:16px 20px;font-size:13px;color:#475569;line-height:1.6">
              {info['note']}
            </td>
          </tr>
        </table>

        {_cta_button(f"{BASE}/applications", info['cta_text'], info['cta_bg'])}
        """

        html = _base_template(info['preheader'], content)

        _send_html_email(
            subject=f"Application Update — {title} at {company}",
            to_email=app.applicant.email,
            html_content=html,
            plain_text=plain,
        )
        print(f"[EMAIL] Status update sent to {app.applicant.email} ({app.status})")

    except Exception as exc:
        print(f"[TASK ERROR] notify_application_status: {exc}")
        raise self.retry(exc=exc, countdown=60)


# ── New application → recruiter ───────────────────────────────────────────────

@shared_task(bind=True, max_retries=3)
def notify_new_application(self, application_id):
    from applications.models import Application
    from notifications.tasks import create_notification

    BASE = _get_base_url()

    try:
        app = Application.objects.select_related(
            'job', 'job__company', 'applicant',
            'applicant__jobseeker_profile'
        ).get(id=application_id)

        recruiter = app.job.posted_by
        profile   = getattr(app.applicant, 'jobseeker_profile', None)
        name      = profile.full_name if profile else app.applicant.email
        headline  = profile.headline  if profile else ''
        exp       = (f"{profile.experience_years} years experience"
                     if profile and profile.experience_years else '')
        location  = profile.location if profile else ''

        plain = f"{name} has applied for {app.job.title}."

        create_notification(
            user=recruiter,
            type='new_application',
            title=f'New application — {app.job.title}',
            message=plain,
            link='/recruiter/applications',
        )

        # Candidate meta rows
        meta_rows = ''
        for label, value in [
            ('Position applied', app.job.title),
            ('Experience',       exp),
            ('Location',         location),
            ('Headline',         headline),
        ]:
            if value:
                meta_rows += f"""
                <tr>
                  <td style="padding:10px 0;font-size:13px;color:#64748b;
                             border-bottom:1px solid #f1f5f9;width:38%">{label}</td>
                  <td style="padding:10px 0;font-size:13px;color:#0f172a;
                             font-weight:500;border-bottom:1px solid #f1f5f9">{value}</td>
                </tr>"""

        content = f"""
        {_pill('New Application', '#eff6ff', '#1d4ed8')}

        <h1 style="margin:20px 0 8px;font-size:22px;font-weight:700;
                   color:#0f172a;line-height:1.3">
          New application received
        </h1>
        <p style="margin:0 0 28px;font-size:14px;color:#64748b">
          Nexhire &mdash; Recruiter Notification
        </p>

        <!-- Candidate header -->
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
               style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;
                      margin-bottom:24px">
          <tr>
            <td style="padding:24px">
              <table cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td style="width:48px;height:48px;background:#dbeafe;border-radius:50%;
                             text-align:center;vertical-align:middle;flex-shrink:0">
                    <span style="font-size:20px;font-weight:700;color:#1e40af;
                                 line-height:48px;display:block">
                      {name[0].upper()}
                    </span>
                  </td>
                  <td style="padding-left:16px;vertical-align:middle">
                    <p style="margin:0;font-size:16px;font-weight:700;color:#0f172a">
                      {name}
                    </p>
                    {'<p style="margin:4px 0 0;font-size:13px;color:#64748b">' + headline + '</p>' if headline else ''}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- Candidate details table -->
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
          {meta_rows}
        </table>

        {_divider()}

        <p style="margin:0;font-size:15px;color:#334155;line-height:1.75">
          Review this candidate's full profile and resume to decide on next steps.
          You can update their application status directly from your dashboard.
        </p>

        {_cta_button(f"{BASE}/recruiter/applications", "Review Application")}
        """

        html = _base_template(
            f"{name} applied for {app.job.title}.",
            content,
        )

        result = _send_html_email(
            subject=f"New Application — {app.job.title}",
            to_email=recruiter.email,
            html_content=html,
            plain_text=plain,
        )
        print(f"[EMAIL] New application {'sent' if result else 'FAILED'} to {recruiter.email}")

    except Exception as exc:
        print(f"[TASK ERROR] notify_new_application: {exc}")
        raise self.retry(exc=exc, countdown=60)


# ── Recruiter invite → jobseeker ──────────────────────────────────────────────

@shared_task(bind=True, max_retries=3)
def notify_recruiter_invite(self, invite_id):
    from applications.models import RecruiterInvite
    from notifications.tasks import create_notification

    BASE = _get_base_url()

    try:
        invite = RecruiterInvite.objects.select_related(
            'job', 'job__company', 'recruiter', 'candidate'
        ).get(id=invite_id)

        plain = (f"You have been personally invited by {invite.job.company.name} "
                 f"to apply for {invite.job.title}.")

        create_notification(
            user=invite.candidate,
            type='invite',
            title=f'Interview invitation — {invite.job.company.name}',
            message=plain,
            link=f'/jobs/{invite.job.slug}',
        )

        message_block = ''
        if invite.message:
            message_block = f"""
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
                   style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;
                          margin:24px 0">
              <tr>
                <td style="padding:20px 24px">
                  <p style="margin:0 0 8px;font-size:11px;font-weight:600;color:#94a3b8;
                             text-transform:uppercase;letter-spacing:0.8px">
                    Message from the recruiter
                  </p>
                  <p style="margin:0;font-size:14px;color:#334155;line-height:1.75;
                             font-style:italic">
                    &ldquo;{invite.message}&rdquo;
                  </p>
                </td>
              </tr>
            </table>"""

        content = f"""
        {_pill('Personal Invitation', '#f0fdf4', '#15803d')}

        <h1 style="margin:20px 0 8px;font-size:22px;font-weight:700;
                   color:#0f172a;line-height:1.3">
          You have been personally invited
        </h1>
        <p style="margin:0 0 28px;font-size:14px;color:#64748b">
          Nexhire  &mdash; Recruiter Invitation
        </p>

        {_job_card(
            invite.job.title,
            invite.job.company.name,
            invite.job.location,
            invite.job.work_mode,
        )}

        {message_block}

        <p style="margin:0;font-size:15px;color:#334155;line-height:1.75">
          <strong style="color:#0f172a">{invite.job.company.name}</strong> has personally
          reviewed your profile and believes you are a strong match for this role.
          Personal invitations represent a significantly higher chance of success.
        </p>

        <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
               style="background:#f0fdf4;border-left:3px solid #16a34a;
                      border-radius:0 8px 8px 0;margin-top:24px">
          <tr>
            <td style="padding:16px 20px;font-size:13px;color:#166534;line-height:1.6">
              We recommend responding to this invitation promptly. Recruiters value
              candidates who engage quickly.
            </td>
          </tr>
        </table>

        {_cta_button(f"{BASE}/jobs/{invite.job.slug}", "View Job and Apply", '#16a34a')}
        """

        html = _base_template(
            f"{invite.job.company.name} personally invited you to apply.",
            content,
        )

        _send_html_email(
            subject=f"Personal Invitation — {invite.job.title} at {invite.job.company.name}",
            to_email=invite.candidate.email,
            html_content=html,
            plain_text=plain,
        )
        print(f"[EMAIL] Invite sent to {invite.candidate.email}")

    except Exception as exc:
        print(f"[TASK ERROR] notify_recruiter_invite: {exc}")
        raise self.retry(exc=exc, countdown=60)