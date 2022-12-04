import type { ICoordinates, IDimension, IRgb } from "tsparticles-engine";
import {
    drawLine,
    drawTriangle,
    getDistance,
    getDistances,
    getStyleFromRgb,
    rangeColorToRgb,
} from "tsparticles-engine";
import type { ILinksShadow } from "./Options/Interfaces/ILinksShadow";

export const offsetsFactors = [
    { x: 1, y: 0 },
    { x: 0, y: 1 },
    { x: 1, y: 1 },
    { x: -1, y: 0 },
    { x: 0, y: -1 },
    { x: -1, y: -1 },
    { x: 1, y: -1 },
    { x: -1, y: 1 },
];

export function getLinkPoints(
    begin: ICoordinates,
    end: ICoordinates,
    maxDistance: number,
    warp: boolean,
    canvasSize: IDimension
): { begin: ICoordinates; end: ICoordinates }[] {
    const lines: { begin: ICoordinates; end: ICoordinates }[] = [];

    if (getDistance(begin, end) <= maxDistance) {
        lines.push({ begin, end });
    }

    if (warp) {
        for (const line of getIntermediatePoints(begin, end, canvasSize, maxDistance)) {
            lines.push(line);
        }
    }

    return lines;
}

export function getIntermediatePoints(
    begin: ICoordinates,
    end: ICoordinates,
    canvasSize: IDimension,
    maxDistance: number
): { begin: ICoordinates; end: ICoordinates }[] {
    let pi1: ICoordinates | undefined, pi2: ICoordinates | undefined;

    for (const offsetFactor of offsetsFactors) {
        const offset = { x: offsetFactor.x * canvasSize.width, y: offsetFactor.y * canvasSize.height },
            pos1 = {
                x: begin.x + offset.x,
                y: begin.y + offset.y,
            },
            d1 = getDistances(pos1, end),
            pos2 = {
                x: end.x + offset.x,
                y: end.y + offset.y,
            },
            d2 = getDistances(begin, pos2);

        if (d1.distance > maxDistance && d2.distance > maxDistance) {
            continue;
        }

        if (d1.dx === 0 || d2.dx === 0) {
            if (Math.abs(d1.dy) > maxDistance && Math.abs(d2.dy) > maxDistance) {
                continue;
            }

            if (begin.y >= end.y) {
                pi1 = { x: begin.x, y: canvasSize.height };
                pi2 = { x: end.x, y: 0 };
            } else {
                pi1 = { x: begin.x, y: 0 };
                pi2 = { x: end.x, y: canvasSize.height };
            }

            break;
        } else if (d1.dy === 0 || d2.dy === 0) {
            if (Math.abs(d1.dx) > maxDistance && Math.abs(d2.dx) > maxDistance) {
                continue;
            }

            if (begin.x >= end.x) {
                pi1 = { x: canvasSize.width, y: begin.y };
                pi2 = { x: 0, y: end.y };
            } else {
                pi1 = { x: 0, y: begin.y };
                pi2 = { x: canvasSize.width, y: end.y };
            }

            break;
        } else {
            let m: number, q: number, beginPos: ICoordinates, endPos: ICoordinates;

            if (d1.distance <= maxDistance) {
                m = d1.dy / d1.dx;
                q = Number.isFinite(m) ? end.y - m * end.x : begin.x;
                beginPos = pos1;
                endPos = end;
            } else if (d2.distance <= maxDistance) {
                m = d2.dy / d2.dx;
                q = Number.isFinite(m) ? begin.y - m * begin.x : begin.x;
                beginPos = begin;
                endPos = pos2;
            } else {
                return [];
            }

            if (beginPos.x > canvasSize.width) {
                pi1 = { x: canvasSize.width, y: m * canvasSize.width + q };
                pi2 = { x: 0, y: q };
            } else if (beginPos.x < 0) {
                pi1 = { x: 0, y: q };
                pi2 = { x: canvasSize.width, y: m * canvasSize.width + q };
            } else if (beginPos.y > canvasSize.height) {
                pi1 = { x: (canvasSize.height - q) / m, y: canvasSize.height };
                pi2 = { x: -q / m, y: 0 };
            } else if (beginPos.y < 0) {
                pi1 = { x: -q / m, y: 0 };
                pi2 = { x: (canvasSize.height - q) / m, y: canvasSize.height };
            }

            if (endPos.x > canvasSize.width) {
                pi1 = { x: canvasSize.width, y: m * canvasSize.width + q };
                pi2 = { x: 0, y: q };
            } else if (endPos.x < 0) {
                pi1 = { x: 0, y: q };
                pi2 = { x: canvasSize.width, y: m * canvasSize.width + q };
            } else if (endPos.y > canvasSize.height) {
                pi1 = { x: (canvasSize.height - q) / m, y: canvasSize.height };
                pi2 = { x: -q / m, y: 0 };
            } else if (endPos.y < 0) {
                pi1 = { x: -q / m, y: 0 };
                pi2 = { x: (canvasSize.height - q) / m, y: canvasSize.height };
            }

            if (pi1 && pi2) {
                break;
            }
        }
    }

    if (pi1 && pi2) {
        return [
            { begin, end: pi1 },
            { begin: end, end: pi2 },
        ];
    }

    return [];
}

export function isPointBetweenPoints(check: ICoordinates, begin: ICoordinates, end: ICoordinates): boolean {
    return (
        ((begin.x >= check.x && check.x >= end.x) || (begin.x <= check.x && check.x <= end.x)) &&
        ((begin.y >= check.y && check.y >= end.y) || (begin.y <= check.y && check.y <= end.y))
    );
}

export function drawLinkLine(
    context: CanvasRenderingContext2D,
    width: number,
    begin: ICoordinates,
    end: ICoordinates,
    maxDistance: number,
    canvasSize: IDimension,
    warp: boolean,
    backgroundMask: boolean,
    composite: GlobalCompositeOperation,
    colorLine: IRgb,
    opacity: number,
    shadow: ILinksShadow
): void {
    const lines = getLinkPoints(begin, end, maxDistance, warp, canvasSize);

    if (!lines.length) {
        return;
    }

    for (const line of lines) {
        drawLine(context, line.begin, line.end);

        context.lineWidth = width;

        if (backgroundMask) {
            context.globalCompositeOperation = composite;
        }

        context.strokeStyle = getStyleFromRgb(colorLine, opacity);

        if (shadow.enable) {
            const shadowColor = rangeColorToRgb(shadow.color);

            if (shadowColor) {
                context.shadowBlur = shadow.blur;
                context.shadowColor = getStyleFromRgb(shadowColor);
            }
        }

        context.stroke();
    }
}

export function drawLinkTriangle(
    context: CanvasRenderingContext2D,
    pos1: ICoordinates,
    pos2: ICoordinates,
    pos3: ICoordinates,
    backgroundMask: boolean,
    composite: GlobalCompositeOperation,
    colorTriangle: IRgb,
    opacityTriangle: number
): void {
    // this.ctx.lineCap = "round"; /* performance issue */
    /* path */

    drawTriangle(context, pos1, pos2, pos3);

    if (backgroundMask) {
        context.globalCompositeOperation = composite;
    }

    context.fillStyle = getStyleFromRgb(colorTriangle, opacityTriangle);

    context.fill();
}
