/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 68.26722338204593, "KoPercent": 31.73277661795407};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.2640918580375783, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.22, 500, 1500, "HTTP Request login"], "isController": false}, {"data": [0.46551724137931033, 500, 1500, "HTTP Request transfer"], "isController": false}, {"data": [0.3897058823529412, 500, 1500, "HTTP Request /Summary"], "isController": false}, {"data": [0.36813186813186816, 500, 1500, "HTTP Request transaction list"], "isController": false}, {"data": [0.24, 500, 1500, "HTTP Request"], "isController": false}, {"data": [0.2857142857142857, 500, 1500, "HTTP Request transfer list"], "isController": false}, {"data": [0.12857142857142856, 500, 1500, "HTTP Request Company"], "isController": false}, {"data": [0.9444444444444444, 500, 1500, "HTTP Request Transaction list"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 958, 304, 31.73277661795407, 2249.615866388304, 7, 21445, 432.5, 6357.700000000001, 7371.349999999999, 15411.609999999999, 6.987294502064096, 32.269433925667, 4.486321258734118], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["HTTP Request login", 400, 80, 20.0, 2919.1549999999993, 39, 21297, 2416.5, 6859.800000000003, 7396.05, 15442.81, 3.346944239908963, 3.517167732110583, 1.2975945930115804], "isController": false}, {"data": ["HTTP Request transfer", 29, 15, 51.724137931034484, 91.10344827586206, 11, 511, 58.0, 184.0, 459.0, 511.0, 1.2565535768447507, 0.4309670723384895, 1.9019251809003856], "isController": false}, {"data": ["HTTP Request /Summary", 68, 39, 57.35294117647059, 115.26470588235294, 7, 1012, 34.0, 420.9000000000001, 598.2, 1012.0, 2.9607698001480385, 1.3782087478773895, 4.065063120455436], "isController": false}, {"data": ["HTTP Request transaction list", 91, 44, 48.35164835164835, 570.9340659340658, 9, 4734, 84.0, 3219.7999999999984, 3896.599999999998, 4734.0, 2.9731760708334694, 57.11239463194694, 2.784353354624759], "isController": false}, {"data": ["HTTP Request", 200, 18, 9.0, 4165.474999999999, 42, 21445, 3815.0, 8236.1, 10842.349999999999, 21408.8, 1.9475334488869847, 2.178926668671003, 0.7547643058503904], "isController": false}, {"data": ["HTTP Request transfer list", 91, 47, 51.64835164835165, 966.2967032967033, 8, 8362, 92.0, 5630.999999999995, 6528.5999999999985, 8362.0, 3.832870019374947, 82.24238197340156, 3.712640376231994], "isController": false}, {"data": ["HTTP Request Company", 70, 61, 87.14285714285714, 23.771428571428576, 9, 64, 20.0, 41.8, 53.35000000000001, 64.0, 9.518629317378299, 4.641659725999456, 8.635553355316834], "isController": false}, {"data": ["HTTP Request Transaction list", 9, 0, 0.0, 260.3333333333333, 58, 638, 242.0, 638.0, 638.0, 638.0, 1.2228260869565217, 0.5237081776494565, 1.1392344599184783], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["500/Internal Server Error", 2, 0.6578947368421053, 0.20876826722338204], "isController": false}, {"data": ["401/Unauthorized", 147, 48.35526315789474, 15.34446764091858], "isController": false}, {"data": ["429/Too Many Requests", 155, 50.98684210526316, 16.17954070981211], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 958, 304, "429/Too Many Requests", 155, "401/Unauthorized", 147, "500/Internal Server Error", 2, "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["HTTP Request login", 400, 80, "429/Too Many Requests", 79, "500/Internal Server Error", 1, "", "", "", "", "", ""], "isController": false}, {"data": ["HTTP Request transfer", 29, 15, "401/Unauthorized", 8, "429/Too Many Requests", 6, "500/Internal Server Error", 1, "", "", "", ""], "isController": false}, {"data": ["HTTP Request /Summary", 68, 39, "429/Too Many Requests", 27, "401/Unauthorized", 12, "", "", "", "", "", ""], "isController": false}, {"data": ["HTTP Request transaction list", 91, 44, "401/Unauthorized", 38, "429/Too Many Requests", 6, "", "", "", "", "", ""], "isController": false}, {"data": ["HTTP Request", 200, 18, "429/Too Many Requests", 18, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["HTTP Request transfer list", 91, 47, "401/Unauthorized", 37, "429/Too Many Requests", 10, "", "", "", "", "", ""], "isController": false}, {"data": ["HTTP Request Company", 70, 61, "401/Unauthorized", 52, "429/Too Many Requests", 9, "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
