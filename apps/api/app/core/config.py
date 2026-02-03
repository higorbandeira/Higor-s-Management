from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Environment
    ENV: str = "dev"  # dev | prod

    # Database
    DATABASE_URL: str = "postgresql+psycopg2://postgres:postgres@db:5432/higor"

    # Auth
    JWT_SECRET: str = "dev-secret"
    ACCESS_MINUTES: int = 15
    REFRESH_DAYS: int = 30

    COOKIE_SECURE: bool = False
    COOKIE_SAMESITE: str = "lax"

    # CORS
    CORS_ORIGINS: str | None = None

    BOOTSTRAP_ADMIN_ENABLED: bool = True
    BOOTSTRAP_ADMIN_NICKNAME: str | None = None
    BOOTSTRAP_ADMIN_PASSWORD: str | None = None

    # LLM
    LLM_PROVIDER: str = "openai"  # openai | ollama
    LLM_API_KEY: str | None = None
    LLM_MODEL: str = "gpt-5"
    LLM_BASE_URL: str = "https://api.openai.com/v1"
    LLM_TIMEOUT_SECONDS: int = 30


settings = Settings()
