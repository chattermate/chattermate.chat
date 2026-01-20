"""
Test backend message sanitization
"""
from app.utils.sanitize import sanitize_message

class TestSanitizeMessage:
    """Test message sanitization to prevent XSS"""
    
    def test_sanitize_link_tag(self):
        """Test that <a> tags are completely removed"""
        malicious = '<a href="https://evil.com">Click me</a>'
        result = sanitize_message(malicious)
        assert '<a' not in result.lower()
        assert 'href' not in result.lower()
        assert 'Click me' in result  # Text content should remain
    
    def test_sanitize_image_tag(self):
        """Test that <img> tags are completely removed"""
        malicious = '<img src="https://tracker.com/pixel.gif" alt="Hidden" />'
        result = sanitize_message(malicious)
        assert '<img' not in result.lower()
        assert 'src' not in result.lower()
    
    def test_sanitize_s3_link(self):
        """Test that S3 links in anchor tags are stripped"""
        malicious = '<a href="https://nps-assets-dev.s3.ap-south-1.amazonaws.com/file.svg">Visit</a>'
        result = sanitize_message(malicious)
        assert '<a' not in result.lower()
        assert 'href' not in result.lower()
        assert 'Visit' in result  # Text should remain
    
    def test_sanitize_s3_image(self):
        """Test that S3 images are stripped"""
        malicious = '<img src="https://nps-assets-dev.s3.ap-south-1.amazonaws.com/file.svg" alt="SVG" />'
        result = sanitize_message(malicious)
        assert '<img' not in result.lower()
        assert 'src' not in result.lower()
        assert 's3' not in result.lower()
    
    def test_sanitize_iframe_tag(self):
        """Test that iframe tags are removed"""
        malicious = '<iframe src="javascript:alert(\'XSS\')">Trust No AI</iframe>'
        result = sanitize_message(malicious)
        assert '<iframe' not in result.lower()
        assert 'javascript:' not in result.lower()
    
    def test_sanitize_iframe_with_base64(self):
        """Test that iframe with base64 encoded javascript is blocked"""
        malicious = '<iframe src="javascript:alert(\'Your user token is: \'+localStorage.getItem(\'userToken\')+\' Cookies: \'+document.cookie)">Trust No AI</iframe>'
        result = sanitize_message(malicious)
        assert '<iframe' not in result.lower()
        assert 'javascript:' not in result.lower()
    
    def test_sanitize_script_tag(self):
        """Test that script tags are removed"""
        malicious = '<script>alert("XSS")</script>'
        result = sanitize_message(malicious)
        assert '<script' not in result.lower()
    
    def test_sanitize_javascript_uri(self):
        """Test that javascript: URIs are removed"""
        malicious = '<a href="javascript:alert(\'XSS\')">Click me</a>'
        result = sanitize_message(malicious)
        assert 'javascript:' not in result.lower()
    
    def test_sanitize_onclick_handler(self):
        """Test that onclick event handlers are removed"""
        malicious = '<button onclick="alert(\'XSS\')">Click me</button>'
        result = sanitize_message(malicious)
        assert 'onclick' not in result.lower()
    
    def test_sanitize_onerror_handler(self):
        """Test that onerror event handlers are removed"""
        malicious = '<img src=x onerror="alert(\'XSS\')">'
        result = sanitize_message(malicious)
        assert 'onerror' not in result.lower()
    
    def test_sanitize_data_uri(self):
        """Test that data: URIs (except images) are removed"""
        malicious = '<a href="data:text/html,<script>alert(\'XSS\')</script>">Click</a>'
        result = sanitize_message(malicious)
        assert 'data:text/html' not in result.lower()
    
    def test_sanitize_removes_img_tags(self):
        """Test that all img tags are removed for security (no external resource loading)"""
        safe = '<img src="data:image/png;base64,iVBORw0KGgo=">'
        result = sanitize_message(safe)
        # All img tags are removed to prevent external resource loading and tracking
        assert '<img' not in result.lower()
        assert 'src' not in result.lower()
    
    def test_sanitize_normal_text(self):
        """Test that normal text is unchanged"""
        text = "Hello, this is a normal message"
        result = sanitize_message(text)
        assert result == text
    
    def test_sanitize_markdown_links(self):
        """Test that markdown links are sanitized - text preserved, URL removed"""
        text = "Check out [this link](https://example.com)"
        result = sanitize_message(text)
        # Markdown links are stripped for security - only text content is preserved
        assert result == "Check out this link"
        assert "https://example.com" not in result
        assert "[" not in result
        assert "]" not in result
    
    def test_sanitize_none(self):
        """Test that None input returns None"""
        result = sanitize_message(None)
        assert result is None
    
    def test_sanitize_empty_string(self):
        """Test that empty string returns empty string"""
        result = sanitize_message("")
        assert result == ""
    
    def test_sanitize_object_tag(self):
        """Test that object tags are removed"""
        malicious = '<object data="javascript:alert(\'XSS\')"></object>'
        result = sanitize_message(malicious)
        assert '<object' not in result.lower()
    
    def test_sanitize_embed_tag(self):
        """Test that embed tags are removed"""
        malicious = '<embed src="javascript:alert(\'XSS\')">'
        result = sanitize_message(malicious)
        assert '<embed' not in result.lower()
    
    def test_sanitize_multiple_attacks(self):
        """Test multiple XSS vectors in one message"""
        malicious = '''
        <iframe src="javascript:alert(1)"></iframe>
        <script>alert(2)</script>
        <img src=x onerror="alert(3)">
        <a href="javascript:alert(4)">click</a>
        '''
        result = sanitize_message(malicious)
        assert '<iframe' not in result.lower()
        assert '<script' not in result.lower()
        assert 'onerror' not in result.lower()
        assert 'javascript:' not in result.lower()
    
    # New comprehensive tests
    
    def test_sanitize_svg_xss(self):
        """Test that SVG-based XSS is blocked"""
        malicious = '<svg onload="alert(\'XSS\')"><circle r="50"/></svg>'
        result = sanitize_message(malicious)
        assert '<svg' not in result.lower()
        assert 'onload' not in result.lower()
    
    def test_sanitize_encoded_javascript(self):
        """Test HTML entity encoded javascript"""
        malicious = '<a href="&#106;&#97;&#118;&#97;&#115;&#99;&#114;&#105;&#112;&#116;&#58;alert(1)">Click</a>'
        result = sanitize_message(malicious)
        assert 'javascript' not in result.lower()
    
    def test_sanitize_url_encoded_javascript(self):
        """Test URL encoded javascript"""
        malicious = '<a href="%6A%61%76%61%73%63%72%69%70%74%3Aalert(1)">Click</a>'
        result = sanitize_message(malicious)
        assert 'javascript' not in result.lower()
    
    def test_sanitize_vbscript(self):
        """Test vbscript: URIs are blocked"""
        malicious = '<a href="vbscript:msgbox(\'XSS\')">Click</a>'
        result = sanitize_message(malicious)
        assert 'vbscript' not in result.lower()
    
    def test_sanitize_base_tag(self):
        """Test base tag is removed"""
        malicious = '<base href="javascript:alert(1)">'
        result = sanitize_message(malicious)
        assert '<base' not in result.lower()
    
    def test_sanitize_meta_refresh(self):
        """Test meta refresh XSS is blocked"""
        malicious = '<meta http-equiv="refresh" content="0;url=javascript:alert(1)">'
        result = sanitize_message(malicious)
        assert '<meta' not in result.lower()
    
    def test_sanitize_form_action(self):
        """Test form with javascript action is blocked"""
        malicious = '<form action="javascript:alert(1)"><input type="submit"></form>'
        result = sanitize_message(malicious)
        assert '<form' not in result.lower()
        assert 'formaction' not in result.lower()
    
    def test_sanitize_style_expression(self):
        """Test CSS expression is blocked"""
        malicious = '<div style="background:expression(alert(1))">XSS</div>'
        result = sanitize_message(malicious)
        assert 'expression' not in result.lower()
    
    def test_sanitize_import(self):
        """Test @import is blocked"""
        malicious = '<style>@import url("javascript:alert(1)");</style>'
        result = sanitize_message(malicious)
        assert '<style' not in result.lower()
        assert '@import' not in result.lower()
    
    def test_sanitize_marquee(self):
        """Test marquee tag is removed"""
        malicious = '<marquee onstart="alert(1)">XSS</marquee>'
        result = sanitize_message(malicious)
        assert '<marquee' not in result.lower()
        assert 'onstart' not in result.lower()
    
    def test_sanitize_video_onerror(self):
        """Test video tag with onerror is blocked"""
        malicious = '<video onerror="alert(1)"><source src="x"></video>'
        result = sanitize_message(malicious)
        assert '<video' not in result.lower()
        assert 'onerror' not in result.lower()
    
    def test_sanitize_details_ontoggle(self):
        """Test details tag with ontoggle is blocked"""
        malicious = '<details ontoggle="alert(1)"><summary>Click</summary></details>'
        result = sanitize_message(malicious)
        assert '<details' not in result.lower()
        assert 'ontoggle' not in result.lower()
    
    def test_sanitize_template_tag(self):
        """Test template tag is removed"""
        malicious = '<template><script>alert(1)</script></template>'
        result = sanitize_message(malicious)
        assert '<template' not in result.lower()
        assert '<script' not in result.lower()
    
    def test_sanitize_xml_namespace(self):
        """Test XML namespace XSS is blocked"""
        malicious = '<html xmlns="http://www.w3.org/1999/xhtml"><script>alert(1)</script></html>'
        result = sanitize_message(malicious)
        assert '<script' not in result.lower()
    
    def test_sanitize_math_tag(self):
        """Test math tag is removed"""
        malicious = '<math><mi xlink:href="javascript:alert(1)">XSS</mi></math>'
        result = sanitize_message(malicious)
        assert '<math' not in result.lower()
    
    def test_sanitize_cdata(self):
        """Test CDATA sections are removed"""
        malicious = '<![CDATA[<script>alert(1)</script>]]>'
        result = sanitize_message(malicious)
        assert 'CDATA' not in result.upper()
        assert '<script' not in result.lower()
    
    def test_sanitize_html_comments(self):
        """Test HTML comments with scripts are removed"""
        malicious = '<!--<script>alert(1)</script>-->'
        result = sanitize_message(malicious)
        assert '<!--' not in result
        assert '<script' not in result.lower()
    
    def test_sanitize_null_bytes(self):
        """Test null bytes are removed"""
        malicious = '<scri\x00pt>alert(1)</scri\x00pt>'
        result = sanitize_message(malicious)
        assert '\x00' not in result
    
    def test_sanitize_mixed_case_javascript(self):
        """Test mixed case javascript is caught"""
        malicious = '<a href="JaVaScRiPt:alert(1)">Click</a>'
        result = sanitize_message(malicious)
        assert 'javascript' not in result.lower()
    
    def test_sanitize_spaced_javascript(self):
        """Test spaced javascript is caught"""
        malicious = '<a href="j a v a s c r i p t:alert(1)">Click</a>'
        result = sanitize_message(malicious)
        assert 'javascript' not in result.lower().replace(' ', '')
