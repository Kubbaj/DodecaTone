// arrowGenerator.js

function calculatePoint(centerX, centerY, radius, angle) {
    const angleRad = (angle - 90) * Math.PI / 180;
    return [
        centerX + radius * Math.cos(angleRad),
        centerY + radius * Math.sin(angleRad)
    ];
}

function calculateThirdPoint(x1, y1, x2, y2, clockwise, lengthFactor) {
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    const dx = x2 - x1;
    const dy = y2 - y1;
    const factor = clockwise ? -1 : 1;
    
    const defaultLength = Math.sqrt(dx*dx + dy*dy) * Math.sqrt(2) / 2;
    const adjustedLength = defaultLength * lengthFactor;
    
    return [
        midX + factor * dy * adjustedLength / defaultLength / 2,
        midY - factor * dx * adjustedLength / defaultLength / 2
    ];
}

function generateCurvedArrow({
    canvasSize = 400,
    arcRadius = 100,
    arrowWidth = 20,
    startAngle = 30,
    endAngle = 60,
    arrowheadWidthFactor = 0.4,
    arrowheadLengthFactor = 1,
    direction = 'right'
}) {
    const centerX = canvasSize / 2;
    const centerY = canvasSize / 2;
    
    const innerRadius = arcRadius - arrowWidth / 2;
    const outerRadius = arcRadius + arrowWidth / 2;
    const extensionLength = arrowheadWidthFactor * arrowWidth;
    const innerExtendedRadius = innerRadius - extensionLength;
    const outerExtendedRadius = outerRadius + extensionLength;

    const isLeft = direction === 'left';
    const angleMultiplier = isLeft ? 1 : -1;

    function calculatePoint(angle, radius) {
        const angleRad = (90 + angleMultiplier * angle) * Math.PI / 180;
        return [
            centerX + radius * Math.cos(angleRad),
            centerY - radius * Math.sin(angleRad)
        ];
    }

    const [startOuterX, startOuterY] = calculatePoint(startAngle, outerRadius);
    const [startInnerX, startInnerY] = calculatePoint(startAngle, innerRadius);
    const [endInnerX, endInnerY] = calculatePoint(endAngle, innerRadius);
    const [endOuterX, endOuterY] = calculatePoint(endAngle, outerRadius);
    const [endInnerExtendedX, endInnerExtendedY] = calculatePoint(endAngle, innerExtendedRadius);
    const [endOuterExtendedX, endOuterExtendedY] = calculatePoint(endAngle, outerExtendedRadius);

    const [thirdX, thirdY] = calculateThirdPoint(
        endInnerExtendedX, endInnerExtendedY,
        endOuterExtendedX, endOuterExtendedY,
        !isLeft, arrowheadLengthFactor
    );

    const largeArcFlag = Math.abs(endAngle - startAngle) > 180 ? 1 : 0;
    const sweepFlag = isLeft ? 0 : 1;

    return `M ${startOuterX} ${startOuterY}
            A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} ${sweepFlag} ${endOuterX} ${endOuterY}
            L ${endOuterExtendedX} ${endOuterExtendedY}
            L ${thirdX} ${thirdY}
            L ${endInnerExtendedX} ${endInnerExtendedY}
            L ${endInnerX} ${endInnerY}
            A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} ${1-sweepFlag} ${startInnerX} ${startInnerY}
            Z`;
}

function generateLinearArrow({
    arrowWidth = 20,
    arrowLength = 50,
    arrowheadWidthFactor = 0.4,
    arrowheadLengthFactor = 5,
    direction = 'right'
}) {
    const isLeft = direction === 'left';
    
    const extensionLength = arrowheadWidthFactor * arrowWidth;
    const arrowheadWidth = arrowWidth + 2 * extensionLength;
    const arrowheadLength = arrowheadWidth * arrowheadLengthFactor;

    const totalLength = arrowLength + arrowheadLength;
    const totalHeight = arrowWidth + 2 * extensionLength;

    const startX = 0;
    const endX = arrowLength;
    const centerY = totalHeight / 2;

    const outerY = centerY - arrowWidth / 2;
    const innerY = centerY + arrowWidth / 2;
    const innerExtendedY = centerY + arrowWidth / 2 + extensionLength;
    const outerExtendedY = centerY - arrowWidth / 2 - extensionLength;

    const thirdX = endX + arrowheadLength;
    const thirdY = centerY;

    const path = `M ${startX} ${outerY}
            L ${endX} ${outerY}
            L ${endX} ${outerExtendedY}
            L ${thirdX} ${thirdY}
            L ${endX} ${innerExtendedY}
            L ${endX} ${innerY}
            L ${startX} ${innerY}
            Z`;

    return { path, width: totalLength, height: totalHeight };
}

export { generateCurvedArrow, generateLinearArrow };