from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models import SavedStory, Story, User
from app.schemas import SavedStoryPublic, SaveToggleResponse


router = APIRouter(tags=["saved stories"])


def _require_published_story(story_id: int, db: Session) -> Story:
    story = db.get(Story, story_id)
    if not story or not story.is_published:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Story not found")
    return story


@router.post(
    "/stories/{story_id}/save",
    response_model=SavedStoryPublic,
    status_code=status.HTTP_201_CREATED,
)
def save_story(
    story_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> SavedStory:
    _require_published_story(story_id, db)
    existing_save = db.scalar(
        select(SavedStory).where(
            SavedStory.user_id == current_user.id,
            SavedStory.story_id == story_id,
        )
    )
    if existing_save:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Story already saved")

    saved_story = SavedStory(user_id=current_user.id, story_id=story_id)
    db.add(saved_story)
    db.commit()
    db.refresh(saved_story)
    return saved_story


@router.delete("/stories/{story_id}/save", status_code=status.HTTP_204_NO_CONTENT)
def unsave_story(
    story_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    saved_story = db.scalar(
        select(SavedStory).where(
            SavedStory.user_id == current_user.id,
            SavedStory.story_id == story_id,
        )
    )
    if not saved_story:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Saved story not found")
    db.delete(saved_story)
    db.commit()


@router.post("/stories/{story_id}/save-toggle", response_model=SaveToggleResponse)
def toggle_saved_story(
    story_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> SaveToggleResponse:
    _require_published_story(story_id, db)
    saved_story = db.scalar(
        select(SavedStory).where(
            SavedStory.user_id == current_user.id,
            SavedStory.story_id == story_id,
        )
    )
    saved = saved_story is None
    if saved_story:
        db.delete(saved_story)
    else:
        db.add(SavedStory(user_id=current_user.id, story_id=story_id))
    db.commit()
    return SaveToggleResponse(story_id=story_id, saved=saved)


@router.get("/me/saved-stories", response_model=list[SavedStoryPublic])
def get_my_saved_stories(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[SavedStory]:
    return list(
        db.scalars(
            select(SavedStory)
            .join(SavedStory.story)
            .where(SavedStory.user_id == current_user.id)
            .order_by(SavedStory.created_at.desc())
        )
    )
