from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from companies.models import Company

User = get_user_model()

COMPANIES = [
    {
        "name": "Tata Consultancy Services",
        "website": "https://www.tcs.com",
        "industry": "Technology",
        "size": "1000+",
        "description": (
            "Tata Consultancy Services is an Indian multinational information technology "
            "services and consulting company headquartered in Mumbai. It is a subsidiary "
            "of the Tata Group and operates in 150 locations across 46 countries. TCS is "
            "one of the largest employers in India with over 600,000 employees worldwide."
        ),
        "founded_year": 1968,
        "headquarters": "Mumbai, Maharashtra",
        "is_verified": True,
    },
    {
        "name": "Infosys",
        "website": "https://www.infosys.com",
        "industry": "Technology",
        "size": "1000+",
        "description": (
            "Infosys Limited is an Indian multinational information technology company "
            "that offers business consulting, information technology and outsourcing services. "
            "Founded in Pune, the company is headquartered in Bengaluru. Infosys is the "
            "second-largest Indian IT company and ranked 602nd on the Forbes Global 2000 list."
        ),
        "founded_year": 1981,
        "headquarters": "Bengaluru, Karnataka",
        "is_verified": True,
    },
    {
        "name": "Zoho Corporation",
        "website": "https://www.zoho.com",
        "industry": "Technology",
        "size": "1000+",
        "description": (
            "Zoho Corporation is an Indian multinational technology company that makes "
            "web-based business tools and information technology solutions. It is best "
            "known for the online office suite Zoho Office Suite. The company is "
            "headquartered in Chennai, Tamil Nadu and has offices across the globe."
        ),
        "founded_year": 1996,
        "headquarters": "Chennai, Tamil Nadu",
        "is_verified": True,
    },
    {
        "name": "Flipkart",
        "website": "https://www.flipkart.com",
        "industry": "E-commerce",
        "size": "1000+",
        "description": (
            "Flipkart is an Indian e-commerce company headquartered in Bengaluru, Karnataka. "
            "Founded in 2007 by Sachin Bansal and Binny Bansal, the company initially "
            "focused on book sales before expanding into other product categories. "
            "Flipkart is now one of India's leading e-commerce marketplaces."
        ),
        "founded_year": 2007,
        "headquarters": "Bengaluru, Karnataka",
        "is_verified": True,
    },
    {
        "name": "Razorpay",
        "website": "https://razorpay.com",
        "industry": "Finance",
        "size": "501–1000",
        "description": (
            "Razorpay is an Indian fintech company that allows businesses to accept, "
            "process and disburse payments with its product suite. It gives access to "
            "all payment modes including credit card, debit card, netbanking, UPI and "
            "popular wallets. Razorpay is headquartered in Bengaluru and is one of "
            "India's leading payment gateways."
        ),
        "founded_year": 2014,
        "headquarters": "Bengaluru, Karnataka",
        "is_verified": True,
    },
    {
        "name": "BYJU'S",
        "website": "https://byjus.com",
        "industry": "Education",
        "size": "1000+",
        "description": (
            "BYJU'S is an Indian multinational educational technology company "
            "headquartered in Bengaluru. Founded in 2011 by Byju Raveendran, "
            "the company provides online tutoring and has become one of the world's "
            "most valuable edtech companies. BYJU'S app offers learning programs "
            "for students from classes 1 to 12 and competitive exams."
        ),
        "founded_year": 2011,
        "headquarters": "Bengaluru, Karnataka",
        "is_verified": True,
    },
    {
        "name": "Swiggy",
        "website": "https://www.swiggy.com",
        "industry": "E-commerce",
        "size": "1000+",
        "description": (
            "Swiggy is an Indian online food ordering and delivery platform founded "
            "in 2014. Headquartered in Bengaluru, Swiggy is one of India's largest "
            "food delivery companies. The platform connects consumers with restaurant "
            "partners and delivery partners across hundreds of cities in India. "
            "Swiggy also offers Instamart for grocery delivery."
        ),
        "founded_year": 2014,
        "headquarters": "Bengaluru, Karnataka",
        "is_verified": True,
    },
    {
        "name": "Freshworks",
        "website": "https://www.freshworks.com",
        "industry": "Technology",
        "size": "1000+",
        "description": (
            "Freshworks Inc. is an American-Indian multinational software company "
            "that develops cloud-based customer engagement software for businesses "
            "of all sizes. Founded in Chennai in 2010, the company is now "
            "headquartered in San Mateo, California. Freshworks is publicly listed "
            "on the Nasdaq and serves over 60,000 businesses worldwide."
        ),
        "founded_year": 2010,
        "headquarters": "Chennai, Tamil Nadu",
        "is_verified": True,
    },
    {
        "name": "Ola Cabs",
        "website": "https://www.olacabs.com",
        "industry": "Technology",
        "size": "1000+",
        "description": (
            "Ola is an Indian multinational ride-sharing company offering services "
            "including peer-to-peer ridesharing, ride service hailing, taxi, and "
            "food delivery. Founded in 2010 and headquartered in Bengaluru, Ola "
            "operates across India, Australia, New Zealand, and the United Kingdom. "
            "Ola Electric is its electric vehicle subsidiary."
        ),
        "founded_year": 2010,
        "headquarters": "Bengaluru, Karnataka",
        "is_verified": False,
    },
    {
        "name": "Groww",
        "website": "https://groww.in",
        "industry": "Finance",
        "size": "501–1000",
        "description": (
            "Groww is an Indian investment platform that allows users to invest in "
            "mutual funds, stocks, US stocks, ETFs, IPOs, and fixed deposits. "
            "Founded in 2016 and headquartered in Bengaluru, Groww has become one "
            "of India's largest retail investment platforms with over 40 million "
            "registered users. The platform focuses on simplifying investing for "
            "first-time and experienced investors."
        ),
        "founded_year": 2016,
        "headquarters": "Bengaluru, Karnataka",
        "is_verified": True,
    },
]


class Command(BaseCommand):
    help = 'Seed 10 demo companies into the database'

    def handle(self, *args, **kwargs):
        # Get or create a superuser to assign as creator
        admin = User.objects.filter(is_superuser=True).first()
        if not admin:
            self.stdout.write(self.style.ERROR(
                'No superuser found. Run: python manage.py createsuperuser first.'
            ))
            return

        created_count = 0
        skipped_count = 0

        for data in COMPANIES:
            company, created = Company.objects.get_or_create(
                name=data['name'],
                defaults={
                    **data,
                    'created_by': admin,
                }
            )
            if created:
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f'  ✓ Created: {company.name}'))
            else:
                skipped_count += 1
                self.stdout.write(self.style.WARNING(f'  — Skipped (already exists): {company.name}'))

        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS(
            f'Done. {created_count} created, {skipped_count} skipped.'
        ))