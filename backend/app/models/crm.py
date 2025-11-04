from __future__ import annotations

from datetime import date, datetime
from typing import Optional

from sqlalchemy import BigInteger, Boolean, Date, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base


class DimRM(Base):
    __tablename__ = "dim_rm"

    rm_key: Mapped[int] = mapped_column(Integer, primary_key=True)
    rm_employee_id: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)
    rm_name: Mapped[str] = mapped_column(String(255), nullable=False)
    rm_dob: Mapped[Optional[date]] = mapped_column(Date)
    rm_level: Mapped[Optional[int]] = mapped_column(Integer)
    rm_title: Mapped[str] = mapped_column(String(100), nullable=False)
    rm_region: Mapped[str] = mapped_column(String(50), nullable=False)
    rm_manager_key: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("dim_rm.rm_key"), nullable=True
    )
    hire_date: Mapped[date] = mapped_column(Date, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    manager: Mapped[Optional["DimRM"]] = relationship(
        "DimRM", remote_side=[rm_key], back_populates="reports"
    )
    reports: Mapped[list["DimRM"]] = relationship("DimRM", back_populates="manager")
    customers: Mapped[list["DimCustomer"]] = relationship(
        "DimCustomer", back_populates="rm"
    )
    preferences: Mapped[Optional["DimRMPreference"]] = relationship(
        "DimRMPreference", back_populates="rm", uselist=False
    )
    tasks: Mapped[list["FactRMTask"]] = relationship(
        "FactRMTask", back_populates="rm", cascade="all, delete-orphan"
    )


class DimCustomer(Base):
    __tablename__ = "dim_customer"

    customer_key: Mapped[int] = mapped_column(Integer, primary_key=True)
    customer_id: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)
    email_address: Mapped[str] = mapped_column(String(255), nullable=False)
    phone_number: Mapped[str] = mapped_column(String(32), nullable=False)
    national_id: Mapped[str] = mapped_column(String(32), nullable=False)
    customer_name: Mapped[str] = mapped_column(String(255), nullable=False)
    customer_gender: Mapped[Optional[str]] = mapped_column(String(255))
    customer_dob: Mapped[Optional[date]] = mapped_column(Date)
    customer_job: Mapped[Optional[str]] = mapped_column(String(255))
    customer_segment: Mapped[str] = mapped_column(String(50), nullable=False)
    customer_since: Mapped[Optional[date]] = mapped_column(Date)
    address: Mapped[Optional[str]] = mapped_column(String(500))
    city: Mapped[Optional[str]] = mapped_column(String(100))
    rm_key: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("dim_rm.rm_key"))
    rm_employee_id: Mapped[Optional[str]] = mapped_column(String(50))
    state_code: Mapped[Optional[str]] = mapped_column(String(2))
    zip_code: Mapped[Optional[str]] = mapped_column(String(10))
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    rm: Mapped[Optional[DimRM]] = relationship("DimRM", back_populates="customers")
    tasks: Mapped[list["FactRMTask"]] = relationship("FactRMTask", back_populates="customer")


class DimRMPreference(Base):
    __tablename__ = "dim_rm_preference"

    rm_key: Mapped[int] = mapped_column(
        Integer, ForeignKey("dim_rm.rm_key"), primary_key=True
    )
    communication_style: Mapped[Optional[str]] = mapped_column(String(50))
    llm_prompt_snippet: Mapped[Optional[str]] = mapped_column(String(2000))
    default_report_view: Mapped[Optional[str]] = mapped_column(String(100))

    rm: Mapped[DimRM] = relationship("DimRM", back_populates="preferences")


class DimPublicEvent(Base):
    __tablename__ = "dim_public_event"

    event_key: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    event_id: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)
    event_name: Mapped[str] = mapped_column(String(100), nullable=False)
    event_category: Mapped[str] = mapped_column(String(50), nullable=False)
    event_date: Mapped[date] = mapped_column(Date, nullable=False)
    is_recurring: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    is_rm_actionable: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    source: Mapped[str] = mapped_column(String(50), nullable=False)
    load_date: Mapped[datetime] = mapped_column(DateTime, nullable=False)


class FactRMTask(Base):
    __tablename__ = "fact_rm_task"

    task_key: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    task_id: Mapped[str] = mapped_column(String(50), nullable=False)
    rm_key: Mapped[int] = mapped_column(Integer, ForeignKey("dim_rm.rm_key"))
    customer_key: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("dim_customer.customer_key"), nullable=True
    )
    created_date: Mapped[date] = mapped_column(Date, nullable=False)
    due_date: Mapped[date] = mapped_column(Date, nullable=False)
    completed_date: Mapped[Optional[date]] = mapped_column(Date)
    task_type: Mapped[str] = mapped_column(String(100), nullable=False)
    task_status: Mapped[str] = mapped_column(String(20), nullable=False)
    task_details: Mapped[Optional[str]] = mapped_column(String(1000))

    rm: Mapped[DimRM] = relationship("DimRM", back_populates="tasks")
    customer: Mapped[Optional[DimCustomer]] = relationship(
        "DimCustomer", back_populates="tasks"
    )


class FactCustRMHist(Base):
    __tablename__ = "fact_cust_rm_hist"

    interaction_id: Mapped[str] = mapped_column(String(50), primary_key=True)
    customer_key: Mapped[int] = mapped_column(
        Integer, ForeignKey("dim_customer.customer_key"), nullable=False
    )
    rm_key: Mapped[int] = mapped_column(Integer, ForeignKey("dim_rm.rm_key"), nullable=False)
    date_key: Mapped[int] = mapped_column(Integer, nullable=False)
    event_type_key: Mapped[int] = mapped_column(Integer, nullable=False)
    duration_minutes: Mapped[Optional[int]] = mapped_column(Integer)
    interaction_count: Mapped[int] = mapped_column(Integer, nullable=False, default=1)

    customer: Mapped[DimCustomer] = relationship("DimCustomer")
    rm: Mapped[DimRM] = relationship("DimRM")

