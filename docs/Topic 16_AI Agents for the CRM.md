## **AI AGENTS FOR THE CRM**

### **1\. Challenge Overview**

VPBank’s CRM platform is the digital backbone that empowers our sales, customer service, and marketing teams to deliver personalized experiences to millions of customers. Built on a scalable and modular architecture, the CRM system integrates various customer touchpoints, providing a unified 360-degree view of each customer.

**Key functions include:**  
 – Lead & opportunity management  
 – Customer interaction history  
 – Campaign management  
 – Automated workflows and alerts  
 – Integration with core banking and digital channels

The system is API–first, enabling external services to plug in and enhance its capabilities.

**Imagine a smart AI assistant embedded within the CRM that:**  
 – Reminds a Relationship Manager (RM) of a customer’s key milestones (e.g., birthday, expiring deposit)  
 – Automatically **drafts follow-up emails** or **call scripts**  
 – Suggests **next-best actions based on historical interactions**  
 – Helps marketers generate campaign content based on customer profiles

You are challenged to build this AI Agent, powered by the Multiple Context Protocol (MCP) – an architecture that supports seamless, context-aware conversation with AI agents across various CRM modules.

---

The AI Agent will act as a co-pilot for CRM users, transforming manual processes into intelligent, context-driven interactions.

**Develop an AI Agent that can:**  
 – Communicate through a friendly UI  
 – Retrieve and understand multiple CRM contexts (customer profile, product info, interaction history, etc.)  
 – Respond smartly using the MCP protocol  
 – Demonstrate tangible value for CRM users (sales, service, or marketing)

---

### **2\. Technical Requirements**

#### **2.1 The AI Agent should:**

– Parse multi-turn conversations with CRM users  
– Retrieve context (from simulated or static CRM datasets)  
– Respond in natural language with actionable insight or data  
– Show the ability to switch between different CRM contexts

#### **2.2 Tech-stack:**

– **AI Agent Core:** Python / Node.js \+ OpenAI API / LLM (ChatGPT, Claude, etc.)  
 – **Natural Language Layer:** LangChain / LlamaIndex / Haystack (context routing)  
 – **UI/UX Interface:** React.js or Vue.js  
 – **MCP Server:** REST API or WebSocket-based server (Python FastAPI / Node Express)  
 – **Data Store (Optional):** MongoDB / MySQL / PostgreSQL

---

### **3\. Evaluation and Measurement**

| Criteria | Description |
| ----- | ----- |
| **Functionality** | Does the AI Agent respond correctly and contextually? |
| **MCP Protocol Implementation** | Is the MCP protocol properly implemented to manage context switching? |
| **UI/UX Design** | Is the interface **intuitive and user-friendly**? |
| **Technical Architecture** | Is the system scalable, modular, and well-documented? |
| **Integration Strategy** | Is there a clear plan to integrate with the CRM system? |
| **Innovation & Usefulness** | Does the solution bring meaningful value to CRM users? |

---

## **4\. Deliverables**

| Deliverable | Description |  |
| ----- | ----- | ----- |
| **1\. AI Agent Frontend** | Interactive web-based UI for CRM users to talk with the agent |  |
| **2\. MCP Server** | Backend service that handles context flow across modules |  |
| **3\. CRM Context Simulations** | Static or mock data representing CRM entities (customer, product, etc.) |  |
| **4\. Architecture Documentation** | Technical diagram and explanation of components and data flow |  |
| **5\. Integration Proposal** | Strategy on how the solution can be plugged into VPBank CRM system |  |
| **6\. Source Code** | Clean, well-documented repository with instructions to run locally |  |
| **7\. Demo Video (Optional but encouraged)** | Short walkthrough video of your solution in action |  |

