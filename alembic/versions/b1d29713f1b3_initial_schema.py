"""initial schema

Revision ID: b1d29713f1b3
Revises:
"""

from typing import Sequence, Union

revision: str = "b1d29713f1b3"
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
