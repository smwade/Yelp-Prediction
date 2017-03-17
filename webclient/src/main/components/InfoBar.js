var data = {
  lineChart : [
    {
      date  : '2006-02-22',
      label : 'foo',
      value : 950
    },
    {
      date  : '2006-08-22',
      label : 'bar',
      value : 1000
    },
    {
      date  : '2007-01-11',
      label : 'baz',
      value : 700
    },
    {
      date  : '2008-10-01',
      label : 'boing',
      value : 534
    },
    {
      date  : '2009-02-24',
      label : 'loool',
      value : 1423
    },
    {
      date  : '2010-12-30',
      label : 'YEAH',
      value : 1222
    },
    {
      date  : '2011-05-15',
      label : 'Hurray',
      value : 948
    },
    {
      date  : '2012-04-02',
      label : 'WTF',
      value : 1938
    },
    {
      date  : '2013-08-19',
      label : 'OMG',
      value : 1245
    },
    {
      date  : '2013-11-11',
      label : 'ROFL',
      value : 888
    }
  ],
  pieChart  : [
    {
      color       : 'red',
      description : 'Ipsem lorem text goes here. And foo goes bar goes baz. That\'s up!!!',
      title       : 'flowers',
      value       : 0.62
    },
    {
      color       : 'blue',
      description : 'Another ipsem text goes here. And baz goes bar goes foo. Oh yeah, whazzz up?',
      title       : 'trains',
      value       : 0.38
    }
  ]
};


/**
 * draw the fancy line chart
 *
 * @param {String} elementId elementId
 * @param {Array}  data      data
 */

/**
 * draw the fancy pie chart
 *
 * @param {String} elementId elementId
 * @param {Array}  data      data
 */

function ಠ_ಠ() {
  drawPieChart('pieChart',     data.pieChart );
  drawLineChart('lineChart',    data.lineChart );
}

// yeah, let's kick things off!!!
ಠ_ಠ();
