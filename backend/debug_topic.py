import os
# Force Localhost for debugging script
os.environ["DATABASE_URL"] = "postgresql://learning_user:MulaiBeraksi2024@localhost:5432/learning_platform"

from app.db.session import SessionLocal
from app.models.organization import OrganizationTopic, OrganizationTopicModule, Organization

db = SessionLocal()

topic_id = 7
module_id = 150

print(f"--- Debugging Topic {topic_id} and Module {module_id} ---")

topic = db.query(OrganizationTopic).filter(OrganizationTopic.id == topic_id).first()
if not topic:
    print(f"Topic {topic_id} NOT FOUND.")
else:
    print(f"Topic found: {topic.title} (ID: {topic.id})")
    print(f"  Organization ID: {topic.organization_id}")
    org = db.query(Organization).filter(Organization.id == topic.organization_id).first()
    print(f"  Organization Name: {org.name if org else 'Unknown'}")
    
    print(f"  Modules count: {len(topic.modules)}")
    mod = db.query(OrganizationTopicModule).filter(OrganizationTopicModule.id == module_id).first()
    if mod:
        print(f"  Module {module_id} FOUND in Topic {mod.topic_id}")
        if mod.topic_id != topic_id:
             print(f"  WARNING: Module {module_id} belongs to Topic {mod.topic_id}, NOT {topic_id}!")
    else:
        print(f"  Module {module_id} NOT FOUND in DB.")

db.close()
