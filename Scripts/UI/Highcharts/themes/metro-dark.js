/**
 * Grid theme for Highcharts JS
 * @author zhou.song
 */

Highcharts.theme = {
    colors: ['#007EEE', '#3CD21F', '#FFB900', '#9700CE', '#EE2333', '#99DA0D', '#15CA7F', '#465B70', '#E8EE14', '#00B6FF', '#CD065C', '#AC47EE', '#2186B3', '#5E5452', '#8CB3DA', '#EE6655', '#D6C027', '#994C00', '#FD3710', '#00C100', '#FF95CD', '#3875D7', '#A0151E', '#69DC37', '#4A9155'],
    chart: {
        borderRadius: 0,
        backgroundColor: 'rgba(0, 0, 0, 0)',
		borderWidth: 0,
		plotBackgroundColor: 'rgba(0, 0, 0, 0)',
		plotShadow: false,
		plotBorderWidth: 0
	},
	title: {
		style: {
		    color: '#FFFFFF',
            fontSize: '18px',
		    fontFamily: 'Microsoft YaHei, Trebuchet MS, Verdana, sans-serif'
		}
	},
	subtitle: {
		style: {
		    color: '#AAAAAA',
		    fontSize: '14px',
		    fontFamily: 'Microsoft YaHei, Trebuchet MS, Verdana, sans-serif'
		}
	},
	credits: { enabled: false },
	xAxis: {
		gridLineWidth: 0,
		lineColor: '#999999',
		tickColor: '#999999',
		labels: {
			style: {
			    color: '#AAAAAA',
			    fontSize: '12px',
			    fontFamily: 'Microsoft YaHei, Trebuchet MS, Verdana, sans-serif'
			}
		},
		title: {
			style: {
				color: '#FFFFFF',
				fontWeight: 'normal',
				fontSize: '14px',
				fontFamily: 'Microsoft YaHei, Trebuchet MS, Verdana, sans-serif'

			}
		}
	},
	yAxis: {
	    gridLineWidth: 1,
	    gridLineColor: '#999999',
		minorTickInterval: null,
		lineColor: '#999999',
		tickColor: '#999999',
		lineWidth: 1,
		tickWidth: 1,
		labels: {
			style: {
			    color: '#AAAAAA',
			    fontSize: '12px',
				fontFamily: 'Microsoft YaHei, Trebuchet MS, Verdana, sans-serif'
			}
		},
		title: {
			style: {
				color: '#FFFFFF',
				fontWeight: 'normal',
				fontSize: '14px',
				fontFamily: 'Microsoft YaHei, Trebuchet MS, Verdana, sans-serif'
			}
		}
	},
	tooltip: {
	    backgroundColor: 'rgba(0, 0, 0, 0.6)',
	    borderRadius: 0,
	    borderWidth: 2,
	    headerFormat: '<span>{point.key}</span><br/>',
	    pointFormat: '<span>{series.name}</span>: <span style="color:{series.color}">{point.y}</span><br/>',
	    style: {
	        color: '#FFFFFF',
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
	            color: '#AAAAAA'
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
            borderColor: '#CCC',
            dataLabels: {
                color: "#FFFFFF"
            }
	    },
	    bar: {
	        shadow: false,
	        borderWidth: 0
	    }
	},
	legend: {
	    itemStyle: {
	        color: '#FFFFFF',
		    fontSize: '12px',
		    fontFamily: 'Microsoft YaHei, Trebuchet MS, Verdana, sans-serif',
		    align: 'right',
		    verticalAlign: 'top',
		    x: -20,
		    y: 10,
		    backgroundColor: 'transparent',
		    borderWidth: 0,
            lineHeight: 1,
		    shadow: false
		},
		itemHoverStyle: {
			color: '#FFFFFF'
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
