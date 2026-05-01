from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models import Like, Story, User
from app.schemas import LikePublic, LikesDetail, LikeToggleResponse


router = APIRouter(prefix="/stories/{story_id}", tags=["likes"])


def _require_published_story(story_id: int, db: Session) -> Story:
    story = db.get(Story, story_id)
    if not story or not story.is_published:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Story not found")
    return story


@router.post("/like", response_model=LikePublic, status_code=status.HTTP_201_CREATED)
def like_story(
    story_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Like:
    _require_published_story(story_id, db)
    existing_like = db.scalar(
        select(Like).where(Like.user_id == current_user.id, Like.story_id == story_id)
    )
    if existing_like:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Story already liked")

    like = Like(user_id=current_user.id, story_id=story_id)
    db.add(like)
    db.commit()
    db.refresh(like)
    return like


@router.post("/like-toggle", response_model=LikeToggleResponse)
def toggle_story_like(
    story_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> LikeToggleResponse:
    _require_published_story(story_id, db)
    existing_like = db.scalar(
        select(Like).where(Like.user_id == current_user.id, Like.story_id == story_id)
    )

    liked = existing_like is None
    if existing_like:
        db.delete(existing_like)
    else:
        db.add(Like(user_id=current_user.id, story_id=story_id))
    db.commit()

    likes = list(
        db.scalars(select(Like).where(Like.story_id == story_id).order_by(Like.created_at.desc()))
    )
    likes_count = db.scalar(select(func.count(Like.id)).where(Like.story_id == story_id)) or 0
    return LikeToggleResponse(
        story_id=story_id,
        likes_count=likes_count,
        likes=likes,
        liked=liked,
    )


@router.delete("/like", status_code=status.HTTP_204_NO_CONTENT)
def unlike_story(
    story_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    like = db.scalar(select(Like).where(Like.user_id == current_user.id, Like.story_id == story_id))
    if not like:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Like not found")
    db.delete(like)
    db.commit()


@router.get("/likes", response_model=LikesDetail)
def get_story_likes(story_id: int, db: Session = Depends(get_db)) -> LikesDetail:
    _require_published_story(story_id, db)
    likes = list(
        db.scalars(select(Like).where(Like.story_id == story_id).order_by(Like.created_at.desc()))
    )
    likes_count = db.scalar(select(func.count(Like.id)).where(Like.story_id == story_id)) or 0
    return LikesDetail(story_id=story_id, likes_count=likes_count, likes=likes)
