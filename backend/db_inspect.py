#!/usr/bin/env python3
"""
Script to inspect the current database schema and compare it with models
"""

from sqlalchemy import inspect, create_engine
from database import SQLALCHEMY_DATABASE_URL
from models import Base

# Create an inspector
engine = create_engine(SQLALCHEMY_DATABASE_URL)
inspector = inspect(engine)

# Get all table names in the database
tables = inspector.get_table_names()
print("Tables in database:")
for table in tables:
    print(f"  - {table}")

print("\n" + "="*50)

# Compare each table with the model
for table_name in tables:
    print(f"\nTable: {table_name}")

    # Get columns from database
    columns = inspector.get_columns(table_name)
    print("  Columns in DB:")
    for col in columns:
        print(f"    - {col['name']}: {col['type']} (nullable: {col['nullable']})")

    # Print model definition if it exists
    model_found = False
    for model in Base.registry._class_registry.values():
        if hasattr(model, '__tablename__') and model.__tablename__ == table_name:
            print("  Expected from Model:")
            for col_name, column in model.__table__.columns.items():
                nullable = not column.primary_key or column.nullable
                print(f"    - {col_name}: {column.type} (nullable: {nullable})")
            model_found = True
            break

    if not model_found:
        print("  No matching model found in models.py")

print("\n" + "="*50)
print("Foreign Key Constraints:")
for table_name in tables:
    fks = inspector.get_foreign_keys(table_name)
    if fks:
        print(f"\nTable '{table_name}':")
        for fk in fks:
            print(f"  {fk['constrained_columns']} -> {fk['referred_table']}.{fk['referred_columns']}")

print("\n" + "="*50)
print("Checking for missing tables that should exist based on models:")
model_tables = [model.__tablename__ for model in Base.registry._class_registry.values()
                if hasattr(model, '__tablename__')]
missing_tables = set(model_tables) - set(tables)
if missing_tables:
    print("Missing tables:", missing_tables)
else:
    print("All model tables exist in database")