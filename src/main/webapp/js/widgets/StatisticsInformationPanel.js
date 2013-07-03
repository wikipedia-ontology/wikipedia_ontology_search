/**
 * Author: Takeshi Morita
 * Contact: t_morita@ae.keio.ac.jp
 * Copyright © 2009-2011 慶應義塾大学 理工学部 管理工学科 山口研究室．
 */

Ext.chart.Chart.CHART_URL = WIKIPEDIA_ONTOLOGY_SEARCH.constants.BASE_SERVER_URL + 'ext_resources/charts.swf';


var statisticsStore = new Ext.data.JsonStore({
    fields:['name', 'number'],
    data: [
        {name:WIKIPEDIA_ONTOLOGY_SEARCH.resources.numberOfClasses + "\n29,023", number: 29023},
        {name:WIKIPEDIA_ONTOLOGY_SEARCH.resources.numberOfIsaRelationships + "\n28,260", number: 28260},
        {name:WIKIPEDIA_ONTOLOGY_SEARCH.resources.numberOfProperties + "\n5,816", number:5816},
        {name:WIKIPEDIA_ONTOLOGY_SEARCH.resources.numberOfTypesOfInstances + "\n434,939", number: 434939},
        {name:WIKIPEDIA_ONTOLOGY_SEARCH.resources.numberOfInstances  + "\n2,325,660", number: 2325660},
        {name:WIKIPEDIA_ONTOLOGY_SEARCH.resources.numberOfResources + "\n2,360,499", number: 2360499}
    ]
});

function getStatisticsInformationPanel() {

    return new Ext.Panel({
        title: WIKIPEDIA_ONTOLOGY_SEARCH.resources.totalNumberOfStatements,
        width:600,
        height:300,
        layout:'fit',
        items: {
            xtype: 'columnchart',
            store: statisticsStore,
            xField: 'name',
            yAxis: new Ext.chart.NumericAxis({
                displayName: 'number',
                labelRenderer : Ext.util.Format.numberRenderer('0,0')
            }),
            tipRenderer : function(chart, record, index, series) {
                if (series.yField == 'number') {
                    return  record.data.name;
                }
            },
            chartStyle: {
                padding: 10,
                animationEnabled: true,
                font: {
                    name: 'Tahoma',
                    color: 0x444444,
                    size: 11
                },
                dataTip: {
                    padding: 5,
                    border: {
                        color: 0x99bbe8,
                        size:1
                    },
                    background: {
                        color: 0xDAE7F6,
                        alpha: .9
                    },
                    font: {
                        name: 'Tahoma',
                        color: 0x15428B,
                        size: 10,
                        bold: true
                    }
                },
                xAxis: {
                    color: 0x69aBc8,
                    majorTicks: {color: 0x69aBc8, length: 4},
                    minorTicks: {color: 0x69aBc8, length: 2},
                    majorGridLines: {size: 1, color: 0xeeeeee}
                },
                yAxis: {
                    color: 0x69aBc8,
                    majorTicks: {color: 0x69aBc8, length: 4},
                    minorTicks: {color: 0x69aBc8, length: 2},
                    majorGridLines: {size: 1, color: 0xdfe8f6}
                }
            },
            series: [
                {
                    type: 'column',
                    displayName: 'Page Views',
                    yField: 'number',
                    style: {
                        image:'bar.gif',
                        mode: 'stretch',
                        color:0x99BBE8
                    }
                }
            ]
        }
    });
}
