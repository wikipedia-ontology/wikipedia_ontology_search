package jp.ac.keio.ae.comp.yamaguti;

import jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search.*;
import junit.framework.*;

import org.apache.wicket.util.tester.*;

/**
 * Simple test using the WicketTester
 */
public class TestHomePage extends TestCase {
    private WicketTester tester;

    @Override
    public void setUp() {
        tester = new WicketTester(new WikipediaOntologySearchApplication());
    }

    public void testRenderMyPage() {
        // start and render the test page
        tester.startPage(IndexPage.class);

        // assert rendered page class
        tester.assertRenderedPage(IndexPage.class);

        // assert rendered label component
        tester.assertLabel("message", "If you see this message wicket is properly configured and running");
    }
}