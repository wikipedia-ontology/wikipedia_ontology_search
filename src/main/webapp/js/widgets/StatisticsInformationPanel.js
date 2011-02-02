/**
 * Author: Takeshi Morita
 * Contact: t_morita@ae.keio.ac.jp
 * Copyright © 2009-2011 慶應義塾大学 理工学部 管理工学科 山口研究室．
 */

Ext.chart.Chart.CHART_URL = BASE_SERVER_URL + 'ext_resources/charts.swf';


var statisticsStore = new Ext.data.JsonStore({
    fields:['name', 'number'],
    data: [
        {name:NUMBER_OF_CLASSES + "\n29,023", number: 29023},
        {name:NUMBER_OF_ISA_RELATIONSHIPS + "\n28,260", number: 28260},
        {name:NUMBER_OF_PROPERTIES + "\n5,816", number:5816},
        {name:NUMBER_OF_TYPES_OF_INSTANCES + "\n434,939", number: 434939},
        {name:NUMBER_OF_INSTANCES  + "\n2,325,660", number: 2325660},
        {name:NUMBER_OF_RESOURCES + "\n2,360,499", number: 2360499}
    ]
});

function getStatisticsInformationPanel() {

    return new Ext.Panel({
        title: TOTAL_NUMBER_OF_STATEMENTS,
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
