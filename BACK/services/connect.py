import os
import logging
import subprocess
import psycopg

from contextlib import asynccontextmanager
from pathlib import Path
from dotenv import load_dotenv

from app.config import DATABASE_DIR, ENV_FILE


@asynccontextmanager
async def lifespan(app):
    load_dotenv(ENV_FILE, encoding="utf-8-sig")

    try:
        if not os.getenv("DATABASE_URL"):
            start_postgres()

        with connect() as connection:
            initialize_database(connection)
            guias_sql = DATABASE_DIR / "SQL" / "detonados" / "detonados.sql"
            connection.execute(guias_sql.read_text(encoding="utf-8"))
            builds_sql = DATABASE_DIR / "SQL" / "builds" / "builds.sql"
            connection.execute(builds_sql.read_text(encoding="utf-8"))
            game_sql = DATABASE_DIR / "SQL" / "game" / "game.sql"
            connection.execute(game_sql.read_text(encoding="utf-8"))
            logging.getLogger("uvicorn.error").info("PostgreSQL conectado.")

    except (
        KeyError,
        psycopg.Error,
        OSError,
        subprocess.SubprocessError,
        RuntimeError,
    ) as error:
        logging.getLogger("uvicorn.error").warning(
            "PostgreSQL indisponivel (%s); FastAPI iniciando com o JSON de reserva.",
            error,
        )

    yield


def initialize_database(connection: psycopg.Connection) -> None:
    result = connection.execute(
        "SELECT to_regclass('public.pokemon')"
    ).fetchone()

    if result and result[0] is not None:
        return

    sql_file = DATABASE_DIR / "SQL" / "pokemon.sql"
    sql = sql_file.read_text(encoding="utf-8")
    connection.execute(sql)


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

    database_url = os.getenv("DATABASE_URL")

    if database_url:
        return psycopg.connect(
            database_url,
            connect_timeout=5,
            autocommit=True,
        )

    return psycopg.connect(
        host=os.environ["DB_HOST"],
        port=os.environ["DB_PORT"],
        dbname=os.environ["DB_NAME"],
        user=os.environ["DB_USER"],
        password=os.getenv("DB_PASSWORD", ""),
        connect_timeout=5,
        autocommit=True,
    )

