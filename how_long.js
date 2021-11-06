/**
 * Main calculator initialization variable and other scripts to be included
 *
 * The init variable naming convention is: ff_calc_init_<calculator_name>
 */
 var ff_calc_init_how_long = {
    calculatorName: 'how_long',

    // Instant graph redraw
    runDelay: 0,
    chartAnimation: false,

    run: function() {
        var withdrawal = (FF_Calc.getValue('expenses') - FF_Calc.getValue('income')),   // monthly withdrawals
            balance = FF_Calc.getValue('balance'),
            years = FF_Calc.getValue('years'),
            percentage = withdrawal / balance,
            ret_rate = FF_Calc.getValue('return-rate') / 100,
            inflation = FF_Calc.getValue('inflation') / 100,
            growth_rate = (1 + ret_rate/12) / (1 + inflation/12) - 1,
        //growth_rate = ((1 + ret_rate) / (1 + inflation) - 1) / 12,

            tolast = Formula.PMT(growth_rate, years * 12, -balance, 0, 1),      // Reverse calculation
            result = '',
            result_value = 0,
            years_cutoff = 120,     // Years to cut off when never runs out of money
            el = $('#howlong');

        if (percentage <= growth_rate) {
            result_value = -1;
            result = 'Never run out of money!';
        } else {
            if (growth_rate == 0) {
                result_value = withdrawal == 0 ? 0 : balance / withdrawal / 12;
            } else {
                result_value = withdrawal == 0 ? 0 : Formula.NPER(growth_rate, -withdrawal, balance, 0, 1) / 12;
            }
            result_value = Formula.FLOOR(result_value);

            if (result_value < 1) {
                result = 'Run out of money <br/>in less than 1 year';
            } else if(result_value == 1) {
                result = 'Run out of money <br/>in 1 year';
            } else if (result_value >= years_cutoff) {
                result = 'Never run out of money!';
            } else {
                result = 'Run out of money <br/>in ' + result_value + ' years';
            }
        }

        FF_Calc.setValue('howlong', result);
        FF_Calc.setValue('howlong-value', result_value);
        FF_Calc.setValue('withdrawals', tolast);

        // Highlight result
        el.removeClass('ff-calc-highlight-success')
            .removeClass('ff-calc-highlight-warning')
            .removeClass('ff-calc-highlight-alarm');
        if (result_value == -1) {
            el.addClass('ff-calc-highlight-success');
        } else if (result_value <= 1) {
            el.addClass('ff-calc-highlight-alarm');
        } else if (result_value <= 10) {
            el.addClass('ff-calc-highlight-warning');
        }

        return this;
    },

    buildChart: function() {
        FF_Calc._dropTimer('run');

        var withdrawal = (FF_Calc.getValue('expenses') - FF_Calc.getValue('income')),
            ret_balance = FF_Calc.getValue('balance'),
            ret_rate = FF_Calc.getValue('return-rate') / 100 / 12,
            inflation = FF_Calc.getValue('inflation') / 100 / 12,
            cur_withdrawal = withdrawal,
            balance = ret_balance - cur_withdrawal,
            month = 0,
            series = [],
            i;

        if (balance < 0) {
            balance = 0;
        }
        series.push([month, balance]);

        while(balance > 0 && month < 12*60) {
            cur_withdrawal = cur_withdrawal * (1 + inflation);
            balance = balance * (1 + ret_rate) - cur_withdrawal;
            if (balance < 0) {
                balance = 0;
            }
            month++;
            series.push([month, balance]);
        }

        // pad series up to 5 in order to avoid highchart crashes...
        if (series.length < 5) {
            for (i = series.length; i <= 5; i++) {
                series.push([i, 0]);
            }
        }

        $('#ff-calc-graph-container').highcharts({
            credits: {
                enabled: false
            },
            chart: {
                type: 'spline'
            },
            title: {
                text: 'Retirement Plan Balance <br/>Over Time'
            },
            tooltip: {
                headerFormat: '<span style="font-size: 10px">Month: {point.key}</span><br/>',
                pointFormat: 'Balance: ${point.y:,.0f}'
            },
            legend: {
                enabled: false
            },
            yAxis: {
                title: {
                    text: null
                },
                min: 0,
                plotLines: [{
                    value: 0,
                    width: 1,
                    color: '#808080'
                }]
            },
            xAxis: {
                title: {
                    text: 'timeline'
                },
                tickPositioner: FF_Calc.helpers.monthTickPositioner,
                labels: {
                    formatter: FF_Calc.helpers.monthFormatter
                }
            },
            plotOptions: {
                series: {
                    animation: FF_Calc.chartAnimation
                },

                spline: {
                    lineWidth: 5,
                    states: {
                        hover: {
                            lineWidth: 6
                        }
                    },
                    marker: {
                        enabled: false
                    }
                }
            },
            series:[{
                name: "Balance",
                data: series
            }]
        });

        return this;
    },

    runDelayed: function() {
        FF_Calc.buildChart();
    },

    elements: {
        "income": {
            type: "text",
            cssclass: "input-2column",
            label: "Defined Income",
            value: '1500',
            filters: ['ge 0', 'le 100000000'],
            format: 'currency',
            autoformat: true
        },
        "expenses": {
            type: "text",
            cssclass: "input-2column",
            label: "Monthly Expenses",
            value: '3500',
            filters: ['ge 0', 'le 100000000'],
            format: 'currency',
            autoformat: true
        },
        "balance": {
            type: "text",
            label: 'Retirement Plan Balance',
            value: '350000',
            format: 'currency',
            filters: ['ge 0', 'le 1000000000']
        },

//            "surplus": {
//                type: "value",
//                label: "Surplus/Shortfall",
//                value: '0',
//                format: "currency",
//                update: function() {
//                    var surplus = FF_Calc.getValue('income') - FF_Calc.getValue('expenses');
//                    FF_Calc.setValue('surplus', surplus);
//                }
//            },
//            "withdrawal": {
//                type: "value",
//                cssclass: 'input-2column',
//                label: "Monthly Withdrawal",
//                value: '$2,000',
//                format: "currency",
//                update: function() {
//                    var withdrawal = FF_Calc.getValue('expenses') - FF_Calc.getValue('income');
//                    FF_Calc.setValue('withdrawal', withdrawal);
//                }
//            },
//            "percentage": {
//                type: "value",
//                cssclass: 'input-2column',
//                label: "Withdrawal Percentage",
//                value: '6%',
//                format: "percent",
//                update: function() {
//                    var withdrawal = (FF_Calc.getValue('expenses') - FF_Calc.getValue('income')) * 12;
//                    var percentage = withdrawal / FF_Calc.getValue('balance') * 100;
//                    FF_Calc.setValue('percentage', percentage);
//                }
//            },

        "inflation": {
            type: "slider",
            cssclass: 'input-2column',
            params: {
                min: 0,
                max: 10,
                step: 0.1,
                range: "min"
            },
            label: "Inflation / Cost of Living Adjustment",
            value: 3,
            format: "percent"
        },

        "return-rate": {
            type: "slider",
            cssclass: 'input-2column',
            params: {
                min: 0,
                max: 12,
                step: 0.1,
                range: "min"
            },
            label: "Annual Rate Of Return",
            value: 5,
            format: "percent"
        },
        "years": {
            type: "slider",
            params: {
                min: 1,
                max: 70,
                step: 1,
                range: "min"
            },
            label: "To last",
            value: 30,
            format: function(v) {
                if (v == 1) {
                    return v + ' year';
                }
                return v + ' years';
            }
        },
        "withdrawals": {
            type: "value",
            style: 'margin: 0 10px;',
            label: 'You can withdraw',
            append: ' a month',
            value: '$1,500',
            format: "currency"
        },
        "howlong": {
            type: "value",
            cssclass: 'big',
            value: ''
        },
        "howlong-value": {
            type: "value",
            cssclass: 'hidden',
            value: ''
        }
    },

    onStart: function() {
        FF_Calc.helpers.matchColumnHeight(
            '#ff-calc-left-column', '#ff-calc-right-column', '.ff-calc-adjustable'
        );
    }
};