package jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search.data

import jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search.dao.{ClassStatistics, TypeStatistics}
import jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search.libs.WikipediaOntologyStorage
import reflect.BeanProperty

/**
 * @author takeshi morita
 */
@serializable class ClassImpl(@BeanProperty val lang: String, @BeanProperty val uri: String, @BeanProperty val clsName: String) {
    @BeanProperty var instanceCount: Int = 0

    def this(t: TypeStatistics) {
        this (null, t.getURI(), t.getName())
    }

    def this(cs: ClassStatistics) {
        this (cs.getLanguage, WikipediaOntologyStorage.CLASS_NS + cs.getClassName, cs.getClassName)
        instanceCount = cs.getInstanceCount
    }

    override def equals(obj: Any): Boolean = {
        val c = obj.asInstanceOf[ClassImpl]
        c.uri == uri
    }

    override def hashCode(): Int = {
        uri.hashCode
    }
}
