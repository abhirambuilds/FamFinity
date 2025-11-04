import csv
from collections import defaultdict
import os
import sys

def fix_file(filepath):
    """Fix salary to be greater than expenses with variation"""
    # Read all rows
    rows = []
    monthly_expenses = defaultdict(float)
    monthly_salary = defaultdict(float)
    
    with open(filepath, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            rows.append(row)
            if not row['amount']:
                continue
            amount = float(row['amount'])
            month = row['date'][:7]
            
            if amount < 0:
                monthly_expenses[month] += abs(amount)
            else:
                monthly_salary[month] += amount
    
    # Calculate target salaries (1.2x to 1.5x expenses for variation)
    months = sorted(monthly_expenses.keys())
    base_multipliers = [1.2, 1.35, 1.5, 1.25, 1.4, 1.3, 1.45, 1.35, 1.25, 1.4, 1.3, 1.45]
    
    # Update salary rows
    for i, row in enumerate(rows):
        if not row['amount']:
            continue
        amount = float(row['amount'])
        month = row['date'][:7]
        
        if amount > 0 and row['category'] == 'income':
            # Calculate new salary
            expenses = monthly_expenses[month]
            multiplier_index = months.index(month) % len(base_multipliers)
            multiplier = base_multipliers[multiplier_index]
            new_salary = round(expenses * multiplier, 2)
            
            # Update the row
            rows[i]['amount'] = f"{new_salary:.2f}"
            print(f"Updated {month} salary: {amount:.2f} -> {new_salary:.2f} (expenses: {expenses:.2f})")
    
    # Write back
    with open(filepath, 'w', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=['date', 'amount', 'category', 'description'])
        writer.writeheader()
        writer.writerows(rows)
    
    print(f"\nFixed {filepath}")

# Fix all files
files = [
    'data/2024.csv',
    'data/2025 6 months.csv',
    'data/2025Oct.csv'
]

for filepath in files:
    if os.path.exists(filepath):
        print(f"\nProcessing {filepath}...")
        fix_file(filepath)
    else:
        print(f"File not found: {filepath}")

print("\nDone!")

