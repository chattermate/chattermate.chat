"""
Copyright 2024-2026 ChatterMate

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
"""

import re
from typing import Dict, List, Tuple, Optional
from enum import Enum
from app.core.logger import get_logger

logger = get_logger(__name__)


class GuardrailType(str, Enum):
    """Types of guardrails that can be applied"""
    PII = "pii"
    JAILBREAK = "jailbreak"


class GuardrailAction(str, Enum):
    """Actions to take when guardrail is triggered"""
    BLOCK = "block"
    REDACT = "redact"
    WARNING = "warning"
    LOG = "log"


class GuardrailResult:
    """Result of guardrail evaluation"""
    
    def __init__(
        self,
        passed: bool,
        guardrail_type: GuardrailType,
        violations: List[str] = None,
        redacted_text: Optional[str] = None,
        confidence: float = 0.0
    ):
        self.passed = passed
        self.guardrail_type = guardrail_type
        self.violations = violations or []
        self.redacted_text = redacted_text
        self.confidence = confidence
    
    def to_dict(self) -> Dict:
        """Convert result to dictionary"""
        return {
            "passed": self.passed,
            "guardrail_type": self.guardrail_type.value,
            "violations": self.violations,
            "redacted_text": self.redacted_text,
            "confidence": self.confidence
        }


class PIIDetector:
    """
    Detector for Personally Identifiable Information (PII)
    Detects common PII patterns like emails, phone numbers, SSNs, credit cards, etc.
    """
    
    # Regex patterns for common PII types
    PATTERNS = {
        "email": r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',
        "phone": r'\b(?:\+?1[-.]?)?\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})\b',
        "ssn": r'\b\d{3}-\d{2}-\d{4}\b',
        "credit_card": r'\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b',
        "ip_address": r'\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b',
        "date_of_birth": r'\b(?:0?[1-9]|1[0-2])[/-](?:0?[1-9]|[12][0-9]|3[01])[/-](?:19|20)\d{2}\b',
        # Add more patterns as needed
    }
    
    @staticmethod
    def detect(text: str, action: GuardrailAction = GuardrailAction.BLOCK) -> GuardrailResult:
        """
        Detect PII in text
        
        Args:
            text: Text to scan for PII
            action: Action to take (BLOCK, REDACT, WARNING, LOG)
            
        Returns:
            GuardrailResult with detection results
        """
        violations = []
        redacted_text = text
        
        for pii_type, pattern in PIIDetector.PATTERNS.items():
            matches = re.finditer(pattern, text)
            for match in matches:
                violations.append(f"{pii_type} at position {match.start()} (length {len(match.group())})")
                
                # Redact if action is REDACT
                if action == GuardrailAction.REDACT:
                    redacted_text = redacted_text.replace(
                        match.group(),
                        f"[{pii_type.upper()}_REDACTED]"
                    )
        
        passed = len(violations) == 0
        
        # Calculate confidence based on pattern matching (simple heuristic)
        confidence = 1.0 if violations else 0.0
        
        logger.info(f"PII Detection - Passed: {passed}, Violations: {len(violations)}")
        
        return GuardrailResult(
            passed=passed,
            guardrail_type=GuardrailType.PII,
            violations=violations,
            redacted_text=redacted_text if action == GuardrailAction.REDACT else None,
            confidence=confidence
        )


class JailbreakDetector:
    """
    Detector for jailbreak attempts
    Identifies common jailbreak patterns and prompt injection attempts
    """
    
    # Common jailbreak patterns
    JAILBREAK_PATTERNS = [
        # Ignore previous instructions
        r'ignore (previous|all|the above|your) (instructions|rules|prompts?)',
        r'disregard (previous|all|the above|your) (instructions|rules|prompts?)',
        r'forget (previous|all|the above|your) (instructions|rules|prompts?)',
        
        # Role-playing attempts
        r'pretend (you are|to be|you\'re)',
        r'act (as|like) (a|an)',
        r'you are now (a|an)',
        r'from now on',
        
        # System prompts manipulation
        r'repeat (your|the) (system )?prompt',
        r'what (is|are) your (instructions|rules|system prompt)',
        r'show me your (instructions|rules|system prompt)',
        
        # DAN (Do Anything Now) variants
        r'\bDAN\b',
        r'do anything now',
        
        # Instruction injections
        r'\[SYSTEM\]',
        r'\[INST\]',
        r'<\|im_start\|>',
        r'<\|im_end\|>',
        
        # Bypassing safety
        r'without (any )?restrictions?',
        r'(bypass|override|disable) (safety|ethics|rules|guidelines)',
        r'no (restrictions?|limitations?|rules|boundaries)',
        
        # Direct manipulation
        r'you (must|should|have to) (obey|follow|comply)',
        r'this (overrides|supersedes) (all|any|your)',
    ]
    
    # Suspicious phrases that might indicate jailbreak
    SUSPICIOUS_PHRASES = [
        "hypothetically",
        "theoretically",
        "for educational purposes",
        "in a fictional scenario",
        "in an alternate universe",
        "sudo",
        "administrator mode",
        "developer mode",
        "debug mode",
        "unrestricted mode",
    ]
    
    @staticmethod
    def detect(text: str, sensitivity: float = 0.7) -> GuardrailResult:
        """
        Detect jailbreak attempts in text
        
        Args:
            text: Text to scan for jailbreak attempts
            sensitivity: Detection sensitivity (0.0 to 1.0, default 0.7)
            
        Returns:
            GuardrailResult with detection results
        """
        violations = []
        text_lower = text.lower()
        
        # Check for explicit jailbreak patterns
        pattern_matches = 0
        for pattern in JailbreakDetector.JAILBREAK_PATTERNS:
            matches = re.finditer(pattern, text_lower, re.IGNORECASE)
            for match in matches:
                pattern_matches += 1
                violations.append(f"Jailbreak pattern: '{match.group()}'")
        
        # Check for suspicious phrases
        suspicious_matches = 0
        for phrase in JailbreakDetector.SUSPICIOUS_PHRASES:
            if phrase.lower() in text_lower:
                suspicious_matches += 1
                if suspicious_matches > 2:  # Multiple suspicious phrases increase confidence
                    violations.append(f"Suspicious phrase: '{phrase}'")
        
        # Calculate confidence score
        # Pattern matches are weighted more heavily than suspicious phrases
        pattern_score = min(pattern_matches * 0.4, 1.0)
        suspicious_score = min(suspicious_matches * 0.15, 0.3)
        confidence = min(pattern_score + suspicious_score, 1.0)
        
        # Determine if it passes based on sensitivity threshold
        passed = confidence < sensitivity
        
        logger.info(
            f"Jailbreak Detection - Passed: {passed}, "
            f"Confidence: {confidence:.2f}, "
            f"Pattern Matches: {pattern_matches}, "
            f"Suspicious Phrases: {suspicious_matches}"
        )
        
        return GuardrailResult(
            passed=passed,
            guardrail_type=GuardrailType.JAILBREAK,
            violations=violations,
            redacted_text=None,
            confidence=confidence
        )


class GuardrailsEngine:
    """
    Main guardrails engine that orchestrates multiple guardrail checks
    """
    
    def __init__(self):
        self.pii_detector = PIIDetector()
        self.jailbreak_detector = JailbreakDetector()
    
    def evaluate(
        self,
        text: str,
        enabled_guardrails: List[GuardrailType],
        actions: Dict[GuardrailType, GuardrailAction] = None,
        jailbreak_sensitivity: float = 0.7
    ) -> Tuple[bool, List[GuardrailResult]]:
        """
        Evaluate text against enabled guardrails
        
        Args:
            text: Text to evaluate
            enabled_guardrails: List of guardrail types to check
            actions: Dictionary mapping guardrail types to actions
            jailbreak_sensitivity: Sensitivity for jailbreak detection (0.0-1.0)
            
        Returns:
            Tuple of (all_passed, list_of_results)
        """
        if actions is None:
            actions = {}
        
        results = []
        all_passed = True
        
        for guardrail_type in enabled_guardrails:
            action = actions.get(guardrail_type, GuardrailAction.BLOCK)
            
            if guardrail_type == GuardrailType.PII:
                result = self.pii_detector.detect(text, action)
                results.append(result)
                if not result.passed:
                    all_passed = False
            
            elif guardrail_type == GuardrailType.JAILBREAK:
                result = self.jailbreak_detector.detect(text, jailbreak_sensitivity)
                results.append(result)
                if not result.passed:
                    all_passed = False
        
        return all_passed, results
    
    def get_default_block_message(self, results: List[GuardrailResult]) -> str:
        """
        Generate a user-friendly message when content is blocked
        
        Args:
            results: List of guardrail results
            
        Returns:
            Message to display to user
        """
        failed_guardrails = [r for r in results if not r.passed]
        
        if not failed_guardrails:
            return "Your message has been processed successfully."
        
        
        if GuardrailType.PII in [r.guardrail_type for r in failed_guardrails]:
            return (
                "I noticed your message contains sensitive personal information. "
                "For your privacy and security, please avoid sharing personal details "
                "like email addresses, phone numbers, or other identifying information."
            )
        
        if GuardrailType.JAILBREAK in [r.guardrail_type for r in failed_guardrails]:
            return (
                "I'm designed to help you with legitimate questions and tasks. "
                "I can't process requests that ask me to ignore my guidelines or "
                "behave in ways I'm not designed for. How else can I assist you?"
            )
        
        return (
            "I'm unable to process your message as it doesn't meet our "
            "content guidelines. Please rephrase your request."
        )


# Convenience function for quick guardrail checks
def check_guardrails(
    text: str,
    guardrail_types: List[str],
    pii_action: str = "block",
    jailbreak_sensitivity: float = 0.7
) -> Tuple[bool, List[Dict], str]:
    """
    Convenience function to check text against guardrails
    
    Args:
        text: Text to check
        guardrail_types: List of guardrail type strings ("pii", "jailbreak")
        pii_action: Action for PII ("block", "redact", "warning", "log")
        jailbreak_sensitivity: Sensitivity for jailbreak detection
        
    Returns:
        Tuple of (passed, results_list, block_message)
    """
    engine = GuardrailsEngine()
    
    # Convert string types to enums
    enabled_guardrails = []
    actions = {}
    
    for gt in guardrail_types:
        try:
            guardrail_type = GuardrailType(gt.lower())
            enabled_guardrails.append(guardrail_type)
            
            if guardrail_type == GuardrailType.PII:
                actions[guardrail_type] = GuardrailAction(pii_action.lower())
        except ValueError:
            logger.warning(f"Unknown guardrail type: {gt}")
    
    passed, results = engine.evaluate(
        text,
        enabled_guardrails,
        actions,
        jailbreak_sensitivity
    )
    
    block_message = engine.get_default_block_message(results)
    results_dict = [r.to_dict() for r in results]
    
    return passed, results_dict, block_message
