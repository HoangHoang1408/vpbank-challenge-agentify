# class FindCustomerInput(BaseModel):
#     """Finds a single customer based on the provided criteria.

#     This function searches for a customer matching one or more of the specified attributes. It is designed to find exactly one matching customer to ensure precision for subsequent actions.
#     """
    
#     customerName: Optional[str] = Field(
#         default=None,
#         description="The customer's full name or partial name to search for",
#         examples=["Võ Thành Kiên", "Đinh Công Thắng"]
#     )
#     customerGender: Optional[Literal["OTHER", "MALE", "FEMALE"]] = Field(
#         default=None,
#         description="The customer's gender"
#     )
#     customerEmail: Optional[str] = Field(
#         default=None,
#         description="The customer's email address",
#         examples=["vo.thanh.kien576@outlook.com", "dinh.cong.thang@gmail.com"]
#     )
#     customerPhone: Optional[str] = Field(
#         default=None,
#         description="The customer's phone number in Vietnam (starts with +84)",
#         examples=["+840369016128", "+840909090909"]
#     )
#     customerAddress: Optional[str] = Field(
#         default=None,
#         description="The customer's address including building number, street name, ward, and district.",
#         examples=["351 Điện Biên Phủ, Ô Môn", "123 Nguyễn Văn Cừ, Quận 5"]
#     )
#     customerState: Optional[str] = Field(
#         default=None,
#         description="The customer's state or province in Vietnam.",
#         examples=["Hồ Chí Minh", "Hà Nội"]
#     )
#     customerJobTitle: Optional[str] = Field(
#         default=None,
#         description="The customer's job title or profession (in Vietnamese)",
#         examples=["Giáo viên", "Kỹ sư"]
#     )
#     customerSegment: Optional[Literal[
#         "DIAMOND_ELITE",
#         "DIAMOND",
#         "PRE_DIAMOND",
#         "CHAMPION_PRIME",
#         "RISING_PRIME",
#         "UPPERMEGA_PRIME",
#         "MEGA_PRIME"
#     ]] = Field(
#         default=None,
#         description="The customer's segment classification"
#     )


# @tool(parse_docstring=True, args_schema=FindCustomerInput)
# def find_customer(
#     customerName: str | None = None,
#     customerGender: Literal["OTHER", "MALE", "FEMALE"] | None = None,
#     customerEmail: str | None = None,
#     customerPhone: str | None = None,
#     customerAddress: str | None = None,
#     customerJobTitle: str = None,
#     customerSegment: Literal[
#         "DIAMOND_ELITE",
#         "DIAMOND",
#         "PRE_DIAMOND",
#         "CHAMPION_PRIME",
#         "RISING_PRIME",
#         "UPPERMEGA_PRIME",
#         "MEGA_PRIME",
#     ]
#     | None = None,
#     customerState: str | None = None,
#     config: RunnableConfig | None = None
# ):
#     # Build WHERE conditions based on provided parameters
#     conditions = []
#     if customerName:
#         conditions.append(f"name LIKE '%{customerName}%'")
#     if customerGender:
#         conditions.append(f"gender LIKE '%{customerGender}%'")
#     if customerEmail:
#         conditions.append(f"email LIKE '%{customerEmail}%'")
#     if customerPhone:
#         conditions.append(f"phone LIKE '%{customerPhone}%'")
#     if customerAddress:
#         conditions.append(f"address LIKE '%{customerAddress}%'")
#     if customerJobTitle:
#         conditions.append(f"jobTitle LIKE '%{customerJobTitle}%'")
#     if customerSegment:
#         conditions.append(f"segment LIKE '%{customerSegment}%'")
#     if customerState:
#         conditions.append(f"state LIKE '%{customerState}%'")
    
#     # If no conditions provided, return empty result
#     if not conditions:
#         return {
#             "customer_info": {},
#             "message": "No search criteria provided. Please provide at least one information (name, email, phone, address, job title, segment, state) to search for a customer."
#         }
    
#     # Build the query
#     where_clause = " " + " AND ".join(conditions)
#     customer_query = f"""
#     SELECT id,name,email,phone,address,country,dob,gender,jobTitle,segment,state,zip,isActive,behaviorDescription
#     FROM customers
#     WHERE{where_clause}
#     """.strip()
    
#     try:
#         # Execute the query
#         cols = [
#             "id", "name", "email", "phone", "address", "country", "dob", "gender", "jobTitle", "segment", "state", "zip", "isActive", "behaviorDescription",
#         ]
#         customer_resp = DATABASE.run(customer_query)
#         if isinstance(customer_resp, str) and customer_resp.strip():
#             processed_customer_resp = eval(str(customer_resp))
#         else:
#             processed_customer_resp = []
        
#         # Check the number of results
#         if not processed_customer_resp:
#             return {
#                 "customer_info": {},
#                 "message": "No customer found matching the provided criteria. Please ask back for different information."
#             }
        
#         if len(processed_customer_resp) > 1:
#             value_counts = []
#             for col, vals in zip(cols, zip(*processed_customer_resp)):
#                 if col == "id":
#                     continue
#                 value_counts.append((col, len(set(vals))))
#             max_value_count = max(value_counts, key=lambda x: x[1])
#             if f" {max_value_count[0]} " in where_clause:
#                 return {
#                     "customer_info": {},
#                     "message": f"Multiple customers ({len(processed_customer_resp)}) found matching the criteria. Please ask back for customer's full {max_value_count[0]}."
#                 }
#             else:
#                 return {
#                     "customer_info": {},
#                     "message": f"Multiple customers ({len(processed_customer_resp)}) found matching the criteria. Please ask back for customer's {max_value_count[0]}."
#                 }
        
#         # Exactly one customer found
        
#         customer_info = {}
#         for col, val in zip(cols, processed_customer_resp[0]):
#             customer_info[col] = val
        
#         return {
#             "customer_info": customer_info,
#             "message": "Customer found successfully." if customer_info["isActive"] else "Warning: Customer is not active."
#         }
    
#     except Exception as e:
#         return {
#             "customer_info": {},
#             "message": f"An error occurred while searching for customer: {e}"
#         }



# class FindCardProductInput(BaseModel):
#     """Finds a single card product based on specified criteria.

#     This function searches for available credit or debit card products. It is designed to find exactly one matching product to ensure clarity for subsequent actions, such as providing details or starting an application.
#     """
    
#     cardType: Optional[Literal["CREDIT", "DEBIT"]] = Field(
#         default=None,
#         description="The type of card product to search for"
#     )
#     cardProductName: Optional[str] = Field(
#         default=None,
#         description="The specific name of the card product",
#         examples=["VPBank Z JCB", "VPBank Shopee Platinum"]
#     )
#     cardNetwork: Optional[Literal["VISA", "MASTERCARD"]] = Field(
#         default=None,
#         description="The card network provider"
#     )

# @tool(parse_docstring=True, args_schema=FindCardProductInput)
# def find_card_product(
#     cardType: Literal["CREDIT", "DEBIT"] | None = None,
#     cardProductName: str | None = None,
#     cardNetwork: Literal["VISA", "MASTERCARD"] | None = None,
#     config: RunnableConfig = None
# ):
#     # Build WHERE conditions based on provided parameters
#     conditions = []
#     if cardType:
#         conditions.append(f"cardType LIKE '%{cardType}%'")
#     if cardProductName:
#         conditions.append(f"cardProductName LIKE '%{cardProductName}%'")
#     if cardNetwork:
#         conditions.append(f"cardNetwork LIKE '%{cardNetwork}%'")
    
#     # If no conditions provided, return empty result
#     if not conditions:
#         return {
#             "product_info": {},
#             "message": "No search criteria provided. Please provide at least one information (card type, product name, or card network) to search for a card product."
#         }
    
#     # Build the query - only select active cards
#     where_clause = " " + " AND ".join(conditions)
#     card_query = f"""
#     SELECT id, cardType, cardProductName, cardDescription, targetDescription, cardNetwork, isActive
#     FROM cards
#     WHERE{where_clause}
#     """.strip()
    
#     try:
#         # Execute the query
#         cols = [
#             "id", "cardType", "cardProductName", "cardDescription", "targetDescription", "cardNetwork", "isActive"
#         ]
#         card_resp = DATABASE.run(card_query)
#         if isinstance(card_resp, str) and card_resp.strip():
#             processed_card_resp = eval(str(card_resp))
#         else:
#             processed_card_resp = []
        
#         # Check the number of results
#         if not processed_card_resp:
#             return {
#                 "product_info": {},
#                 "message": "No card product found matching the provided criteria. Please ask back for different information."
#             }
        
#         if len(processed_card_resp) > 1:
#             value_counts = []
#             for col, vals in zip(cols, zip(*processed_card_resp)):
#                 if col == "id":
#                     continue
#                 value_counts.append((col, len(set(vals))))
#             max_value_count = max(value_counts, key=lambda x: x[1])
#             if f" {max_value_count[0]} " in where_clause:
#                 return {
#                     "product_info": {},
#                     "message": f"Multiple card products ({len(processed_card_resp)}) found matching the criteria. Please ask back for full {max_value_count[0]}."
#                 }
#             else:
#                 return {
#                     "product_info": {},
#                     "message": f"Multiple card products ({len(processed_card_resp)}) found matching the criteria. Please ask back for {max_value_count[0]}."
#                 }
        
#         # Exactly one card product found
#         product_info = {}
#         for col, val in zip(cols, processed_card_resp[0]):
#             product_info[col] = val
        
#         return {
#             "product_info": product_info,
#             "message": "Card product found successfully." if product_info["isActive"] else "Warning: Card product is not active."
#         }
    
#     except Exception as e:
#         return {
#             "product_info": {},
#             "message": f"An error occurred while searching for card product: {e}"
#         }


# class FindRmTaskInput(BaseModel):
#     """Finds a single task for a relationship manager based on specified criteria.

#     This function queries for tasks assigned to the relationship manager. It is designed to find
#     exactly one matching task.
#     """
    
#     customerId: Optional[int] = Field(
#         default=None,
#         description="The unique identifier for a customer. If other customer information is provided, call `find_customer` first to obtain the `customerId`."
#     )
#     taskType: Optional[Literal["CALL", "EMAIL", "MEETING", "FOLLOW_UP", "SEND_INFO_PACKAGE"]] = Field(
#         default=None,
#         description="The type of task to filter by"
#     )
#     taskStatus: Optional[Literal["PENDING", "COMPLETED", "CANCELLED", "IN_PROGRESS"]] = Field(
#         default=None,
#         description="The current status of the task"
#     )
#     taskDueDate: Optional[tuple] = Field(
#         default=None,
#         description="A tuple containing start and end dates as strings to filter tasks by due date range in YYYY-MM-DD format",
#         examples=[("2025-11-07", "2025-11-07"), ("2025-11-07", "2025-11-10")]
#     )

# @tool(parse_docstring=True, args_schema=FindRmTaskInput)
# def find_rm_task(
#     customerId: int | None = None,
#     taskType: Literal["CALL", "EMAIL", "MEETING", "FOLLOW_UP", "SEND_INFO_PACKAGE"] | None = None,
#     taskStatus: Literal["PENDING", "COMPLETED", "CANCELLED", "IN_PROGRESS"] | None = None,
#     taskDueDate: Tuple[str, str] | None = None,
#     config: RunnableConfig = None
# ):
#     # Extract relationship manager id from thread_id
#     rm_id = None
#     if config:
#         rm_id = config.get("configurable", {}).get("thread_id")
    
#     try:
#         rm_id = int(rm_id)
#     except Exception:
#         raise ValueError(
#             "relationship manager id not found in configuration or is not an integer. Please provide thread_id as relationship manager id."
#         )
    
#     # Build WHERE conditions based on provided parameters
#     conditions = [f"rmId = {rm_id}"] 
    
#     if customerId is not None:
#         try:
#             customerId = int(customerId)
#         except ValueError:
#             return {
#                 "task_info": {},
#                 "message": "Invalid customer ID. Customer ID must be an integer. Please provide a valid customer ID or ask back for customer information and use the `find_customer` tool to obtain it."
#             }
#         conditions.append(f"customerId = {customerId}")
#     if taskType is not None:
#         if taskType not in ["CALL", "EMAIL", "MEETING", "FOLLOW_UP", "SEND_INFO_PACKAGE"]:
#             return {
#                 "task_info": {},
#                 "message": "Invalid task type. Task type must be one of: CALL, EMAIL, MEETING, FOLLOW_UP, SEND_INFO_PACKAGE"
#             }
#         conditions.append(f"taskType LIKE '%{taskType}%'")
#     if taskStatus is not None:
#         if taskStatus not in ["PENDING", "COMPLETED", "CANCELLED", "IN_PROGRESS"]:
#             return {
#                 "task_info": {},
#                 "message": "Invalid task status. Task status must be one of: PENDING, COMPLETED, CANCELLED, IN_PROGRESS"
#             }
#         conditions.append(f"status LIKE '%{taskStatus}%'")
#     if taskDueDate is not None:
#         start_date, end_date = taskDueDate
#         if start_date and end_date and start_date > end_date:
#             return {
#                 "task_info": {},
#                 "message": "Start date cannot be greater than end date. Please provide a valid date range."
#             }
#         if start_date:
#             try:
#                 datetime.strptime(start_date, "%Y-%m-%d")
#             except Exception:
#                 return {
#                     "task_info": {},
#                     "message": "Invalid start date. Please provide a valid start date in YYYY-MM-DD format."
#                 }
#             conditions.append(f"dueDate >= '{start_date}'")
#         if end_date:
#             try:
#                 datetime.strptime(end_date, "%Y-%m-%d")
#             except Exception:
#                 return {
#                     "task_info": {},
#                     "message": "Invalid end date. Please provide a valid end date in YYYY-MM-DD format."
#                 }
#             conditions.append(f"dueDate <= '{end_date}'")
    
#     # Build the query
#     where_clause = " AND ".join(conditions)
#     task_query = f"""
#     SELECT id, customerId, taskType, status, taskDetails, dueDate
#     FROM tasks
#     WHERE {where_clause}
#     """.strip()
    
#     try:
#         # Execute the query
#         cols = [
#             "id", "customerId", "taskType", "taskStatus", "taskDetails", "dueDate"
#         ]
#         task_resp = DATABASE.run(task_query)
#         if isinstance(task_resp, str) and task_resp.strip():
#             processed_task_resp = eval(str(task_resp))
#         else:
#             processed_task_resp = []
        
#         # Check the number of results
#         if not processed_task_resp:
#             return {
#                 "task_info": {},
#                 "message": "No task found matching the provided criteria. Please ask back for different information."
#             }
        
#         if len(processed_task_resp) > 1:
#             value_counts = []
#             for col, vals in zip(cols, zip(*processed_task_resp)):
#                 if col == "id":
#                     continue
#                 elif col == "customerId":
#                     value_counts.append(("customer information", len(set(vals))))
#                 value_counts.append((col, len(set(vals))))
#             max_value_count = max(value_counts, key=lambda x: x[1])
#             return {
#                 "task_info": {},
#                 "message": f"({len(processed_task_resp)}) tasks found matching the criteria. Please ask back for {max_value_count[0]} to identify a single task."
#             }
        
#         # Exactly one task found
#         task_info = {}
#         for col, val in zip(cols, processed_task_resp[0]):
#             task_info[col] = val
        
#         return {
#             "task_info": task_info,
#             "message": "Task found successfully."
#         }
    
#     except Exception as e:
#         return {
#             "task_info": {},
#             "message": f"An error occurred while searching for task: {e}"
#         }

# class CreateRmTaskInput(BaseModel):
#     """Creates a new task for a relationship manager.

#     This function schedules a new task, linking it to a specific customer and setting a due date."""
    
#     customerId: Optional[int] = Field(
#         default=None,
#         description="The unique identifier for the customer the task is for. If the user provides a name or other details, use the `find_customer` tool first."
#     )
#     taskType: Optional[Literal["CALL", "EMAIL", "MEETING", "FOLLOW_UP", "SEND_INFO_PACKAGE"]] = Field(
#         default=None,
#         description="The type of task to create"
#     )
#     taskStatus: Optional[Literal["PENDING", "COMPLETED", "CANCELLED", "IN_PROGRESS"]] = Field(
#         default=None,
#         description="The initial status of the task"
#     )
#     taskDueDate: Optional[str] = Field(
#         default=None,
#         description="The specific due date for the task, formatted as a string.",
#         examples=["2025-11-07", "2025-11-10"]
#     )
#     taskDetails: Optional[str] = Field(
#         default=None,
#         description="Detailed description of the task"
#     )

# @tool(parse_docstring=True, args_schema=CreateRmTaskInput)
# def create_rm_task(
#     customerId: int | None = None,
#     taskType: Literal["CALL", "EMAIL", "MEETING", "FOLLOW_UP", "SEND_INFO_PACKAGE"] | None = None,
#     taskStatus: Literal["PENDING", "COMPLETED", "CANCELLED", "IN_PROGRESS"] | None = None,
#     taskDueDate: Tuple[str, str] | None = None,
#     taskDetails: str | None = None,
#     config: RunnableConfig = None
# ):
#     # Extract relationship manager id from thread_id
#     rm_id = None
#     if config:
#         rm_id = config.get("configurable", {}).get("thread_id")
    
#     try:
#         rm_id = int(rm_id)
#     except Exception:
#         raise ValueError(
#             "relationship manager id not found in configuration or is not an integer. Please provide thread_id as relationship manager id."
#         )

#     # Validate input parameters
#     if customerId is None:
#         return {
#             "message": "Customer ID is required. Please provide a customer ID or ask back for customer information and use the `find_customer` tool to obtain it."
#         }
#     else:
#         try:
#             customerId = int(customerId)
#         except ValueError:
#             return {
#                 "message": "Invalid customer ID. Customer ID must be an integer. Please provide a valid customer ID or ask back for customer information and use the `find_customer` tool to obtain it."
#             }
#     if taskType is None:
#         return {
#             "message": "Task type is required. Please provide a task type."
#         }
#     elif taskType not in ["CALL", "EMAIL", "MEETING", "FOLLOW_UP", "SEND_INFO_PACKAGE"]:
#         return {
#             "message": "Invalid task type. Task type must be one of: CALL, EMAIL, MEETING, FOLLOW_UP, SEND_INFO_PACKAGE"
#         }
#     if taskStatus is None:
#         return {
#             "message": "Task status is required. Please provide a task status."
#         }
#     elif taskStatus not in ["PENDING", "COMPLETED", "CANCELLED", "IN_PROGRESS"]:
#         return {
#             "message": "Invalid task status. Task status must be one of: PENDING, COMPLETED, CANCELLED, IN_PROGRESS"
#         }
#     if taskDueDate is None:
#         return {
#             "message": "Task due date is required. Please provide a task due date in YYYY-MM-DD format."
#         }
#     else:
#         try:
#             datetime.strptime(taskDueDate, "%Y-%m-%d")
#         except Exception:
#             return {
#                 "message": "Invalid task due date. Please provide a task due date in YYYY-MM-DD format."
#             }
#     if taskDetails is None:
#         taskDetails = ""
#     else:
#         taskDetails = str(taskDetails)
    
#     return {
#         "message": "All input is now valid. Ask for confirmation",
#     }
    


# class UpdateRmTaskInput(BaseModel):
#     """Updates specific fields of an existing task for the relationship manager.

#     This function modifies one or more fields of a specific task identified by its unique ID. The fields that can be updated are: taskStatus, taskDueDate, taskDetails.
#     """
    
#     rmTaskId: Optional[int] = Field(
#         default=None,
#         description="The unique identifier of the task to update. If the user refers to a task by attributes, call `find_rm_task` first to get the `rmTaskId`."
#     )
#     updateTaskStatus: Optional[Literal["PENDING", "COMPLETED", "CANCELLED", "IN_PROGRESS"]] = Field(
#         default=None,
#         description="The new status of the task."
#     )
#     updateTaskDueDate: Optional[str] = Field(
#         default=None,
#         description="The new due date of the task in YYYY-MM-DD format.",
#         examples=["2025-11-25"]
#     )
#     updateTaskDetails: Optional[str] = Field(
#         default=None,
#         description="The new details of the task.",
#     )

# @tool(parse_docstring=True, args_schema=UpdateRmTaskInput)
# def update_rm_task(
#     rmTaskId: int | None = None,
#     updateTaskStatus: Literal["PENDING", "COMPLETED", "CANCELLED", "IN_PROGRESS"] | None = None,
#     updateTaskDueDate: str | None = None,
#     updateTaskDetails: str | None = None,
#     config: RunnableConfig = None
# ):
#     # Extract relationship manager id from thread_id
#     rm_id = None
#     if config:
#         rm_id = config.get("configurable", {}).get("thread_id")
    
#     try:
#         rm_id = int(rm_id)
#     except Exception:
#         raise ValueError(
#             "relationship manager id not found in configuration or is not an integer. Please provide thread_id as relationship manager id."
#         )

#     # Validate input parameters
#     if rmTaskId is None:
#         return {
#             "message": "Task ID is required. Please provide a task ID or ask back for task information and use the `find_rm_task` tool to obtain it."
#         }
#     else:
#         try:
#             rmTaskId = int(rmTaskId)
#         except ValueError:
#             return {
#                 "message": "Invalid task ID. Task ID must be an integer. Please provide a valid task ID or ask back for task information and use the `find_rm_task` tool to obtain it."
#             }
#     if updateTaskStatus is None and updateTaskDueDate is None and updateTaskDetails is None:
#         return {
#             "message": "No fields to update. Please provide a field to update."
#         }
#     if updateTaskStatus:
#         if updateTaskStatus not in ["PENDING", "COMPLETED", "CANCELLED", "IN_PROGRESS"]:
#             return {
#                 "message": "Invalid task status. Task status must be one of: PENDING, COMPLETED, CANCELLED, IN_PROGRESS"
#             }
#     if updateTaskDueDate:
#         try:
#             datetime.strptime(updateTaskDueDate, "%Y-%m-%d")
#         except Exception:
#             return {
#                 "message": "Invalid task due date. Please provide a task due date in YYYY-MM-DD format."
#             }
#     if updateTaskDetails is not None:
#         updateTaskDetails = str(updateTaskDetails)

#     return {
#         "message": "All input is now valid. Ask for confirmation",
#     }

# class ReportPerformanceInput(BaseModel):
#     """Retrieves a performance report for the relationship manager for a given period.

#     This function calculates and returns key performance indicators (KPIs) for the
#     currently logged-in relationship manager over a specified date range.
#     """
    
#     startDate: Optional[str] = Field(
#         default=None,
#         description="The start date of the performance report in YYYY-MM-DD format.",
#         examples=["2025-06-11"]
#     )
#     endDate: Optional[str] = Field(
#         default=None,
#         description="The end date of the performance report in YYYY-MM-DD format.",
#         examples=["2025-11-25"]
#     )

# @tool(parse_docstring=True, args_schema=ReportPerformanceInput)
# def report_performance(
#     startDate: str | None = None,
#     endDate: str | None = None,
#     config: RunnableConfig = None
# ):
#     # Extract relationship manager id from thread_id
#     rm_id = None
#     if config:
#         rm_id = config.get("configurable", {}).get("rmId")
    
#     try:
#         rm_id = int(rm_id)
#     except Exception:
#         raise ValueError(
#             "relationship manager id not found in configuration or is not an integer. Please provide thread_id as relationship manager id."
#         )

#     # Build WHERE conditions based on provided parameters
#     conditions = [f"rmId = {rm_id}"] 
    
#     if startDate is not None:
#         try:
#             datetime.strptime(startDate, "%Y-%m-%d")
#         except ValueError:
#             return {
#                 "task_info": {},
#                 "message": "Invalid start date. Please provide a valid start date in YYYY-MM-DD format."
#             }
#         conditions.append(f"createdAt >= '{startDate}'")
    
#     if endDate is not None:
#         try:
#             datetime.strptime(endDate, "%Y-%m-%d")
#         except ValueError:
#             return {
#                 "task_info": {},
#                 "message": "Invalid end date. Please provide a valid end date in YYYY-MM-DD format."
#             }
#         conditions.append(f"createdAt <= '{endDate}'")
    
#     # Build the query
#     where_clause = " AND ".join(conditions)
#     performance_query = f"""
#     SELECT status, COUNT(*) as task_count
#     FROM tasks
#     WHERE {where_clause}
#     GROUP BY status
#     ORDER BY task_count DESC  
#     """.strip()
    
#     try:
#         # Execute the query
#         performance_resp = DATABASE.run(performance_query)
#         if isinstance(performance_resp, str) and performance_resp.strip():
#             processed_performance_resp = eval(str(performance_resp))
#         else:
#             processed_performance_resp = []
        
#         # Check the number of results
#         if not processed_performance_resp:
#             return {
#                 "task_info": {},
#                 "message": "No task found during the period. Please ask back for a different period."
#             }

#         performance_report = {}
#         for status, count in processed_performance_resp:
#             performance_report[f"{status.lower()} tasks"] = count
#         performance_report["total tasks"] = sum(performance_report.values())
#         return {
#             "message": "Performance report retrieved successfully.",
#             "performance_report": performance_report
#         }
    
#     except Exception as e:
#         return {
#             "task_info": {},
#             "message": f"An error occurred while searching for task: {e}"
#         }
    