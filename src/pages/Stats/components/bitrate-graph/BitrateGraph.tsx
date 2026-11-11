import {LineChartOutlined} from '@ant-design/icons';
import {
    Flex,
    theme,
    Tooltip,
    Typography,
} from 'antd';
import {
    useEffect,
    useRef,
    useState,
} from 'react';
import {useTranslation} from 'react-i18next';

import EnhancedText from '__components/EnhancedText';
import {GRAPH_SPAN_SEC} from '__utils/consts';

import {Props} from './types';
import {drawGraph} from './utils/drawGraph';

import style from './style.module.scss';

const BitrateGraph = ({points, now, color, isActive}: Props) => {
    const [size, setSize] = useState({width: 0, height: 0});

    const {t} = useTranslation();

    const {token} = theme.useToken();

    const containerRef = useRef<HTMLDivElement>(null);

    const canvasRef = useRef<HTMLCanvasElement>(null);

    const hasLine = points.length >= 2;

    useEffect(() => {
        const container = containerRef.current;

        if (!container) {
            return undefined;
        }

        const resizeObserver = new ResizeObserver(([{contentRect: {width, height}}]) => {
            setSize({width, height});
        });

        resizeObserver.observe(container);

        return () => resizeObserver.disconnect();
    }, []);

    useEffect(() => {
        if (canvasRef.current && size.width > 0 && size.height > 0) {
            const graph = {
                canvas: canvasRef.current,
                ...size,
                points,
                now,
                color,
                baselineColor: token.colorBorder,
            };

            drawGraph(graph);
        }
    }, [color, now, points, size, token.colorBorder]);

    return (
        <div
            ref={containerRef}
            className={style.graph}
        >
            <Tooltip title={hasLine ? t('stats.graphTooltip', {minutes: GRAPH_SPAN_SEC / 60}) : null}>
                <canvas
                    ref={canvasRef}
                    className={style.canvas}
                />
            </Tooltip>

            {!hasLine && (
                <Flex
                    className={style.placeholder}
                    align="center"
                    justify="center"
                    gap="small"
                >
                    <Typography.Text type="secondary">
                        <LineChartOutlined/>
                    </Typography.Text>

                    <EnhancedText type="secondary">
                        {isActive ? t('stats.graphCollecting') : t('stats.graphWaiting')}
                    </EnhancedText>
                </Flex>
            )}
        </div>
    );
};

export default BitrateGraph;
