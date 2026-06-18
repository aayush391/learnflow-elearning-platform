import csv
from pathlib import Path


COURSES = [
    {
        "title": "Frontend Foundations",
        "category": "Web Development",
        "level": "Beginner",
        "duration": "6 weeks",
        "instructor": "Aarav Mehta",
        "lessons": 18,
        "rating": 4.8,
        "price": 0,
    },
    {
        "title": "REST API Engineering",
        "category": "Backend",
        "level": "Intermediate",
        "duration": "5 weeks",
        "instructor": "Nisha Rao",
        "lessons": 22,
        "rating": 4.7,
        "price": 1499,
    },
    {
        "title": "Python for Data Workflows",
        "category": "Python",
        "level": "Beginner",
        "duration": "4 weeks",
        "instructor": "Kabir Sen",
        "lessons": 15,
        "rating": 4.6,
        "price": 999,
    },
    {
        "title": "MySQL Database Design",
        "category": "Database",
        "level": "Intermediate",
        "duration": "6 weeks",
        "instructor": "Sara Kapoor",
        "lessons": 20,
        "rating": 4.9,
        "price": 1299,
    },
]


def main():
    output_dir = Path("outputs")
    output_dir.mkdir(exist_ok=True)
    output_path = output_dir / "courses_export.csv"

    with output_path.open("w", newline="", encoding="utf-8") as csv_file:
        writer = csv.DictWriter(csv_file, fieldnames=COURSES[0].keys())
        writer.writeheader()
        writer.writerows(COURSES)

    print(f"Wrote {len(COURSES)} courses to {output_path}")


if __name__ == "__main__":
    main()
