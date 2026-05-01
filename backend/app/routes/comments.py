from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models import Comment, Story, User
from app.schemas import CommentCreate, CommentPublic


router = APIRouter(tags=["comments"])


def _require_published_story(story_id: int, db: Session) -> Story:
    story = db.get(Story, story_id)
    if not story or not story.is_published:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Story not found")
    return story


@router.post(
    "/stories/{story_id}/comments",
    response_model=CommentPublic,
    status_code=status.HTTP_201_CREATED,
)
def create_comment(
    story_id: int,
    comment_in: CommentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Comment:
    _require_published_story(story_id, db)
    comment = Comment(
        user_id=current_user.id,
        story_id=story_id,
        content=comment_in.content,
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return comment


@router.get("/stories/{story_id}/comments", response_model=list[CommentPublic])
def get_story_comments(story_id: int, db: Session = Depends(get_db)) -> list[Comment]:
    _require_published_story(story_id, db)
    return list(
        db.scalars(
            select(Comment).where(Comment.story_id == story_id).order_by(Comment.created_at.asc())
        )
    )


@router.delete("/comments/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_comment(
    comment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    comment = db.get(Comment, comment_id)
    if not comment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Comment not found")
    if comment.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed to delete comment")
    db.delete(comment)
    db.commit()
