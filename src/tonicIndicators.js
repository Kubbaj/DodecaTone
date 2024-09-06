

export class TonicIndicators {
    constructor(wheelContainer, keyboardWindow) {
        this.wheelContainer = wheelContainer;
        this.keyboardWindow = keyboardWindow;
        this.indicatorColor = 'white';
        
        this.wheelIndicator = this.createWheelIndicator();
        this.keyboardIndicator = this.createKeyboardIndicator();

        this.wheelYOffset = 4.5;
        this.keyboardYOffset = 58;

        this.positionIndicators();
        this.visible = false;
    }

    createWheelIndicator() {
        const indicator = document.getElementById('wheel-tonic-indicator') || document.createElement('div');
        indicator.id = 'wheel-tonic-indicator';
        indicator.style.position = 'absolute';
        indicator.style.width = '46px';
        indicator.style.height = '46px';
        indicator.style.border = `8px solid ${this.indicatorColor}`;
        indicator.style.borderRadius = '50%';
        indicator.style.pointerEvents = 'none';
        this.wheelContainer.appendChild(indicator);
        return indicator;
    }

    createKeyboardIndicator() {
        const indicator = document.getElementById('keyboard-tonic-indicator') || document.createElement('div');
        indicator.id = 'keyboard-tonic-indicator';
        indicator.style.position = 'absolute';
        indicator.style.width = '33px';
        indicator.style.height = '57px'; // Adjust based on your key height
        indicator.style.borderTop = `8px solid ${this.indicatorColor}`;
        indicator.style.borderLeft = `8px solid ${this.indicatorColor}`;
        indicator.style.borderRight = `8px solid ${this.indicatorColor}`;
        indicator.style.borderBottom = '1px solid transparent';
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
        this.keyboardIndicator.style.left = 'calc(50% - 5px)';
        this.keyboardIndicator.style.transform = 'translateX(-50%)';
        this.keyboardIndicator.style.top = `${this.keyboardYOffset}px`;
    }

    toggleVisibility() {
        this.visible = !this.visible;
        const display = this.visible ? 'none' : 'block';
        this.wheelIndicator.style.display = display;
        this.keyboardIndicator.style.display = display;
    }
}