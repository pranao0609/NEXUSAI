import logging
import re
import PyPDF2
from typing import List, Dict, Any, Optional
from groq import Groq

from config.settings import settings

logger = logging.getLogger(__name__)

class EducationEvaluator:
    def __init__(self):
        self.groq_client = Groq(api_key=settings.GROQ_API_KEY)
    
    async def evaluate_answers(self, pdf_path: str) -> Dict[str, Any]:
        """
        Extract questions and answers from PDF, then evaluate
        PDF should contain both questions and user answers
        """
        try:
            # Extract content from PDF
            pdf_content = self._extract_pdf_content(pdf_path)
            
            # Parse questions and answers from PDF
            parsed_data = await self._parse_questions_and_answers(pdf_content)
            
            if not parsed_data['questions']:
                return {
                    'total_questions': 0,
                    'correct_answers': 0,
                    'score_percentage': 0.0,
                    'detailed_results': [],
                    'overall_feedback': 'No questions found in PDF'
                }
            
            # Evaluate the answers
            evaluation = await self._evaluate_parsed_answers(
                parsed_data['questions'], 
                parsed_data['user_answers']
            )
            
            return evaluation
            
        except Exception as e:
            logger.error(f"Evaluation failed: {e}")
            return {
                'total_questions': 0,
                'correct_answers': 0,
                'score_percentage': 0.0,
                'detailed_results': [],
                'overall_feedback': f'Error: {str(e)}'
            }
    
    def _extract_pdf_content(self, pdf_path: str) -> str:
        """Extract text content from PDF"""
        try:
            with open(pdf_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                full_text = ""
                
                for page in pdf_reader.pages:
                    text = page.extract_text()
                    if text:
                        full_text += text + "\n"
                        
                return full_text
        except Exception as e:
            logger.error(f"PDF extraction failed: {e}")
            raise
    
    async def _parse_questions_and_answers(self, pdf_content: str) -> Dict[str, Any]:
        """
        Parse questions and user answers from PDF content using AI
        """
        try:
            prompt = f"""
            Extract multiple choice questions and user answers from this educational content.
            Look for:
            1. Questions with multiple choice options (A, B, C, D)
            2. User answers or marked/selected options
            3. Correct answers if provided
            
            Return the data in this JSON format:
            {{
                "questions": [
                    {{
                        "question": "Question text",
                        "options": {{
                            "A": "Option A text",
                            "B": "Option B text", 
                            "C": "Option C text",
                            "D": "Option D text"
                        }},
                        "correct_answer": "A",
                        "user_answer": "B"
                    }}
                ],
                "user_answers": ["A", "B", "C"]
            }}
            
            Content to parse:
            {pdf_content}
            """
            
            response = self.groq_client.chat.completions.create(
                model=settings.GROQ_MODEL,
                messages=[
                    {
                        "role": "system", 
                        "content": "You are an expert at parsing educational documents. Extract questions and answers accurately."
                    },
                    {"role": "user", "content": prompt}
                ],
                temperature=0.1,
                max_tokens=2000
            )
            
            # Parse the JSON response
            import json
            result = json.loads(response.choices[0].message.content)
            return result
            
        except Exception as e:
            logger.error(f"Question parsing failed: {e}")
            # Fallback: try simple regex parsing
            return self._fallback_parse(pdf_content)
    
    def _fallback_parse(self, content: str) -> Dict[str, Any]:
        """Fallback parser using regex patterns"""
        questions = []
        
        # Simple pattern to find questions and options
        question_pattern = r'(?:Question\s*\d*[:.]?\s*)(.*?)(?=Question\s*\d*[:.]?|$)'
        matches = re.finditer(question_pattern, content, re.DOTALL | re.IGNORECASE)
        
        for match in matches:
            question_text = match.group(1).strip()
            if len(question_text) < 10:  # Skip very short matches
                continue
                
            # Extract options
            options = {}
            for option in ['A', 'B', 'C', 'D']:
                option_pattern = rf'{option}[).]?\s*([^A-D\n]*?)(?=[A-D][).]|\n|$)'
                option_match = re.search(option_pattern, question_text, re.IGNORECASE)
                if option_match:
                    options[option] = option_match.group(1).strip()
            
            if len(options) >= 2:  # At least 2 options found
                questions.append({
                    'question': question_text.split('\n')[0],
                    'options': options,
                    'correct_answer': 'A',  # Default
                    'user_answer': 'A'      # Default
                })
        
        return {
            'questions': questions,
            'user_answers': ['A'] * len(questions)
        }
    
    async def _evaluate_parsed_answers(self, questions: List[Dict], 
                                     user_answers: List[str]) -> Dict[str, Any]:
        """Evaluate the parsed questions and answers"""
        correct_count = 0
        detailed_results = []
        
        for i, question in enumerate(questions):
            user_answer = user_answers[i] if i < len(user_answers) else question.get('user_answer', 'A')
            correct_answer = question.get('correct_answer', 'A')
            is_correct = user_answer.upper() == correct_answer.upper()
            
            if is_correct:
                correct_count += 1
            
            detailed_results.append({
                'question_number': i + 1,
                'question': question.get('question', ''),
                'user_answer': user_answer,
                'correct_answer': correct_answer,
                'is_correct': is_correct,
                'options': question.get('options', {}),
                'feedback': 'Correct!' if is_correct else f'Incorrect. The correct answer is {correct_answer}.'
            })
        
        total_questions = len(questions)
        score_percentage = (correct_count / total_questions * 100) if total_questions > 0 else 0
        
        # Generate overall feedback
        overall_feedback = await self._generate_overall_feedback(
            total_questions, correct_count, score_percentage
        )
        
        return {
            'total_questions': total_questions,
            'correct_answers': correct_count,
            'score_percentage': round(score_percentage, 2),
            'detailed_results': detailed_results,
            'overall_feedback': overall_feedback
        }
    
    async def _generate_overall_feedback(self, total: int, correct: int, 
                                       percentage: float) -> str:
        """Generate encouraging overall feedback"""
        try:
            prompt = f"""
            A student completed a quiz with these results:
            - Total questions: {total}
            - Correct answers: {correct}
            - Score: {percentage:.1f}%
            
            Provide encouraging, constructive feedback in 2-3 sentences.
            Be positive and suggest improvement strategies if needed.
            """
            
            response = self.groq_client.chat.completions.create(
                model=settings.GROQ_MODEL,
                messages=[
                    {"role": "system", "content": "You are a supportive educational tutor."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.5,
                max_tokens=100
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            logger.error(f"Feedback generation failed: {e}")
            if percentage >= 80:
                return "Excellent work! You've demonstrated strong understanding of the material."
            elif percentage >= 60:
                return "Good effort! Review the areas where you missed questions to strengthen your knowledge."
            else:
                return "Keep practicing! Focus on understanding the key concepts and try again."

# Global evaluator instance
evaluator = EducationEvaluator()