from fastapi import APIRouter, Depends
from app.core.security import require_role

router = APIRouter(prefix="/admin", tags=["admin"])

@router.get("/stats")
def admin_stats(user=Depends(require_role("admin"))):
    return {"status": "admin access granted"}
