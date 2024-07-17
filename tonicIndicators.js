import { useColors } from './app.js';

export class TonicIndicators {
    constructor(wheelContainer, keyboardWindow) {
        this.wheelContainer = wheelContainer;
        this.keyboardWindow = keyboardWindow;
        this.indicatorColor = useColors ? 'white' : '#E25A5A';
        
        this.wheelIndicator = this.createWheelIndicator();
        this.keyboardIndicator = this.createKeyboardIndicator();

        this.wheelYOffset = 311;
        this.keyboardYOffset = 0;

        this.positionIndicators();
        this.visible = false;
    }

    createWheelIndicator() {
        const indicator = document.getElementById('wheel-tonic-indicator') || document.createElement('div');
        indicator.id = 'wheel-tonic-indicator';
        indicator.style.position = 'absolute';
        indicator.style.width = '44px';
        indicator.style.height = '44px';
        indicator.style.border = `6px solid ${this.indicatorColor}`;
        indicator.style.borderRadius = '50%';
        indicator.style.pointerEvents = 'none';
        this.wheelContainer.appendChild(indicator);
        return indicator;
    }

    createKeyboardIndicator() {
        const indicator = document.getElementById('keyboard-tonic-indicator') || document.createElement('div');
        indicator.id = 'keyboard-tonic-indicator';
        indicator.style.position = 'absolute';
        indicator.style.width = '30px';
        indicator.style.height = '30px'; // Adjust based on your key height
        indicator.style.borderTop = `7px solid ${this.indicatorColor}`;
        indicator.style.borderLeft = `7px solid ${this.indicatorColor}`;
        indicator.style.borderRight = `7px solid ${this.indicatorColor}`;
        indicator.style.borderBottom = '7px solid transparent';
        indicator.style.borderRadius = '5px'
        indicator.style.backgroundColor = 'transparent';
        indicator.style.pointerEvents = 'none';
        indicator.style.boxSizing = 'border-box';
        this.keyboardWindow.appendChild(indicator);
        return indicator;
    }

    positionIndicators() {
        this.positionWheelIndicator();
        this.positionKeyboardIndicator();
    }

    positionWheelIndicator() {
        this.wheelIndicator.style.left = '50%';
        this.wheelIndicator.style.transform = 'translateX(-50%)';
        this.wheelIndicator.style.top = `${this.wheelYOffset}px`;
    }
    
    positionKeyboardIndicator() {
        this.keyboardIndicator.style.left = 'calc(50% - 0.5px)';
        this.keyboardIndicator.style.transform = 'translateX(-50%)';
        this.keyboardIndicator.style.top = `${this.keyboardYOffset}px`;
    }

    updateIndicatorColor() {
        this.indicatorColor = useColors ? 'white' : '#E54444';
        this.wheelIndicator.style.borderColor = this.indicatorColor;
        this.keyboardIndicator.style.borderTopColor = this.indicatorColor;
        this.keyboardIndicator.style.borderLeftColor = this.indicatorColor;
        this.keyboardIndicator.style.borderRightColor = this.indicatorColor;
    }

    toggleVisibility() {
        this.visible = !this.visible;
        const display = this.visible ? 'none' : 'block';
        this.wheelIndicator.style.display = display;
        this.keyboardIndicator.style.display = display;
        if (this.visible) {
            this.updateIndicatorColor();
        }
    }
}