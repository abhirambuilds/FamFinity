import csv
from collections import defaultdict
import os

def analyze_file(filepath):
    """Analyze monthly expenses and salary"""
    data = defaultdict(lambda: {'expenses': 0, 'salary': 0})
    
    with open(filepath, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            if not row['amount']:
                continue
            amount = float(row['amount'])
            month = row['date'][:7]  # YYYY-MM
            
            if amount < 0:
                data[month]['expenses'] += abs(amount)
            else:
                data[month]['salary'] += amount
    
    return data

def print_analysis(data, filename):
    """Print analysis results"""
    print(f"\n{filename}:")
    print("-" * 60)
    issues = []
    for month in sorted(data.keys()):
        expenses = data[month]['expenses']
        salary = data[month]['salary']
        diff = salary - expenses
        status = "OK" if diff > 0 else "ISSUE"
        print(f"{month}: Expenses={expenses:,.2f}, Salary={salary:,.2f}, Diff={diff:,.2f} {status}")
        if diff <= 0:
            issues.append(month)
    return issues

# Analyze all files
files = [
    'data/2024.csv',
    'data/2025 6 months.csv',
    'data/2025Oct.csv'
]

for filepath in files:
    if os.path.exists(filepath):
        data = analyze_file(filepath)
        issues = print_analysis(data, os.path.basename(filepath))
        if issues:
            print(f"ISSUES FOUND in {os.path.basename(filepath)}: {issues}")
    else:
        print(f"File not found: {filepath}")

