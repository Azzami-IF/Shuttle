#!/usr/bin/env python3
"""Extract requirements from PDF documents"""

import sys
import os

# Try different PDF libraries
def extract_with_pdfplumber():
    try:
        import pdfplumber
        return True, pdfplumber
    except ImportError:
        return False, None

def extract_with_pypdf():
    try:
        import PyPDF2
        return True, PyPDF2
    except ImportError:
        return False, None

def extract_with_pdfminer():
    try:
        from pdfminer.high_level import extract_text
        return True, extract_text
    except ImportError:
        return False, None

def extract_text_pdfplumber(pdf_path):
    """Extract text using pdfplumber"""
    import pdfplumber
    text = []
    try:
        with pdfplumber.open(pdf_path) as pdf:
            for i, page in enumerate(pdf.pages):
                text.append(f"\n--- Page {i+1} ---\n")
                page_text = page.extract_text()
                if page_text:
                    text.append(page_text)
    except Exception as e:
        print(f"Error with pdfplumber: {e}")
        return None
    return "".join(text)

def extract_text_pypdf(pdf_path):
    """Extract text using PyPDF2"""
    import PyPDF2
    text = []
    try:
        with open(pdf_path, 'rb') as file:
            reader = PyPDF2.PdfReader(file)
            for i, page in enumerate(reader.pages):
                text.append(f"\n--- Page {i+1} ---\n")
                page_text = page.extract_text()
                if page_text:
                    text.append(page_text)
    except Exception as e:
        print(f"Error with PyPDF2: {e}")
        return None
    return "".join(text)

def extract_text_pdfminer(pdf_path):
    """Extract text using pdfminer"""
    from pdfminer.high_level import extract_text
    try:
        text = extract_text(pdf_path)
        return text
    except Exception as e:
        print(f"Error with pdfminer: {e}")
        return None

def main():
    pdf_files = [
        r"c:\Program1\Projects\Shuttle\DokumenKebutuhan\1. BRD - SHUTTLE SYSTEM (BOOKING & TRACKING).pdf",
        r"c:\Program1\Projects\Shuttle\DokumenKebutuhan\2. SRS - SHUTTLE SYSTEM (BOOKING & TRACKING).pdf",
        r"c:\Program1\Projects\Shuttle\DokumenKebutuhan\3. TB - SHUTTLE SYSTEM (BOOKING & TRACKING).pdf"
    ]
    
    results = {}
    
    # Try pdfplumber first
    has_pdfplumber, _ = extract_with_pdfplumber()
    if has_pdfplumber:
        print("Using pdfplumber...")
        for pdf_file in pdf_files:
            if os.path.exists(pdf_file):
                print(f"Extracting: {pdf_file}")
                text = extract_text_pdfplumber(pdf_file)
                if text:
                    results[pdf_file] = text
            else:
                print(f"File not found: {pdf_file}")
    else:
        # Try PyPDF2
        has_pypdf, _ = extract_with_pypdf()
        if has_pypdf:
            print("Using PyPDF2...")
            for pdf_file in pdf_files:
                if os.path.exists(pdf_file):
                    print(f"Extracting: {pdf_file}")
                    text = extract_text_pypdf(pdf_file)
                    if text:
                        results[pdf_file] = text
                else:
                    print(f"File not found: {pdf_file}")
        else:
            # Try pdfminer
            has_pdfminer, _ = extract_with_pdfminer()
            if has_pdfminer:
                print("Using pdfminer...")
                for pdf_file in pdf_files:
                    if os.path.exists(pdf_file):
                        print(f"Extracting: {pdf_file}")
                        text = extract_text_pdfminer(pdf_file)
                        if text:
                            results[pdf_file] = text
                    else:
                        print(f"File not found: {pdf_file}")
            else:
                print("No PDF extraction library available!")
                print("Install: pip install pdfplumber")
                sys.exit(1)
    
    # Save extracted content
    output_dir = r"c:\Program1\Projects\Shuttle"
    output_file = os.path.join(output_dir, "extracted_pdf_content.txt")
    
    with open(output_file, 'w', encoding='utf-8') as f:
        for pdf_file, content in results.items():
            f.write(f"\n\n{'='*80}\n")
            f.write(f"FILE: {pdf_file}\n")
            f.write(f"{'='*80}\n\n")
            f.write(content)
    
    print(f"\nExtracted content saved to: {output_file}")
    print(f"Successfully extracted from {len(results)} PDF files")

if __name__ == "__main__":
    main()
