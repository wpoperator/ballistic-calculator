import logging
import sys
from .config import settings


def setup_logging():
    """Configure logging for the application."""
    logging.basicConfig(
        level=getattr(logging, settings.LOG_LEVEL),
        format=settings.LOG_FORMAT,
        handlers=[
            logging.StreamHandler(sys.stdout),
        ]
    )

    # Set specific loggers
    logging.getLogger("uvicorn").setLevel(logging.INFO)
    logging.getLogger("fastapi").setLevel(logging.INFO)

    if settings.ENVIRONMENT == "development":
        logging.getLogger("py_ballisticcalc").setLevel(logging.DEBUG)
    else:
        logging.getLogger("py_ballisticcalc").setLevel(logging.WARNING)
