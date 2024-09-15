export function getRotationAngleForLayout(wheelCurrentLayout) {
    switch (wheelCurrentLayout) {
        case 'fifths':
            return 210;
        case 'fourths':
            return -210; // 360-210
        default: // chromatic
            return 30;
    }
}
