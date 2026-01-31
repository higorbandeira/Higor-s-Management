"""add user module

Revision ID: 0002_add_user_module
Revises: 0001_init
Create Date: 2026-01-31

"""

from alembic import op
import sqlalchemy as sa

revision = "0002_add_user_module"
down_revision = "0001_init"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "users",
        sa.Column("module", sa.String(), nullable=False, server_default="CHAT"),
    )
    op.execute("UPDATE users SET module = 'CHAT' WHERE module IS NULL")
    op.alter_column("users", "module", server_default=None)


def downgrade():
    op.drop_column("users", "module")
