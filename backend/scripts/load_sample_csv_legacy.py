"""
LEGACY SCRIPT - archived for reference only.
This script used local Postgres connections via SQLAlchemy.

Use seed_supabase.py instead for seeding data via Supabase API.
"""
import asyncio
import csv
import os
import uuid
from datetime import datetime

# Legacy imports - kept for reference
# from sqlalchemy.ext.asyncio import AsyncSession
# from sqlalchemy import text
# from db import AsyncSessionLocal
# from utils.data_cleaner import parse_date, normalize_amount, map_category


def main():
    print("This script is deprecated. Use seed_supabase.py instead.")
    print("See backend/scripts/seed_supabase.py for Supabase API-based seeding.")


if __name__ == "__main__":
    main()

