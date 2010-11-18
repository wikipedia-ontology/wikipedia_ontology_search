/*
 * @(#)  2010/02/04
 */

package jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search.data;

import java.io.*;

/**
 * @author takeshi morita
 */
public class PagingData implements Serializable {

    private int start;
    private int end;
    private int size;

    public PagingData(int start, int end, int size) {
        this.start = start;
        this.end = end;
        this.size = size;
    }

    public int getStart() {
        return start;
    }
    public void setStart(int start) {
        this.start = start;
    }
    public int getEnd() {
        return end;
    }
    public void setEnd(int end) {
        this.end = end;
    }
    public int getSize() {
        return size;
    }
    public void setSize(int size) {
        this.size = size;
    }

}
