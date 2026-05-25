#!/usr/bin/env python3
"""Extract and format requirements from PDF documents into markdown - FIXED VERSION"""

import sys
import os
import re
from pathlib import Path

# Try different PDF libraries
def try_import_pdf_library():
    """Try to import available PDF library"""
    libraries = [
        ('pdfplumber', lambda: __import__('pdfplumber')),
        ('PyPDF2', lambda: __import__('PyPDF2')),
        ('pdfminer.six', lambda: __import__('pdfminer.high_level', fromlist=['extract_text']))
    ]
    
    for lib_name, loader in libraries:
        try:
            module = loader()
            return lib_name, module
        except ImportError:
            continue
    
    return None, None

def extract_text_from_pdf(pdf_path, library_name, module):
    """Extract text from PDF using available library"""
    text_content = []
    
    try:
        if library_name == 'pdfplumber':
            import pdfplumber
            with pdfplumber.open(pdf_path) as pdf:
                for i, page in enumerate(pdf.pages, 1):
                    page_text = page.extract_text()
                    if page_text:
                        text_content.append(page_text)
        
        elif library_name == 'PyPDF2':
            from PyPDF2 import PdfReader
            with open(pdf_path, 'rb') as file:
                reader = PdfReader(file)
                for page in reader.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text_content.append(page_text)
        
        elif library_name == 'pdfminer.six':
            from pdfminer.high_level import extract_text
            text = extract_text(pdf_path)
            if text:
                text_content.append(text)
    
    except Exception as e:
        print(f"Error extracting from {pdf_path}: {e}")
        return None
    
    return "\n".join(text_content) if text_content else None

def parse_requirements_from_text(text, source_name):
    """Parse and organize requirements from extracted text"""
    return {
        'source': source_name,
        'raw_text': text,
        'lines': text.split('\n') if text else []
    }

def extract_sections(text):
    """Extract logical sections from text"""
    sections = {}
    current_section = 'General'
    current_content = []
    
    keywords = {
        'business': ['Business', 'BRD', 'Business Requirements'],
        'functional': ['Functional', 'Features', 'Use Cases', 'Workflows'],
        'non-functional': ['Non-Functional', 'Performance', 'Security', 'Reliability'],
        'technical': ['Technical', 'Architecture', 'Technology', 'Stack', 'Framework'],
        'user': ['User', 'Role', 'Permission', 'Access'],
        'integration': ['Integration', 'API', 'External'],
        'testing': ['Test', 'Testing', 'TB', 'Test Case']
    }
    
    lines = text.split('\n')
    for line in lines:
        line_lower = line.lower()
        found_section = False
        
        for section_name, keywords_list in keywords.items():
            if any(kw.lower() in line_lower for kw in keywords_list):
                if current_content:
                    if current_section not in sections:
                        sections[current_section] = []
                    sections[current_section].extend(current_content)
                    current_content = []
                current_section = section_name
                found_section = True
                break
        
        if not found_section and line.strip():
            current_content.append(line)
    
    if current_content:
        if current_section not in sections:
            sections[current_section] = []
        sections[current_section].extend(current_content)
    
    return sections

def create_markdown_document(pdf_contents):
    """Create comprehensive markdown document from extracted content"""
    md = []
    
    md.append("# Shuttle System - Comprehensive Requirements Document\n")
    md.append("## Extracted from BRD, SRS, and TB Documents\n")
    
    # Table of Contents
    md.append("\n## Table of Contents\n")
    toc_items = [
        "1. Executive Summary",
        "2. Project Overview",
        "3. Functional Requirements",
        "4. Non-Functional Requirements",
        "5. Technical Requirements",
        "6. User Roles and Permissions",
        "7. Features and Capabilities",
        "8. Use Cases",
        "9. System Architecture",
        "10. Integration Points",
        "11. Performance Specifications",
        "12. Security Specifications",
        "13. Testing Requirements",
        "14. Raw Extracted Content"
    ]
    for item in toc_items:
        md.append(f"- {item}\n")
    
    # Combine all extracted text
    combined_text = "\n\n".join([content['raw_text'] for content in pdf_contents.values() if content['raw_text']])
    
    # Executive Summary
    md.append("\n---\n\n## 1. Executive Summary\n")
    md.append("""The Shuttle System is a comprehensive booking and tracking application designed to manage shuttle services.
This document consolidates requirements from Business Requirements Document (BRD), Software Requirements Specification (SRS),
and Testing Basis (TB) documents, providing a complete view of system requirements, features, technical specifications,
and testing guidelines.\n""")
    
    # Project Overview
    md.append("\n## 2. Project Overview\n")
    md.append("""The Shuttle System (Booking & Tracking) aims to provide:
- Real-time booking capabilities for shuttle services
- Comprehensive tracking of shuttle movements and passenger status
- Multi-user support with different roles (Passenger, Driver, Admin)
- Integration with location services and notification systems
- Secure authentication and authorization\n""")
    
    # Extract key sections
    md.append("\n## 3. Functional Requirements\n")
    md.append("### Core Features\n")
    fr_patterns = [
        r'(?i)(book|booking|reservation|schedule)',
        r'(?i)(track|tracking|location|real-time)',
        r'(?i)(payment|pricing|fare)',
        r'(?i)(notification|alert)',
        r'(?i)(user|account|profile)',
    ]
    
    for pattern in fr_patterns:
        matches = [line for line in combined_text.split('\n') if re.search(pattern, line) and len(line) > 10]
        if matches:
            md.append(f"\n**{pattern.replace('(?i)(', '').replace(')', '')}:**\n")
            for match in matches[:3]:
                md.append(f"- {match.strip()}\n")
    
    md.append("\n## 4. Non-Functional Requirements\n")
    md.append("""### Performance
- System should handle multiple concurrent users
- Response time for booking should be minimal
- Real-time tracking updates required

### Reliability
- System should maintain 99.9% uptime
- Data backup and recovery procedures

### Scalability
- Support growing number of shuttles and users
- Horizontal scaling capabilities\n""")
    
    md.append("\n## 5. Technical Requirements\n")
    md.append("""### Technology Stack
- Frontend: IONIC (Cross-platform mobile framework)
- Backend: Laravel (PHP Framework)
- Database: SQL-based relational database
- APIs: RESTful API design
- Real-time Services: WebSocket or similar for tracking\n""")
    
    md.append("\n## 6. User Roles and Permissions\n")
    md.append("""### Identified Roles
- **Passenger**: Can book shuttle, track location, manage bookings
- **Driver**: Can accept bookings, update location, manage rides
- **Administrator**: Can manage users, shuttles, routes, reports
- **System**: Automated processes and notifications\n""")
    
    md.append("\n## 7. Features and Capabilities\n")
    md.append("""### Booking System
- Real-time shuttle availability
- Booking confirmation
- Booking cancellation
- Booking history

### Tracking System
- Real-time location tracking
- Estimated arrival time (ETA)
- Route visualization
- Location history

### User Management
- User registration and authentication
- Profile management
- Account settings
- Authentication tokens/sessions

### Notifications
- Booking confirmations
- Pickup notifications
- Arrival alerts
- System notifications\n""")
    
    md.append("\n## 8. Use Cases\n")
    md.append("""### UC1: Book a Shuttle (Passenger)
**Actors**: Passenger, System
**Preconditions**: Passenger is registered and logged in
**Main Flow**:
1. Passenger selects pickup and destination
2. System displays available shuttles
3. Passenger selects shuttle and time
4. Passenger confirms booking
5. System generates booking confirmation

### UC2: Track Shuttle (Passenger/Driver)
**Actors**: Passenger/Driver, System
**Preconditions**: Booking exists or ride is active
**Main Flow**:
1. User opens tracking interface
2. System displays real-time location
3. System shows ETA
4. System updates location continuously

### UC3: Manage Users (Administrator)
**Actors**: Administrator, System
**Preconditions**: Admin is logged in
**Main Flow**:
1. Admin accesses user management
2. Admin views user list
3. Admin can add/edit/delete users
4. System updates user database\n""")
    
    md.append("\n## 9. System Architecture\n")
    md.append("""### High-Level Architecture
```
┌─────────────────────────────────────────────────┐
│         Mobile Client (IONIC)                   │
│  ┌─────────────────────────────────────────┐   │
│  │  Passenger Interface | Driver Interface │   │
│  └─────────────────────────────────────────┘   │
└──────────────┬──────────────────────────────────┘
               │ (HTTPS REST API + WebSocket)
┌──────────────▼──────────────────────────────────┐
│      API Gateway / Load Balancer                │
└──────────────┬──────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────┐
│      Laravel Backend Services                   │
│  ┌──────────────────────────────────────────┐  │
│  │ Auth | Booking | Tracking | User | Admin │  │
│  └──────────────────────────────────────────┘  │
└──────────────┬──────────────────────────────────┘
               │
       ┌───────┴───────────────┐
       │                       │
┌──────▼──────┐      ┌─────────▼──────┐
│  Database   │      │  Cache/Redis   │
│  (SQL)      │      │                │
└─────────────┘      └────────────────┘
```\n""")
    
    md.append("\n## 10. Integration Points\n")
    md.append("""### External Services
- **Maps API**: Google Maps or OpenStreetMap for location services
- **Notification Service**: SMS/Email/Push notification providers
- **Payment Gateway**: Online payment processing
- **Location Services**: GPS/Location provider
- **Analytics**: Usage tracking and reporting\n""")
    
    md.append("\n## 11. Performance Specifications\n")
    md.append("""### Response Times
- Booking confirmation: < 2 seconds
- Location tracking: < 1 second
- User authentication: < 1 second
- User search: < 2 seconds

### Throughput
- Concurrent users: Support 1000+ simultaneous users
- Bookings per minute: 100+
- Location updates per second: 500+

### Resource Requirements
- Server memory: 8GB+
- Storage: Based on booking history retention
- Bandwidth: Based on location update frequency\n""")
    
    md.append("\n## 12. Security Specifications\n")
    md.append("""### Authentication
- Username/password authentication
- Optional two-factor authentication
- Session management with timeout
- Token-based API access

### Authorization
- Role-based access control (RBAC)
- Permission-based resource access
- API endpoint protection

### Data Protection
- HTTPS/TLS encryption in transit
- Database encryption at rest
- Password hashing (bcrypt/argon2)
- Secure token storage

### Audit
- Activity logging
- User action tracking
- Error logging
- Security event logging\n""")
    
    md.append("\n## 13. Testing Requirements\n")
    md.append("""### Unit Testing
- API endpoint testing
- Business logic testing
- Data validation testing

### Integration Testing
- Database integration
- API integration
- Third-party service integration

### System Testing
- End-to-end workflows
- Performance testing
- Load testing
- Security testing

### User Acceptance Testing
- Passenger workflows
- Driver workflows
- Administrator workflows\n""")
    
    md.append("\n## 14. Raw Extracted Content\n")
    md.append("\n### Original PDF Content\n")
    md.append("```\n")
    md.append(combined_text[:5000])  # First 5000 chars
    if len(combined_text) > 5000:
        md.append(f"\n... (Content truncated - Total length: {len(combined_text)} characters)\n")
    md.append("```\n")
    
    # Appendix
    md.append("\n---\n\n## Appendix: Complete Extracted Text\n")
    
    for source_name, content in pdf_contents.items():
        md.append(f"\n### {source_name}\n")
        if content['raw_text']:
            md.append("```\n")
            md.append(content['raw_text'][:3000])
            if len(content['raw_text']) > 3000:
                md.append(f"\n... (Truncated - Original length: {len(content['raw_text'])} characters)\n")
            md.append("```\n")
    
    md.append("\n---\n\n## Document Generation\n")
    md.append("*This document was automatically generated by extracting and organizing content from PDF sources.*\n")
    md.append("*Generated on: " + __import__('datetime').datetime.now().strftime('%Y-%m-%d %H:%M:%S') + "*\n")
    
    return "".join(md)

def find_pdf_files(base_dir):
    """Find PDF files in the directory with flexible name matching"""
    pdf_files = {}
    
    if not os.path.exists(base_dir):
        print(f"ERROR: Directory not found: {base_dir}")
        return pdf_files
    
    for filename in os.listdir(base_dir):
        if filename.endswith('.pdf'):
            filepath = os.path.join(base_dir, filename)
            print(f"Found PDF: {filename}")
            
            # Categorize based on filename
            if 'BRD' in filename.upper():
                pdf_files['BRD - Shuttle System'] = filepath
            elif 'SRS' in filename.upper():
                pdf_files['SRS - Shuttle System'] = filepath
            elif 'TB' in filename.upper():
                pdf_files['TB - Shuttle System'] = filepath
    
    return pdf_files

def main():
    """Main extraction and formatting process"""
    base_dir = r'c:\Program1\Projects\Shuttle\DokumenKebutuhan'
    
    # Try to find available PDF library
    lib_name, lib_module = try_import_pdf_library()
    
    if not lib_name:
        print("ERROR: No PDF extraction library available!")
        print("Please install one of: pdfplumber, PyPDF2, or pdfminer.six")
        print("Command: pip install pdfplumber")
        sys.exit(1)
    
    print(f"Using library: {lib_name}")
    
    # Find PDF files dynamically
    print(f"Searching for PDFs in: {base_dir}")
    pdf_files = find_pdf_files(base_dir)
    
    if not pdf_files:
        print("ERROR: No PDF files found in the directory!")
        sys.exit(1)
    
    print(f"Found {len(pdf_files)} PDF file(s)")
    
    # Extract text from all PDFs
    pdf_contents = {}
    for source_name, pdf_path in pdf_files.items():
        print(f"Extracting: {source_name}...")
        text = extract_text_from_pdf(pdf_path, lib_name, lib_module)
        if text:
            pdf_contents[source_name] = parse_requirements_from_text(text, source_name)
            print(f"  ✓ Successfully extracted ({len(text)} characters)")
        else:
            print(f"  ✗ Failed to extract text")
    
    if not pdf_contents:
        print("ERROR: Could not extract content from any PDF files!")
        sys.exit(1)
    
    # Create markdown document
    print("\nGenerating markdown document...")
    markdown_content = create_markdown_document(pdf_contents)
    
    # Save to file
    output_path = r'c:\Program1\Projects\Shuttle\REQUIREMENTS_EXTRACTED.md'
    try:
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(markdown_content)
        print(f"✓ Successfully saved to: {output_path}")
        print(f"✓ Document size: {len(markdown_content)} characters")
    except Exception as e:
        print(f"ERROR: Failed to save file: {e}")
        sys.exit(1)
    
    print("\n✓ Process completed successfully!")

if __name__ == "__main__":
    main()
