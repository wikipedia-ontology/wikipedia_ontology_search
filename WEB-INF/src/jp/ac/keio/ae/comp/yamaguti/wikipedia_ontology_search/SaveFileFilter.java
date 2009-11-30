/*
 * @(#)  2009/11/09
 */

package jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search;

import java.io.*;

import javax.servlet.*;
import javax.servlet.http.*;

/**
 * @author takeshi morita
 */
public class SaveFileFilter implements Filter {

    public void destroy() {
    }

    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) {

        HttpServletResponse resp = (HttpServletResponse) response;
        StringHttpServletResponse strResponse = new StringHttpServletResponse(resp);

        try {
            chain.doFilter(request, strResponse);
            PrintWriter out = new PrintWriter(new OutputStreamWriter(response.getOutputStream(), "UTF-8"));
            String outputString = strResponse.toString();
            File outputFile = (File) request.getAttribute("outputFile");
             WikipediaOntologyUtilities.writeFile(outputFile, outputString);
            out.write(strResponse.toString());
            out.close();
        } catch (IOException ioe) {
            ioe.printStackTrace();
        } catch (ServletException se) {
            se.printStackTrace();
        }
    }

    public void init(FilterConfig arg0) throws ServletException {
    }

}

class StringHttpServletResponse extends HttpServletResponseWrapper {

    private CharArrayWriter caw = null;

    public StringHttpServletResponse(HttpServletResponse response) {
        super(response);
        caw = new CharArrayWriter();
    }

    public String toString() {
        return caw.toString();
    }

    public PrintWriter getWriter() {
        return new PrintWriter(caw);
    }

    public ServletOutputStream getOutputStream() {
        return new SampleServletOutputStream(caw);
    }

    class SampleServletOutputStream extends ServletOutputStream {

        private CharArrayWriter buffer = null;

        public SampleServletOutputStream(CharArrayWriter charArrayWriter) {
            super();
            buffer = charArrayWriter;
        }

        public void write(int c) {
            buffer.write(c);
        }
    }
}