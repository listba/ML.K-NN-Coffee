$(document).ready () ->
	chartData(irisData)
	keys = [1,3,5,7]
	results = _.map keys, (k) -> 
		data: guessType(_.cloneDeep(irisData), k, .6)
		k: k
	results = _.map results, (r) ->
		correct: _.filter r.data, (iris) -> iris.correctClass == iris.guess
		k: r.k
		data: r.data
	chartResults results 

normalizeData = (irises) ->
	lMin = _.minBy(irises, (iris) -> iris.petallength).petallength
	lMax = _.maxBy(irises, (iris) -> iris.petallength).petallength

	wMin = _.minBy(irises, (iris) -> iris.petalwidth).petalwidth
	wMax = _.maxBy(irises, (iris) -> iris.petalwidth).petalwidth
	
	l: lMax - lMin
	w: wMax - wMin

measureDistance = (iris, neighbor, ranges) ->
	deltaLength = (iris.petallength - neighbor.petallength) / ranges.l
	deltaWidth = (iris.petalwidth - neighbor.petalwidth) / ranges.l

	Math.sqrt( Math.pow( deltaLength, 2) + Math.pow( deltaWidth, 2) )

calculate = (known, test, k) ->
	ranges = normalizeData _.concat(known, test)

	_.map test, (iris) ->
		neighbors = 
			_.sortBy( 
				_.map(_.cloneDeep(known), (neighbor) -> 
					distance: measureDistance(iris, neighbor, ranges),
					'class': neighbor['class']
				), (data) -> data.distance
			)
		neighbors = _.slice neighbors, 0, k
		g = _.groupBy(neighbors, 'class')
		iris.guess = _.maxBy(_.keys(g), (k) -> g[k].length)
		iris

guessType = (irises, k, split) ->
	
	shuffled = _.shuffle irises

	knownAmount = Math.round(shuffled.length * split)
	known = _.slice shuffled, 0, knownAmount
	test = _.map _.slice(shuffled, knownAmount), (iris) -> 
		correctClass: iris['class'],
		petallength: iris.petallength,
		petalwidth: iris.petalwidth
	results = calculate(known, test, k)




# Unimportant 
chartData = (data) -> 
	g = _.groupBy data, (iris) -> iris['class']
	series = 
		_.map _.keys(g), (genus) ->
			name: genus,
			color: colors[genus],
			data: _.map g[genus], (iris) -> [iris.petallength, iris.petalwidth]

	$('#chart').highcharts({
        chart: {
            type: 'scatter',
            zoomType: 'xy'
        },
        title: {
            text: 'Genus of Iris by Length & Width'
        },
        subtitle: {
            text: ''
        },
        xAxis: {
            title: {
                enabled: true,
                text: 'Length'
            },
            startOnTick: true,
            endOnTick: true,
            showLastLabel: true
        },
        yAxis: {
            title: {
                text: 'Width'
            }
        },
        legend: {
            layout: 'vertical',
            align: 'left',
            verticalAlign: 'top',
            x: 100,
            y: 70,
            floating: true,
            backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF',
            borderWidth: 1
        },
        plotOptions: {
            scatter: {
                marker: {
                    radius: 5,
                    states: {
                        hover: {
                            enabled: true,
                            lineColor: 'rgb(100,100,100)'
                        }
                    }
                },
                states: {
                    hover: {
                        marker: {
                            enabled: false
                        }
                    }
                },
                tooltip: {
                    headerFormat: '<b>{series.name}</b><br>',
                    pointFormat: '{point.x}, {point.y}'
                }
            }
        },
        series: series
    })

chartResults = (results) -> 
	series = [
		name: '',
		color: "rgb(237, 123, 125)",
		data: _.map results, (r) -> [r.k, Math.trunc((r.correct.length / r.data.length) * 100) ]
	]

	$('#results').highcharts({
        chart: {
            type: 'scatter',
            zoomType: 'xy'
        },
        title: {
            text: '% Correct By K '
        },
        subtitle: {
            text: ''
        },
        xAxis: {
            title: {
                enabled: true,
                text: 'K'
            },
            startOnTick: true,
            endOnTick: true,
            showLastLabel: true,
            allowDecimals: false
        },
        yAxis: {
            title: {
                text: '% Correct'
            }
        },
        legend: {
            layout: 'vertical',
            align: 'left',
            verticalAlign: 'top',
            x: 100,
            y: 70,
            floating: true,
            backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF',
            borderWidth: 1
        },
        plotOptions: {
            scatter: {
                marker: {
                    radius: 5,
                    states: {
                        hover: {
                            enabled: true,
                            lineColor: 'rgb(100,100,100)'
                        }
                    }
                },
                states: {
                    hover: {
                        marker: {
                            enabled: false
                        }
                    }
                },
                tooltip: {
                    headerFormat: '<b>{series.name}</b><br>',
                    pointFormat: '{point.x}, {point.y} %'
                }
            }
        },
        series: series
    })