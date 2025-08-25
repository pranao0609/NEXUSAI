# agents/education/mcq_generator.py
import logging
import re
import random
from typing import List, Dict, Any, Optional
from groq import Groq

from config.settings import settings

logger = logging.getLogger(__name__)

class MCQGenerator:
    def __init__(self):
        self.groq_client = Groq(api_key=settings.GROQ_API_KEY)
    
    async def generate_mcqs(self, context: str, num_questions: int = 5, 
                          difficulty: str = "medium") -> List[Dict[str, Any]]:
        """Generate multiple choice questions from educational content"""
        try:
            prompt = self._create_mcq_prompt(context, num_questions, difficulty)
            
            response = self.groq_client.chat.completions.create(
                model=settings.GROQ_MODEL,
                messages=[
                    {
                        "role": "system", 
                        "content": "You are an expert educational content creator. Generate high-quality multiple choice questions based on the provided educational content."
                    },
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=2000
            )
            
            mcq_text = response.choices[0].message.content
            return self._parse_mcqs(mcq_text, num_questions)
            
        except Exception as e:
            logger.error(f"MCQ generation failed: {e}")
            return []
    
    def _create_mcq_prompt(self, context: str, num_questions: int, difficulty: str) -> str:
        """Create prompt for MCQ generation"""
        return f"""
        Based on the following educational content, generate {num_questions} high-quality multiple choice questions with {difficulty} difficulty level.

        REQUIREMENTS:
        1. Each question should have a clear stem
        2. Provide 4 options (A, B, C, D) for each question
        3. Mark the correct answer with (Correct) after the option
        4. Include a brief explanation for the correct answer
        5. Questions should test understanding, not just memorization
        6. Make options plausible but distinct

        FORMAT EACH QUESTION LIKE THIS:
        Question X: [Question text]
        A) [Option A]
        B) [Option B]
        C) [Option C]
        D) [Option D]
        Correct Answer: [Letter]
        Explanation: [Brief explanation]

        EDUCATIONAL CONTENT:
        {context}

        Generate {num_questions} questions now:
        """
    
    def _parse_mcqs(self, mcq_text: str, expected_count: int) -> List[Dict[str, Any]]:
        """Parse the generated MCQ text into structured format"""
        questions = []
        current_question = {}
        
        lines = mcq_text.strip().split('\n')
        
        for line in lines:
            line = line.strip()
            
            # Detect question start
            if line.lower().startswith('question'):
                if current_question:
                    questions.append(current_question)
                current_question = {
                    'question': line.split(':', 1)[1].strip() if ':' in line else line,
                    'options': {},
                    'correct_answer': '',
                    'explanation': ''
                }
            
            # Detect options
            elif re.match(r'^[A-D]\)', line):
                option = line[0]
                option_text = line[3:].strip()
                if '(Correct)' in option_text:
                    option_text = option_text.replace('(Correct)', '').strip()
                    current_question['correct_answer'] = option
                current_question['options'][option] = option_text
            
            # Detect correct answer
            elif line.lower().startswith('correct answer:'):
                current_question['correct_answer'] = line.split(':', 1)[1].strip()
            
            # Detect explanation
            elif line.lower().startswith('explanation:'):
                current_question['explanation'] = line.split(':', 1)[1].strip()
            
            # Continue building current question text
            elif current_question and not current_question.get('options'):
                current_question['question'] += ' ' + line
        
        # Add the last question
        if current_question:
            questions.append(current_question)
        
        return questions[:expected_count]
    
    def validate_mcqs(self, mcqs: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Validate generated MCQs for completeness"""
        valid_mcqs = []
        
        for mcq in mcqs:
            if (mcq.get('question') and 
                len(mcq.get('options', {})) == 4 and 
                mcq.get('correct_answer') in ['A', 'B', 'C', 'D'] and
                mcq.get('explanation')):
                valid_mcqs.append(mcq)
        
        return valid_mcqs

# Global MCQ generator instance
mcq_generator = MCQGenerator()