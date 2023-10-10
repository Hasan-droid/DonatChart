import { Component, createElement, useEffect, useState, useRef } from "react";
import * as echarts from "echarts";
import { HelloWorldSample } from "./components/HelloWorldSample";
import "./ui/ChartCRMI.css";
import { get } from "http";

export default function ChartCRMI({ Value, ValueName, buttonAction, data, sort, delay, refreshAction }) {
    const [DynamicWidth, setDynamicWidth] = useState(-1);
    const [DynamicHeight, setDynamicHeight] = useState(-1);
    const [ChartData, setChartData] = useState([]);
    const observerDiv = useRef(null);

    const getSymbol = item => {
        const symbols = Object.getOwnPropertySymbols(item);
        const mxSymbol = symbols.find(symbol => symbol.toString() === "Symbol(mxObject)");
        return mxSymbol;
    };
    const getMXValues = attr => {
        const x = data.items.map(item => {
            const mySymbol = getSymbol(item);
            return item[mySymbol].jsonData.attributes[attr].value;
        });
        return x;
    };
    useEffect(() => {
        if (data.status === "available") {
            const ValuesName = getMXValues("LATETYPE");
            const Values = getMXValues("NOT_LATE");

            setChartData(
                Values.map((item, index) => {
                    return {
                        value: item,
                        name: ValuesName[index]
                    };
                })
            );
        }
    }, [data?.status]);

    const buildChart = () => {
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

        setDynamicWidth(DynamicWidthValue);
        setDynamicHeight(DynamicHeightValue);
        // if (sort.type === "Integer" || sort.type === "Decimal") {
        //     ChartData.sort((a, b) => {
        //         return a.value - b.value;
        //     });
        // }
        setTimeout(() => {
            buildChart();
        }, delay);
        if (refreshAction) {
            setInterval(() => {
                refreshAction.execute();
            }, 30000);
        }
    }, [ChartData]);

    return (
        <div>
            {/* <input type="number" value={DynamicWidth} onChange={e => setDynamicWidth(e.target.value)} /> */}
            <div id="chart-container" style={{ height: DynamicHeight, width: DynamicWidth }} ref={observerDiv}></div>
        </div>
    );
}
