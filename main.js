(function() {
  var calculate, chartData, chartMatrix, chartResults, getRanges, guessType, measureDistance;

  $(document).ready(function() {
    var keys, results;
    chartData(irisData);
    keys = [1, 3, 5, 7];
    results = _.map(keys, function(k) {
      return {
        data: guessType(_.cloneDeep(irisData), k, .6),
        k: k
      };
    });
    results = _.map(results, function(r) {
      return {
        correct: _.filter(r.data, function(iris) {
          return iris.correctClass === iris.guess;
        }),
        k: r.k,
        data: r.data
      };
    });
    chartResults(results);
    return chartMatrix(results);
  });

  getRanges = function(irises) {
    var lMax, lMin, wMax, wMin;
    lMin = _.minBy(irises, function(iris) {
      return iris.petallength;
    }).petallength;
    lMax = _.maxBy(irises, function(iris) {
      return iris.petallength;
    }).petallength;
    wMin = _.minBy(irises, function(iris) {
      return iris.petalwidth;
    }).petalwidth;
    wMax = _.maxBy(irises, function(iris) {
      return iris.petalwidth;
    }).petalwidth;
    return {
      l: lMax - lMin,
      w: wMax - wMin
    };
  };

  measureDistance = function(iris, neighbor, ranges) {
    var deltaLength, deltaWidth;
    deltaLength = (iris.petallength - neighbor.petallength) / ranges.l;
    deltaWidth = (iris.petalwidth - neighbor.petalwidth) / ranges.l;
    return Math.sqrt(Math.pow(deltaLength, 2) + Math.pow(deltaWidth, 2));
  };

  calculate = function(known, test, k) {
    var ranges;
    ranges = getRanges(_.concat(known, test));
    return _.map(test, function(iris) {
      var g, neighbors;
      neighbors = _.sortBy(_.map(_.cloneDeep(known), function(neighbor) {
        return {
          distance: measureDistance(iris, neighbor, ranges),
          'class': neighbor['class']
        };
      }), function(data) {
        return data.distance;
      });
      neighbors = _.slice(neighbors, 0, k);
      g = _.groupBy(neighbors, 'class');
      iris.guess = _.maxBy(_.keys(g), function(k) {
        return g[k].length;
      });
      return iris;
    });
  };

  guessType = function(irises, k, split) {
    var known, knownAmount, results, shuffled, test;
    shuffled = _.shuffle(irises);
    knownAmount = Math.round(shuffled.length * split);
    known = _.slice(shuffled, 0, knownAmount);
    test = _.map(_.slice(shuffled, knownAmount), function(iris) {
      return {
        correctClass: iris['class'],
        petallength: iris.petallength,
        petalwidth: iris.petalwidth
      };
    });
    return results = calculate(known, test, k);
  };

  chartMatrix = function(results) {
    var classes, g, hrow, m, tbody, th, thead;
    g = _.groupBy(results[1].data, function(iris) {
      return iris['guess'];
    });
    classes = _.keys(g);
    m = {
      "Iris-virginica": {
        "Iris-virginica": 0,
        "Iris-versicolor": 0,
        "Iris-setosa": 0
      },
      "Iris-versicolor": {
        "Iris-virginica": 0,
        "Iris-versicolor": 0,
        "Iris-setosa": 0
      },
      "Iris-setosa": {
        "Iris-virginica": 0,
        "Iris-versicolor": 0,
        "Iris-setosa": 0
      }
    };
    _.forEach(classes, function(genus) {
      return _.forEach(g[genus], function(iris) {
        return m[genus][iris.correctClass] += 1;
      });
    });
    thead = document.getElementById('matrixHead');
    tbody = document.getElementById('matrixBody');
    hrow = document.createElement('tr');
    th = document.createElement('th');
    th.innerHTML = "Guess";
    hrow.appendChild(th);
    _.forEach(classes, function(guess) {
      var row, td;
      th = document.createElement('th');
      th.innerHTML = guess;
      hrow.appendChild(th);
      row = document.createElement('tr');
      td = document.createElement('td');
      row.appendChild(td);
      _.forEach(classes, function(actual) {
        td = document.createElement('td');
        td.innerHTML = m[guess][actual];
        return row.appendChild(td);
      });
      td = document.createElement('td');
      td.innerHTML = guess;
      row.appendChild(td);
      return tbody.appendChild(row);
    });
    th = document.createElement('th');
    th.innerHTML = "Actual";
    hrow.appendChild(th);
    return thead.appendChild(hrow);
  };

  chartData = function(data) {
    var g, series;
    g = _.groupBy(data, function(iris) {
      return iris['class'];
    });
    series = _.map(_.keys(g), function(genus) {
      return {
        name: genus,
        color: colors[genus],
        data: _.map(g[genus], function(iris) {
          return [iris.petallength, iris.petalwidth];
        })
      };
    });
    return $('#chart').highcharts({
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
    });
  };

  chartResults = function(results) {
    var series;
    series = [
      {
        name: '',
        color: "rgb(237, 123, 125)",
        data: _.map(results, function(r) {
          return [r.k, Math.trunc((r.correct.length / r.data.length) * 100)];
        })
      }
    ];
    return $('#results').highcharts({
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
    });
  };

}).call(this);
