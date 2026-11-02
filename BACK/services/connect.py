import os
import logging
import subprocess
import psycopg

from contextlib import asynccontextmanager
from pathlib import Path
from dotenv import load_dotenv

from app.config import ENV_FILE


@asynccontextmanager
async def lifespan(app):
    try:
        start_postgres()
        with connect():
            logging.getLogger("uvicorn.error").info("PostgreSQL conectado.")
    except (psycopg.Error, OSError, subprocess.SubprocessError, RuntimeError) as error:
        logging.getLogger("uvicorn.error").warning(
            "PostgreSQL indisponivel (%s); FastAPI iniciando com o JSON de reserva.",
            error,
        )
    yield


def start_postgres():
    load_dotenv(ENV_FILE, encoding="utf-8-sig")
    pg_ctl = os.environ["PG_CTL_PATH"]
    data_dir = Path(os.environ["PG_DATA_DIR"])
    log_file = data_dir.parent / "backend.log"
    options = {
        "capture_output": True,
        "text": True,
        "timeout": 20,
        "creationflags": getattr(subprocess, "CREATE_NO_WINDOW", 0),
    }

    status = subprocess.run([pg_ctl, "-D", str(data_dir), "status"], **options)
    if status.returncode == 0:
        return
    if status.returncode != 3:
        raise RuntimeError(status.stderr.strip() or status.stdout.strip())

    port = int(os.environ["DB_PORT"])
    host = os.environ["DB_HOST"]
    result = subprocess.run(
        [
            pg_ctl, "-D", str(data_dir), "-l", str(log_file),
            "-o", f"-p {port} -h {host}", "-t", "15", "-w", "start",
        ],
        **options,
    )
    if result.returncode != 0:
        raise RuntimeError(
            f"{result.stderr.strip() or result.stdout.strip()} Consulte {log_file}."
        )
    logging.getLogger("uvicorn.error").info("PostgreSQL iniciado na porta %s.", port)


def connect() -> psycopg.Connection:
    load_dotenv(ENV_FILE, encoding="utf-8-sig")

    return psycopg.connect(
        host=os.environ["DB_HOST"],
        port=os.environ["DB_PORT"],
        dbname=os.environ["DB_NAME"],
        user=os.environ["DB_USER"],
        password=os.getenv("DB_PASSWORD", ""),
        connect_timeout=5,
        autocommit=True,
    )


