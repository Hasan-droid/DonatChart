import { Component, createElement, useEffect, useState, useRef } from "react";
import * as echarts from "echarts";
import { HelloWorldSample } from "./components/HelloWorldSample";
import "./ui/ChartCRMI.css";
import { get } from "http";
import { set } from "bro-fs";

export default function ChartCRMI({ Value, ValueName, buttonAction, data, sort, delay, refreshAction, booleanAttr }) {
    const [DynamicWidth, setDynamicWidth] = useState(-1);
    const [DynamicHeight, setDynamicHeight] = useState(-1);
    // const [ChartData, setChartData] = useState([]);
    const [allowBuild, setAllowBuild] = useState(false);
    const [refresh, setRefresh] = useState(false);
    const observerDiv = useRef(null);
    let chartData = [];

    useEffect(() => {
        console.info("it's withing the use effect of allow build");
        if (booleanAttr.status === "available") {
            console.info("it's not allowed to build");
            if (booleanAttr.value === true) {
                console.info("it's allowed to build");
                fillInData();
                initateDimensions();

                setTimeout(() => {
                    buildChart();
                }, delay);
                setAllowBuild(true);
            }
        }
    }, [booleanAttr, data]);

    const getSymbol = item => {
        const symbols = Object.getOwnPropertySymbols(item);
        const mxSymbol = symbols.find(symbol => symbol.toString() === "Symbol(mxObject)");
        return mxSymbol;
    };
    const getMXValues = attr => {
        console.info("getMXValues", data);
        const x = data.items.map(item => {
            const mySymbol = getSymbol(item);
            return item[mySymbol].jsonData.attributes[attr].value;
        });
        return x;
    };
    const fillInData = () => {
        if (data.status === "available") {
            const ValuesName = getMXValues("LATETYPE");
            const Values = getMXValues("NOT_LATE");
            chartData = Values.map((item, index) => {
                return {
                    value: item,
                    name: ValuesName[index]
                };
            });
            console.info("this is the chart data", data);
        }
    };

    const buildChart = () => {
        // console.info("it's building the chart", ChartData);
        var chartDom = document.getElementById("chart-container");
        var myChart = echarts.init(chartDom);
        var option;
        option = {
            tooltip: {
                trigger: "item"
            },
            cursor: "pointer",
            legend: {
                // top: "-2%",
                left: "center",
                width: "100%",
                itemGap: 30
            },
            series: [
                {
                    type: "pie",
                    radius: ["50%", "70%"],
                    avoidLabelOverlap: false,
                    itemStyle: {
                        borderRadius: 10,
                        borderColor: "#fff",
                        borderWidth: 2
                    },
                    label: {
                        show: false,
                        position: "center"
                    },
                    emphasis: {
                        label: {
                            show: true,
                            fontSize: 40,
                            fontWeight: "bold"
                        }
                    },
                    labelLine: {
                        show: false
                    },
                    data: chartData,
                    animationType: "transition",
                    animationTypeUpdate: "expansion",
                    animation: true,
                    animationDuration: 1000
                }
            ]
        };
        myChart.on("click", function(params) {
            if (buttonAction) buttonAction.execute();
        });

        option && myChart.setOption(option);
    };

    const initateDimensions = () => {
        // console.info("it's initiating the dimensions and this is the chart data", observerDiv.current);
        console.info("it's initiating the dimensions and this is the chart data", chartData);
        if (chartData.length === 0) return;
        const numDataPoints = chartData.length;
        const DynamicWidthValue = 300 + numDataPoints * 20;
        const DynamicHeightValue = 300 + numDataPoints * 20 + 100;
        setDynamicWidth(DynamicWidthValue);
        setDynamicHeight(DynamicHeightValue);
        console.info("it's initiating the dimensions");
        // if (sort.type === "Integer" || sort.type === "Decimal") {
        //     ChartData.sort((a, b) => {
        //         return a.value - b.value;
        //     });
        // }
        // setTimeout(() => {
        //     buildChart();
        // }, delay);
        if (refreshAction) {
            // setInterval(() => {
            //     refreshAction.execute();
            // }, 30000);
        }
    };

    return (
        <div>
            {allowBuild && (
                <div
                    id="chart-container"
                    style={{ height: DynamicHeight, width: DynamicWidth }}
                    ref={observerDiv}
                ></div>
            )}
        </div>
    );
}
