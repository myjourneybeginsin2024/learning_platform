from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.feed_item import FeedItem

router = APIRouter(prefix="/feed", tags=["Feed"])

@router.get("")
def get_feed(db: Session = Depends(get_db)):
    """
    Sprint‑2: deterministic feed (ordered by 'order' field)
    - No AI
    - No extra fields
    """
    items = (
        db.query(FeedItem)
        .order_by(FeedItem.order.asc())  # ← Use 'order' field you actually have
        .limit(20)
        .all()
    )
    return items
