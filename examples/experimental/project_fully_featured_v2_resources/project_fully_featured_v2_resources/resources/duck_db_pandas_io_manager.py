from typing import Optional

import pydantic
from dagster_duckdb_pandas import duckdb_pandas_io_manager

from dagster import IOManagerDefinition
from dagster._config.structured_config import StructuredIOManagerAdapter


class DuckDbPandasIOManager(StructuredIOManagerAdapter):
    database: str
    schema_: Optional[str] = pydantic.Field(None, alias="schema")

    @property
    def wrapped_io_manager(self) -> IOManagerDefinition:
        return duckdb_pandas_io_manager
