import os
import json
from django.core.management.base import BaseCommand
from django.conf import settings
from django.utils.text import slugify
from jobs.models import Category
from users.models import SkillCategory, Skill

class Command(BaseCommand):
    help = "Idempotently seeds Job Categories, Skill Categories, and Skills from JSON config."

    def handle(self, *args, **options):
        json_path = os.path.join(settings.BASE_DIR, "metadata_seed.json")
        if not os.path.exists(json_path):
            self.stdout.write(self.style.ERROR(f"Metadata file not found at {json_path}"))
            return
        with open(json_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        # Seed Job Categories
        job_categories = data.get("job_categories", [])
        cat_created = cat_existed = 0
        for cat_data in job_categories:
            name = cat_data.get("name")
            slug = cat_data.get("slug") or slugify(name)
            category, created = Category.objects.get_or_create(slug=slug, defaults={"name": name})
            if created:
                cat_created += 1
            else:
                cat_existed += 1
        self.stdout.write(self.style.SUCCESS(f"Job Categories: {cat_created} created, {cat_existed} existed."))
        # Seed Skill Categories & Skills
        # Support both legacy "skills_by_category" dict and new "skill_categories" list format
        skill_data = data.get("skills_by_category", {})
        if not skill_data:
            for cat in data.get("skill_categories", []):
                cat_name = cat.get("name")
                skill_names = cat.get("skills", [])
                if cat_name:
                    skill_data[cat_name] = skill_names
        scat_created = scat_existed = sk_created = sk_existed = 0
        for cat_name, skill_names in skill_data.items():
            skill_cat, created = SkillCategory.objects.get_or_create(name=cat_name)
            if created:
                scat_created += 1
            else:
                scat_existed += 1
            for skill_name in skill_names:
                skill, created = Skill.objects.get_or_create(name=skill_name, defaults={"category": skill_cat})
                if created:
                    sk_created += 1
                else:
                    sk_existed += 1
        self.stdout.write(self.style.SUCCESS(
            f"Skill Categories: {scat_created} created, {scat_existed} existed. "
            f"Skills: {sk_created} created, {sk_existed} existed."
        ))
