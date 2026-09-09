from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str
    DEBUG: bool
    DATABASE_URL: str

    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int

    ALPHA_VANTAGE_API_KEY: str
    FINNHUB_API_KEY: str
    REDIS_URL: str

    class Config:
        env_file = ".env"


settings = Settings()