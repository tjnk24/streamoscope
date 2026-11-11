import {GraphPointDto} from '__types/stats/views';

interface OwnProps {
    points: GraphPointDto[];
    now: number;
    color: string;
    isActive: boolean;
}

export type Props = OwnProps;

interface GraphCanvasProps {
    canvas: HTMLCanvasElement;
    baselineColor: string;
    width: number;
    height: number;
}

export type DrawGraphParams = Omit<OwnProps, 'isActive'> & GraphCanvasProps;
