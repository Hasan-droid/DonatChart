import { Component, createElement, useEffect, useState, useRef } from "react";
import * as echarts from "echarts";
import { HelloWorldSample } from "./components/HelloWorldSample";
import "./ui/ChartCRMI.css";

export default function ChartCRMI({ Value, ValueName, buttonAction, data, sort }) {
    const [DynamicWidth, setDynamicWidth] = useState(-1);
    const [DynamicHeight, setDynamicHeight] = useState(-1);
    const [ChartData, setChartData] = useState([]);
    const [readyToBuildChart, setReadyToBuildChart] = useState(false);
    const observerDiv = useRef(null);

    useEffect(() => {
        if (data.status === "available") {
            const ValuesName = data.items.map(item => {
                return ValueName.get(item);
            });

            const Values = data.items.map(item => {
                return Value.get(item);
            });

            setChartData(
                Values.map((item, index) => {
                    return {
                        value: item.displayValue,
                        name: ValuesName[index].value
                    };
                })
            );
        }
    }, [data.status]);

    const buildChart = () => {
        console.info("inside buildChart");
        var chartDom = document.getElementById("chart-container");
        console.info("chartDom", chartDom);
        console.info("chartData inside build chart", ChartData);
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
                    data: ChartData,
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

    useEffect(() => {
        if (!observerDiv.current || ChartData.length === 0) return;

        const numDataPoints = ChartData.length;
        const DynamicWidthValue = 300 + numDataPoints * 20;
        const DynamicHeightValue = 300 + numDataPoints * 20 + 100;
        const observer = new ResizeObserver(() => {
            setDynamicWidth(DynamicWidthValue);
            setDynamicHeight(DynamicHeightValue);
            setReadyToBuildChart(true);
        });

        observer.observe(observerDiv.current);

        return () => {
            observer.disconnect(observerDiv.current);
        };
    }, [ChartData]);

    useEffect(() => {
        if (readyToBuildChart) {
            if (sort.type === "Integer" || sort.type === "Decimal") {
                ChartData.sort((a, b) => {
                    return a.value - b.value;
                });
            }
            buildChart();
        }
    }, [readyToBuildChart]);

    return (
        <div>
            {/* <input type="number" value={DynamicWidth} onChange={e => setDynamicWidth(e.target.value)} /> */}
            {
                (console.info("dynamicWidth in return statement", DynamicWidth),
                console.info("dynamicHeight in return statement", DynamicHeight))
            }
            <div id="chart-container" style={{ height: DynamicHeight, width: DynamicWidth }} ref={observerDiv}></div>
            <p>{DynamicWidth}</p>
        </div>
    );
}
