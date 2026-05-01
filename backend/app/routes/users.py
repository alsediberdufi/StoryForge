from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.dependencies import get_optional_current_user
from app.models import Comment, Like, SavedStory, Story, User
from app.schemas import SavedStoryPublic, StoryPublic, UserPublic, UserUpdate


router = APIRouter(prefix="/users", tags=["users"])


@router.get("/search", response_model=list[UserPublic])
def search_users(
    query: str = Query(min_length=1),
    db: Session = Depends(get_db),
) -> list[User]:
    pattern = f"%{query}%"
    return list(
        db.scalars(
            select(User)
            .where(User.is_active.is_(True))
            .where(or_(User.username.ilike(pattern), User.email.ilike(pattern)))
            .order_by(User.username)
            .limit(25)
        )
    )


@router.patch("/me", response_model=UserPublic)
def update_my_profile(
    user_in: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> User:
    for field, value in user_in.model_dump(exclude_unset=True).items():
        setattr(current_user, field, value)
    db.commit()
    db.refresh(current_user)
    return current_user


@router.get("/{user_id}", response_model=UserPublic)
def get_user_profile(user_id: int, db: Session = Depends(get_db)) -> User:
    user = db.get(User, user_id)
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user


@router.get("/{user_id}/stories", response_model=list[StoryPublic])
def get_user_stories(
    user_id: int,
    current_user: User | None = Depends(get_optional_current_user),
    db: Session = Depends(get_db),
) -> list[StoryPublic]:
    user = db.get(User, user_id)
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    rows = db.execute(
        select(
            Story,
            func.count(func.distinct(Like.id)).label("likes_count"),
            func.count(func.distinct(Comment.id)).label("comments_count"),
        )
        .outerjoin(Like, Like.story_id == Story.id)
        .outerjoin(Comment, Comment.story_id == Story.id)
        .where(Story.author_id == user_id, Story.is_published.is_(True))
        .group_by(Story.id)
        .order_by(Story.created_at.desc())
    ).all()

    stories = []
    for story, likes_count, comments_count in rows:
        story_response = StoryPublic.model_validate(story)
        story_response.likes_count = likes_count
        story_response.comments_count = comments_count
        if current_user:
            story_response.is_saved = (
                db.scalar(
                    select(SavedStory).where(
                        SavedStory.user_id == current_user.id,
                        SavedStory.story_id == story.id,
                    )
                )
                is not None
            )
        stories.append(story_response)
    return stories


@router.get("/{user_id}/saved-stories", response_model=list[SavedStoryPublic])
def get_user_saved_stories(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[SavedStory]:
    user = db.get(User, user_id)
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if current_user.id != user_id and not user.saved_stories_public:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Saved stories are private",
        )
    return list(
        db.scalars(
            select(SavedStory)
            .join(SavedStory.story)
            .where(SavedStory.user_id == user_id)
            .where(
                (Story.is_published.is_(True))
                | (Story.author_id == current_user.id)
                | (current_user.role == "admin")
            )
            .order_by(SavedStory.created_at.desc())
        )
    )
