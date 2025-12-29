
from fastapi import APIRouter, Depends
from app.core.security import require_role
from app.api.deps import require_role

router = APIRouter(prefix="/admin", tags=["admin"])

@router.get("/stats")
# Requirement: Only 'super admin' and 'admin' can access
def get_admin_stats(current_user = Depends(require_role(["super admin", "admin"]))):
    return {"status": "success", "data": "Admin Dashboard Statistics"}
