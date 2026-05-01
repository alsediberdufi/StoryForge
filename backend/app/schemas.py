from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    user_id: int | None = None


class UserBase(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    email: EmailStr


class UserCreate(UserBase):
    password: str = Field(min_length=8)


class UserUpdate(BaseModel):
    bio: str | None = None
    profile_image_url: str | None = Field(default=None, max_length=500)
    saved_stories_public: bool | None = None


class UserPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    username: str
    bio: str | None = None
    profile_image_url: str | None = None
    saved_stories_public: bool
    created_at: datetime


class UserPrivate(UserPublic):
    email: EmailStr
    role: str
    is_active: bool


class UserAdmin(UserPrivate):
    hashed_password: str


class StoryBase(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    content: str = Field(min_length=1)
    image_url: str | None = Field(default=None, max_length=500)
    category: str | None = Field(default=None, max_length=100)
    is_published: bool = False


class StoryCreate(StoryBase):
    pass


class StoryUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    content: str | None = Field(default=None, min_length=1)
    image_url: str | None = Field(default=None, max_length=500)
    category: str | None = Field(default=None, max_length=100)
    is_published: bool | None = None


class StoryPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    content: str
    image_url: str | None = None
    category: str | None = None
    is_published: bool
    author_id: int
    created_at: datetime
    updated_at: datetime
    likes_count: int = 0
    comments_count: int = 0
    is_saved: bool = False


class LikePublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    story_id: int
    created_at: datetime
    user: UserPublic | None = None


class LikesSummary(BaseModel):
    story_id: int
    likes_count: int


class LikesDetail(LikesSummary):
    likes: list[LikePublic]


class LikeToggleResponse(LikesDetail):
    liked: bool


class CommentCreate(BaseModel):
    content: str = Field(min_length=1)


class CommentPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    story_id: int
    content: str
    created_at: datetime
    user: UserPublic | None = None


class SavedStoryPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    story_id: int
    created_at: datetime
    story: StoryPublic


class SaveToggleResponse(BaseModel):
    story_id: int
    saved: bool


class Message(BaseModel):
    detail: str
