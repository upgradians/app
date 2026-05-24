from pydantic_settings import BaseSettings
from pydantic import field_validator
from functools import lru_cache
from typing import List


class Settings(BaseSettings):
    SUPABASE_URL:      str
    SUPABASE_KEY:      str
    OPENAI_API_KEY:    str   = ""
    OPENAI_MODEL:      str   = "gpt-4o-mini"
    JUDGE0_URL:        str   = "https://judge0-ce.p.rapidapi.com"
    JUDGE0_API_KEY:    str   = ""
    ALLOWED_ORIGINS:   List[str] = ["http://localhost:3000", "https://upgradian.com"]
    LOG_LEVEL:         str   = "INFO"

    model_config = {"env_file": "../../.env", "env_file_encoding": "utf-8"}

    @field_validator("SUPABASE_URL", "SUPABASE_KEY")
    @classmethod
    def must_not_be_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("must not be empty")
        return v


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
