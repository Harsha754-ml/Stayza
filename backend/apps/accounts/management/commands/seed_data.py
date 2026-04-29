"""Seed the database with sample data for development."""

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.rooms.models import Room, Booking
from apps.feedback.models import RoommateFeedback
from apps.complaints.models import Complaint
from apps.payments.models import Payment
from datetime import date, timedelta
from django.utils import timezone
import random

User = get_user_model()


class Command(BaseCommand):
    help = "Seed database with sample data"

    def handle(self, *args, **options):
        self.stdout.write("Seeding database...")

        # Create admin
        admin, _ = User.objects.get_or_create(
            username="admin",
            defaults={
                "email": "admin@hostel.in",
                "first_name": "Admin",
                "last_name": "User",
                "role": "admin",
                "is_staff": True,
            },
        )
        admin.set_password("admin123")
        admin.save()

        # Create staff members
        staff_data = [
            ("ravi", "Ravi", "Kumar", "staff", "+91 98765 43210"),
            ("suresh", "Suresh", "Babu", "staff", "+91 87654 32109"),
            ("mani", "Mani", "Plumber", "staff", "+91 76543 21098"),
            ("karthik", "Karthik", "E", "staff", "+91 65432 10987"),
        ]
        staff_users = []
        for uname, fn, ln, role, phone in staff_data:
            u, _ = User.objects.get_or_create(
                username=uname,
                defaults={
                    "email": f"{uname}@hostel.in",
                    "first_name": fn,
                    "last_name": ln,
                    "role": role,
                    "phone": phone,
                },
            )
            u.set_password("staff123")
            u.save()
            staff_users.append(u)

        # Create students
        student_data = [
            ("john", "John", "Doe", "night", 2, 2),
            ("priya", "Priya", "Nair", "flexible", 3, 2),
            ("arjun", "Arjun", "Sharma", "night", 2, 1),
            ("alice", "Alice", "Smith", "early", 3, 3),
            ("dev", "Dev", "Mehta", "night", 1, 1),
            ("sara", "Sara", "Jones", "early", 3, 2),
            ("rahul", "Rahul", "Shah", "flexible", 2, 2),
            ("meera", "Meera", "Iyer", "early", 3, 3),
        ]
        students = []
        for uname, fn, ln, sleep, clean, noise in student_data:
            u, _ = User.objects.get_or_create(
                username=uname,
                defaults={
                    "email": f"{uname}@college.edu",
                    "first_name": fn,
                    "last_name": ln,
                    "role": "student",
                    "sleep_schedule": sleep,
                    "cleanliness_level": clean,
                    "noise_tolerance": noise,
                },
            )
            u.set_password("student123")
            u.save()
            students.append(u)

        self.stdout.write(f"  Created {len(students)} students, {len(staff_users)} staff, 1 admin")

        # Create rooms
        room_configs = [
            ("101", 1, "single", 1, 500),
            ("102", 1, "double", 2, 350),
            ("103", 1, "double", 2, 350),
            ("104", 1, "premium", 1, 800),
            ("201", 2, "single", 1, 500),
            ("202", 2, "double", 2, 350),
            ("203", 2, "double", 2, 350),
            ("204", 2, "triple", 3, 300),
            ("301", 3, "single", 1, 500),
            ("302", 3, "double", 2, 350),
            ("303", 3, "double", 2, 350),
            ("304", 3, "premium", 1, 800),
            ("401", 4, "single", 1, 500),
            ("402", 4, "double", 2, 350),
            ("403", 4, "triple", 3, 300),
            ("404", 4, "double", 2, 350),
        ]
        rooms = []
        for num, floor, rtype, cap, price in room_configs:
            r, _ = Room.objects.get_or_create(
                number=num,
                defaults={
                    "floor": floor,
                    "room_type": rtype,
                    "capacity": cap,
                    "price_per_month": price,
                },
            )
            rooms.append(r)

        self.stdout.write(f"  Created {len(rooms)} rooms")

        # Create bookings for some students
        booking_pairs = [
            (students[0], rooms[1]),   # John → 102
            (students[1], rooms[2]),   # Priya → 103
            (students[2], rooms[1]),   # Arjun → 102 (double)
            (students[3], rooms[3]),   # Alice → 104
            (students[4], rooms[6]),   # Dev → 203
            (students[5], rooms[7]),   # Sara → 204
        ]
        for student, room in booking_pairs:
            if not Booking.objects.filter(user=student, is_active=True).exists():
                Booking.objects.create(user=student, room=room)
                room.refresh_status()

        self.stdout.write(f"  Created {len(booking_pairs)} bookings")

        # Create complaints
        complaint_data = [
            (students[0], "AC not cooling properly", "The AC in my room has not been cooling for 3 days.", "maintenance", "high", "in_progress", staff_users[0]),
            (students[1], "Bathroom tap leaking", "Water dripping from the bathroom tap constantly.", "utilities", "medium", "in_progress", staff_users[2]),
            (students[2], "Window latch broken", "Window latch is broken — security concern.", "security", "high", "pending", None),
            (students[3], "Water leak from ceiling", "Water is leaking from the ceiling after rain.", "maintenance", "high", "pending", None),
            (students[4], "Noise from neighbours", "Loud noise from neighbours after 11PM.", "noise", "low", "pending", None),
            (students[5], "Broken study table", "The study table leg is broken.", "maintenance", "low", "pending", None),
            (students[0], "Hallway lights flickering", "Lights on 1st floor hallway flickering.", "maintenance", "medium", "resolved", staff_users[3]),
        ]
        for student, title, desc, cat, pri, stat, assigned in complaint_data:
            if not Complaint.objects.filter(title=title, filed_by=student).exists():
                c = Complaint.objects.create(
                    filed_by=student,
                    assigned_to=assigned,
                    title=title,
                    description=desc,
                    category=cat,
                    priority=pri,
                    status=stat,
                )
                if stat == "resolved":
                    c.resolved_at = timezone.now()
                    c.save(update_fields=["resolved_at"])

        self.stdout.write(f"  Created {len(complaint_data)} complaints")

        # Create payments
        today = date.today()
        for student in students[:6]:
            for month_offset in range(3):
                m = today.replace(day=1) - timedelta(days=30 * month_offset)
                month_str = m.strftime("%b %Y")
                due = m.replace(day=5)
                if not Payment.objects.filter(user=student, month=month_str).exists():
                    is_paid = random.random() > 0.3
                    Payment.objects.create(
                        user=student,
                        amount=random.choice([300, 350, 500, 800]),
                        month=month_str,
                        status="paid" if is_paid else ("overdue" if month_offset > 0 else "pending"),
                        method=random.choice(["card", "upi", ""]) if is_paid else "",
                        due_date=due,
                        paid_date=due - timedelta(days=random.randint(1, 4)) if is_paid else None,
                    )

        # Create past (checked-out) bookings and feedback
        # Rahul and Meera shared room 302 in the past
        past_room = rooms[9]  # Room 302, double
        past_booking_rahul = None
        past_booking_meera = None
        if not Booking.objects.filter(user=students[6], is_active=False).exists():
            past_booking_rahul = Booking.objects.create(
                user=students[6], room=past_room, is_active=False,
                checked_out_at=timezone.now() - timedelta(days=10),
            )
            past_booking_meera = Booking.objects.create(
                user=students[7], room=past_room, is_active=False,
                checked_out_at=timezone.now() - timedelta(days=10),
            )
            past_room.refresh_status()
            self.stdout.write("  Created past bookings for Rahul & Meera in Room 302")

        # John and Arjun are current roommates in 102 — create a past booking
        # so we can seed feedback from a previous stay too
        past_room2 = rooms[5]  # Room 202, double
        past_booking_john = None
        past_booking_dev = None
        if not Booking.objects.filter(user=students[0], is_active=False, room=past_room2).exists():
            past_booking_john = Booking.objects.create(
                user=students[0], room=past_room2, is_active=False,
                checked_out_at=timezone.now() - timedelta(days=30),
            )
            past_booking_dev = Booking.objects.create(
                user=students[4], room=past_room2, is_active=False,
                checked_out_at=timezone.now() - timedelta(days=30),
            )
            past_room2.refresh_status()
            self.stdout.write("  Created past bookings for John & Dev in Room 202")

        # Seed feedback reviews
        feedback_data = []
        if past_booking_rahul and past_booking_meera:
            feedback_data.extend([
                # Rahul reviews Meera
                (students[6], students[7], past_booking_rahul, 5, 4, 5, "Meera was an amazing roommate. Very clean and respectful."),
                # Meera reviews Rahul
                (students[7], students[6], past_booking_meera, 3, 2, 3, "Rahul was okay but could be tidier."),
            ])
        if past_booking_john and past_booking_dev:
            feedback_data.extend([
                # John reviews Dev
                (students[0], students[4], past_booking_john, 2, 1, 2, "Dev was quite noisy at night. Not ideal for light sleepers."),
                # Dev reviews John
                (students[4], students[0], past_booking_dev, 4, 4, 4, "John was a great roommate overall."),
            ])

        fb_count = 0
        for reviewer, reviewee, booking, clean, noise, overall, comment in feedback_data:
            if not RoommateFeedback.objects.filter(
                reviewer=reviewer, reviewee=reviewee, booking=booking
            ).exists():
                RoommateFeedback.objects.create(
                    reviewer=reviewer,
                    reviewee=reviewee,
                    booking=booking,
                    cleanliness_rating=clean,
                    noise_rating=noise,
                    overall_rating=overall,
                    comment=comment,
                )
                fb_count += 1

        self.stdout.write(f"  Created {fb_count} roommate feedback entries")

        self.stdout.write(self.style.SUCCESS("  Database seeded successfully!"))
