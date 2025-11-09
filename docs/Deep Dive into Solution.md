
```mermaid
graph TD
    subgraph Agentify AI

        subgraph "Interactive AI Agent"
            direction LR
            B1[RM] -- (1) User Query --> B2{Chat UI};
            B2 -- (2) Send Query to Backend --> B3{Orchestrator};
            B3 -- Manages Flow --> B4[LLM API];
            B3 -- Interacts with --> B5[(CRM API)];
            B3 -- Interacts with --> B6[("Vector Databases")];
            B3 -- Gets RM Style --> A8[("RM's Personalization Engine")];


            subgraph "Use Case 4: Painless CRM Data Entry"
                direction TB
                B3 -- "3d. Unstructured summary of meeting" --> B4;
                B4 -- "4d. Extract Intent & Entities" --> B3;
                B3 -- "5d. Enrich Data (Get Client ID, Normalize Dates)" --> B5;
                B3 -- "6d. Present Structured Data for Confirmation" --> B2;
                B1 -- "7d. Confirm or Edit" --> B2;
                B2 -- "8d. Send Confirmation" --> B3;
                B3 -- "9d. Send Validated Data to Write Endpoints" --> B5;
                B5 -- "10d. Confirm Write Operation" --> B3;
                B3 -- "11d. Generate Final Confirmation Message" --> B4;
                B4 -- "12d. Return Confirmation Text" --> B3;
                B3 -- "13d. Send Confirmation to UI" --> B2;
            end
        end
    end

    style B5 fill:#f9f,stroke:#333,stroke-width:2px
    style A8 fill:#ccf,stroke:#333,stroke-width:2px
    style B6 fill:#ccf,stroke:#333,stroke-width:2px
```




Excellent! Moving from JSON files to a proper SQL database is a crucial step for building a robust and scalable application. Based on your provided database schemas (`bank.csv` and `solution.csv`), I'll guide you through the necessary code revisions.

We'll use **SQLAlchemy**, the de-facto standard Object-Relational Mapper (ORM) for Python, along with `psycopg2` (for PostgreSQL) or a similar driver for your chosen database.

Here is a comprehensive plan and code examples to refactor your FastAPI application.

### **Part 1: Setting Up the Database Connection**

First, you need to install the necessary libraries:

```bash
pip install sqlalchemy "psycopg2-binary"
```

Next, create a new file named `database.py` to manage database connections and sessions.

**`database.py`**
```python
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# Get database URL from environment variables, with a default for local development
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost/your_db_name")

# Create the SQLAlchemy engine
# The 'connect_args' is not needed for PostgreSQL but can be useful for SQLite
engine = create_engine(
    DATABASE_URL
)

# Each instance of the SessionLocal class will be a new database session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# This Base will be used to create each of the database models
Base = declarative_base()

# Dependency to get a DB session for each request
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

### **Part 2: Defining SQLAlchemy Models (`models.py`)**

Now, let's translate your database schema into SQLAlchemy ORM classes. Create a `models.py` file. I'll focus on the tables relevant to your current application's logic.

**`models.py`**
```python
from sqlalchemy import (
    Column, Integer, String, Boolean, DateTime, Date, ForeignKey, BIGINT
)
from sqlalchemy.orm import relationship
from .database import Base
from datetime import datetime

# Based on dim_rm in bank.csv
class RelationshipManager(Base):
    __tablename__ = "dim_rm"

    rm_key = Column(Integer, primary_key=True, index=True)
    rm_employee_id = Column(String(20), unique=True, nullable=False, index=True)
    rm_name = Column(String(255), nullable=False)
    # Storing hashed passwords is a critical security practice
    hashed_password = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False) # Assuming email is needed for login
    is_active = Column(Boolean, default=True)

    # Relationships
    preferences = relationship("RMPreserence", back_populates="rm")
    tasks = relationship("RMTask", back_populates="rm")

# Based on dim_rm_preference in solution.csv
class RMPreserence(Base):
    __tablename__ = "dim_rm_preference"

    rm_key = Column(Integer, ForeignKey("dim_rm.rm_key"), primary_key=True)
    communication_style = Column(String(50))
    llm_prompt_snippet = Column(String(2000))

    # Relationship
    rm = relationship("RelationshipManager", back_populates="preferences")

# Based on fact_rm_task in bank.csv - Represents Reminders
class RMTask(Base):
    __tablename__ = "fact_rm_task"

    task_key = Column(BIGINT, primary_key=True, index=True)
    task_id = Column(String(50), unique=True, nullable=False)
    rm_key = Column(Integer, ForeignKey("dim_rm.rm_key"))
    customer_key = Column(Integer, ForeignKey("dim_customer.customer_key"))
    created_date = Column(Date, default=datetime.utcnow)
    due_date = Column(Date)
    completed_date = Column(Date, nullable=True)
    task_type = Column(String(100)) # e.g., Birthday, Follow-up
    task_status = Column(String(20), default="Open") # Open, Completed
    task_details = Column(String(1000)) # e.g., Birthday Today

    # Relationships
    rm = relationship("RelationshipManager", back_populates="tasks")
    customer = relationship("Customer", back_populates="tasks")

# Based on dim_customer in bank.csv
class Customer(Base):
    __tablename__ = "dim_customer"

    customer_key = Column(Integer, primary_key=True, index=True)
    customer_id = Column(String(20), unique=True, nullable=False)
    customer_name = Column(String(255), nullable=False)
    customer_segment = Column(String(50)) # e.g., diamond, gold
    is_active = Column(Boolean, default=True)

    # Relationship
    tasks = relationship("RMTask", back_populates="customer")

# You would continue to define models for other tables like dim_document, etc.
# Note: For sent messages, you might need a new table or use fact_cust_rm_hist.
# Let's assume a new table `sent_messages` for simplicity.

class SentMessage(Base):
    __tablename__ = "sent_messages"

    id = Column(Integer, primary_key=True)
    user_id = Column(String, index=True) # Corresponds to rm_employee_id
    customer_id = Column(String) # Corresponds to customer_id
    channel = Column(String)
    subject = Column(String, nullable=True)
    body = Column(String)
    sent_at = Column(DateTime, default=datetime.utcnow)
```

### **Part 3: Updating Your Main Application (`main.py`)**

Now, we'll refactor your `main.py` to use the new database setup.

#### **Imports and Setup**

Add these imports to the top of `main.py`:
```python
from sqlalchemy.orm import Session
from . import models, database # Import your new files
from .database import engine

# Create all tables in the database (on application startup)
models.Base.metadata.create_all(bind=engine)

# Get DB dependency
db: Session = Depends(database.get_db)

#### **Authentication (`/auth/login`)**

# In main.py
@app.post("/auth/login", response_model=LoginResponse)
def login(request: LoginRequest, db: Session = Depends(database.get_db)):
    """
    Authenticate user and return access token
    """
    # Find user by email
    user = db.query(models.RelationshipManager).filter(models.RelationshipManager.email == request.email).first()

    if not user or not verify_password(request.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    # Use rm_employee_id as the subject for the JWT
    token = create_access_token(user.rm_employee_id)

    return LoginResponse(
        status="success",
        message="Login successful.",
        token=token,
        user={
            "id": user.rm_employee_id,
            "name": user.rm_name,
            "email": user.email
        }
    )
```

#### **Getting Reminders (`/reminders`)**

This endpoint will now query the `fact_rm_task` table.

```python
@app.get("/reminders", response_model=RemindersResponse)
def get_reminders(user_id: str = Depends(get_current_user), db: Session = Depends(database.get_db)):
    """
    Get list of active event reminders for clients
    """
    # First, get the current RM's key
    current_rm = db.query(models.RelationshipManager).filter(models.RelationshipManager.rm_employee_id == user_id).first()
    if not current_rm:
        raise HTTPException(status_code=404, detail="User not found")

    # Filter active reminders (tasks) for this RM
    active_tasks = db.query(models.RMTask).filter(
        models.RMTask.rm_key == current_rm.rm_key,
        models.RMTask.task_status == "Open"
    ).all()

    # Format the response
    reminders_list = [
        Reminder(
            reminder_id=task.task_id,
            client=ClientInfo(
                id=task.customer.customer_id,
                name=task.customer.customer_name,
                initials="".join(part[0] for part in task.customer.customer_name.split()),
                tier=task.customer.customer_segment.lower()
            ),
            event_type=task.task_type,
            event_description=task.task_details,
            last_contact_date="2025-10-20T10:00:00Z" # You would get this from fact_cust_rm_hist
        )
        for task in active_tasks
    ]

    return RemindersResponse(reminders=reminders_list)
```

#### **Logging Sent Messages (`/reminders/{reminder_id}/log-sent`)**

This endpoint will now update the task status and create a new record in your history/sent messages table.

```python
@app.post("/reminders/{reminder_id}/log-sent", response_model=LogSentResponse)
def log_sent_message(
    reminder_id: str,
    request: LogSentRequest,
    user_id: str = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    """
    Log that a message has been sent and mark reminder as complete
    """
    # Find the task (reminder)
    task = db.query(models.RMTask).filter(models.RMTask.task_id == reminder_id).first()

    if not task:
        raise HTTPException(status_code=404, detail="Reminder not found")

    # Mark reminder as inactive (completed)
    task.task_status = "Completed"
    task.completed_date = datetime.utcnow().date()

    # Log the sent message
    new_sent_message = models.SentMessage(
        user_id=user_id,
        customer_id=task.customer.customer_id,
        channel=request.channel,
        subject=request.subject,
        body=request.final_message_body
    )
    db.add(new_sent_message)
    
    # Commit all changes to the database
    db.commit()
    db.refresh(new_sent_message)

    return LogSentResponse(
        status="success",
        message="Message logged as sent.",
        sent_record_id=str(new_sent_message.id)
    )
```

### **Summary of Changes and Next Steps**

1.  **Remove Data Persistence Logic:** You can now delete all the `load_json`, `save_json`, and `initialize_data` functions, along with the associated `DATA_DIR` and file paths.
2.  **Password Hashing:** **Crucially**, you must implement password hashing. Never store passwords in plaintext as in the original `users.json`. The `passlib` library is excellent for this. You'll need a script to add your first user to the database with a hashed password.
3.  **Dependency Injection:** Notice how `db: Session = Depends(database.get_db)` is added to every endpoint that needs database access. This is a powerful FastAPI feature that handles the session lifecycle for you.
4.  **Refactor All Endpoints:** You will need to apply this pattern to *all* your endpoints, replacing any call to `load_json` or `save_json` with the appropriate SQLAlchemy query (`db.query(...)`, `db.add(...)`, `db.commit()`, etc.).
5.  **Environment Variables:** Use environment variables (e.g., via a `.env` file and the `python-dotenv` library) to manage your `DATABASE_URL` and `SECRET_KEY` securely. Do not hardcode them.

This refactoring will make your application far more robust, performant, and ready for production use. Let me know if you have questions about a specific endpoint



***
5tr5 - điện: 3.7, nước 25k/m3, xe: 100k/c, phí dịch vụ 200k (chưa có tủ lạnh) -> 5tr8-5tr9
5tr3 - điện: 4, nước 100k/ng, phí dịch vụ 150k -> 5tr5 - 5tr550
5tr4 - điện 4.5, nước 25k/m3, máy giặt sấy: 30k/lần, rác 50k/tháng -> 5tr6
5tr2 - điện 4, nước 30k, phí dịch vụ 200k -> 5tr475 - 5tr5
5tr5 - điện 3.7, nước 23k, xe 100k/c, phí dịch vụ 185k (bao gồm máy giặt chung) -> 5tr8-5tr9
5tr4 - điện 4, nước 100k/người, xe 100k/c, dịch vụ 200k -> 5tr9-6tr
5tr4 - điện 3.8, nước 100k/người, xe 120/c, dịch vụ 150k -> 5tr840-5tr960



customerName (str|None, e.g. "Võ Thành Kiên", "Đinh Công Thắng", "Huỳnh Mai Vy"), customerGender (str|None, e.g. "OTHER", "MALE", "FEMALE"), customerEmail (str|None, e.g. "vo.thanh.kien576@outlook.com", "dinh.cong.thang193@yahoo.com", "huynh.mai.vy105@yahoo.com"), customerPhone (str|nNone, e.g. "+840369016128", "+840831663566", "+840346550570"), customerAddress (str|None, e.g. "351 Điện Biên Phủ, Ô Môn", "848 Trần Phú, Hồng Bàng", "462 Điện Biên Phủ, Quận 7"), customerJobTitle (str|None, e.g. "Giáo viên", "Thiết kế", "Bác sĩ"), customerSegment (str|None, e.g. "PRE_DIAMOND", "RISING_PRIME", "DIAMOND_ELITE"), customerState (str|None, e.g. "Cần Thơ", "Hải Phòng", "Hồ Chí Minh")

I'm coding the `find_task` function, so my agent can call it when it want to find a task. There is only one argument: customerId (int|None, e.g. 9, 4, 3), taskType (str|None, e.g. "EMAIL", "FOLLOW_UP", "SEND_INFO_PACKAGE"), taskStatus (str|None, e.g. "PENDING", "COMPLETED", "CANCELLED"), taskDueDate (Tuple\[str\]|None) (taskDueDate is a tuple contains 2 string, allow LLM can filter to find task in a period of time). This function will find exactly one task, so it would return the output as {"task_id": "..", "message": "...."}. If there is only one task that match, this function will return the taskId (int), else it will return the message that guild the LLM next action (You can leave it empty string at the moment). Help me write this `find_task` function's docstring.

Cool. So Im building an agent that can support relationship managers by using all these tools to answer the following usecases:
P1: Strategic Prioritization: An RM can ask, "Based on my clients and this new product, who should I focus on cross-selling to this week?" The AI will return a prioritized Top 3 list with clear explanations (e.g., "Client A: Large cash deposit just arrived. Client B: High-risk tolerance profile with no current investments.").
P2: Next Best Action (Nurture): The RM can select a single customer and ask, "What is the best next action for this client?" The AI analyzes their entire profile to suggest a specific product for this customer.
P3: Instant Performance Reporting: RMs can ask questions about their own performance, like, "How many client calls did I log last week?" or "What is the total value of my maturing deposits this month?" The AI instantly retrieves and presents the specific answer, saving the RM from navigating complex reporting tools.
P4: Painless CRM Data Entry: After a meeting, the RM can simply type or dictate, "Update CRM for Nguyen Van Hung: Met today, he is very interested in a 2-bedroom apartment loan. Follow up next Friday." The AI parses this, finds the correct client, and automatically creates the meeting log and the new follow-up task in the CRM.