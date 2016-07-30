/**
 * Grid theme for Highcharts JS
 * @author zhou.song
 */

Highcharts.theme = {
    colors: ['#007EEE', '#3CD21F', '#FFB900', '#9700CE', '#EE2333', '#99DA0D', '#15CA7F', '#465B70', '#E8EE14', '#00B6FF', '#CD065C', '#AC47EE', '#2186B3', '#5E5452', '#8CB3DA', '#EE6655', '#D6C027', '#994C00', '#FD3710', '#00C100', '#FF95CD', '#3875D7', '#A0151E', '#69DC37', '#4A9155'],
    chart: {
        borderRadius: 0,
		backgroundColor: '#FFFFFF',
		borderWidth: 0,
		plotBackgroundColor: 'rgba(255, 255, 255, 1)',
		plotShadow: false,
		plotBorderWidth: 0
	},
	title: {
		style: {
		    color: '#000000',
            fontSize: '18px',
		    fontFamily: 'Microsoft YaHei, Trebuchet MS, Verdana, sans-serif'
		}
	},
	subtitle: {
		style: {
		    color: '#666666',
		    fontSize: '14px',
		    fontFamily: 'Microsoft YaHei, Trebuchet MS, Verdana, sans-serif'
		}
	},
	credits: { enabled: false },
	xAxis: {
		gridLineWidth: 0,
		lineColor: '#CCCCCC',
		tickColor: '#CCCCCC',
		labels: {
			style: {
			    color: '#666666',
			    fontSize: '12px',
			    fontFamily: 'Microsoft YaHei, Trebuchet MS, Verdana, sans-serif'
			}
		},
		title: {
			style: {
				color: '#333333',
				fontWeight: 'normal',
				fontSize: '14px',
				fontFamily: 'Microsoft YaHei, Trebuchet MS, Verdana, sans-serif'

			}
		}
	},
	yAxis: {
	    gridLineWidth: 1,
	    gridLineColor: '#CCCCCC',
		minorTickInterval: null,
		lineColor: '#CCCCCC',
		lineWidth: 1,
		tickWidth: 1,
		tickColor: '#CCCCCC',
		labels: {
			style: {
			    color: '#666666',
			    fontSize: '12px',
				fontFamily: 'Microsoft YaHei, Trebuchet MS, Verdana, sans-serif'
			}
		},
		title: {
			style: {
				color: '#333333',
				fontWeight: 'normal',
				fontSize: '14px',
				fontFamily: 'Microsoft YaHei, Trebuchet MS, Verdana, sans-serif'
			}
		}
	},
	tooltip: {
	    backgroundColor: 'rgba(255, 255, 255, 0.9)',
	    borderRadius: 0,
	    borderWidth: 2,
	    headerFormat: '<span>{point.key}</span><br/>',
	    pointFormat: '<span>{series.name}</span>: <span style="color:{series.color}">{point.y}</span><br/>',
	    style: {
	        color: '#333333',
	        fontSize: '12px',
	        fontWeight: 'normal',
	        fontFamily: 'Microsoft YaHei, Trebuchet MS, Verdana, sans-serif'
	    }
	},
	credits: {
        enabled: false
	},
	plotOptions: {
	    line: {
	        dataLabels: {
	            color: '#CCC'
	        },
	        marker: {
	            lineColor: '#333'
	        }
	    },
	    spline: {
	        marker: {
	            lineColor: '#333'
	        }
	    },
	    scatter: {
	        marker: {
	            lineColor: '#333'
	        }
	    },
	    candlestick: {
	        lineColor: 'white'
	    },
	    column: {
	        cursor: "defualt",
            shadow: false,
            borderWidth: 0,
            borderColor: '#FFFFFF',
            dataLabels: {
                color: "#666666"
            }
	    }
	},
	legend: {
	    itemStyle: {
	        color: '#333333',
		    fontSize: '9pt',
		    fontFamily: 'Microsoft YaHei, Trebuchet MS, Verdana, sans-serif'
		},
		itemHoverStyle: {
			color: '#039'
		},
		itemHiddenStyle: {
			color: 'gray'
		}
	},
	labels: {
		style: {
			color: '#99b'
		}
	}
};

// Apply the theme
var highchartsOptions = Highcharts.setOptions(Highcharts.theme);
