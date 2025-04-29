import streamlit as st
import pandas as pd
import re
import base64
from io import BytesIO
import pytesseract
from PIL import Image
import pdf2image
import tempfile
import os

class ResumeAnalyzer:
    def __init__(self):
        if 'resume_keywords' not in st.session_state:
            st.session_state.resume_keywords = {}
        if 'analyzed_resumes' not in st.session_state:
            st.session_state.analyzed_resumes = []

    def extract_text_from_pdf(self, pdf_file):
        """Extract text from a PDF file using OCR."""
        try:
            
            with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as temp_pdf:
                temp_pdf.write(pdf_file.getvalue())
                temp_pdf_path = temp_pdf.name

            
            images = pdf2image.convert_from_path(temp_pdf_path, dpi=300)
            
            
            os.unlink(temp_pdf_path)
            
            
            extracted_text = ""
            for img in images:
                extracted_text += pytesseract.image_to_string(img)
                
            return extracted_text
        except Exception as e:
            st.error(f"Error extracting text from PDF: {e}")
            return ""

    def analyze_resume(self, candidate_name, resume_text):
        """Analyze the resume text against the defined keywords."""
        results = {
            'candidate_name': candidate_name,
            'matches': [],
            'total_keywords': 0,
            'matched_keywords': 0,
            'score': 0,
            'score_percentage': 0,
            'resume_text': resume_text,
        }
        
        if not st.session_state.resume_keywords:
            return results
        
        total_weight = sum([kw['weight'] for kw in st.session_state.resume_keywords.values()])
        matched_weight = 0
        matches = []
        
        for keyword, data in st.session_state.resume_keywords.items():
            
            pattern = r'\b' + re.escape(keyword.lower()) + r'\b'
            occurrences = len(re.findall(pattern, resume_text.lower()))
            
            if occurrences > 0:
                matched_weight += data['weight']
                matches.append({
                    'keyword': keyword,
                    'category': data['category'],
                    'weight': data['weight'],
                    'occurrences': occurrences
                })
        
        
        results['matches'] = matches
        results['total_keywords'] = len(st.session_state.resume_keywords)
        results['matched_keywords'] = len(matches)
        
        
        if total_weight > 0:
            results['score'] = matched_weight
            results['score_percentage'] = round((matched_weight / total_weight) * 100, 2)
        
        
        existing_index = next((i for i, d in enumerate(st.session_state.analyzed_resumes) 
                             if d['candidate_name'] == candidate_name), None)
        
        if existing_index is not None:
        
            st.session_state.analyzed_resumes[existing_index] = results
        else:
            
            st.session_state.analyzed_resumes.append(results)
            
        return results

    def show_resume_uploader(self):
        """Display the resume upload interface."""
        st.subheader("Resume Analysis")
        
        candidate_name = st.text_input("Candidate Name")
        uploaded_file = st.file_uploader("Upload Resume (PDF format)", type="pdf")
        
        if uploaded_file is not None and candidate_name:
            with st.spinner("Extracting text from PDF..."):
                
                resume_text = self.extract_text_from_pdf(uploaded_file)
                
                if resume_text:
                    st.success("Text extracted successfully!")
                    
                    
                    with st.expander("View Extracted Text"):
                        st.text_area("Extracted Text", resume_text, height=300, disabled=True)
                    
                    
                    if st.button("Analyze Resume"):
                        with st.spinner("Analyzing resume..."):
                            results = self.analyze_resume(candidate_name, resume_text)
                            st.session_state.current_analysis = results
                            self.show_analysis_results(results)
                else:
                    st.error("Could not extract any text from the uploaded PDF. Please try a different file.")
        elif uploaded_file is not None and not candidate_name:
            st.warning("Please enter the candidate's name before uploading a resume.")

    def show_analysis_results(self, results):
        """Display the analysis results."""
        st.subheader(f"Analysis Results for {results['candidate_name']}")
        
        
        st.metric("Keywords Found", f"{results['matched_keywords']} out of {results['total_keywords']}")
        
        
        st.progress(results['score_percentage'] / 100)
        st.caption(f"{results['score_percentage']}% match")
        
        
        if results['matches']:
            st.write("### Matched Keywords")
            
            
            matched_keywords = [match['keyword'] for match in results['matches']]
            matched_keywords.sort()
            
            keywords_text = ", ".join(matched_keywords)
            st.write(f"**Found keywords:** {keywords_text}")
        else:
            st.warning("No matching keywords found in the resume.")

    def manage_keywords(self):
        """Admin interface for managing keywords."""
        st.subheader("Resume Keyword Management")
        
        
        st.write("Enter keywords that will be searched for in resumes")
        
        
        keyword = st.text_input("Keyword").strip()
        
        if st.button("Add Keyword") and keyword:
            if keyword.lower() in st.session_state.resume_keywords:
                st.error(f"Keyword '{keyword}' already exists!")
            else:
                
                st.session_state.resume_keywords[keyword.lower()] = {
                    'category': 'Keyword',
                    'weight': 1
                }
                st.success(f"Added keyword: {keyword}")
                st.rerun()
        
        
        if st.session_state.resume_keywords:
            st.subheader("Current Keywords")
            
            
            keywords_list = list(st.session_state.resume_keywords.keys())
            keywords_list.sort()
            
            
            keywords_text = ", ".join(keywords_list)
            st.write(f"**Current keywords:** {keywords_text}")
            
            
            if keywords_list:
                keyword_to_delete = st.selectbox("Select keyword to delete", keywords_list)
                if st.button("Delete Selected Keyword"):
                    del st.session_state.resume_keywords[keyword_to_delete]
                    st.success(f"Deleted keyword: {keyword_to_delete}")
                    st.rerun()
            
            
            if st.button("Clear All Keywords"):
                st.session_state.resume_keywords = {}
                st.success("All keywords cleared!")
                st.rerun()
        else:
            st.info("No keywords defined yet. Add some keywords to get started!")
            
            
            if st.button("Add Sample Keywords"):
                sample_keywords = {
                    'python': {'category': 'Keyword', 'weight': 1},
                    'javascript': {'category': 'Keyword', 'weight': 1},
                    'react': {'category': 'Keyword', 'weight': 1},
                    'data analysis': {'category': 'Keyword', 'weight': 1},
                    'machine learning': {'category': 'Keyword', 'weight': 1},
                    'communication': {'category': 'Keyword', 'weight': 1},
                    'teamwork': {'category': 'Keyword', 'weight': 1},
                    'problem solving': {'category': 'Keyword', 'weight': 1},
                    'bachelor': {'category': 'Keyword', 'weight': 1},
                    'master': {'category': 'Keyword', 'weight': 1}
                }
                st.session_state.resume_keywords = sample_keywords
                st.success("Added 10 sample keywords!")
                st.rerun()

    def view_analyzed_resumes(self):
        """View all analyzed resumes with simple display."""
        st.subheader("Analyzed Resumes")
        
        if not st.session_state.analyzed_resumes:
            st.info("No resumes have been analyzed yet.")
            return
        
    
        analyzed_data = []
        for resume in st.session_state.analyzed_resumes:
            analyzed_data.append({
                'candidate_name': resume['candidate_name'],
                'matched_keywords': resume['matched_keywords'],
                'total_keywords': resume['total_keywords'],
                'match_percentage': resume['score_percentage']
            })
        
        y
        df = pd.DataFrame(analyzed_data)
        
       
        df = df.sort_values(by='match_percentage', ascending=False)
        
        
        st.write("### Results")
        
        st.dataframe(
            df,
            column_config={
                "candidate_name": "Candidate Name",
                "matched_keywords": "Keywords Found",
                "total_keywords": "Total Keywords",
                "match_percentage": st.column_config.NumberColumn(
                    "Match %",
                    format="%.1f%%"
                )
            },
            hide_index=True,
            use_container_width=True
        )
        
        
        if df.shape[0] > 0:
            st.write("### View Resume Details")
            selected_candidate = st.selectbox(
                "Select a resume to view details", 
                df['candidate_name'].tolist()
            )
            
            selected_resume = next((r for r in st.session_state.analyzed_resumes 
                                  if r['candidate_name'] == selected_candidate), None)
            
            if selected_resume:
                
                st.metric("Match Rate", f"{selected_resume['score_percentage']:.1f}%")
                
                
                st.write("#### Keywords Found")
                if selected_resume['matches']:
                    
                    keywords_found = [match['keyword'] for match in selected_resume['matches']]
                    keywords_found.sort()
                    
                    st.write(f"Found {len(keywords_found)} keywords: {', '.join(keywords_found)}")
                else:
                    st.warning("No keywords found in this resume.")
                
                
                with st.expander("View Resume Text"):
                    st.text_area("Extracted Text", selected_resume['resume_text'], height=300, disabled=True)
                
               
                if st.button("Delete This Analysis"):
                    st.session_state.analyzed_resumes = [
                        r for r in st.session_state.analyzed_resumes 
                        if r['candidate_name'] != selected_candidate
                    ]
                    st.success(f"Deleted analysis for {selected_candidate}")
                    st.rerun()
