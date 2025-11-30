declare module 'react-native-chart-kit' {
  import { ComponentType } from 'react';
  import { ViewStyle } from 'react-native';

  interface ChartConfig {
    backgroundColor?: string;
    backgroundGradientFrom?: string;
    backgroundGradientTo?: string;
    color?: (opacity?: number) => string;
    strokeWidth?: number;
    barPercentage?: number;
    decimalPlaces?: number;
    fillShadowGradient?: string;
    fillShadowGradientOpacity?: number;
    propsForLabels?: object;
    useShadowColorFromDataset?: boolean;
  }

  interface Dataset {
    data: number[];
    colors?: ((opacity?: number) => string)[];
    color?: (opacity?: number) => string;
  }

  interface ChartData {
    labels?: string[];
    datasets: Dataset[];
  }

  interface PieChartData {
    name: string;
    population: number;
    color: string;
    legendFontColor?: string;
    percentage?: number;
  }

  interface LineChartProps {
    data: ChartData;
    width: number;
    height: number;
    chartConfig: ChartConfig;
    bezier?: boolean;
    style?: ViewStyle;
    withDots?: boolean;
    withShadow?: boolean;
    withInnerLines?: boolean;
    withOuterLines?: boolean;
    withVerticalLines?: boolean;
    withHorizontalLines?: boolean;
    withVerticalLabels?: boolean;
    withHorizontalLabels?: boolean;
    fromZero?: boolean;
    yAxisLabel?: string;
    yAxisSuffix?: string;
    xAxisLabel?: string;
    segments?: number;
    transparent?: boolean;
    getDotColor?: (dataPoint: number, dataPointIndex: number) => string;
    renderDotContent?: (params: { x: number; y: number; index: number }) => React.ReactNode;
    decorator?: () => React.ReactNode;
    onDataPointClick?: (data: { index: number; value: number; dataset: Dataset; x: number; y: number; getColor: (opacity: number) => string }) => void;
  }

  interface BarChartProps {
    data: ChartData;
    width: number;
    height: number;
    chartConfig: ChartConfig;
    style?: ViewStyle;
    withInnerLines?: boolean;
    showValuesOnTopOfBars?: boolean;
    showBarTops?: boolean;
    withHorizontalLabels?: boolean;
    withVerticalLabels?: boolean;
    fromZero?: boolean;
    yAxisLabel?: string;
    yAxisSuffix?: string;
    verticalLabelRotation?: number;
    horizontalLabelRotation?: number;
    withCustomBarColorFromData?: boolean;
    flatColor?: boolean;
    segments?: number;
  }

  interface PieChartProps {
    data: PieChartData[];
    width: number;
    height: number;
    chartConfig: ChartConfig;
    accessor: string;
    backgroundColor?: string;
    paddingLeft?: string;
    absolute?: boolean;
    hasLegend?: boolean;
    center?: [number, number];
    avoidFalseZero?: boolean;
  }

  interface ProgressChartProps {
    data: { labels?: string[]; data: number[] } | number[];
    width: number;
    height: number;
    chartConfig: ChartConfig;
    style?: ViewStyle;
    strokeWidth?: number;
    radius?: number;
    hideLegend?: boolean;
  }

  interface ContributionGraphProps {
    values: { date: string; count: number }[];
    endDate: Date;
    numDays: number;
    width: number;
    height: number;
    chartConfig: ChartConfig;
    squareSize?: number;
    gutterSize?: number;
    horizontal?: boolean;
    showMonthLabels?: boolean;
    showOutOfRangeDays?: boolean;
    accessor?: string;
    tooltipDataAttrs?: (value: { date: string; count: number }) => object;
    onDayPress?: (value: { date: string; count: number }) => void;
  }

  export const LineChart: ComponentType<LineChartProps>;
  export const BarChart: ComponentType<BarChartProps>;
  export const PieChart: ComponentType<PieChartProps>;
  export const ProgressChart: ComponentType<ProgressChartProps>;
  export const ContributionGraph: ComponentType<ContributionGraphProps>;
}
