
from app.db.session import SessionLocal
from sqlalchemy import text

def run_migration():
    db = SessionLocal()
    try:
        # Add image_url to organization_topics
        print("Migrating organization_topics...")
        try:
            db.execute(text("ALTER TABLE organization_topics ADD COLUMN image_url VARCHAR"))
            print("Added image_url to organization_topics node.")
        except Exception as e:
            print(f"Skipping organization_topics (maybe exists): {e}")

        # Add image_url to organization_topic_modules
        print("Migrating organization_topic_modules...")
        try:
            db.execute(text("ALTER TABLE organization_topic_modules ADD COLUMN image_url VARCHAR"))
            print("Added image_url to organization_topic_modules node.")
        except Exception as e:
            print(f"Skipping organization_topic_modules (maybe exists): {e}")

        db.commit()
        print("Migration complete!")
    except Exception as e:
        print(f"Migration failed: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    run_migration()
