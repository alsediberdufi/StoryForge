from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, Depends, File, HTTPException, Request, UploadFile, status

from app.dependencies import get_current_user
from app.models import User


router = APIRouter(prefix="/uploads", tags=["uploads"])

UPLOAD_ROOT = Path(__file__).resolve().parents[2] / "uploads"
ALLOWED_IMAGE_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
}
MAX_IMAGE_SIZE = 5 * 1024 * 1024


@router.post("/image")
async def upload_image(
    request: Request,
    file: UploadFile = File(...),
    _: User = Depends(get_current_user),
) -> dict[str, str]:
    extension = ALLOWED_IMAGE_TYPES.get(file.content_type or "")
    if extension is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Upload a JPG, PNG, WEBP, or GIF image",
        )

    contents = await file.read()
    if len(contents) > MAX_IMAGE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Image must be 5MB or smaller",
        )

    UPLOAD_ROOT.mkdir(parents=True, exist_ok=True)
    filename = f"{uuid4().hex}{extension}"
    destination = UPLOAD_ROOT / filename
    destination.write_bytes(contents)

    url = str(request.url_for("uploads", path=filename))
    return {"url": url}
