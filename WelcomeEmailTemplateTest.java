package com.perfumetreasure.email;

import org.junit.Test;

import static org.junit.Assert.*;

/**
 * WelcomeEmailTemplateTest
 * Unit tests for the WelcomeEmailTemplate class.
 * Run with: ./gradlew test
 */
public class WelcomeEmailTemplateTest {

    // ── Subject ──────────────────────────────────────────────────────────────

    @Test
    public void subject_isNotEmpty() {
        assertFalse(WelcomeEmailTemplate.SUBJECT.isEmpty());
    }

    // ── HTML body ────────────────────────────────────────────────────────────

    @Test
    public void htmlBody_containsUserName() {
        String html = WelcomeEmailTemplate.buildHtmlBody("Alice");
        assertTrue("HTML should include the user's name", html.contains("Alice"));
    }

    @Test
    public void htmlBody_escapesHtmlEntities() {
        String html = WelcomeEmailTemplate.buildHtmlBody("<script>alert('xss')</script>");
        assertFalse("HTML should NOT contain raw <script> tag", html.contains("<script>"));
        assertTrue("HTML should contain escaped &lt;script&gt;", html.contains("&lt;script&gt;"));
    }

    @Test
    public void htmlBody_handlesNullUserName() {
        String html = WelcomeEmailTemplate.buildHtmlBody(null);
        assertNotNull(html);
        assertFalse(html.isEmpty());
    }

    @Test
    public void htmlBody_containsAppName() {
        String html = WelcomeEmailTemplate.buildHtmlBody("Bob");
        assertTrue(html.contains("PERFUME TREASURE") || html.contains("Perfume Treasure"));
    }

    @Test
    public void htmlBody_containsDeepLink() {
        String html = WelcomeEmailTemplate.buildHtmlBody("Carol");
        assertTrue("Should include app deep link", html.contains("perfumetreasure://"));
    }

    // ── Plain text body ──────────────────────────────────────────────────────

    @Test
    public void plainTextBody_containsUserName() {
        String text = WelcomeEmailTemplate.buildPlainTextBody("David");
        assertTrue(text.contains("David"));
    }

    @Test
    public void plainTextBody_containsSupportEmail() {
        String text = WelcomeEmailTemplate.buildPlainTextBody("Eve");
        assertTrue(text.contains("support@perfumetreasure.com"));
    }

    @Test
    public void plainTextBody_containsFeatureList() {
        String text = WelcomeEmailTemplate.buildPlainTextBody("Frank");
        assertTrue(text.contains("Discover"));
        assertTrue(text.contains("Collect"));
        assertTrue(text.contains("Review"));
    }
}
