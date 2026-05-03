from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from jobs.models import Job
from companies.models import Company
import random

User = get_user_model()

JOBS = [
    {
        "title": "Senior React Developer",
        "description": """We are looking for an experienced React Developer to join our growing engineering team.

You will be responsible for building and maintaining high-quality web applications used by millions of users. You will work closely with our design and backend teams to deliver exceptional user experiences.

You will have the opportunity to shape our frontend architecture, mentor junior developers, and contribute to open-source projects.""",
        "requirements": """• 4+ years of experience with React.js
- Strong proficiency in JavaScript (ES6+), HTML5, CSS3
- Experience with state management libraries (Redux, Zustand, Recoil)
- Familiarity with RESTful APIs and GraphQL
- Experience with testing frameworks (Jest, React Testing Library)
- Strong understanding of web performance optimization
- Good understanding of CI/CD pipelines""",
        "responsibilities": """• Develop new user-facing features using React.js
- Build reusable components and libraries for future use
- Optimize components for maximum performance
- Collaborate with backend developers and web designers
- Participate in code reviews and mentor junior developers""",
        "job_type": "full_time",
        "work_mode": "hybrid",
        "experience_level": "3_5",
        "location": "Bengaluru, Karnataka",
        "salary_min": 1500000,
        "salary_max": 2500000,
        "skills_required": ["React", "JavaScript", "TypeScript", "Redux", "CSS"],
        "status": "active",
        "company_name": "Zoho Corporation",
    },
    {
        "title": "Python Backend Engineer",
        "description": """We are hiring a Python Backend Engineer to help us build scalable microservices and APIs.

You will work on challenging problems at scale, designing systems that handle millions of requests daily. Our stack is primarily Python/Django with PostgreSQL and Redis.""",
        "requirements": """• 3+ years of Python development experience
- Strong knowledge of Django and Django REST Framework
- Experience with PostgreSQL and Redis
- Understanding of microservices architecture
- Knowledge of Docker and Kubernetes
- Experience with AWS or GCP""",
        "responsibilities": """• Design and implement RESTful APIs
- Write clean, testable, and efficient code
- Work with frontend teams to integrate user-facing elements
- Optimize application performance and scalability
- Participate in architectural decisions""",
        "job_type": "full_time",
        "work_mode": "remote",
        "experience_level": "3_5",
        "location": "Remote",
        "salary_min": 1200000,
        "salary_max": 2000000,
        "skills_required": ["Python", "Django", "PostgreSQL", "Redis", "Docker"],
        "status": "active",
        "company_name": "Freshworks",
    },
    {
        "title": "Data Scientist",
        "description": """Join our data science team to build ML models that power product recommendations, fraud detection, and demand forecasting.

You will work with petabytes of data and build models that directly impact business outcomes.""",
        "requirements": """• 3+ years of experience in data science or ML
- Strong programming skills in Python
- Experience with ML frameworks (TensorFlow, PyTorch, scikit-learn)
- Solid understanding of statistics and mathematics
- Experience with big data tools (Spark, Hadoop)
- Ability to communicate complex findings clearly""",
        "responsibilities": """• Build and deploy machine learning models
- Analyze large datasets to find actionable insights
- Collaborate with product and engineering teams
- Monitor and maintain models in production
- Present findings to stakeholders""",
        "job_type": "full_time",
        "work_mode": "hybrid",
        "experience_level": "3_5",
        "location": "Bengaluru, Karnataka",
        "salary_min": 1800000,
        "salary_max": 3000000,
        "skills_required": ["Python", "Machine Learning", "TensorFlow", "SQL", "Statistics"],
        "status": "active",
        "company_name": "Flipkart",
    },
    {
        "title": "DevOps Engineer",
        "description": """We are looking for a DevOps Engineer to help us build and maintain our cloud infrastructure.

You will be responsible for CI/CD pipelines, infrastructure as code, monitoring, and ensuring high availability of our services.""",
        "requirements": """• 3+ years of DevOps or SRE experience
- Strong experience with AWS or Azure
- Proficiency in Infrastructure as Code (Terraform, CloudFormation)
- Experience with Kubernetes and Docker
- Knowledge of monitoring tools (Prometheus, Grafana, ELK)
- Scripting skills in Python or Bash""",
        "responsibilities": """• Manage and improve CI/CD pipelines
- Maintain cloud infrastructure using IaC
- Monitor system health and respond to incidents
- Improve deployment frequency and reliability
- Work with development teams on best practices""",
        "job_type": "full_time",
        "work_mode": "hybrid",
        "experience_level": "3_5",
        "location": "Chennai, Tamil Nadu",
        "salary_min": 1400000,
        "salary_max": 2200000,
        "skills_required": ["AWS", "Kubernetes", "Docker", "Terraform", "Linux"],
        "status": "active",
        "company_name": "Tata Consultancy Services",
    },
    {
        "title": "Product Manager",
        "description": """We are looking for an experienced Product Manager to lead product strategy and execution for our core platform.

You will work closely with engineering, design, and business stakeholders to define and deliver products that delight users.""",
        "requirements": """• 4+ years of product management experience
- Experience with B2C or fintech products preferred
- Strong analytical and problem-solving skills
- Excellent communication and stakeholder management
- Experience with agile methodologies
- Data-driven decision making approach""",
        "responsibilities": """• Define product vision, strategy, and roadmap
- Gather and prioritize product requirements
- Work with engineering and design teams
- Analyze user feedback and metrics
- Launch and iterate on product features""",
        "job_type": "full_time",
        "work_mode": "onsite",
        "experience_level": "3_5",
        "location": "Bengaluru, Karnataka",
        "salary_min": 2000000,
        "salary_max": 3500000,
        "skills_required": ["Product Strategy", "Agile", "SQL", "User Research", "Roadmapping"],
        "status": "active",
        "company_name": "Razorpay",
    },
    {
        "title": "iOS Developer",
        "description": """Join our mobile team to build and improve our iOS application used by over 10 million users.

You will work on performance, new features, and maintaining high-quality code standards.""",
        "requirements": """• 3+ years of iOS development experience
- Proficiency in Swift and Objective-C
- Experience with UIKit and SwiftUI
- Knowledge of Apple's design principles
- Experience with RESTful APIs
- Published apps on the App Store preferred""",
        "responsibilities": """• Develop and maintain iOS application
- Write clean, maintainable Swift code
- Collaborate with designers on UI implementation
- Optimize app for performance and battery usage
- Debug and fix production issues""",
        "job_type": "full_time",
        "work_mode": "hybrid",
        "experience_level": "3_5",
        "location": "Bengaluru, Karnataka",
        "salary_min": 1400000,
        "salary_max": 2400000,
        "skills_required": ["Swift", "iOS", "SwiftUI", "Xcode", "REST APIs"],
        "status": "active",
        "company_name": "Swiggy",
    },
    {
        "title": "Frontend Developer Intern",
        "description": """We are offering a 6-month internship for talented frontend developers who want to work on real-world products.

You will be mentored by senior engineers and contribute to meaningful features from day one.""",
        "requirements": """• Currently pursuing or recently completed B.E/B.Tech
- Knowledge of HTML, CSS, JavaScript
- Basic understanding of React or Vue
- Eagerness to learn and grow
- Good communication skills""",
        "responsibilities": """• Build UI components under senior developer guidance
- Fix bugs and improve existing features
- Write unit tests for your code
- Participate in daily standups and sprint planning
- Learn and apply best practices""",
        "job_type": "internship",
        "work_mode": "hybrid",
        "experience_level": "fresher",
        "location": "Chennai, Tamil Nadu",
        "salary_min": 20000,
        "salary_max": 40000,
        "skills_required": ["HTML", "CSS", "JavaScript", "React"],
        "status": "active",
        "company_name": "Zoho Corporation",
    },
    {
        "title": "Full Stack Developer",
        "description": """We are looking for a Full Stack Developer who is comfortable working across the entire web stack.

You will build end-to-end features independently and collaborate with a small, high-performing team.""",
        "requirements": """• 2+ years of full stack development experience
- Proficiency in React or Vue on the frontend
- Strong backend skills in Node.js or Python
- Experience with SQL and NoSQL databases
- Understanding of cloud services (AWS, GCP)
- Good communication and collaboration skills""",
        "responsibilities": """• Build full stack features from design to deployment
- Maintain and improve existing codebase
- Participate in system design discussions
- Write comprehensive tests
- Deploy and monitor applications""",
        "job_type": "full_time",
        "work_mode": "remote",
        "experience_level": "1_3",
        "location": "Remote",
        "salary_min": 800000,
        "salary_max": 1400000,
        "skills_required": ["React", "Node.js", "Python", "PostgreSQL", "AWS"],
        "status": "active",
        "company_name": "Groww",
    },
    {
        "title": "UI/UX Designer",
        "description": """We are looking for a talented UI/UX Designer to create beautiful, intuitive experiences for our products.

You will own the design process from research to final pixel-perfect designs and work directly with engineers.""",
        "requirements": """• 3+ years of product design experience
- Strong portfolio demonstrating UI/UX skills
- Proficiency in Figma
- Experience with user research and testing
- Understanding of accessibility standards
- Basic knowledge of HTML/CSS is a plus""",
        "responsibilities": """• Design intuitive user interfaces and experiences
- Conduct user research and usability testing
- Create wireframes, prototypes, and final designs
- Work closely with engineers during implementation
- Maintain and evolve the design system""",
        "job_type": "full_time",
        "work_mode": "hybrid",
        "experience_level": "3_5",
        "location": "Bengaluru, Karnataka",
        "salary_min": 1200000,
        "salary_max": 2000000,
        "skills_required": ["Figma", "UI Design", "UX Research", "Prototyping", "Design Systems"],
        "status": "active",
        "company_name": "Ola Cabs",
    },
    {
        "title": "Cloud Solutions Architect",
        "description": """We are hiring a Cloud Solutions Architect to design and implement cloud-native solutions for enterprise clients.

You will work with clients to understand their needs and architect scalable, secure cloud solutions.""",
        "requirements": """• 6+ years of experience in cloud or solutions architecture
- AWS/Azure/GCP certifications preferred
- Deep knowledge of cloud services and best practices
- Experience with enterprise integration patterns
- Excellent client-facing communication skills
- Experience with security and compliance frameworks""",
        "responsibilities": """• Design cloud architectures for enterprise clients
- Lead technical workshops and presentations
- Create architecture documents and diagrams
- Guide implementation teams
- Ensure security and compliance requirements are met""",
        "job_type": "full_time",
        "work_mode": "hybrid",
        "experience_level": "5_10",
        "location": "Mumbai, Maharashtra",
        "salary_min": 3000000,
        "salary_max": 5000000,
        "skills_required": ["AWS", "Azure", "Solution Architecture", "Security", "Enterprise"],
        "status": "active",
        "company_name": "Infosys",
    },
    {
        "title": "Android Developer",
        "description": """Join BYJU's engineering team to build educational features for our Android app used by 50M+ students.

You will work on performance-critical features, video streaming, and interactive learning components.""",
        "requirements": """• 3+ years Android development experience
- Proficiency in Kotlin and Java
- Experience with Jetpack Compose
- Knowledge of MVVM architecture
- Experience with video players and streaming
- Familiarity with offline-first architecture""",
        "responsibilities": """• Build new features for the Android application
- Optimize app performance and reduce load times
- Work with backend teams on API integration
- Write unit and integration tests
- Improve app stability and crash rates""",
        "job_type": "full_time",
        "work_mode": "onsite",
        "experience_level": "3_5",
        "location": "Bengaluru, Karnataka",
        "salary_min": 1300000,
        "salary_max": 2200000,
        "skills_required": ["Kotlin", "Android", "Jetpack Compose", "MVVM", "Java"],
        "status": "active",
        "company_name": "BYJU'S",
    },
    {
        "title": "Security Engineer",
        "description": """We are looking for a Security Engineer to help us build and maintain secure systems for financial transactions.

You will work on application security, penetration testing, and security reviews.""",
        "requirements": """• 4+ years of application security experience
- Knowledge of OWASP Top 10 and security best practices
- Experience with penetration testing tools
- Understanding of cryptography and PKI
- Experience with security in cloud environments
- Security certifications (CEH, CISSP) preferred""",
        "responsibilities": """• Conduct security assessments and penetration tests
- Review code for security vulnerabilities
- Implement and maintain security tools
- Respond to security incidents
- Train development teams on secure coding""",
        "job_type": "full_time",
        "work_mode": "hybrid",
        "experience_level": "3_5",
        "location": "Bengaluru, Karnataka",
        "salary_min": 1800000,
        "salary_max": 3000000,
        "skills_required": ["Security", "Penetration Testing", "OWASP", "Python", "AWS Security"],
        "status": "active",
        "company_name": "Razorpay",
    },
]


class Command(BaseCommand):
    help = 'Seed 12 demo jobs into the database'

    def handle(self, *args, **kwargs):
        admin = User.objects.filter(is_superuser=True).first()
        if not admin:
            self.stdout.write(self.style.ERROR(
                'No superuser found. Run: python manage.py createsuperuser first.'
            ))
            return

        created = 0
        skipped = 0

        for data in JOBS:
            company_name = data.pop('company_name')
            try:
                company = Company.objects.get(name=company_name)
            except Company.DoesNotExist:
                self.stdout.write(self.style.WARNING(
                    f'  — Company not found: {company_name}, skipping.'
                ))
                skipped += 1
                continue

            job, was_created = Job.objects.get_or_create(
                title=data['title'],
                company=company,
                defaults={**data, 'posted_by': admin}
            )

            if was_created:
                created += 1
                self.stdout.write(self.style.SUCCESS(f'  ✓ Created: {job.title} @ {company.name}'))
            else:
                skipped += 1
                self.stdout.write(self.style.WARNING(f'  — Skipped: {job.title}'))

        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS(
            f'Done. {created} created, {skipped} skipped.'
        ))