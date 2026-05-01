from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import Select, func, or_, select
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user, get_optional_current_user
from app.models import Comment, Like, SavedStory, Story, User
from app.schemas import StoryCreate, StoryPublic, StoryUpdate


router = APIRouter(prefix="/stories", tags=["stories"])


def _story_with_counts_query() -> Select[tuple[Story, int, int]]:
    return (
        select(
            Story,
            func.count(func.distinct(Like.id)).label("likes_count"),
            func.count(func.distinct(Comment.id)).label("comments_count"),
        )
        .outerjoin(Like, Like.story_id == Story.id)
        .outerjoin(Comment, Comment.story_id == Story.id)
        .group_by(Story.id)
    )


def _story_response(
    story: Story,
    likes_count: int = 0,
    comments_count: int = 0,
    current_user: User | None = None,
    db: Session | None = None,
) -> StoryPublic:
    response = StoryPublic.model_validate(story)
    response.likes_count = likes_count
    response.comments_count = comments_count
    if current_user and db:
        response.is_saved = (
            db.scalar(
                select(SavedStory).where(
                    SavedStory.user_id == current_user.id,
                    SavedStory.story_id == story.id,
                )
            )
            is not None
        )
    return response


def get_visible_story(story_id: int, current_user: User | None, db: Session) -> Story:
    story = db.get(Story, story_id)
    if not story:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Story not found")
    is_owner = current_user is not None and story.author_id == current_user.id
    is_admin = current_user is not None and current_user.role == "admin"
    if not story.is_published and not (is_owner or is_admin):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Story not found")
    return story


@router.post("", response_model=StoryPublic, status_code=status.HTTP_201_CREATED)
def create_story(
    story_in: StoryCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> StoryPublic:
    story = Story(**story_in.model_dump(), author_id=current_user.id)
    db.add(story)
    db.commit()
    db.refresh(story)
    return _story_response(story, current_user=current_user, db=db)


@router.get("", response_model=list[StoryPublic])
def list_stories(
    search: str | None = None,
    category: str | None = None,
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=10, ge=1, le=100),
    current_user: User | None = Depends(get_optional_current_user),
    db: Session = Depends(get_db),
) -> list[StoryPublic]:
    query = _story_with_counts_query().where(Story.is_published.is_(True))
    if search:
        pattern = f"%{search}%"
        query = query.where(or_(Story.title.ilike(pattern), Story.content.ilike(pattern)))
    if category:
        query = query.where(Story.category == category)

    rows = db.execute(
        query.order_by(Story.created_at.desc()).offset((page - 1) * limit).limit(limit)
    ).all()
    return [
        _story_response(story, likes_count, comments_count, current_user, db)
        for story, likes_count, comments_count in rows
    ]


@router.get("/{story_id}", response_model=StoryPublic)
def get_story(
    story_id: int,
    current_user: User | None = Depends(get_optional_current_user),
    db: Session = Depends(get_db),
) -> StoryPublic:
    row = db.execute(_story_with_counts_query().where(Story.id == story_id)).one_or_none()
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Story not found")
    story, likes_count, comments_count = row
    is_owner = current_user is not None and story.author_id == current_user.id
    is_admin = current_user is not None and current_user.role == "admin"
    if not story.is_published and not (is_owner or is_admin):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Story not found")
    return _story_response(story, likes_count, comments_count, current_user, db)


@router.put("/{story_id}", response_model=StoryPublic)
def update_story(
    story_id: int,
    story_in: StoryUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> StoryPublic:
    story = db.get(Story, story_id)
    if not story:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Story not found")
    if story.author_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your story")

    for field, value in story_in.model_dump(exclude_unset=True).items():
        setattr(story, field, value)
    db.commit()
    db.refresh(story)
    return _story_response(story, current_user=current_user, db=db)


@router.delete("/{story_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_story(
    story_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    story = db.get(Story, story_id)
    if not story:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Story not found")
    if story.author_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed to delete story")
    db.delete(story)
    db.commit()
