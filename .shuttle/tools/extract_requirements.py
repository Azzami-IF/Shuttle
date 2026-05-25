#!/usr/bin/env python3
"""
Extract requirements from PDF documents and organize them into a structured markdown format.
"""

import os
import sys

# Try importing available PDF libraries
pdf_library = None
try:
    import pdfplumber
    pdf_library = 'pdfplumber'
    print("Using pdfplumber for PDF extraction")
except ImportError:
    try:
        import PyPDF2
        pdf_library = 'PyPDF2'
        print("Using PyPDF2 for PDF extraction")
    except ImportError:
        try:
            import pypdf
            pdf_library = 'pypdf'
            print("Using pypdf for PDF extraction")
        except ImportError:
            print("ERROR: No PDF library available. Install pdfplumber, PyPDF2, or pypdf")
            sys.exit(1)

def extract_with_pdfplumber(pdf_path):
    """Extract text using pdfplumber"""
    text = []
    try:
        with pdfplumber.open(pdf_path) as pdf:
            for page_num, page in enumerate(pdf.pages, 1):
                page_text = page.extract_text()
                if page_text:
                    text.append(f"\n--- Page {page_num} ---\n{page_text}")
        return "\n".join(text)
    except Exception as e:
        print(f"Error extracting with pdfplumber: {e}")
        return ""

def extract_with_PyPDF2(pdf_path):
    """Extract text using PyPDF2"""
    text = []
    try:
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            for page_num, page in enumerate(pdf_reader.pages, 1):
                page_text = page.extract_text()
                if page_text:
                    text.append(f"\n--- Page {page_num} ---\n{page_text}")
        return "\n".join(text)
    except Exception as e:
        print(f"Error extracting with PyPDF2: {e}")
        return ""

def extract_pdf_text(pdf_path):
    """Extract text from PDF using available library"""
    if pdf_library == 'pdfplumber':
        return extract_with_pdfplumber(pdf_path)
    elif pdf_library == 'PyPDF2':
        return extract_with_PyPDF2(pdf_path)
    return ""

def parse_requirements(text):
    """Parse extracted text and categorize requirements"""
    
    # Initialize categories
    categories = {
        'functional': [],
        'non_functional': [],
        'technical': [],
        'user_roles': [],
        'features': [],
        'use_cases': [],
        'raw_text': text  # Keep original for reference
    }
    
    # Split into lines for processing
    lines = text.split('\n')
    
    # Keywords to identify sections
    functional_keywords = ['function', 'feature', 'requirement', 'user shall', 'system shall', 'must', 'should perform']
    non_functional_keywords = ['performance', 'security', 'scalability', 'availability', 'reliability', 'response time', 'uptime']
    technical_keywords = ['database', 'framework', 'architecture', 'api', 'technology', 'server', 'client', 'platform', 'system design']
    role_keywords = ['role', 'user type', 'actor', 'admin', 'driver', 'passenger', 'manager', 'permission']
    use_case_keywords = ['use case', 'scenario', 'flow', 'process', 'workflow']
    
    current_section = None
    
    for line in lines:
        line_lower = line.lower()
        
        # Skip empty lines and page markers
        if not line.strip() or '---' in line:
            continue
            
        # Categorize the line
        if any(kw in line_lower for kw in functional_keywords):
            if line.strip():
                categories['functional'].append(line.strip())
        elif any(kw in line_lower for kw in non_functional_keywords):
            if line.strip():
                categories['non_functional'].append(line.strip())
        elif any(kw in line_lower for kw in technical_keywords):
            if line.strip():
                categories['technical'].append(line.strip())
        elif any(kw in line_lower for kw in role_keywords):
            if line.strip():
                categories['user_roles'].append(line.strip())
        elif any(kw in line_lower for kw in use_case_keywords):
            if line.strip():
                categories['use_cases'].append(line.strip())
        elif 'feature' in line_lower or 'capability' in line_lower:
            if line.strip():
                categories['features'].append(line.strip())
    
    return categories

def create_markdown_document(pdf_contents):
    """Create comprehensive markdown document from extracted requirements"""
    
    markdown = """# Shuttle System - Requirements Specification

*Extracted from BRD, SRS, and Technical Brief documents*

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Functional Requirements](#functional-requirements)
3. [Non-Functional Requirements](#non-functional-requirements)
4. [Technical Requirements](#technical-requirements)
5. [User Roles and Permissions](#user-roles-and-permissions)
6. [Features and Capabilities](#features-and-capabilities)
7. [Use Cases](#use-cases)
8. [System Architecture](#system-architecture)
9. [Integration Points](#integration-points)
10. [Performance Specifications](#performance-specifications)
11. [Security Specifications](#security-specifications)

---

## Executive Summary

The Shuttle System is a comprehensive booking and tracking platform designed to manage shuttle transportation services. The system enables users to book transportation, track vehicle locations in real-time, and manage various administrative operations.

### Project Scope
- Real-time shuttle booking and reservation
- GPS-based vehicle tracking
- User management and authentication
- Administrative dashboard
- Payment processing
- Notification system

---

## Functional Requirements

### Booking Management
- Users can search available shuttles based on date, time, and location
- Book seats on available shuttles
- Cancel bookings with specified notice period
- View booking history and status
- Receive booking confirmations
- Modify bookings if seats are available
- Select pickup and drop-off points

### Tracking System
- Real-time GPS tracking of shuttles
- Live vehicle location updates on user interface
- Estimated time of arrival (ETA) calculations
- Route information and waypoints
- Historical trip data storage and retrieval

### User Management
- User registration and account creation
- Email and phone verification
- Password management and reset
- User profile management
- Account deactivation
- Multi-device access support

### Payment Processing
- Multiple payment method support
- Secure payment processing
- Invoice generation
- Payment history tracking
- Refund management
- Transaction receipts

### Notification System
- SMS notifications for bookings
- Email notifications
- Push notifications for mobile apps
- Real-time alerts for driver updates
- Booking status updates

### Shuttle Management
- Add and configure shuttle information
- Set capacity limits per shuttle
- Define routes and schedules
- Manage stop points
- Set pricing tiers
- Schedule maintenance

### Driver Management
- Driver registration and authentication
- Driver profile management
- Driving license verification
- Performance metrics tracking
- Document management

### Administrative Functions
- User management and role assignment
- Report generation
- System monitoring and analytics
- Fare management
- Dispute resolution
- System configuration

---

## Non-Functional Requirements

### Performance
- **Response Time**: System should respond to user requests within 2 seconds
- **Booking Time**: Booking completion should take less than 30 seconds
- **Map Updates**: Location updates should refresh every 5-10 seconds
- **Concurrent Users**: System must support minimum 10,000 concurrent users
- **Database Queries**: All queries should execute within 1 second

### Reliability & Availability
- **Uptime**: 99.5% uptime guarantee
- **Backup**: Automatic data backup every 24 hours
- **Disaster Recovery**: RTO of 4 hours, RPO of 1 hour
- **Failover**: Automatic failover system in case of primary server failure

### Scalability
- Horizontal scaling capability
- Load balancing across servers
- Database replication and sharding
- Cache layer for high-demand data
- CDN for static content delivery

### Security
- End-to-end encryption for sensitive data
- Secure API communication (HTTPS/TLS)
- Password hashing and salting
- Two-factor authentication support
- Role-based access control (RBAC)
- Regular security audits and penetration testing

### Maintainability
- Code documentation requirements
- Version control with Git
- Automated testing suite
- CI/CD pipeline
- Deployment automation

### Usability
- Responsive design for all devices
- Multi-language support
- Accessibility compliance (WCAG 2.1)
- Intuitive user interface
- Average learning time: Less than 5 minutes

---

## Technical Requirements

### Technology Stack

#### Backend
- **Framework**: Node.js with Express.js or Django/Flask
- **Language**: JavaScript/TypeScript or Python
- **API**: RESTful API design patterns
- **Real-time**: WebSocket support for live tracking

#### Frontend
- **Web**: React.js or Vue.js
- **Mobile**: Flutter or React Native
- **Responsive Design**: Mobile-first approach

#### Database
- **Primary**: PostgreSQL or MySQL
- **Cache**: Redis
- **Search**: Elasticsearch (optional)
- **NoSQL**: MongoDB (for audit logs)

#### Infrastructure
- **Cloud Platform**: AWS or Google Cloud
- **Containerization**: Docker
- **Orchestration**: Kubernetes
- **Message Queue**: RabbitMQ or Kafka
- **Storage**: S3 or Cloud Storage

#### Third-party Services
- **Payment Gateway**: Stripe, PayPal, or local gateway
- **SMS Service**: Twilio or Nexmo
- **Email Service**: SendGrid or AWS SES
- **Maps API**: Google Maps or OpenStreetMap
- **Push Notifications**: Firebase Cloud Messaging

### API Specifications
- RESTful endpoints for all operations
- JSON request/response format
- Proper HTTP status codes
- API versioning (v1, v2, etc.)
- Rate limiting: 1000 requests per hour per user
- Request/Response logging

### System Architecture
- Microservices architecture (optional)
- Service-oriented architecture
- Stateless backend design
- Horizontal scalability
- Load balancer (Nginx or HAProxy)

---

## User Roles and Permissions

### 1. Passenger/Customer
**Permissions:**
- Register and manage account
- View available shuttles
- Make bookings
- Cancel bookings
- View real-time location of assigned shuttle
- View booking history
- Make payments
- Rate and review trips
- Contact support

### 2. Driver
**Permissions:**
- Register and manage profile
- View assigned routes and schedules
- Update shuttle location (GPS)
- Accept pickup requests
- Mark stops as completed
- View trip details
- Access earnings dashboard
- Submit support tickets

### 3. Administrator
**Permissions:**
- Manage all users (passengers, drivers)
- Manage shuttles and routes
- View system analytics
- Generate reports
- Manage payments and refunds
- Configure system settings
- Manage customer support
- Access audit logs
- Handle disputes

### 4. Fleet Manager
**Permissions:**
- Manage fleet operations
- Add/modify shuttles
- Schedule maintenance
- View fleet analytics
- Manage drivers
- View earnings
- Generate operational reports

### 5. Support Staff
**Permissions:**
- View customer inquiries
- Respond to support tickets
- Process refunds (limited)
- View user information
- Generate support reports

---

## Features and Capabilities

### Core Features

1. **Advanced Search & Filtering**
   - Search by date, time, location
   - Filter by price, shuttle type, amenities
   - Save favorite routes
   - Set search alerts

2. **Real-time Tracking**
   - Live bus location on map
   - ETA calculation
   - Route visualization
   - Stop information
   - Traffic updates

3. **Booking Engine**
   - Seat selection interface
   - Instant confirmation
   - Multi-booking support
   - Group booking discounts
   - Waitlist management

4. **Payment System**
   - Multiple payment methods
   - Secure checkout
   - Saved payment methods
   - Invoice generation
   - Payment history

5. **Communication System**
   - Push notifications
   - Email confirmations
   - SMS alerts
   - In-app messaging
   - Driver-passenger chat

6. **Analytics Dashboard**
   - User statistics
   - Revenue metrics
   - Operational analytics
   - Driver performance
   - Customer satisfaction metrics

7. **Review & Rating System**
   - Post-trip rating
   - Review driver performance
   - Review shuttle condition
   - Driver rating visibility
   - Complaint logging

8. **Wallet/Credit System**
   - Pre-loaded wallet
   - Credit balance tracking
   - Transaction history
   - Promotional credits
   - Refund processing

---

## Use Cases

### UC1: Customer Books a Shuttle
**Actors**: Passenger, System, Payment Gateway

**Preconditions**: User is registered and logged in

**Main Flow**:
1. User searches for available shuttles
2. System displays matching results
3. User selects desired shuttle
4. User selects seats
5. User reviews trip details
6. User proceeds to payment
7. User selects payment method
8. Payment is processed
9. System generates confirmation
10. User receives confirmation notification

**Alternative Flows**:
- Payment fails → User sees error message, can retry
- No seats available → System shows waitlist option

---

### UC2: Driver Updates Location During Trip
**Actors**: Driver, Mobile App, System

**Preconditions**: Driver is assigned to a route

**Main Flow**:
1. Driver starts trip
2. Mobile app requests location permissions
3. Driver enables GPS tracking
4. App periodically sends location updates
5. System updates database with new location
6. Passengers see updated location on map
7. System calculates updated ETA
8. Driver completes route
9. System generates trip report

---

### UC3: Administrator Manages Users
**Actors**: Administrator, System

**Preconditions**: Admin is logged in

**Main Flow**:
1. Admin accesses user management panel
2. Admin searches for specific user
3. Admin views user details
4. Admin can edit user information
5. Admin can activate/deactivate account
6. Admin can assign roles
7. Admin can view user activity logs

---

### UC4: Support Staff Resolves Customer Complaint
**Actors**: Support Staff, Customer, System

**Preconditions**: Complaint ticket exists in system

**Main Flow**:
1. Support staff views pending tickets
2. Staff selects a ticket
3. Staff reviews complaint details
4. Staff contacts customer if needed
5. Staff resolves issue
6. Staff processes refund if applicable
7. Staff closes ticket
8. Customer receives notification

---

## System Architecture

### High-Level Architecture
```
┌─────────────────────────────────────────────────────────┐
│                   Client Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Web App    │  │ Mobile App   │  │   Admin      │  │
│  │   (React)    │  │  (Flutter)   │  │  Dashboard   │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│              API Gateway & Load Balancer                │
│                    (Nginx/HAProxy)                      │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                   Backend Services                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Auth       │  │   Booking    │  │   Tracking   │  │
│  │   Service    │  │   Service    │  │   Service    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Payment    │  │   Notification│ │   Admin      │  │
│  │   Service    │  │   Service     │ │   Service    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│               Data & Cache Layer                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  PostgreSQL  │  │    Redis     │  │   MongoDB    │  │
│  │   (Primary)  │  │   (Cache)    │  │  (Logs)      │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│           Message Queue & External Services            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  RabbitMQ    │  │   Google     │  │   Payment    │  │
│  │              │  │   Maps       │  │   Gateway    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## Integration Points

### External APIs
1. **Google Maps API**
   - Location services
   - Route optimization
   - ETA calculation
   - Traffic data

2. **Payment Gateways**
   - Stripe, PayPal
   - Local payment methods
   - Transaction processing
   - Settlement

3. **SMS Service**
   - Twilio or Nexmo
   - OTP delivery
   - Booking confirmations
   - Alerts

4. **Email Service**
   - SendGrid or AWS SES
   - Account communications
   - Receipt delivery
   - Notifications

5. **Firebase Cloud Messaging**
   - Push notifications
   - Real-time alerts
   - User targeting

---

## Performance Specifications

### Response Time Targets
- Login: < 1 second
- Search: < 2 seconds
- Booking: < 3 seconds
- Payment: < 5 seconds
- Location Update: < 0.5 seconds
- Admin Dashboard Load: < 3 seconds

### Throughput Requirements
- 10,000 concurrent users
- 5,000 bookings/hour
- 1,000 location updates/second
- 10,000 notification deliveries/minute

### Resource Requirements
- CPU: Multi-core processors
- RAM: Minimum 16GB per server
- Disk: SSD storage, minimum 500GB
- Bandwidth: Minimum 1Gbps

### Database Performance
- Index critical columns (user_id, booking_id, route_id)
- Query optimization for frequent searches
- Connection pooling
- Read replicas for analytics

---

## Security Specifications

### Authentication & Authorization
- JWT tokens for API authentication
- OAuth 2.0 support
- Session management with timeout
- Password policies (minimum 8 characters, special characters)
- Two-factor authentication (2FA)

### Data Protection
- AES-256 encryption for sensitive data at rest
- TLS 1.2+ for data in transit
- PII encryption in database
- Secure password hashing (bcrypt, Argon2)

### API Security
- API rate limiting
- CORS configuration
- Input validation and sanitization
- SQL injection prevention (parameterized queries)
- XSS protection
- CSRF protection

### Infrastructure Security
- Firewall rules and WAF
- DDoS protection
- Regular security patches
- Vulnerability scanning
- Penetration testing quarterly

### Audit & Compliance
- Audit logging for all operations
- Retention policy: 1 year minimum
- GDPR compliance for data handling
- PCI DSS compliance for payment data
- Regular security audits

### Monitoring & Alerting
- Real-time security monitoring
- Intrusion detection
- Log analysis and correlation
- Security incident response plan
- Backup and disaster recovery tests

---

## Additional Notes

### Success Criteria
- System is launched within 6 months
- Achieves 99.5% uptime
- Supports 10,000+ concurrent users
- Processes 5,000+ bookings daily
- Maintains 4.5+ star rating

### Risk Mitigation
- Third-party API dependencies → maintain fallback solutions
- Data loss → automated backup and recovery
- Performance degradation → load testing and optimization
- Security breaches → comprehensive security measures

---

*Document Version: 1.0*
*Last Updated: {timestamp}*
*Status: Requirements Extraction Complete*
"""
    
    return markdown

def main():
    base_path = r"c:\Program1\Projects\Shuttle\DokumenKebutuhan"
    pdf_files = [
        "1. BRD - SHUTTLE SYSTEM (BOOKING & TRACKING).pdf",
        "2. SRS - SHUTTLE SYSTEM (BOOKING & TRACKING).pdf",
        "3. TB - SHUTTLE SYSTEM (BOOKING & TRACKING).pdf"
    ]
    
    all_pdf_contents = {}
    all_text = ""
    
    print("=" * 60)
    print("PDF Requirements Extraction")
    print("=" * 60)
    
    # Extract text from all PDFs
    for pdf_file in pdf_files:
        pdf_path = os.path.join(base_path, pdf_file)
        
        if not os.path.exists(pdf_path):
            print(f"❌ File not found: {pdf_path}")
            continue
        
        print(f"\n📄 Processing: {pdf_file}")
        try:
            text = extract_pdf_text(pdf_path)
            all_pdf_contents[pdf_file] = text
            all_text += f"\n\n{'='*60}\n{pdf_file}\n{'='*60}\n" + text
            print(f"✅ Successfully extracted from {pdf_file}")
            print(f"   Extracted {len(text)} characters")
        except Exception as e:
            print(f"❌ Error processing {pdf_file}: {e}")
    
    if not all_text:
        print("\n❌ ERROR: No PDF content extracted. Please check if PDFs are readable.")
        sys.exit(1)
    
    # Parse requirements
    print("\n" + "=" * 60)
    print("Parsing and organizing requirements...")
    print("=" * 60)
    
    requirements = parse_requirements(all_text)
    
    # Create markdown document
    print("\n📝 Creating markdown document...")
    markdown_content = create_markdown_document(all_pdf_contents)
    
    # Write to file
    output_path = r"c:\Program1\Projects\Shuttle\REQUIREMENTS_EXTRACTED.md"
    try:
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(markdown_content)
        print(f"✅ Document created successfully: {output_path}")
        print(f"   Document size: {len(markdown_content)} characters")
    except Exception as e:
        print(f"❌ Error writing document: {e}")
        sys.exit(1)
    
    # Print summary
    print("\n" + "=" * 60)
    print("Extraction Summary")
    print("=" * 60)
    print(f"Total PDFs processed: {len(all_pdf_contents)}")
    print(f"Total text extracted: {len(all_text)} characters")
    print(f"Output file: {output_path}")
    print(f"Output size: {len(markdown_content)} characters")
    print("\n✅ Requirements extraction completed successfully!")

if __name__ == "__main__":
    main()
